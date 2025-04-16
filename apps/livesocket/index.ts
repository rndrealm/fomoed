import dotenv from "dotenv";
import fs from "fs";
import https from "https";
import WebSocket, { WebSocketServer } from "ws";

// Load environment variables from .env file
dotenv.config();

const certPath = process.env.CERT_PATH ? fs.realpathSync(process.env.CERT_PATH) : undefined;
const keyPath = process.env.KEY_PATH ? fs.realpathSync(process.env.KEY_PATH) : undefined;

const clients = new Set<WebSocket>();

const serverOptions: https.ServerOptions = {
    cert: certPath ? fs.readFileSync(certPath) : undefined,
    key: keyPath ? fs.readFileSync(keyPath) : undefined,
};

if (!certPath || !keyPath) {
    console.warn("!!! Cannot read certificate or key. Using unencrypted WebSocket. !!!");
}

// Create HTTPS server
const port = 3000;
const httpsServer = certPath && keyPath ? https.createServer(serverOptions) : undefined;

// Create WebSocket server
const wss = new WebSocketServer({
    server: httpsServer,
    // If no HTTPS server, create on default port
    port: httpsServer ? undefined : port,
});

wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log("New fomoed client connected. Total clients:", clients.size);

    // Establish connection to Cignals WebSocket
    const cignalsWs = new WebSocket("wss://cignals.io/ui/websocket?vsn=2.0.0");

    cignalsWs.onopen = () => {
        const cignalsWsOpenMsg = {
            event: "cignals_connection_open",
        };
        console.log("Cignals connection opened.");
        ws.send(JSON.stringify(cignalsWsOpenMsg));
    };

    // Forward messages from cignals to client
    cignalsWs.onmessage = (event) => {
        const forwardMsg = {
            event: "cignals_message",
            data: event.data,
        };

        ws.send(JSON.stringify(forwardMsg));
    };

    // Handle disconnect from cignals
    cignalsWs.onclose = () => {
        // Need to close the fomoed client connection if cignals connection was closed first
        if (ws.readyState !== WebSocket.CLOSED) {
            ws.close();
            console.log("Cignals connection closed first. Closed client connection...");
        }
    };

    cignalsWs.onerror = (error) => {
        console.error("Cignals socket error:", error);
    };

    // Forward messages from client to cignals
    ws.on("message", (message) => {
        const str = message.toString();
        cignalsWs.send(str);
    });

    // Handle client disconnect
    ws.on("close", () => {
        clients.delete(ws);
        console.log("Fomoed client closed connection. Total clients:", clients.size);

        cignalsWs.close();
    });
});

// Start server
if (httpsServer) {
    httpsServer.listen(port, () => {
        console.log(`Server listening on https://localhost:${port}`);
    });
} else {
    console.log(`Server listening on ws://localhost:${port}`);
}
