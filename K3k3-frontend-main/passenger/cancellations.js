// K3K3 Ride Cancellations Page - Professional JavaScript

// Global Variables
let cancellations = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await loadCancellationsData();
    setupEventListeners();
});

function initializeCancellationsPage() {
    console.log('🚀 Initializing Ride Cancellations Page...');
    
    // Load cancellations data
    loadCancellationsData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize stats
    updateStats();
    
    // Render cancellations
    renderCancellations();
    
    console.log('✅ Ride Cancellations Page Ready');
}

// Toggle Main Menu
function toggleMainMenu() {
    const menu = document.getElementById('mainDropdownMenu');
    const hamburger = document.querySelector('.hamburger-menu');
    
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
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
    isMenuOpen = false;
}

// Navigation Functions
function goToDashboard() {
    closeMainMenu();
    window.location.href = 'dashboard.html';
}

function goToCancellations() {
    closeMainMenu();
    // Already on cancellations page
}

function goToRideStatus() {
    closeMainMenu();
    window.location.href = 'dashboard.html#ride-status';
}

function goToRideHistory() {
    closeMainMenu();
    window.location.href = 'dashboard.html#ride-history';
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

// Load Cancellations Data from REAL Database
async function loadCancellationsData() {
    try {
        console.log('🔄 Loading cancellations from database...');
        
        // Get current passenger from localStorage
        const passengerUser = JSON.parse(localStorage.getItem('passenger_user') || '{}');
        if (!passengerUser.id) {
            console.warn('⚠️ No passenger user found, using fallback data');
            cancellations = generateSampleCancellations();
            filteredCancellations = [...cancellations];
            return;
        }

        // Load real trips from database
        const response = await fetch('http://localhost:8810/api/v1/trips/');
        if (response.ok) {
            const allTrips = await response.json();
            
            // Filter cancelled trips for this passenger
            const cancelledTrips = allTrips.filter(trip => 
                trip.passenger_id === passengerUser.id && 
                trip.status === 'cancelled'
            );
            
            // Transform trip data to cancellations format
            cancellations = await Promise.all(cancelledTrips.map(async (trip) => {
                // Get rider information if available
                let driverName = null;
                let driverPhone = null;
                
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
                                        driverPhone = user.phone;
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error loading rider info:', error);
                    }
                }
                
                // Determine who cancelled (simplified logic)
                const cancelledBy = trip.cancelled_at ? 
                    (driverName ? 'driver' : 'user') : 'user';
                
                // Generate cancellation reason based on timing
                let reasonText = 'Ride cancelled';
                if (cancelledBy === 'user') {
                    reasonText = 'Changed plans - no longer needed the ride';
                } else if (cancelledBy === 'driver') {
                    reasonText = 'Driver emergency - unable to complete ride';
                }
                
                return {
                    id: `K3R-${trip.id}`,
                    pickup: await getAddressFromCoords(trip.pickup_lat, trip.pickup_lng),
                    destination: await getAddressFromCoords(trip.dest_lat, trip.dest_lng),
                    cancelledAt: trip.cancelled_at || trip.created_at,
                    cancelledBy: cancelledBy,
                    reason: cancelledBy === 'user' ? 'user-cancelled' : 'driver-cancelled',
                    reasonText: reasonText,
                    seats: 1, // Default for K3K3
                    estimatedFare: trip.fare_estimate || 0,
                    driverName: driverName,
                    driverPhone: driverPhone,
                    status: 'cancelled',
                    requested_at: trip.requested_at,
                    accepted_at: trip.accepted_at
                };
            }));
            
            // Sort by date (newest first)
            cancellations.sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt));
            
            // Save to localStorage for offline access
            localStorage.setItem('k3k3_cancellations', JSON.stringify(cancellations));
            
            console.log(`✅ Loaded ${cancellations.length} real cancellations from database`);
        } else {
            console.warn('⚠️ Failed to load cancellations from database, using fallback');
            cancellations = generateSampleCancellations();
        }
        
        filteredCancellations = [...cancellations];
        
    } catch (error) {
        console.error('❌ Error loading cancellations data:', error);
        cancellations = generateSampleCancellations();
        filteredCancellations = [...cancellations];
    }
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

// Generate Sample Cancellations
function generateSampleCancellations() {
    const now = new Date();
    const sampleCancellations = [
        // Today's cancellations
        {
            id: 'K3R-2024032901',
            pickup: 'HTU Main Campus, Ho',
            destination: 'Ho Central Market, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString(),
            cancelledBy: 'user',
            reason: 'user-cancelled',
            reasonText: 'Changed plans - no longer needed the ride',
            seats: 2,
            estimatedFare: 15.50,
            driverName: null,
            driverPhone: null,
            status: 'cancelled'
        },
        {
            id: 'K3R-2024032902',
            pickup: 'Sokode Hostel, Ho',
            destination: 'Cedi Auditorium, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15).toISOString(),
            cancelledBy: 'driver',
            reason: 'driver-cancelled',
            reasonText: 'Driver emergency - unable to complete ride',
            seats: 1,
            estimatedFare: 12.00,
            driverName: 'Kwame Asante',
            driverPhone: '+233 24 123 4567',
            status: 'cancelled'
        },
        // Yesterday's cancellation
        {
            id: 'K3R-2024032801',
            pickup: 'Mirage, Ho',
            destination: 'Trafalgar, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 45).toISOString(),
            cancelledBy: 'system',
            reason: 'no-driver',
            reasonText: 'No drivers available in your area',
            seats: 3,
            estimatedFare: 18.75,
            driverName: null,
            driverPhone: null,
            status: 'cancelled'
        },
        // This week
        {
            id: 'K3R-2024032501',
            pickup: 'Dave Cafe, Ho',
            destination: 'Godokpe, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 12, 30).toISOString(),
            cancelledBy: 'user',
            reason: 'payment-issue',
            reasonText: 'Payment method declined - please update payment info',
            seats: 1,
            estimatedFare: 10.25,
            driverName: null,
            driverPhone: null,
            status: 'cancelled'
        },
        {
            id: 'K3R-2024032401',
            pickup: 'Ho Central Market, Ho',
            destination: 'HTU Main Campus, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 16, 20).toISOString(),
            cancelledBy: 'driver',
            reason: 'weather',
            reasonText: 'Severe weather conditions - ride unsafe',
            seats: 2,
            estimatedFare: 14.00,
            driverName: 'Ama Mensah',
            driverPhone: '+233 20 234 5678',
            status: 'cancelled'
        },
        // Last month
        {
            id: 'K3R-2024021501',
            pickup: 'Trafalgar, Ho',
            destination: 'Mirage, Ho',
            cancelledAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 22, 45).toISOString(),
            cancelledBy: 'user',
            reason: 'emergency',
            reasonText: 'Personal emergency - had to cancel immediately',
            seats: 1,
            estimatedFare: 8.50,
            driverName: null,
            driverPhone: null,
            status: 'cancelled'
        },
        // More variety for testing
        {
            id: 'K3R-2024032001',
            pickup: 'Accra Mall, Accra',
            destination: 'Kotoka Airport, Accra',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9, 8, 0).toISOString(),
            cancelledBy: 'driver',
            reason: 'driver-cancelled',
            reasonText: 'Vehicle breakdown',
            seats: 2,
            estimatedFare: 45.00,
            driverName: 'Kofi Osei',
            driverPhone: '+233 27 345 6789',
            status: 'cancelled'
        },
        {
            id: 'K3R-2024031001',
            pickup: 'Kumasi Central, Kumasi',
            destination: 'KNUST Campus, Kumasi',
            cancelledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 19, 13, 15).toISOString(),
            cancelledBy: 'system',
            reason: 'no-driver',
            reasonText: 'High demand - no drivers available',
            seats: 3,
            estimatedFare: 25.00,
            driverName: null,
            driverPhone: null,
            status: 'cancelled'
        }
    ];
    
    return sampleCancellations;
}

// Setup Event Listeners
function setupEventListeners() {
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMainMenu();
            closeCancellationModal();
            closeRebookModal();
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
    document.getElementById('cancellationModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeCancellationModal();
        }
    });
    
    document.getElementById('rebookModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRebookModal();
        }
    });
    
    // Setup filter event listeners with real-time feedback
    const dateFilter = document.getElementById('dateFilter');
    const reasonFilter = document.getElementById('reasonFilter');
    const searchFilter = document.getElementById('searchFilter');
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            console.log('📅 Date filter changed to:', this.value);
            applyFilters();
        });
    }
    
    if (reasonFilter) {
        reasonFilter.addEventListener('change', function() {
            console.log('📝 Reason filter changed to:', this.value);
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
    
    console.log('✅ Event listeners setup complete');
}

// Update Statistics
function updateStats() {
    const totalCancelled = cancellations.length;
    const cancelledByUser = cancellations.filter(c => c.cancelledBy === 'user').length;
    const cancelledByDriver = cancellations.filter(c => c.cancelledBy === 'driver').length;
    const thisMonth = cancellations.filter(c => {
        const cancelDate = new Date(c.cancelledAt);
        const now = new Date();
        return cancelDate.getMonth() === now.getMonth() && 
               cancelDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Update DOM with animation
    animateNumber('totalCancelled', totalCancelled);
    animateNumber('cancelledByUser', cancelledByUser);
    animateNumber('cancelledByDriver', cancelledByDriver);
    animateNumber('thisMonth', thisMonth);
}

// Animate Numbers
function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const start = 0;
    const increment = targetNumber / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Render Cancellations
function renderCancellations() {
    const container = document.getElementById('cancellationsContent');
    const emptyState = document.getElementById('emptyState');
    
    // Hide loading state
    const loadingState = container.querySelector('.loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (filteredCancellations.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Set view class
    container.className = currentView === 'cards' ? 'cancellations-content cards-view' : 'cancellations-content';
    
    // Render cancellations
    container.innerHTML = filteredCancellations.map(cancellation => createCancellationItem(cancellation)).join('');
    
    // Add fade-in animation
    container.querySelectorAll('.cancellation-item').forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}

// Create Cancellation Item HTML
function createCancellationItem(cancellation) {
    const cancelledDate = new Date(cancellation.cancelledAt);
    const formattedDate = cancelledDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = cancelledDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const badgeClass = getBadgeClass(cancellation.reason);
    const badgeText = getBadgeText(cancellation.reason);
    
    return `
        <div class="cancellation-item ${cancellation.reason}" onclick="showCancellationDetails('${cancellation.id}')">
            <div class="cancellation-header">
                <div class="ride-info">
                    <div class="ride-id">Ride ID: ${cancellation.id}</div>
                    <div class="ride-route">
                        <div class="route-point">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${cancellation.pickup}</span>
                        </div>
                        <i class="fas fa-arrow-right"></i>
                        <div class="route-point">
                            <i class="fas fa-flag-checkered"></i>
                            <span>${cancellation.destination}</span>
                        </div>
                    </div>
                </div>
                <div class="cancellation-badge ${badgeClass}">${badgeText}</div>
            </div>
            
            <div class="cancellation-details">
                <div class="detail-item">
                    <span class="detail-label">Cancelled</span>
                    <span class="detail-value">${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Reason</span>
                    <span class="detail-value">${cancellation.reasonText}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Seats</span>
                    <span class="detail-value">${cancellation.seats}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Est. Fare</span>
                    <span class="detail-value">₵${cancellation.estimatedFare.toFixed(2)}</span>
                </div>
                ${cancellation.driverName ? `
                <div class="detail-item">
                    <span class="detail-label">Driver</span>
                    <span class="detail-value">${cancellation.driverName}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Get Badge Class
function getBadgeClass(reason) {
    const badgeClasses = {
        'user-cancelled': 'user-cancelled',
        'driver-cancelled': 'driver-cancelled',
        'no-driver': 'no-driver',
        'payment-issue': 'no-driver',
        'weather': 'driver-cancelled',
        'emergency': 'user-cancelled'
    };
    return badgeClasses[reason] || 'user-cancelled';
}

// Get Badge Text
function getBadgeText(reason) {
    const badgeTexts = {
        'user-cancelled': 'Cancelled by You',
        'driver-cancelled': 'Cancelled by Driver',
        'no-driver': 'No Driver',
        'payment-issue': 'Payment Issue',
        'weather': 'Weather',
        'emergency': 'Emergency'
    };
    return badgeTexts[reason] || 'Cancelled';
}

// Show Cancellation Details
function showCancellationDetails(cancellationId) {
    const cancellation = cancellations.find(c => c.id === cancellationId);
    if (!cancellation) return;
    
    const modalBody = document.getElementById('modalBody');
    const cancelledDate = new Date(cancellation.cancelledAt);
    
    modalBody.innerHTML = `
        <div class="cancellation-details-expanded">
            <div class="detail-section">
                <h4>Ride Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Ride ID</span>
                        <span class="detail-value">${cancellation.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Pickup Location</span>
                        <span class="detail-value">${cancellation.pickup}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Destination</span>
                        <span class="detail-value">${cancellation.destination}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Number of Seats</span>
                        <span class="detail-value">${cancellation.seats}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estimated Fare</span>
                        <span class="detail-value">₵${cancellation.estimatedFare.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Cancellation Details</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Cancelled At</span>
                        <span class="detail-value">${cancelledDate.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cancelled By</span>
                        <span class="detail-value">${cancellation.cancelledBy === 'user' ? 'You' : (cancellation.cancelledBy === 'driver' ? 'Driver' : 'System')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Reason</span>
                        <span class="detail-value">${cancellation.reasonText}</span>
                    </div>
                    ${cancellation.driverName ? `
                    <div class="detail-item">
                        <span class="detail-label">Driver Name</span>
                        <span class="detail-value">${cancellation.driverName}</span>
                    </div>
                    ` : ''}
                    ${cancellation.driverPhone ? `
                    <div class="detail-item">
                        <span class="detail-label">Driver Phone</span>
                        <span class="detail-value">${cancellation.driverPhone}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('cancellationModal').classList.add('active');
}

// Close Cancellation Modal
function closeCancellationModal() {
    document.getElementById('cancellationModal').classList.remove('active');
}

// Set View
function setView(view) {
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Re-render cancellations
    renderCancellations();
}

// Apply Filters
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const reasonFilter = document.getElementById('reasonFilter').value;
    const searchFilter = document.getElementById('searchFilter').value.toLowerCase();
    
    console.log('🔄 Applying filters:', { dateFilter, reasonFilter, searchFilter });
    
    filteredCancellations = cancellations.filter(cancellation => {
        // Date filter
        if (dateFilter !== 'all') {
            const cancelDate = new Date(cancellation.cancelledAt);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (cancelDate.toDateString() !== now.toDateString()) return false;
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (cancelDate < weekAgo) return false;
                    break;
                case 'month':
                    if (cancelDate.getMonth() !== now.getMonth() || 
                        cancelDate.getFullYear() !== now.getFullYear()) return false;
                    break;
                case 'quarter':
                    const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    if (cancelDate < quarterAgo) return false;
                    break;
            }
        }
        
        // Reason filter
        if (reasonFilter !== 'all' && cancellation.reason !== reasonFilter) {
            return false;
        }
        
        // Search filter
        if (searchFilter) {
            const searchText = `${cancellation.pickup} ${cancellation.destination} ${cancellation.id} ${cancellation.driverName || ''}`.toLowerCase();
            if (!searchText.includes(searchFilter)) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`📊 Filtered results: ${filteredCancellations.length} out of ${cancellations.length}`);
    
    // Show feedback about active filters
    const activeFilters = [];
    if (dateFilter !== 'all') activeFilters.push(getDateFilterLabel(dateFilter));
    if (reasonFilter !== 'all') activeFilters.push(getReasonFilterLabel(reasonFilter));
    if (searchFilter) activeFilters.push(`Search: "${searchFilter}"`);
    
    if (activeFilters.length > 0) {
        showFilterFeedback(`Active filters: ${activeFilters.join(', ')}`);
    }
    
    renderCancellations();
}

// Get date filter label
function getDateFilterLabel(value) {
    const labels = {
        'today': 'Today',
        'week': 'This Week',
        'month': 'This Month',
        'quarter': 'Last 3 Months'
    };
    return labels[value] || value;
}

// Get reason filter label
function getReasonFilterLabel(value) {
    const labels = {
        'user-cancelled': 'Cancelled by You',
        'driver-cancelled': 'Cancelled by Driver',
        'no-driver': 'No Driver Available',
        'payment-issue': 'Payment Issue',
        'weather': 'Weather Conditions',
        'emergency': 'Emergency'
    };
    return labels[value] || value;
}

// Clear All Filters
function clearAllFilters() {
    console.log('🧹 Clearing all filters');
    
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('reasonFilter').value = 'all';
    document.getElementById('searchFilter').value = '';
    
    // Remove any active filter styling
    document.querySelectorAll('.filter-active').forEach(el => {
        el.classList.remove('filter-active');
    });
    
    filteredCancellations = [...cancellations];
    renderCancellations();
    
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

// Book New Ride
function bookNewRide() {
    closeCancellationModal();
    // Navigate back to dashboard to book a new ride
    window.location.href = 'dashboard.html';
}

// Rebook Ride
function rebookRide(cancellationId) {
    const cancellation = cancellations.find(c => c.id === cancellationId);
    if (!cancellation) return;
    
    // Set rebook modal data
    document.getElementById('rebookPickup').textContent = cancellation.pickup;
    document.getElementById('rebookDestination').textContent = cancellation.destination;
    
    // Reset seat selection
    selectedRebookSeats = cancellation.seats || 1;
    updateSeatSelection();
    
    // Show rebook modal
    document.getElementById('rebookModal').classList.add('active');
}

// Select Rebook Seats
function selectRebookSeats(seats) {
    selectedRebookSeats = seats;
    updateSeatSelection();
}

// Update Seat Selection
function updateSeatSelection() {
    document.querySelectorAll('.seat-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.seats) === selectedRebookSeats) {
            btn.classList.add('selected');
        }
    });
}

// Confirm Rebook
function confirmRebook() {
    // Get rebook data
    const pickup = document.getElementById('rebookPickup').textContent;
    const destination = document.getElementById('rebookDestination').textContent;
    
    // Save ride data to localStorage for dashboard
    const rideData = {
        pickup: pickup,
        destination: destination,
        seats: selectedRebookSeats,
        timestamp: Date.now()
    };
    
    localStorage.setItem('k3k3_rebook_data', JSON.stringify(rideData));
    
    // Close modal and navigate to dashboard
    closeRebookModal();
    window.location.href = 'dashboard.html';
}

// Close Rebook Modal
function closeRebookModal() {
    document.getElementById('rebookModal').classList.remove('active');
}

// Go Back to Dashboard
function goBackToDashboard() {
    window.location.href = 'dashboard.html';
}

// Go to Profile
function goToProfile() {
    window.location.href = 'profile.html';
}

// Save to Local Storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('k3k3_cancellations', JSON.stringify(cancellations));
    } catch (error) {
        console.error('Error saving cancellations to localStorage:', error);
    }
}

// Add New Cancellation (for testing/demo purposes)
function addCancellation(cancellationData) {
    const newCancellation = {
        id: `K3R-${Date.now()}`,
        cancelledAt: new Date().toISOString(),
        status: 'cancelled',
        ...cancellationData
    };
    
    cancellations.unshift(newCancellation);
    filteredCancellations = [...cancellations];
    
    saveToLocalStorage();
    updateStats();
    renderCancellations();
    
    console.log('✅ New cancellation added:', newCancellation);
}

// Export functions for global access
window.showCancellationDetails = showCancellationDetails;
window.closeCancellationModal = closeCancellationModal;
window.setView = setView;
window.applyFilters = applyFilters;
window.clearAllFilters = clearAllFilters;
window.bookNewRide = bookNewRide;
window.selectRebookSeats = selectRebookSeats;
window.confirmRebook = confirmRebook;
window.closeRebookModal = closeRebookModal;
window.goBackToDashboard = goBackToDashboard;
window.goToProfile = goToProfile;
window.addCancellation = addCancellation;
