const { Company } = require("../models");

const createCompany = async (req, res) => {
  try {
    const { name, domainExtension } = req.body;

    // Validate request parameters
    if (!name) {
      res.status(400).send("Name is required");
      return;
    }

    if (!domainExtension) {
      res.status(400).send("Domain extension is required");
      return;
    }

    // Check if company already exist
    const oldCompany = await Company.findOne({ where: { name } });
    if (oldCompany) {
      return res.status(409).send("Company Already Exist");
    }

    // Create company in the database
    const company = await Company.create({ name, domainExtension });

    res.status(201).json(company);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: company, message: "Company retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res
      .status(200)
      .json({ data: companies, message: "Companies retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
};
