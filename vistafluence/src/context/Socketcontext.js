import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const SOCKET_URL = "https://vistafluenceapp.onrender.com/";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children, userId }) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("join", userId);
      console.log("🔌 Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Socket disconnected");
    });

    s.on("online_users", (users) => setOnlineUsers(users || []));

    s.on("connect_error", (err) => {
      console.log("SOCKET CONNECT ERROR:", err.message);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}