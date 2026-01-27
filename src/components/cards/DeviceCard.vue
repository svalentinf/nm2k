<template>
    <div
            class="device-card"
            :class="{ active: selected }"
            @click="$emit('selectDevice', device.src)"
    >
        <div class="device-name">
            <span>{{ device.name }}</span>
            <span class="device-src">SRC: {{ device.src }}</span>
        </div>
        <div class="device-stats">
            <div class="device-stat">
                <div class="device-stat-label">PGNs</div>
                <div class="device-stat-value">{{ device.pgnCount }}</div>
            </div>
            <div class="device-stat">
                <div class="device-stat-label">Updates</div>
                <div class="device-stat-value">{{ device.updates }}</div>
            </div>
            <div class="device-stat">
                <div class="device-stat-label">First Seen</div>
                <div class="device-stat-value">{{ formatTime(device.firstSeen, true) }}</div>
            </div>
            <div class="device-stat">
                <div class="device-stat-label">Last Seen</div>
                <div class="device-stat-value">{{ formatTime(device.lastSeen, true) }}</div>
            </div>
        </div>
        <div class="pgn-list">
            PGN's:
            <span
                    v-for="[pgn, pgnInfo] in device.pgns"
                    :key="pgn"
                    :class="{'item':true, 'active' : pgn==pgnFilter}"
                    @click.stop="$emit('filterPgn', pgn)"
            >
                {{ pgn }}
            </span>
        </div>
        <div class="server-list">
            Servers:
            <span
                    v-for="server in device.servers"
                    :class="{'item':true, 'active' : server==serverFilter}"
                    :key="server"
            >
                {{ server }}
            </span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    device:       Object,
    selected:     Boolean,
    pgnFilter:    [String, Number],
    serverFilter: [String, Number]
})

defineEmits(['selectDevice', 'filterPgn'])

function formatTime(timestamp, short = false)
{
    if (!timestamp) return 'N/A'

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (short) {
        const minutes = Math.floor(diff / 60000)
        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
    }

    return date.toLocaleTimeString([], {
        hour:                   '2-digit',
        minute:                 '2-digit',
        second:                 '2-digit',
        fractionalSecondDigits: 3
    })
}
</script>