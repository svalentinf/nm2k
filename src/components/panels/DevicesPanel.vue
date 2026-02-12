<template>
    <div class="panel">
        <div class="panel-header">
            <h3 class="panelTitle">
                <i class="fas fa-microchip"></i>
                Connected Devices
            </h3>
            <span class="stat-number" style="font-size: 1.5rem;">{{ devicesList.length }}</span>
        </div>
        <div class="panel-content">
            <div class="devicesList">
                <DeviceCard
                        v-for="device in devicesList"
                        :key="device.src"
                        :device="device"
                        :pgnFilter="pgnFilter"
                        :selected="selectedDevice === device.src"
                        :serverFilter="serverFilter"
                        @filterPgn="$emit('filterPgn', $event)"
                        @selectDevice="$emit('selectDevice', $event)"
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

defineEmits(['selectDevice', 'filterPgn', 'trackPgn'])
</script>