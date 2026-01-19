# 🛥️ NMEA 2000 PGN Monitor

A professional, real-time web interface for monitoring, analyzing, and visualizing NMEA 2000 network data. Built with Vue.js 3, this application provides a comprehensive dashboard for marine electronics, letting you see every PGN, connected device, and historical data stream on your vessel's network.

## ✨ Key Features

- **🌐 Real-time NMEA 2000 Monitoring**: Connect directly to PRO-NDC-1E2K or compatible gateways via WebSocket
- **📊 Multi-panel Dashboard**: Simultaneous view of connected devices, active PGNs, and message history
- **🔍 Intelligent Filtering**: Filter by device, PGN, or search across all data fields
- **📈 Change Comparison**: Modal interface to compare PGN values across time and different sources
- **⚡ Automatic Device Discovery**: Identifies and profiles devices as they appear on the network

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


### Run the websocket server and nm2k-analyzer

```sh
npm run server/listener.js
```

You can also use the index.html file from the public folder. (You need to run the websocket server)