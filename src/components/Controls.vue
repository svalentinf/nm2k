<template>
    <div class="controls">
        <button class="btn" @click="toggleAutoUpdate">
            <i :class="autoUpdate ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ autoUpdate ? 'Pause Updates' : 'Resume Updates' }}
        </button>
        <button class="btn btn-outline" @click="$emit('clear-history')">
            <i class="fas fa-trash"></i> Clear History
        </button>
        <input
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                placeholder="Search PGNs or fields..."
                class="search"
        >
        <select
                :value="serverFilter"
                @change="$emit('update:serverFilter', $event.target.value)"
                class="search"
        >
            <option value="">All Servers</option>
            <option v-for="server in serversList" :key="server" :value="server">
                Server {{ server }}
            </option>
        </select>
        <select
                :value="pgnFilter"
                @change="$emit('update:pgnFilter', $event.target.value)"
                class="search"
        >
            <option value="">All PGNs</option>
            <option v-for="pgn in uniquePgns" :key="pgn" :value="pgn">
                PGN {{ pgn }}
            </option>
        </select>
    </div>
</template>

<script setup>
const props = defineProps({
    autoUpdate:   Boolean,
    searchQuery:  String,
    serverFilter: String,
    pgnFilter:    String,
    serversList:  Array,
    uniquePgns:   Array
})

const emit = defineEmits([
    'update:autoUpdate',
    'update:searchQuery',
    'update:serverFilter',
    'update:pgnFilter',
    'toggle-auto-update',
    'clear-history'
])

function toggleAutoUpdate()
{
    emit('update:autoUpdate', !props.autoUpdate)
}
</script>