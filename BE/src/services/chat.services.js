const ChatServices = {};
const { ChatModel } = require("../model/chat.model");
const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

ChatServices.findChatRoom = async (roomId) => {
  try {
    const chatRoom = await ChatModel.findOne({ roomId: roomId });
    // if (!chatRoom) throw createError.NotFound("Chat Room not found.");
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

ChatServices.newChatRoom = async (roomId) => {
  try {
    const chatRoom = new ChatModel({ roomId: roomId });
    await chatRoom.save();
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

ChatServices.addMessageIntoRoom = async (
  roomId,
  message,
  userId,
  fullName,
  time
) => {
  try {
    const chatRoom = await ChatServices.findChatRoom(roomId);
    chatRoom.roomMessage.push({
      userID: userId,
      fullName: fullName,
      time: time,
      message: message,
    });
    await chatRoom.save();
    return chatRoom;
  } catch (error) {
    throw error;
  }
};

module.exports = ChatServices;