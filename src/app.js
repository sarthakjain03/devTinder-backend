const express = require("express");
const connectDB = require("./configs/database");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("./utils/validations");
const app = express();
const port = 3003;

// Prefer API level validations over schema level validations

// Importing the body-parser middleware from json to javascript object
app.use(express.json());

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
    }

    const isPasswordMatched = await bcrypt.compare(password, user?.password);
    if (!isPasswordMatched) {
      res.status(400).send("Invalid email or password");
    }

    res.send("Login successful");
  } catch (error) {
    res.status(400).send("Error occurred while logging in: " + error?.message);
  }
});

app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body?.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res
      .status(400)
      .send("Error occurred while fetching user: " + error?.message);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users?.length === 0) {
      res.status(404).send("No User Found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res
      .status(400)
      .send("Error occurred while fetching users: " + error?.message);
  }
});

app.delete("/user", async (req, res) => {
  try {
    const userId = req.body?.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    res
      .status(400)
      .send("Error occurred while deleting user: " + error?.message);
  }
});

app.patch("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const data = req.body;
    const ALLOWED_FIELDS = [
      "password",
      "gender",
      "age",
      "photoUrl",
      "about",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((field) =>
      ALLOWED_FIELDS.includes(field)
    );
    if (!isUpdateAllowed) {
      res.status(400).send("Update not allowed");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      runValidators: true, // runs validtors and enum check before inserting the document, otherwise they will run after insertion
      returnDocument: "after",
    });
    // Same as const user = await User.findByIdAndUpdate({ _id: userId }, ...);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User updated successfully");
    }
  } catch (error) {
    res
      .status(400)
      .send("Error occurred while updating user: " + error?.message);
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
