const { UserModel } = require("../model/user.model");
const createError = require("http-errors");
const JWT = require("jsonwebtoken");
const UserServices = {};

UserServices.createUser = async (user) => {
  try {
    var isExistsUsername = await checkUsernameExists(user.username);

    if (isExistsUsername) throw createError.Conflict("Username already exists");

    await UserModel.create(user);
  } catch (error) {
    throw error;
  }
};

const checkUsernameExists = async (username) => {
  let isExists = await UserModel.findOne({ username: username });
  return isExists;
};

UserServices.executeLogin = async (username, password) => {
  try {
    let user = await UserModel.findOne({
      username: username,
      password: password,
    });
    if (!user) throw createError.NotFound("Username or password incorrect");
    let userToken = await encodeToken(user);
    return { userToken, userInfor: user };
  } catch (error) {
    throw error;
  }
};

UserServices.updateUserInfor = async (user, userInfor) => {
  try {
    const { fullName, email, image } = userInfor;
    user.fullName = fullName;
    user.email = email;
    user.avatar = image;
    console.log(userInfor);
    await user.save();
    return true;
  } catch (error) {
    throw error;
  }
};

UserServices.getUserByID = async (userID) => {
  try {
    return await UserModel.findById(userID);
  } catch (error) {
    throw error;
  }
};

const encodeToken = async (user) => {
  try {
    return JWT.sign(
      {
        iss: "GoMeet",
        userID: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        email: user.email,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 3),
      },
      process.env.ACCESS_TOKEN_SECRET
    );
  } catch (error) {
    throw error;
  }
};

module.exports = UserServices;
