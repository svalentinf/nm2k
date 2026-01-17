import dgram from "dgram";
import {FromPgn, VenusMQTT} from "@canboat/canboatjs";
import {WebSocketServer} from "ws";
import express from "express";
import cors from "cors";
import http from "http";
import net from "net";

const parserPgn = new FromPgn();
const udpSocket = dgram.createSocket("udp4");

//we change the ip
// const PORT = 1456;
const PORT = 60002;


// Create a connection to the server
const client = net.createConnection({port: 60002, host: '192.168.1.111'}, () => {
    console.log('Connected to server!!!!!!');
    client.write('Hello from TCP Client!');
    // You might need to send a specific command to start the NMEA 2000 stream
    // client.write('START_NMEA2000'); // or whatever command your server expects
});

// Handle incoming data (NMEA 2000 messages)
// client.on('data', (data) => {
//     // NMEA 2000 messages are binary, so we need to handle them as buffers
//     console.log('Received data length:', data.length, 'bytes', data);
//
//     // Parse NMEA 2000 messages
//     parseMsg(data);
// });

let messageBuffer = Buffer.alloc(0);
client.on('data', (data) => {
    // Accumulate data
    messageBuffer = Buffer.concat([messageBuffer, data]);

    // Process complete messages (adjust max message size as needed)
    const MAX_MESSAGE_SIZE = 223; // Max NMEA 2000 fast packet size

    while (messageBuffer.length > 0) {
        // Check if we have at least minimum message size (example: 8 bytes)
        if (messageBuffer.length < 8) {
            break; // Wait for more data
        }

        // Extract message (example: first byte is length)
        const messageLength = messageBuffer[0];

        if (messageBuffer.length >= messageLength) {

            const message = messageBuffer.slice(0, messageLength);
            messageBuffer = messageBuffer.slice(messageLength);
            console.log(message);
            // Process the complete message
            // parseMsg(message);
        } else {
            break; // Wait for more data
        }
    }
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Connection error:', err);
});

// Handle connection close
client.on('close', () => {
    console.log('Connection closed');
});


//limit
const LIMIT_MS = 5000;

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({server});

// Minimal state for rate limiting only
const lastPrint = new Map();
const wsClients = new Set();
const Pgns = new Map(); // Map<src, Map<pgnId, pgnData>>

function getKey(pgnObj)
{
    return `${pgnObj.pgn}_${pgnObj.src}`;
}

function hasChanged(oldObj, newObj)
{
    return JSON.stringify(oldObj.fields) !== JSON.stringify(newObj.fields);
}

let id = 0;

// Broadcast PGN to all WebSocket clients
function broadcastPgn(pgn, line)
{
    id = id + 1;
    //@todo send it as it is!
    const pgnData = {
        ...pgn,
        id:  `${pgn.src}_${pgn.pgn}_${Date.now()}_${id}`,
        raw: line
    };

    // if (pgn.src == 0) {
    // console.log(pgnData);
    // }

    const message = JSON.stringify({
        type: 'pgn_update',
        data: pgnData
    });
    // console.log('broadcastt', message)

    wsClients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

function parseMsg(msg)
{
    const line = msg.toString().trim();
    // parseYDRAW.parse(line, (err, pgn)=>{
    //     console.log(line, pgn, err)
    // });
    parserPgn.parse(line, (err, pgn) => {
        const now = Date.now();
        if (!err && pgn) {
            const key = getKey(pgn);
            // if (!lastPrint.has(key)) {
            //     //we print the pgn on the first appearance
            //     console.log(pgn)
            // }

            let changed = false;
            const oldPgn = Pgns.get(key);


            if (pgn.src == 253) {
                pgn.src = 1;
                //it's actually reserved and it's virtual for actisense should be 1!
                // console.log(line, pgn)

            }
            if (oldPgn && hasChanged(oldPgn, pgn)) {
                console.log('change!!! or no old', oldPgn)
                Pgns.set(key, pgn);
                changed = true;
            }
            const last = lastPrint.get(key) || 0;
            // Always send first occurrence, then apply rate limiting
            if (!lastPrint.has(key) || changed || (now - last >= LIMIT_MS)) {
                lastPrint.set(key, now);
                broadcastPgn(pgn, line);//one time a second max!
            }
        } else {
            try {
                //I need to send it as it is!
                let notDecodedPgn = JSON.parse(err.replaceAll('Could not parse', ''));
                notDecodedPgn.error = 'Could not parse'
                if (notDecodedPgn.pgn && typeof notDecodedPgn.src != "undefined") {
                    const key = getKey(notDecodedPgn);
                    lastPrint.set(key, now);
                    broadcastPgn(notDecodedPgn, line);//one time a second max!
                } else {
                    console.log("Fail to decode:", notDecodedPgn);
                }
            } catch (error) {
                console.log(error);
            }
        }
    });
}

// UDP message handler
udpSocket.on("message", msg => {
    parseMsg(msg);
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
        udpPort:
                 PORT
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