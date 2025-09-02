const { Repository, PullRequest, User } = require('../models');
const ApiError = require('../utils/apiError');

// Helper to find a repository by URL params
async function findRepo(username, repoName) {
    const user = await User.findOne({ where: { username } });
    if (!user) throw new ApiError(404, 'User not found');
    const repo = await Repository.findOne({ where: { name: repoName, ownerId: user.id } });
    if (!repo) throw new ApiError(404, 'Repository not found');
    return repo;
}

exports.createPullRequest = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const { title, body, baseBranch, compareBranch } = req.body;

        const repo = await findRepo(username, repoName);

        // In a real application, you would check if the branches exist and have diffs.

        const pullRequest = await PullRequest.create({
            title,
            body,
            baseBranch,
            compareBranch,
            repositoryId: repo.id,
            authorId: req.user.id,
        });

        res.status(201).json({ status: 'success', data: { pullRequest } });
    } catch (error) {
        next(error);
    }
};

exports.getPullRequests = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const repo = await findRepo(username, repoName);

        const pullRequests = await PullRequest.findAll({
            where: { repositoryId: repo.id },
            include: [{ model: User, as: 'author', attributes: ['id', 'username'] }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ status: 'success', data: { pullRequests } });
    } catch (error) {
        next(error);
    }
};
