<template>
    <header>
        <h1>NMEA live analysis</h1>
        <div class="status" :class="{ connected: isConnected }">
            <div class="status-dot"></div>
            <span>{{ connectionStatus }}</span>
            <span v-if="isConnected">• {{ totalDevices }} devices • {{ totalPgns }} PGNs/sentences</span>
        </div>
    </header>
</template>

<script setup>
defineProps({
    isConnected:      Boolean,
    connectionStatus: String,
    totalDevices:     Number,
    totalPgns:        Number
})
</script>