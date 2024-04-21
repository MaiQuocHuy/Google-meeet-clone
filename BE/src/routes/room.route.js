var express = require("express");
var router = express.Router();
const RoomController = require("../controller/room.controller");
const JwtMiddleware = require("../middleware/jwt.middleware");

router
  .route("/create-room")
  .get(JwtMiddleware.verifyToken, RoomController.createRoom);
router
  .route("/join-room")
  .get(JwtMiddleware.verifyToken, RoomController.joinRoom);
router
  .route("/start-room")
  .get(JwtMiddleware.verifyToken, RoomController.startRoom);

module.exports = router;
