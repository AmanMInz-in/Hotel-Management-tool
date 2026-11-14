"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

type CustomSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let sharedSocket: CustomSocket | null = null;

export function useSocket(room?: string) {
  const socketRef = useRef<CustomSocket | null>(null);

  useEffect(() => {
    if (!sharedSocket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
      sharedSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = sharedSocket;

    if (room && sharedSocket) {
      sharedSocket.emit("join:room", room);
    }

    return () => {
      if (room && sharedSocket) {
        sharedSocket.emit("leave:room", room);
      }
    };
  }, [room]);

  return sharedSocket;
}
