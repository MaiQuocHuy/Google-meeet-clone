var express = require("express");
var router = express.Router();
const loginController=require("../controller/login.controller")
const jwt=require("../middleware/jwt.middleware")

router.route("/t").get((req,res)=>{
    res.send("Hello")
});
router.route("/").post(loginController.login);
// router.route("/jwtget").get(jwt.verifyToken);
// router.route("/jwtpost").post(jwt.verifyToken);
// router.route("/jwtheader").get(jwt.verifyToken);

module.exports=router
