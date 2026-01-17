<template>
  <div
    class="pgn-card"
    :class="{ updated: pgn.isNew }"
  >
    <div class="pgn-header">
      <span class="pgn-id">
        <span @click="$emit('filter-pgn', pgn.pgn)" style="cursor: zoom-in;">PGN</span>
        {{ pgn.pgn }}
      </span>
      <span
        style="color: var(--text-light); font-size: 0.9rem; cursor: zoom-in;"
        @click="$emit('select-device', pgn.src)"
      >
        Device {{ pgn.src }}
      </span>
    </div>
    <div class="pgn-description">{{ pgn.description }}</div>
    <div class="fields-grid">
      <div
        v-for="(value, field) in pgn.fields"
        :key="field"
        class="field-row"
        :class="{ updated: pgn.updatedFields?.includes(field) }"
      >
        <span class="field-name">{{ field }}</span>
        <span class="field-value">{{ formatValue(value) }}</span>
      </div>
    </div>
    <div class="pgn-footer">
      <span>{{ formatTime(pgn.timestamp) }}</span>
      <span style="color: var(--text-light);">
        {{ pgn.direction || 'Unknown' }}
      </span>
    </div>
    <div class="pgn-raw">
      {{ pgn.raw }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  pgn: Object,
  pgnFilter: [String, Number]
})

defineEmits(['select-device', 'filter-pgn'])

function formatTime(timestamp) {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

function formatValue(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
