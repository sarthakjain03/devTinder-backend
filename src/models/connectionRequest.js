const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the User Collection
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "accepted", "rejected", "interested"],
        message: `{VALUE} is not a valid status`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// 1 for ascending and -1 for descending, there are other string values also
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }); // compound index

connectionRequestSchema.pre("save", function (next) {
  // arrow functions won't work here
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself");
  }

  next();
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
