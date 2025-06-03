const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", "name gender age photoUrl about skills"); // populating the reference
    // }).populate("fromUserId", ["name", "gender", "age", "photoUrl", "about", "skills"]); works same as above

    res.json({
      data: connectionRequests,
      message: "Successfully fetched user connection requests",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error getting user connection requests: " + error?.message,
    });
  }
});

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "name gender age photoUrl about skills")
      .populate("toUserId", "name gender age photoUrl about skills"); // populating the references

    const data = connections?.map((connection) => {
      if (connection.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.json({
      data,
      message: "Successfully fetched user connections",
    });
  } catch (error) {
    res.status(400).json({
      message: "Error getting user connections: " + error?.message,
    });
  }
});

module.exports = userRouter;
