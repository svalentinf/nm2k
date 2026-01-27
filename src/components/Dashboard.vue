<template>
    <div class="dashboard">
        <DevicesPanel
                :devicesList="devicesList"
                :selectedDevice="selectedDevice"
                :pgnFilter="pgnFilter"
                :serverFilter="serverFilter"
                @selectDevice="$emit('selectDevice', $event)"
                @filterPgn="$emit('filterPgn', $event)"
        />

        <PgnsPanel
                :autoUpdate="autoUpdate"
                :filteredPGNs="filteredPGNs"
                :panelTitle="panelTitle"
                :pgnFilter="pgnFilter"
                :blockedPGNs="blockedPGNs"
                :trackingPGNs="trackingPGNs"
                @selectDevice="$emit('selectDevice', $event)"
                @filterPgn="$emit('filterPgn', $event)"
                @blockPgn="$emit('blockPgn', $event)"
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

const emit = defineEmits(['selectDevice', 'filterPgn', 'blockPgn', 'clearHistory', 'trackPgn'])

function clearHistory()
{
    emit('clearHistory')
}
</script>