const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const connectDB = require("./configs/database");
const User = require("./models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("./utils/validations");
const userAuth = require("./middlewares/auth");
const app = express();
const port = 7777;

// Prefer API level validations over schema level validations

// Importing the body-parser middleware from json to javascript object
app.use(express.json());

// Parsing the cookies from the browser into JSON format
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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
    res.cookie("token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    res.send("Login successful");
  } catch (error) {
    res.status(400).send("Error occurred while logging in: " + error?.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send("Error fetching profile: " + error?.message);
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
