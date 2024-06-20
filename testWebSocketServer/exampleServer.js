import ws_server from "./ws_server.mjs";

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

const timer = setInterval(function () {
    myNewServer.broadcast_message("say", { text: "This was broadcast from the server. The next one happens in 5secs." })
}, 5000);