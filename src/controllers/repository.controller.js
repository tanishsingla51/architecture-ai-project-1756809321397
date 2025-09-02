const { Repository, User, Issue } = require('../models');
const ApiError = require('../utils/apiError');
const GitService = require('../services/git.service');

// Middleware to find repo and check permissions (can be refactored)
async function findRepoAndCheckAccess(username, repoName, requestingUser, requiredAccess = 'read') {
    const owner = await User.findOne({ where: { username } });
    if (!owner) throw new ApiError(404, 'Owner not found');

    const repository = await Repository.findOne({ where: { name: repoName, ownerId: owner.id } });
    if (!repository) throw new ApiError(404, 'Repository not found');

    if (!repository.isPublic) {
        if (!requestingUser) throw new ApiError(401, 'Authentication required for private repository');
        if (repository.ownerId !== requestingUser.id) {
            // TODO: Check for collaborator access
            throw new ApiError(403, 'You do not have permission to access this repository');
        }
    }
    return repository;
}

exports.createRepository = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    const ownerId = req.user.id;

    const repository = await Repository.create({
      name,
      description,
      isPublic,
      ownerId,
    });

    // In a real app, you would initialize a bare git repository on the file system
    await GitService.initializeRepo(req.user.username, name);

    res.status(201).json({
      status: 'success',
      data: { repository },
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        return next(new ApiError(409, 'Repository with this name already exists for your account.'));
    }
    next(error);
  }
};

exports.getRepository = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const repository = await findRepoAndCheckAccess(username, repoName, req.user);

        // You might want to include more details like issues, pull requests count etc.
        const repoData = await Repository.findByPk(repository.id, {
            include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }]
        });

        res.status(200).json({ status: 'success', data: { repository: repoData } });
    } catch (error) {
        next(error);
    }
};

exports.updateRepository = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const { description, isPublic } = req.body;

        const repository = await findRepoAndCheckAccess(username, repoName, req.user);

        // Authorization: Only owner can update
        if (repository.ownerId !== req.user.id) {
            return next(new ApiError(403, 'Only the repository owner can update its settings.'));
        }

        repository.description = description ?? repository.description;
        repository.isPublic = isPublic ?? repository.isPublic;
        await repository.save();

        res.status(200).json({ status: 'success', data: { repository } });
    } catch (error) {
        next(error);
    }
};

exports.deleteRepository = async (req, res, next) => {
    try {
        const { username, repoName } = req.params;
        const repository = await findRepoAndCheckAccess(username, repoName, req.user);

        if (repository.ownerId !== req.user.id) {
            return next(new ApiError(403, 'Only the repository owner can delete it.'));
        }

        await repository.destroy();

        // In a real app, you would also delete the git repository from the file system
        await GitService.deleteRepo(username, repoName);

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        next(error);
    }
};
