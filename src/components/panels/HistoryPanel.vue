<template>
  <div class="panel">
    <div class="panel-header">
      <h3 class="panel-title">
        <i class="fas fa-history"></i>
        Recent History
      </h3>
      <button class="btn" @click="$emit('clear-history')" style="padding: 5px 10px; font-size: 0.9rem;">
        Clear
      </button>
    </div>
    <div class="panel-content">
      <div class="history-list">
        <HistoryItem
          v-for="item in filteredHistory"
          :key="item.id"
          :item="item"
        />
        <div v-if="filteredHistory.length === 0" class="empty-state">
          <i class="fas fa-clock"></i>
          <p>No history yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HistoryItem from '../cards/HistoryItem.vue'

defineProps({
  filteredHistory: Array
})

defineEmits(['clear-history'])
</script>
