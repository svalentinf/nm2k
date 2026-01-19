<template>
    <div class="panel">
        <div class="panel-header">
            <h3 class="panel-title">
                <i class="fas fa-stream"></i>
                {{ panelTitle }}
            </h3>
            <span class="stat-number" style="font-size: 1.5rem;">{{ filteredPgns.length }}</span>
        </div>
        <div class="panel-content">
            <div class="pgns-grid">
                <PgnCard
                        v-for="pgn in filteredPgns"
                        :key="pgn.id"
                        :pgn="pgn"
                        :pgn-filter="pgnFilter"
                        :filteredHistory="filteredHistory"
                        @select-device="$emit('select-device', $event)"
                        @filter-pgn="$emit('filter-pgn', $event)"
                />
                <div v-if="filteredPgns.length === 0" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No PGNs match your filters</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import PgnCard from '../cards/PgnCard.vue'

defineProps({
    filteredPgns:    Array,
    panelTitle:      String,
    pgnFilter:       String,
    filteredHistory: Array,
})

defineEmits(['select-device', 'filter-pgn'])
</script>