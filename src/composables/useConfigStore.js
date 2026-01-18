import {ref, watch} from 'vue'

const STORAGE_KEY = 'nmea2000-config'

const defaultConfig = {
  wsUrl:       'ws://localhost:8080',
  // wsUrl:       'ws://192.168.1.111/api/websocket',
  autoConnect: true,
  maxHistory:  5000,
  refreshRate: 1000,
  showRawData: false,
  theme:       'dark',
  filters:     {
    minPriority: 0,
    maxAge:      3600000 // 1 hour
  }
}

export function useConfigStore()
{
  // Load from localStorage or use defaults
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const config = ref({...defaultConfig, ...savedConfig})

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
