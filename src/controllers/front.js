const { Front } = require("../models");

const createFront = async (req, res) => {
  try {
    const { name, companyId } = req.body;

    // Validate request parameters
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }

    // Check if front already exist
    const oldFront = await Front.findOne({ where: { name } });
    if (oldFront) {
      return res.status(409).send("Front Already Exist");
    }

    // Create front in the database
    const front = await Front.create({ name, companyId });

    res.status(201).json(front);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getFrontById = async (req, res) => {
  try {
    const { id, companyId } = req.params;
    const front = await Front.findOne({ where: { id, companyId } });
    res
      .status(200)
      .json({ data: front, message: "Front retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getFrontsByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const fronts = await Front.findAll({ where: { companyId: id } });
    res
      .status(200)
      .json({ data: fronts, message: "Fronts retrieved successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllFronts = async (req, res) => {
  try {
    const fronts = await Front.findAll();
    res
      .status(200)
      .json({ data: fronts, message: "Fronts retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createFront,
  getAllFronts,
  getFrontById,
  getFrontsByCompany,
};
