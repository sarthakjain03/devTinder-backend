const express = require("express");
const cookieParser = require("cookie-parser");

const connectDB = require("./configs/database");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");

const app = express();
const port = 7777;

// Prefer API level validations over schema level validations

// Importing the body-parser middleware from json to javascript object
app.use(express.json());

// Parsing the cookies from the browser into JSON format
app.use(cookieParser());

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/", requestRouter);

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
