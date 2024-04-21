var mongoose = require("mongoose");
const Joi = require("joi");
const Joigoose = require("joigoose")(mongoose, { convert: false });
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const joiUserSchema = Joi.object({
  username: Joi.string().pattern(new RegExp("^[a-z0-9]{10,30}$")).required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{6,30}$")).required(),
  fullName: Joi.string().required(),
  avatar: Joi.string().default(
    "https://www.sim.edu.vn/en/wp-content/uploads/2019/07/blank-avatar.jpg"
  ),
  email: Joi.string().email(),
});

var UserSchema = new Schema(Joigoose.convert(joiUserSchema), {
  collection: "user",
});

const UserModel = mongoose.model("user", UserSchema);

module.exports = { UserModel, joiUserSchema };
