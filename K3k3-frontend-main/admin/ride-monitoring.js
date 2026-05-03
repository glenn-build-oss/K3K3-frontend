// K3K3 Admin - Real-time Ride Monitoring System with Real API
class RideMonitoring {
    constructor() {
        this.rides = [];
        this.isPaused = false;
        this.updateInterval = null;
        this.chart = null;
        this.apiBaseUrl = '/api/v1';
        this.refreshInterval = 15000; // 15 seconds for real-time updates
        this.websocket = null;
        this.init();
    }

    init() {
        console.log('🚀 Initializing Real-time Ride Monitoring with Real API...');
        this.setupEventListeners();
        this.initializeChart();
        this.connectWebSocket();
        this.loadRealTimeData();
        this.startRealTimeUpdates();
        console.log('✅ Ride Monitoring System Ready for Real Data');
    }

    async loadRealTimeData() {
        try {
            console.log('📊 Loading real-time monitoring data...');
            
            // Load all monitoring data in parallel
            const [ridesData, vehiclesData, statsData, analyticsData] = await Promise.all([
                this.fetchActiveRides(),
                this.fetchLiveVehicles(),
                this.fetchMonitoringStats(),
                this.fetchAnalytics()
            ]);

            // Update all monitoring components
            this.updateRidesTable(ridesData);
            this.updateLiveMap(vehiclesData);
            this.updateStats(statsData);
            this.updateChart(analyticsData);
            
            this.showNotification('Monitoring data updated', 'success');
            
        } catch (error) {
            console.error('❌ Error loading monitoring data:', error);
            this.showNotification('Failed to load monitoring data', 'error');
            // Fallback to mock data if API fails
            this.loadMockData();
        }
    }

    connectWebSocket() {
        try {
            // Connect to real-time WebSocket for live updates
            const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${this.apiBaseUrl}/ws/monitoring`;
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('🔌 WebSocket connected for real-time updates');
                this.showNotification('Real-time connection established', 'success');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            this.websocket.onclose = () => {
                console.log('🔌 WebSocket disconnected, attempting reconnect...');
                setTimeout(() => this.connectWebSocket(), 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.showNotification('Real-time connection error', 'error');
            };
            
        } catch (error) {
            console.error('❌ Failed to connect WebSocket:', error);
            // Fallback to polling
            this.startRealTimeUpdates();
        }
    }

    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'vehicle_update':
                this.updateVehiclePosition(data.payload);
                break;
            case 'ride_update':
                this.updateRideStatus(data.payload);
                break;
            case 'new_ride':
                this.addNewRide(data.payload);
                break;
            case 'stats_update':
                this.updateStats(data.payload);
                break;
            case 'rider_location':
                this.updateRiderLocation(data.payload);
                break;
            case 'passenger_location':
                this.updatePassengerLocation(data.payload);
                break;
        }
    }

    updateRiderLocation(riderData) {
        console.log('📍 Updating rider location:', riderData);
        
        // Find rider vehicle on map
        const vehicleElement = document.querySelector(`[data-vehicle-id="${riderData.riderId}"]`);
        if (vehicleElement) {
            // Update vehicle position on map
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                // Convert GPS coordinates to map position (simplified)
                const mapX = (riderData.longitude + 0.5) * 100; // Simplified conversion
                const mapY = (riderData.latitude + 0.5) * 100;
                
                vehicleElement.style.left = `${mapX}%`;
                vehicleElement.style.top = `${mapY}%`;
                
                // Update GPS status indicator
                const gpsIndicator = vehicleElement.querySelector('.vehicle-status');
                if (gpsIndicator) {
                    gpsIndicator.textContent = riderData.isOnline ? 'GPS Active' : 'GPS Off';
                    gpsIndicator.style.color = riderData.isOnline ? '#4caf50' : '#f44336';
                }
                
                // Show real-time indicator
                if (riderData.isOnline) {
                    vehicleElement.classList.add('live-tracking');
                } else {
                    vehicleElement.classList.remove('live-tracking');
                }
            }
        }
        
        // Update rides table with GPS info
        this.updateRideTableWithGPS(riderData);
    }

    updatePassengerLocation(passengerData) {
        console.log('📍 Updating passenger location:', passengerData);
        
        // Add or update passenger marker on map
        let passengerMarker = document.querySelector(`[data-passenger-id="${passengerData.passengerId}"]`);
        if (!passengerMarker && passengerData.latitude && passengerData.longitude) {
            // Create new passenger marker
            const mapContainer = document.querySelector('.map-background');
            if (mapContainer) {
                passengerMarker = document.createElement('div');
                passengerMarker.className = 'passenger-marker';
                passengerMarker.setAttribute('data-passenger-id', passengerData.passengerId);
                passengerMarker.innerHTML = `
                    <i class="fas fa-user"></i>
                    <div class="passenger-info">Passenger</div>
                `;
                mapContainer.appendChild(passengerMarker);
            }
        }
        
        if (passengerMarker && passengerData.latitude && passengerData.longitude) {
            // Update passenger position
            const mapX = (passengerData.longitude + 0.5) * 100;
            const mapY = (passengerData.latitude + 0.5) * 100;
            
            passengerMarker.style.left = `${mapX}%`;
            passengerMarker.style.top = `${mapY}%`;
        }
    }

    updateRideTableWithGPS(riderData) {
        // Find ride in table and update GPS status
        const rideRows = document.querySelectorAll('.rides-table tbody tr');
        rideRows.forEach(row => {
            const riderIdCell = row.querySelector('.rider-id');
            if (riderIdCell && riderIdCell.textContent.includes(riderData.riderId)) {
                const gpsStatusCell = row.querySelector('.gps-status');
                if (gpsStatusCell) {
                    if (riderData.isOnline) {
                        gpsStatusCell.innerHTML = '<i class="fas fa-satellite-dish"></i> GPS Active';
                        gpsStatusCell.className = 'gps-status active';
                    } else {
                        gpsStatusCell.innerHTML = '<i class="fas fa-satellite-dish"></i> GPS Off';
                        gpsStatusCell.className = 'gps-status inactive';
                    }
                }
            }
        });
    }

    async fetchActiveRides() {
        const response = await fetch(`${this.apiBaseUrl}/rides/active`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch active rides');
        return await response.json();
    }

    async fetchLiveVehicles() {
        const response = await fetch(`${this.apiBaseUrl}/vehicles/live`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch live vehicles');
        return await response.json();
    }

    async fetchMonitoringStats() {
        const response = await fetch(`${this.apiBaseUrl}/monitoring/stats`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch monitoring stats');
        return await response.json();
    }

    async fetchAnalytics() {
        const response = await fetch(`${this.apiBaseUrl}/analytics/realtime`, {
            headers: {
                'Authorization': `Bearer ${this.getAuthToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return await response.json();
    }

    async updateRideStatus(rideId, status) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) throw new Error('Failed to update ride status');
            
            this.showNotification(`Ride ${rideId} updated to ${status}`, 'success');
            
        } catch (error) {
            console.error('❌ Error updating ride status:', error);
            this.showNotification('Failed to update ride status', 'error');
        }
    }

    async assignDriver(rideId, driverId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ driverId })
            });
            
            if (!response.ok) throw new Error('Failed to assign driver');
            
            this.showNotification('Driver assigned successfully', 'success');
            await this.loadRealTimeData();
            
        } catch (error) {
            console.error('❌ Error assigning driver:', error);
            this.showNotification('Failed to assign driver', 'error');
        }
    }

    async cancelRide(rideId, reason) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) throw new Error('Failed to cancel ride');
            
            this.showNotification('Ride cancelled successfully', 'success');
            await this.loadRealTimeData();
            
        } catch (error) {
            console.error('❌ Error cancelling ride:', error);
            this.showNotification('Failed to cancel ride', 'error');
        }
    }

    getAuthToken() {
        return localStorage.getItem('k3k3_admin_token') || sessionStorage.getItem('k3k3_admin_token');
    }

    startRealTimeUpdates() {
        // Clear existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Update every 15 seconds if WebSocket is not connected
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            this.updateInterval = setInterval(async () => {
                if (!document.hidden && !this.isPaused) {
                    await this.loadRealTimeData();
                }
            }, this.refreshInterval);
            
            console.log(`⏰ Real-time updates started (${this.refreshInterval/1000}s interval)`);
        }
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        console.log('⏹️ Real-time updates stopped');
    }

    // Enhanced update methods for real data
    updateRidesTable(rides) {
        const tbody = document.getElementById('ridesTableBody');
        if (!tbody) return;
        
        if (!rides || rides.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="no-data">No active rides found</td></tr>';
            return;
        }
        
        tbody.innerHTML = rides.map(ride => `
            <tr class="ride-row" data-ride-id="${ride.id}">
                <td class="ride-id">${ride.id}</td>
                <td class="driver-info">
                    <div class="driver-name">${ride.driverName}</div>
                    <div class="driver-id">${ride.driverId}</div>
                </td>
                <td class="rider-info">
                    <div class="rider-name">${ride.riderName}</div>
                    <div class="rider-id">${ride.riderId}</div>
                </td>
                <td class="pickup-location">${ride.pickup}</td>
                <td class="dropoff-location">${ride.dropoff}</td>
                <td class="ride-status">
                    <span class="status-badge status-${ride.status}">${ride.status}</span>
                </td>
                <td class="duration">${ride.duration}</td>
                <td class="fare">₵${ride.fare}</td>
                <td class="actions">
                    <button class="action-btn" onclick="window.rideMonitoring.showRideDetails('${ride.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${ride.status === 'pending' ? `
                        <button class="action-btn" onclick="window.rideMonitoring.assignDriver('${ride.id}')" title="Assign Driver">
                            <i class="fas fa-user-plus"></i>
                        </button>
                    ` : ''}
                    ${ride.status === 'active' ? `
                        <button class="action-btn" onclick="window.rideMonitoring.updateRideStatus('${ride.id}', 'completed')" title="Complete Ride">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn" onclick="window.rideMonitoring.cancelRide('${ride.id}')" title="Cancel Ride">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    }

    updateStats(stats) {
        const activeRidesEl = document.getElementById('activeRides');
        const completedRidesEl = document.getElementById('completedRides');
        const avgDurationEl = document.getElementById('avgDuration');
        const totalRevenueEl = document.getElementById('totalRevenue');
        
        if (activeRidesEl) activeRidesEl.textContent = stats.activeRides || 0;
        if (completedRidesEl) completedRidesEl.textContent = stats.completedToday || 0;
        if (avgDurationEl) avgDurationEl.textContent = stats.avgDuration || '0m';
        if (totalRevenueEl) totalRevenueEl.textContent = `₵${(stats.todayRevenue || 0).toLocaleString()}`;
    }

    updateLiveMap(vehiclesData) {
        // Update vehicle positions on the map
        if (vehiclesData && vehiclesData.vehicles) {
            vehiclesData.vehicles.forEach(vehicle => {
                const vehicleEl = document.querySelector(`[data-vehicle-id="${vehicle.id}"]`);
                if (vehicleEl) {
                    vehicleEl.style.left = `${vehicle.position.lat}%`;
                    vehicleEl.style.top = `${vehicle.position.lng}%`;
                    
                    // Update status
                    const statusEl = vehicleEl.querySelector('.vehicle-status');
                    if (statusEl) {
                        statusEl.textContent = vehicle.status;
                        statusEl.className = `vehicle-status status-${vehicle.status}`;
                    }
                }
            });
        }
        
        // Update map statistics
        this.updateMapStatistics(vehiclesData);
    }

    updateMapStatistics(vehiclesData) {
        const totalVehiclesEl = document.getElementById('totalActiveVehicles');
        const lastUpdateEl = document.getElementById('lastMapUpdate');
        
        if (totalVehiclesEl) {
            totalVehiclesEl.textContent = vehiclesData ? vehiclesData.vehicles.length : 0;
        }
        
        if (lastUpdateEl) {
            const now = new Date();
            lastUpdateEl.textContent = now.toLocaleTimeString();
        }
    }

    async showRideDetails(rideId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            const ride = await response.json();
            
            const modalContent = `
                <div style="background: white; padding: 24px; border-radius: 12px; max-width: 500px;">
                    <h3 style="color: #000; margin-bottom: 16px;">Ride Details</h3>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>Ride ID:</strong> ${ride.id}</div>
                        <div><strong>Driver:</strong> ${ride.driverName} (${ride.driverId})</div>
                        <div><strong>Rider:</strong> ${ride.riderName} (${ride.riderId})</div>
                        <div><strong>Pickup:</strong> ${ride.pickup}</div>
                        <div><strong>Dropoff:</strong> ${ride.dropoff}</div>
                        <div><strong>Vehicle:</strong> ${ride.vehicleType}</div>
                        <div><strong>Fare:</strong> ₵${ride.fare}</div>
                        <div><strong>Duration:</strong> ${ride.duration}</div>
                        <div><strong>Distance:</strong> ${ride.distance} km</div>
                        <div><strong>Status:</strong> <span class="status-badge status-${ride.status}">${ride.status}</span></div>
                        <div><strong>Start Time:</strong> ${new Date(ride.startTime).toLocaleString()}</div>
                        ${ride.endTime ? `<div><strong>End Time:</strong> ${new Date(ride.endTime).toLocaleString()}</div>` : ''}
                    </div>
                    <button onclick="this.closest('.modal-overlay').remove()" style="margin-top: 16px; width: 100%; padding: 12px; background: #000; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                </div>
            `;
            
            this.showModal(modalContent);
            
        } catch (error) {
            console.error('❌ Error fetching ride details:', error);
            this.showNotification('Failed to load ride details', 'error');
        }
    }

    // Fallback to mock data if API fails
    loadMockData() {
        console.log('⚠️ Loading mock data as fallback...');
        // Use existing mock data methods
        this.rides = [
            {
                id: 'K3T-20241216-000001',
                driver: 'K3D-000001 (Kofi Osei)',
                rider: 'K3P-000001 (Kwame Asante)',
                pickup: 'Accra Mall',
                dropoff: 'Kotoka Airport',
                status: 'active',
                startTime: '2024-12-16T10:30:00',
                fare: 45.50,
                duration: '12m',
                vehicleType: 'car'
            }
        ];
        this.updateUI();
    }

    initializeProfessionalMap() {
        console.log('🗺️ Initializing Professional Map...');
        
        // Start vehicle animations
        this.startVehicleAnimations();
        
        // Update map statistics
        this.updateMapStatistics();
        
        // Setup map interactions
        this.setupMapInteractions();
        
        console.log('✅ Professional Map Initialized');
    }

    startVehicleAnimations() {
        const vehicles = document.querySelectorAll('.vehicle-marker');
        vehicles.forEach((vehicle, index) => {
            setTimeout(() => {
                // Random movement pattern
                const movePattern = this.generateMovementPattern();
                this.animateVehicle(vehicle, movePattern);
            }, index * 500);
        });
    }

    generateMovementPattern() {
        const patterns = [
            { x: [0, 20, 0, -20, 0], y: [0, 15, 30, 15, 0], duration: 4000 },
            { x: [15, 10, -15, -10, 15], y: [0, 20, 0, -20, 0], duration: 3500 },
            { x: [0, 25, 0, -25, 0], y: [10, 0, -10, 0, 10], duration: 4500 },
            { x: [20, 0, -20, 0, 20], y: [0, -15, 15, 0, -15], duration: 3800 }
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    animateVehicle(vehicle, pattern) {
        let step = 0;
        const animate = () => {
            if (step < pattern.x.length) {
                const currentLeft = parseFloat(vehicle.style.left);
                const currentTop = parseFloat(vehicle.style.top);
                const newLeft = currentLeft + pattern.x[step];
                const newTop = currentTop + pattern.y[step];
                
                // Keep vehicles within map bounds
                const boundedLeft = Math.max(5, Math.min(90, newLeft));
                const boundedTop = Math.max(10, Math.min(85, newTop));
                
                vehicle.style.left = boundedLeft + '%';
                vehicle.style.top = boundedTop + '%';
                
                step++;
                setTimeout(animate, pattern.duration / pattern.x.length);
            } else {
                // Restart animation
                step = 0;
                setTimeout(animate, 1000);
            }
        };
        animate();
    }

    updateMapStatistics() {
        const totalVehicles = document.querySelectorAll('.vehicle-marker').length;
        const activeVehicles = document.querySelectorAll('.vehicle-marker').length;
        
        document.getElementById('totalActiveVehicles').textContent = totalVehicles;
        
        // Update last update time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('lastMapUpdate').textContent = timeString;
        
        console.log(`📊 Map Stats: ${totalVehicles} vehicles, last update: ${timeString}`);
    }

    setupMapInteractions() {
        // Add click handlers to vehicle markers
        const vehicles = document.querySelectorAll('.vehicle-marker');
        vehicles.forEach(vehicle => {
            vehicle.addEventListener('click', () => {
                const vehicleId = vehicle.getAttribute('data-vehicle-id');
                this.showVehicleDetails(vehicleId);
            });
        });
        
        // Map control handlers
        document.getElementById('centerMap')?.addEventListener('click', () => {
            this.centerMap();
        });
        
        document.getElementById('toggleHeatmap')?.addEventListener('click', () => {
            this.toggleHeatmap();
        });
        
        document.getElementById('toggleSatellite')?.addEventListener('click', () => {
            this.toggleSatellite();
        });
        
        document.getElementById('toggleTraffic')?.addEventListener('click', () => {
            this.toggleTraffic();
        });
        
        document.getElementById('toggle3D')?.addEventListener('click', () => {
            this.toggle3D();
        });
        
        document.getElementById('toggleClusters')?.addEventListener('click', () => {
            this.toggleClusters();
        });
        
        document.getElementById('toggleRoutes')?.addEventListener('click', () => {
            this.toggleRoutes();
        });
        
        document.getElementById('refreshMap')?.addEventListener('click', () => {
            this.refreshMap();
        });
        
        document.getElementById('toggleFullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('zoomIn')?.addEventListener('click', () => {
            this.zoomMap(1);
        });
        
        document.getElementById('zoomOut')?.addEventListener('click', () => {
            this.zoomMap(-1);
        });
    }

    showVehicleDetails(vehicleId) {
        const vehicle = this.rides.find(ride => 
            ride.id.includes(vehicleId.replace('K3V-', '').replace('K3T-', ''))
        );
        
        if (vehicle) {
            const modalContent = `
                <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px;">
                    <h3 style="color: #000; margin-bottom: 16px;">Vehicle Details</h3>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>ID:</strong> ${vehicle.id}</div>
                        <div><strong>Driver:</strong> ${vehicle.driver}</div>
                        <div><strong>Rider:</strong> ${vehicle.rider}</div>
                        <div><strong>Status:</strong> <span class="status-badge status-${vehicle.status}">${vehicle.status}</span></div>
                        <div><strong>Route:</strong> ${vehicle.pickup} → ${vehicle.dropoff}</div>
                        <div><strong>Start Time:</strong> ${new Date(vehicle.startTime).toLocaleString()}</div>
                    </div>
                    <button onclick="this.closest('.modal-overlay').remove()" style="margin-top: 16px; width: 100%; padding: 12px; background: #000; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                </div>
            `;
            
            this.showModal(modalContent);
        }
    }

    centerMap() {
        console.log('🎯 Centering map...');
        // Animation to center view
        const map = document.getElementById('liveMap');
        map.style.transform = 'scale(1.05)';
        setTimeout(() => {
            map.style.transform = 'scale(1)';
        }, 300);
    }

    toggleHeatmap() {
        console.log('🔥 Toggling heatmap...');
        // Toggle heatmap overlay
        const map = document.getElementById('liveMap');
        const hasHeatmap = map.classList.contains('heatmap-active');
        
        if (hasHeatmap) {
            map.classList.remove('heatmap-active');
        } else {
            map.classList.add('heatmap-active');
        }
    }

    toggleClusters() {
        console.log('📊 Toggling clusters...');
        // Toggle vehicle clustering
        const vehicles = document.querySelectorAll('.vehicle-marker');
        vehicles.forEach(vehicle => {
            vehicle.classList.toggle('clustered');
        });
    }

    refreshMap() {
        console.log('🔄 Refreshing map...');
        this.updateMapStatistics();
        this.startVehicleAnimations();
    }

    toggleSatellite() {
        console.log('🛰️ Toggling satellite view...');
        const map = document.getElementById('liveMap');
        const hasSatellite = map.classList.contains('satellite-view');
        
        if (hasSatellite) {
            map.classList.remove('satellite-view');
            map.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #2d3748 100%)';
        } else {
            map.classList.add('satellite-view');
            map.style.background = 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)';
        }
    }

    toggleTraffic() {
        console.log('🚦 Toggling traffic view...');
        const trafficFlows = document.querySelectorAll('.traffic-flow');
        trafficFlows.forEach(flow => {
            flow.style.display = flow.style.display === 'none' ? 'block' : 'none';
        });
    }

    toggle3D() {
        console.log('🎮 Toggling 3D view...');
        const map = document.getElementById('liveMap');
        const has3D = map.classList.contains('view-3d');
        
        if (has3D) {
            map.classList.remove('view-3d');
            map.style.transform = 'perspective(1000px) rotateX(0deg)';
        } else {
            map.classList.add('view-3d');
            map.style.transform = 'perspective(1000px) rotateX(15deg)';
        }
    }

    toggleRoutes() {
        console.log('🛣️ Toggling routes...');
        const routes = document.querySelectorAll('.route-line');
        if (routes.length === 0) {
            this.addRouteLines();
        } else {
            routes.forEach(route => route.remove());
        }
    }

    addRouteLines() {
        const mapBackground = document.querySelector('.map-background');
        const routes = [
            { start: { x: 20, y: 25 }, end: { x: 65, y: 45 }, color: 'rgba(16, 185, 129, 0.3)' },
            { start: { x: 35, y: 65 }, end: { x: 80, y: 30 }, color: 'rgba(245, 158, 11, 0.3)' },
            { start: { x: 55, y: 75 }, end: { x: 42, y: 52 }, color: 'rgba(16, 185, 129, 0.3)' },
        ];
        
        routes.forEach(route => {
            const routeLine = document.createElement('div');
            routeLine.className = 'route-line';
            routeLine.style.cssText = `
                position: absolute;
                top: ${route.start.y}%;
                left: ${route.start.x}%;
                width: ${Math.sqrt(Math.pow(route.end.x - route.start.x, 2) + Math.pow(route.end.y - route.start.y, 2))}%;
                height: 2px;
                background: ${route.color};
                transform: rotate(${Math.atan2(route.end.y - route.start.y, route.end.x - route.start.x) * 180 / Math.PI}deg);
                transform-origin: 0 50%;
                z-index: 7;
                border-radius: 1px;
            `;
            mapBackground.appendChild(routeLine);
        });
    }

    toggleFullscreen() {
        console.log('🖥️ Toggling fullscreen...');
        const map = document.getElementById('liveMap');
        const isFullscreen = map.classList.contains('fullscreen');
        
        if (isFullscreen) {
            map.classList.remove('fullscreen');
            map.style.height = '600px';
        } else {
            map.classList.add('fullscreen');
            map.style.height = '80vh';
        }
    }

    zoomMap(direction) {
        const zoomLevel = document.getElementById('zoomLevel');
        const currentZoom = parseInt(zoomLevel.textContent);
        const newZoom = Math.max(50, Math.min(200, currentZoom + (direction * 10)));
        
        zoomLevel.textContent = newZoom + '%';
        
        const map = document.getElementById('liveMap');
        const scale = newZoom / 100;
        map.style.transform = `scale(${scale})`;
        
        console.log(`🔍 Zoom level: ${newZoom}%`);
    }

    showModal(content) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100%;
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.innerHTML = content;
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        modalContainer.appendChild(modalContent);
        modalOverlay.appendChild(modalContainer);
        document.body.appendChild(modalOverlay);
        
        // Close modal on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
    }

    loadMockData() {
        // Generate mock ride data
        this.rides = [
            {
                id: 'K3T-20241216-000001',
                driver: 'K3D-000001 (Kofi Osei)',
                rider: 'K3P-000001 (Kwame Asante)',
                pickup: 'Accra Mall',
                dropoff: 'Kotoka Airport',
                status: 'active',
                startTime: '2024-12-16T10:30:00',
                duration: 0,
                fare: 45.50,
                distance: 12.5
            },
            {
                id: 'K3T-20241216-000002',
                driver: 'K3D-000002 (Ama Mensah)',
                rider: 'K3P-000002 (Yaa Boateng)',
                pickup: 'University of Ghana',
                dropoff: 'Tema Community 1',
                status: 'completed',
                startTime: '2024-12-16T09:15:00',
                duration: 25,
                fare: 32.00,
                distance: 8.2
            },
            {
                id: 'K3T-20241216-000003',
                driver: 'K3D-000003 (Kojo Thompson)',
                rider: 'K3P-000003 (Kofi Osei)',
                pickup: 'Kaneshie Market',
                dropoff: 'East Legon',
                status: 'active',
                startTime: '2024-12-16T11:45:00',
                duration: 0,
                fare: 28.75,
                distance: 9.8
            },
            {
                id: 'K3T-20241216-000004',
                driver: 'K3D-000004 (Yaa Nimo)',
                rider: 'K3P-000004 (Ama Serwaa)',
                pickup: 'Airport Roundabout',
                dropoff: 'Labone Beach',
                status: 'cancelled',
                startTime: '2024-12-16T08:30:00',
                duration: 15,
                fare: 0,
                distance: 5.2
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchRides');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRides(e.target.value);
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterRides(e.target.value);
            });
        }

        // Map controls
        const centerMap = document.getElementById('centerMap');
        if (centerMap) {
            centerMap.addEventListener('click', () => {
                this.showNotification('Map centered on active rides', 'info');
            });
        }

        const toggleHeatmap = document.getElementById('toggleHeatmap');
        if (toggleHeatmap) {
            toggleHeatmap.addEventListener('click', () => {
                this.showNotification('Heatmap view toggled', 'info');
            });
        }

        // Pause/Resume updates
        const pauseUpdates = document.getElementById('pauseUpdates');
        if (pauseUpdates) {
            pauseUpdates.addEventListener('click', () => {
                this.toggleUpdates();
            });
        }

        // Export data
        const exportData = document.getElementById('exportData');
        if (exportData) {
            exportData.addEventListener('click', () => {
                this.exportRideData();
            });
        }

        // Chart period
        const chartPeriod = document.getElementById('chartPeriod');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', (e) => {
                this.updateChart(e.target.value);
            });
        }
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updateRideData();
                this.updateStats();
                this.renderRidesTable();
            }
        }, 2000); // Update every 2 seconds
    }

    updateRideData() {
        const now = new Date();
        this.rides.forEach(ride => {
            if (ride.status === 'active') {
                // Update duration for active rides
                const startTime = new Date(ride.startTime);
                ride.duration = Math.floor((now - startTime) / 1000 / 60); // in minutes
            }
        });
    }

    updateStats() {
        const stats = {
            active: this.rides.filter(r => r.status === 'active').length,
            completed: this.rides.filter(r => r.status === 'completed').length,
            cancelled: this.rides.filter(r => r.status === 'cancelled').length,
            totalRevenue: this.rides
                .filter(r => r.status === 'completed')
                .reduce((sum, ride) => sum + ride.fare, 0),
            avgDuration: this.rides
                .filter(r => r.status === 'completed')
                .reduce((sum, ride) => sum + ride.duration, 0) / this.rides.filter(r => r.status === 'completed').length || 1
        };

        document.getElementById('activeRides').textContent = stats.active;
        document.getElementById('completedRides').textContent = stats.completed;
        document.getElementById('avgDuration').textContent = stats.avgDuration.toFixed(1);
        document.getElementById('totalRevenue').textContent = `₵${stats.totalRevenue.toFixed(2)}`;
    }

    filterRides(searchTerm = '') {
        const statusFilter = document.getElementById('statusFilter').value;
        
        this.rides.forEach(ride => {
            const row = document.querySelector(`[data-ride-id="${ride.id}"]`);
            if (row) {
                const matchesSearch = !searchTerm || 
                    ride.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ride.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ride.rider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ride.dropoff.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
                
                row.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
            }
        });
    }

    renderRidesTable() {
        const tbody = document.getElementById('ridesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.rides.forEach(ride => {
            const row = document.createElement('tr');
            row.setAttribute('data-ride-id', ride.id);
            row.innerHTML = `
                <td>${ride.id}</td>
                <td>${ride.rider}</td>
                <td>${ride.driver}</td>
                <td>${ride.pickup}</td>
                <td>${ride.dropoff}</td>
                <td>
                    <span class="ride-status ${ride.status}">${ride.status}</span>
                </td>
                <td>${ride.duration} min</td>
                <td>₵${ride.fare.toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="rideMonitoring.viewRideDetails('${ride.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${ride.status === 'active' ? `
                            <button class="btn-action btn-warning" onclick="rideMonitoring.cancelRide('${ride.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    initializeChart() {
        const ctx = document.getElementById('rideChart');
        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Rides Over Time',
                        data: [],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Rides'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        }
                    }
                }
            });
        }
    }

    updateChart(period = 'hourly') {
        if (!this.chart) return;

        const now = new Date();
        let labels = [];
        let data = [];

        switch(period) {
            case 'hourly':
                labels = Array.from({length: 12}, (_, i) => {
                    const hour = (now.getHours() - 11 + i + 24) % 24;
                    return `${hour}:00`;
                });
                data = Array.from({length: 12}, () => Math.floor(Math.random() * 10) + 5);
                break;
            case 'daily':
                labels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
                data = [8, 15, 23, 18, 12, 8, 5];
                break;
            case 'weekly':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [45, 52, 48, 65, 72, 58, 43];
                break;
            case 'monthly':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [180, 220, 195, 245, 267, 198];
                break;
        }

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    viewRideDetails(rideId) {
        const ride = this.rides.find(r => r.id === rideId);
        if (ride) {
            this.showNotification(`Viewing details for ride ${rideId}`, 'info');
        }
    }

    cancelRide(rideId) {
        const ride = this.rides.find(r => r.id === rideId);
        if (ride) {
            ride.status = 'cancelled';
            this.showNotification(`Ride ${rideId} cancelled`, 'warning');
            this.renderRidesTable();
            this.updateStats();
        }
    }

    toggleUpdates() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseUpdates');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            pauseBtn.title = 'Resume Updates';
            this.showNotification('Updates paused', 'warning');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            pauseBtn.title = 'Pause Updates';
            this.showNotification('Updates resumed', 'success');
        }
    }

    exportRideData() {
        const csvContent = [
            ['Ride ID', 'Rider', 'Driver', 'Pickup', 'Dropoff', 'Status', 'Duration', 'Fare'],
            ...this.rides.map(ride => [
                ride.id,
                ride.driver,
                ride.rider,
                ride.pickup,
                ride.dropoff,
                ride.status,
                ride.duration,
                ride.fare
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `k3k3-rides-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Ride data exported successfully', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'k3k3-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the system
const rideMonitoring = new RideMonitoring();
