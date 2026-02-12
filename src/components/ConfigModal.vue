<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-cog"></i> Configuration</h2>
                <button class="modal-close" @click="close">&times;</button>
            </div>

            <div class="modal-body">
                <!-- Connection Settings -->
                <div class="config-section">
                    <h3><i class="fas fa-plug"></i> Connection Settings</h3>

                    <div class="form-group">
                        <label for="wsUrl">WebSocket URL</label>
                        <input
                                id="wsUrl"
                                v-model="localConfig.wsUrl"
                                class="form-control"
                                placeholder="ws://localhost:8080"
                                type="text"
                        >
                        <div class="form-help">
                            Enter the WebSocket URL for your NMEA 2000 data source
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                    v-model="localConfig.autoConnect"
                                    class="form-checkbox"
                                    type="checkbox"
                            >
                            <span>Auto-connect on startup</span>
                        </label>
                    </div>
                </div>

                <!-- Connection Settings -->
                <div class="config-section">
                    <h3><i class="fas fa-server"></i> Data servers</h3>

                    <table class="table" style="width: 100%;">
                        <tbody>

                        <tr>
                            <th>UDP</th>
                            <th>TCP</th>
                        </tr>
                        <tr>
                            <td>
                                <div v-for="(udp, index) in localConfig.dataServers?.UDP" class="d-flex">
                                    <label class="checkbox-label">
                                        <input
                                                v-model="udp.enable"
                                                class="form-checkbox"
                                                type="checkbox"
                                        >
                                        <span></span>
                                    </label>
                                    <input
                                            v-model="udp.port"
                                            class="form-control"
                                            style="max-width: 100px;"
                                            type="number"
                                    >
                                    <button class="btn btn-sm btn-danger" @click="removeServer('UDP', index)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>

                                <button class="btn btn-success" style="margin: auto" @click="addServer('UDP')">
                                    <i class="fas fa-plus-circle"></i>
                                    Add Connection
                                </button>
                            </td>
                            <td>
                                <div v-for="(tcp, index) in localConfig.dataServers?.TCP" class="d-flex">
                                    <label class="checkbox-label">
                                        <input
                                                v-model="tcp.enable"
                                                class="form-checkbox"
                                                type="checkbox"
                                        >
                                        <span></span>
                                    </label>
                                    <input
                                            v-model="tcp.host"
                                            class="form-control"
                                            placeholder="host"
                                    >
                                    <input
                                            v-model="tcp.port"
                                            class="form-control"
                                            placeholder="port"
                                            style="max-width: 100px;"
                                            type="number"
                                    >
                                    <button class="btn btn-sm btn-danger" @click="removeServer('TCP', index)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>

                                <button class="btn btn-success" style="margin: auto" @click="addServer('TCP')">
                                    <i class="fas fa-plus"></i>
                                    Add Connection
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Display Settings -->
                <div class="config-section">
                    <h3><i class="fas fa-desktop"></i> Display Settings</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                    v-model="localConfig.showRawData"
                                    class="form-checkbox"
                                    type="checkbox"
                            >
                            <span>Show raw data in PGN cards</span>
                        </label>
                    </div>

                    <div class="form-group">
                        <label for="theme">Theme</label>
                        <select
                                id="theme"
                                v-model="localConfig.theme"
                                class="form-control"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="auto">Auto (System)</option>
                        </select>
                    </div>
                </div>

                <div class="config-section">
                    <h3><i class="fas fa-map"></i> Map tracing</h3>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                    v-model="localConfig.autoTraceAfterRestart"
                                    class="form-checkbox"
                                    type="checkbox"
                            >
                            <span>Automatically start tracing on refresh</span>
                        </label>
                    </div>
                </div>


                <!-- Test Connection -->
                <div class="config-section">
                    <h3><i class="fas fa-wifi"></i> Test Connection</h3>
                    <div class="connection-test">
                        <div :class="testStatus" class="connection-status">
                            <i :class="testIcon"></i>
                            {{ testMessage }}
                        </div>
                        <button
                                :disabled="testing"
                                class="btn btn-success"
                                @click="testConnection"
                        >
                            <i :class="{ spinning: testing }" class="fas fa-sync"></i>
                            Test Connection
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-outline" @click="resetToDefaults">
                    <i class="fas fa-undo"></i> Reset to Defaults
                </button>
                <button class="btn btn-primary" @click="saveConfig">
                    <i class="fas fa-save"></i> Save & Close
                </button>
                <button class="btn btn-outline" @click="close">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useConfigStore} from '../composables/useConfigStore'

const props = defineProps({
    isVisible: Boolean
})

const emit = defineEmits(['close', 'config-change'])

const {config, updateConfig, resetConfig} = useConfigStore()

// Local copy of config for editing
const localConfig = ref(JSON.parse(JSON.stringify(config.value)))

// Connection test state
const testing = ref(false)
const testResult = ref(null)

const testStatus = computed(() => {
    if (testing.value) return 'testing'
    if (!testResult.value) return 'idle'
    return testResult.value.success ? 'success' : 'error'
})

const testIcon = computed(() => {
    switch (testStatus.value) {
        case 'testing':
            return 'fas fa-spinner fa-spin'
        case 'success':
            return 'fas fa-check-circle'
        case 'error':
            return 'fas fa-times-circle'
        default:
            return 'fas fa-question-circle'
    }
})

const testMessage = computed(() => {
    if (testing.value) return 'Testing connection...'
    if (!testResult.value) return 'Not tested'
    return testResult.value.message
})

function close()
{
    emit('close')
}

function saveConfig()
{
    updateConfig(localConfig.value)
    emit('config-change', localConfig.value)
    emit('close')
}

function resetToDefaults()
{
    if (confirm('Reset all settings to defaults?')) {
        resetConfig()
        localConfig.value = JSON.parse(JSON.stringify(config.value))
    }
}


function addServer(type)
{
    switch (type) {
        case 'TCP':
            localConfig.value.dataServers?.TCP.push({
                'enable': false,
                'host':   '',
                'port':   '',
            });
            break;
        case 'UDP':
            localConfig.value.dataServers?.UDP.push({
                'enable': false,
                'port':   '',
            });
            break;
        default:
            console.error(`Type: "${type}" is not configured!`)
    }
}

function removeServer(type, index)
{
    switch (type) {
        case 'TCP':
            localConfig.value.dataServers?.TCP.splice(index, 1);
            break;
        case 'UDP':
            localConfig.value.dataServers?.UDP.splice(index, 1);
            break;
        default:
            console.error(`Type: "${type}" is not configured!`)
    }
}


async function testConnection()
{
    testing.value = true
    testResult.value = null

    try {
        const testWs = new WebSocket(localConfig.value.wsUrl)

        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        })

        const connection = new Promise((resolve, reject) => {
            testWs.onopen = () => {
                testWs.close()
                resolve()
            }
            testWs.onerror = (error) => {
                reject(new Error('Connection failed'))
            }
        })

        await Promise.race([connection, timeout])

        testResult.value = {
            success: true,
            message: 'Connection successful!'
        }
    } catch (error) {
        testResult.value = {
            success: false,
            message: `Connection failed: ${error.message}`
        }
    } finally {
        testing.value = false
    }
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
    max-width: 700px;
    max-height: 90vh;
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
    max-height: 70vh;
    overflow: auto;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.d-flex {
    display: flex;
}

.config-section {
    margin-bottom: 32px;
}

.config-section h3 {
    margin: 0 0 20px 0;
    font-size: 1.2rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
}

.config-section table div {
    margin-bottom: 4px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
    transition: all 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-checkbox {
    margin-right: 10px;
    width: 18px;
    height: 18px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.form-help {
    margin-top: 6px;
    font-size: 0.85rem;
    color: var(--text-light);
}

.form-range {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--bg-tertiary);
    outline: none;
    -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary);
    cursor: pointer;
}

.range-value {
    text-align: center;
    margin-top: 8px;
    font-weight: bold;
    color: var(--primary);
}

.connection-test {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 8px;
}

.connection-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    font-weight: 500;
}

.connection-status.idle {
    background: var(--bg-tertiary);
    color: var(--text-light);
}

.connection-status.testing {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
}

.connection-status.success {
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
}

.connection-status.error {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
}

.btn-success {
    align-self: flex-start;
}

.spinning {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
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