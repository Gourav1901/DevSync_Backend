const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
  },
});

UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const hashedPasswordByBcrypt = await bcrypt.hash(this.password, 5);
    this.password = hashedPasswordByBcrypt;
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePasswordIsSame = async function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
    },
    process.env.ACCESS_SECRET_KEY,
    { expiresIn: "1y" }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { userId: this._id, username: this.username },
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: "1y" }
  );
};
const User = mongoose.model("User", UserSchema);

module.exports = User;
