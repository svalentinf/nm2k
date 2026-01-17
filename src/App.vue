<template>
  <div id="app">
    <div class="app-container">
      <Header
        :is-connected="isConnected"
        :connection-status="connectionStatus"
        :total-devices="totalDevices"
        :total-pgns="totalPgns"
      />

      <StatsBar
        :total-devices="totalDevices"
        :total-pgns="totalPgns"
        :total-updates="totalUpdates"
        :history-length="history.length"
      />

      <Controls
        :auto-update="autoUpdate"
        :search-query="searchQuery"
        :device-filter="deviceFilter"
        :pgn-filter="pgnFilter"
        :devices-list="devicesList"
        :unique-pgns="uniquePgns"
        @update:autoUpdate="autoUpdate = $event"
        @update:searchQuery="searchQuery = $event"
        @update:deviceFilter="deviceFilter = $event"
        @update:pgnFilter="pgnFilter = $event"
        @clear-history="clearHistory"
      />

      <Dashboard
        :devices-list="devicesList"
        :filtered-pgns="filteredPgns"
        :filtered-history="filteredHistory"
        :selected-device="selectedDevice"
        :device-filter="deviceFilter"
        :pgn-filter="pgnFilter"
        :panel-title="panelTitle"
        @select-device="selectDevice"
        @filter-pgn="filterPgn"
        @clear-history="clearHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from './components/Header.vue'
import StatsBar from './components/StatsBar.vue'
import Controls from './components/Controls.vue'
import Dashboard from './components/Dashboard.vue'
import { useNmeaWebSocket } from './composables/useNmeaWebSocket'

// UI State
const selectedDevice = ref(null)
const searchQuery = ref('')
const deviceFilter = ref('')
const pgnFilter = ref('')
const autoUpdate = ref(true)

// Use WebSocket composable
const {
        isConnected,
        devices,
        pgns,
        history,
        connectionStatus,
        connectWebSocket
      } = useNmeaWebSocket(autoUpdate)

// Connect WebSocket on mount
onMounted(() => {
  connectWebSocket()
})

// Computed properties (same as before)
const devicesList = computed(() => {
  return Array.from(devices.value.values())
              .sort((a, b) => a.src - b.src)
              .map(device => ({
                ...device,
                firstSeen: new Date(device.firstSeen),
                lastSeen: new Date(device.lastSeen)
              }))
})

const allPgns = computed(() => {
  const all = []
  for (const [src, devicePgnsMap] of pgns.value.entries()) {
    for (const [pgnId, pgnData] of devicePgnsMap.entries()) {
      all.push({
        ...pgnData,
        deviceSrc: src
      })
    }
  }
  return all
})

const filteredPgns = computed(() => {
  let filtered = allPgns.value

  // Apply filters
  if (selectedDevice.value !== null) {
    filtered = filtered.filter(pgn => pgn.src === selectedDevice.value)
  }

  if (deviceFilter.value !== '') {
    filtered = filtered.filter(pgn =>
      pgn.src.toString() === deviceFilter.value
    )
  }

  if (pgnFilter.value !== '') {
    filtered = filtered.filter(pgn =>
      pgn.pgn.toString() === pgnFilter.value.toString()
    )
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pgn =>
      (typeof pgn.description === 'string' && pgn.description.toLowerCase().includes(query)) ||
      pgn.pgn.toString().includes(query) ||
      Object.keys(pgn.fields || {}).some(field =>
        field.toLowerCase().includes(query)
      ) ||
      Object.values(pgn.fields || {}).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }

  filtered.sort((a, b) => (Number(a.src) || 0) - (Number(b.src) || 0))
  filtered.sort((a, b) => (Number(a.pgn) || 0) - (Number(b.pgn) || 0))

  return filtered
})

const filteredHistory = computed(() => {
  let filtered = history.value

  if (deviceFilter.value) {
    filtered = filtered.filter(item =>
      item.src.toString() === deviceFilter.value.toString()
    )
  }

  if (pgnFilter.value) {
    filtered = filtered.filter(item =>
      item.pgn.toString() === pgnFilter.value.toString()
    )
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      (typeof item.description === 'string' && item.description.toLowerCase().includes(query)) ||
      item.pgn.toString().includes(query)
    )
  }

  return filtered.slice(0, 50)
})

const totalDevices = computed(() => devices.value.size)
const totalPgns = computed(() => allPgns.value.length)
const totalUpdates = computed(() =>
  Array.from(devices.value.values())
       .reduce((sum, device) => sum + device.updates, 0)
)

const uniquePgns = computed(() => {
  const pgnSet = new Set()
  allPgns.value.forEach(pgn => pgnSet.add(pgn.pgn))
  return Array.from(pgnSet).sort((a, b) => a - b)
})

const panelTitle = computed(() => {
  if (selectedDevice.value) {
    return `Device ${selectedDevice.value} PGNs`
  }
  if (deviceFilter.value) {
    return `Device ${deviceFilter.value} PGNs`
  }
  return 'All PGNs'
})

// Methods
function selectDevice(src) {
  selectedDevice.value = selectedDevice.value === src ? null : src
}

function filterPgn(pgn, event) {
  if (event) {
    event.stopPropagation()
  }
  pgnFilter.value = pgnFilter.value !== pgn ? pgn : ''
}

function clearHistory() {
  if (confirm('Clear all history?')) {
    history.value = []
  }
}
</script>
