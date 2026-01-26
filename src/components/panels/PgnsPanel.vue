<template>
    <div class="panel">
        <div class="panel-header">
            <h3 class="panelTitle">
                <i class="fas fa-stream"></i>
                {{ panelTitle }}
            </h3>
            <span class="stat-number" style="font-size: 1.5rem;">{{ filteredPGNs.length }}</span>
        </div>
        <div class="panel-content">
            <div class="pgns-grid">
                <PgnCard
                        v-for="pgn in filteredPGNs"
                        :key="pgn.id"
                        :pgn="pgn"
                        :pgnFilter="pgnFilter"
                        :blockedPGNs="blockedPGNs"
                        :filteredHistory="filteredHistory"
                        @selectDevice="$emit('selectDevice', $event)"
                        @filterPgn="$emit('filterPgn', $event)"
                        @blockPgn="$emit('blockPgn', $event)"
                />
                <div v-if="filteredPGNs.length === 0" class="empty-state">
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
    filteredPGNs:    Array,
    blockedPGNs:     Set,
    panelTitle:      String,
    pgnFilter:       String,
    filteredHistory: Array,
})

defineEmits(['selectDevice', 'filterPgn', 'blockPgn'])
</script>