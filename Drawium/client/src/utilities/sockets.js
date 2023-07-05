import React from "react";
import io from "socket.io-client";

export const socket = io('https://www.drawium.lol', {
    path: '/socket'
});
export const SocketContext = React.createContext();