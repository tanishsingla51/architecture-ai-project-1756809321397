const { Repository, Issue, User } = require('../models');
const ApiError = require('../utils/apiError');

// Helper to find a repository by URL params
async function findRepo(username, repoName) {
    const user = await User.findOne({ where: { username } });
    if (!user) throw new ApiError(404, 'User not found');
    const repo = await Repository.findOne({ where: { name: repoName, ownerId: user.id } });
    if (!repo) throw new ApiError(404, 'Repository not found');
    return repo;
}

exports.createIssue = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const { title, body } = req.body;

        const repo = await findRepo(username, repoName);
        // TODO: Check if user has write access to the repo

        const issue = await Issue.create({
            title,
            body,
            repositoryId: repo.id,
            authorId: req.user.id,
        });

        res.status(201).json({ status: 'success', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.getIssues = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const repo = await findRepo(username, repoName);

        const issues = await Issue.findAll({
            where: { repositoryId: repo.id },
            include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ status: 'success', data: { issues } });
    } catch (error) {
        next(error);
    }
};

exports.getIssueByNumber = async (req, res, next) => {
    try {
        const { username, repoName, issueNumber } = req.params;
        const repo = await findRepo(username, repoName);

        const issue = await Issue.findOne({
            where: { repositoryId: repo.id, number: issueNumber },
            include: [{ model: User, as: 'author', attributes: ['id', 'username'] }]
            // TODO: Include comments
        });

        if (!issue) {
            return next(new ApiError(404, 'Issue not found'));
        }

        res.status(200).json({ status: 'success', data: { issue } });
    } catch (error) {
        next(error);
    }
};

exports.updateIssue = async (req, res, next) => {
    try {
        const { username, repoName, issueNumber } = req.params;
        const { title, body, status } = req.body;
        const repo = await findRepo(username, repoName);

        const issue = await Issue.findOne({ where: { repositoryId: repo.id, number: issueNumber } });
        if (!issue) {
            return next(new ApiError(404, 'Issue not found'));
        }

        // Authorization: only author or collaborator can update
        if (issue.authorId !== req.user.id) {
             // TODO: Add collaborator check
            return next(new ApiError(403, 'You do not have permission to update this issue.'));
        }

        issue.title = title ?? issue.title;
        issue.body = body ?? issue.body;
        if (status && ['open', 'closed'].includes(status)) {
            issue.status = status;
        }

        await issue.save();

        res.status(200).json({ status: 'success', data: { issue } });
    } catch (error) {
        next(error);
    }
};
