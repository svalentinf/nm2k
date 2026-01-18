<template>
    <div class="dashboard">
        <DevicesPanel
                :devicesList="devicesList"
                :selectedDevice="selectedDevice"
                :pgnFilter="pgnFilter"
                :serverFilter="serverFilter"
                @select-device="selectDevice"
                @filter-pgn="filterPgn"
        />

        <PgnsPanel
                :filteredPgns="filteredPgns"
                :panelTitle="panelTitle"
                :pgnFilter="pgnFilter"
                @select-device="selectDevice"
                @filter-pgn="filterPgn"
        />

        <HistoryPanel
                :filteredHistory="filteredHistory"
                @clear-history="clearHistory"
        />
    </div>
</template>

<script setup>
import DevicesPanel from './panels/DevicesPanel.vue'
import PgnsPanel from './panels/PgnsPanel.vue'
import HistoryPanel from './panels/HistoryPanel.vue'

defineProps({
    devicesList:     Array,
    filteredPgns:    Array,
    filteredHistory: Array,
    selectedDevice:  [String, Number],
    serverFilter:    String,
    pgnFilter:       String,
    panelTitle:      String
})

const emit = defineEmits(['select-device', 'filter-pgn', 'clear-history'])

function selectDevice(src)
{
    emit('select-device', src)
}

function filterPgn(pgn, event)
{
    emit('filter-pgn', pgn, event)
}

function clearHistory()
{
    emit('clear-history')
}
</script>