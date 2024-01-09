const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = async (req, res) => {
  try {
    const { username, password, companyId } = req.body;

    // Validate request parameters
    if (!(username && password && companyId)) {
      res.status(400).send("All input is required");
      return;
    }

    // Check if user already exist
    const oldUser = await User.findOne({ where: { username } });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }
    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await User.create({
      username,
      password: encryptedPassword,
      companyId,
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
      user.token = token;
      // user
      res.status(200).json({
        data: user,
        message: "User logged in successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  loginUser,
};
