import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

const rooms = {}; // roomName -> Set of sockets

wss.on("connection", (ws, req) => {
    const params = new URLSearchParams(req.url.replace("/", ""));
    const room = params.get("room");

    if (!room) {
        ws.send("Error: room not provided");
        ws.close();
        return;
    }

    if (!rooms[room]) rooms[room] = new Set();
    rooms[room].add(ws);

    console.log("User joined room:", room);

    ws.on("message", (msg) => {
        for (const client of rooms[room]) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg.toString());
            }
        }
    });

    ws.on("close", () => {
        rooms[room].delete(ws);
        console.log("User disconnected from room:", room);
    });
});

console.log("WebSocket server running...");
