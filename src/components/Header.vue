<template>
    <header>
        <h1>NMEA live analysis</h1>
        <div :class="{ connected: isConnected }" class="status">
            <div class="status-dot"></div>
            <span>{{ connectionStatus }}</span>
            <span v-if="isConnected">• {{ totalDevices }} devices • {{ totalPgns }} PGNs/sentences</span>

            <button v-if="!isConnected" class="btn btn-primary btn-sm"
                    @click="$emit('connectWebSocket')">
                <i :class="isConnecting?'btn-fa-plug-circle-bolt':'fa-plug'" class="fas fa-plug"></i> Connect
            </button>
            <button v-else-if="isConnecting" class="btn btn-primary btn-sm"
                    @click="$emit('connectWebSocket')">
                <i :class="isConnecting?'btn-fa-plug-circle-bolt':'fa-plug'" class="fas fa-plug-circle-bolt"></i> Connecting
            </button>
            <button v-if="isConnected" class="btn btn-danger btn-sm" @click="$emit('disconnectWebSocket')">
                <i class="fas fa-plug-circle-minus"></i> Disconnect
            </button>
        </div>
    </header>
</template>

<script setup>
defineProps({
    isConnected:      Boolean,
    isConnecting:     Boolean,
    connectionStatus: String,
    totalDevices:     Number,
    totalPgns:        Number
})
</script>