const express = require("express");
const router = express.Router();
const { employeeController } = require("../controllers");

router.get("/", employeeController.getAllEmployees);
router.get("/company/:id", employeeController.getEmployeesByCompany);
router.get(
  "/company/:companyId/employee/:id",
  employeeController.getEmployeeById
);
router.post("/", employeeController.createEmployee);

module.exports = router;
