const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    const { username, email, password, companyId, termsObject } = req.body;
    // Validate request parameters
    if (!(username && password && companyId && email && termsObject)) {
      res.status(400).send("All input is required");
      return;
    }
    if (
      termsObject.termsHash === undefined ||
      termsObject.termsVersion === undefined ||
      termsObject.termsAcceptedAt === undefined
    ) {
      res.status(400).send("All termsObject input is required");
      return;
    }

    // Check if user already exist
    const oldUser = await User.findOne({ where: { email } });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await User.create({
      username,
      email,
      password: encryptedPassword,
      companyId,
      termsObject,
    });

    res.status(201).json({
      data: user,
      message: "User created successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    res
      .status(200)
      .json({ data: user, message: "User retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.destroy({ where: { id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res
      .status(200)
      .json({ data: users, message: "Users retrieved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Validate request parameters
    if (!(username && password)) {
      res.status(400).send("All input is required");
      return;
    }
    // Validate if user exist in our database
    const user = await User.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token =
        "Bearer " +
        jwt.sign({ userId: user.id, username }, process.env.SECRET_KEY, {
          expiresIn: "24h",
        });

      // save user token
      res.status(200).json({
        data: { username: user.username, companyId: user.companyId, token },
        message: "User logged in successfully",
      });
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  loginUser,
};
