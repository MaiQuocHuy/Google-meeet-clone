const UserController = {};
const UserServices = require("../services/user.services");
const cloudinary = require("../configs/cloudinary.config");

UserController.updateUserInfor = async (req, res, next) => {
  try {
    const { userID } = req.body;
    const user = await UserServices.getUserByID(userID);
    const newUser = await UserServices.updateUserInfor(user, req.body);
    console.log("Updated User SuccessFul");
    console.log(newUser);
    res.status(200).send({
      message: "Update successful",
      //   fullName: newUser.fullName,
      //   avatar: newUser.avatar,
      //   email: newUser.email,
      //   userId: newUser._id,
    });
  } catch (error) {
    next(error);
  }
};

UserController.uploadImg = async (req, res, next) => {
  try {
    cloudinary.uploader.upload(req.file.path, (err, restult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error uploading" });
      } else {
        console.log(restult);

        return res
          .status(200)
          .json({ message: "Upload successful", data: restult });
      }
    });
  } catch (error) {}
};

module.exports = UserController;
