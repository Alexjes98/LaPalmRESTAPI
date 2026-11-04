const {
  Organization,
  OrganizationMember,
  CensoLote,
  CensoDailyResult,
  CensoSubmission,
  User,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");

const sendInvitationEmailIfConfigured = async ({
  toEmail,
  toUsername,
  orgName,
  inviterName,
}) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USERNAME || !toEmail) {
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: toEmail,
      subject: `Invitación a la organización "${orgName}" en Stipe`,
      text: `Hola ${toUsername || ""}, ${inviterName} te ha invitado a unirte a la organización "${orgName}" en Stipe para compartir lotes de Censo Pre Cosecha. Abre la aplicación para aceptar la invitación.`,
      html: `
        <h2>Invitación a Organización en Stipe</h2>
        <p>Hola <strong>${toUsername || toEmail}</strong>,</p>
        <p><strong>${inviterName}</strong> te ha invitado a colaborar en la organización <strong>${orgName}</strong> para visualizar lotes y registrar Censos Pre Cosecha.</p>
        <p>Ingresa a la aplicación Stipe en la sección de <em>Organizaciones</em> para aceptar o rechazar esta invitación.</p>
      `,
    });
  } catch (err) {
    // Non-blocking: log and continue if SMTP is unreachable
    console.warn("Could not send invitation email:", err.message);
  }
};

const createOrganization = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name || typeof name !== "string" || !name.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        message: "El nombre de la organización es obligatorio",
        data: {},
      });
    }

    const cleanName = name.trim().slice(0, 100);
    const cleanDesc =
      description && typeof description === "string"
        ? description.trim().slice(0, 255)
        : null;

    const org = await Organization.create(
      {
        name: cleanName,
        description: cleanDesc,
        ownerId: userId,
      },
      { transaction }
    );

    await OrganizationMember.create(
      {
        organizationId: org.id,
        userId,
        invitedEmail: req.user.email || null,
        role: "OWNER",
        status: "ACCEPTED",
        invitedBy: userId,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      data: {
        id: org.id,
        name: org.name,
        description: org.description,
        ownerId: org.ownerId,
        role: "OWNER",
        memberCount: 1,
        loteCount: 0,
        createdAt: org.createdAt,
      },
      message: "Organization created successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("createOrganization error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const getUserOrganizations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const memberships = await OrganizationMember.findAll({
      where: {
        userId,
        status: "ACCEPTED",
      },
      include: [
        {
          model: Organization,
          as: "organization",
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const result = [];
    for (const m of memberships) {
      if (!m.organization) continue;
      const memberCount = await OrganizationMember.count({
        where: {
          organizationId: m.organization.id,
          status: "ACCEPTED",
        },
      });
      const loteCount = await CensoLote.count({
        where: {
          organizationId: m.organization.id,
        },
      });
      result.push({
        id: m.organization.id,
        name: m.organization.name,
        description: m.organization.description,
        ownerId: m.organization.ownerId,
        role: m.role,
        memberCount,
        loteCount,
        createdAt: m.organization.createdAt,
      });
    }

    return res.status(200).json({
      data: result,
      message: "Organizations retrieved successfully",
    });
  } catch (err) {
    console.error("getUserOrganizations error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const getPendingInvitations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const invitations = await OrganizationMember.findAll({
      where: {
        userId,
        status: "PENDING",
      },
      include: [
        {
          model: Organization,
          as: "organization",
        },
        {
          model: User,
          as: "inviter",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = invitations
      .filter((inv) => inv.organization)
      .map((inv) => ({
        id: inv.id,
        organizationId: inv.organization.id,
        organizationName: inv.organization.name,
        organizationDescription: inv.organization.description,
        role: inv.role,
        status: inv.status,
        invitedByUsername: inv.inviter ? inv.inviter.username : "Administrador",
        invitedByEmail: inv.inviter ? inv.inviter.email : null,
        createdAt: inv.createdAt,
      }));

    return res.status(200).json({
      data: formatted,
      message: "Invitations retrieved successfully",
    });
  } catch (err) {
    console.error("getPendingInvitations error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const respondToInvitation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { memberId } = req.params;
    const { action } = req.body;

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return res.status(400).json({
        message: "Action must be ACCEPT or REJECT",
        data: {},
      });
    }

    const membership = await OrganizationMember.findOne({
      where: {
        id: parseInt(memberId, 10),
        userId,
        status: "PENDING",
      },
    });

    if (!membership) {
      return res.status(404).json({
        message: "Invitación no encontrada o ya procesada",
        data: {},
      });
    }

    membership.status = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
    await membership.save();

    return res.status(200).json({
      data: {
        id: membership.id,
        organizationId: membership.organizationId,
        status: membership.status,
        role: membership.role,
      },
      message:
        action === "ACCEPT"
          ? "Invitation accepted successfully"
          : "Invitation rejected successfully",
    });
  } catch (err) {
    console.error("respondToInvitation error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const getOrganizationDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);

    const callerMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!callerMembership) {
      return res.status(403).json({
        message: "No tienes acceso a esta organización",
        data: {},
      });
    }

    const org = await Organization.findByPk(orgId);
    if (!org) {
      return res.status(404).json({
        message: "Organización no encontrada",
        data: {},
      });
    }

    const members = await OrganizationMember.findAll({
      where: {
        organizationId: orgId,
        status: { [Op.in]: ["ACCEPTED", "PENDING"] },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const loteCount = await CensoLote.count({
      where: { organizationId: orgId },
    });

    const formattedMembers = members.map((m) => ({
      id: m.id,
      userId: m.userId,
      username: m.user ? m.user.username : m.invitedEmail || "Usuario",
      email: m.user ? m.user.email : m.invitedEmail,
      role: m.role,
      status: m.status,
      createdAt: m.createdAt,
    }));

    return res.status(200).json({
      data: {
        id: org.id,
        name: org.name,
        description: org.description,
        ownerId: org.ownerId,
        role: callerMembership.role,
        loteCount,
        members: formattedMembers,
        createdAt: org.createdAt,
      },
      message: "Organization details retrieved successfully",
    });
  } catch (err) {
    console.error("getOrganizationDetail error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const { name, description } = req.body;

    const callerMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        role: "OWNER",
        status: "ACCEPTED",
      },
    });

    if (!callerMembership) {
      return res.status(403).json({
        message: "Solo el propietario puede editar la organización",
        data: {},
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "El nombre de la organización es obligatorio",
        data: {},
      });
    }

    const org = await Organization.findByPk(orgId);
    if (!org) {
      return res.status(404).json({
        message: "Organización no encontrada",
        data: {},
      });
    }

    org.name = name.trim().slice(0, 100);
    if (description !== undefined) {
      org.description =
        description && typeof description === "string"
          ? description.trim().slice(0, 255)
          : null;
    }
    await org.save();

    return res.status(200).json({
      data: {
        id: org.id,
        name: org.name,
        description: org.description,
        ownerId: org.ownerId,
        role: "OWNER",
      },
      message: "Organization updated successfully",
    });
  } catch (err) {
    console.error("updateOrganization error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const deleteOrganization = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);

    const callerMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        role: "OWNER",
        status: "ACCEPTED",
      },
    });

    if (!callerMembership) {
      await transaction.rollback();
      return res.status(403).json({
        message: "Solo el propietario puede eliminar la organización",
        data: {},
      });
    }

    const lotes = await CensoLote.findAll({
      where: { organizationId: orgId },
      transaction,
    });
    const loteIds = lotes.map((l) => l.id);
    if (loteIds.length > 0) {
      await CensoSubmission.destroy({
        where: { loteId: { [Op.in]: loteIds } },
        transaction,
      });
    }
    await CensoDailyResult.destroy({
      where: { organizationId: orgId },
      transaction,
    });
    await CensoLote.destroy({
      where: { organizationId: orgId },
      transaction,
    });
    await OrganizationMember.destroy({
      where: { organizationId: orgId },
      transaction,
    });
    await Organization.destroy({
      where: { id: orgId },
      transaction,
    });

    await transaction.commit();
    return res.status(200).json({
      data: { id: orgId },
      message: "Organization deleted successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("deleteOrganization error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const inviteUser = async (req, res) => {
  try {
    const callerId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const { identifier, email, username } = req.body;
    const targetIdentifier = (identifier || email || username || "").trim();

    if (!targetIdentifier) {
      return res.status(400).json({
        message: "Debe ingresar el correo electrónico o nombre de usuario",
        data: {},
      });
    }

    const callerMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId: callerId,
        role: "OWNER",
        status: "ACCEPTED",
      },
    });

    if (!callerMembership) {
      return res.status(403).json({
        message: "Solo el propietario de la organización puede invitar usuarios",
        data: {},
      });
    }

    const org = await Organization.findByPk(orgId);
    if (!org) {
      return res.status(404).json({
        message: "Organización no encontrada",
        data: {},
      });
    }

    const invitedUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: targetIdentifier },
          { username: targetIdentifier },
        ],
      },
    });

    if (!invitedUser) {
      return res.status(404).json({
        message: "No se encontró ningún usuario registrado con ese correo o usuario",
        data: {},
      });
    }

    if (invitedUser.id === callerId) {
      return res.status(400).json({
        message: "Ya eres el propietario de esta organización",
        data: {},
      });
    }

    let existingMember = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      if (existingMember.status === "ACCEPTED") {
        return res.status(409).json({
          message: "El usuario ya es miembro de esta organización",
          data: {},
        });
      }
      if (existingMember.status === "PENDING") {
        return res.status(409).json({
          message: "El usuario ya tiene una invitación pendiente",
          data: {},
        });
      }
      // Re-invite a previously rejected invitation
      existingMember.status = "PENDING";
      existingMember.invitedBy = callerId;
      await existingMember.save();
    } else {
      existingMember = await OrganizationMember.create({
        organizationId: orgId,
        userId: invitedUser.id,
        invitedEmail: invitedUser.email,
        role: "MEMBER",
        status: "PENDING",
        invitedBy: callerId,
      });
    }

    await sendInvitationEmailIfConfigured({
      toEmail: invitedUser.email,
      toUsername: invitedUser.username,
      orgName: org.name,
      inviterName: req.user.username || req.user.email || "Un usuario",
    });

    return res.status(201).json({
      data: {
        id: existingMember.id,
        organizationId: orgId,
        userId: invitedUser.id,
        username: invitedUser.username,
        email: invitedUser.email,
        role: existingMember.role,
        status: existingMember.status,
      },
      message: "Invitation sent successfully",
    });
  } catch (err) {
    console.error("inviteUser error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const removeMember = async (req, res) => {
  try {
    const callerId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const targetUserId = parseInt(req.params.userId, 10);

    const callerMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId: callerId,
        status: "ACCEPTED",
      },
    });

    if (!callerMembership) {
      return res.status(403).json({
        message: "No tienes acceso a esta organización",
        data: {},
      });
    }

    const isOwner = callerMembership.role === "OWNER";
    const isSelf = callerId === targetUserId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        message: "Solo el propietario puede eliminar miembros",
        data: {},
      });
    }

    const targetMembership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId: targetUserId,
      },
    });

    if (!targetMembership) {
      return res.status(404).json({
        message: "Miembro no encontrado en la organización",
        data: {},
      });
    }

    if (targetMembership.role === "OWNER") {
      return res.status(400).json({
        message: "El propietario no puede ser eliminado de su propia organización",
        data: {},
      });
    }

    await targetMembership.destroy();

    return res.status(200).json({
      data: { userId: targetUserId, organizationId: orgId },
      message: "Member removed successfully",
    });
  } catch (err) {
    console.error("removeMember error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

module.exports = {
  createOrganization,
  getUserOrganizations,
  getPendingInvitations,
  respondToInvitation,
  getOrganizationDetail,
  updateOrganization,
  deleteOrganization,
  inviteUser,
  removeMember,
};

