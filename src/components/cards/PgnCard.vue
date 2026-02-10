<template>
    <div class="pgn-card"
         :class="{ updated: pgn.isNew }"
    >
        <div class="pgn-header">
            <span class="pgn-id">
                <span v-if="pgn.fields && pgn.fields.longitude" :class="{'text-success':trackingPGNs.has(`${pgn.src}:${pgn.pgn}`)}" @click="$emit('trackPgn', `${pgn.src}:${pgn.pgn}`)" style="cursor: crosshair;">
                    <i class="fas fa-map-location"></i>&nbsp;</span>
                <span @click="$emit('filterPgn', pgn.pgn)" style="cursor: zoom-in;">
                    <i class="fas fa-magnifying-glass"></i>&nbsp;PGN
                </span>
                <span v-if="typeof pgn.pgn === 'number'" @click="$emit('blockPgn', computedPgn)" :class="{'text-danger':blockedPGNs.has(computedPgn)}" style="cursor: not-allowed">
                    <i class="fas " :class="{'fa-ban':blockedPGNs.has(computedPgn), 'fa-plus-circle':!blockedPGNs.has(computedPgn)}"></i>
                </span>
                {{ pgn.pgn }}
                <span v-if="typeof pgn.pgn === 'number'">[{{ pgn.pgn.toString(16).padStart(5, '0').toUpperCase() }}]</span>
            </span>
            <span style="color: var(--text-light); font-size: 0.9rem; text-align: right">
                <span @click="$emit('selectDevice', pgn.src)" style="cursor: zoom-in;">Device</span> {{ `${pgn.src} [${pgn.src.toString(16).padStart(2, '0').toUpperCase()}]` }}<br>
                <span>{{ pgn.servers.implode(', ')}}</span>
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
                <span class="field-value">
                    <template v-if="field === 'latitude'">
                        {{ formatPosition(value, true) }}
                        <br>
                        <span class="small">{{ formatValue(value) }}</span>
                    </template>
                    <template v-else-if="field === 'longitude'">
                        {{ formatPosition(value, false) }}
                        <br>
                        <span class="small">{{ formatValue(value) }}</span>
                    </template>
                    <span v-else-if="field === 'heading'
                        || field === 'windAngle'
                        || field === 'courseOverGroundMagnetic'
                        || field === 'courseOverGroundTrue'
                        || field === 'headingMagnetic'
                        || field === 'headingCompass'
                        || field === 'headingTrue'
                        || field === 'angleApparent'
                        || field === 'angleTrueWater'
">
                        {{ formatAngle(value, false) }}
                        <br>
                        <span class="small">{{ formatValue(value) }}</span>
                    </span>
                    <template v-else>
                        {{ formatValue(value) }}
                    </template>
                </span>
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

        <div class="pgn-history" v-if="!autoUpdate">
            <table>
                <tbody>
                <tr>
                    <th>Timestamp</th>
                    <th v-for="(field, fieldName) in pgn.fields">
                        {{ fieldName }}
                    </th>
                </tr>
                <tr v-for="pgnHistory in pgn.history">
                    <template v-if="pgnHistory && pgnHistory.src === pgn.src && pgnHistory.pgn === pgn.pgn">
                        <td class="small">
                            {{ formatTime(pgnHistory.timestamp) }}
                            <br>
                            {{ pgnHistory.serverAddress }}
                        </td>
                        <td v-for="(field, fieldName) in pgn.fields">
                            <div v-if="typeof pgnHistory['fields'] !== 'undefined' && typeof pgnHistory['fields'][fieldName] === 'number'">
                                {{ sub(pgn.fields[fieldName] ?? '', pgnHistory.fields[fieldName] ?? '') }}
                            </div>
                            <div class="small">
                                {{ typeof pgnHistory['fields'] !== 'undefined' && typeof pgnHistory['fields'][fieldName] !== 'undefined' ? pgnHistory['fields'][fieldName] : '-' }}
                            </div>
                        </td>
                    </template>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
    pgn:          Object,
    pgnFilter:    [String, Number],
    blockedPGNs:  Set,
    trackingPGNs: Set,
    autoUpdate:   Boolean,
})

defineEmits(['selectDevice', 'filterPgn', 'blockPgn', 'trackPgn']);

const computedPgn = computed(() => {
    return `0x${props.pgn.pgn.toString(16).padStart(5, '0').toUpperCase()}${props.pgn.src.toString(16).padStart(2, '0').toUpperCase()}`;
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

function formatAngle(value)
{
    // return 180 / Math.PI; // == 57.29577951308232
    return (value * 57.295779).toFixed(3);
}

function formatPosition(value, isLatitude, precision = 5)
{
    const hemisphere = isLatitude
        ? (value >= 0 ? 'N' : 'S')
        : (value >= 0 ? 'E' : 'W');

    // Get absolute value
    const absValue = Math.abs(value);

    // Extract degrees
    const degrees = Math.floor(absValue);

    // Calculate minutes (decimal part * 60)
    const minutes = (absValue - degrees) * 60;

    // Format minutes to MM.MMM with leading zero
    const formattedMinutes = minutes.toFixed(3).padStart(6, '0');

    return `${hemisphere} ${degrees}°${formattedMinutes}'`;
}

function sub(a, b)
{
    const len = a.toString().length > b.toString().length ? a.toString().length : b.toString().length;

    return (a - b).toFixed(len);

}
</script>