const { Position } = require("../models");

const createPosition = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate request parameters
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }

    // Check if position already exist
    const oldPosition = await Position.findOne({ where: { name } });
    if (oldPosition) {
      return res.status(409).send("Position Already Exist");
    }

    // Create position in the database
    const position = await Position.create({ name });

    res.status(201).json(position);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const position = await Position.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: position, message: "Position retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll();
    res
      .status(200)
      .json({ data: positions, message: "Positions retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createPosition,
  getAllPositions,
  getPositionById,
};
