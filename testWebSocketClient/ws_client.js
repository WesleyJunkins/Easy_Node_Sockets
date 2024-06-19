const Html5WebSocket = require("html5-websocket")
const ReconnectingWebSocket = require("reconnecting-websocket")

class ws_client {
    constructor(ws_host, ws_port, handlers) {
        this.ws_host = ws_host
        this.ws_port = ws_port
        this.handlers = handlers
        const options = { WebSocket: Html5WebSocket }
        this.rws = new ReconnectingWebSocket("ws://" + ws_host + ":" + ws_port + "/ws", undefined, options)
        this.rws.timeout = 1000

        //What to do when a connection is opened
        this.rws.addEventListener("open", () => {
            console.log("[Client] Connection to WebSocket Server was opened.")
        })

        //What to do when we receive a message
        this.rws.addEventListener("message", (e) => {
            // console.log("[Client] Received message: " + e.data)

            //If the message received is JSON parseable, then handle it. Otherwise, report an error
            try {
                let m = JSON.parse(e.data)
                this.handle_message(m)
            } catch (err) {
                console.log("[Client] Message is not parseable to JSON.")
            }
        })

        //What to do when the server is closed
        this.rws.addEventListener("close", () => {
            console.log("[Client] Connection closed. Reconnecting...")
        })

        // What to do when we get an error
        this.rws.addEventListener("error", (err) => {
            console.error("[Client] Error:", err);
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
                let handler = this.handlers[method]
                handler(m)
            } else {
                console.log("[Client] No handler defined for method " + method + ".")
            }
        }
    }

    // Send a JSON object to the server
    send_message(method, parameters) {
        let newMessage = {
            method: method,
            params: parameters
        };

        this.rws.send(JSON.stringify(newMessage))

        console.log("[Client] Message sent to server.")
    }
}





























// TESTING THESE CLASSES


//Handlers for handling specific messages
let handlers = {
    "set-background-color": function (m) {
        console.log("[Client] Set background color to " + m.params.color + ".")
    },
    "say": function (m) {
        console.log(m.params.text)
    }
}

const myNewClient = new ws_client("localhost", 3000, handlers)

//Testing broadcasting messages. This has a 10 second delay from when you run ws_server
setTimeout(() => {
    myNewClient.send_message("say", {text: "Hey! This is a new message from the client. I waited 5 seconds."})
}, 5000);