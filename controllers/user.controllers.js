const User = require("../modals/UserModal");
const dotenv = require("dotenv");
dotenv.config();

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const passwordValidation =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const passwordMatchedOrNot = passwordValidation.test(password);
    if (!passwordMatchedOrNot) {
      return res.status(401).send({
        status: "fail password",
        msg: "Password must have at least one uppercase character, one number, one special character, and be at least 8 characters long.",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
    });
    await newUser.save();
    res.status(200).send({
      status: "success",
      msg: "User has been created successfully",
    });
  } catch (error) {
    res.status(400).send({ status: "fail", msg: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const findUserWithMail = await User.findOne({ email });

    const passwordValidation = await findUserWithMail.comparePasswordIsSame(
      password
    );

    if (!passwordValidation) {
      return res
        .status(401)
        .send({ status: "fail", msg: "Password is incorrect" });
    }

    const access_token = await findUserWithMail.generateAccessToken();
    const refresh_token = await findUserWithMail.generateRefreshToken();

    res.cookie("access_token", access_token, cookiesOption);
    res.cookie("refresh_token", refresh_token, cookiesOption);

    res.status(200).send({
      status: "success",
      msg: "User login successfully",
      username: findUserWithMail.username,
      refresh_token:refresh_token,
      access_token:access_token
    });
  } catch (error) {
    res.status(400).send({ status: "fail", msg: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const access_token = req.cookies["access_token"];
    const findToken = await BlackListModel.findOne({ access_token });

    if (findToken) {
      return res
        .status(401)
        .send({ status: "allready", msg: "You are already logged out" });
    }

    const blackListToken = new BlackListModel({ access_token });
    await blackListToken.save();
    res
      .status(200)
      .send({ status: "success", msg: "User logged out successfully" });
  } catch (error) {
    res.status(400).send({ status: "fail", msg: error.message });
  }
};

module.exports = { loginUser, registerUser, logoutUser };
