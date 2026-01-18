<template>
    <div id="app" :class="themeClass">
        <div class="app-container">
            <Header
                    :is-connected="isConnected"
                    :connection-status="connectionStatus"
                    :total-devices="totalDevices"
                    :total-pgns="totalPgns"
                    @open-settings="isConfigModalVisible = true"
            />

            <!-- Connection Status Bar -->
            <div v-if="connectionError" class="error-banner">
                <i class="fas fa-exclamation-triangle"></i>
                Connection Error: {{ connectionError.message }}
                <button class="btn btn-sm" @click="reconnect">
                    <i class="fas fa-redo"></i> Reconnect
                </button>
            </div>

            <StatsBar
                    :total-devices="totalDevices"
                    :total-pgns="totalPgns"
                    :total-updates="totalUpdates"
                    :history-length="history.length"
            />

            <Controls
                    :auto-update="autoUpdate"
                    :search-query="searchQuery"
                    :server-filter="serverFilter"
                    :pgn-filter="pgnFilter"
                    :devices-list="devicesList"
                    :servers-list="serversList"
                    :unique-pgns="uniquePgns"
                    @update:autoUpdate="autoUpdate = $event"
                    @update:searchQuery="searchQuery = $event"
                    @update:pgnFilter="pgnFilter = $event"
                    @update:serverFilter="serverFilter = $event"
                    @clear-history="clearHistory"
                    @clear-data="clearAllData"
            />

            <Dashboard
                    :devices-list="devicesList"
                    :filtered-pgns="filteredPgns"
                    :filtered-history="filteredHistory"
                    :selected-device="selectedDevice"
                    :server-filter="serverFilter"
                    :pgn-filter="pgnFilter"
                    :panel-title="panelTitle"
                    @select-device="selectDevice"
                    @filter-pgn="filterPgn"
                    @clear-history="clearHistory"
            />

            <!-- Config Button (Floating) -->
            <button class="config-button" @click="isConfigModalVisible = true">
                <i class="fas fa-cog"></i>
            </button>

            <!-- Config Modal -->
            <ConfigModal
                    v-if="isConfigModalVisible"
                    :is-visible="isConfigModalVisible"
                    @close="isConfigModalVisible = false"
                    @config-change="onConfigChange"
            />
        </div>
    </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import Header from './components/Header.vue'
import StatsBar from './components/StatsBar.vue'
import Controls from './components/Controls.vue'
import Dashboard from './components/Dashboard.vue'
import ConfigModal from './components/ConfigModal.vue'
import {useConfigStore} from './composables/useConfigStore'
import {useNmeaWebSocket} from './composables/useNmeaWebSocket'

// Config store
const {config} = useConfigStore()

// UI State
const selectedDevice = ref(null)
const searchQuery = ref('')
const serverFilter = ref('')
const pgnFilter = ref('')
const autoUpdate = ref(true)
const isConfigModalVisible = ref(false)

// Use WebSocket composable with config
const {
          isConnected,
          isConnecting,
          connectionError,
          devices,
          servers,
          pgns,
          history,
          connectionStatus,
          connectWebSocket,
          disconnectWebSocket,
          reconnectWebSocket,
          clearAllData
      } = useNmeaWebSocket(autoUpdate, config)

// Watch for theme changes
const themeClass = computed(() => {
    if (config.value.theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light'
    }
    return `theme-${config.value.theme}`
})

// Computed properties
const devicesList = computed(() => {
    return Array.from(devices.value.values())
                .sort((a, b) => a.src - b.src)
                .map(device => ({
                    ...device,
                    firstSeen: new Date(device.firstSeen),
                    lastSeen:  new Date(device.lastSeen)
                }))
})

const serversList = computed(() => {
    return Array.from(servers.value.values())
})

const allPgns = computed(() => {
    const all = []
    for (const [src, devicePgnsMap] of pgns.value.entries()) {
        for (const [pgnId, pgnData] of devicePgnsMap.entries()) {
            // Apply age filter from config
            const age = Date.now() - new Date(pgnData.timestamp).getTime()
            if (config.value.filters.maxAge > 0 && age > config.value.filters.maxAge) {
                continue
            }

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
        filtered = filtered.filter(pgn => pgn.src.toString() === selectedDevice.value.toString())
    }
    if (serverFilter.value !== '') {
        filtered = filtered.filter(pgn =>
            pgn.serverAddress.toString() === serverFilter.value.toString()
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
            (typeof pgn.serverAddress === 'string' && pgn.serverAddress.toLowerCase().includes(query)) ||
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

    if (serverFilter.value) {
        filtered = filtered.filter(item =>
            item.serverAddress.toString() === serverFilter.value.toString()
        )
    }

    if (pgnFilter.value) {
        filtered = filtered.filter(item =>
            item.pgn.toString() === pgnFilter.value.toString()
        )
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(item =>
            (typeof item.description === 'string' && item.description.toLowerCase().includes(query)) ||
            (typeof item.serverAddress === 'string' && item.serverAddress.toLowerCase().includes(query)) ||
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
    if (serverFilter.value) {
        return `Server ${serverFilter.value} PGNs`
    }
    return 'All PGNs'
})

// Methods
function selectDevice(src)
{
    selectedDevice.value = selectedDevice.value === src ? null : src
}

function filterPgn(value, event)
{
    if (event) {
        event.stopPropagation()
    }
    pgnFilter.value = pgnFilter.value !== value ? value.toString() : ''
}

function selectServer(value, event)
{
    if (event) {
        event.stopPropagation()
    }
    serverFilter.value = serverFilter.value !== value ? value.toString() : ''
}

function clearHistory()
{
    if (confirm('Clear all history?')) {
        history.value = []
    }
}

function reconnect()
{
    reconnectWebSocket()
}

function onConfigChange(newConfig)
{
    // Update theme if changed
    if (newConfig.theme !== config.value.theme) {
        applyTheme(newConfig.theme)
    }
}

function applyTheme(theme)
{
    document.documentElement.setAttribute('data-theme', theme)
}

// Lifecycle
onMounted(() => {
    // Apply initial theme
    applyTheme(config.value.theme)

    // Set up theme change listener for auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
        if (config.value.theme === 'auto') {
            applyTheme('auto')
        }
    })

    // Auto-connect if configured
    if (config.value.autoConnect) {
        connectWebSocket()
    }
})
</script>

<style>
.error-banner {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    animation: slideDown 0.3s ease-out;
}

.error-banner .btn {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.error-banner .btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.config-button {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--primary);
    color: white;
    border: none;
    box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    z-index: 100;
    transition: all 0.3s ease;
}

.config-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 30px rgba(var(--primary-rgb), 0.4);
}

.config-button:active {
    transform: scale(0.95);
}

/* Theme variables */
:root {
    --primary: #3498db;
    --primary-rgb: 52, 152, 219;
    --success: #2ecc71;
    --warning: #f39c12;
    --danger: #e74c3c;
}

.theme-dark {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #e0e0e0;
    --text-secondary: #b0b0b0;
    --text-light: #888888;
    --border-color: #2d3748;
    --card-bg: rgba(255, 255, 255, 0.05);
}

.theme-light {
    --bg-primary: #f8f9fa;
    --bg-secondary: #e9ecef;
    --bg-tertiary: #dee2e6;
    --text-primary: #212529;
    --text-secondary: #495057;
    --text-light: #6c757d;
    --border-color: #ced4da;
    --card-bg: rgba(0, 0, 0, 0.02);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>