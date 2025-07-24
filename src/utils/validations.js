const validator = require("validator");

const validateLoginData = (req) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
};

const validateSignUpData = (req) => {
  const { name, email, password, age } = req.body;
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  if (name.length < 3 || name.length > 50) {
    throw new Error("Name must be between 3 and 50 characters");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email format");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
  if (age < 18) {
    throw new Error("Age must be at least 18");
  }
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
    "name",
  ];

  const isEditAllowed = Object.keys(req.body)?.every((field) =>
    allowedEditFields.includes(field)
  );
  if (!isEditAllowed) {
    throw new Error("Invalid Edit Request");
  }

  const { age, gender, photoUrl, about, skills, name } = req.body;
  if (!name || name.length < 3 || name.length > 50) {
    throw new Error("Name must be between 3 and 50 characters");
  }
  if (!age || age < 18) {
    throw new Error("Age must be at least 18");
  }
  if (
    !gender ||
    (gender !== "Male" && gender !== "Female" && gender !== "Other")
  ) {
    throw new Error("Gender must be either Male, Female or Other");
  }
  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Photo Url must be a valid URL");
  }
  if (!about || about?.length > 200) {
    throw new Error("About must be less than 200 characters");
  }
  if (skills && !Array.isArray(skills)) {
    throw new Error("Skills must be an array");
  }
  if (skills && skills?.length > 20) {
    throw new Error("Skills must be less than 20");
  }
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateProfileEditData,
};
