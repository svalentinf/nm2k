import {ref, computed, watch} from 'vue'

export function useNmeaWebSocket(autoUpdate, config)
{
    const ws = ref(null)
    const isConnected = ref(false)
    const connectionError = ref(null)
    const isConnecting = ref(false)
    const freezePGNs = ref(false);

    // Data stores
    const devicesPGNs = ref(new Map())
    const servers = ref(new Set())
    let lastPgn = ref({})
    const maxHistory = 50;

    const connectionStatus = computed(() => {
        if (connectionError.value) return 'Error'
        if (isConnecting.value) return 'Connecting'
        return isConnected.value ? 'Connected' : 'Disconnected'
    })

    function connectWebSocket()
    {
        if (isConnecting.value || !config.value.wsUrl) return

        isConnecting.value = true
        connectionError.value = null

        try {
            // Close existing connection if any
            if (ws.value) {
                ws.value.close()
            }

            console.log(`Connecting to WebSocket: ${config.value.wsUrl}`)
            ws.value = new WebSocket(config.value.wsUrl)

            ws.value.onopen = () => {
                console.log('WebSocket connected')
                isConnected.value = true
                isConnecting.value = false
                connectionError.value = null


                console.log("ws", ws.value);
                // let test = {
                //     "t": "ws_init",
                //     "c": {
                //         "subscriptions": [{"name": "data", "enabled": "true"}, {
                //             "name":    "repo_data",
                //             "enabled": "true"
                //         }]
                //     }
                // }
                //
                // ws.value.send(JSON.stringify(test));


                //we send the data!
                ws?.value?.send(JSON.stringify(getDataServers()));

            }


            ws.value.onmessage = (event) => {
                if (!autoUpdate.value) return
                try {
                    const data = JSON.parse(event.data)
                    processPgnUpdate(data.data)
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error)
                }
            }

            ws.value.onclose = (event) => {
                console.log(`WebSocket disconnected: ${event.code} ${event.reason}`)
                isConnected.value = false
                isConnecting.value = false

                // Only reconnect if it wasn't a manual close
                if (event.code !== 1000) {
                    setTimeout(() => {
                        if (config.value.autoConnect) {
                            connectWebSocket()
                        }
                    }, 3000)
                }
            }

            ws.value.onerror = (error) => {
                console.error('WebSocket error:', error)
                connectionError.value = error
                isConnecting.value = false
            }
        } catch (error) {
            console.error('Failed to create WebSocket:', error)
            connectionError.value = error
            isConnecting.value = false
        }
    }

    function disconnectWebSocket()
    {
        if (ws.value) {
            ws.value.close(1000, 'User disconnected')
            ws.value = null
        }
        isConnected.value = false
        isConnecting.value = false
    }

    function reconnectWebSocket()
    {
        disconnectWebSocket()
        setTimeout(() => connectWebSocket(), 100)
    }

    function getDataServers()
    {
        let dataServers = {
            'servers': {
                UDP: [],
                TCP: [],
            }
        };

        config.value.dataServers.TCP.forEach(server => {
            if (server.enable && server.host && server.port) {
                dataServers.servers.TCP.push({
                    'host': server.host,
                    'port': server.port,
                });
            }
        });
        config.value.dataServers.UDP.forEach(server => {
            if (server.enable && server.port) {
                dataServers.servers.UDP.push(server.port);
            }
        });

        return dataServers;
    }
    // Watch for config changes
    watch(() => config.value.wsUrl, (newUrl, oldUrl) => {
        if (newUrl !== oldUrl && config.value.autoConnect) {
            reconnectWebSocket()
        }
    })

    // Watch for servers changes
    watch(() => config, (newServers, oldServers) => {
        ws?.value?.send(JSON.stringify(getDataServers()));
    }, {deep: true})

    // Watch for autoConnect changes
    watch(() => config.value.autoConnect, (newValue) => {
        if (newValue && !isConnected.value && !isConnecting.value) {
            connectWebSocket()
        } else
            if (!newValue && isConnected.value) {
                disconnectWebSocket()
            }
    })

    function updateDeviceData(pgnData)
    {
        const now = Date.now()
        const src = pgnData.src

        const device = devicesPGNs.value.get(src)
        device.lastSeen = now
        device.updates++

        if (!device.name) {
            device.name = `Device ${pgnData.src}`
        }

        // Extract device information from PGNs
        switch (pgnData.pgn) {
            case 60928: // ISO Address Claim
                if (pgnData.fields) {
                    device.name = pgnData.fields.deviceName ||
                                  pgnData.fields.manufacturerCode ||
                                  pgnData.fields.deviceFunction ||
                                  `Device ${pgnData.src}`
                    device.manufacturerCode = pgnData.fields.manufacturerCode ?? device.manufacturerCode
                    device.deviceInstance = pgnData.fields.deviceInstance ?? device.deviceInstance
                    device.deviceFunction = pgnData.fields.deviceFunction ?? device.deviceFunction
                    device.deviceClass = pgnData.fields.deviceClass ?? device.deviceClass
                    device.isoAddress = pgnData.fields.isoAddress ?? device.isoAddress
                }
                break

            case 126996: // Product Information
                if (pgnData.fields) {
                    device.n2kVersion = pgnData.fields.nmea2000Version
                    device.productCode = pgnData.fields.productCode
                    device.modelId = pgnData.fields.modelId
                    device.softwareVersion = pgnData.fields.softwareVersionCode
                    device.modelVersion = pgnData.fields.modelVersion
                    device.modelSerialCode = pgnData.fields.modelSerialCode
                    device.certificationLevel = pgnData.fields.certificationLevel
                    device.loadEquivalency = pgnData.fields.loadEquivalency
                }
                break

            case 126998: // Configuration Information
                if (pgnData.fields) {
                    device.installationDescription1 = pgnData.fields.installationDescription1
                    device.installationDescription2 = pgnData.fields.installationDescription2
                    device.manufacturerInformation = pgnData.fields.manufacturerInformation
                }
                break
        }

        // if (!device.pgns.has(pgnData.pgn)) {
        //     device.pgnCount++
        //     device.pgns.add(pgnData.pgn)
        // }
        if (!device.servers.has(pgnData.serverAddress)) {
            device.servers.add(pgnData.serverAddress)
        } else {
            //@todo we need to track the servers pgn's
        }
    }

    function updatePgnData(newData)
    {
        const src = newData.src;
        const pgnId = newData.pgn;
        if (!devicesPGNs.value.has(src)) {
            //we add the device!
            const now = new Date();
            devicesPGNs.value.set(src, {
                src,
                firstSeen: now,
                lastSeen:  now,
                pgnCount:  0,
                updates:   1,
                pgns:      new Map(),
                servers:   new Set(),
            })
        }

        const device = devicesPGNs.value.get(src)
        const existingPgn = device.pgns.get(pgnId)

        // Find changed fields
        const updatedFields = []


        if (existingPgn) {
            if (newData.fields) {
                if (!freezePGNs.value) {
                    Object.keys(newData.fields).forEach(field => {
                        if (existingPgn.fields && JSON.stringify(existingPgn.fields[field]) !== JSON.stringify(newData.fields[field])) {
                            updatedFields.push(field)
                            existingPgn.fields[field] = newData.fields[field];
                        }
                    })
                    existingPgn.updatedFields = updatedFields;
                }
            }
            existingPgn.raw = newData.raw;
            //@todo make it configurable!!
            existingPgn.history.unshift({
                historyId: `hist_${Date.now()}_${Math.random()}`,
                ...newData,
            })
            if (existingPgn.history.length > maxHistory) {
                existingPgn.history.length = maxHistory
            }
            //@todo update the server only if is different!!! -> make it array!!
            if (!existingPgn.servers.includes(newData.serverAddress)) {
                existingPgn.servers.push(newData.serverAddress);
            }
            // existingPgn.serverAddress = newData.serverAddress;
        } else {
            newData.isNew = true;
            newData.history = [];
            newData.servers = [newData.serverAddress];
            device.pgns.set(pgnId, newData);
        }

        // Mark as new for animation
        // Update the PGN
        // Clear animation after delay
        setTimeout(() => {
            const currentPgn = devicesPGNs.value.get(src)?.pgns.get(pgnId)
            if (currentPgn) {
                currentPgn.isNew = false
                currentPgn.updatedFields = []
            }
        }, 1000)
    }

    function updateServers(pgnData)
    {
        if (!servers.value.has(pgnData.serverAddress)) {
            servers.value.add(pgnData.serverAddress, pgnData.serverAddress);
        }
    }

    function processPgnUpdate(pgnData)
    {

        lastPgn.value = pgnData;

        // 1. Update PGN data
        updatePgnData(pgnData)

        // 2. Update device -> get the name and info...
        updateDeviceData(pgnData)

        //4. update servers source
        updateServers(pgnData)
    }

    function clearAllData()
    {
        devicesPGNs.value.clear();
        servers.value.clear();

    }

    return {
        ws,
        isConnected,
        isConnecting,
        freezePGNs,
        connectionError,
        servers,
        devicesPGNs,
        lastPgn,
        processPgnUpdate,
        connectionStatus,
        connectWebSocket,
        disconnectWebSocket,
        reconnectWebSocket,
        clearAllData
    }
}