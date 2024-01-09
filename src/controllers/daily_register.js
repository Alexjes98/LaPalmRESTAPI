const { DailyRegister } = require("../models");
const createDailyRegister = async (req, res) => {
  const { body, userId, companyId } = req.body;
  if (!body) {
    res.status(400).send("Body is required");
    return;
  }
  if (!userId) {
    res.status(400).send("UserId is required");
    return;
  }
  if (!companyId) {
    res.status(400).send("CompanyId is required");
    return;
  }
  const dailyRegister = await DailyRegister.create({
    body,
    userId,
    companyId,
  });
  res.status(201).json(dailyRegister);
};

const getDailyRegisterById = async (req, res) => {
  try {
    const { id } = req.params;
    const dailyRegister = await DailyRegister.findOne({ where: { id } });
    res.status(200).json({
      data: dailyRegister,
      message: "DailyRegister retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllDailyRegisters = async (req, res) => {
  try {
    const dailyRegisters = await DailyRegister.findAll();
    res.status(200).json({
      data: dailyRegisters,
      message: "DailyRegisters retrieved successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createDailyRegister,
  getAllDailyRegisters,
  getDailyRegisterById,
};
