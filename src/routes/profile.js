const express = require("express");
const userAuth = require("../middlewares/auth");

const User = require("../models/user");
const { validateProfileEditData } = require("../utils/validations");

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send("Error fetching profile: " + error?.message);
  }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    validateProfileEditData(req);
    const user = req.user;

    Object.keys(req.body)?.forEach((field) => (user[field] = req.body[field]));
    await user?.save();

    res.send({
      success: true,
      message: "Profile logged successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).send("Error editing profile: " + error?.message);
  }
});

// PATCH /profile/password -> Forgot Password API

module.exports = profileRouter;
