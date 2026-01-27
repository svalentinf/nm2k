<template>
    <div class="gps-tracker ">
        <div class="panel">

            <!-- Control Panel -->
            <div class="panel-header">
                <div class="left-controls">
                    <button
                            @click="toggleTracking"
                            :class="['track-btn', { active: isTracking, paused: isPaused }]"
                            :title="isTracking ? 'Stop tracking' : 'Start tracking'"
                    >
                        <span v-if="isTracking && !isPaused">●</span>
                        <span v-else-if="isPaused">❚❚</span>
                        <span v-else>▶</span>
                        {{ isTracking ? (isPaused ? 'Paused' : 'Tracking') : 'Start Track' }}
                    </button>

                    <button
                            @click="togglePause"
                            :disabled="!isTracking"
                            class="pause-btn"
                    >
                        {{ isPaused ? 'Resume' : 'Pause' }}
                    </button>

                    <button
                            @click="clearTrack"
                            :disabled="!hasTrack"
                            class="clear-btn"
                    >
                        Clear
                    </button>

                    {{ tracked }}

                    <button
                            @click="$emit('trackPgn', tracked)"
                            :class="['track-btn', { active: isTracking, paused: isPaused }]"
                            :title="isTracking ? 'Stop tracking' : 'Start tracking'"
                    >
                        Remove
                    </button>
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
                </div>

                <div class="right-controls">
                    <div class="status-indicator" :class="statusClass">
                        {{ statusText }}
                    </div>

                    <div class="track-info">
                        <span>Points: {{ track.length }}</span>
                        <span v-if="totalDistance > 0">{{ totalDistance.toFixed(2) }} km</span>
                        <span v-if="track.length > 0">{{ duration }}</span>
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
                <div v-if="!hasTrack" class="no-data-overlay">
                    <div class="no-data-content">
                        <div class="icon">📍</div>
                        <h3>No Track Data</h3>
                        <p v-if="!isTracking">Click "Start Track" to begin recording</p>
                        <p v-else>Waiting for GPS data...</p>
                        <button @click="simulateTrack" class="demo-btn">
                            Try Demo Track
                        </button>
                    </div>
                </div>

                <!-- Current Position Marker -->
                <div
                        v-if="currentPosition && isTracking && !isPaused"
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
            </div>

            <!-- Track Info Panel -->
            <div class="info-panel">
                <div class="info-section">
                    <h4>Current Position</h4>
                    <div v-if="currentPosition" class="position-info">
                        <div class="coord">
                            <span class="label">Lat:</span>
                            <span class="value">{{ currentPosition.latitude.toFixed(7) }}</span>
                        </div>
                        <div class="coord">
                            <span class="label">Lon:</span>
                            <span class="value">{{ currentPosition.longitude.toFixed(7) }}</span>
                        </div>
                        <div class="coord" v-if="currentPosition.timestamp">
                            <span class="label">Time:</span>
                            <span class="value">{{ formatTime(currentPosition.timestamp) }}</span>
                        </div>
                        <div class="coord" v-if="currentSpeed > 0">
                            <span class="label">Speed:</span>
                            <span class="value">{{ currentSpeed.toFixed(1) }} km/h</span>
                        </div>
                    </div>
                    <div v-else class="no-position">
                        No position data
                    </div>
                </div>

                <div class="info-section">
                    <h4>Track Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat">
                            <div class="stat-value">{{ track.length }}</div>
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
                        <button @click="exportGeoJSON" title="Export as GeoJSON">GeoJSON</button>
                        <button @click="exportGPX" title="Export as GPX">GPX</button>
                        <button @click="exportCSV" title="Export as CSV">CSV</button>
                        <button @click="copyTrack" title="Copy to clipboard">📋</button>
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
        tracked: String,
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
        },

        // Track style
        trackColor: {
            type:    String,
            default: '#2196F3'
        },
        trackWidth: {
            type:    Number,
            default: 3
        },

        // Point style
        pointColor:        {
            type:    String,
            default: '#FF5722'
        },
        currentPointColor: {
            type:    String,
            default: '#F44336'
        }
    },

    data()
    {
        return {
            // Track data
            track:            [],
            isTracking:       false,
            isPaused:         false,
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
            autoCenter: true,
            showGrid:   true,

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
            needsRedraw:    true
        };
    },

    computed: {
        hasTrack()
        {
            return this.track.length > 0;
        },

        statusClass()
        {
            if (!this.isTracking) return 'status-stopped';
            if (this.isPaused) return 'status-paused';
            return 'status-tracking';
        },

        statusText()
        {
            if (!this.isTracking) return 'Stopped';
            if (this.isPaused) return 'Paused';
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
                return `${(scaleMeters / 1000).toFixed(1)} km`;
            }
            return `${Math.round(scaleMeters)} m`;
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
            if (!this.startTime || this.track.length < 2) return '00:00';

            const start = this.track[0].timestamp || this.startTime;
            const end = this.track[this.track.length - 1].timestamp || Date.now();
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
                if (`${newPgn.src}:${newPgn.pgn}` != this.tracked) {
                    return;
                }
                console.log(this.tracked, `${newPgn.src}:${newPgn.pgn}`)

                if (newPgn && this.isTracking && !this.isPaused) {
                    //@todo only if is different then previous one ??
                    if (typeof newPgn.fields !== 'undefined' && newPgn.fields.latitude !== 'undefined' && newPgn.fields.longitude !== 'undefined' && newPgn.fields.latitude && newPgn.fields.longitude) {
                        this.addPoint({
                            latitude:  newPgn.fields.latitude,
                            longitude: newPgn.fields.longitude,
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                alert('1312312')
            }

        },

        isTracking(newVal)
        {
            if (newVal) {
                this.startTime = Date.now();
                this.$emit('tracking-started');
            } else {
                this.$emit('tracking-stopped', {
                    points:   this.track.length,
                    distance: this.totalDistance,
                    duration: this.duration
                });
            }
        },

        track()
        {
            this.needsRedraw = true;
            this.updateMetrics();
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
    },

    mounted()
    {
        this.initCanvas();
        this.setupAnimation();

        if (this.autoStart) {
            this.startTracking();
        }

        // Handle window resize
        window.addEventListener('resize', this.handleResize);
    },

    beforeDestroy()
    {
        window.removeEventListener('resize', this.handleResize);
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    },

    methods: {
        initCanvas()
        {
            const canvas = this.$refs.canvas;
            this.ctx = canvas.getContext('2d');

            // Set high DPI for retina displays
            const dpr = 1;
            // const dpr = window.devicePixelRatio || 1;
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

        // Project latitude/longitude to canvas coordinates
        projectToCanvas(lat, lon)
        {
            // Simple equirectangular projection
            // Scale factor: 1 degree = 111km at equator
            const scale = 111319.9 * this.zoom; // meters per pixel at zoom 1

            // Use first point as reference if we have track
            let refLat = 0, refLon = 0;
            if (this.track.length > 0) {
                refLat = this.track[0].latitude;
                refLon = this.track[0].longitude;
            } else
                if (this.currentPosition) {
                    refLat = this.currentPosition.latitude;
                    refLon = this.currentPosition.longitude;
                }

            const x = this.width / 2 + (lon - refLon) * scale * Math.cos(refLat * Math.PI / 180) + this.panX;
            const y = this.height / 2 - (lat - refLat) * scale + this.panY; // Invert Y axis

            return {x, y};
        },

        // Convert canvas coordinates to lat/lon
        canvasToLatLon(x, y)
        {
            const scale = 111319.9 * this.zoom;
            let refLat = 0, refLon = 0;

            if (this.track.length > 0) {
                refLat = this.track[0].latitude;
                refLon = this.track[0].longitude;
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

            // Draw track line
            if (this.track.length > 1) {
                this.drawTrack();
            }

            // Draw points
            if (this.track.length > 0) {
                this.drawPoints();
            }

            // Draw start/finish markers
            if (this.track.length > 0) {
                this.drawMarkers();
            }
        },

        drawGrid()
        {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;

            const gridSize = 50 / (this.zoom * 10); // Grid spacing in pixels

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

        drawTrack()
        {
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.trackColor;
            this.ctx.lineWidth = this.trackWidth;
            this.ctx.lineJoin = 'round';
            this.ctx.lineCap = 'round';

            // Draw smooth line through all points
            const firstPoint = this.projectToCanvas(
                this.track[0].latitude,
                this.track[0].longitude
            );
            this.ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < this.track.length; i++) {
                const point = this.projectToCanvas(
                    this.track[i].latitude,
                    this.track[i].longitude
                );
                this.ctx.lineTo(point.x, point.y);
            }

            this.ctx.stroke();

            // Draw distance markers every 1km
            if (this.totalDistance > 1) {
                this.drawDistanceMarkers();
            }
        },

        drawPoints()
        {
            // Draw all points
            this.track.forEach((point, index) => {
                const canvasPoint = this.projectToCanvas(point.latitude, point.longitude);

                // Draw point circle
                this.ctx.beginPath();
                this.ctx.fillStyle = index === this.track.length - 1 ? this.currentPointColor : this.pointColor;
                this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw point outline
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 1;
                this.ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, Math.PI * 2);
                this.ctx.stroke();
            });
        },

        drawMarkers()
        {
            // Draw start marker
            const startPoint = this.projectToCanvas(
                this.track[0].latitude,
                this.track[0].longitude
            );

            this.ctx.beginPath();
            this.ctx.fillStyle = '#4CAF50'; // Green for start
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

            // Draw end marker if track has ended
            if (!this.isTracking || this.isPaused) {
                const endPoint = this.projectToCanvas(
                    this.track[this.track.length - 1].latitude,
                    this.track[this.track.length - 1].longitude
                );

                this.ctx.beginPath();
                this.ctx.fillStyle = '#F44336'; // Red for end
                this.ctx.arc(endPoint.x, endPoint.y, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFFFFF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillText('F', endPoint.x, endPoint.y);
            }
        },

        drawDistanceMarkers()
        {
            let accumulatedDistance = 0;

            for (let i = 1; i < this.track.length; i++) {
                const segmentDistance = this.calculateDistance(
                    this.track[i - 1].latitude,
                    this.track[i - 1].longitude,
                    this.track[i].latitude,
                    this.track[i].longitude
                );
                accumulatedDistance += segmentDistance;

                // Every 1km
                if (accumulatedDistance >= 1) {
                    const point = this.projectToCanvas(
                        this.track[i].latitude,
                        this.track[i].longitude
                    );

                    this.ctx.beginPath();
                    this.ctx.fillStyle = '#666';
                    this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.fillStyle = '#666';
                    this.ctx.font = '9px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`${Math.floor(accumulatedDistance)}k`, point.x, point.y - 8);

                    accumulatedDistance = 0; // Reset for next marker
                }
            }
        },

        // Core tracking methods
        startTracking()
        {
            this.isTracking = true;
            this.isPaused = false;
            this.startTime = Date.now();
            this.$emit('tracking-started');
        },

        stopTracking()
        {
            this.isTracking = false;
            this.isPaused = false;
            this.$emit('tracking-stopped', {
                points:   this.track.length,
                distance: this.totalDistance,
                duration: this.duration
            });
        },

        toggleTracking()
        {
            if (this.isTracking) {
                this.stopTracking();
            } else {
                this.startTracking();
            }
        },

        togglePause()
        {
            if (!this.isTracking) return;

            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.$emit('tracking-paused');
            } else {
                this.$emit('tracking-resumed');
            }
        },

        addPoint(point)
        {
            const newPoint = {
                latitude:  point.latitude,
                longitude: point.longitude,
                timestamp: point.timestamp || Date.now(),
                speed:     point.speed || 0
            };

            // Calculate speed if not provided
            if (!point.speed && this.previousPosition) {
                // const distance = this.calculateDistance(
                //     this.previousPosition.latitude,
                //     this.previousPosition.longitude,
                //     point.latitude,
                //     point.longitude
                // );
                // const timeDiff = (newPoint.timestamp - this.previousPosition.timestamp) / 3600000; // hours
                // if (timeDiff > 0) {
                //     newPoint.speed = distance / timeDiff;
                // }
            }

            // Add to track
            this.track.push(newPoint);
            this.currentPosition = newPoint;

            // Apply max points limit
            if (this.maxPoints > 0 && this.track.length > this.maxPoints) {
                this.track.shift();
            }

            // Update total distance
            if (this.previousPosition) {
                this.totalDistance += this.calculateDistance(
                    this.previousPosition.latitude,
                    this.previousPosition.longitude,
                    point.latitude,
                    point.longitude
                );
            }

            // Auto-center if enabled
            if (this.autoCenter && this.isTracking && !this.isPaused) {
                this.centerOnPoint(newPoint);
            }

            this.previousPosition = newPoint;
            this.currentSpeed = newPoint.speed;

            // Emit event
            this.$emit('point-added', newPoint);
            this.$emit('track-updated', {
                point:         newPoint,
                totalPoints:   this.track.length,
                totalDistance: this.totalDistance
            });

            this.needsRedraw = true;
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

        clearTrack()
        {
            this.track = [];
            this.currentPosition = null;
            this.previousPosition = null;
            this.totalDistance = 0;
            this.currentSpeed = 0;
            this.avgSpeed = 0;
            this.startTime = null;
            this.panX = 0;
            this.panY = 0;
            this.zoom = 150;
            this.$emit('track-cleared');
            this.needsRedraw = true;
        },

        updateMetrics()
        {
            if (this.track.length < 2) {
                this.avgSpeed = 0;
                return;
            }

            const firstPoint = this.track[0];
            const lastPoint = this.track[this.track.length - 1];
            const totalTime = (lastPoint.timestamp - firstPoint.timestamp) / 3600000; // hours

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

            // Store mouse position in world coordinates before zoom
            const worldBefore = this.canvasToLatLon(mouseX, mouseY);

            // Apply zoom
            this.zoom *= zoomFactor;
            this.zoom = Math.max(0.1, Math.min(this.zoom, 20));

            // Adjust pan to keep mouse position stable
            const worldAfter = this.canvasToLatLon(mouseX, mouseY);
            const deltaLon = worldAfter.lon - worldBefore.lon;
            const deltaLat = worldAfter.lat - worldBefore.lat;

            const scale = 111319.9 * this.zoom;
            this.panX -= deltaLon * scale * Math.cos(worldBefore.lat * Math.PI / 180);
            this.panY += deltaLat * scale; // Inverted Y axis

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

            // Update mouse position display
            this.mousePosition = this.canvasToLatLon(mouseX, mouseY);
            this.mouseCanvasX = mouseX;
            this.mouseCanvasY = mouseY;

            // Handle dragging
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

        // Export methods
        exportGeoJSON()
        {
            const geojson = {
                type:     "FeatureCollection",
                features: [
                    {
                        type:       "Feature",
                        geometry:   {
                            type:        "LineString",
                            coordinates: this.track.map(p => [p.longitude, p.latitude])
                        },
                        properties: {
                            name:      "GPS Track",
                            points:    this.track.length,
                            distance:  this.totalDistance,
                            duration:  this.duration,
                            startTime: this.track[0]?.timestamp,
                            endTime:   this.track[this.track.length - 1]?.timestamp
                        }
                    }
                ]
            };

            this.downloadFile('track.geojson', JSON.stringify(geojson, null, 2));
            this.$emit('exported', {format: 'geojson', data: geojson});
        },

        exportGPX()
        {
            let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPS Tracker">
  <trk>
    <name>GPS Track</name>
    <trkseg>`;

            this.track.forEach(point => {
                gpx += `
      <trkpt lat="${point.latitude}" lon="${point.longitude}">
        <time>${new Date(point.timestamp).toISOString()}</time>
      </trkpt>`;
            });

            gpx += `
    </trkseg>
  </trk>
</gpx>`;

            this.downloadFile('track.gpx', gpx);
            this.$emit('exported', {format: 'gpx', data: gpx});
        },

        exportCSV()
        {
            let csv = "latitude,longitude,timestamp,speed_kmh\n";
            this.track.forEach(point => {
                csv += `${point.latitude},${point.longitude},${point.timestamp},${point.speed || 0}\n`;
            });

            this.downloadFile('track.csv', csv);
            this.$emit('exported', {format: 'csv', data: csv});
        },

        copyTrack()
        {
            const text = JSON.stringify(this.track, null, 2);
            navigator.clipboard.writeText(text).then(() => {
                this.$emit('copied');
            });
        },

        downloadFile(filename, content)
        {
            const blob = new Blob([content], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },

        // Utility methods
        calculateDistance(lat1, lon1, lat2, lon2)
        {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a =
                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        },

        formatTime(timestamp)
        {
            return new Date(timestamp).toLocaleTimeString();
        },

        handleResize()
        {
            // Optional: Implement responsive resizing
            this.needsRedraw = true;
        },

        // Demo/Simulation
        simulateTrack()
        {
            this.clearTrack();
            this.startTracking();

            // Create a circular track
            const centerLat = 40.7128;
            const centerLon = -74.0060;
            const radius = 0.1; // ~1.1km
            const points = 1000;

            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const lat = centerLat + Math.sin(angle) * radius;
                const lon = centerLon + Math.cos(angle) * radius;

                setTimeout(() => {
                    this.addPoint({
                        latitude:  lat,
                        longitude: lon,
                        timestamp: Date.now()
                    });
                }, i * 100);
            }

            // Stop after completing circle
            setTimeout(() => {
                this.stopTracking();
            }, points * 100 + 100);
        },

        // Public API methods (can be called from parent)
        addPosition(latitude, longitude, timestamp, speed)
        {
            if (this.isTracking && !this.isPaused) {
                this.addPoint({latitude, longitude, timestamp, speed});
            }
        },

        getTrack()
        {
            return [...this.track];
        },

        getStatistics()
        {
            return {
                points:       this.track.length,
                distance:     this.totalDistance,
                duration:     this.duration,
                avgSpeed:     this.avgSpeed,
                currentSpeed: this.currentSpeed
            };
        },

        fitToView()
        {
            if (this.track.length === 0) return;

            // Calculate bounds
            let minLat = this.track[0].latitude;
            let maxLat = this.track[0].latitude;
            let minLon = this.track[0].longitude;
            let maxLon = this.track[0].longitude;

            this.track.forEach(point => {
                minLat = Math.min(minLat, point.latitude);
                maxLat = Math.max(maxLat, point.latitude);
                minLon = Math.min(minLon, point.longitude);
                maxLon = Math.max(maxLon, point.longitude);
            });

            // Calculate required zoom to fit
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
        }
    }
};
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
    color: #333;
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

.pause-btn {
    background: #2196F3;
    color: white;
}

.clear-btn {
    background: #9E9E9E;
    color: white;
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
    color: #333;
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
    background: #333;
    margin-bottom: 4px;
}

.scale-label {
    font-size: 12px;
    color: #333;
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
}

.info-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
    background: #f5f5f5;
    border-top: 1px solid #e0e0e0;
}

.info-section h4 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.position-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.coord {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
}

.coord .label {
    color: #666;
    font-weight: 500;
}

.coord .value {
    font-family: monospace;
    color: #333;
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

@media (max-width: 1024px) {
    .info-panel {
        grid-template-columns: 1fr;
    }

    .control-panel {
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