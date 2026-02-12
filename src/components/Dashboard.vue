<template>
    <div class="dashboard">
        <DevicesPanel
                :devicesList="devicesList"
                :pgnFilter="pgnFilter"
                :selectedDevice="selectedDevice"
                :serverFilter="serverFilter"
                @filterPgn="$emit('filterPgn', $event)"
                @selectDevice="$emit('selectDevice', $event)"
        />

        <PgnsPanel
                :autoUpdate="autoUpdate"
                :blockedPGNs="blockedPGNs"
                :filteredPGNs="filteredPGNs"
                :panelTitle="panelTitle"
                :pgnFilter="pgnFilter"
                :trackingPGNs="trackingPGNs"
                @blockPgn="$emit('blockPgn', $event)"
                @filterPgn="$emit('filterPgn', $event)"
                @selectDevice="$emit('selectDevice', $event)"
                @trackPgn="$emit('trackPgn', $event)"
        />

    </div>
</template>

<script setup>
import DevicesPanel from './panels/DevicesPanel.vue'
import PgnsPanel from './panels/PgnsPanel.vue'

defineProps({
    devicesList:    Array,
    filteredPGNs:   Array,
    blockedPGNs:    Set,
    trackingPGNs:   Set,
    selectedDevice: [String, Number],
    serverFilter:   String,
    pgnFilter:      String,
    panelTitle:     String,
    autoUpdate:     Boolean,
})

const emit = defineEmits(['selectDevice', 'filterPgn', 'blockPgn', 'trackPgn'])

</script>