const express = require('express');
const authRoutes = require('./auth.routes');
const repositoryRoutes = require('./repository.routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/',
    route: repositoryRoutes, // Handles /:username/:repoName routes
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
