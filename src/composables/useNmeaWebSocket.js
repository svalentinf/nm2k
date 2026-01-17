import { ref, computed } from 'vue'

export function useNmeaWebSocket(autoUpdate) {
  const ws = ref(null)
  const isConnected = ref(false)

  // Data stores
  const devices = ref(new Map())
  const pgns = ref(new Map())
  const history = ref([])

  const MAX_HISTORY = 5000;

  const connectionStatus = computed(() =>
    isConnected.value ? 'Connected' : 'Disconnected'
  )

  function connectWebSocket() {
    const wsUrl = 'ws://localhost:8080'
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      console.log('WebSocket connected')
      isConnected.value = true
    }

    ws.value.onmessage = (event) => {
      if (!autoUpdate.value) return
      const data = JSON.parse(event.data)
      processPgnUpdate(data.data)
    }

    ws.value.onclose = () => {
      console.log('WebSocket disconnected')
      isConnected.value = false
      setTimeout(connectWebSocket, 1000)
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  function getSensorType(pgn) {
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

  function updateDeviceData(src, pgnData) {
    const now = Date.now()

    if (!devices.value.has(src)) {
      devices.value.set(src, {
        src,
        firstSeen: now,
        lastSeen: now,
        pgnCount: 0,
        updates: 1,
        pgns: new Set()
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
            pgn: pgnData.pgn,
            description: pgnData.description,
            timestamp: new Date().toISOString()
          })
        }
        break
    }

    if (!device.pgns.has(pgnData.pgn)) {
      device.pgnCount++
      device.pgns.add(pgnData.pgn)
    }
  }

  function updatePgnData(src, pgnId, newData) {
    if (!pgns.value.has(src)) {
      pgns.value.set(src, new Map())
    }

    const devicePgns = pgns.value.get(src)
    const existingPgn = devicePgns.get(pgnId)

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

  function addToHistory(pgnData) {
    history.value.unshift({
      ...pgnData,
      historyId: `hist_${Date.now()}_${Math.random()}`
    })

    // Limit history size
    if (history.value.length > MAX_HISTORY) {
      history.value.length = MAX_HISTORY
    }
  }

  function processPgnUpdate(pgnData) {
    const src = pgnData.src
    const pgnId = pgnData.pgn

    // 1. Update device
    updateDeviceData(src, pgnData)

    // 2. Update PGN data
    updatePgnData(src, pgnId, pgnData)

    // 3. Add to history
    addToHistory(pgnData)
  }

  return {
    ws,
    isConnected,
    devices,
    pgns,
    history,
    processPgnUpdate,
    connectionStatus,
    connectWebSocket
  }
}
