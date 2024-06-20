import express from "express";
import WebSocket, { WebSocketServer as SocketServer } from "ws";

// WebSocket Server Class
// A class for handling the basic functionality of a websocket server. This includes 
class ws_server {

    // Default constructor
    constructor(server_port, handlers) {
        this.server_port = server_port;
        this.handlers = handlers;
        const server = express().listen(this.server_port);
        this.wss = new SocketServer({ server });
        console.log("[Server] Created a Web Socket server on port " + this.server_port + ".");
        this.start_server(handlers);
        this.broadcastable = false;
    };

    // Server setup
    // Setup the server to listen on the specified port and pass in the handlers object.
    start_server(handlers) {
        this.handlers = handlers;

        // On client connected
        this.wss.on("connection", (ws) => {
            console.log("[Server] A client connected.");

            // On client connectioni closed
            ws.on("close", () => {
                console.log("[Server] A client disconnected.");
            });

            // On message received from client
            // The data will come in as a JSON object file converted into a string. Parse that data into a JSON object. Then, send the object to be handled. Otherwise, alert that the message was not correctly formatted.
            // If broadcastable is set to true, then any message that comes to the server from any client will be broadcast to all other clients after being handled.
            ws.on("message", (message) => {
                try {
                    let m = JSON.parse(message);
                    this.handle_message(m);
                } catch (err) {
                    console.log(err);
                    console.log("[Server] Message is not parseable to JSON.");
                };

                if (this.broadcastable == true) {
                    this.wss.clients.forEach(function each(client) {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(message);
                        };
                    });
                };
            });
        });
    };

    // Handle incoming messages
    // Extract the METHOD element from the JSON object message. If method is defined and exists in the HANDLERS object, then run the defined function from HANDLERS. Otherwise, alert that the method is either undefined or is not in the HANDLERS object.
    handle_message(m) {
        if (m.method == undefined) {
            return;
        };      

        let method = m.method;

        if (method) {
            if (this.handlers[method]) {
                let handler = this.handlers[method];
                handler(m);
            } else {
                console.log("[Server] No handler defined for method " + method + ".");
            };
        };
    };

    // Broadcast JSON object to all clients
    // Given the desired method and parameters, package into a JSON object, stringify it, and send it to clients. 
    broadcast_message(method, parameters) {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newMessage);
                console.log("[Server] Message broadcast to clients: \n\t", newMessage);
            } else {
                console.log("[Server] Client did not receive message broadcast. Client readyState = CLOSED.");
            };
        });
    };

    // Determines if broadcastable
    // If TRUE => message sent to server from one client will be broadcast to all other clients after being handled.
    // If FALSE => message will only be received by the server and will not be sent to the other clients.
    set_broadcastable(broadcast) {
        if (broadcast == true) {
            this.broadcastable = true
        } else {
            this.broadcastable = false
        };
    };
};

export default ws_server;