const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: {
        values: ["Male", "Female", "Other"],
        message: `{VALUE} is not a valid gender`,
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    photoUrl: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    about: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      validate: (value) => {
        if (value?.length > 20) {
          throw new Error("Skills cannot exceed 20");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateJWT = function () {
  // this = the current instance of the user model
  const user = this; // Doesn't work inside arrow functions
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashedPassword = user.password;
  const isPasswordMatched = await bcrypt.compare(
    passwordInputByUser,
    hashedPassword
  );
  return isPasswordMatched;
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
