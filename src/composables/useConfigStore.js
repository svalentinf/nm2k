import {ref, watch} from 'vue'

const STORAGE_KEY = 'nmea2000-config'

const defaultConfig = {
    wsUrl: 'ws://localhost:8080',
    // wsUrl:       'ws://192.168.1.111/api/websocket',
    autoConnect:           true,
    autoTraceAfterRestart: true,
    showRawData:           false,
    theme:                 'dark',

    dataServers: {
        'UDP': [
            //actisense
            {
                'enable': true,
                'port':   '60001',
            },
            {
                'enable': false,
                'port':   '60002',
            },
            {
                'enable': false,
                'port':   '60003',
            },
            //yden
            {
                'enable': false,
                'port':   '10110',
            },
            {
                'enable': false,
                'port':   '1456',
            },
        ],
        'TCP': [
            //actisense
            {
                'enable': false,
                'host':   '192.168.1.111',
                'port':   '60003',
            },
            //yden
            {
                'enable': false,
                'host':   '192.168.1.222',
                'port':   '1457',
            },
        ],
    }
    //we need to send the port to the server
}

// Load from localStorage or use defaults
const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
const config = ref({...defaultConfig, ...savedConfig})

export function useConfigStore()
{
    // Save to localStorage whenever config changes
    watch(config, (newConfig) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    }, {deep: true})

    // Methods to update config
    function updateConfig(updates)
    {
        config.value = {...config.value, ...updates}
    }

    function resetConfig()
    {
        config.value = {...defaultConfig}
    }

    function setWsUrl(url)
    {
        config.value.wsUrl = url
    }

    return {
        config,
        updateConfig,
        resetConfig,
        setWsUrl
    }
}