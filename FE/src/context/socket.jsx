import { createContext, useContext, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = io.connect("http://localhost:3000");

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

const useSocket = () => useContext(SocketContext);
export { useSocket, SocketProvider };
