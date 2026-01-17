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
      :value="deviceFilter"
      @change="$emit('update:deviceFilter', $event.target.value)"
      class="search"
    >
      <option value="">All Devices</option>
      <option v-for="device in devicesList" :key="device.src" :value="device.src">
        Device {{ device.src }} ({{ device.pgnCount }} PGNs)
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
  autoUpdate: Boolean,
  searchQuery: String,
  deviceFilter: String,
  pgnFilter: String,
  devicesList: Array,
  uniquePgns: Array
})

const emit = defineEmits([
  'update:autoUpdate',
  'update:searchQuery',
  'update:deviceFilter',
  'update:pgnFilter',
  'toggle-auto-update',
  'clear-history'
])

function toggleAutoUpdate() {
  emit('update:autoUpdate', !props.autoUpdate)
}
</script>
