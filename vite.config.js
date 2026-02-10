import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    publicDir: false,

    define: {
        'process.env': {},
        // Fixes the "process is not defined" error
        // 'process.env.NODE_ENV':                    JSON.stringify('production'),
        // '__VUE_OPTIONS_API__':                     true,
        // '__VUE_PROD_DEVTOOLS__':                   false,
        // '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false
    },


    plugins: [vue(), vueDevTools()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build:   {
        outDir: 'public/assets/app',

        minify:    false,      // 1. Disable minification so names stay readable
        sourcemap: true,   // 2. Create a .map file for the browser debugger

        // This tells Vite to build a library instead of an app
        lib:           {
            entry:    './src/main.js',
            name:     'MyVueApp', // Global variable name for your app
            fileName: 'nmea-app',
            formats:  ['iife'] // 'iife' is a self-executing script that works offline
        },
        cssCodeSplit:  false, // Keeps all CSS in one file
        rollupOptions: {
            // If you want Vue bundled INSIDE the file, leave 'external' empty
            external: [],
            output:   {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
})