<template>
    <div class="history-item">
        <div class="history-header">
            <span class="history-pgn">PGN {{ item.pgn }}</span>
            <span class="history-device">
                Device {{ item.src }}
                <br>
                {{ item.serverAddress }}
              </span>
        </div>
        <div class="history-description">{{ item.description }}</div>
        <div class="history-time">
            {{ formatTime(item.timestamp) }}
        </div>
        <div v-if="item.fields" class="fields-grid">
            <div
                    v-for="(value, field) in item.fields"
                    :key="field"
                    class="field-row"
            >
                <span class="field-name">{{ field }}</span>
                <span class="field-value">{{ formatValue(value) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    item: Object
})

function formatTime(timestamp)
{
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
        hour:                   '2-digit',
        minute:                 '2-digit',
        second:                 '2-digit',
        fractionalSecondDigits: 3
    })
}

function formatValue(value)
{
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}
</script>