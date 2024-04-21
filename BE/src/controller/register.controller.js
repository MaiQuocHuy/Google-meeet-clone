const UserServices = require("../services/user.services");

const newUser = async (req, res, next) => {
  try {
    const user = req.body;
    await UserServices.createUser(user);

    res.send(true);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newUser,
};
