const Html5WebSocket = require("html5-websocket")
const ReconnectingWebSocket = require("reconnecting-websocket")

//Initialize websocket connection
let ws_host = "localhost"
let ws_port = "3000"
const options = {WebSocket: Html5WebSocket}
const rws = new ReconnectingWebSocket("ws://" + ws_host + ":" + ws_port + "/ws", undefined, options)
rws.timeout = 1000

//What to do when a connection is opened
rws.addEventListener("open", () => {
    console.log("[Client] Connection to WebSocket Server was opened.")
    rws.send("Hello, this is a message from a client.")
    rws.send(JSON.stringify({ //JSON RPC
        method: "set-background-color",
        params: {
            color: "blue"
        }
    }))
})

//What to do when we receive a message
rws.addEventListener("message", (e) => {
    console.log("[Client] Message received: " + e.data)

    //If the message received is JSON parseable, then handle it. Otherwise, report an error
    try {
        let m = JSON.parse(e.data)
        handleMessage(m)
    } catch(err) {
        console.log("[Client] Message is not parseable to JSON.")
    }
})

//What to do when the server is closed
rws.addEventListener("close", () => {
    console.log("[Client] Connection closed.")
})

//What to do when we get an error
rws.onerror = (err) => {
    if(err.code == "EHOSTDOWN") {
        //The server failed and is down
        console.log("[Client] Error: server is down.")
    }
}

//Handlers for handling specific messages
let handlers = {
    "set-background-color": function(m) {
        console.log("[Client] Set background color to " + m.params.color + ".")
    }
}

//Takes the method element of a JSON object and decides what to do with it
//Goes through the list of handlers to see if there is a method already defined for it
function handleMessage(m) {
    if(m.method == undefined) {
        return;
    }

    let method = m.method

    if(method) {
        if(handlers[method]) {
            let handler = handlers[method]
            handler(m)
        } else {
            console.log("[Client] No handler defined for method " + method + ".")
        }
    }
}