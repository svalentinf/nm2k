import dgram from "dgram";
import {FromPgn, VenusMQTT} from "@canboat/canboatjs";
import {WebSocketServer} from "ws";
import express from "express";
import cors from "cors";
import http from "http";
import net from "net";
import NMEA0183 from '@signalk/nmea0183-signalk';

const parser183 = new NMEA0183();

const parserPgn = new FromPgn();

const servers = new Map();

//we change the ip
// const UDP_PORTS = 1456;
//udp ports
const UDP_PORTS = [
    60001,
    60002,
    10110,
    1456,
];
const TCP_PORTS = [
    // {
    //     'host': '192.168.4.1',
    //     'port': '1457'
    // },
    // {
    //     'host': '192.168.1.111',
    //     'port': '60002'
    // },
];

TCP_PORTS.forEach((tcpInfo) => {
// // Create a connection to the server
    const clientTCP = net.createConnection(tcpInfo.port, tcpInfo.host, () => {
        console.log(`TCP: ${tcpInfo.host}:${tcpInfo.port} Connected to server!`);
        // You might need to send a specific command to start the NMEA 2000 stream
        // client.write('START_NMEA2000'); // or whatever command your server expects
    });
    let buffer = '';
    clientTCP.on('data', (data) => {
        const addr = clientTCP.address();
        buffer += data.toString('ascii');
        let index;
        while ((index = buffer.indexOf('\n')) !== -1) {
            const message = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);
            if (!message) continue;

            parseMsg(message, `${tcpInfo.host}:${tcpInfo.port}`);
        }
    });

// Handle connection errors
    clientTCP.on('error', (err) => {
        console.error(`TCP: ${tcpInfo.host}:${tcpInfo.port} Connection error:`, err);
    });

// Handle connection close
    clientTCP.on('close', () => {
        console.log(`TCP: ${tcpInfo.host}:${tcpInfo.port} Connection closed`);
    });
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
function broadcastPgn(pgn, line, serverAddress)
{
    const now = Date.now();
    const key = getKey(pgn);
    // if (!lastPrint.has(key)) {
    //     //we print the pgn on the first appearance
    //     console.log(pgn)

    // }
    let changed = false;

    const oldPgn = Pgns.get(key);

    if (pgn.src == 253) {
        //it's actually reserved and it's virtual for actisense should be 1!
        pgn.src = 1;
        // console.log(line, pgn)
    }

    if (!oldPgn || hasChanged(oldPgn, pgn)) {
        Pgns.set(key, pgn);
        changed = true;
    }

    const last = lastPrint.get(key) || 0;
    // Always send first occurrence, then apply rate limiting
    if (!lastPrint.has(key) || changed || (now - last >= LIMIT_MS)) {
        lastPrint.set(key, now);
    } else {
        return;
    }

    id = id + 1;
    //@todo send it as it is!
    const pgnData = {
        ...pgn,
        id:            `${pgn.src}_${pgn.pgn}_${Date.now()}_${id}`,
        raw:           line,
        serverAddress: serverAddress
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

function tryParseJson(str)
{
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

function parseMsg(msg, serverAddress)
{
    const line = msg.toString().trim();
    // console.log('line', typeof line, line);

    //@todo keep track of time between messages and server stats!
    // let server = servers.has(serverAddress);
    // if (!servers.has(serverAddress)){
    //     servers.set(serverAddress, {
    //
    //     });
    // }
    // servers.set(`${tcpInfo.host}:${tcpInfo.port}`, {
    //     'connected': new Date()
    // });

    if (line.startsWith('$') || line.startsWith('!')) {
        // const sentences = JSON.parse(JSON.stringify(parser183.parse(line)));
        const sentences = parser183.parse(line);

        if (sentences) {
            // console.log('sentences', typeof sentences, sentences)
            sentences.updates.forEach(sentanceInfo => {
                let pgn = {
                    prio:        2,
                    pgn:         sentanceInfo.source.talker + ":" + sentanceInfo.source.sentence,
                    dst:         255,
                    src:         "NM183",
                    time:        '002938.800',
                    fields:      {},
                    description: sentanceInfo.source.sentence,
                    id:          sentanceInfo.source.talker + sentanceInfo.source.sentence,
                    timestamp:   sentanceInfo.timestamp
                }

                sentanceInfo.values.forEach(data => {
                    pgn.fields[data.path] = tryParseJson(data.value);
                });
                broadcastPgn(pgn, line, serverAddress);//one time a second max!
            });
        } else {


        }
        return;
    } else {

    }
    // parseYDRAW.parse(line, (err, pgn)=>{
    //     console.log(line, pgn, err)
    // });
    try {
        parserPgn.parse(line, (err, pgn) => {
            if (!err && pgn) {
                broadcastPgn(pgn, line, serverAddress);//one time a second max!
            } else {
                try {
                    if (typeof err === 'string') {
                        //I need to send it as it is!
                        let notDecodedPgn = JSON.parse(err.replaceAll('Could not parse', ''));
                        notDecodedPgn.error = 'Could not parse'
                        if (notDecodedPgn.pgn && typeof notDecodedPgn.src != "undefined") {
                            broadcastPgn(notDecodedPgn, line, serverAddress);//one time a second max!
                        } else {
                            console.log("Fail to decode:", notDecodedPgn);
                        }
                    }else{
                        console.log("Fail to decode:", notDecodedPgn);
                    }
                } catch (error) {
                    console.log('xxxxx', err, error, typeof err);
                    console.log('YYYYY', typeof err);
                }
            }
        });
    } catch (e) {
        console.log(e);
    }
}

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

const WS_PORT = 8080;

UDP_PORTS.forEach(udpPort => {

// Start servers
    console.log(`UDP: listening on port ${udpPort}`);
// UDP message handler
    const udpSocket = dgram.createSocket("udp4");
    udpSocket.on('listening', () => {
        const addr = udpSocket.address();
        console.log(`Listening for NMEA on ${addr.address}:${addr.port}`);
    });
    udpSocket.bind(udpPort, () => {
        console.info(`UDP server bind listening for NMEA on port ${udpPort}`);
    });
    udpSocket.on("message", msg => {
        //we need the socket too
        const addr = udpSocket.address();
        parseMsg(msg, `${addr.address}:${addr.port}`);
    });
});

server.listen(WS_PORT, () => {
    console.log(`Server listening on port ${WS_PORT}`);
    console.info(`WebSocket: ws://localhost:${WS_PORT}`);
});