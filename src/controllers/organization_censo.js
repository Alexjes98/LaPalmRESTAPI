const {
  Organization,
  OrganizationMember,
  CensoLote,
  CensoDailyResult,
  CensoSubmission,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");

const LOTE_CODE_REGEX = /^[a-zA-Z0-9_-]{1,15}$/;

function getTodayDateString() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = String(now.getFullYear());
  return `${d}/${m}/${y}`;
}

function parseDdMmYyyy(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return 0;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const dt = new Date(year, month, day);
  return isNaN(dt.getTime()) ? 0 : dt.getTime();
}

function formatLoteForClient(lote) {
  return {
    id: lote.code,
    serverId: lote.id,
    organizationId: lote.organizationId,
    createdAt: lote.createdAtDate,
    lastCensusDate: lote.lastCensusDate || null,
    censusCount: lote.censusCount || 0,
  };
}

function formatDailyResultForClient(dailyResult, loteCode) {
  let contributors = [];
  if (Array.isArray(dailyResult.contributors)) {
    contributors = dailyResult.contributors;
  } else if (typeof dailyResult.contributors === "string") {
    try {
      const parsed = JSON.parse(dailyResult.contributors);
      if (Array.isArray(parsed)) contributors = parsed;
    } catch (_) {
      contributors = [dailyResult.contributors];
    }
  }

  return {
    id: `daily_${dailyResult.id}`,
    serverId: String(dailyResult.id),
    organizationId: dailyResult.organizationId,
    loteId: loteCode,
    date: dailyResult.date,
    hour: dailyResult.hour,
    finalizedTime: dailyResult.finalizedTime,
    palmsCounted: dailyResult.palmsCounted,
    includesPintones: Boolean(dailyResult.includesPintones),
    densidadConPintones: Number(dailyResult.densidadConPintones),
    hojasConPintones: Number(dailyResult.hojasConPintones),
    pepasConPintones: Number(dailyResult.pepasConPintones),
    densidadSinPintones: Number(dailyResult.densidadSinPintones),
    hojasSinPintones: Number(dailyResult.hojasSinPintones),
    pepasSinPintones: Number(dailyResult.pepasSinPintones),
    totalRff: dailyResult.totalRff,
    totalHojas: dailyResult.totalHojas,
    totalPepas: dailyResult.totalPepas,
    submissionCount: dailyResult.submissionCount || 1,
    contributors,
    usuario: contributors.length > 0 ? contributors.join(", ") : null,
    longitud:
      dailyResult.longitud !== null && dailyResult.longitud !== undefined
        ? Number(dailyResult.longitud)
        : null,
    latitud:
      dailyResult.latitud !== null && dailyResult.latitud !== undefined
        ? Number(dailyResult.latitud)
        : null,
  };
}

function computeSimpleAverageFromSubmissions(submissions) {
  const k = submissions.length;
  const avg = (getter) =>
    submissions.reduce((acc, s) => acc + (Number(getter(s)) || 0), 0) / k;

  const contributorsSet = new Set();
  const lonValues = [];
  const latValues = [];

  for (const s of submissions) {
    if (s.usuario && String(s.usuario).trim()) {
      contributorsSet.add(String(s.usuario).trim());
    }
    if (s.longitud !== null && s.longitud !== undefined) {
      lonValues.push(Number(s.longitud));
    }
    if (s.latitud !== null && s.latitud !== undefined) {
      latValues.push(Number(s.latitud));
    }
  }

  const sortedHours = submissions
    .map((s) => s.hour)
    .filter(Boolean)
    .sort();
  const sortedFinalized = submissions
    .map((s) => s.finalizedTime || s.hour)
    .filter(Boolean)
    .sort();

  const lastSubmission = submissions[submissions.length - 1];

  return {
    hour: sortedHours[0] || lastSubmission.hour || "00:00",
    finalizedTime:
      sortedFinalized[sortedFinalized.length - 1] ||
      lastSubmission.finalizedTime ||
      lastSubmission.hour ||
      "00:00",
    palmsCounted: Math.round(avg((s) => s.palmsCounted)),
    includesPintones: Boolean(lastSubmission.includesPintones),
    densidadConPintones: avg((s) => s.densidadConPintones),
    hojasConPintones: avg((s) => s.hojasConPintones),
    pepasConPintones: avg((s) => s.pepasConPintones),
    densidadSinPintones: avg((s) => s.densidadSinPintones),
    hojasSinPintones: avg((s) => s.hojasSinPintones),
    pepasSinPintones: avg((s) => s.pepasSinPintones),
    totalRff: Math.round(avg((s) => s.totalRff)),
    totalHojas: Math.round(avg((s) => s.totalHojas)),
    totalPepas: Math.round(avg((s) => s.totalPepas)),
    submissionCount: k,
    contributors: Array.from(contributorsSet),
    longitud:
      lonValues.length > 0
        ? lonValues.reduce((a, b) => a + b, 0) / lonValues.length
        : null,
    latitud:
      latValues.length > 0
        ? latValues.reduce((a, b) => a + b, 0) / latValues.length
        : null,
  };
}

async function refreshLoteStats(lote, transaction) {
  const allDaily = await CensoDailyResult.findAll({
    where: { loteId: lote.id },
    transaction,
  });

  if (allDaily.length === 0) {
    lote.lastCensusDate = null;
    lote.censusCount = 0;
  } else {
    const sorted = [...allDaily].sort(
      (a, b) => parseDdMmYyyy(a.date) - parseDdMmYyyy(b.date)
    );
    lote.lastCensusDate = sorted[sorted.length - 1].date;
    lote.censusCount = allDaily.length;
  }
  await lote.save({ transaction });
}

async function upsertSingleCensusSubmission({
  orgId,
  lote,
  userId,
  userDefaultIdentifier,
  payload,
  transaction,
}) {
  const date = (payload.date || getTodayDateString()).trim();
  const hour = (payload.hour || "08:00").trim();
  const finalizedTime = (payload.finalizedTime || hour).trim();
  const clientSubmissionId = String(
    payload.clientSubmissionId ||
      payload.id ||
      `sub_${orgId}_${lote.id}_${userId}_${Date.now()}`
  ).slice(0, 100);
  const usuario =
    payload.usuario || userDefaultIdentifier || `User #${userId}`;

  // Check if this submission was already processed (idempotency for offline retries)
  const existingSubmission = await CensoSubmission.findOne({
    where: { clientSubmissionId },
    transaction,
  });

  let dailyResult = await CensoDailyResult.findOne({
    where: {
      loteId: lote.id,
      date,
    },
    transaction,
  });

  if (existingSubmission && dailyResult) {
    return dailyResult;
  }

  if (!dailyResult) {
    dailyResult = await CensoDailyResult.create(
      {
        loteId: lote.id,
        organizationId: orgId,
        date,
        hour,
        finalizedTime,
        palmsCounted: Number(payload.palmsCounted) || 0,
        includesPintones:
          payload.includesPintones !== undefined
            ? Boolean(payload.includesPintones)
            : true,
        densidadConPintones: Number(payload.densidadConPintones) || 0,
        hojasConPintones: Number(payload.hojasConPintones) || 0,
        pepasConPintones: Number(payload.pepasConPintones) || 0,
        densidadSinPintones: Number(payload.densidadSinPintones) || 0,
        hojasSinPintones: Number(payload.hojasSinPintones) || 0,
        pepasSinPintones: Number(payload.pepasSinPintones) || 0,
        totalRff: Number(payload.totalRff) || 0,
        totalHojas: Number(payload.totalHojas) || 0,
        totalPepas: Number(payload.totalPepas) || 0,
        submissionCount: 1,
        contributors: [usuario],
        longitud:
          payload.longitud !== undefined && payload.longitud !== null
            ? Number(payload.longitud)
            : null,
        latitud:
          payload.latitud !== undefined && payload.latitud !== null
            ? Number(payload.latitud)
            : null,
      },
      { transaction }
    );
  }

  if (!existingSubmission) {
    await CensoSubmission.create(
      {
        clientSubmissionId,
        dailyResultId: dailyResult.id,
        loteId: lote.id,
        userId,
        usuario,
        date,
        hour,
        finalizedTime,
        palmsCounted: Number(payload.palmsCounted) || 0,
        includesPintones:
          payload.includesPintones !== undefined
            ? Boolean(payload.includesPintones)
            : true,
        densidadConPintones: Number(payload.densidadConPintones) || 0,
        hojasConPintones: Number(payload.hojasConPintones) || 0,
        pepasConPintones: Number(payload.pepasConPintones) || 0,
        densidadSinPintones: Number(payload.densidadSinPintones) || 0,
        hojasSinPintones: Number(payload.hojasSinPintones) || 0,
        pepasSinPintones: Number(payload.pepasSinPintones) || 0,
        totalRff: Number(payload.totalRff) || 0,
        totalHojas: Number(payload.totalHojas) || 0,
        totalPepas: Number(payload.totalPepas) || 0,
        longitud:
          payload.longitud !== undefined && payload.longitud !== null
            ? Number(payload.longitud)
            : null,
        latitud:
          payload.latitud !== undefined && payload.latitud !== null
            ? Number(payload.latitud)
            : null,
      },
      { transaction }
    );
  }

  // Recompute simple average across all submissions for this (loteId, date)
  const allSubmissions = await CensoSubmission.findAll({
    where: {
      dailyResultId: dailyResult.id,
    },
    order: [["id", "ASC"]],
    transaction,
  });

  if (allSubmissions.length > 0) {
    const averaged = computeSimpleAverageFromSubmissions(allSubmissions);
    Object.assign(dailyResult, averaged);
    await dailyResult.save({ transaction });
  }

  await refreshLoteStats(lote, transaction);
  return dailyResult;
}

const syncOrganizationData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership) {
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

    const lotes = await CensoLote.findAll({
      where: { organizationId: orgId },
      order: [["id", "ASC"]],
    });

    const loteCodeMap = new Map();
    for (const l of lotes) {
      loteCodeMap.set(l.id, l.code);
    }

    const dailyResults = await CensoDailyResult.findAll({
      where: { organizationId: orgId },
      order: [["id", "ASC"]],
    });

    const formattedLotes = lotes.map(formatLoteForClient);
    const formattedResults = dailyResults
      .filter((r) => loteCodeMap.has(r.loteId))
      .map((r) => formatDailyResultForClient(r, loteCodeMap.get(r.loteId)));

    // Sort results chronologically per lote so charts render in order
    formattedResults.sort(
      (a, b) => parseDdMmYyyy(a.date) - parseDdMmYyyy(b.date)
    );

    return res.status(200).json({
      data: {
        organization: {
          id: org.id,
          name: org.name,
          description: org.description,
          ownerId: org.ownerId,
          role: membership.role,
        },
        lotes: formattedLotes,
        results: formattedResults,
      },
      message: "Organization data synced successfully",
    });
  } catch (err) {
    console.error("syncOrganizationData error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const createLote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const rawCode = (req.body.code || req.body.id || "").trim().toUpperCase();

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "No tienes acceso a esta organización",
        data: {},
      });
    }

    if (membership.role !== "OWNER") {
      return res.status(403).json({
        message: "Solo el propietario de la organización puede crear lotes",
        data: {},
      });
    }

    if (!LOTE_CODE_REGEX.test(rawCode)) {
      return res.status(400).json({
        message:
          "El código del lote debe ser alfanumérico y de máximo 15 caracteres",
        data: {},
      });
    }

    const existing = await CensoLote.findOne({
      where: {
        organizationId: orgId,
        code: rawCode,
      },
    });

    if (existing) {
      return res.status(409).json({
        message: `Ya existe un lote con el código "${rawCode}" en esta organización`,
        data: {},
      });
    }

    const lote = await CensoLote.create({
      organizationId: orgId,
      code: rawCode,
      createdAtDate: req.body.createdAt || getTodayDateString(),
      lastCensusDate: null,
      censusCount: 0,
      createdBy: userId,
    });

    return res.status(201).json({
      data: formatLoteForClient(lote),
      message: "Lote created successfully",
    });
  } catch (err) {
    console.error("createLote error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const deleteLote = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const rawCode = (req.params.code || "").trim().toUpperCase();

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership || membership.role !== "OWNER") {
      await transaction.rollback();
      return res.status(403).json({
        message:
          "Permiso denegado: solo el propietario de la organización puede eliminar lotes",
        data: {},
      });
    }

    const lote = await CensoLote.findOne({
      where: {
        organizationId: orgId,
        code: rawCode,
      },
      transaction,
    });

    if (!lote) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Lote no encontrado en la organización",
        data: {},
      });
    }

    await CensoSubmission.destroy({
      where: { loteId: lote.id },
      transaction,
    });
    await CensoDailyResult.destroy({
      where: { loteId: lote.id },
      transaction,
    });
    await lote.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      data: { id: rawCode, organizationId: orgId },
      message: "Lote deleted successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("deleteLote error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const submitCensus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const rawCode = (req.params.code || "").trim().toUpperCase();

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership) {
      await transaction.rollback();
      return res.status(403).json({
        message: "No tienes permiso para registrar censos en esta organización",
        data: {},
      });
    }

    const lote = await CensoLote.findOne({
      where: {
        organizationId: orgId,
        code: rawCode,
      },
      transaction,
    });

    if (!lote) {
      await transaction.rollback();
      return res.status(404).json({
        message: `El lote "${rawCode}" no existe en esta organización`,
        data: {},
      });
    }

    const submissionsList = Array.isArray(req.body.submissions)
      ? req.body.submissions
      : [req.body];

    const userDefaultIdentifier =
      req.user.email || req.user.username || `User #${userId}`;

    let lastDailyResult = null;
    for (const item of submissionsList) {
      lastDailyResult = await upsertSingleCensusSubmission({
        orgId,
        lote,
        userId,
        userDefaultIdentifier,
        payload: item,
        transaction,
      });
    }

    await transaction.commit();

    return res.status(201).json({
      data: {
        lote: formatLoteForClient(lote),
        result: lastDailyResult
          ? formatDailyResultForClient(lastDailyResult, lote.code)
          : null,
      },
      message: "Census submitted and averaged successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("submitCensus error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const deleteDailyResult = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const rawCode = (req.params.code || "").trim().toUpperCase();
    const rawResultId = String(req.params.dailyResultId || "").replace(
      /^daily_/,
      ""
    );
    const dailyResultId = parseInt(rawResultId, 10);

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership || membership.role !== "OWNER") {
      await transaction.rollback();
      return res.status(403).json({
        message:
          "Permiso denegado: solo el propietario de la organización puede eliminar censos",
        data: {},
      });
    }

    const lote = await CensoLote.findOne({
      where: {
        organizationId: orgId,
        code: rawCode,
      },
      transaction,
    });

    if (!lote) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Lote no encontrado",
        data: {},
      });
    }

    const dailyResult = await CensoDailyResult.findOne({
      where: {
        id: dailyResultId,
        loteId: lote.id,
        organizationId: orgId,
      },
      transaction,
    });

    if (!dailyResult) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Censo no encontrado",
        data: {},
      });
    }

    await CensoSubmission.destroy({
      where: { dailyResultId: dailyResult.id },
      transaction,
    });
    await dailyResult.destroy({ transaction });
    await refreshLoteStats(lote, transaction);

    await transaction.commit();

    return res.status(200).json({
      data: {
        deletedResultId: `daily_${dailyResultId}`,
        lote: formatLoteForClient(lote),
      },
      message: "Census deleted successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error("deleteDailyResult error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

const migrateLocalLotes = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.userId;
    const orgId = parseInt(req.params.orgId, 10);
    const { lotes, results } = req.body;

    const membership = await OrganizationMember.findOne({
      where: {
        organizationId: orgId,
        userId,
        status: "ACCEPTED",
      },
    });

    if (!membership || membership.role !== "OWNER") {
      await transaction.rollback();
      return res.status(403).json({
        message:
          "Solo el propietario de la organización puede migrar lotes a la organización",
        data: {},
      });
    }

    if (!Array.isArray(lotes) || lotes.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Debe seleccionar al menos un lote para migrar",
        data: {},
      });
    }

    const loteByCode = new Map();

    for (const rawLote of lotes) {
      const code = String(rawLote.id || rawLote.code || "")
        .trim()
        .toUpperCase();
      if (!LOTE_CODE_REGEX.test(code)) continue;

      let lote = await CensoLote.findOne({
        where: {
          organizationId: orgId,
          code,
        },
        transaction,
      });

      if (!lote) {
        lote = await CensoLote.create(
          {
            organizationId: orgId,
            code,
            createdAtDate: rawLote.createdAt || getTodayDateString(),
            lastCensusDate: rawLote.lastCensusDate || null,
            censusCount: 0,
            createdBy: userId,
          },
          { transaction }
        );
      }
      loteByCode.set(code, lote);
    }

    const userDefaultIdentifier =
      req.user.email || req.user.username || `User #${userId}`;

    if (Array.isArray(results)) {
      for (const rawResult of results) {
        const loteCode = String(rawResult.loteId || "")
          .trim()
          .toUpperCase();
        const lote = loteByCode.get(loteCode);
        if (!lote) continue;

        await upsertSingleCensusSubmission({
          orgId,
          lote,
          userId,
          userDefaultIdentifier,
          payload: {
            ...rawResult,
            clientSubmissionId:
              rawResult.clientSubmissionId ||
              `mig_${orgId}_${lote.id}_${rawResult.id || Date.now()}`,
          },
          transaction,
        });
      }
    }

    await transaction.commit();

    // Return full synced state after migration
    return syncOrganizationData(req, res);
  } catch (err) {
    await transaction.rollback();
    console.error("migrateLocalLotes error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", data: {} });
  }
};

module.exports = {
  syncOrganizationData,
  createLote,
  deleteLote,
  submitCensus,
  deleteDailyResult,
  migrateLocalLotes,
  computeSimpleAverageFromSubmissions,
};

