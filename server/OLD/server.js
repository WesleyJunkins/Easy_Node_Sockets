const express = require("express")
const WebSocket = require("ws")
const SocketServer = require("ws").Server

//Create a server and listen on port 3000 on localhost
var server_port = 3000
const server = express().listen(server_port)

//Create a Web Socket Server
const wss = new SocketServer({ server })
console.log("[Server] Created a Web Socket server on port " + server_port + ".")

//What the WSS should do when a connection is established
wss.on("connection", (ws) => {
    console.log("[Server] A client connected.")

    //What to do when the connection closes
    ws.on("close", () => {
        console.log("[Server] A client disconnected.")
    })

    //What to do when a WS message is received
    ws.on("message", (message) => {
        // console.log("[Server] Received message: %s", message)

        //If the message received is JSON parseable, then handle it. Otherwise, report an error
        try {
            let m = JSON.parse(message)
            handleMessage(m)
        } catch (err) {
            console.log("[Server] Message is not parseable to JSON.")
        }

        //Broadcast the message to everyone else who is connected to this WSS
        //They can also choose to JSON.parse the string message, or use it as a string
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    })
})

//Handlers for handling specific messages
let handlers = {
    "set-background-color": function (m) {
        console.log("[Server] Set background color to " + m.params.color + ".")
    },
    "say": function(m) {
        console.log(m.params.text)
    }
}

//Takes the method element of a JSON object and decides what to do with it
//Goes through the list of handlers to see if there is a method already defined for it
function handleMessage(m) {
    if (m.method == undefined) {
        return;
    }

    let method = m.method

    if (method) {
        if (handlers[method]) {
            let handler = handlers[method]
            handler(m)
        } else {
            console.log("[Server] No handler defined for method " + method + ".")
        }
    }
}