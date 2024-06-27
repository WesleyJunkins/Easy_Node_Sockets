import express from "express";
import WebSocket, { WebSocketServer as SocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

// WebSocket Server Class
// A class for handling the basic functionality of a websocket server.
class ws_server {

    // Default constructor
    constructor(server_port, handlers) {
        this.server_port = server_port;
        this.handlers = handlers;
        const server = express().listen(this.server_port);
        this.wss = new SocketServer({ server });
        this.broadcastable = false;
        this.debugMode = false;
        this.listMode = false;
        if(this.debugMode === true) {
            console.log("[Server] Created a Web Socket server on port " + this.server_port + ".");
        };
        this.start_server(handlers);
        this.refreshID = uuidv4();
        this.clientList = [];
        this.serverID = {
            id: uuidv4(),
            port: server_port,
            numClients: 0
        };
        this.defaultHandlers = {
            "client_request_connect": (m) => {
                this.clientList.push(m.params);
                if(this.debugMode === true) {
                    console.log("[Server] A client connected.");
                };
                if(this.listMode === true) {
                    console.log("-----------------------------------");
                    console.log("----------| Client List |----------");
                    console.log(this.clientList);
                    console.log("-----------------------------------");
                    console.log("-----------------------------------");
                };

                // Accept the connection
                this.serverID.numClients++;
                this.broadcast_message("server_accepted_connect", { id: this.serverID.id, port: this.serverID.port, numClients: this.serverID.numClients, sendToUUID: m.params.id, firstRefreshID: this.refreshID });
            },
            "client_return_probe": (m) => {
                const updateClientIndex = this.clientList.findIndex(ele => ele.id == String((m.params.id).trim()));
                this.clientList[updateClientIndex].refreshID = this.refreshID;
            }
        };
    };

    // Server setup
    // Setup the server to listen on the specified port and pass in the handlers object.
    start_server = (handlers) => {
        this.handlers = handlers;

        // On client connected
        this.wss.on("connection", (ws) => {

            // How often to probe clients to clean client list
            setInterval(() => {
                this.probe_clients();
            }, 6200);

            // On client connection closed
            ws.on("close", () => {
                if(this.debugMode === true) {
                    console.log("[Server] A client disconnected.");
                };
            });

            // On message received from client
            // The data will come in as a JSON object file converted into a string. Parse that data into a JSON object. Then, send the object to be handled. Otherwise, alert that the message was not correctly formatted.
            // If broadcastable is set to true, then any message that comes to the server from any client will be broadcast to all other clients after being handled.
            ws.on("message", (message) => {
                try {
                    let m = JSON.parse(message);
                    this.handle_message(m);
                } catch (err) {
                    if(this.debugMode === true) {
                        console.log(err);
                        console.log("[Server] Message is not parseable to JSON.");
                    };
                };

                if (this.broadcastable == true) {
                    this.wss.clients.forEach(client => {
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
    handle_message = (m) => {
        if (m.method == undefined) {
            return;
        };

        let method = m.method;

        if (method) {
            if (this.handlers[method]) {
                let handler = this.handlers[method];
                handler(m);
            } else
                if (this.defaultHandlers[method]) {
                    let handler = this.defaultHandlers[method];
                    handler(m);
                } else {
                    if(this.debugMode === true) {
                        console.log("[Server] No handler defined for method " + method + ".");
                    };
                };
        };
    };

    // Broadcast JSON object to all clients
    // Given the desired method and parameters, package into a JSON object, stringify it, and send it to clients. 
    broadcast_message = (method, parameters) => {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(newMessage);
                if(this.debugMode === true) {
                    console.log("[Server] Message broadcast to clients: \n\t", newMessage);
                };
            } else {
                if(this.debugMode === true) {
                    console.log("[Server] Client did not receive message broadcast. Client readyState = CLOSED.");
                };
            };
        });
    };

    // Determines if broadcastable
    // If TRUE => message sent to server from one client will be broadcast to all other clients after being handled.
    // If FALSE => message will only be received by the server and will not be sent to the other clients.
    set_broadcastable = (broadcastable) => {
        this.broadcastable = broadcastable;
    };

    // Determines if server operates in debug mode
    // If TRUE => server messages will print to the server console.
    // If FALSE => server messages will not print to the console. The console will be blank unless manipulated by the user.
    set_debug_mode = (debugMode) => {
        this.debugMode = debugMode;
    };

    // Determines if server operates in list mode
    // If TRUE => server's client list will be printed upon client connected.
    // If FALSE => server's client list will never be printed.
    set_list_mode = (listMode) => {
        this.listMode = listMode
    }

    // Probe active clients
    // Sends a request to all clients. If a client does not respond, it is removed from the server's client list.
    // Goes through the client list and removes all clients whose refreshID does not match the previous refreshID.
    // Then, send out a new probe with the new refreshID that will be checked next time.
    probe_clients = () => {
        let somethingWasRemoved = false;
        for (let i = 0; i < this.clientList.length; i++) {
            if (this.clientList[i].refreshID != this.refreshID)  {
                this.clientList[i].warningNumber++;
                console.log("Warning number: ", this.clientList[i].warningNumber)
                console.log("Client ID:", this.clientList[i].id, "has refresh ID:", this.clientList[i].refreshID, "which does not match current refresh ID: ", this.refreshID)
                this.clientList.splice(i, 1);
                this.serverID.numClients--;
                somethingWasRemoved = true;
            };
        }
        this.refreshID = uuidv4();
        this.broadcast_message("server_probe", { refreshID: this.refreshID, id: this.serverID.id, port: this.serverID.port });
        if(somethingWasRemoved === true) {
            if(this.listMode === true) {
                console.log("SOMETHING REMOVED")
                console.log("-----------------------------------");
                console.log("----------| Client List |----------");
                console.log(this.clientList);
                console.log("-----------------------------------");
                console.log("-----------------------------------");
            };
        };
    };
};

export default ws_server;