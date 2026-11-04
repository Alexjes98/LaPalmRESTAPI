"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrganizationMember extends Model {
    static associate(models) {
      OrganizationMember.belongsTo(models.Organization, {
        foreignKey: "organizationId",
        as: "organization",
      });
      OrganizationMember.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      OrganizationMember.belongsTo(models.User, {
        foreignKey: "invitedBy",
        as: "inviter",
      });
    }
  }
  OrganizationMember.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invitedEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "MEMBER",
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "OrganizationMember",
      tableName: "OrganizationMembers",
    }
  );
  return OrganizationMember;
};

