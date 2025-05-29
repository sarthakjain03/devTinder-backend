const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req?.user?._id;
    const toUserId = req?.params?.toUserId;
    const status = req?.params?.status;

    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status type: " + status,
      });
    }

    const toUserExists = await User.findById(toUserId);
    if (!toUserExists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If there is already a connection request between the two users
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res.status(400).json({
        message: "Connection request already exists",
      });
    }

    const customMessage = { ignored: "ignored", interested: "is interested in" }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();

    res.json({
      message: `${req.user.name} ${customMessage[status]} ${toUserExists.name}`,
      data,
    });
  } catch (error) {
    res
      .status(400)
      .send("Error creating connection request: " + error?.message);
  }
});

module.exports = requestRouter;
