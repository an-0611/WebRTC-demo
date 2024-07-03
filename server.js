const WebSocket = require("ws");
const port = 8080;
const wss = new WebSocket.Server({ port });

//an-0611.github.io/project-name

https: wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    // 轉發消息給其他客戶端
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
