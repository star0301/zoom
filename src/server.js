import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
// Any URL will be redirected to "/"
app.use("/*", (_, res) => res.redirect("/"));

//Create server -> http & SocketIO
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    //Admin pannel on below URL.
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

httpServer.listen(3005, () => console.log("Server is Listening ... !!"));

// How many rooms are opened.
function publicRoom() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRoomLists = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRoomLists.push(key);
  });
  return publicRoomLists;
}

// Counting users in a specific room.
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_list_change", publicRoom());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_list_change", publicRoom());
  });

  socket.on("message", (msg, room, done) => {
    socket.to(room).emit("message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname, done) => {
    socket["nickname"] = nickname;
    done();
  });
});
