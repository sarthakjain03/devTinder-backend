const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to Database successfully`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
