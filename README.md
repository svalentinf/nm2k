# 🛥️ NMEA 2000 PGN's Monitor and NMEA 0183

A professional, real-time web interface for monitoring, analyzing, and visualizing NMEA 2000&183 network data. Built with Vue.js 3, this application provides a comprehensive dashboard for marine electronics, letting you
see every PGN, connected device, and historical data stream on your vessel's network.

## ✨ Key Features

- **🌐 Real-time NMEA 2000&0183 Monitoring**: Connect directly to PRO-NDC-1E2K, YDEN-03 or compatible gateways via WebSocket
- **📊 Multi-panel Dashboard**: Simultaneous view of connected devices, active PGNs/sentences, and message history
- **🔍 Intelligent Filtering**: Filter by device, PGN, or search across all data fields
- **📈 Change Comparison**: Modal interface to compare PGN values across time and different sources
- **⚡ Automatic Device Discovery**: Identifies and profiles devices as they appear on the network
- **📍 Location map to track GPS locations and compare tracks in real itme

## Project Setup

### 1. Install all required dependencies

```sh
npm install
```

### 2. Run the websocket server and nmea-analyzer

```sh
npm run server/listener.js
```

### 3. Open public/index.html

## To modify the project:

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Windows installer.

- Install nodejs from https://nodejs.org
- Download [start-nmea-server.cmd](https://raw.githubusercontent.com/svalentinf/nm2k/refs/heads/main/start-nmea-server.cmd) and run it!

```sh
cmd start-nmea-server.cmd
```

## Support the Project

If you find this app useful, please consider supporting its development:

**Direct Donations:**

- [PayPal](https://paypal.me/valentinsonu)
- [Revolut](https://revolut.me/valentinsonu)