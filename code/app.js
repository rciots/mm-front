const express = require("express");
const path = require("path");
const { Server } = require("socket.io");
const app = express();
var websocket = require("ws");
const http = require("http");
const socketcli = require("socket.io-client");
let activeVideoUsers = 0;
// load env variables

const PORT = process.env.PORT || 8080;
const cliport = process.env.CLI_PORT || 8081;
const socket_manager = process.env.SOCKET_MANAGER_SVC || "localhost";
var websocket_stream_port = process.env.WS_STREAM_PORT || 8082;
var streaming_websocket = new websocket.Server({port: websocket_stream_port, perMessageDeflate: false});

streaming_websocket.on("connection", function connection(ws) {
  activeVideoUsers++;
  if (activeVideoUsers == 1) {
    ioclient.emit("led", 1);
  }
  ws.on("close", function close() {
    if (activeVideoUsers > 0) {
      activeVideoUsers--;
    }
    if (activeVideoUsers == 0) {
      ioclient.emit("led", 0);
    }
  }
  );
});

streaming_websocket.broadcast = function(data){
	streaming_websocket.clients.forEach(function each(client){
        if (client.readyState === websocket.OPEN){
            client.send(data);
        }
	});
};



// Configuración de Express
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Configuración del servidor
const server = http.createServer(app);
const io = new Server(server);

// Configuración del cliente socket
const ioclient = new socketcli.connect("http://" + socket_manager + ":" + cliport, {
  extraHeaders: { origin: "ui" },
  reconnection: true,
  reconnectionDelay: 500
});

// Eventos del cliente socket
ioclient.on("connect", () => {
  console.log("Connected to game manager server");
});
ioclient.on('video', (data) => {
  streaming_websocket.broadcast(data);
});
ioclient.on("disconnect", () => {
  console.log("Disconnected from game manager server");
});

ioclient.on("error", (error) => {
  console.error("Game manager connection error:", error);
});

// Variables de estado del juego
let usersList = [];
let gameRunning = false;
const MAX_PLAYERS = 1;
let currentPlayers = [];

// Eventos del servidor socket
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("usersList", usersList);
  socket.emit("currentPlayers", currentPlayers);
  // Eventos de gestión de conexión
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.userId);
    usersList = usersList.filter(user => user.socket.id !== socket.id);
  });

  // Eventos de gestión de usuario
  socket.on("join", (data) => {
    const existingUser = usersList.find(user => user.userId === data.userId);
    if (existingUser) {
      console.log("User already in list:", data.userId);
      socket.emit("userValidation", {valid: false, message: "User already in list"});
      return;
    }

    const activeUsers = usersList.filter(user => !user.waiting).length;
    const isWaiting = gameRunning || activeUsers >= MAX_PLAYERS;
    
    usersList.push({
      userId: data.userId,
      socket: socket,
      waiting: isWaiting
    });

    socket.userId = data.userId;
    console.log(`User ${data.userId} joined - Status: ${isWaiting ? 'waiting' : 'active'}`);
    socket.emit("userValidation", {valid: true, message: "User joined"});
  });

  // Eventos de juego
  socket.on("movement", (data) => {
    if (!socket.userId) {
      console.warn("Received movement from unidentified user");
      return;
    }

    const user = usersList.find(user => user.userId === socket.userId);
    if (!user || user.waiting) {
      console.warn("Movement received from waiting/invalid user:", socket.userId);
      return;
    }

    if (!gameRunning) {
      console.warn("Game is not running, movement ignored");
      return;
    }

    console.log("Movement received from user", socket.userId, ":", data);
    ioclient.emit("movement", data);
  });
  socket.on("ready", (data) => {
    // check if user in usersList is waiting
    const user = usersList.find(user => user.userId === socket.userId);
    if (!user.waiting) {
      console.warn("User is not waiting, ready ignored");
      return;
    } else {
      // if global timeout is not running, start it, else do nothing
      if (!timeout) {
        timeout = startTimeout();
      }
    }
  });

});

// Global timeout variable
let timeout = null;

// function to start a 10s timeout
function startTimeout() {
  setTimeout(() => {
    console.log("Timeout reached");
    startGame();
  }, 10000);
}
function startGame() {
  gameRunning = true;
  ioclient.emit("start");
  usersList.forEach(user => {
    if (!user.waiting) {
      user.socket.emit("start");
    }
  });
}
function endGame() {
  gameRunning = false;
  timeout = null;
  ioclient.emit("end");
  usersList.forEach(user => {
    if (!user.waiting) {
      user.socket.emit("end");
    }
  });
  usersList = usersList.filter(user => user.waiting);
}
// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Internal Web Socket Server listening on port ${PORT}`);
});
