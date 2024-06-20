import Html5WebSocket from "html5-websocket";
import ReconnectingWebSocket from "reconnecting-websocket";
import { v4 as uuidv4 } from "uuid";

class ws_client {

    // Default constructor
    constructor(ws_host, ws_port, handlers) {
        this.ws_host = ws_host;
        this.ws_port = ws_port;
        this.handlers = handlers;
        const options = { WebSocket: Html5WebSocket };
        this.rws = new ReconnectingWebSocket("ws://" + ws_host + ":" + ws_port + "/ws", undefined, options);
        this.rws.timeout = 100;
        this.clientID = {
            id: uuidv4(),
            host: ws_host,
            port: ws_port,
        };
        this.defaultHandlers = {
            "server_accepted_connect": (m) => {
                if (m.params.sendToUUID == this.clientID.id) {
                    console.log("[Client] Connection to WebSocket Server was opened.");
                    console.log("----------| Server Info |----------");
                    console.log("uuid:", m.params.id);
                    console.log("port:", m.params.port);
                    console.log("current clients:", m.params.numClients)
                    console.log("-----------------------------------");
                };
            }
        };

        // On connection opened
        this.rws.addEventListener("open", () => {
            this.send_message("client_request_connect", this.clientID)
        });

        // On message received from server
        // The data will come in as a JSON object file converted into a string. Parse that data into a JSON object. Then, send the object to be handled. Otherwise, alert that the message was not correctly formatted.
        this.rws.addEventListener("message", (e) => {
            try {
                let m = JSON.parse(e.data);
                this.handle_message(m);
            } catch (err) {
                console.log("[Client] Message is not parseable to JSON.");
            };
        });

        // On server connection closed
        // Try to reconnect based on the timeout settings.
        this.rws.addEventListener("close", () => {
            console.log("[Client] Connection closed. Reconnecting...");
        });

        // On server connection down (not temporary)
        // Alert that the server is down completely. No reconnecting.
        this.rws.onerror = (err) => {
            if (err.code == "EHOSTDOWN") {
                console.log("[Client] ERROR: Server is down.");
            };
        };
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
            } else
                if (this.defaultHandlers[method]) {
                    let handler = this.defaultHandlers[method];
                    handler(m);
                } else {
                    console.log("[Client] No handler defined for method " + method + ".");
                };
        };
    };

    // Send JSON object to server
    // Given the desired method and parameters, package into a JSON object, stringify it, and send it to the server. 
    send_message(method, parameters) {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.rws.send(newMessage);
        console.log("[Client] Message sent to server: \n\t", newMessage);
    };
};

export default ws_client;