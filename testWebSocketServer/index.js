//dependencies

const express = require ("express")
const WebSocket = require("ws")
const SocketServer = require("ws").Server

//Create a server and listen on port 3000 on localhost
const server = express().listen(3000)

//Create a Web Socket Server
const wss = new SocketServer({server})

//What the WSS should do when a connection is established
wss.on("connection", (ws) => {
    console.log("[Server] A client was connected.")

    //What to do when the connection closes
    ws.on("close", () => {
        console.log("[Server] Client disconnected.")
    })

    //What to do when a WS message is received
    ws.on("message", (message) =>{
        console.log("[Server] Received message: %s", message)

        //Broadcast the message to everyone else who is connected to this WSS
        wss.clients.forEach(function each(client) {
            if(client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    })
})