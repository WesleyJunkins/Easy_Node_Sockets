const express = require("express");
const WebSocket = require("ws");
const SocketServer = WebSocket.Server;

class ws_server {
    constructor(server_port, handlers) {
        this.server_port = server_port;
        const server = express().listen(this.server_port);
        this.wss = new SocketServer({ server });
        console.log("[Server] Created a Web Socket server on port " + this.server_port + ".");
        this.start_server(handlers)
    }

    // Setup the server to listen and wait for a message
    start_server(handlers) {
        this.handlers = handlers
        this.wss.on("connection", (ws) => {
            console.log("[Server] A client connected.");

            // What to do when the connection closes
            ws.on("close", () => {
                console.log("[Server] A client disconnected.");
            });

            // What to do when a WS message is received
            ws.on("message", (message) => {
                // console.log("[Server] Received message: %s", message);

                // If the message received is JSON parseable, then handle it. Otherwise, report an error
                try {
                    let m = JSON.parse(message);
                    this.handle_message(m);
                } catch (err) {
                    console.log("[Server] Message is not parseable to JSON.");
                }

                // Broadcast the message to everyone else who is connected to this WSS
                // They can also choose to JSON.parse the string message, or use it as a string
                this.wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            });
        });
    }

    // Method to handle incoming messages
    handle_message(m) {
        //Takes the method element of a JSON object and decides what to do with it
        //Goes through the list of handlers to see if there is a method already defined for it
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

    // Broadcast a JSON object to all clients
    broadcast_message(method, parameters) {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newMessage);
                console.log("[Server] Message broadcast to clients.")
            } else {
                console.log("[Server] Client did not receive message broadcast. Client readyState = CLOSED.")
            }
        });
    }
}































// TESTING THESE CLASSES

//Handlers for handling specific messages
let handlers = {
    "set-background-color": function (m) {
        console.log("[Server] Set background color to " + m.params.color + ".")
    },
    "say": function (m) {
        console.log(m.params.text)
    }
}

const myNewServer = new ws_server(3000, handlers);

//Testing broadcasting messages. This has a 10 second delay from when you run ws_server
setTimeout(() => {
    myNewServer.broadcast_message("set-background-color", {color: "blue"})
}, 10000);
