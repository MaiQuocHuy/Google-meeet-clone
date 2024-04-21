var mongoose = require("mongoose");
const Joi = require("joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const joiChatSchema = Joi.object({
  roomId: Joi.string().required(),
  roomMessage: Joi.array().items(
    Joi.object({
      userID: Joi.string().required(),
      fullName: Joi.string().required(),
      time: Joi.date().default(Date.now),
      message: Joi.string().default(" "),
    })
  ),
});

var ChatSchema = new Schema(Joigoose.convert(joiChatSchema), {
  collection: "chat",
});

//path
ChatSchema.path("userID", Schema.Types.ObjectId);
ChatSchema.path("userID").ref("user");

ChatSchema.path("roomID", Schema.Types.ObjectId);
ChatSchema.path("roomID").ref("room");

const ChatModel = mongoose.model("chat", ChatSchema);

module.exports = {ChatModel,joiChatSchema};
