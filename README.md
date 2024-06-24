A simple client and server class for interacting via websockets in Node.js.

# Getting Started

This repo contains two folders (server and client), each containing the class file (ws_server.mjs and ws_client.mjs) and an example file (exampleServer.js and exampleClient.js). To get started using the example files, download the specific folder for your needs.
The server can connect to multiple clients, while the client can only connect to one server.
Communication from client-to-client is possible only if the server is set to be broadcastable (more on this later).

After downloading the folder. Open it in terminal window and run:

```
npm install
```

Next, run

```
node exampleServer.js
```

to start the server.
Then, run

```
node exampleClient.js
```

in the directory or machine that contains the client application.

# Example Code Explanation
## Server

First, take a look at exampleServer.js

```
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
```

1. First, you need to import the class file.

```
import ws_server from "./ws_server.mjs";
```

2. In order to define the functions we will be passing back and forth, we need to create a handler object.
   This object simply holds the name of the function, and the code you would like to run when the function is called.
   The "m" function argument is the parameter list of the JSON object you pass in (more on this later).

```
let handlers = {
    "set-background-color": function (m) {
        console.log("[Server] Set background color to " + m.params.color + ".")
    },
    "say": function (m) {
        console.log(m.params.text)
    }
}
```

3. Now, we are ready to create the server.
   We pass in two arguments (port number and the handlers object we just created.

```
const myNewServer = new ws_server(3000, handlers);
```

4. To test our server, we will broadcast a message to all clients who are connected. This message is broadcast every 5 seconds.
   When you broadcast a message, you are talking to all currently connected clients.
   The message must be structured in a certain way. First, pass in the name of the method you would like to run (Whichever method you specify must be included in either the client's handler object or the default handler object (more on the default handler object later). Next, you pass in the parameter list. Unless using the default handler methods (discussed later) it is up to you to define and keep-up with the parameters for any method. For example, the method "say" is defined in the handler object to write a parameter called "text" to the console. Therefore, when you broadcast a message calling the function "say", you must also send "text" as a parameter, even if it is blank.

```
setInterval(function () {
    myNewServer.broadcast_message("say", { text: "This was broadcast from the server. The next one happens in 5secs." })
}, 5000);
```

## Client

Now that the server is running, we can start the client code.
Look at the exampleClient.js file.

```
import ws_client from './ws_client.mjs';

let handlers = {
    "set-background-color": function (m) {
        console.log("[Client] Set background color to " + m.params.color + ".")
    },
    "say": function (m) {
        console.log(m.params.text)
    }
}

const myNewClient = new ws_client("localhost", 3000, handlers)

setInterval(function () {
    myNewClient.send_message("say", { text: "This was broadcast from the client. The next one happens in 6secs." })
}, 6000);
```

1. Again, we need to import the client class file. We also make our handlers object similar to the server. The server and client handlers should be very similar, as many functions the server will send to the client could also be sent to the server.

2. Then, we create the client.
   We pass in the hostname of the server to which we would like to connect, the port number of the server to which we would like to connect, and the handlers object we previously created.

```
const myNewClient = new ws_client("localhost", 3000, handlers)
```

3. Now, similar to the server, we can test our client. The following code sends a message to the server every 6 seconds.

```
setInterval(function () {
    myNewClient.send_message("say", { text: "This was broadcast from the client. The next one happens in 6secs." })
}, 6000);
```

Both the exampleServer and exampleClient files can be used as boilerplate templates for building more complex client/server applications over websockets.

#Methods





































