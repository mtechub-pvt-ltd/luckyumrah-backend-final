const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http'); 
const socketIo = require('socket.io');
const app = express();
const { sql } = require('./app/config/db.config');
require('dotenv').config();

var corsOptions = {
};

app.use(cors());
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.static("files"));
app.use(express.urlencoded({ extended: true }));
app.use("/images_uploads", express.static("images_uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Lucky Umrah!" });
});

require("./app/routes/admin")(app);
require("./app/routes/participants")(app);  
require("./app/routes/winner")(app);
require("./app/routes/stripe")(app);
require("./app/routes/session")(app);
// Create an HTTP server
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
// const io = socketIo(server);
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("User Connected ===>" + socket.id); 
 
  socket.on('startShuffling', async() => {
    console.log("shuffling start..........");
    
    io.emit('shufflingNames');
});
socket.on('stopShuffling', (winner) => {
  console.log(winner);
  io.emit('showWinner', winner);
});

socket.on('disconnect', () => {
  console.log('User disconnected');
});

 
});

// set port, listen for requests
const PORT = 3005;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
