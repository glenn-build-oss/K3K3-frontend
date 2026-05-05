// K3K3 Ride History Page - Professional JavaScript

// Global Variables
let rides = [];
let filteredRides = [];
let currentView = 'list';

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await loadRideHistory();
    setupEventListeners();
});

function initializeRideHistoryPage() {
    console.log(' Initializing Ride History Page...');
    
    // Load rides data
    loadRidesData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize stats
    updateStats();
    
    // Render rides
    renderRides();
    
    console.log(' Ride History Page Ready');
}

// Toggle Main Menu
function toggleMainMenu() {
    const menu = document.getElementById('mainDropdownMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    const isMenuOpen = menu.classList.contains('active');
    
    if (!isMenuOpen) {
        menu.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        closeMainMenu();
    }
}

// Close Main Menu
function closeMainMenu() {
    const menu = document.getElementById('mainDropdownMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    menu.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
}

// Navigation Functions
function goToDashboard() {
    closeMainMenu();
    window.location.href = 'dashboard.html';
}

function goToCancellations() {
    closeMainMenu();
    window.location.href = 'cancellations.html';
}

function goToRideStatus() {
    closeMainMenu();
    window.location.href = 'ride-status.html';
}

function goToRideHistory() {
    closeMainMenu();
    // Already on ride history page
}

function goToProfile() {
    closeMainMenu();
    window.location.href = 'profile.html';
}

function handleLogout() {
    closeMainMenu();
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '../index.html';
    }
}

// Placeholder functions for menu items
function showPaymentMethods() {
    closeMainMenu();
    alert('Payment Methods - Feature coming soon!');
}

function showNotifications() {
    closeMainMenu();
    alert('Notifications - Feature coming soon!');
}

function showSupport() {
    closeMainMenu();
    alert('Support - Feature coming soon!');
}

function showSettings() {
    closeMainMenu();
    alert('Settings - Feature coming soon!');
}

// Load Ride History from REAL Database
async function loadRideHistory() {
    let rides = [];
    try {
        console.log('🔄 Loading ride history from database...');
        
        // First check if backend is healthy
        const healthResponse = await fetch('http://localhost:8810/api/v1/health');
        if (!healthResponse.ok) {
            throw new Error('Backend is not responding');
        }
        
        // Get current passenger from localStorage
        const passengerUser = JSON.parse(localStorage.getItem('passenger_user') || '{}');
        if (!passengerUser.id) {
            console.warn('⚠️ No passenger user found - please login again');
            rides = [];
            filteredRides = [...rides];
            return;
        }

        // Load real trips from database
        const response = await fetch('http://localhost:8810/api/v1/trips/');
        if (response.ok) {
            const allTrips = await response.json();
            
            // Filter trips for this passenger
            rides = allTrips.filter(trip => trip.passenger_id === passengerUser.id);
            
            // Transform trip data to ride history format
            rides = await Promise.all(rides.map(async (trip) => {
                // Get rider information
                let driverName = 'Unknown Driver';
                let driverPhone = '+233 XXX XXXX';
                let driverRating = 4.5;
                
                if (trip.rider_id) {
                    try {
                        const ridersResponse = await fetch('http://localhost:8810/api/v1/riders/');
                        if (ridersResponse.ok) {
                            const riders = await ridersResponse.json();
                            const rider = riders.find(r => r.id === trip.rider_id);
                            
                            if (rider) {
                                // Get user info for driver name
                                const usersResponse = await fetch('http://localhost:8810/api/v1/users/');
                                if (usersResponse.ok) {
                                    const users = await usersResponse.json();
                                    const user = users.find(u => u.id === rider.user_id);
                                    if (user) {
                                        driverName = user.name;
                                        driverPhone = user.phone || '+233 XXX XXXX';
                                    }
                                }
                                driverRating = parseFloat(rider.rating) || 4.5;
                            }
                        }
                    } catch (error) {
                        console.error('Error loading rider info:', error);
                    }
                }
                
                // Calculate duration and distance (simplified)
                const duration = trip.completed_at && trip.started_at ? 
                    Math.round((new Date(trip.completed_at) - new Date(trip.started_at)) / 60000) : 15;
                const distance = trip.pickup_lat && trip.pickup_lng && trip.dest_lat && trip.dest_lng ?
                    calculateDistance(trip.pickup_lat, trip.pickup_lng, trip.dest_lat, trip.dest_lng).toFixed(1) : '3.2';
                
                return {
                    id: `K3R-${trip.id}`,
                    pickup: await getAddressFromCoords(trip.pickup_lat, trip.pickup_lng),
                    destination: await getAddressFromCoords(trip.dest_lat, trip.dest_lng),
                    date: trip.created_at,
                    status: trip.status,
                    driverName: driverName,
                    driverPhone: driverPhone,
                    driverRating: driverRating,
                    seats: 1, // Default for K3K3
                    fare: trip.actual_fare || trip.fare_estimate || 0,
                    paymentMethod: 'Mobile Money', // Default
                    duration: `${duration} mins`,
                    distance: `${distance} km`,
                    requested_at: trip.requested_at,
                    accepted_at: trip.accepted_at,
                    started_at: trip.started_at,
                    completed_at: trip.completed_at,
                    cancelled_at: trip.cancelled_at
                };
            }));
            
            // Sort by date (newest first)
            rides.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Save to localStorage for offline access
            localStorage.setItem('k3k3_ride_history', JSON.stringify(rides));
            
            console.log(`✅ Loaded ${rides.length} real rides from database`);
        } else {
            throw new Error(`HTTP ${response.status}: Failed to load rides`);
        }
        
        filteredRides = [...rides];
        
    } catch (error) {
        console.error('❌ Error loading ride history:', error.message);
        console.warn('⚠️ Backend connection failed - showing empty state');
        rides = [];
        filteredRides = [...rides];
        
        // Show user-friendly error message
        if (error.message.includes('Backend is not responding')) {
            alert('Unable to connect to K3K3 server. Please check your internet connection and try again.');
        } else if (error.message.includes('Failed to load rides')) {
            alert('Unable to load ride history. Please try again later.');
        }
    }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
}

// Get address from coordinates using geocoding API
async function getAddressFromCoords(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
        if (response.ok) {
            const data = await response.json();
            return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        }
    } catch (error) {
        console.error('Error getting address:', error);
    }
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

// Generate Sample Rides
function generateSampleRides() {
    const now = new Date();
    const sampleRides = [
        // Today's rides
        {
            id: 'K3R-2024032901',
            pickup: 'HTU Main Campus, Ho',
            destination: 'Ho Central Market, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString(),
            status: 'completed',
            driverName: 'Kwame Asante',
            driverPhone: '+233 24 123 4567',
            driverRating: 4.8,
            seats: 2,
            fare: 15.50,
            paymentMethod: 'Mobile Money',
            duration: '15 mins',
            distance: '3.2 km'
        },
        {
            id: 'K3R-2024032902',
            pickup: 'Sokode Hostel, Ho',
            destination: 'Cedi Auditorium, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15).toISOString(),
            status: 'completed',
            driverName: 'Ama Mensah',
            driverPhone: '+233 20 234 5678',
            driverRating: 4.9,
            seats: 1,
            fare: 12.00,
            paymentMethod: 'Credit Card',
            duration: '12 mins',
            distance: '2.8 km'
        },
        // Yesterday's rides
        {
            id: 'K3R-2024032801',
            pickup: 'Mirage, Ho',
            destination: 'Trafalgar, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 45).toISOString(),
            status: 'completed',
            driverName: 'Kofi Osei',
            driverPhone: '+233 27 345 6789',
            driverRating: 4.7,
            seats: 3,
            fare: 18.75,
            paymentMethod: 'Mobile Money',
            duration: '18 mins',
            distance: '4.1 km'
        },
        {
            id: 'K3R-2024032802',
            pickup: 'Dave Cafe, Ho',
            destination: 'Godokpe, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 30).toISOString(),
            status: 'cancelled',
            driverName: null,
            driverPhone: null,
            driverRating: null,
            seats: 1,
            fare: 0,
            paymentMethod: null,
            duration: null,
            distance: '2.5 km',
            cancellationReason: 'User cancelled'
        },
        // This week
        {
            id: 'K3R-2024032501',
            pickup: 'Ho Central Market, Ho',
            destination: 'HTU Main Campus, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 16, 20).toISOString(),
            status: 'completed',
            driverName: 'Yaa Boateng',
            driverPhone: '+233 23 456 7890',
            driverRating: 4.6,
            seats: 2,
            fare: 14.00,
            paymentMethod: 'Cash',
            duration: '14 mins',
            distance: '3.2 km'
        },
        {
            id: 'K3R-2024032401',
            pickup: 'Trafalgar, Ho',
            destination: 'Mirage, Ho',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 22, 45).toISOString(),
            status: 'no-show',
            driverName: 'Kojo Annan',
            driverPhone: '+233 26 567 8901',
            driverRating: 4.5,
            seats: 1,
            fare: 8.50,
            paymentMethod: null,
            duration: null,
            distance: '2.1 km',
            noShowReason: 'Driver waited 10 minutes, no passenger'
        },
        // Last month
        {
            id: 'K3R-2024021501',
            pickup: 'Accra Mall, Accra',
            destination: 'Kotoka Airport, Accra',
            date: new Date(now.getFullYear(), now.getMonth() - 1, 15, 22, 45).toISOString(),
            status: 'completed',
            driverName: 'Samuel Addo',
            driverPhone: '+233 24 678 9012',
            driverRating: 4.9,
            seats: 2,
            fare: 45.00,
            paymentMethod: 'Credit Card',
            duration: '35 mins',
            distance: '12.5 km'
        },
        // More variety for testing
        {
            id: 'K3R-2024032001',
            pickup: 'Kumasi Central, Kumasi',
            destination: 'KNUST Campus, Kumasi',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 8, 0).toISOString(),
            status: 'completed',
            driverName: 'Michael Owusu',
            driverPhone: '+233 27 789 0123',
            driverRating: 4.8,
            seats: 3,
            fare: 25.00,
            paymentMethod: 'Mobile Money',
            duration: '25 mins',
            distance: '8.7 km'
        },
        {
            id: 'K3R-2024031001',
            pickup: 'Tamale Market, Tamale',
            destination: 'Tamale Airport, Tamale',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 19, 13, 15).toISOString(),
            status: 'completed',
            driverName: 'Abdul Karim',
            driverPhone: '+233 20 890 1234',
            driverRating: 4.7,
            seats: 1,
            fare: 18.00,
            paymentMethod: 'Cash',
            duration: '20 mins',
            distance: '6.3 km'
        },
        {
            id: 'K3R-2024030501',
            pickup: 'Cape Coast Castle, Cape Coast',
            destination: 'University of Cape Coast, Cape Coast',
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 24, 9, 30).toISOString(),
            status: 'completed',
            driverName: 'Grace Mensah',
            driverPhone: '+233 23 901 2345',
            driverRating: 4.9,
            seats: 2,
            fare: 12.50,
            paymentMethod: 'Mobile Money',
            duration: '15 mins',
            distance: '4.8 km'
        }
    ];
    
    return sampleRides;
}

// Setup Event Listeners
function setupEventListeners() {
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMainMenu();
            closeRideModal();
            closeReceiptModal();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('mainDropdownMenu');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMainMenu();
        }
    });
    
    // Handle modal backdrop clicks
    document.getElementById('rideModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRideModal();
        }
    });
    
    document.getElementById('receiptModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeReceiptModal();
        }
    });
    
    // Setup filter event listeners with real-time feedback
    const dateFilter = document.getElementById('dateFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchFilter = document.getElementById('searchFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            console.log('📅 Date filter changed to:', this.value);
            applyFilters();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('📝 Status filter changed to:', this.value);
            applyFilters();
        });
    }
    
    if (searchFilter) {
        // Add debounced search for better performance
        let searchTimeout;
        searchFilter.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                console.log('🔍 Search filter changed to:', this.value);
                applyFilters();
            }, 300);
        });
    }
    
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            console.log('🔄 Sort changed to:', this.value);
            applyFilters();
        });
    }
    
    console.log('✅ Event listeners setup complete');
}

// Update Statistics
function updateStats() {
    const totalRides = rides.length;
    const completedRides = rides.filter(r => r.status === 'completed').length;
    const totalSpent = rides
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.fare, 0);
    const thisMonthRides = rides.filter(r => {
        const rideDate = new Date(r.date);
        const now = new Date();
        return rideDate.getMonth() === now.getMonth() && 
               rideDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Animate counter updates
    animateCounter('totalRides', totalRides);
    animateCounter('completedRides', completedRides);
    animateCounter('thisMonthRides', thisMonthRides);
    
    // Update total spent with currency
    const totalSpentElement = document.getElementById('totalSpent');
    if (totalSpentElement) {
        animateCounter('totalSpent', totalSpent, true);
    }
}

// Animate Counter
function animateCounter(elementId, targetNumber, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 1000;
    const steps = 50;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = targetNumber / steps;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            element.textContent = `₵${current.toFixed(2)}`;
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepDuration);
}

// Render Rides
function renderRides() {
    const container = document.getElementById('ridesContent');
    const emptyState = document.getElementById('emptyState');
    
    // Hide loading state
    const loadingState = container.querySelector('.loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (filteredRides.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Set view class
    container.className = currentView === 'cards' ? 'rides-content cards-view' : 'rides-content';
    
    // Render rides
    container.innerHTML = filteredRides.map(ride => createRideItem(ride)).join('');
    
    // Add fade-in animation
    container.querySelectorAll('.ride-item').forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}

// Create Ride Item HTML
function createRideItem(ride) {
    const rideDate = new Date(ride.date);
    const formattedDate = rideDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const formattedTime = rideDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="ride-item ${ride.status}" onclick="showRideDetails('${ride.id}')">
            <div class="ride-header">
                <div class="ride-info">
                    <div class="ride-id">${ride.id}</div>
                    <div class="ride-route">
                        <div class="route-point">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${ride.pickup}</span>
                        </div>
                        <i class="fas fa-arrow-right"></i>
                        <div class="route-point">
                            <i class="fas fa-flag-checkered"></i>
                            <span>${ride.destination}</span>
                        </div>
                    </div>
                </div>
                <div class="ride-status ${ride.status}">
                    ${getStatusText(ride.status)}
                </div>
            </div>
            
            <div class="ride-details">
                <div class="detail-item">
                    <span class="detail-label">Date & Time</span>
                    <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                ${ride.driverName ? `
                <div class="detail-item">
                    <span class="detail-label">Driver</span>
                    <span class="detail-value">${ride.driverName}</span>
                </div>
                ` : ''}
                ${ride.fare > 0 ? `
                <div class="detail-item">
                    <span class="detail-label">Fare</span>
                    <span class="detail-value">₵${ride.fare.toFixed(2)}</span>
                </div>
                ` : ''}
                ${ride.paymentMethod ? `
                <div class="detail-item">
                    <span class="detail-label">Payment</span>
                    <span class="detail-value">${ride.paymentMethod}</span>
                </div>
                ` : ''}
                ${ride.duration ? `
                <div class="detail-item">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${ride.duration}</span>
                </div>
                ` : ''}
                ${ride.distance ? `
                <div class="detail-item">
                    <span class="detail-label">Distance</span>
                    <span class="detail-value">${ride.distance}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Get Status Text
function getStatusText(status) {
    const statusTexts = {
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'no-show': 'No Show'
    };
    return statusTexts[status] || status;
}

// Apply Filters
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    
    console.log('🔄 Applying filters:', { dateFilter, statusFilter, searchFilter, sortBy });
    
    filteredRides = rides.filter(ride => {
        // Date filter
        if (dateFilter !== 'all') {
            const rideDate = new Date(ride.date);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (rideDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (rideDate < weekAgo) return false;
                    break;
                case 'month':
                    if (rideDate.getMonth() !== now.getMonth() || 
                        rideDate.getFullYear() !== now.getFullYear()) return false;
                    break;
                case 'quarter':
                    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    if (rideDate < quarterAgo) return false;
                    break;
                case 'year':
                    if (rideDate.getFullYear() !== now.getFullYear()) return false;
                    break;
            }
        }
        
        // Status filter
        if (statusFilter !== 'all' && ride.status !== statusFilter) {
            return false;
        }
        
        // Search filter
        if (searchFilter) {
            const searchText = `${ride.pickup} ${ride.destination} ${ride.id} ${ride.driverName || ''}`.toLowerCase();
            if (!searchText.includes(searchFilter)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Apply sorting
    filteredRides.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'fare-desc':
                return (b.fare || 0) - (a.fare || 0);
            case 'fare-asc':
                return (a.fare || 0) - (b.fare || 0);
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    console.log(`📊 Filtered results: ${filteredRides.length} out of ${rides.length}`);
    
    // Show feedback about active filters
    const activeFilters = [];
    if (dateFilter !== 'all') activeFilters.push(getDateFilterLabel(dateFilter));
    if (statusFilter !== 'all') activeFilters.push(getStatusFilterLabel(statusFilter));
    if (searchFilter) activeFilters.push(`Search: "${searchFilter}"`);
    
    if (activeFilters.length > 0) {
        showFilterFeedback(`Active filters: ${activeFilters.join(', ')}`);
    }
    
    renderRides();
}

// Get date filter label
function getDateFilterLabel(value) {
    const labels = {
        'today': 'Today',
        'week': 'This Week',
        'month': 'This Month',
        'quarter': 'Last 3 Months',
        'year': 'This Year'
    };
    return labels[value] || value;
}

// Get status filter label
function getStatusFilterLabel(value) {
    const labels = {
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'no-show': 'No Show'
    };
    return labels[value] || value;
}

// Clear All Filters
function clearAllFilters() {
    console.log('🧹 Clearing all filters');
    
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('searchFilter').value = '';
    document.getElementById('sortBy').value = 'date-desc';
    
    // Remove any active filter styling
    document.querySelectorAll('.filter-active').forEach(el => {
        el.classList.remove('filter-active');
    });
    
    filteredRides = [...rides];
    renderRides();
    
    // Show feedback
    showFilterFeedback('All filters cleared');
}

// Show filter feedback
function showFilterFeedback(message) {
    // Create or update feedback element
    let feedback = document.getElementById('filterFeedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'filterFeedback';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--k3k3-secondary);
            color: var(--k3k3-primary);
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.transform = 'translateX(0)';
    
    // Hide after 3 seconds
    setTimeout(() => {
        feedback.style.transform = 'translateX(100%)';
    }, 3000);
}

// Set View
function setView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.closest('.view-btn').classList.add('active');
    
    renderRides();
}

// Show Ride Details
function showRideDetails(rideId) {
    const ride = rides.find(r => r.id === rideId);
    if (!ride) return;
    
    const modal = document.getElementById('rideModal');
    const modalBody = document.getElementById('rideModalBody');
    
    const rideDate = new Date(ride.date);
    const formattedDate = rideDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = rideDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    modalBody.innerHTML = `
        <div class="ride-detail-summary">
            <div class="ride-route-summary">
                <div class="route-point-summary">
                    <div class="point-icon pickup">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="point-details">
                        <label>Pickup Location</label>
                        <span>${ride.pickup}</span>
                    </div>
                </div>
                
                <div class="route-line"></div>
                
                <div class="route-point-summary">
                    <div class="point-icon destination">
                        <i class="fas fa-flag-checkered"></i>
                    </div>
                    <div class="point-details">
                        <label>Destination</label>
                        <span>${ride.destination}</span>
                    </div>
                </div>
            </div>
            
            <div class="ride-info-summary">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Ride ID</span>
                        <span class="info-value">${ride.id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date & Time</span>
                        <span class="info-value">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value ride-status ${ride.status}">${getStatusText(ride.status)}</span>
                    </div>
                    ${ride.driverName ? `
                    <div class="info-item">
                        <span class="info-label">Driver Name</span>
                        <span class="info-value">${ride.driverName}</span>
                    </div>
                    ` : ''}
                    ${ride.driverPhone ? `
                    <div class="info-item">
                        <span class="info-label">Driver Phone</span>
                        <span class="info-value">${ride.driverPhone}</span>
                    </div>
                    ` : ''}
                    ${ride.driverRating ? `
                    <div class="info-item">
                        <span class="info-label">Driver Rating</span>
                        <span class="info-value">⭐ ${ride.driverRating}</span>
                    </div>
                    ` : ''}
                    ${ride.fare > 0 ? `
                    <div class="info-item">
                        <span class="info-label">Total Fare</span>
                        <span class="info-value">₵${ride.fare.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    ${ride.paymentMethod ? `
                    <div class="info-item">
                        <span class="info-label">Payment Method</span>
                        <span class="info-value">${ride.paymentMethod}</span>
                    </div>
                    ` : ''}
                    ${ride.duration ? `
                    <div class="info-item">
                        <span class="info-label">Duration</span>
                        <span class="info-value">${ride.duration}</span>
                    </div>
                    ` : ''}
                    ${ride.distance ? `
                    <div class="info-item">
                        <span class="info-label">Distance</span>
                        <span class="info-value">${ride.distance}</span>
                    </div>
                    ` : ''}
                    ${ride.seats ? `
                    <div class="info-item">
                        <span class="info-label">Number of Seats</span>
                        <span class="info-value">${ride.seats}</span>
                    </div>
                    ` : ''}
                    ${ride.cancellationReason ? `
                    <div class="info-item">
                        <span class="info-label">Cancellation Reason</span>
                        <span class="info-value">${ride.cancellationReason}</span>
                    </div>
                    ` : ''}
                    ${ride.noShowReason ? `
                    <div class="info-item">
                        <span class="info-label">No Show Reason</span>
                        <span class="info-value">${ride.noShowReason}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close Ride Modal
function closeRideModal() {
    const modal = document.getElementById('rideModal');
    modal.classList.remove('active');
}

// Rebook Ride
function rebookRide() {
    closeRideModal();
    // Navigate back to dashboard to book a new ride
    window.location.href = 'dashboard.html';
}

// Show Receipt Modal
function showReceiptModal(rideId) {
    const modal = document.getElementById('receiptModal');
    modal.classList.add('active');
}

// Close Receipt Modal
function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    modal.classList.remove('active');
}

// Download Receipt
function downloadReceipt() {
    const email = document.getElementById('receiptEmail').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    // Simulate receipt download
    console.log('📧 Downloading receipt:', { email, format });
    
    // Show success message
    showFilterFeedback(`Receipt sent to ${email} in ${format.toUpperCase()} format`);
    
    closeReceiptModal();
    
    // Clear email field
    document.getElementById('receiptEmail').value = '';
}
