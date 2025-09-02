const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // associations defined in models/index.js
    }
  }

  Comment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Issues', key: 'id' },
    },
    pullRequestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'PullRequests', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'Comment',
    validate: {
        eitherIssueOrPullRequest() {
            if (this.issueId && this.pullRequestId) {
                throw new Error('Comment cannot belong to both an Issue and a Pull Request.');
            }
            if (!this.issueId && !this.pullRequestId) {
                throw new Error('Comment must belong to either an Issue or a Pull Request.');
            }
        }
    }
  });

  return Comment;
};
