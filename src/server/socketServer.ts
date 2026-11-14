import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";
import { SOCKET_ROOMS } from "./events";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | undefined;
}

export function initSocketServer(httpServer: NetServer) {
  if (global.io) {
    return global.io;
  }

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    // Automatically join default restaurant broadcast room
    socket.join(SOCKET_ROOMS.RESTAURANT);

    socket.on("join:room", (room: string) => {
      socket.join(room);
    });

    socket.on("leave:room", (room: string) => {
      socket.leave(room);
    });
  });

  global.io = io;
  return io;
}

export function getSocketIO() {
  return global.io;
}
