var express = require("express");
var router = express.Router();
const registerController=require("../controller/register.controller")

router.route("/").post(registerController.newUser);

module.exports=router
