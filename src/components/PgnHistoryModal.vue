<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <div class="modal-header">
                <h2>
                    <i class="fas fa-search"></i> PGN {{ pgnFilter }} History
                    <button class="btn" @click="toggleAutoUpdate">
                        <i :class="autoUpdate ? 'fas fa-pause' : 'fas fa-play'"></i>
                        {{ autoUpdate ? 'Pause Updates' : 'Resume Updates' }}
                    </button>
                </h2>
                <button class="modal-close" @click="close">&times;</button>
            </div>
            <div class="modal-body">
                <table>
                    <tbody>
                    <tr>
                        <td v-for="pgn in filteredPgns">
                            <PgnCard
                                    :key="pgn.id"
                                    :pgn="pgn"
                                    :pgn-filter="pgnFilter"
                                    @select-device="$emit('select-device', $event)"
                                    @filter-pgn="$emit('filter-pgn', $event)"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td v-for="pgn in filteredPgns">

                            <table class="history">
                                <tbody>

                                <tr>
                                    <th>Timestamp</th>
                                    <th v-for="(field, fieldName) in pgn.fields">
                                        {{ fieldName }}
                                    </th>
                                </tr>
                                <tr v-for="pgnHistory in filteredHistory">
                                    <template v-if="pgnHistory && pgnHistory.src === pgn.src">
                                        <td class="small">
                                            {{ pgnHistory.timestamp }}
                                            <br>
                                            {{ pgnHistory.serverAddress }}
                                        </td>
                                        <td v-for="(field, fieldName) in pgn.fields">
                                            <div v-if="typeof pgnHistory['fields'][fieldName] === 'number'">
                                                {{ pgn.fields[fieldName] - pgnHistory.fields[fieldName] }}
                                            </div>
                                            <div class="small">
                                                {{ pgnHistory['fields'][fieldName] ?? '-' }}
                                            </div>
                                        </td>
                                    </template>
                                </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div v-for="pgn in filteredPgns">
                    <hr>
                    {{ pgn }}
                    <hr>
                </div>
                {{ filteredPgns }}
                {{ filteredHistory }}
            </div>

            <div class="modal-footer">
                <button class="btn btn-outline" @click="close">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>

import PgnCard from "@/components/cards/PgnCard.vue";

const props = defineProps({
    isVisible:       Boolean,
    autoUpdate:      Boolean,
    pgnFilter:       [String, Number],
    filteredHistory: Array,
    filteredPgns:    Array,
})

const emit = defineEmits([
    'close',
    'update:autoUpdate',
    'filter-pgn',
    'select-device',
])

function toggleAutoUpdate()
{
    emit('update:autoUpdate', !props.autoUpdate)
}

function close()
{
    emit('close')
}

</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

.modal-content {
    background: var(--bg-primary);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--text-light);
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
}

.modal-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: 24px;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}


.small {
    font-size: 0.7em;
    color: var(--text-light);
}

table td, table th {
    padding: 4px;
    vertical-align: top;
}

table.history {
    width: 100%;
}

table.history td {
    border: 1px solid;
    text-align: center;
    vertical-align: top;
}


@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        margin: 10px;
    }

    .modal-footer {
        flex-direction: column;
    }

    .modal-footer .btn {
        width: 100%;
    }
}
</style>