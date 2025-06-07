const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "name gender age photoUrl about skills";

userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA); // populating the reference
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
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA); // populating the references

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

// example -> /user/feed?page=1&limit=10
userRouter.get("/feed", userAuth, async (req, res) => {
  // this api can be made more complex like similar skills, age range, gender preference, etc.
  try {
    const loggedInUser = req.user;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    limit = limit > 50 ? 50 : limit;
    const offset = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id },
      ]
    }).select("fromUserId toUserId");

    const usersToHideFromFeed = new Set();
    connectionRequests?.forEach(req => {
      usersToHideFromFeed.add(req.fromUserId.toString());
      usersToHideFromFeed.add(req.toUserId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(usersToHideFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ]
    }).select(USER_SAFE_DATA).skip(offset).limit(limit);

    res.json({ data: feedUsers, message: "Feed users successfully fetched" });
    
  } catch (error) {
    res.status(400).json({
      message: "Error getting user feed: " + error?.message,
    })
  }
});

module.exports = userRouter;
