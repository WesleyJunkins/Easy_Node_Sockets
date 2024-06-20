import Html5WebSocket from "html5-websocket";
import ReconnectingWebSocket from "reconnecting-websocket";

class ws_client {
    constructor(ws_host, ws_port, handlers) {
        this.ws_host = ws_host
        this.ws_port = ws_port
        this.handlers = handlers
        const options = { WebSocket: Html5WebSocket }
        this.rws = new ReconnectingWebSocket("ws://" + ws_host + ":" + ws_port + "/ws", undefined, options)
        this.rws.timeout = 100

        //What to do when a connection is opened
        this.rws.addEventListener("open", () => {
            console.log("[Client] Connection to WebSocket Server was opened.")
        })

        //What to do when we receive a message
        this.rws.addEventListener("message", (e) => {
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
        this.rws.onerror = (err) => {
            if (err.code == "EHOSTDOWN") {
                console.log("[Client] ERROR: Server is down.")
            }
        }
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
                console.log("[Client] No handler defined for method " + method + ".")
            }
        }
    }

    // Send a JSON object (Converted into a string) to the server
    send_message(method, parameters) {
        let newMessage = JSON.stringify({
            method: method,
            params: parameters
        });

        this.rws.send(newMessage)
        console.log("[Client] Message sent to server: \n\t", newMessage)
    }
}

export default ws_client;