const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Collaborator extends Model {}

  Collaborator.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    repositoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Repositories', key: 'id' },
    },
    role: {
        type: DataTypes.ENUM('admin', 'write', 'read'),
        defaultValue: 'write'
    }
  }, {
    sequelize,
    modelName: 'Collaborator',
    indexes: [
        { unique: true, fields: ['userId', 'repositoryId'] } 
    ]
  });

  return Collaborator;
};
