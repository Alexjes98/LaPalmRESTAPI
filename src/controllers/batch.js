const { Batch } = require("../models");
const createBatch = async (req, res) => {
  try {
    const { name, companyId } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }
    const oldBatch = await Batch.findOne({ where: { name } });
    if (oldBatch) {
      return res.status(409).send("Batch Already Exist");
    }
    const batch = await Batch.create({ name, companyId });
    res.status(201).json(batch);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await Batch.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: batch, message: "Batch retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.findAll();
    res
      .status(200)
      .json({ data: batches, message: "Batches retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
};
