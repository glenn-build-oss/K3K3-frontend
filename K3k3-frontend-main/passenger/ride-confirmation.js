// K3K3 Ride Confirmation Modal - Professional JavaScript

// Global Variables
let selectedPayment = 'mobile-money';
let appliedDiscount = 0;
let rideData = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', function() {
    initializeConfirmationPage();
});

function initializeConfirmationPage() {
    console.log('🚀 Initializing Ride Confirmation Page...');
    
    // Load ride data from URL parameters or localStorage
    loadRideData();
    
    // Populate ride details
    populateRideDetails();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Ride Confirmation Page Ready');
}

// Load Ride Data
function loadRideData() {
    try {
        // Try to get ride data from URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const rideFromUrl = {
            pickup: urlParams.get('pickup'),
            destination: urlParams.get('destination'),
            seats: urlParams.get('seats'),
            fare: urlParams.get('fare')
        };
        
        // If URL params exist, use them; otherwise use localStorage
        if (rideFromUrl.pickup && rideFromUrl.destination) {
            rideData = rideFromUrl;
        } else {
            // Try to get from localStorage
            const storedRide = localStorage.getItem('k3k3_pending_ride');
            if (storedRide) {
                rideData = JSON.parse(storedRide);
            } else {
                // Fallback to default data
                rideData = {
                    pickup: 'HTU Main Campus, Ho',
                    destination: 'Ho Central Market, Ho',
                    seats: 2,
                    fare: 15.50
                };
            }
        }
        
        console.log('📊 Loaded ride data:', rideData);
        
    } catch (error) {
        console.error('❌ Error loading ride data:', error);
        // Use default data
        rideData = {
            pickup: 'HTU Main Campus, Ho',
            destination: 'Ho Central Market, Ho',
            seats: 2,
            fare: 15.50
        };
    }
}

// Populate Ride Details
function populateRideDetails() {
    if (!rideData) return;
    
    // Update route information
    document.getElementById('confirmPickup').textContent = rideData.pickup || 'Not specified';
    document.getElementById('confirmDestination').textContent = rideData.destination || 'Not specified';
    document.getElementById('confirmSeats').textContent = rideData.seats || 1;
    
    // Calculate distance and time (simulated)
    const distance = Math.random() * 5 + 2; // 2-7 km
    const time = Math.round(distance * 4); // ~4 mins per km
    
    document.getElementById('confirmDistance').textContent = `${distance.toFixed(1)} km`;
    document.getElementById('confirmTime').textContent = `${time} mins`;
    
    // Update fare breakdown
    updateFareBreakdown(rideData.fare || 15.50);
    
    console.log('✅ Ride details populated');
}

// Update Fare Breakdown
function updateFareBreakdown(baseFare) {
    const baseAmount = 10.00;
    const distanceFare = baseFare - baseAmount;
    const totalFare = baseFare - appliedDiscount;
    
    document.getElementById('baseFare').textContent = `₵${baseAmount.toFixed(2)}`;
    document.getElementById('distanceFare').textContent = `₵${distanceFare.toFixed(2)}`;
    document.getElementById('confirmFare').textContent = `₵${baseFare.toFixed(2)}`;
    document.getElementById('totalFare').textContent = `₵${totalFare.toFixed(2)}`;
    
    // Show/hide discount row
    if (appliedDiscount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discountAmount').textContent = `-₵${appliedDiscount.toFixed(2)}`;
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Handle escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeConfirmation();
        }
    });
    
    // Handle modal overlay click
    document.querySelector('.modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeConfirmation();
        }
    });
    
    console.log('✅ Event listeners setup complete');
}

// Select Payment Method
function selectPayment(method) {
    selectedPayment = method;
    
    // Update UI
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    // Update radio button
    document.querySelector(`input[value="${method}"]`).checked = true;
    
    console.log('💳 Payment method selected:', method);
}

// Apply Promo Code
function applyPromo() {
    const promoInput = document.getElementById('promoCode');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        showNotification('Please enter a promo code', 'warning');
        return;
    }
    
    // Simulate promo code validation
    const validPromos = {
        'K3K310': 2.00,
        'FIRST10': 3.00,
        'STUDENT5': 1.50,
        'WEEKEND20': 4.00
    };
    
    if (validPromos[promoCode]) {
        appliedDiscount = validPromos[promoCode];
        
        // Update UI
        document.getElementById('promoDiscount').style.display = 'flex';
        document.getElementById('discountText').textContent = `₵${appliedDiscount.toFixed(2)} discount applied!`;
        
        // Update fare breakdown
        updateFareBreakdown(rideData.fare || 15.50);
        
        // Disable promo input
        promoInput.disabled = true;
        event.target.disabled = true;
        event.target.textContent = 'Applied';
        
        showNotification('Promo code applied successfully!', 'success');
        console.log('🎫 Promo code applied:', promoCode, 'Discount:', appliedDiscount);
        
    } else {
        showNotification('Invalid promo code', 'error');
        console.log('❌ Invalid promo code:', promoCode);
    }
}

// Close Confirmation
function closeConfirmation() {
    console.log('🔙 Closing confirmation modal');
    
    // Return to dashboard
    window.location.href = 'dashboard.html';
}

// Confirm Ride
function confirmRide() {
    console.log('✅ Confirming ride...');
    
    // Show loading overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    // Prepare ride data for status page
    const confirmedRide = {
        ...rideData,
        paymentMethod: selectedPayment,
        discountApplied: appliedDiscount,
        finalFare: (rideData.fare || 15.50) - appliedDiscount,
        status: 'searching',
        id: generateRideId(),
        timestamp: new Date().toISOString()
    };
    
    // Save ride data to localStorage for ride status page
    localStorage.setItem('k3k3_current_ride', JSON.stringify(confirmedRide));
    
    // Simulate API call delay
    setTimeout(() => {
        console.log('🚗 Ride confirmed, navigating to status page...');
        
        // Navigate to ride status page
        window.location.href = 'ride-status.html';
    }, 2000);
}

// Generate Ride ID
function generateRideId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `K3R-${dateStr}${randomStr}`;
}

// Show Notification (Helper Function)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'confirmation-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        z-index: 10002;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'var(--k3k3-success)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'var(--k3k3-danger)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'var(--k3k3-warning)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'var(--k3k3-info)';
            notification.style.color = 'white';
    }
    
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Professional Touch: Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // Tab navigation for payment options
    if (e.key === 'Tab') {
        const paymentOptions = document.querySelectorAll('.payment-option');
        const currentIndex = Array.from(paymentOptions).findIndex(option => option.classList.contains('active'));
        
        if (e.shiftKey) {
            // Shift+Tab - go to previous
            if (currentIndex > 0) {
                e.preventDefault();
                paymentOptions[currentIndex - 1].click();
            }
        } else {
            // Tab - go to next
            if (currentIndex < paymentOptions.length - 1) {
                e.preventDefault();
                paymentOptions[currentIndex + 1].click();
            }
        }
    }
    
    // Enter to confirm ride
    if (e.key === 'Enter' && !e.target.matches('input')) {
        confirmRide();
    }
});

// Professional Touch: Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - could go to next step
            console.log('👈 Swipe left detected');
        } else {
            // Swipe right - close modal
            console.log('👉 Swipe right detected');
            closeConfirmation();
        }
    }
}

// Professional Touch: Add accessibility features
function setupAccessibility() {
    // Add ARIA labels
    document.querySelector('.modal-content').setAttribute('role', 'dialog');
    document.querySelector('.modal-content').setAttribute('aria-labelledby', 'confirmation-title');
    document.querySelector('.modal-header h2').setAttribute('id', 'confirmation-title');
    
    // Add keyboard navigation hints
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach((option, index) => {
        option.setAttribute('tabindex', '0');
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', option.classList.contains('active'));
        option.setAttribute('aria-label', `Payment option ${index + 1}: ${option.querySelector('.payment-name').textContent}`);
    });
}

// Initialize accessibility
document.addEventListener('DOMContentLoaded', setupAccessibility);
