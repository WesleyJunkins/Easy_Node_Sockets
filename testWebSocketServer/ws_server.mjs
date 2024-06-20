import express from "express";
import WebSocket, { WebSocketServer as SocketServer } from "ws";

class ws_server {
    constructor(server_port, handlers) {
        this.server_port = server_port;
        this.handlers = handlers;
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
                // If the message received is JSON parseable, then handle it. Otherwise, report an error
                try {
                    let m = JSON.parse(message);
                    this.handle_message(m);
                } catch (err) {
                    console.log(err)
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
    //Takes the method element of a JSON object and decides what to do with it
    //Goes through the list of handlers to see if there is a method already defined for it
    handle_message(m) {
        if (m.method == undefined) {
            return;
        }

        let method = m.method

        if (method) {
            if (this.handlers[method]) {
                let handler = this.handlers[method]
                handler(m)
            } else {
                console.log("[Server] No handler defined for method " + method + ".")
            }
        }
    }

    // Broadcast a JSON objec (Converted to a string) to all clients
    broadcast_message(method, parameters) {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newMessage);
                console.log("[Server] Message broadcast to clients: \n\t", newMessage)
            } else {
                console.log("[Server] Client did not receive message broadcast. Client readyState = CLOSED.")
            }
        });
    }
}

export default ws_server;