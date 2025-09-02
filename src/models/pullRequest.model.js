const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PullRequest extends Model {
    static associate(models) {
      // associations defined in models/index.js
    }
  }

  PullRequest.init({
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
      type: DataTypes.ENUM('open', 'closed', 'merged'),
      defaultValue: 'open',
    },
    baseBranch: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    compareBranch: {
        type: DataTypes.STRING,
        allowNull: false,
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
    modelName: 'PullRequest',
    indexes: [
      { unique: true, fields: ['repositoryId', 'number'] } 
    ],
    hooks: {
        beforeValidate: async (pr, options) => {
            if (pr.isNewRecord) {
                const lastPr = await PullRequest.findOne({
                    where: { repositoryId: pr.repositoryId },
                    order: [['number', 'DESC']],
                    paranoid: false
                });
                pr.number = (lastPr ? lastPr.number : 0) + 1;
            }
        }
    }
  });

  return PullRequest;
};
