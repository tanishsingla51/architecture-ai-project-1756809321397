const express = require('express');
const { body, param } = require('express-validator');
const repositoryController = require('../controllers/repository.controller');
const issueController = require('../controllers/issue.controller');
const prController = require('../controllers/pullRequest.controller');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

const router = express.Router();

// --- Repository Routes ---
router.post(
    '/repositories',
    authMiddleware,
    validate([body('name').isString().notEmpty(), body('description').optional().isString()]),
    repositoryController.createRepository
);

const repoParamsValidator = validate([
    param('username').isString().notEmpty(),
    param('repoName').isString().notEmpty(),
]);

router.get('/:username/:repoName', repoParamsValidator, repositoryController.getRepository);
router.patch('/:username/:repoName', authMiddleware, repoParamsValidator, repositoryController.updateRepository);
router.delete('/:username/:repoName', authMiddleware, repoParamsValidator, repositoryController.deleteRepository);

// --- Nested Issue Routes ---
const issueNumberValidator = validate([param('issueNumber').isInt({ min: 1 })]);

router.get('/:username/:repoName/issues', repoParamsValidator, issueController.getIssues);
router.post(
    '/:username/:repoName/issues',
    authMiddleware, 
    repoParamsValidator,
    validate([body('title').isString().notEmpty()]),
    issueController.createIssue
);
router.get('/:username/:repoName/issues/:issueNumber', repoParamsValidator, issueNumberValidator, issueController.getIssueByNumber);
router.patch(
    '/:username/:repoName/issues/:issueNumber',
    authMiddleware,
    repoParamsValidator,
    issueNumberValidator,
    issueController.updateIssue
);

// --- Nested Pull Request Routes ---
const prNumberValidator = validate([param('prNumber').isInt({ min: 1 })]);

router.get('/:username/:repoName/pulls', repoParamsValidator, prController.getPullRequests);
router.post(
    '/:username/:repoName/pulls',
    authMiddleware, 
    repoParamsValidator,
    validate([
        body('title').isString().notEmpty(),
        body('baseBranch').isString().notEmpty(),
        body('compareBranch').isString().notEmpty(),
    ]),
    prController.createPullRequest
);

// --- Nested Comment Routes ---
router.post(
    '/:username/:repoName/issues/:issueNumber/comments',
    authMiddleware,
    repoParamsValidator,
    issueNumberValidator,
    validate([body('body').isString().notEmpty()]),
    commentController.createCommentOnIssue
);

// You would add a similar route for pull request comments
// router.post('/:username/:repoName/pulls/:prNumber/comments', ...);

module.exports = router;
