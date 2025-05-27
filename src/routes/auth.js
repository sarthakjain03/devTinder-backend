const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("../utils/validations");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);
    const { name, email, password, age, gender } = req.body;

    // Encrypting the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const body = {
      name,
      email,
      password: hashedPassword,
      age,
      gender,
    };
    // Creating a new instance of the User model
    const newUser = new User(body);
    await newUser.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error occurred while signing up: " + error?.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).send("Invalid email or password");
      return;
    }

    const isPasswordMatched = await user.validatePassword(password);
    if (!isPasswordMatched) {
      res.status(400).send("Invalid email or password");
      return;
    }
    // Create a JWT Token
    const token = user.generateJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.send("Login successful");
  } catch (error) {
    res.status(400).send("Error occurred while logging in: " + error?.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res
      .cookie("token", null, { expires: new Date(Date.now()) })
      .send("Logged out successfully");
  } catch (error) {
    res.send(400).send("Error occurred while logging out: " + error?.message);
  }
});

module.exports = authRouter;
