const { Equipment } = require("../models");

const createEquipment = async (req, res) => {
  try {
    const { name, companyId } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }
    const oldEquipment = await Equipment.findOne({ where: { name } });
    if (oldEquipment) {
      return res.status(409).send("Equipment Already Exist");
    }
    const equipment = await Equipment.create({ name, companyId });
    res.status(201).json(equipment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: equipment, message: "Equipment retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.findAll();
    res
      .status(200)
      .json({ data: equipments, message: "Equipments retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
};
