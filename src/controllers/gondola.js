const { Gondola } = require("../models");

const createGondola = async (req, res) => {
  try {
    const { code, companyId, type, plate, description } = req.body;
    // Validate request parameters
    if (!code) {
      res.status(400).send("Code is required");
      return;
    }
    if (!companyId) {
      res.status(400).send("Company Id is required");
      return;
    }
    if (!type) {
      res.status(400).send("Type is required");
      return;
    }
    if (!plate) {
      res.status(400).send("Plate is required");
      return;
    }
    if (!description) {
      res.status(400).send("Description is required");
      return;
    }
    // Check if gondola already exist
    const oldGondola = await Gondola.findOne({ where: { code } });
    if (oldGondola) {
      return res.status(409).send("Gondola Already Exist");
    }

    // Create gondola in the database
    const gondola = await Gondola.create({
      code,
      companyId,
      type,
      plate,
      description,
    });

    res.status(201).json(gondola);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGondolaById = async (req, res) => {
  try {
    const { id, companyId } = req.params;
    const gondola = await Gondola.findOne({ where: { id, companyId } });
    res
      .status(200)
      .json({ data: gondola, message: "Gondola retrieved successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGondolasByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const gondolas = await Gondola.findAll({ where: { companyId: id } });
    res
      .status(200)
      .json({ data: gondolas, message: "Gondolas retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllGondolas = async (req, res) => {
  try {
    const gondolas = await Gondola.findAll();
    res
      .status(200)
      .json({ data: gondolas, message: "Gondolas retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createGondola,
  getAllGondolas,
  getGondolaById,
  getGondolasByCompany,
};