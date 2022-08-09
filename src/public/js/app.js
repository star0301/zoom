const socket = io();

const roomDiv = document.getElementById("room");
const roomForm = document.getElementById("welcome");
const msgForm = document.getElementById("msg");
const nameForm = document.getElementById("nickname");

let roomName;

roomForm.hidden = true;
msgForm.hidden = true;

function nameSubmit(e) {
  e.preventDefault();
  const input = nameForm.querySelector("#nickname input");
  const nickName = input.value;
  socket.emit("nickname", nickName, () => {
    msgForm.hidden = true;
    nameForm.hidden = true;
    roomForm.hidden = false;
  });
}

function roomSubmit(e) {
  e.preventDefault();
  const input = roomDiv.querySelector("#welcome input");
  roomName = input.value;
  socket.emit("enter_room", roomName, () => {
    roomForm.hidden = true;
    nameForm.hidden = true;
    msgForm.hidden = false;
    const h3 = roomDiv.querySelector("h3");
    h3.innerText = `Room: ${roomName}`;
  });
  input.value = "";
}

function msgSubmit(e) {
  e.preventDefault();
  const input = msgForm.querySelector("#msg input");
  const value = input.value;
  socket.emit("message", value, roomName, () => {
    addMsg(`You: ${value}`);
  });
  input.value = "";
}

function addMsg(msg) {
  const ul = roomDiv.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
}

socket.on("welcome", (user, newCount) => {
  const h3 = roomDiv.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMsg(`${user} enter the room...`);
});

socket.on("bye", (user, newCount) => {
  const h3 = roomDiv.querySelector("h3");
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMsg(`${user} has left the room...`);
});

socket.on("message", (msg) => {
  addMsg(msg);
});

socket.on("room_list_change", (rooms) => {
  const roomList = document.querySelector("#roomList ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

nameForm.addEventListener("submit", nameSubmit);
roomForm.addEventListener("submit", roomSubmit);
msgForm.addEventListener("submit", msgSubmit);
