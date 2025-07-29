const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      req.user = user;
      next();
    }
  } catch (error) {
    throw error;
  }
};

module.exports = userAuth;
