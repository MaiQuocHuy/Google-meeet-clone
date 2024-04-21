const RoomServices = {};
const { RoomModel } = require("../model/room.model");
const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const { constRoom } = require("../configs/constant");

// socketRoom: [{ socketId: socket.id, socketName: username, micSocket: 'on', videoSocket: 'on' }]
RoomServices.newRoom = async (roomId, owner) => {
  try {
    const room = new RoomModel({ owner: owner, roomId: roomId });
    await room.save();
    return room;
  } catch (error) {
    throw error;
  }
};

RoomServices.findRoom = async (roomId) => {
  try {
    const room = await RoomModel.findOne({ roomId: roomId });
    if (!room) throw createError.NotFound("Room not found.");
    return room;
  } catch (error) {
    throw error;
  }
};

RoomServices.checkRoomOwner = async (roomId, userId) => {
  try {
    const room = await RoomModel.findOne({
      owner: new ObjectId(userId),
      roomId: roomId,
    });
    if (room) {
      return true; // true is owner
    } else {
      return false; // false is not owner
    }
  } catch (error) {
    throw error;
  }
};

RoomServices.addNewUserToRoom = async (
  socketid,
  roomId,
  userId,
  fullName,
  avatar
) => {
  const room = await RoomServices.findRoom(roomId);
  room.socketsRoom.push({
    socketId: socketid,
    micSocket: "on",
    videoSocket: "on",
    userId: userId,
    fullName: fullName,
    avatar: avatar,
  });
  await room.save();
  return room;
};

RoomServices.getOwnerSocketId = async (roomId, owner) => {
  try {
    const room = await RoomModel.aggregate([
      { $match: { roomId: roomId } },
      { $unwind: "$socketsRoom" }, // Tách mỗi phần tử của mảng thành các documents riêng biệt
      { $match: { "socketsRoom.userId": owner } },
      {
        $project: {
          _id: 0, // Ẩn field _id
          socketsRoom: 1, // Chỉ hiển thị field socketsRoom
        },
      },
    ]);

    if (room.length > 0) {
      const matchingSocket = room[0].socketsRoom;

      console.log("Service Room" + JSON.stringify(matchingSocket, null, 2));
      // Xử lý logic của bạn với matchingSocket
      return matchingSocket;
    } else {
      // Xử lý khi không tìm thấy matchingSocket
      return null;
    }
  } catch (error) {
    throw error;
  }
};

RoomServices.changePermissionUseTool = async (
  roomId,
  typeofTool,
  permission
) => {
  try {
    const room = await RoomServices.findRoom(roomId);
    if (constRoom.MICROPHONE == typeofTool) {
      room.permissionMicrophone = permission;
    } else if ((constRoom.VIDEO = typeofTool)) {
      room.permissionVideo = permission;
    } else if ((constRoom.SHARE_SCREEN = typeofTool)) {
      room.permissionShareScreen = permission;
    } else if ((constRoom.CHAT = typeofTool)) {
      room.permissionChat = permission;
    }
    await room.save();
    return true;
  } catch (error) {
    throw error;
  }
};

RoomServices.getParticipantsInRoom = async (roomId) => {
  try {
    const room = await RoomServices.findRoom(roomId);
    return room.socketsRoom;
  } catch (error) {
    throw error;
  }
};

RoomServices.removeUserFromRoom = async (roomId, socketId) => {
  try {
    const room = await RoomServices.findRoom(roomId);
    const index = room.socketsRoom.findIndex(
      (socket) => socket.socketId === socketId
    );
    if (index !== -1) {
      room.socketsRoom.splice(index, 1);
    }
    await room.save();
    console.log(room);
    return room;
  } catch (error) {
    throw error;
  }
};

RoomServices.removeAllUserFromRoom = async (roomId) => {
  try {
    const room = await RoomServices.findRoom(roomId);
    room.socketsRoom = [];
    await room.save();
    return room;
  } catch (error) {
    throw error;
  }
};

module.exports = RoomServices;
