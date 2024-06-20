import ws_client from './ws_client.mjs';

// TESTING CLIENT CLASS

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

const timer = setInterval(function () {
    myNewClient.send_message("say", { text: "This was broadcast from the client. The next one happens in 6secs." })
}, 6000);