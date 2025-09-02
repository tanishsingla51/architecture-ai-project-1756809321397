const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { User } = require('../models');
const ApiError = require('../utils/apiError');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token does no longer exist.'));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
        return next(new ApiError(401, 'Invalid token. Please log in again.'));
    } 
    if (error.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Your token has expired. Please log in again.'));
    }
    next(error);
  }
};

module.exports = authMiddleware;
