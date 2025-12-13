import dgram from "dgram";
import {FromPgn} from "@canboat/canboatjs";
import {WebSocketServer} from "ws";
import express from "express";
import cors from "cors";
import http from "http";

const parserPgn = new FromPgn();
const udpSocket = dgram.createSocket("udp4");
const PORT = 1456;

//limit
const LIMIT_MS = 5000;

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({server});

// Minimal state for rate limiting only
const lastPrint = new Map();
const wsClients = new Set();

function getKey(pgnObj)
{
    return `${pgnObj.pgn}_${pgnObj.src}`;
}

function hasChanged(oldObj, newObj)
{
    return JSON.stringify(oldObj.fields) !== JSON.stringify(newObj.fields);
}

// Broadcast PGN to all WebSocket clients
function broadcastPgn(pgn, line)
{
    const pgnData = {
        id:          `${pgn.src}_${pgn.pgn}_${Date.now()}`,
        timestamp:   new Date().toISOString(),
        pgn:         pgn.pgn,
        description: pgn.description || `PGN ${pgn.pgn}`,
        direction:   pgn.direction,
        src:         pgn.src,
        fields:      {...pgn.fields},
        raw:         line
    };

    const message = JSON.stringify({
        type: 'pgn_update',
        data: pgnData
    });

    wsClients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

// UDP message handler
udpSocket.on("message", msg => {
    const line = msg.toString().trim();
    parserPgn.parse(line, (err, pgn) => {
        if (!err && pgn) {

            const key = getKey(pgn);
            const now = Date.now();

            // Apply rate limiting based on your existing logic
            const last = lastPrint.get(key) || 0;
            let factor = 1;

            if (pgn.pgn === 127237 || pgn.pgn === 129283 || pgn.pgn === 129284) {
                factor = 1;
            }

            // Always send first occurrence, then apply rate limiting
            if (!lastPrint.has(key) || (now - last >= LIMIT_MS * factor)) {
                lastPrint.set(key, now);

                // console.log(pgn)
                broadcastPgn(pgn, line);//one time a second max!
            }
        } else {
            try {
                let notDecodedPgn = JSON.parse(err.replaceAll('Could not parse', ''));
                notDecodedPgn.error = 'bad';
                notDecodedPgn.description = err;

                const key = getKey(notDecodedPgn);

                // console.log(pgn, key, typeof err, err.replaceAll('Could not parse', ''));

                broadcastPgn(notDecodedPgn, line);//one time a second max!
            } catch (error) {
                console.error(error);

            }
        }
    });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
        console.log('Client disconnected');
        wsClients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status:  'ok',
        clients: wsClients.size,
        udpPort: PORT
    });
});

const WS_PORT = 8080;

// Start servers
console.log(`UDP: listening on port ${PORT}`);
udpSocket.bind(PORT, () => {
    console.info(`UDP server listening for NM2K on port ${PORT}`);

    server.listen(WS_PORT, () => {
        console.log(`Server listening on port ${WS_PORT}`);
        console.info(`WebSocket: ws://localhost:${WS_PORT}`);
    });

});