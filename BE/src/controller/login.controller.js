const UserServices = require("../services/user.services");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let { userToken, userInfor } = await UserServices.executeLogin(
      username,
      password
    );
    res.send({
      token: userToken,
      userId: userInfor._id,
      fullName: userInfor.fullName,
      avatar: userInfor.avatar,
      email: userInfor.email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
