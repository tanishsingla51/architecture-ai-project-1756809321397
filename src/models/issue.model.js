const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Issue extends Model {
    static associate(models) {
      // associations defined in models/index.js
    }
  }

  Issue.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('open', 'closed'),
      defaultValue: 'open',
    },
    repositoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Repositories',
        key: 'id',
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Issue',
    indexes: [
      { unique: true, fields: ['repositoryId', 'number'] } 
    ],
    hooks: {
        beforeValidate: async (issue, options) => {
            if (issue.isNewRecord) {
                const lastIssue = await Issue.findOne({
                    where: { repositoryId: issue.repositoryId },
                    order: [['number', 'DESC']],
                    paranoid: false
                });
                issue.number = (lastIssue ? lastIssue.number : 0) + 1;
            }
        }
    }
  });

  return Issue;
};
