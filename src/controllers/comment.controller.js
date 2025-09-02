const { Repository, Issue, Comment, User } = require('../models');
const ApiError = require('../utils/apiError');

async function findRepoAndIssue(username, repoName, issueNumber) {
    const user = await User.findOne({ where: { username } });
    if (!user) throw new ApiError(404, 'User not found');
    
    const repo = await Repository.findOne({ where: { name: repoName, ownerId: user.id } });
    if (!repo) throw new ApiError(404, 'Repository not found');

    const issue = await Issue.findOne({ where: { repositoryId: repo.id, number: issueNumber } });
    if (!issue) throw new ApiError(404, 'Issue not found');

    return { repo, issue };
}

exports.createCommentOnIssue = async (req, res, next) => {
    try {
        const { username, repoName, issueNumber } = req.params;
        const { body } = req.body;

        const { issue } = await findRepoAndIssue(username, repoName, issueNumber);

        const comment = await Comment.create({
            body,
            authorId: req.user.id,
            issueId: issue.id,
        });

        const commentWithAuthor = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'author', attributes: ['id', 'username'] }]
        });

        res.status(201).json({ status: 'success', data: { comment: commentWithAuthor } });
    } catch (error) {
        next(error);
    }
};

// You would create a similar function for creating comments on Pull Requests
// exports.createCommentOnPullRequest = async (req, res, next) => { ... }
