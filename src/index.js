const express = require("express")
const http = require("http")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server);

app.use(express.static(path.resolve(__dirname, '..', "public")))

app.get("/", (req, res) => res.sendFile(path.resolve(__dirname, '..', "public", 'index.html')))

let users = []

function randomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

io.on('connection', (socket) => {
  users.push({
    id: socket.id,
    color: randomColor(),
    pos: {
      x: Math.round(Math.random() * 470),
      y: Math.round(Math.random() * 470),
    }
  })

  socket.emit("initial", socket.id, users)

  socket.on("request", (userRequest) => {
    users = users.map(user => {
      if (user.id === userRequest.id) {
        user.pos = userRequest.pos
      }
      return user
    })
    socket.emit("response", users)
  })

  socket.on("disconnect", () => {
    users = users.filter(user => user.id !== socket.id)
  })
});

server.listen(3000, () => console.log("http://localhost:3000"))