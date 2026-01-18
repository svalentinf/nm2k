<template>
    <div class="panel">
        <div class="panel-header">
            <h3 class="panel-title">
                <i class="fas fa-microchip"></i>
                Connected Devices
            </h3>
            <span class="stat-number" style="font-size: 1.5rem;">{{ devicesList.length }}</span>
        </div>
        <div class="panel-content">
            <div class="devices-list">
                <DeviceCard
                        v-for="device in devicesList"
                        :key="device.src"
                        :device="device"
                        :selected="selectedDevice === device.src"
                        :pgn-filter="pgnFilter"
                        :server-filter="serverFilter"
                        @select-device="$emit('select-device', device.src)"
                        @filter-pgn="$emit('filter-pgn', $event)"
                />
                <div v-if="devicesList.length === 0" class="empty-state">
                    <i class="fas fa-plug"></i>
                    <p>No devices connected yet</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import DeviceCard from '../cards/DeviceCard.vue'

defineProps({
    devicesList:    Array,
    selectedDevice: [String, Number],
    serverFilter:   [String, Number],
    pgnFilter:      String
})

defineEmits(['select-device', 'filter-pgn'])
</script>