'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// --- Associations ---

// User and Repository (Owner)

db.User.hasMany(db.Repository, { foreignKey: 'ownerId', as: 'ownedRepositories' });
db.Repository.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

// User and Repository (Collaborators - Many-to-Many)
db.User.belongsToMany(db.Repository, { through: db.Collaborator, as: 'collaborations', foreignKey: 'userId' });
db.Repository.belongsToMany(db.User, { through: db.Collaborator, as: 'collaborators', foreignKey: 'repositoryId' });

// Repository and Issue
db.Repository.hasMany(db.Issue, { foreignKey: 'repositoryId' });
db.Issue.belongsTo(db.Repository, { foreignKey: 'repositoryId' });

// User and Issue (Author)
db.User.hasMany(db.Issue, { foreignKey: 'authorId', as: 'authoredIssues' });
db.Issue.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

// Repository and PullRequest
db.Repository.hasMany(db.PullRequest, { foreignKey: 'repositoryId' });
db.PullRequest.belongsTo(db.Repository, { foreignKey: 'repositoryId' });

// User and PullRequest (Author)
db.User.hasMany(db.PullRequest, { foreignKey: 'authorId', as: 'authoredPullRequests' });
db.PullRequest.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

// User and Comment (Author)
db.User.hasMany(db.Comment, { foreignKey: 'authorId' });
db.Comment.belongsTo(db.User, { as: 'author', foreignKey: 'authorId' });

// Comment and Issue
db.Issue.hasMany(db.Comment, { foreignKey: 'issueId' });
db.Comment.belongsTo(db.Issue, { foreignKey: 'issueId' });

// Comment and PullRequest
db.PullRequest.hasMany(db.Comment, { foreignKey: 'pullRequestId' });
db.Comment.belongsTo(db.PullRequest, { foreignKey: 'pullRequestId' });


module.exports = db;
