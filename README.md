A simple client and server class for interacting via web sockets in Node.js.

Getting Started:

This repo contains two folders (server and client), each containing the class file (ws_server.mjs and ws_client.mjs) and an example file (exampleServer.js and exampleClient.js). To get started using the example files, download the specific folder for your needs.
The server can connect to multiple clients, while the client can only connect to one server.
Communication from client-to-client is possible only if the server is set to be broadcastable (more on this later).

After downloading the folder. Open it in terminal window and run:

npm install

Next, run

node exampleServer.js

to start the server.
Then, run

node exampleClient.js

in the directory or machine that contains the client application.


Example Code Explanation:

First, take a look at exampleServer.js

'''
import ws_server from "./ws_server.mjs";

let handlers = {
    "set-background-color": function (m) {
        console.log("[Server] Set background color to " + m.params.color + ".")
    },
    "say": function (m) {
        console.log(m.params.text)
    }
}

const myNewServer = new ws_server(3000, handlers);

setInterval(function () {
    myNewServer.broadcast_message("say", { text: "This was broadcast from the server. The next one happens in 5secs." })
}, 5000);
'''

1. First, you need to import the class file.
