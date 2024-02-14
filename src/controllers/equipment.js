const { Equipment } = require("../models");

const createEquipment = async (req, res) => {
  try {
    const { name, companyId, type, code, plate, description } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
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
    if (!code) {
      res.status(400).send("Code is required");
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
    const oldEquipment = await Equipment.findOne({ where: { name } });
    if (oldEquipment) {
      return res.status(409).send("Equipment Already Exist");
    }
    const equipment = await Equipment.create({
      name,
      companyId,
      type,
      code,
      plate,
      description,
    });
    res.status(201).json(equipment);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id, companyId } = req.params;
    const equipment = await Equipment.findOne({ where: { id, companyId } });
    res
      .status(200)
      .json({ data: equipment, message: "Equipment retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getEquipmentsByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const equipments = await Equipment.findAll({ where: { companyId: id } });
    res
      .status(200)
      .json({ data: equipments, message: "Equipments retrieved successfully" });
  } catch (err) {
    console.log(err);
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
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createEquipment,
  getAllEquipments,
  getEquipmentById,
  getEquipmentsByCompany,
};
