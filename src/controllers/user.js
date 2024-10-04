const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const { json } = require("sequelize");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send("Email is required");
  }
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).send("No account with that email address exists.");
  }

  // Generate and set password reset token
  user.resetPasswordToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  await User.update(
    { resetPasswordToken: user.resetPasswordToken },
    { where: { email } }
  );

  // Send email with password reset token (left as an exercise for the reader)
  await transporter.sendMail({
    from: process.env.SMTP_USERNAME, // sender address
    to: email, // list of receivers
    subject: "Stipe Password Reset Request", // Subject line
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n`,
    html: `
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
    <a href="http://localhost:5173/#/resetPassword?data=${user.resetPasswordToken}">Reset Password</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <p>Thank you!</p>
  `,
  });

  res.send("Password reset email has been sent for user");
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
    });
    if (!user) {
      res.status(400).send("Password reset token is invalid or has expired.");
    }
    try {
      // Verify the token
      jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      res.status(400).send("Password reset token is invalid or has expired.");
    }

    if (!password) {
      res.status(400).send("Password is required");
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.update(
      { password: encryptedPassword, resetPasswordToken: null },
      { where: { email: user.email } }
    );
    console.log("Password reset successfully");
    res.status(200).json({
      data: { message: "Password reset successfully", success: true },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const createUser = async (req, res) => {
  try {
    const { username, email, password, companyId, termsObject } = req.body;
    // Validate request parameters
    const parsedTermsObject = JSON.parse(termsObject);
    if (!(username && password && companyId && email && termsObject)) {
      res.status(400).send("All input is required");
      return;
    }
    if (
      parsedTermsObject.termsHash === undefined ||
      parsedTermsObject.termsVersion === undefined ||
      parsedTermsObject.termsAcceptedAt === undefined
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
      companyId: parseInt(companyId),
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
  resetPasswordRequest,
  resetPassword,
};
