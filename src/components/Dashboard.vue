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
                :filteredPGNs="filteredPGNs"
                :panelTitle="panelTitle"
                :pgnFilter="pgnFilter"
                :blockedPGNs="blockedPGNs"
                :filteredHistory="filteredHistory"
                @selectDevice="$emit('selectDevice', $event)"
                @filterPgn="$emit('filterPgn', $event)"
                @blockPgn="$emit('blockPgn', $event)"
        />

        <HistoryPanel
                :filteredHistory="filteredHistory"
                @clearHistory="clearHistory"
        />
    </div>
</template>

<script setup>
import DevicesPanel from './panels/DevicesPanel.vue'
import PgnsPanel from './panels/PgnsPanel.vue'
import HistoryPanel from './panels/HistoryPanel.vue'

defineProps({
    devicesList:     Array,
    filteredPGNs:    Array,
    blockedPGNs:     Set,
    filteredHistory: Array,
    selectedDevice:  [String, Number],
    serverFilter:    String,
    pgnFilter:       String,
    panelTitle:      String
})

const emit = defineEmits(['selectDevice', 'filterPgn', 'blockPgn', 'clearHistory'])

function clearHistory()
{
    emit('clearHistory')
}
</script>