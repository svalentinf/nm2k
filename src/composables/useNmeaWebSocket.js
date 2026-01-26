import {ref, computed, watch} from 'vue'

export function useNmeaWebSocket(autoUpdate, config)
{
    const ws = ref(null)
    const isConnected = ref(false)
    const connectionError = ref(null)
    const isConnecting = ref(false)

    // Data stores
    const devices = ref(new Map())
    const pgns = ref(new Map())
    const history = ref([])
    const servers = ref(new Set())
    let lastPgn = ref({})

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

                let test = {
                    "t": "ws_init",
                    "c": {
                        "subscriptions": [{"name": "data", "enabled": "true"}, {
                            "name":    "repo_data",
                            "enabled": "true"
                        }]
                    }
                }

                ws.value.send(JSON.stringify(test));
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

    // Watch for config changes
    watch(() => config.value.wsUrl, (newUrl, oldUrl) => {
        if (newUrl !== oldUrl && config.value.autoConnect) {
            reconnectWebSocket()
        }
    })

    // Watch for autoConnect changes
    watch(() => config.value.autoConnect, (newValue) => {
        if (newValue && !isConnected.value && !isConnecting.value) {
            connectWebSocket()
        } else
            if (!newValue && isConnected.value) {
                disconnectWebSocket()
            }
    })

    // Rest of the functions remain the same...
    function getSensorType(pgn)
    {
        const sensorMap = {
            127237: 'Heading/Track Control',
            127250: 'Vessel Heading',
            127251: 'Rate of Turn',
            127257: 'Attitude',
            127488: 'Engine Parameters Rapid',
            127489: 'Engine Parameters Dynamic',
            127493: 'Transmission Parameters',
            127497: 'Trip Fuel Consumption',
            127498: 'Engine Parameters Static',
            127501: 'Binary Status',
            127505: 'Fluid Level',
            127506: 'DC Detailed Status',
            127507: 'Charger Status',
            127508: 'Battery Status',
            127509: 'Inverter Status',
            128275: 'Distance Log',
            128259: 'Speed',
            128267: 'Water Depth',
            129025: 'Position Rapid Update',
            129026: 'COG & SOG Rapid Update',
            129027: 'Position Delta High Precision',
            129028: 'Altitude Delta High Precision',
            129029: 'GNSS Position Data',
            129033: 'Time & Date',
            129038: 'AIS Class A Position Report',
            129039: 'AIS Class B Position Report',
            129040: 'AIS Class B Extended Position Report',
            129041: 'AIS Aids to Navigation (AtoN) Report',
            129283: 'Cross Track Error',
            129284: 'Navigation Data'
        }
        return sensorMap[pgn] || 'Unknown Sensor'
    }

    function updateDeviceData(pgnData)
    {
        const now = Date.now()
        const src = pgnData.src


        if (!devices.value.has(src)) {
            devices.value.set(src, {
                src,
                firstSeen: now,
                lastSeen:  now,
                pgnCount:  0,
                updates:   1,
                pgns:      new Set(),
                servers:   new Set()
            })
        }

        const device = devices.value.get(src)
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

            case 127237: // Heading/Track Control
            case 127250: // Vessel Heading
            case 127251: // Rate of Turn
            case 127257: // Attitude
                if (pgnData.fields) {
                    device.sensorType = getSensorType(pgnData.pgn)
                    device.measurements = device.measurements || new Map()
                    device.measurements.set(pgnData.description, {
                        pgn:         pgnData.pgn,
                        description: pgnData.description,
                        timestamp:   new Date().toISOString()
                    })
                }
                break
        }

        if (!device.pgns.has(pgnData.pgn)) {
            device.pgnCount++
            device.pgns.add(pgnData.pgn)
        }
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
        if (!pgns.value.has(src)) {
            pgns.value.set(src, new Map())
        }

        const devicePgns = pgns.value.get(src)
        const existingPgn = devicePgns.get(pgnId)

        // console.log(src, pgns);
        // console.log(devicePgns);

        // Find changed fields
        const updatedFields = []
        if (existingPgn && newData.fields) {
            Object.keys(newData.fields).forEach(field => {
                if (existingPgn.fields &&
                    JSON.stringify(existingPgn.fields[field]) !== JSON.stringify(newData.fields[field])) {
                    updatedFields.push(field)
                }
            })
        }

        // Mark as new for animation
        newData.isNew = true
        newData.updatedFields = updatedFields

        // Update the PGN
        devicePgns.set(pgnId, newData)

        // Clear animation after delay
        setTimeout(() => {
            const currentPgn = pgns.value.get(src)?.get(pgnId)
            if (currentPgn) {
                currentPgn.isNew = false
                currentPgn.updatedFields = []
            }
        }, 1000)
    }

    function addToHistory(pgnData)
    {
        history.value.unshift({
            ...pgnData,
            historyId: `hist_${Date.now()}_${Math.random()}`
        })

        // Limit history size based on config
        const maxHistory = config.value.maxHistory || 5000
        if (history.value.length > maxHistory) {
            history.value.length = maxHistory
        }
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

        // 1. Update device
        updateDeviceData(pgnData)

        // 2. Update PGN data
        updatePgnData(pgnData)

        // 3. Add to history
        addToHistory(pgnData)

        //4. update servers source
        updateServers(pgnData)


    }

    function clearAllData()
    {
        devices.value.clear()
        pgns.value.clear()
        history.value = []
    }

    return {
        ws,
        isConnected,
        isConnecting,
        connectionError,
        devices,
        servers,
        pgns,
        lastPgn,
        history,
        processPgnUpdate,
        connectionStatus,
        connectWebSocket,
        disconnectWebSocket,
        reconnectWebSocket,
        clearAllData
    }
}