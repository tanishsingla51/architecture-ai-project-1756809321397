const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Repository extends Model {
    static associate(models) {
      // associations defined in models/index.js
    }
  }

  Repository.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Repository',
    indexes: [
      { unique: true, fields: ['ownerId', 'name'] } // A user cannot have two repos with the same name
    ]
  });

  return Repository;
};
