const canvas = document.querySelector("canvas")
const context = canvas.getContext('2d')
const socket = io()
const state = {
  ratio: 10,
  size: 20,
  users: []
}

let id = null;
socket.on("initial", (idSocket, users) => {
  id = idSocket
  state.users = users
})

function move(key) {
  const keys = [
    { codes: ["a", "ArrowLeft"], exec: (user) => user.pos = { ...user.pos, x: user.pos.x - state.ratio } },
    { codes: ["s", "ArrowDown"], exec: (user) => user.pos = { ...user.pos, y: user.pos.y + state.ratio } },
    { codes: ["w", "ArrowUp"], exec: (user) => user.pos = { ...user.pos, y: user.pos.y - state.ratio } },
    { codes: ["d", "ArrowRight"], exec: (user) => user.pos = { ...user.pos, x: user.pos.x + state.ratio } },
  ]

  for (const user of state.users) {
    for (const { codes, exec } of keys) {
      if (codes.includes(key)) {
        exec(user)
      }
    }
  }
}

window.onkeydown = (event) => move(event.key)
// document.querySelector(".buttons .up").onclick = () => move('w')
// document.querySelector(".buttons .left").onclick = () => move('a')
// document.querySelector(".buttons .down").onclick = () => move('s')
// document.querySelector(".buttons .right").onclick = () => move('d')

function renderTable() {
  document.querySelector("table tbody").innerHTML = state.users.map((user) => `
    <tr>
      <td>${user.id}</td>
      <td>${user.pos.x}</td>
      <td>${user.pos.y}</td>
    </tr>
  `).join("")
}

function loop() {
  if (id) {
    const user = state.users.find(user => user.id === id)
    socket.emit("request", user)

    socket.on("response", (users) => state.users = users)

    renderTable()
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (const user of state.users) {
      context.fillStyle = user.color
      context.fillRect(
        user.pos.x,
        user.pos.y,
        user.id === id ? state.size + 10 : state.size,
        user.id === id ? state.size + 10 : state.size,
      )
    }
  }
  requestAnimationFrame(loop)
}

loop()