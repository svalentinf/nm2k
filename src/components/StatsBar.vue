<template>
  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-number">{{ totalDevices }}</div>
      <div class="stat-label">Devices</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">{{ totalPgns }}</div>
      <div class="stat-label">Active PGNs</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">{{ totalUpdates }}</div>
      <div class="stat-label">Total Updates</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalDevices: Number,
  totalPgns: Number,
  totalUpdates: Number,
  historyLength: Number
})
</script>