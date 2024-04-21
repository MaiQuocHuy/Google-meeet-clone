const RoomController = {};
const RoomServices = require("../services/room.services");

RoomController.createRoom = async (req, res, next) => {
  try {
    const decodeToken = req.value.decode;
    const { roomId } = req.query;
    let room = await RoomServices.newRoom(roomId, decodeToken.userID);

    res
      .status(200)
      .send({ msg: "Create room successful", roomId: room.roomId });
  } catch (error) {
    next(error);
  }
};

RoomController.joinRoom = async (req, res, next) => {
  try {
    const roomId = req.query.roomid;
    const decodeToken = req.value.decode;

    const room = await RoomServices.findRoom(roomId);
    const isRoomOwner = await RoomServices.checkRoomOwner(
      roomId,
      decodeToken.userID
    );
    const roomParticipants = await RoomServices.getParticipantsInRoom(roomId);

    res.status(200).send({
      msg: "Verify successful",
      userInfo: decodeToken,
      owner: room.owner,
      isRoomOwner: isRoomOwner,
      roomParticipants,
    });
  } catch (error) {
    next(error);
  }
};

RoomController.startRoom = async (req, res, next) => {
  try {
    res.status(200).send({
      msg: "Verify successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = RoomController;
