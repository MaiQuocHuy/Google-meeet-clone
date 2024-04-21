const mongoose = require("mongoose");

const yourSchema = new mongoose.Schema({
  name: String,
});

const user = mongoose.model("User", yourSchema);
const u = new user();
async function insert() {
  try {
    const data = await user.find({});
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { insert };
