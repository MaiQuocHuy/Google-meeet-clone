var mongoose = require("mongoose");
const Joi = require("joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const joiRoomSchema = Joi.object({
  owner:Joi.string(),
  permissionMicrophone: Joi.number().integer().default(1), //0 is false, 1 is true
  permissionChat: Joi.number().integer().default(1),
  permissionShareScreen: Joi.number().integer().default(1),
  permissionVideo: Joi.number().integer().default(1),
  permissionAccessMeet: Joi.number().integer().default(1),
  roomId:Joi.string().required(),
  socketsRoom:Joi.array().items(
    Joi.object({
      socketId:Joi.string(),
      micSocket:Joi.string(),
      videoSocket:Joi.string(),
      userId:Joi.string(),
      fullName:Joi.string(),
      avatar:Joi.string()
    })
  )
});

var RoomSchema = new Schema(Joigoose.convert(joiRoomSchema), {
    collection: "room"
})

//path
RoomSchema.path('owner',Schema.Types.ObjectId)
RoomSchema.path('owner').ref('user')

const RoomModel = mongoose.model('room', RoomSchema);

module.exports={RoomModel,joiRoomSchema}