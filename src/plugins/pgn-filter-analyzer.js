/**
 * PGN Filter Analyzer
 * Optimizes CAN filters by analyzing which PGNs to block while keeping others
 */
export class PGNFilterAnalyzer
{
    /**
     * Convert any input to a binary string of specified length
     * @param {number|string} pgn - PGN value (hex string or number)
     * @param {number} bitLength - Desired binary length
     * @returns {string} Binary string
     */
    static toBinary(pgn, bitLength)
    {
        let value;

        if (typeof pgn === 'string') {
            if (pgn.startsWith('0x') || pgn.startsWith('0X')) {
                value = parseInt(pgn, 16);
            } else {
                value = parseInt(pgn, 10);
            }
        } else {
            value = pgn;
        }

        // Handle BigInt for values beyond 32 bits
        if (value > 0xFFFFFFFF) {
            return BigInt(value).toString(2).padStart(bitLength, '0');
        }

        return value.toString(2).padStart(bitLength, '0');
    }

    /**
     * Find minimum bit length needed for all PGNs
     * @param {Array} pgns - Array of PGNs
     * @returns {number} Required bit length
     */
    static getRequiredBitLength(pgns)
    {
        let maxBits = 0;

        for (const pgn of pgns) {
            let value;

            if (typeof pgn === 'string') {
                if (pgn.startsWith('0x')) {
                    value = parseInt(pgn, 16);
                } else {
                    value = parseInt(pgn, 10);
                }
            } else {
                value = pgn;
            }

            // Calculate bits needed
            let bits;
            if (value > 0xFFFFFFFF) {
                bits = BigInt(value).toString(2).length;
            } else {
                bits = Math.max(1, Math.floor(Math.log2(value)) + 1);
            }

            maxBits = Math.max(maxBits, bits);
        }

        // Round up to next power of 2 for convenience, but at least the max
        return Math.max(maxBits, 1);
    }

    /**
     * Calculate bit mask where bits are the same across all PGNs
     * @param {string[]} binaries - Array of binary strings
     * @returns {string} Mask binary string (1=same, 0=different)
     */
    static calculateMask(binaries)
    {
        if (binaries.length === 0) return '';

        const length = binaries[0].length;
        let mask = '';

        for (let i = 0; i < length; i++) {
            const firstBit = binaries[0][i];
            let allSame = true;

            for (let j = 1; j < binaries.length; j++) {
                if (binaries[j][i] !== firstBit) {
                    allSame = false;
                    break;
                }
            }

            mask += allSame ? '1' : '0';
        }
        console.log('calculateMask', mask, binaries);

        return mask;
    }

    /**
     * Calculate filter value using mask
     * @param {string} mask - Mask binary string
     * @param {string} referenceBinary - Reference PGN binary
     * @returns {string} Filter value binary
     */
    static calculateFilterValue(mask, referenceBinary)
    {
        let filter = '';
        for (let i = 0; i < mask.length; i++) {
            filter += mask[i] === '1' ? referenceBinary[i] : '0';
        }

        return filter;
    }

    /**
     * Check if a PGN matches a filter
     * @param {string} pgnBinary - PGN binary to test
     * @param {string} mask - Mask binary
     * @param {string} filter - Filter value binary
     * @returns {boolean} True if matches filter
     */
    static matchesFilter(pgnBinary, mask, filter)
    {
        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === '1' && pgnBinary[i] !== filter[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Find all bits that are 1 in all PGNs
     * @param {string[]} binaries - Array of binary strings
     * @returns {string} Common ones binary string
     */
    static findCommonOnes(binaries)
    {
        if (binaries.length === 0) return '';

        const length = binaries[0].length;
        let result = '';

        for (let i = 0; i < length; i++) {
            let allOnes = true;
            for (const binary of binaries) {
                if (binary[i] !== '1') {
                    allOnes = false;
                    break;
                }
            }
            result += allOnes ? '1' : '0';
        }

        return result;
    }

    /**
     * Optimize filters to block specific PGNs while keeping others
     * @param {Array} blockPGNs - PGNs to block
     * @param {Array} keepPGNs - PGNs to keep (must not be blocked)
     * @param {Object} options - Configuration options
     * @returns {Object} Result with filters and analysis
     */
    static analyze(blockPGNs, keepPGNs, options = {})
    {
        const {
                  maxFilters      = 8,
                  strictMode      = true,
                  customBitLength = null
              } = options;

        // Validate inputs
        if (!Array.isArray(blockPGNs) || !Array.isArray(keepPGNs)) {
            throw new Error('blockPGNs and keepPGNs must be arrays');
        }

        // Determine bit length
        const allPGNs = [...blockPGNs, ...keepPGNs];
        const bitLength = customBitLength || this.getRequiredBitLength(allPGNs);

        // Convert all PGNs to binary
        const blockBinaries = blockPGNs.map(pgn => this.toBinary(pgn, bitLength));
        const keepBinaries = keepPGNs.map(pgn => this.toBinary(pgn, bitLength));

        // Storage for results
        const filters = [];
        const remainingToBlock = [...blockBinaries];
        const conflicts = [];

        // Helper to create a filter from a group of PGNs
        const createFilter = (binaries) => {
            console.log('createFiltercreateFilter', binaries);
            const mask = this.calculateMask(binaries);
            const filterValue = this.calculateFilterValue(mask, binaries[0]);


            return {
                mask,
                filterValue,
                maskHex:         '0x' + this.binaryToHex(mask),
                filterHex:       '0x' + this.binaryToHex(filterValue),
                blockedBinaries: binaries
            };
        };

        // Helper to check if filter blocks any wanted PGNs
        const filterBlocksWanted = (filter) => {
            for (const keepBinary of keepBinaries) {
                if (this.matchesFilter(keepBinary, filter.mask, filter.filterValue)) {
                    return true;
                }
            }
            return false;
        };

        console.log('remainingToBlockremainingToBlock', remainingToBlock);
        // Main optimization loop -> @todo fix ot working well!
        while (remainingToBlock.length > 0 && filters.length < maxFilters) {

            console.log('remainingToBlock.length', remainingToBlock.length);
            // Try to create a filter for remaining PGNs
            const candidateFilter = createFilter(remainingToBlock);

            // Check if it blocks wanted PGNs
            console.log("!filterBlocksWanted", filterBlocksWanted(candidateFilter));

            if (!filterBlocksWanted(candidateFilter)) {
                // This filter works - add it
                const blockedIndices = [];
                const stillRemaining = [];

                // Find which PGNs this filter blocks
                for (let i = 0; i < remainingToBlock.length; i++) {
                    if (this.matchesFilter(remainingToBlock[i],
                        candidateFilter.mask,
                        candidateFilter.filterValue)) {
                        blockedIndices.push(i);
                    } else {
                        stillRemaining.push(remainingToBlock[i]);
                    }
                }

                filters.push({
                    ...candidateFilter,
                    blockedCount: blockedIndices.length,
                    blockedPGNs:  blockedIndices.map(idx =>
                        blockPGNs[blockBinaries.indexOf(remainingToBlock[idx])]
                    )
                });

                remainingToBlock.splice(0, remainingToBlock.length, ...stillRemaining);
            } else {
                console.log("asdfasdfasd")
                // Filter would block wanted PGNs - need to split
                if (remainingToBlock.length === 1) {
                    // Single PGN conflicts with wanted PGNs
                    const conflictedPGN = blockPGNs[blockBinaries.indexOf(remainingToBlock[0])];
                    conflicts.push({
                        pgn:    conflictedPGN,
                        reason: 'Cannot block without affecting wanted PGNs',
                        binary: remainingToBlock[0]
                    });

                    if (strictMode) {
                        throw new Error(`Cannot block PGN ${this.pgnToString(conflictedPGN)} without blocking wanted PGNs: ${conflictedPGN}`);
                    }

                    // In non-strict mode, skip this PGN
                    remainingToBlock.shift();
                } else {
                    // Find a bit to split on
                    let splitBit = -1;
                    const length = remainingToBlock[0].length;

                    for (let i = 0; i < length; i++) {
                        const firstBit = remainingToBlock[0][i];
                        let differs = false;

                        for (let j = 1; j < remainingToBlock.length; j++) {
                            if (remainingToBlock[j][i] !== firstBit) {
                                differs = true;
                                break;
                            }
                        }

                        if (differs) {
                            splitBit = i;
                            break;
                        }
                    }

                    if (splitBit === -1) {
                        // All bits are the same - conflict with wanted PGNs
                        const conflictedGroup = remainingToBlock.map(b =>
                            blockPGNs[blockBinaries.indexOf(b)]
                        );

                        conflicts.push({
                            pgns:     conflictedGroup,
                            reason:   'Entire group conflicts with wanted PGNs',
                            binaries: [...remainingToBlock]
                        });

                        if (strictMode) {
                            throw new Error(`Cannot block group of PGNs without blocking wanted PGNs: ${conflictedGroup.map(p => this.pgnToString(p)).join(', ')}`);
                        }

                        remainingToBlock.length = 0;
                    } else {
                        // Split into two groups
                        const group0 = [];
                        const group1 = [];

                        for (const binary of remainingToBlock) {
                            if (binary[splitBit] === '0') {
                                group0.push(binary);
                            } else {
                                group1.push(binary);
                            }
                        }

                        // Process group0
                        if (group0.length > 0) {
                            const filter0 = createFilter(group0);
                            if (!filterBlocksWanted(filter0)) {
                                const blockedPGNs0 = group0.map(b =>
                                    blockPGNs[blockBinaries.indexOf(b)]
                                );

                                filters.push({
                                    ...filter0,
                                    blockedCount: group0.length,
                                    blockedPGNs:  blockedPGNs0
                                });
                            } else {
                                // Put back for next iteration
                                remainingToBlock.push(...group0);
                            }
                        }

                        // Process group1
                        if (group1.length > 0) {
                            const filter1 = createFilter(group1);
                            if (!filterBlocksWanted(filter1)) {
                                const blockedPGNs1 = group1.map(b =>
                                    blockPGNs[blockBinaries.indexOf(b)]
                                );

                                filters.push({
                                    ...filter1,
                                    blockedCount: group1.length,
                                    blockedPGNs:  blockedPGNs1
                                });
                            } else {
                                // Put back for next iteration
                                remainingToBlock.push(...group1);
                            }
                        }

                        // Clear and refill remaining with unprocessed
                        const processed = [...group0, ...group1];
                        remainingToBlock.length = 0;

                        // Keep only those that weren't processed
                        const allRemaining = blockBinaries
                            .filter(b => !processed.includes(b))
                            .filter(b => !filters.some(f => f.blockedBinaries.includes(b)));

                        remainingToBlock.push(...allRemaining);
                    }
                }
            }
        }

        // Calculate statistics
        const totalBlocked = filters.reduce((sum, filter) => sum + filter.blockedCount, 0);
        const totalToBlock = blockPGNs.length;
        const efficiency = totalToBlock > 0 ? (totalBlocked / totalToBlock) * 100 : 100;

        return {
            filters:  filters.map(filter => ({
                mask:         filter.maskHex,
                filter:       filter.filterHex,
                maskBinary:   filter.mask,
                filterBinary: filter.filterValue,
                blockedCount: filter.blockedCount,
                blockedPGNs:  filter.blockedPGNs.map(p => this.pgnToString(p))
            })),
            analysis: {
                bitLengthUsed:       bitLength,
                totalFilters:        filters.length,
                totalPGNsToBlock:    totalToBlock,
                successfullyBlocked: totalBlocked,
                efficiency:          efficiency.toFixed(1) + '%',
                remainingToBlock:    remainingToBlock.length,
                conflicts:           conflicts.map(c => ({
                    ...c,
                    pgns: Array.isArray(c.pgns) ?
                              c.pgns.map(p => this.pgnToString(p)) :
                              this.pgnToString(c.pgn)
                })),
                maxFiltersReached:   filters.length >= maxFilters
            },
            raw:      {
                blockBinaries,
                keepBinaries,
                bitLength
            }
        };
    }

    /**
     * Simple mask calculation for a group of PGNs
     * @param {Array} pgns - Array of PGNs
     * @param {number} bitLength - Bit length (auto-detected if not provided)
     * @returns {Object} Mask analysis
     */
    static calculateSimpleMask(pgns, bitLength = null)
    {
        if (pgns.length === 0) {
            return {
                mask:       '0x0',
                filter:     '0x0',
                commonOnes: '0x0',
                bitLength:  0
            };
        }

        const actualBitLength = bitLength || this.getRequiredBitLength(pgns);
        const binaries = pgns.map(pgn => this.toBinary(pgn, actualBitLength));

        const mask = this.calculateMask(binaries);
        const filterValue = this.calculateFilterValue(mask, binaries[0]);
        const commonOnes = this.findCommonOnes(binaries);

        return {
            mask:                  '0x' + this.binaryToHex(mask),
            filter:                '0x' + this.binaryToHex(filterValue),
            commonOnes:            '0x' + this.binaryToHex(commonOnes),
            maskBinary:            mask,
            filterBinary:          filterValue,
            commonOnesBinary:      commonOnes,
            bitLength:             actualBitLength,
            binaryRepresentations: binaries
        };
    }

    /**
     * Convert binary string to hex
     * @param {string} binary - Binary string
     * @returns {string} Hex string without 0x prefix
     */
    static binaryToHex(binary)
    {
        return parseInt(binary, 2).toString(16).toUpperCase();
    }

    /**
     * Format PGN for display
     * @param {number|string} pgn - PGN value
     * @returns {string} Formatted string
     */
    static pgnToString(pgn)
    {
        if (typeof pgn === 'string') {
            return pgn;
        }
        return `0x${pgn.toString(16).toUpperCase()} (${pgn})`;
    }

    /**
     * Test if a specific PGN would be blocked by filters
     * @param {number|string} pgn - PGN to test
     * @param {Array} filters - Filters from analyze() result
     * @param {number} bitLength - Bit length
     * @returns {boolean} True if would be blocked
     */
    static wouldBeBlocked(pgn, filters, bitLength)
    {
        const binary = this.toBinary(pgn, bitLength);

        for (const filter of filters) {
            if (this.matchesFilter(binary, filter.maskBinary, filter.filterBinary)) {
                return true;
            }
        }

        return false;
    }
}