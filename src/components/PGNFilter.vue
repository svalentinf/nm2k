<template>
    <div class="pgnFilter">
        <h2>PGN Filter Optimizer</h2>

        <!-- Input Section -->
        <div class="input-section">
            <div class="input-group">
                <label>PGNs to Block:</label>
                <textarea
                        v-model="blockPGNsInput"
                        placeholder="Enter PGNs to block (comma separated)&#10;Example: 0x1F112, 0x1F801, 129025"
                        rows="4"
                ></textarea>
            </div>

            <div class="input-group">
                <label>PGNs to Keep:</label>
                <textarea
                        v-model="keepPGNsInput"
                        placeholder="Enter PGNs to keep (comma separated)&#10;Example: 0x1F802, 0x1F803"
                        rows="4"
                ></textarea>
            </div>
        </div>

        <!-- Options -->
        <div class="options-section">
            <label>
                <input v-model="strictMode" type="checkbox"> Strict Mode
            </label>
            <label>
                Max Filters:
                <input v-model.number="maxFilters" max="16" min="1" type="number">
            </label>
            <label>
                Bit Length:
                <select v-model.number="bitLength">
                    <option value="0">Auto</option>
                    <option value="11">11-bit (CAN 2.0A)</option>
                    <option value="18">18-bit (PGN only)</option>
                    <option value="29">29-bit (J1939)</option>
                    <option value="32">32-bit</option>
                </select>
            </label>
        </div>

        <!-- Buttons -->
        <div class="button-section">
            <button class="btn" @click="analyze">Calculate Filters</button>
            <button class="btn" @click="loadPNGs">Load PNG's</button>
            <button class="btn" @click="reset">Reset</button>
        </div>

        <!-- Results -->
        <div v-if="result" class="results-section">
            <h3>Optimized Filters ({{ result.filters.length }})</h3>

            <div v-for="(filter, index) in result.filters" :key="index" class="filter-card">
                <h4>Filter {{ index + 1 }}: {{ filter.filter }} {{ filter.mask }}</h4>
                <div class="filter-details">
                    <div><strong>Mask:</strong> {{ filter.mask }}</div>
                    <div><strong>Filter Value:</strong> {{ filter.filter }}</div>
                    <div><strong>Blocks:</strong> {{ filter.blockedCount }} PGN(s)</div>
                    <div v-if="filter.blockedPGNs.length">
                        <strong>Blocked PGNs:</strong> {{ filter.blockedPGNs.join(', ') }}
                    </div>
                </div>
            </div>

            <div class="analysis-section">
                <h4>Analysis</h4>
                <div>Bit Length Used: {{ result.analysis.bitLengthUsed }}</div>
                <div>Efficiency: {{ result.analysis.efficiency }}</div>
                <div>Successfully Blocked: {{ result.analysis.successfullyBlocked }}/{{ result.analysis.totalPGNsToBlock }}</div>
                <div v-if="result.analysis.conflicts.length">
                    <strong>Conflicts:</strong>
                    <div v-for="(conflict, idx) in result.analysis.conflicts" :key="idx" class="conflict">
                        {{ conflict.reason }}: {{ Array.isArray(conflict.devicesPGNs) ? conflict.devicesPGNs.join(', ') : conflict.devicesPGNs }}
                    </div>
                </div>
            </div>

            <div class="btn" @click="copyResults">Copy</div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-section">
            {{ error }}
        </div>
    </div>
</template>

<script>
import {PGNFilterAnalyzer} from '../plugins/pgn-filter-analyzer.js';

export default {
    name:  'PGNFilter',
    props: {
        selectedDevice: [null, String, Number],
        filteredPGNs:   Array,
        blockedPGNs:    Set,
    },
    data()
    {
        return {
            blockPGNsInput: '',
            keepPGNsInput:  '',
            strictMode:     true,
            maxFilters:     8,
            bitLength:      0,
            result:         null,
            error:          null,
        };
    },
    methods: {
        parsePGNInput(input)
        {
            if (!input.trim()) return [];

            return input
                .split(/[,;\n\r\s]+/)
                .map(p => p.trim())
                .filter(p => p)
                .map(p => {
                    if (p.startsWith('0x') || p.startsWith('0X')) {
                        return parseInt(p, 16);
                    }
                    return parseInt(p, 10);
                })
                .filter(p => !isNaN(p));
        },

        analyze()
        {
            this.error = null;
            this.result = null;

            try {

                const blockPGNs = this.parsePGNInput(this.blockPGNsInput);
                const keepPGNs = this.parsePGNInput(this.keepPGNsInput);

                if (blockPGNs.length === 0) {
                    throw new Error('Please enter at least one PGN to block');
                }

                const options = {
                    maxFilters: this.maxFilters,
                    strictMode: this.strictMode
                };

                if (this.bitLength > 0) {
                    options.customBitLength = this.bitLength;
                }

                this.result = PGNFilterAnalyzer.analyze(blockPGNs, keepPGNs, options);

            } catch (err) {
                this.error = err.message;
                console.error('Analysis error:', err);
            }
        },

        loadPNGs()
        {
            console.log('loadPNGsloadPNGs', this.filteredPGNs, this.blockedPGNs);
            this.filteredPGNs.forEach((pgn) => {

                const pgnAddr = `${pgn.pgn.toString(16).padStart(5, '0')}${pgn.src.toString(16).padStart(2, '0')}`.toUpperCase();
                console.log(pgn.pgn, pgn.src, pgnAddr)

                if (this.blockPGNsInput.toUpperCase().includes(pgnAddr)) {
                    //show it somewhere!
                    console.log("Already blocked", this.blockPGNsInput.includes(pgnAddr));
                }

                if (this.blockedPGNs.has(pgnAddr)) {
                    return;

                }

                if (!this.keepPGNsInput.includes(pgnAddr) && !this.blockPGNsInput.includes(pgnAddr) && !this.blockedPGNs.has("0x" + pgnAddr)) {
                    if (this.keepPGNsInput) {
                        this.keepPGNsInput += ", ";
                    }
                    this.keepPGNsInput += "0x" + pgnAddr;
                }
            });
            this.keepPGNsInput = this.keepPGNsInput.trim();

            this.blockedPGNs.forEach((pgnAddr) => {
                if (!this.blockPGNsInput.includes(pgnAddr)) {
                    if (this.blockPGNsInput) {
                        this.blockPGNsInput += ", ";
                    }
                    this.blockPGNsInput += pgnAddr;
                }
                console.log("blocc pgnAddr", pgnAddr, this.blockPGNsInput);
            });
        },

        reset()
        {
            this.blockPGNsInput = '';
            this.keepPGNsInput = '';
            this.result = null;
            this.error = null;
        },

        copyResults()
        {
            if (!this.result) return;

            let text = '';
            this.result.filters.forEach((filter) => {

                text += "" +
                        `#DROP + ${filter.blockedPGNs.join(', ')}\n` +
                        `match(CAN1, ${filter.filter}, ${filter.mask})\n` +
                        "{\n" +
                        "}";
            });

            console.log(text);
            //     <div v-for="(filter, index) in result.filters" :key="index" class="filter-card">
            //                                                                       <h4>Filter {{ index + 1 }}: {{ filter.filter }} {{ filter.mask }}</h4>
            //     <div class="filter-details">
            //         <div><strong>Mask:</strong> {{ filter.mask }}</div>
            //         <div><strong>Filter Value:</strong> {{ filter.filter }}</div>
            //         <div><strong>Blocks:</strong> {{ filter.blockedCount }} PGN(s)</div>
            //         <div v-if="filter.blockedPGNs.length">
            //             <strong>Blocked PGNs:</strong> {{ filter.blockedPGNs.join(', ') }}
            //         </div>
            //     </div>
            // </div>

            navigator.clipboard.writeText(text).then(() => {
                alert('Results copied to clipboard!');
            });
        },
    },
    watch:   {
        blockPGNsInput: function (newVal, oldVal) {
            //if we have it in old we need to remove them!
            if (newVal) {

                // this.blockedPGNs.value = this.parsePGNInput(newVal);
            } else {
                console.log('blockPGNsInputblockPGNsInput', newVal, oldVal)
            }
        },
        blockedPGNs:    function (newVal, oldVal) {
            //if we have it in old we need to remove them!
            console.log('blockedPGNsblockedPGNs', newVal, oldVal)

            if (newVal) {
                // this.blockedPGNs.value = this.parsePGNInput(newVal);
            } else {
                console.log('blockedPGNsblockedPGNs', newVal, oldVal)
            }
        }
    },
};
</script>

<style scoped>
.pgnFilter {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.input-section {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.input-group {
    flex: 1;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.input-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
}

.options-section {
    margin-bottom: 20px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
}

.options-section label {
    display: inline-block;
    margin-right: 20px;
}

.button-section {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
}

.results-section {
    margin-top: 30px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
}

.filter-card {
    margin-bottom: 15px;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 15px;
    transition: all 0.3s;
}

.filter-card h4 {
    margin-top: 0;
    margin-bottom: 10px;
}

.filter-details {
    font-family: monospace;
    font-size: 14px;
}

.filter-details div {
    margin-bottom: 5px;
}

.analysis-section {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
}

.conflict {
    color: #e67e22;
    margin-left: 10px;
}

.error-section {
    margin-top: 20px;
    padding: 15px;
    background: #fde8e8;
    color: #c53030;
    border-radius: 4px;
}
</style>