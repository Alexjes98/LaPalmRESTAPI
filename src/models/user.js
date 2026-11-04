"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      if (models.Organization) {
        User.hasMany(models.Organization, {
          foreignKey: "ownerId",
          as: "ownedOrganizations",
        });
      }
      if (models.OrganizationMember) {
        User.hasMany(models.OrganizationMember, {
          foreignKey: "userId",
          as: "organizationMemberships",
        });
      }
      // define association here
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      companyId: { type: DataTypes.INTEGER },
      termsObject: { type: DataTypes.JSON },
      resetPasswordToken: { type: DataTypes.STRING },
      createdAt: { type: DataTypes.DATE },
      updatedAt: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    }
  );
  return User;
};
