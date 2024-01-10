const { Employee } = require("../models");
const createEmployee = async (req, res) => {
  try {
    const { name, code, payrollType, companyId, positionId } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }
    if (!code) {
      res.status(400).send("Code is required");
      return;
    }
    if (!payrollType) {
      res.status(400).send("PayrollType is required");
      return;
    }
    const employee = await Employee.create({
      name,
      code,
      payrollType,
      companyId,
      positionId,
    });
    res.status(201).json(employee);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getEmployeeById = async (req, res) => {
  try {
    const { id, companyId } = req.params;
    const employee = await Employee.findOne({
      where: { id, companyId },
    });
    res
      .status(200)
      .json({ data: employee, message: "Employee retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res
      .status(200)
      .json({ data: employees, message: "Employees retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getEmployeesByCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const employees = await Employee.findAll({
      where: { companyId: id },
    });
    res
      .status(200)
      .json({ data: employees, message: "Employees retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeesByCompany,
};
