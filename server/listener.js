import dgram from "dgram";
import {FromPgn} from "@canboat/canboatjs";
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
    {'port': 60001},
    {'port': 60002},
    {'port': 60003},

    {'port': 10110},
    {'port': 1456},

    {'port': 20110},
    {'port': 2456},
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

let TELNET_PORTS = [

    // {
    //     'host': '192.168.1.111',
    //     'port': '23'
    // },
];

const serversUDP = new Map();
const serversTCP = new Map();
const serversTelnet = new Map();

//@todo update address to GPS 2 because 1 it;s used by actisense!!!!

//@todo add filters to send only some PGN's

function connectUDP(connectionInfo)
{
    // Start servers
    console.log(`UDP: listening on port ${connectionInfo.port}`);
    // UDP message handler
    const udpSocket = dgram.createSocket("udp4");

    if (!connectionInfo?.firstConnectAt) {
        connectionInfo.firstConnectAt = new Date();
    }

    udpSocket.on('listening', () => {
        const addr = udpSocket.address();
        connectionInfo.lastDataAt = new Date();

        console.log(`Listening for NMEA on ${addr.address}:${addr.port}`);
    });
    udpSocket.bind(connectionInfo, () => {
        console.info(`UDP server bind listening for NMEA on port ${connectionInfo.port}`);
    });
    udpSocket.on("message", msg => {
        //we need the socket too

        if (!connectionInfo?.firstDataAt) {
            connectionInfo.firstDataAt = new Date();
        }
        connectionInfo.lastDataAt = new Date();
        const addr = udpSocket.address();
        parseMsg(msg, `${addr.address}:${addr.port}`);
    });

    serversUDP.set(connectionInfo.port, udpSocket);
}

UDP_PORTS.forEach(connectUDP);

function connectTCP(connectionInfo)
{

    console.log(`TCP: Connecting to ${connectionInfo.host}:${connectionInfo.port}`, connectionInfo);

    if (!connectionInfo?.lastConnect) {
        connectionInfo.lastConnect = new Date();
    } else {
        console.log("bum")
    }
    const clientTCP = net.createConnection(
        {host: connectionInfo.host, port: connectionInfo.port, timeout: 5000},
        () => {
            console.log(`TCP: ${connectionInfo.host}:${connectionInfo.port} Connected`);
            if (!connectionInfo?.firstConnectAt) {
                connectionInfo.firstConnectAt = new Date();
            }
        }
    );

    if (!connectionInfo?.counter) {
        connectionInfo.counter = 1;
    } else {
        connectionInfo.counter++;
    }

    clientTCP.setKeepAlive(true, 5000);

    let buffer = '';
    let lastDataAt = Date.now();
    clientTCP.on('data', (data) => {
        if (!connectionInfo?.firstDataAt) {
            connectionInfo.firstDataAt = new Date();
        }
        connectionInfo.lastDataAt = new Date();

        lastDataAt = Date.now();
        buffer += data.toString('ascii');
        let index;
        while ((index = buffer.indexOf('\n')) !== -1) {
            const message = buffer.slice(0, index).trim();
            buffer = buffer.slice(index + 1);
            if (message) {
                parseMsg(message, `${connectionInfo.host}:${connectionInfo.port}`);
            }
        }
    });

    clientTCP.on('error', (err) => {
        console.error(`TCP error ${connectionInfo.host}:${connectionInfo.port}`, err.message);
    });

    const watchdog = setInterval(() => {
        if (Date.now() - lastDataAt > 15000) {
            console.error(`TCP stalled ${connectionInfo.host}:${connectionInfo.port}`);
            clientTCP.destroy();
        }
    }, 5000);

    clientTCP.on('close', () => {
        if (serversTCP.has(`${connectionInfo.host}:${connectionInfo.port}`)) {
            console.log(serversTCP);
            console.log(`TCP closed ${connectionInfo.host}:${connectionInfo.port}, retrying in 3s`);
            setTimeout(() => {
                if (serversTCP.has(`${connectionInfo.host}:${connectionInfo.port}`)) {
                    connectTCP(connectionInfo)
                } else {
                    console.log(`TCP connection ${connectionInfo.host}:${connectionInfo.port} was removed!!!`);
                }
            }, 3000);
        } else {
            console.log(`TCP connection ${connectionInfo.host}:${connectionInfo.port} was removed!`);
        }

        clearInterval(watchdog)
    });

    serversTCP.set(`${connectionInfo.host}:${connectionInfo.port}`, clientTCP);
}

TCP_PORTS.forEach(connectTCP);

function connectTelnet(connectionInfo)
{
    console.log(`Telnet: Connecting to ${connectionInfo.host}:${connectionInfo.port}`);

    const IAC = 255;
    const DONT = 254;
    const DO = 253;
    const WONT = 252;
    const WILL = 251;
    const SB = 250;
    const SE = 240;


    const client = net.createConnection(
        {host: connectionInfo.host, port: connectionInfo.port, timeout: 5000},
        () => {
            console.log(`Telnet: ${connectionInfo.host}:${connectionInfo.port} Connected`);

            client.write('\n'); // include newline if needed
            client.write('nmea start\n'); // include newline if needed
            console.log(`Telnet write ${connectionInfo.host}:${connectionInfo.port}: nmea start`);

        }
    );

    client.setKeepAlive(true, 5000);

    let textBuffer = '';               // accumulated user data after stripping Telnet commands
    let lastDataAt = Date.now();

    // Telnet state machine variables
    let telnetState = 0;                // 0: normal, 1: IAC received, 2: command+option, 3: subnegotiation
    let subState = 0;                   // 0: normal in subneg, 1: IAC in subneg
    let currentCmd = null;              // stores DO/DONT/WILL/WONT when in state 2

    client.on('data', (data) => {
        if (!connectionInfo?.firstDataAt) {
            connectionInfo.firstDataAt = new Date();
        }
        connectionInfo.lastDataAt = new Date();
        lastDataAt = Date.now();
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];

            if (telnetState === 0) { // normal text
                if (byte === IAC) {
                    telnetState = 1;
                } else {
                    textBuffer += String.fromCharCode(byte);
                }
            } else
                if (telnetState === 1) { // IAC received, awaiting next byte
                    if (byte === IAC) {
                        // escaped IAC -> treat as data
                        textBuffer += String.fromCharCode(IAC);
                        telnetState = 0;
                    } else
                        if (byte === SB) {
                            // start subnegotiation
                            telnetState = 3;
                            subState = 0; // initialize subState
                        } else
                            if (byte === DO || byte === DONT || byte === WILL || byte === WONT) {
                                // command expecting an option byte
                                currentCmd = byte;
                                telnetState = 2;
                            } else {
                                // unknown command, ignore and go back to normal
                                telnetState = 0;
                            }
                } else
                    if (telnetState === 2) { // command (DO/DONT/WILL/WONT) + option
                        const cmd = currentCmd;
                        const opt = byte;

                        // Refuse all options
                        if (cmd === DO) {
                            client.write(Buffer.from([IAC, WONT, opt]));
                        } else
                            if (cmd === WILL) {
                                client.write(Buffer.from([IAC, DONT, opt]));
                            }
                        // For DONT/WONT, no response needed

                        telnetState = 0;
                        currentCmd = null;
                    } else
                        if (telnetState === 3) { // subnegotiation
                            if (subState === 0) {
                                if (byte === IAC) {
                                    subState = 1;
                                }
                                // else ignore data
                            } else { // subState === 1, previous byte was IAC inside subneg
                                if (byte === SE) {
                                    // end subnegotiation
                                    telnetState = 0;
                                    subState = 0;
                                } else
                                    if (byte === IAC) {
                                        // escaped IAC inside subneg -> ignore both IACs (we've already seen first, now second)
                                        subState = 0; // stay in subneg, but treat this IAC as data (discarded)
                                    } else {
                                        // unexpected byte after IAC inside subneg; treat as end of subneg (error recovery)
                                        telnetState = 0;
                                        subState = 0;
                                    }
                            }
                        }
        }

        // Split the accumulated text buffer into lines
        let index;
        while ((index = textBuffer.indexOf('\n')) !== -1) {
            const message = textBuffer.slice(0, index).trim();
            textBuffer = textBuffer.slice(index + 1);

            if (message) {
                const nmeaPattern = /^\d{2}:\d{2}:\d{2}\.\d{3}/i;

                // Replace this with the actual YDEN pattern

                if (nmeaPattern.test(message)) {
                    parseMsg(message, `${connectionInfo.host}:${connectionInfo.port}`);
                    console.info("NMEA msg:", message)
                } else {
                    console.info("Telnet msg:", message)
                }
            }
        }
    });

    client.on('error', (err) => {
        console.error(`Telnet error ${connectionInfo.host}:${connectionInfo.port}`, err.message);
    });

    const watchdog = setInterval(() => {
        if (Date.now() - lastDataAt > 15000) {
            console.error(`Telnet stalled ${connectionInfo.host}:${connectionInfo.port}`);
            client.destroy();
        }
    }, 5000);

    client.on('close', () => {
        const key = `${connectionInfo.host}:${connectionInfo.port}`;
        if (serversTelnet.has(key)) {
            console.log(`Telnet closed ${key}, retrying in 15s`);
            setTimeout(() => {
                if (serversTelnet.has(key)) {
                    connectTelnet(connectionInfo);
                } else {
                    console.log(`Telnet connection ${key} was removed!!!`);
                }
            }, 15000);
        } else {
            console.log(`Telnet connection ${key} was removed!`);
        }
        clearInterval(watchdog);
    });

    serversTelnet.set(`${connectionInfo.host}:${connectionInfo.port}`, client);
}

TELNET_PORTS.forEach(connectTelnet);


//limit
const LIMIT_MS = 5000;

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({server});

// Minimal state for rate limiting only
const lastPrint = new Map();
const wsClients = new Set();
const PGNs = new Map(); // Map<src, Map<pgnId, pgnData>>

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

    const oldPgn = PGNs.get(key);

    if (pgn.src === 253) {
        //it's actually reserved and it's virtual for actisense should be 1, the configured one in device!!!!
        pgn.originalSrc = pgn.src;
        pgn.src = 200;
    }

    if (!oldPgn || hasChanged(oldPgn, pgn)) {
        PGNs.set(key, pgn);
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
                        const date = new Date();
                        //we need the port!
                        let pgn = {
                            prio:        2,
                            pgn:         sentanceInfo.source.talker + ":" + sentanceInfo.source.sentence,
                            dst:         255,
                            src:         "NM183",//add the port?
                            time:        '000001',
                            direction:   'R',
                            fields:      {},
                            description: sentanceInfo.source.sentence,
                            id:          sentanceInfo.source.talker + sentanceInfo.source.sentence,
                            timestamp:   (typeof sentanceInfo.timestamp === "undefined") ? date.toISOString() : sentanceInfo.timestamp
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
            //how to parse multiple line pgns?
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
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    })

}

// parserPgn.on('warning', (pgn, warning) => {
//     console.log(`--- CANBOAT WARNING ---`);
//     console.log('PGN:', pgn);
//     console.log('Warning:', warning);
// });
parserPgn.on('error', (pgn, error) => {
    console.log(`--- CANBOAT ERROR ---`);
    console.log('PGN:', pgn);
    console.log('Error:', error);
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);

    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        wsClients.delete(ws);

        if (!wsClients.size) {
            console.log("WebSocket: no clients! Close connections");
            serversUDP.forEach((socket, key) => {
                socket.close();
                serversUDP.delete(key);
            });
            serversTCP.forEach((socket, key) => {
                serversTCP.delete(key);
                socket.destroy();
            });
            serversTelnet.forEach((socket, key) => {
                socket.write('nmea stop\n'); // include newline if needed
                console.log(`Telnet write ${key}: nmea stop`);

                serversTCP.delete(key);
                socket.destroy();
            });
        }
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
                    socket.close();
                    serversUDP.delete(key);
                });
                serversTCP.forEach((socket, key) => {
                    serversTCP.delete(key);
                    socket.destroy();
                });
                serversTelnet.forEach((socket, key) => {
                    serversTelnet.delete(key);
                    socket.destroy();
                });

                if (message.servers?.UDP) {
                    message.servers?.UDP.forEach(connectUDP);
                }

                if (message.servers?.TCP) {
                    message.servers?.TCP.forEach(connectTCP);
                }
                if (message.servers?.Telnet) {
                    message.servers?.Telnet.forEach(connectTelnet);
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

        //@todo add more info about it, like last online for each server and number of pgn's with last online!
        console.info(`stats: TCP: ${serversTCP.size}, UDP: ${serversUDP.size},Telnet: ${serversTelnet.size}, PGNs: ${PGNs.size}, clients: ${wsClients.size}`)
    }, 5000
)