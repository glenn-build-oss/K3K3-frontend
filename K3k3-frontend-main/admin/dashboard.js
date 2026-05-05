// K3K3 Admin Dashboard - Updated with Real Database Integration
// Replaces mock data with actual database connections

class K3K3Dashboard {
  constructor() {
    this.isInitialized = false;
    this.timeInterval = null;
    this.dataInterval = null;
    this.refreshInterval = 30000; // 30 seconds
    this.dashboardData = {
      activeTrips: 0,
      onlineDrivers: 0,
      todayRevenue: 0,
      totalTrips: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalDrivers: 0,
      recentTrips: []
    };
    console.log('🚀 Initializing K3K3 Dashboard with REAL database...');
    this.init();
  }

  async init() {
    console.log('🚀 Initializing K3K3 Dashboard...');
    
    // Initialize universal time display
    this.initializeUniversalTime();
    
    // Initialize dashboard data with REAL database connection
    console.log('📊 Loading REAL dashboard data from database...');
    await this.loadRealDashboardData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start real-time updates
    this.startRealTimeUpdates();
    
    this.isInitialized = true;
    console.log('✅ K3K3 Dashboard initialized with REAL data!');
  }

  async loadRealDashboardData() {
    try {
      console.log('🔄 Loading real dashboard metrics from database...');
      
      // Load real trips data
      const tripsResponse = await fetch('http://localhost:8810/api/v1/trips/');
      if (tripsResponse.ok) {
        this.dashboardData.recentTrips = await tripsResponse.json();
        console.log('✅ Loaded', this.dashboardData.recentTrips.length, 'real trips from database');
      } else {
        console.warn('⚠️ Failed to load trips from database, using fallback');
        this.generateFallbackData();
        return;
      }

      // Load real riders data
      const ridersResponse = await fetch('http://localhost:8810/api/v1/riders/');
      if (ridersResponse.ok) {
        const riders = await ridersResponse.json();
        this.dashboardData.totalDrivers = riders.length;
        this.dashboardData.onlineDrivers = riders.filter(r => r.is_available).length;
        console.log('✅ Loaded', riders.length, 'real riders from database');
      } else {
        console.warn('⚠️ Failed to load riders from database');
      }

      // Load real vehicles data
      const vehiclesResponse = await fetch('http://localhost:8810/api/v1/vehicles/');
      if (vehiclesResponse.ok) {
        const vehicles = await vehiclesResponse.json();
        console.log('✅ Loaded', vehicles.length, 'real vehicles from database');
      } else {
        console.warn('⚠️ Failed to load vehicles from database');
      }

      // Calculate real metrics from trips data
      this.calculateRealMetrics();
      
    } catch (error) {
      console.error('❌ Error loading real dashboard data:', error);
      console.log('🔄 Using fallback data...');
      this.generateFallbackData();
    }
  }

  calculateRealMetrics() {
    const trips = this.dashboardData.recentTrips || [];
    
    // Calculate real metrics from database trips
    this.dashboardData.totalTrips = trips.length;
    this.dashboardData.activeTrips = trips.filter(t => t.status === 'in_progress').length;
    this.dashboardData.completedTrips = trips.filter(t => t.status === 'completed').length;
    
    // Calculate real revenue from completed trips
    this.dashboardData.totalRevenue = trips
      .filter(t => t.status === 'completed' && t.actual_fare)
      .reduce((sum, trip) => sum + parseFloat(trip.actual_fare), 0);
    
    // Today's revenue
    const today = new Date().toDateString();
    this.dashboardData.todayRevenue = trips
      .filter(t => t.status === 'completed' && t.actual_fare && new Date(t.completed_at).toDateString() === today)
      .reduce((sum, trip) => sum + parseFloat(trip.actual_fare), 0);
    
    // Count unique passengers
    const uniquePassengers = new Set(trips.map(t => t.passenger_id).filter(id => id));
    this.dashboardData.totalCustomers = uniquePassengers.size;
    
    console.log('📊 Real metrics calculated:', {
      totalTrips: this.dashboardData.totalTrips,
      activeTrips: this.dashboardData.activeTrips,
      totalRevenue: this.dashboardData.totalRevenue,
      todayRevenue: this.dashboardData.todayRevenue,
      totalCustomers: this.dashboardData.totalCustomers
    });
  }

  generateFallbackData() {
    console.log('📝 Generating fallback data (no database connection)');
    this.dashboardData = {
      activeTrips: 0,
      onlineDrivers: 0,
      todayRevenue: 0,
      totalTrips: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalDrivers: 0,
      recentTrips: []
    };
  }

  initializeUniversalTime() {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      const dateEl = document.getElementById('dateValue');
      
      if (hoursEl) hoursEl.textContent = hours;
      if (minutesEl) minutesEl.textContent = minutes;
      if (secondsEl) secondsEl.textContent = seconds;
      if (dateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
      }
    };
    
    updateClock();
    this.timeInterval = setInterval(updateClock, 1000);
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.querySelector('a')?.getAttribute('href')?.substring(1);
        if (targetId) {
          this.showSection(targetId);
        }
      });
    });

    // Logout buttons
    const logoutBtn = document.getElementById("logoutBtn");
    const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");
    
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }
    
    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }
  }

  showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-content > section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = 'block';
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`a[href="#${sectionId}"]`);
    if (activeNavItem) {
      activeNavItem.closest('.nav-item').classList.add('active');
    }
  }

  updateStats() {
    // Update metric cards with real data
    const elements = {
      totalTrips: document.getElementById('totalTrips'),
      activeTrips: document.getElementById('activeTrips'),
      todayRevenue: document.getElementById('todayRevenue'),
      totalRevenue: document.getElementById('totalRevenue'),
      totalCustomers: document.getElementById('totalCustomers'),
      totalDrivers: document.getElementById('totalDrivers'),
      onlineDrivers: document.getElementById('onlineDrivers')
    };

    if (elements.totalTrips) {
      elements.totalTrips.textContent = this.dashboardData.totalTrips;
    }
    if (elements.activeTrips) {
      elements.activeTrips.textContent = this.dashboardData.activeTrips;
    }
    if (elements.todayRevenue) {
      elements.todayRevenue.textContent = `₵${this.dashboardData.todayRevenue.toFixed(2)}`;
    }
    if (elements.totalRevenue) {
      elements.totalRevenue.textContent = `₵${this.dashboardData.totalRevenue.toFixed(2)}`;
    }
    if (elements.totalCustomers) {
      elements.totalCustomers.textContent = this.dashboardData.totalCustomers;
    }
    if (elements.totalDrivers) {
      elements.totalDrivers.textContent = this.dashboardData.totalDrivers;
    }
    if (elements.onlineDrivers) {
      elements.onlineDrivers.textContent = this.dashboardData.onlineDrivers;
    }

    console.log('✅ Dashboard stats updated with real data');
  }

  renderRecentTrips() {
    const recentTripsContainer = document.getElementById('recentTrips');
    if (!recentTripsContainer) return;

    recentTripsContainer.innerHTML = '';
    
    const recentTrips = this.dashboardData.recentTrips.slice(0, 10);
    
    if (recentTrips.length === 0) {
      recentTripsContainer.innerHTML = '<p class="no-data">No recent trips found</p>';
      return;
    }

    recentTrips.forEach(trip => {
      const tripElement = document.createElement('div');
      tripElement.className = 'trip-item';
      tripElement.innerHTML = `
        <div class="trip-info">
          <div class="trip-id">Trip #${trip.id}</div>
          <div class="trip-date">${new Date(trip.created_at).toLocaleDateString()}</div>
          <div class="trip-status ${trip.status}">${trip.status}</div>
          ${trip.actual_fare ? `<div class="trip-fare">₵${trip.actual_fare.toFixed(2)}</div>` : ''}
        </div>
      `;
      recentTripsContainer.appendChild(tripElement);
    });

    console.log('✅ Recent trips rendered with real data');
  }

  updateCharts() {
    // Update charts with real data
    this.updateRevenueChart();
    this.updateTripStatusChart();
  }

  updateRevenueChart() {
    const chartCanvas = document.getElementById('revenueChart');
    if (!chartCanvas) return;

    // Calculate daily revenue for the last 7 days
    const dailyRevenue = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayRevenue = this.dashboardData.recentTrips
        .filter(t => t.status === 'completed' && t.actual_fare && new Date(t.completed_at).toDateString() === dateStr)
        .reduce((sum, trip) => sum + parseFloat(trip.actual_fare), 0);
      
      dailyRevenue.push(dayRevenue);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    // Update chart (assuming Chart.js is available)
    if (window.Chart && chartCanvas.chart) {
      chartCanvas.chart.data.labels = labels;
      chartCanvas.chart.data.datasets[0].data = dailyRevenue;
      chartCanvas.chart.update();
    }

    console.log('✅ Revenue chart updated with real data');
  }

  updateTripStatusChart() {
    const chartCanvas = document.getElementById('tripStatusChart');
    if (!chartCanvas) return;

    const trips = this.dashboardData.recentTrips;
    const statusCounts = {
      completed: trips.filter(t => t.status === 'completed').length,
      in_progress: trips.filter(t => t.status === 'in_progress').length,
      cancelled: trips.filter(t => t.status === 'cancelled').length,
      requested: trips.filter(t => t.status === 'requested').length
    };

    // Update chart (assuming Chart.js is available)
    if (window.Chart && chartCanvas.chart) {
      chartCanvas.chart.data.datasets[0].data = [
        statusCounts.completed,
        statusCounts.in_progress,
        statusCounts.cancelled,
        statusCounts.requested
      ];
      chartCanvas.chart.update();
    }

    console.log('✅ Trip status chart updated with real data');
  }

  startRealTimeUpdates() {
    // Refresh data every 30 seconds
    this.dataInterval = setInterval(async () => {
      console.log('🔄 Refreshing real-time dashboard data...');
      await this.loadRealDashboardData();
      this.updateStats();
      this.renderRecentTrips();
      this.updateCharts();
    }, this.refreshInterval);
  }

  async refreshData() {
    console.log('🔄 Manual refresh triggered...');
    await this.loadRealDashboardData();
    this.updateStats();
    this.renderRecentTrips();
    this.updateCharts();
    this.showNotification('Dashboard data refreshed!', 'success');
  }

  handleLogout() {
    console.log('🚪 Logging out...');
    
    // Clear admin session
    localStorage.removeItem('k3k3_admin_token');
    localStorage.removeItem('activeUser');
    localStorage.removeItem('username');
    localStorage.removeItem('k3k3_user');
    
    // Show notification
    this.showNotification('Admin logout successful! Thank you for managing K3K3.', 'success');
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = 'adminlogin.html';
    }, 2000);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else {
      notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
    
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

  destroy() {
    // Clean up intervals
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
    }
    
    this.isInitialized = false;
    console.log('🧹 Dashboard cleaned up');
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Starting K3K3 Admin Dashboard with REAL database...');
  window.k3k3Dashboard = new K3K3Dashboard();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.k3k3Dashboard) {
    window.k3k3Dashboard.destroy();
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = K3K3Dashboard;
}
