import { io } from "socket.io-client";

const socket = io("wss://duckracegp.com", {
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  query: { EIO: 4 },
});

socket.on("connect", () => {
  console.log("Connected with SID:", socket.id);
  socket.emit("join_race_room", {});
});

export default socket;
