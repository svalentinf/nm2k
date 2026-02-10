<template>
    <div class="gps-tracker">
        <div class="panel">
            <!-- Control Panel -->
            <div class="panel-header">
                <div class="left-controls">
                    <button
                            @click="toggleTracking"
                            :class="['track-btn', { active: isTracking, paused: !autoUpdate }]"
                            :title="isTracking ? 'Stop tracking' : 'Start tracking'"
                    >
                        <span v-if="isTracking && autoUpdate">●</span>
                        <span v-else-if="!autoUpdate">❚❚</span>
                        <span v-else>▶</span>
                        {{ isTracking ? (!autoUpdate ? 'Paused' : 'Tracking') : 'Start Track' }}
                    </button>
                    <button class="btn" @click="$emit('update:autoUpdate', !autoUpdate)">
                        <i :class="autoUpdate ? 'fas fa-pause' : 'fas fa-play'"></i>
                        {{ autoUpdate ? 'Pause Updates' : 'Resume Updates' }}
                    </button>
                    <button
                            @click="clearTrack(tracked)"
                            :disabled="!hasTrack"
                            class="clear-btn"
                    >
                        Clear This Track
                    </button>

                    <button
                            @click="clearAllTracks"
                            :disabled="tracks.size === 0"
                            class="clear-btn"
                    >
                        Clear All Tracks
                    </button>
                    <select v-model="activeTrackId" class="track-select">
                        <option value="">Select Track</option>
                        <option v-for="[trackId, trackData] in tracks" :key="trackId" :value="trackId">
                            {{ trackId }} ({{ trackData.points.length }} points)
                        </option>
                    </select>
                </div>

                <div class="center-controls">
                    <div class="zoom-controls">
                        <button @click="zoomOut" title="Zoom out">-</button>
                        <span>{{ zoomLevel }}x</span>
                        <button @click="zoomIn" title="Zoom in">+</button>
                    </div>

                    <label class="toggle">
                        <input type="checkbox" v-model="autoCenter">
                        <span>Auto-center</span>
                    </label>

                    <label class="toggle">
                        <input type="checkbox" v-model="showGrid">
                        <span>Grid</span>
                    </label>

                    <label class="toggle">
                        <input type="checkbox" v-model="showAllTracks">
                        <span>Show All Tracks</span>
                    </label>
                    <label class="toggle">
                        <input type="checkbox" v-model="showTime">
                        <span>Show time</span>
                    </label>
                </div>

                <div class="right-controls">
                    <div class="status-indicator" :class="statusClass">
                        {{ statusText }}
                    </div>

                    <div class="track-info">
                        <span v-if="activeTrack">Points: {{ activeTrack.points.length }}</span>
                        <span v-if="activeTrack && totalDistance > 0">{{ totalDistance.toFixed(2) }} km</span>
                        <span v-if="activeTrack && activeTrack.points.length > 0">{{ duration }}</span>
                        <span>Tracks: {{ tracks.size }}</span>
                    </div>
                </div>
            </div>

            <!-- Main Canvas -->
            <div
                    class="canvas-container"
                    :class="{ 'cursor-grab': !isDragging, 'cursor-grabbing': isDragging }"
                    @mousedown="startDrag"
                    @mousemove="handleMouseMove"
                    @mouseup="endDrag"
                    @mouseleave="endDrag"
            >
                <canvas
                        ref="canvas"
                        :width="canvasWidth"
                        :height="canvasHeight"
                ></canvas>

                <!-- No Data Overlay -->
                <div v-if="!hasTrack && tracks.size === 0" class="no-data-overlay">
                    <div class="no-data-content">
                        <div class="icon">📍</div>
                        <h3>No Track Data</h3>
                        <p v-if="!isTracking">Click "Start Track" to begin recording</p>
                        <p v-else>Waiting for GPS data...</p>
                        <button @click="simulateMultipleTracks" class="demo-btn">
                            Try Demo Tracks
                        </button>
                    </div>
                </div>

                <!-- Current Position Marker -->
                <div
                        v-if="currentPosition && isTracking && !autoUpdate"
                        class="current-marker"
                        :style="currentMarkerStyle"
                >
                    <div class="pulse"></div>
                    <div class="center-dot"></div>
                </div>

                <!-- Scale Bar -->
                <div class="scale-bar">
                    <div class="scale-line"></div>
                    <div class="scale-label">{{ scaleLabel }}</div>
                </div>

                <!-- Coordinates Display -->
                <div v-if="mousePosition" class="coordinates-display">
                    {{ mousePosition.lat.toFixed(6) }}, {{ mousePosition.lon.toFixed(6) }}
                </div>

                <!-- Tracks List Panel -->
                <div class="tracks-list-panel" v-if="tracks.size > 0">
                    <h4>All Tracks ({{ tracks.size }})</h4>
                    <div class="tracks-container">
                        <div
                                v-for="[trackId, trackData] in tracks"
                                :key="trackId"
                                :class="['track-item', { 'active': trackId === activeTrackId }]"
                                @click="setActiveTrack(trackId)"
                        >
                            <div class="track-color" :style="{ backgroundColor: trackData.color }"></div>
                            <div class="track-info">
                                <div class="track-name">{{ trackId }}</div>
                                <div class="track-details">
                                    <span>{{ trackData.points.length }} points</span>
                                    <span>{{ calculateTrackDistance(trackData).toFixed(2) }} km</span>
                                    <span v-if="trackData.points.length > 0">
                                    {{ formatTime(trackData.points[trackData.points.length - 1].timestamp) }}
                                </span>
                                </div>
                            </div>
                            <div class="track-actions">
                                <button
                                        @click.stop="removeTrack(trackId)"
                                        class="remove-btn"
                                        title="Remove track"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Track Info Panel -->
            <div class="info-panel">
                <div class="info-section">
                    <h4>Current Track</h4>
                    <div v-if="activeTrack" class="position-info">
                        <div class="coord">
                            <span class="label">Track ID:</span>
                            <span class="value">{{ activeTrackId }}</span>
                        </div>

                        <div class="coord">
                            <span class="label">Color:</span>
                            <input
                                    type="color"
                                    v-model="activeTrack.color"
                                    @change="updateTrackColor"
                                    class="color-picker"
                            />
                        </div>
                        <div class="coord">
                            <span class="label">Points:</span>
                            <span class="value">{{ activeTrack.points.length }}</span>
                        </div>
                        <div class="coord" v-if="currentPosition">
                            <span class="label">Last Position:</span>
                            <span class="value">{{ formatTime(currentPosition.timestamp) }}</span>
                        </div>
                    </div>
                    <div v-else class="no-position">
                        No track selected
                    </div>
                </div>

                <div class="info-section">
                    <h4>Track Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <div class="stat-value">{{ activeTrack ? activeTrack.points.length : 0 }}</div>
                            <div class="stat-label">Points</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">{{ totalDistance.toFixed(2) }}</div>
                            <div class="stat-label">km</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">{{ duration }}</div>
                            <div class="stat-label">Duration</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">{{ avgSpeed.toFixed(1) }}</div>
                            <div class="stat-label">km/h avg</div>
                        </div>
                    </div>
                </div>

                <div class="info-section">
                    <h4>Export</h4>
                    <div class="export-buttons">
                        <button @click="exportActiveTrack" title="Export active track">Export Active</button>
                        <button @click="exportAllTracks" title="Export all tracks">Export All</button>
                        <button @click="copyActiveTrack" title="Copy to clipboard">📋</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'GpsTracker',

    props: {
        autoUpdate:   Boolean,
        trackingPGNs: Set,
        // Single point to add (reactive)
        pgn: {
            type:    Object, // {fields :{ latitude, longitude, timestamp?, speed? }}
            default: null
        },

        // Auto-start tracking
        autoStart: {
            type:    Boolean,
            default: false
        },

        // Maximum points to keep (0 = unlimited)
        maxPoints: {
            type:    Number,
            default: 0
        },

        // Canvas dimensions
        width:  {
            type:    Number,
            default: 800
        },
        height: {
            type:    Number,
            default: 600
        }
    },

    data()
    {
        return {
            // Track data
            tracks:           new Map(), // Map<trackId, { name, color, points[], isActive }>
            activeTrackId:    null,
            isTracking:       false,
            startTime:        null,
            currentPosition:  null,
            previousPosition: null,

            // Canvas rendering
            canvasWidth:  this.width,
            canvasHeight: this.height,
            ctx:          null,
            zoom:         10,
            panX:         0,
            panY:         0,
            isDragging:   false,
            dragStartX:   0,
            dragStartY:   0,
            lastPanX:     0,
            lastPanY:     0,

            // Settings
            autoCenter:    true,
            showGrid:      true,
            showAllTracks: true,
            showTime: true,

            // Mouse position
            mousePosition: null,
            mouseCanvasX:  0,
            mouseCanvasY:  0,

            // Metrics
            totalDistance:  0,
            currentSpeed:   0,
            avgSpeed:       0,
            lastUpdateTime: null,

            // Animation
            animationFrame: null,
            needsRedraw:    true,

            // Color palette for tracks
            colorPalette: [
                '#2196F3', // Blue
                '#4CAF50', // Green
                '#FF9800', // Orange
                '#9C27B0', // Purple
                '#F44336', // Red
                '#00BCD4', // Cyan
                '#FFEB3B', // Yellow
                '#795548', // Brown
                '#607D8B', // Blue Grey
                '#E91E63'  // Pink
            ]
        };
    },

    computed: {
        activeTrack()
        {
            if (!this.activeTrackId || !this.tracks.has(this.activeTrackId)) {
                return null;
            }
            return this.tracks.get(this.activeTrackId);
        },

        hasTrack()
        {
            return this.activeTrack && this.activeTrack.points.length > 0;
        },

        statusClass()
        {
            if (!this.isTracking) return 'status-stopped';
            if (!this.autoUpdate) return 'status-paused';
            return 'status-tracking';
        },

        statusText()
        {
            if (!this.isTracking) return 'Stopped';
            if (!this.autoUpdate) return 'Paused';
            return 'Tracking';
        },

        zoomLevel()
        {
            return this.zoom.toFixed(2);
        },

        scaleLabel()
        {
            const scaleMeters = 100 / this.zoom; // Scale for 100 pixels
            if (scaleMeters >= 1000) {
                return `${(scaleMeters / 1000).toFixed(2)} km`;
            }
            return `${scaleMeters.toFixed(2)} m`;
        },

        currentMarkerStyle()
        {
            if (!this.currentPosition) return {};
            const point = this.projectToCanvas(
                this.currentPosition.latitude,
                this.currentPosition.longitude
            );
            return {
                left: `${point.x}px`,
                top:  `${point.y}px`
            };
        },

        duration()
        {
            if (!this.activeTrack || this.activeTrack.points.length < 2) return '00:00';

            const firstPoint = this.activeTrack.points[0];
            const lastPoint = this.activeTrack.points[this.activeTrack.points.length - 1];
            const start = firstPoint.timestamp || this.startTime;
            const end = lastPoint.timestamp || Date.now();
            const diff = end - start;

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);

            if (hours > 0) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
            return `${minutes.toString().padStart(2, '0')}:${Math.floor((diff % 60000) / 1000).toString().padStart(2, '0')}`;
        }
    },

    watch: {
        pgn(newPgn)
        {
            try {
                if (!newPgn || !newPgn.fields
                    || typeof newPgn.fields.latitude === 'undefined' || typeof newPgn.fields.longitude === 'undefined'
                    || !newPgn.fields.latitude || !newPgn.fields.longitude) {

                    return;
                }

                if (!this.isTracking || !this.autoUpdate) {
                    return;
                }

                // trackingPGNs
                this.trackingPGNs.forEach((tracked) => {
                    if (`${newPgn.src}:${newPgn.pgn}` !== tracked) {
                        return;
                    }
                    const trackId = tracked || 'default';

                    // Create track if it doesn't exist
                    if (!this.tracks.has(trackId)) {
                        this.createTrack(trackId);
                    }

                    // Set as active if not already
                    if (!this.activeTrackId) {
                        this.activeTrackId = trackId;
                    }
                    if (this.isTracking) {
                        this.addPointToTrack(trackId, {
                            latitude:  newPgn.fields.latitude,
                            longitude: newPgn.fields.longitude,
                            timestamp: Date.now()
                        });
                    }

                });

            } catch (e) {
                console.error('Error processing PGN:', e);
            }
        },

        isTracking(newVal)
        {
            if (newVal) {
                this.startTime = Date.now();
                this.$emit('tracking-started');
            } else {
                this.$emit('tracking-stopped', {
                    tracks:        this.tracks.size,
                    totalPoints:   this.getAllPoints().length,
                    totalDistance: this.getTotalDistance()
                });
            }
        },

        activeTrackId(newTrackId)
        {
            this.updateMetrics();
            this.needsRedraw = true;
        },

        showAllTracks()
        {
            this.needsRedraw = true;
        },
        showTime()
        {
            this.needsRedraw = true;
        },

        zoom()
        {
            this.needsRedraw = true;
        },

        panX()
        {
            this.needsRedraw = true;
        },

        panY()
        {
            this.needsRedraw = true;
        },

        showGrid()
        {
            this.needsRedraw = true;
        }
    }
    ,

    mounted()
    {
        this.initCanvas();
        this.setupAnimation();

        if (this.autoStart) {
            this.startTracking();
        }

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
    }
    ,

    beforeDestroy()
    {
        window.removeEventListener('resize', this.handleResize);
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    ,

    methods: {
        initCanvas()
        {
            const canvas = this.$refs.canvas;
            this.ctx = canvas.getContext('2d');

            // Set high DPI for retina displays
            const dpr = 1;
            this.canvasWidth = this.width * dpr;
            this.canvasHeight = this.height * dpr;
            canvas.width = this.canvasWidth;
            canvas.height = this.canvasHeight;
            canvas.style.width = `${this.width}px`;
            canvas.style.height = `${this.height}px`;
            this.ctx.scale(dpr, dpr);
        },

        setupAnimation()
        {
            const animate = () => {
                if (this.needsRedraw) {
                    this.draw();
                    this.needsRedraw = false;
                }
                this.animationFrame = requestAnimationFrame(animate);
            };
            animate();
        },

        // Track management methods
        createTrack(trackId, name = null)
        {
            const colorIndex = this.tracks.size % this.colorPalette.length;
            const track = {
                name:     name || `Track ${this.tracks.size + 1}`,
                color:    this.colorPalette[colorIndex],
                points:   [],
                isActive: true
            };

            this.tracks.set(trackId, track);

            if (!this.activeTrackId) {
                this.activeTrackId = trackId;
            }

            this.$emit('track-created', {trackId, track});
            this.needsRedraw = true;
        },

        removeTrack(trackId)
        {
            if (this.tracks.has(trackId)) {
                this.tracks.delete(trackId);

                if (this.activeTrackId === trackId) {
                    this.activeTrackId = this.tracks.keys().next().value || null;
                }

                this.$emit('track-removed', trackId);
                this.needsRedraw = true;
            }

            this.$emit('trackPgn', trackId);
            // this.trackPgn(trackId);

        },

        setActiveTrack(trackId)
        {
            if (this.tracks.has(trackId)) {
                this.activeTrackId = trackId;
                this.$emit('track-activated', trackId);
            }
        },

        clearTrack(trackId)
        {
            if (trackId && this.tracks.has(trackId)) {
                const track = this.tracks.get(trackId);
                track.points = [];
                track.startTime = null;
                this.tracks.set(trackId, track);

                if (this.activeTrackId === trackId) {
                    this.currentPosition = null;
                    this.previousPosition = null;
                    this.totalDistance = 0;
                    this.currentSpeed = 0;
                    this.avgSpeed = 0;
                }

                this.$emit('track-cleared', trackId);
                this.needsRedraw = true;
            }
        },

        clearAllTracks()
        {
            this.tracks.clear();
            this.activeTrackId = null;
            this.currentPosition = null;
            this.previousPosition = null;
            this.totalDistance = 0;
            this.currentSpeed = 0;
            this.avgSpeed = 0;
            this.startTime = null;
            this.panX = 0;
            this.panY = 0;
            this.zoom = 150;
            this.$emit('all-tracks-cleared');
            this.needsRedraw = true;
        },

        updateTrackColor()
        {
            if (this.activeTrack) {
                this.$emit('track-updated', {
                    trackId: this.activeTrackId,
                    field:   'color',
                    value:   this.activeTrack.color
                });
                this.needsRedraw = true;
            }
        },

        addPointToTrack(trackId, point)
        {
            if (!this.tracks.has(trackId)) return;

            const track = this.tracks.get(trackId);
            const newPoint = {
                latitude:  point.latitude,
                longitude: point.longitude,
                timestamp: point.timestamp || Date.now(),
                speed:     point.speed || 0
            };

            // Add to track

            track.points.push(newPoint);
            this.tracks.set(trackId, track);

            // Update current position for active track
            if (trackId === this.activeTrackId) {
                this.currentPosition = newPoint;

                // Update total distance
                if (this.previousPosition) {
                    this.totalDistance += this.calculateDistance(
                        this.previousPosition.latitude,
                        this.previousPosition.longitude,
                        point.latitude,
                        point.longitude
                    );
                }

                this.previousPosition = newPoint;
                this.currentSpeed = newPoint.speed;

                // Auto-center if enabled
                if (this.autoCenter && this.isTracking) {
                    this.centerOnPoint(newPoint);
                }
            }

            // Apply max points limit
            if (this.maxPoints > 0 && track.points.length > this.maxPoints) {
                track.points.shift();
                this.tracks.set(trackId, track);
            }

            // Emit events
            this.$emit('point-added', {
                trackId,
                point:       newPoint,
                totalPoints: track.points.length
            });

            this.$emit('track-updated', {
                trackId,
                field: 'points',
                value: track.points
            });

            this.needsRedraw = true;
        },

        // Project latitude/longitude to canvas coordinates
        projectToCanvas(lat, lon)
        {
            const scale = 111319.9 * this.zoom;

            // Use first point of all tracks as reference
            let refLat = 0, refLon = 0;
            const allPoints = this.getAllPoints();

            if (allPoints.length > 0) {
                refLat = allPoints[0].latitude;
                refLon = allPoints[0].longitude;
            } else
                if (this.currentPosition) {
                    refLat = this.currentPosition.latitude;
                    refLon = this.currentPosition.longitude;
                }

            const x = this.width / 2 + (lon - refLon) * scale * Math.cos(refLat * Math.PI / 180) + this.panX;
            const y = this.height / 2 - (lat - refLat) * scale + this.panY;

            return {x, y};
        },

        // Convert canvas coordinates to lat/lon
        canvasToLatLon(x, y)
        {
            const scale = 111319.9 * this.zoom;

            // Use first point of all tracks as reference
            let refLat = 0, refLon = 0;
            const allPoints = this.getAllPoints();

            if (allPoints.length > 0) {
                refLat = allPoints[0].latitude;
                refLon = allPoints[0].longitude;
            }

            const lon = refLon + (x - this.width / 2 - this.panX) / (scale * Math.cos(refLat * Math.PI / 180));
            const lat = refLat - (y - this.height / 2 - this.panY) / scale;

            return {lat, lon};
        },

        draw()
        {
            if (!this.ctx) return;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw grid
            if (this.showGrid) {
                this.drawGrid();
            }

            // Draw tracks
            for (const [trackId, track] of this.tracks) {
                if (this.showAllTracks || trackId === this.activeTrackId) {
                    this.drawTrack(trackId, track);
                }
            }

            // Draw points for active track
            if (this.activeTrack && this.activeTrack.points.length > 0) {
                this.drawPoints(this.activeTrack);
            }

            // Draw start/finish markers for active track
            if (this.activeTrack && this.activeTrack.points.length > 0) {
                this.drawMarkers(this.activeTrack);
            }
        },

        drawGrid()
        {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;

            const gridSize = 50;
            const startX = (this.panX % gridSize) - gridSize;
            const startY = (this.panY % gridSize) - gridSize;

            // Vertical lines
            for (let x = startX; x < this.width; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height);
                this.ctx.stroke();
            }

            // Horizontal lines
            for (let y = startY; y < this.height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
            }
        },

        drawTrack(trackId, track)
        {
            if (track.points.length < 2) return;

            this.ctx.beginPath();
            this.ctx.strokeStyle = track.color;
            this.ctx.lineWidth = trackId === this.activeTrackId ? 3 : 2;
            this.ctx.lineJoin = 'round';
            this.ctx.lineCap = 'round';
            this.ctx.globalAlpha = trackId === this.activeTrackId ? 1 : 0.7;

            const firstPoint = this.projectToCanvas(
                track.points[0].latitude,
                track.points[0].longitude
            );
            this.ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < track.points.length; i++) {
                const point = this.projectToCanvas(
                    track.points[i].latitude,
                    track.points[i].longitude
                );
                this.ctx.lineTo(point.x, point.y);
            }

            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        },

        drawPoints(track)
        {


            track.points.forEach((point, index) => {
                const canvasPoint = this.projectToCanvas(point.latitude, point.longitude);

                // Draw point circle
                this.ctx.beginPath();
                this.ctx.fillStyle = index === track.points.length - 1 ?
                    '#F44336' : // Red for last point
                    this.darkenColor(track.color, 0.2); // Darker version of track color
                this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw point outline
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 1;
                this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
                this.ctx.stroke();

                // Draw point number/label
                this.ctx.font = '10px Arial'; // Adjust font size and family as needed
                this.ctx.fillStyle = '#000000'; // Black text, adjust as needed
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    `${(index + 1).toString()} [${this.showTime?this.formatTimeWithSeconds(point.timestamp):''}]`, // Add 1 to start counting from 1 instead of 0
                    canvasPoint.x + 10, // Offset to the right of the point
                    canvasPoint.y // Same vertical position
                );
            });
        },

        drawMarkers(track)
        {
            // Draw start marker
            const startPoint = this.projectToCanvas(
                track.points[0].latitude,
                track.points[0].longitude
            );

            this.ctx.beginPath();
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.arc(startPoint.x, startPoint.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('S', startPoint.x, startPoint.y);

            // Draw end marker if track is not active
            if (!this.isTracking) {
                const endPoint = this.projectToCanvas(
                    track.points[track.points.length - 1].latitude,
                    track.points[track.points.length - 1].longitude
                );

                this.ctx.beginPath();
                this.ctx.fillStyle = '#F44336';
                this.ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText('F', endPoint.x, endPoint.y);
            }
        },

        // Core tracking methods
        startTracking()
        {
            this.isTracking = true;
            this.startTime = Date.now();
            this.$emit('tracking-started');
        },

        stopTracking()
        {
            this.isTracking = false;
            this.$emit('tracking-stopped', {
                tracks:        this.tracks.size,
                totalPoints:   this.getAllPoints().length,
                totalDistance: this.getTotalDistance()
            });
        },

        toggleTracking()
        {
            if (this.isTracking) {
                this.stopTracking();
            } else {

                if (!this.autoUpdate) {
                    this.$emit('update:autoUpdate', true);
                }

                this.startTracking();
            }
        },

        centerOnPoint(point)
        {
            if (!point) return;

            const canvasPoint = this.projectToCanvas(point.latitude, point.longitude);
            const targetX = this.width / 2;
            const targetY = this.height / 4;

            this.panX += targetX - canvasPoint.x;
            this.panY += targetY - canvasPoint.y;
            this.needsRedraw = true;
        },

        updateMetrics()
        {
            if (!this.activeTrack || this.activeTrack.points.length < 2) {
                this.avgSpeed = 0;
                this.totalDistance = this.activeTrack ? this.calculateTrackDistance(this.activeTrack) : 0;
                return;
            }

            const points = this.activeTrack.points;
            const firstPoint = points[0];
            const lastPoint = points[points.length - 1];
            const totalTime = (lastPoint.timestamp - firstPoint.timestamp) / 3600000;

            this.totalDistance = this.calculateTrackDistance(this.activeTrack);

            if (totalTime > 0) {
                this.avgSpeed = this.totalDistance / totalTime;
            }
        },

        // Canvas interaction
        handleWheel(event)
        {
            const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;

            const worldBefore = this.canvasToLatLon(mouseX, mouseY);
            this.zoom *= zoomFactor;
            this.zoom = Math.max(0.1, Math.min(this.zoom, 20));

            const worldAfter = this.canvasToLatLon(mouseX, mouseY);
            const deltaLon = worldAfter.lon - worldBefore.lon;
            const deltaLat = worldAfter.lat - worldBefore.lat;

            const scale = 111319.9 * this.zoom;
            this.panX -= deltaLon * scale * Math.cos(worldBefore.lat * Math.PI / 180);
            this.panY += deltaLat * scale;

            this.needsRedraw = true;
        },

        startDrag(event)
        {
            this.isDragging = true;
            this.dragStartX = event.offsetX;
            this.dragStartY = event.offsetY;
            this.lastPanX = this.panX;
            this.lastPanY = this.panY;
        },

        handleMouseMove(event)
        {
            const mouseX = event.offsetX;
            const mouseY = event.offsetY;

            this.mousePosition = this.canvasToLatLon(mouseX, mouseY);
            this.mouseCanvasX = mouseX;
            this.mouseCanvasY = mouseY;

            if (this.isDragging) {
                const deltaX = mouseX - this.dragStartX;
                const deltaY = mouseY - this.dragStartY;

                this.panX = this.lastPanX + deltaX;
                this.panY = this.lastPanY + deltaY;
                this.needsRedraw = true;
            }
        },

        endDrag()
        {
            this.isDragging = false;
        },

        zoomIn()
        {
            this.zoom *= 1.2;
            this.needsRedraw = true;
        },

        zoomOut()
        {
            this.zoom *= 0.8;
            this.needsRedraw = true;
        },

        // Utility methods
        calculateDistance(lat1, lon1, lat2, lon2)
        {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        },

        calculateTrackDistance(track)
        {
            if (track.points.length < 2) return 0;

            let distance = 0;
            for (let i = 1; i < track.points.length; i++) {
                distance += this.calculateDistance(
                    track.points[i - 1].latitude,
                    track.points[i - 1].longitude,
                    track.points[i].latitude,
                    track.points[i].longitude
                );
            }
            return distance;
        },

        formatTimeWithSeconds(timestamp)
        {
            return new Date(timestamp).toISOString().substring(11);
        },
        formatTime(timestamp)
        {
            return new Date(timestamp).toLocaleTimeString();
        },

        getAllPoints()
        {
            const allPoints = [];
            for (const track of this.tracks.values()) {
                allPoints.push(...track.points);
            }
            return allPoints;
        },

        getTotalDistance()
        {
            let total = 0;
            for (const track of this.tracks.values()) {
                total += this.calculateTrackDistance(track);
            }
            return total;
        },

        darkenColor(color, amount)
        {
            // Convert hex to RGB
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);

            // Darken
            r = Math.floor(r * (1 - amount));
            g = Math.floor(g * (1 - amount));
            b = Math.floor(b * (1 - amount));

            // Convert back to hex
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        },

        // Export methods
        exportActiveTrack()
        {
            if (!this.activeTrack) return;

            const geojson = {
                type:     "FeatureCollection",
                features: [
                    {
                        type:       "Feature",
                        geometry:   {
                            type:        "LineString",
                            coordinates: this.activeTrack.points.map(p => [p.longitude, p.latitude])
                        },
                        properties: {
                            color:    this.activeTrack.color,
                            points:   this.activeTrack.points.length,
                            distance: this.totalDistance,
                            duration: this.duration
                        }
                    }
                ]
            };

            this.downloadFile(`${this.activeTrackId}.geojson`, JSON.stringify(geojson, null, 2));
        },

        exportAllTracks()
        {
            const features = [];

            for (const [trackId, track] of this.tracks) {
                if (track.points.length > 0) {
                    features.push({
                        type:       "Feature",
                        geometry:   {
                            type:        "LineString",
                            coordinates: track.points.map(p => [p.longitude, p.latitude])
                        },
                        properties: {
                            id:       trackId,
                            color:    track.color,
                            points:   track.points.length,
                            distance: this.calculateTrackDistance(track)
                        }
                    });
                }
            }

            const geojson = {
                type: "FeatureCollection",
                features
            };

            this.downloadFile('all-tracks.geojson', JSON.stringify(geojson, null, 2));
        },

        copyActiveTrack()
        {
            if (!this.activeTrack) return;

            const text = JSON.stringify({
                trackId: this.activeTrackId,
                ...this.activeTrack
            }, null, 2);

            navigator.clipboard.writeText(text).then(() => {
                this.$emit('copied');
            });
        },

        downloadFile(filename, content)
        {
            const blob = new Blob([content], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },

        // Demo
        simulateMultipleTracks()
        {
            this.clearAllTracks();

            // Create 3 demo tracks
            const trackIds = ['boat-1', 'boat-2', 'boat-3'];
            const centers = [
                {lat: 40.7128, lon: -74.0060},
                {lat: 40.7200, lon: -74.0100},
                {lat: 40.7050, lon: -74.0000}
            ];

            trackIds.forEach((trackId, index) => {
                this.createTrack(trackId, `Boat ${index + 1}`);
                this.startTracking();

                // Generate points in a spiral pattern
                const points = 20;
                const radius = 0.003 * (index + 1);

                for (let i = 0; i < points; i++) {
                    setTimeout(() => {
                        const angle = (i / points) * Math.PI * 2 + (index * Math.PI / 3);
                        const lat = centers[index].lat + Math.sin(angle) * radius * (i / points);
                        const lon = centers[index].lon + Math.cos(angle) * radius * (i / points);

                        this.addPointToTrack(trackId, {
                            latitude:  lat,
                            longitude: lon,
                            timestamp: Date.now()
                        });
                    }, i * 100);
                }
            });

            // Fit all tracks to view after simulation
            setTimeout(() => {
                // this.fitToView();
                this.stopTracking();
            }, trackIds.length * 20 * 100 + 100);
        },

        fitToView()
        {
            const allPoints = this.getAllPoints();
            if (allPoints.length === 0) return;

            // Calculate bounds of all points
            let minLat = allPoints[0].latitude;
            let maxLat = allPoints[0].latitude;
            let minLon = allPoints[0].longitude;
            let maxLon = allPoints[0].longitude;

            allPoints.forEach(point => {
                minLat = Math.min(minLat, point.latitude);
                maxLat = Math.max(maxLat, point.latitude);
                minLon = Math.min(minLon, point.longitude);
                maxLon = Math.max(maxLon, point.longitude);
            });

            // Calculate required zoom
            const latSpan = maxLat - minLat;
            const lonSpan = maxLon - minLon;

            const scaleLat = (this.height * 0.8) / (latSpan * 111319.9);
            const scaleLon = (this.width * 0.8) / (lonSpan * 111319.9 * Math.cos(minLat * Math.PI / 180));

            this.zoom = Math.min(scaleLat, scaleLon, 20);
            this.zoom = Math.max(this.zoom, 0.1);

            // Center the view
            const centerLat = (minLat + maxLat) / 2;
            const centerLon = (minLon + maxLon) / 2;

            const centerPoint = this.projectToCanvas(centerLat, centerLon);
            this.panX = this.width / 2 - centerPoint.x;
            this.panY = this.height / 2 - centerPoint.y;

            this.needsRedraw = true;
        },

        handleResize()
        {
            this.needsRedraw = true;
        }
    }
}
;
</script>

<style scoped>
.gps-tracker {
    margin: 20px 0;
    gap: 20px;
}

.left-controls,
.center-controls,
.right-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: white;
    color: var(--text-dark);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

button:active:not(:disabled) {
    transform: translateY(0);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.track-btn {
    padding: 10px 20px;
    font-size: 16px;
    font-weight: 600;
    background: #4CAF50;
    color: white;
    min-width: 140px;
}

.track-btn.active {
    background: #f44336;
}

.track-btn.paused {
    background: #ff9800;
}

.track-btn span {
    margin-right: 8px;
    font-size: 18px;
}

.clear-btn {
    background: #9E9E9E;
    color: white;
}

.track-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: var(--text-dark);
    font-size: 14px;
    min-width: 150px;
}

.zoom-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 20px;
}

.zoom-controls button {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.9);
}

.zoom-controls span {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
}

.toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-size: 14px;
}

.toggle input[type="checkbox"] {
    margin: 0;
}

.status-indicator {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-stopped {
    background: rgba(158, 158, 158, 0.2);
}

.status-paused {
    background: rgba(255, 152, 0, 0.2);
}

.status-tracking {
    background: rgba(76, 175, 80, 0.2);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
    100% {
        opacity: 1;
    }
}

.track-info {
    display: flex;
    gap: 16px;
    font-size: 14px;
    opacity: 0.9;
}

.canvas-container {
    position: relative;
    width: 100%;
    height: 600px;
    background: #f8f9fa;
    overflow: hidden;
}

.cursor-grab {
    cursor: grab;
}

.cursor-grabbing {
    cursor: grabbing;
}

canvas {
    display: block;
    background: #f8f9fa;
}

.no-data-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(248, 249, 250, 0.9);
}

.no-data-content {
    text-align: center;
    max-width: 300px;
}

.no-data-content .icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-data-content h3 {
    margin: 0 0 8px 0;
    color: var(--text-dark);
}

.no-data-content p {
    margin: 0 0 20px 0;
    color: #666;
}

.demo-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
}

.current-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.center-dot {
    width: 12px;
    height: 12px;
    background: #f44336;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #f44336;
}

.pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: rgba(244, 67, 54, 0.3);
    border-radius: 50%;
    animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.8;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
    }
}

.scale-bar {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 6px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.scale-line {
    height: 3px;
    width: 100px;
    background: var(--text-dark);
    margin-bottom: 4px;
}

.scale-label {
    font-size: 12px;
    color: var(--text-dark);
    text-align: center;
}

.coordinates-display {
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: var(--text-dark);
}

.info-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
    border-top: 1px solid var(--border-color);
}

.info-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.position-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.coord {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.coord .label {
    color: var(--text-light);
    font-weight: 500;
    min-width: 60px;
}

.coord .value {
    font-family: monospace;
}

.color-picker {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    padding: 0;
}

.no-position {
    color: #999;
    font-style: italic;
    font-size: 14px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat {
    text-align: center;
    padding: 8px;
    background: white;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #667eea;
}

.stat-label {
    font-size: 11px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

.export-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.export-buttons button {
    flex: 1;
    min-width: 80px;
    font-size: 12px;
    padding: 8px;
}

/* Tracks List Panel */
.tracks-list-panel {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 10px;

}

.tracks-list-panel h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-dark);
}

.tracks-container {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.3);
}

.track-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
}

.track-item:hover {
    background-color: #f8f8f8;
}

.track-item.active {
    background-color: #e3f2fd;
    border-left: 3px solid #2196F3;
}

.track-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 12px;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.track-info {
    flex: 1;
    min-width: 0;
}

.track-name {
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-details {
    display: flex;
    gap: 12px;
    font-size: 11px;
    color: #666;
}

.track-actions {
    margin-left: auto;
}

.remove-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffebee;
    color: #f44336;
    border-radius: 50%;
    font-size: 16px;
    font-weight: bold;
}

.remove-btn:hover {
    background: #ffcdd2;
    transform: scale(1.1);
}

@media (max-width: 1024px) {
    .info-panel {
        grid-template-columns: 1fr;
    }

    .panel-header {
        flex-wrap: wrap;
        gap: 12px;
    }

    .left-controls,
    .center-controls,
    .right-controls {
        width: 100%;
        justify-content: center;
    }
}
</style>