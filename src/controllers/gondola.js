const { Gondola } = require("../models");

const createGondola = async (req, res) => {
  try {
    const { code, companyId } = req.body;

    // Validate request parameters
    if (!code) {
      res.status(400).send("Code is required");
      return;
    }

    // Check if gondola already exist
    const oldGondola = await Gondola.findOne({ where: { code } });
    if (oldGondola) {
      return res.status(409).send("Gondola Already Exist");
    }

    // Create gondola in the database
    const gondola = await Gondola.create({ code, companyId });

    res.status(201).json(gondola);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGondolaById = async (req, res) => {
  try {
    const { id } = req.params;
    const gondola = await Gondola.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: gondola, message: "Gondola retrieved successfully" });
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
};
