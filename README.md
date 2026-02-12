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

### Run the websocket server and nmea-analyzer

```sh
npm run server/listener.js
```

You can also use the index.html file from the public folder. (You need to run the websocket server)

### Windows installer. First install nodejs then you can run the script to install the app and start the server

Download and run start-nmea-server.cmd

## Support the Project

If you find this app useful, please consider supporting its development:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://paypal.me/valentinsonu)

**Direct Donations:**

- [PayPal](https://paypal.me/valentinsonu)
- [Revolut](https://revolut.me/valentinsonu)