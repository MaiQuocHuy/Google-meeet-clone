var express = require("express");
var router = express.Router();
const UserController = require("../controller/user.controller");
const JwtMiddleware = require("../middleware/jwt.middleware");
const upload=require("../middleware/multer")

router
  .route("/update-infor")
  .post(JwtMiddleware.verifyToken, UserController.updateUserInfor);
router
  .route("/upload-img")
  .post(
    JwtMiddleware.verifyToken,
    upload.single("image"),
    UserController.uploadImg
  );

module.exports = router;