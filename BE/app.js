const express = require("express");
const app = express();
const server = require("http").Server(app);
// const io = require("socket.io")(server);
var path = require("path");
var cookieParser = require("cookie-parser");
const morgan = require("morgan");
var createError = require("http-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("../server/src/configs/db.config");

const registerRouter = require("./src/routes/register.route");
const loginRouter = require("./src/routes/login.route");
const userRouter = require("./src/routes/user.route");
const roomRouter = require("./src/routes/room.route");

const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.send("Hello World");
});
app.get("/gomeet/api/test", async function (req, res) {
  const ownerSocketId = await RoomServices.getOwnerSocketId(
    "123123123",
    "654368eb57267423a1e10e25"
  );
  console.log(ownerSocketId);
  res.send("hello");
});

//routes
const baseUrlApi = "/gomeet/api";
app.use(baseUrlApi + "/register", registerRouter);
app.use(baseUrlApi + "/login", loginRouter);
app.use(baseUrlApi + "/user", userRouter);
app.use(baseUrlApi + "/room", roomRouter);
// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error");
  res.json({
    status: err.status,
    message: err.message,
  });
});
app.get("/gomeet/api/chat-room", async function (req, res) {
  // const time = moment().format("h:mm a");
  const { roomId, senderId, msg, fullName } = req.query;
  // console.log(roomId," ",senderId," ",msg," ",fullName," ",time);
  const existsChatRoom = await ChatServices.findChatRoom(roomId);
  console.log(existsChatRoom);
  let chatRoom = "";
  if (existsChatRoom) {
    console.log("Chat room already exists");
    chatRoom = await ChatServices.addMessageIntoRoom(
      roomId,
      msg,
      senderId,
      fullName
    );
  } else {
    console.log("Chat room is not exists");
    chatRoom = await ChatServices.newChatRoom(roomId);
    await ChatServices.addMessageIntoRoom(roomId, msg, senderId, fullName);
  }
  console.log(chatRoom);
  const currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1;
  var year = currentDate.getFullYear();
  var formattedDate = day + "/" + month + "/" + year;
  console.log(formattedDate);
  // Hiển thị thời gian trong định dạng HH:mm:ss
  var hours = currentDate.getHours();
  var minutes = currentDate.getMinutes();
  var formattedTime = hours + ":" + minutes;
  console.log(formattedTime);
  res.send("hello");
});
const RoomServices = require("./src/services/room.services");
const ChatServices = require("./src/services/chat.services");
const moment = require("moment");
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const roomBoard = {};

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("newRoom", async (payload) => {
    const roomId = payload.room;
    const owner = payload.owner;
    const fullName = payload.fullName;
    const avatar = payload.avatar;
    const room = await RoomServices.newRoom(roomId, owner);

    socket.join(roomId);
    await RoomServices.addNewUserToRoom(
      socket.id,
      roomId,
      owner,
      fullName,
      avatar
    );

    socket.emit("room_created", {
      room: room,
      roomId: roomId,
      peerId: socket.id,
      fullName: fullName,
      avatar: avatar,
    });
  });
  socket.on("owner_join", async (payload) => {
    const roomId = payload.room;
    const userId = payload.userId;
    const fullName = payload.fullName;
    const avatar = payload.avatar;

    socket.join(roomId);
    const room = await RoomServices.addNewUserToRoom(
      socket.id,
      roomId,
      userId,
      fullName,
      avatar
    );

    socket.emit("room_created", {
      room: room,
      roomId: roomId,
      peerId: socket.id,
      fullName: fullName,
      avatar: avatar,
    });
  });

  socket.on("ask_to_join", async (payload) => {
    const roomId = payload.room;
    const roomClient = io.sockets.adapter.rooms.get(roomId) || { length: 0 };
    const numberOfClients = roomClient.size || roomClient.length;

    if (numberOfClients > 0) {
      console.log(`Room ${roomId} exists. Joining room ${roomId}`);

      const userId = payload.userId;
      const fullName = payload.fullName;
      const avatar = payload.avatar;
      const owner = payload.owner;
      console.log(`OwnerId: ${owner}`);
      const ownerSocketId = await RoomServices.getOwnerSocketId(roomId, owner);
      console.log("ownerSocketId: " + ownerSocketId.socketId);
      socket.to(ownerSocketId.socketId).emit("ask_to_join", {
        roomId: roomId,
        peerId: socket.id,
        userId: userId,
        fullName: fullName,
        avatar: avatar,
      });
    }
  });
  socket.on("reject_join", (payload) => {
    //socket id of the sender of the join request
    const senderSocketId = payload.socketId;
    // Emit to the sender only
    console.log("Reject join to senderId: " + senderSocketId);
    socket.to(senderSocketId).emit("reject_join", {
      msg: "Request denied",
    });
  });
  socket.on("accept_join", (payload) => {
    //socket id of the sender of the join request
    const senderSocketId = payload.socketId;
    // Emit to the sender only
    console.log("Accept join to senderId: " + senderSocketId);
    socket.to(senderSocketId).emit("accept_join", {
      msg: "Accepted",
    });
  });
  socket.on("join", async (payload) => {
    const roomId = payload.room;
    const roomClient = io.sockets.adapter.rooms.get(roomId) || { length: 0 };
    const numberOfClients = roomClient.size || roomClient.length;
    // Emit to the sender only
    if (numberOfClients > 0) {
      console.log(`Room ${roomId} exists. Joining room ${roomId}`);
      socket.join(roomId);

      const userId = payload.userId;
      const fullName = payload.fullName;
      const avatar = payload.avatar;
      const room = await RoomServices.addNewUserToRoom(
        socket.id,
        roomId,
        userId,
        fullName,
        avatar
      );
      socket.emit("room_joined", {
        room: room,
        roomId: roomId,
        peerId: socket.id,
        fullName: fullName,
        avatar: avatar,
      });
    }
  });

  // socket.on("message", async (payload) => {
  //   const senderId = payload.senderId;
  //   const roomId = payload.roomId;
  //   const msg = payload.msg;
  //   const fullName = payload.fullName;
  //   console.log(
  //     `Sending message in room ${roomId} from ${senderId} to ${roomId}`
  //   );

  //   const existsChatRoom = await ChatServices.findChatRoom(roomId);
  //   var currentDate = new Date();
  //   let chatRoom = "";
  //   if (existsChatRoom) {
  //     chatRoom = await ChatServices.addMessageIntoRoom(
  //       roomId,
  //       msg,
  //       senderId,
  //       fullName,
  //       currentDate
  //     );
  //   } else {
  //     await ChatServices.newChatRoom(roomId);
  //     chatRoom = await ChatServices.addMessageIntoRoom(
  //       roomId,
  //       msg,
  //       senderId,
  //       fullName,
  //       currentDate
  //     );
  //   }

  //   // Hiển thị ngày tháng năm và thời gian theo định dạng dd/MM/YYYY HH:mm
  //   var day = currentDate.getDate();
  //   var month = currentDate.getMonth() + 1;
  //   var year = currentDate.getFullYear();
  //   var hours = currentDate.getHours();
  //   var minutes = currentDate.getMinutes();
  //   var formattedDate =
  //     day + "/" + month + "/" + year + " " + hours + ":" + minutes;
  //   console.log(formattedDate);

  //   socket.to(roomId).emit("message", {
  //     msg: msg,
  //     senderId: senderId,
  //     roomId: roomId,
  //     fullName: fullName,
  //     dateTime: formattedDate,
  //   });
  // });

  //emit to all socket in room except sender (broadcast)
  socket.on("start_call", async (payload) => {
    console.log(
      "Broadcasting start_call event to peers in room " + payload.roomId
    );
    socket.broadcast.to(payload.roomId).emit("start_call", {
      senderId: payload.senderId,
      name: payload.name,
    });
    socket.broadcast.to(payload.roomId).emit("start_share", {
      senderId: payload.senderId,
    });
    const roomParticipants = await RoomServices.getParticipantsInRoom(
      payload.roomId
    );
    io.to(payload.roomId).emit("update_participants", {
      roomParticipants,
    });
  });

  socket.on("start_share", (payload) => {
    console.log("Broadcasting start_share event to peers in room " + roomId);
    socket.broadcast.to(payload.roomId).emit("start_share", {
      senderId: payload.senderId,
    });
  });

  //Event emit only one peer received
  socket.on("webrtc_offer", (payload) => {
    console.log(
      `Sending offer in room ${payload.roomId} from ${payload.senderId} to ${payload.receiverId}`
    );

    socket.broadcast.to(payload.receiverId).emit("webrtc_offer", {
      sdp: payload.sdp,
      senderId: payload.senderId,
      name: payload.name,
    });
  });

  socket.on("webrtc_answer", (payload) => {
    console.log(
      `Sending answer in room ${payload.roomId} from ${payload.senderId} to ${payload.receiverId}`
    );
    socket.broadcast.to(payload.receiverId).emit("webrtc_answer", {
      sdp: payload.sdp,
      senderId: payload.senderId,
    });
  });

  socket.on("webrtc_ice_candidate", (payload) => {
    console.log(
      `Sending ice candidate in room ${payload.roomId} from ${payload.senderId} to ${payload.receiverId}`
    );
    socket.broadcast
      .to(payload.receiverId)
      .emit("webrtc_ice_candidate", payload);
  });

  socket.on("toggleMicrophone", (payload) => {
    // console.log(
    //   `Get Toggle Microphone in room ${roomId} from ${payload.peerUUID}`
    // );
    socket.broadcast.to(payload.roomId).emit("toggleMicrophone", {
      senderId: payload.peerUUID,
      audioTrack: payload.audioTrack,
    });
  });

  socket.on("toggleCamera", (payload) => {
    // console.log(`Get Toggle Camera in room ${roomId} from ${payload.peerUUID}`);
    socket.broadcast.to(payload.roomId).emit("toggleCamera", {
      senderId: payload.peerUUID,
      videoTrack: payload.videoTrack,
    });
  });

  socket.on("webrtc_offer_sharescreeen", (payload) => {
    console.log(
      `Sending offer in room ${payload.roomId} from ${payload.senderId}`
    );
    socket.broadcast.to(payload.receiverId).emit("webrtc_offer_sharescreeen", {
      sdp: payload.sdp,
      senderId: payload.senderId,
      name: payload.name,
    });
  });

  socket.on("webrtc_answer_sharescreen", (payload) => {
    console.log(
      `Sending answer in room ${payload.roomId} from ${payload.senderId} to ${payload.receiverId}`
    );
    socket.broadcast.to(payload.receiverId).emit("webrtc_answer_sharescreen", {
      sdp: payload.sdp,
      senderId: payload.senderId,
      receiverId: payload.receiverId,
    });
  });

  socket.on("webrtc_ice_candidate_sharescreen", (payload) => {
    console.log(
      `Sending ice candidate in room ${payload.roomId} from ${payload.senderId}`
    );
    socket.broadcast
      .to(payload.receiverId)
      .emit("webrtc_ice_candidate_sharescreen", payload);
  });

  socket.on("webrtc_toggle_sharescreen", (payload) => {
    console.log(`Sending toggle screen in room ${payload.roomId}`);
    socket.broadcast.to(payload.roomId).emit("webrtc_toggle_sharescreen", {
      senderId: payload.senderId,
    });
  });

  socket.on("changePermissionToolInRoom", (payload) => {
    const roomId = payload.roomId;
    const typeofTool = payload.typeofTool;
    const permission = payload.permission; //true is allow, false is not allow
    const senderId = payload.senderId;

    const isUpdatePermission = RoomServices.changePermissionUseTool(
      roomId,
      typeofTool,
      permission
    );
    if (isUpdatePermission) {
      socket.broadcast.to(roomId).emit("changePermissionToolInRoom", {
        typeofTool,
        permission,
        senderId,
      });
    }
  });

  socket.on("raisehand", (payload) => {
    const roomId = payload.roomId;
    const peerId = payload.peerId;
    const name = payload.name;
    io.to(roomId).emit("raisehand", {
      peerId: peerId,
      name: name,
    });
  });

  socket.on("message", (payload) => {
    const roomId = payload.roomId;
    const peerId = payload.peerId;
    const name = payload.name;
    const formatTime = payload.formatTime;
    const message = payload.message;
    io.to(roomId).emit("message", {
      peerId: peerId,
      name: name,
      message: message,
      formatTime,
    });
  });

  socket.on("webrtc_disconnect", async (payload) => {
    const roomId = payload.roomId;
    const senderId = payload.senderId;
    await RoomServices.removeUserFromRoom(roomId, senderId);
    // if (isRemove) {
    socket.broadcast.to(roomId).emit("webrtc_disconnect", {
      senderId: senderId,
    });
    // }
  });

  socket.on("webrtc_disconnect_owner", async (payload) => {
    const roomId = payload.roomId;
    await RoomServices.removeAllUserFromRoom(roomId);
    socket.broadcast.to(roomId).emit("webrtc_disconnect_owner");
  });

  socket.on("draw", (newx, newy, prevx, prevy, color, size, roomId) => {
    socket.broadcast
      .to(roomId)
      .emit("draw", newx, newy, prevx, prevy, color, size);
  });

  socket.on("store canvas", (payload) => {
    roomBoard[payload.roomId] = payload.url;
  });

  socket.on("getCanvas", (payload) => {
    if (roomBoard[payload.roomId])
      socket.emit("getCanvas", roomBoard[payload.roomId]);
  });

  socket.on("clearBoard", (payload) => {
    socket.broadcast.to(payload.roomId).emit("clearBoard");
  });
});

server.listen(port, "localhost", () => {
  console.log("Server is running at http://localhost:3000/");
});

// server.listen(port, process.env.NETWORK, () => {
//   console.log("Server is running at http://" + process.env.NETWORK+":3000/");
// });
