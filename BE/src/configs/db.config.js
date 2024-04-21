const mongoose = require("mongoose");
// const dbName = "GoMeet";
const uri =
  "mongodb+srv://dungnguyen:6rIAkMEf6LayFHP1@cluster0.e9gfx9r.mongodb.net/GoMeet?retryWrites=true&w=majority";

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(uri, connectionParams)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
  });

module.exports = mongoose;
