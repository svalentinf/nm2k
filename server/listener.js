import dgram from "dgram";
import {FromPgn, VenusMQTT} from "@canboat/canboatjs";
import NMEA0183 from '@signalk/nmea0183-signalk';
import {WebSocketServer} from "ws";
import express from "express";
import cors from "cors";
import http from "http";
import net from "net";
// const dotenv = require('dotenv');
// dotenv.config();

const parser183 = new NMEA0183();

const parserPgn = new FromPgn();

//we change the ip
// const UDP_PORTS = 1456;
//udp ports
let UDP_PORTS = [
    // 60001,
    // 60002,
    // 60003,//can direct!?

    // 10110,
    // 1456,

    // 20110,
    // 2456,
];
let TCP_PORTS = [
    // {
    //     'host': '192.168.1.222',
    //     'port': '1457'
    // },
    // {
    //     'host': '192.168.1.111',
    //     'port': '60002'
    // },
    // {
    //     'host': '192.168.1.111',
    //     'port': '60003'
    // },
];

const serversUDP = new Map();
const serversTCP = new Map();

//@todo update address to GPS 2 because 1 it;s used by actisense!!!!

//@todo add filters to send only some PGN's

function connectUDP(udpPort)
{
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

    serversUDP.set(udpPort, udpSocket);
}

UDP_PORTS.forEach(connectUDP);

function connectTCP(tcpInfo)
{

    console.log(`TCP: Connecting to ${tcpInfo.host}:${tcpInfo.port}`);

    const clientTCP = net.createConnection(
        {host: tcpInfo.host, port: tcpInfo.port, timeout: 5000},
        () => {
            console.log(`TCP: ${tcpInfo.host}:${tcpInfo.port} Connected`);
        }
    );

    clientTCP.setKeepAlive(true, 5000);

    let buffer = '';
    let lastDataAt = Date.now();
    clientTCP.on('data', (data) => {
        lastDataAt = Date.now();
        buffer += data.toString('ascii');
        let index;
        while ((index = buffer.indexOf('\n')) !== -1) {
            const message = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);
            if (message) {
                parseMsg(message, `${tcpInfo.host}:${tcpInfo.port}`);
            }
        }
    });

    clientTCP.on('error', (err) => {
        console.error(`TCP error ${tcpInfo.host}:${tcpInfo.port}`, err.message);
    });

    const watchdog = setInterval(() => {
        if (Date.now() - lastDataAt > 15000) {
            console.error(`TCP stalled ${tcpInfo.host}:${tcpInfo.port}`);
            clientTCP.destroy();
        }
    }, 5000);

    clientTCP.on('close', () => {
        if (serversTCP.has(`${tcpInfo.host}:${tcpInfo.port}`)) {
            console.log(serversTCP);
            console.log(`TCP closed ${tcpInfo.host}:${tcpInfo.port}, retrying in 3s`);
            setTimeout(() => {
                if (serversTCP.has(`${tcpInfo.host}:${tcpInfo.port}`)) {
                    connectTCP(tcpInfo)
                } else {
                    console.log(`TCP connection ${tcpInfo.host}:${tcpInfo.port} was removed!!!`);
                }
            }, 3000);
        } else {
            console.log(`TCP connection ${tcpInfo.host}:${tcpInfo.port} was removed!`);
        }

        clearInterval(watchdog)
    });

    serversTCP.set(`${tcpInfo.host}:${tcpInfo.port}`, clientTCP);
}

TCP_PORTS.forEach(connectTCP);


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
    //some has incremental ID, maybe we should remove it!

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

    if (pgn.src === 253) {
        //it's actually reserved and it's virtual for actisense should be 1, the configured one in device!!!!
        pgn.originalSrc = pgn.src;
        pgn.src = 200;
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
    //some servers sends multiple lines in one!
    msg = msg.toString().trim();
    const lines = msg.split("\r\n");

    // console.log(lines);
    lines.forEach(line => {
        if (line.startsWith('$') || line.startsWith('!')) {
            // const sentences = JSON.parse(JSON.stringify(parser183.parse(line)));
            try {
                const sentences = parser183.parse(line);
                if (sentences) {
                    // console.log('sentences', typeof sentences, sentences)
                    sentences.updates.forEach(sentanceInfo => {
                        //we need the port!
                        let pgn = {
                            prio:        2,
                            pgn:         sentanceInfo.source.talker + ":" + sentanceInfo.source.sentence,
                            dst:         255,
                            src:         "NM183",
                            time:        '000000',
                            fields:      {},
                            description: sentanceInfo.source.sentence,
                            id:          sentanceInfo.source.talker + sentanceInfo.source.sentence,
                            timestamp:   sentanceInfo.timestamp
                        }

                        sentanceInfo.values.forEach(data => {
                            const tmp = tryParseJson(data.value);
                            if (typeof tmp === 'object') {
                                pgn.fields = {...pgn.fields, ...tmp};
                            } else {
                                pgn.fields[data.path.slice(data.path.lastIndexOf('.') + 1)] = tmp;
                            }
                        });

                        // if (!msg.includes("GLL")) {
                        //     return;
                        // }

                        broadcastPgn(pgn, line, serverAddress);//one time a second max!
                    });

                    // if (msg.includes("HDG") || msg.includes("VHW") || msg.includes("HDM")) {
                    //     console.log(JSON.stringify(sentences), line, typeof line);
                    // }
                } else {
                    // if (line.includes("HDG") || line.includes("VHW")) {
                    // console.log(msg, line);
                    // }

                }
            } catch (e) {
                console.error(e);
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
                        } else {
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
    })

}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        wsClients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString('ascii'));

            console.log("WebSocket receive message ", message);

            if (message?.servers) {
                console.log('WebSocket: update servers', message.servers);
                serversUDP.forEach((socket, key) => {
                    console.log('WebSocket: close UDP', key, socket);
                    socket.close();
                    serversUDP.delete(key);
                });
                serversTCP.forEach((socket, key) => {
                    console.log('WebSocket: destroy TCP', key, socket);
                    serversTCP.delete(key);
                    socket.destroy();
                });

                console.log('serversTCP', serversTCP);

                if (message.servers?.UDP) {
                    message.servers?.UDP.forEach(connectUDP);
                }

                if (message.servers?.TCP) {
                    message.servers?.TCP.forEach(connectTCP);
                }
            }
            //when server changes we need to update them!!!
        } catch (e) {
            console.error('WebSocket receive message ERROR ', e, data);

        }
    });

});

const WS_PORT = 8080;


server.listen(WS_PORT, () => {
    console.log(`Server listening on port ${WS_PORT}`);
    console.info(`WebSocket: ws://localhost:${WS_PORT}`);
});


setInterval(
    () => {

        console.info(`stats: TCP: ${serversTCP.size}, UDP: ${serversUDP.size}`)
    }, 5000
)