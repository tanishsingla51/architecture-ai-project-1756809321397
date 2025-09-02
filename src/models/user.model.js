const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // associations defined in models/index.js
    }

    async isPasswordMatch(password) {
        return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, // GitHub username regex
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeSave: async (user, options) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
  });

  // Method to remove password from returned user objects
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  return User;
};
