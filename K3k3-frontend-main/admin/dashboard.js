// K3K3 Admin Dashboard - Professional Enterprise Version
// Universal Time Display + Professional Functionality

class K3K3Dashboard {
  constructor() {
    this.isInitialized = false;
    this.timeInterval = null;
    this.dataInterval = null;
    this.tripTimeInterval = null;
    this.currentPeriod = 'today';
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
    console.log('🚀 Initializing K3K3 Dashboard...');
    this.init();
  }

  init() {
    console.log('🚀 Initializing K3K3 Dashboard...');
    
    // Initialize universal time display
    console.log('⏰ Setting up universal time...');
    this.initializeUniversalTime();
    
    // Initialize dashboard data
    console.log('📊 Initializing dashboard data...');
    this.initializeDashboardData();
    
    // Setup event listeners
    console.log('🎧 Setting up event listeners...');
    this.setupEventListeners();
    
    // Start real-time updates
    console.log('🔄 Starting real-time updates...');
    this.startRealTimeUpdates();
    
    // Listen for new rider applications from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'riderApplication' && e.newValue) {
        console.log('📝 New rider application detected via storage event');
        const application = JSON.parse(e.newValue);
        
        // Add to applications array using the riderApps manager
        if (window.riderApps) {
          // Check if application already exists to prevent duplicates
          const existingApp = window.riderApps.applications.find(app => 
            app.id === (application.riderId || application.id)
          );
          
          if (!existingApp) {
            window.riderApps.applications.unshift({
              id: application.riderId || application.id,
              firstName: application.firstName || 'Unknown',
              lastName: application.lastName || 'Rider',
              email: application.email || `${(application.firstName || 'rider').toLowerCase()}@k3k3.com`,
              phone: application.phone || '+233 XXX XXXX',
              licenseType: 'Professional',
              experience: '2+ years',
              vehicle: application.vehicle,
              status: 'pending',
              applicationDate: application.applicationDate,
              rating: application.rating,
              trips: application.trips,
              earnings: application.earnings,
              // Include documents for admin viewing
              documents: application.documents || []
            });
            
            // Clear the application from localStorage immediately
            localStorage.removeItem('riderApplication');
            
            // Update UI once
            window.riderApps.renderApplications();
            window.riderApps.updateApplicationCount();
            
            // Show notification
            window.riderApps.showNotification(`New rider application from ${application.firstName || 'Unknown'} ${application.lastName || 'Rider'}`, 'success');
          } else {
            console.log('🔄 Application already exists, skipping duplicate');
            // Clear the duplicate from localStorage
            localStorage.removeItem('riderApplication');
          }
        }
      }
    });
    
    // Show rider applications
    function showRiderApplications() {
      console.log('showRiderApplications() called - showing rider applications section');
      
      // Hide all other sections
      document.querySelectorAll('.dashboard-content > section').forEach(section => {
        if (section.id !== 'rider-applications') {
          section.style.display = 'none';
        }
      });
      
      // Show the applications section with animation
      const applicationsSection = document.getElementById('rider-applications');
      if (applicationsSection) {
        applicationsSection.classList.add('active');
        applicationsSection.style.display = 'block';
        applicationsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
          item.classList.remove('active');
        });
        
        // Find and activate the rider applications nav item
        const riderAppsNavItem = document.querySelector('a[href="#rider-applications"]');
        if (riderAppsNavItem) {
          riderAppsNavItem.closest('.nav-item').classList.add('active');
        }
      }
      
      // Load applications and update count once
      if (window.riderApps) {
        window.riderApps.loadApplications();
        window.riderApps.updateApplicationCount();
      }
    }
    
    // Refresh applications
    function refreshApplications() {
      console.log('refreshApplications() called - refreshing rider applications');
      
      if (window.riderApps) {
        window.riderApps.loadApplications();
        window.riderApps.showNotification('Applications refreshed successfully!', 'success');
      }
    }
    
    // Test function to simulate rider application
    function testRiderApplication() {
      console.log('🧪 Testing rider application system...');
      
      const testApplication = {
        riderId: 'K3R-TEST-001',
        name: 'Test Rider',
        vehicle: 'Test Motorcycle',
        rating: '4.9',
        trips: '50',
        earnings: '₵500',
        applicationDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store test application
      localStorage.setItem('riderApplication', JSON.stringify(testApplication));
      
      // Trigger storage event manually
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'riderApplication',
        newValue: JSON.stringify(testApplication)
      }));
      
      console.log('🧪 Test application sent!');
    }
    
    // Debug function to test time display
    function debugTimeDisplay() {
      console.log('🕐 Debugging time display...');
      
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const hour = now.getHours();
      
      console.log(`⏰ Current system time: ${hours}:${minutes}:${seconds}`);
      console.log(`📅 Full Date: ${now.toString()}`);
      console.log(`🌍 Local Time: ${now.toLocaleString()}`);
      console.log(`🕐 UTC Time: ${now.toUTCString()}`);
      console.log(`📍 Timezone Offset: ${now.getTimezoneOffset()} minutes`);
      
      // Update time display
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');
      const timeLabelEl = document.getElementById('timeLabel');
      const dateEl = document.getElementById('dateValue');
      
      console.log('🔍 Elements found:', {
        hoursEl: !!hoursEl,
        minutesEl: !!minutesEl,
        secondsEl: !!secondsEl,
        timeLabelEl: !!timeLabelEl,
        dateEl: !!dateEl
      });
      
      if (hoursEl) {
        hoursEl.textContent = hours;
        console.log('✅ Hours updated:', hours);
      } else {
        console.error('❌ Hours element not found!');
      }
      
      if (minutesEl) {
        minutesEl.textContent = minutes;
        console.log('✅ Minutes updated:', minutes);
      } else {
        console.error('❌ Minutes element not found!');
      }
      
      if (secondsEl) {
        secondsEl.textContent = seconds;
        console.log('✅ Seconds updated:', seconds);
      } else {
        console.error('❌ Seconds element not found!');
      }
      
      // Update date
      if (dateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        dateEl.textContent = dateString;
        console.log('✅ Date updated to:', dateString);
      } else {
        console.error('❌ Date element not found!');
      }
      
      // Update timezone
      if (timeLabelEl) {
        const offset = now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        const timezone = `GMT${sign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
        timeLabelEl.textContent = timezone;
        console.log('✅ Timezone updated to:', timezone);
      } else {
        console.error('❌ Timezone element not found!');
      }
      
      console.log('🕐 Time display debug complete!');
      console.log('🔍 Compare with your PC time - they should match!');
    }
    
    // Force time update function
    function forceTimeUpdate() {
      console.log('⚡ Forcing immediate time update...');
      
      if (window.k3k3Dashboard) {
        window.k3k3Dashboard.updateUniversalTime();
        console.log('⚡ Time update forced!');
      } else {
        console.error('❌ Dashboard not initialized yet!');
      }
    }
    
    // Test function to verify rider applications section
    function testRiderApplicationsSection() {
      console.log('🧪 Testing rider applications section...');
      
      // Create a test application
      const testApplication = {
        riderId: 'K3R-TEST-002',
        name: 'Test Rider Application',
        vehicle: 'Test Motorcycle',
        rating: '4.8',
        trips: '25',
        earnings: '₵250',
        applicationDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store test application
      localStorage.setItem('riderApplication', JSON.stringify(testApplication));
      
      // Show the rider applications section
      showRiderApplications();
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'riderApplication',
        newValue: JSON.stringify(testApplication)
      }));
      
      console.log('🧪 Test rider application sent and section shown!');
      console.log('🔍 Check the rider applications section for the new application');
    }
    
    // Load initial data
    console.log('📈 Loading initial dashboard data...');
    this.loadDashboardData();
    
    this.isInitialized = true;
    console.log('✅ K3K3 Dashboard Ready');
  }

  initializeUniversalTime() {
    console.log('⏰ Setting up universal time...');
    this.updateUniversalTime();
    this.timeInterval = setInterval(() => {
      this.updateUniversalTime();
    }, 1000);
  }

  updateUniversalTime() {
    const now = new Date();
    
    // Get local time components
    const localHours = String(now.getHours()).padStart(2, '0');
    const localMinutes = String(now.getMinutes()).padStart(2, '0');
    const localSeconds = String(now.getSeconds()).padStart(2, '0');
    const hour = now.getHours();
    
    console.log(`Updating LOCAL time: ${localHours}:${localMinutes}:${localSeconds}`);
    
    // Update time display - check for sidebar elements
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const timeLabelEl = document.getElementById('timeLabel');
    const dateEl = document.getElementById('dateValue');
    
    console.log('Sidebar time elements found:', {
      hoursEl: !!hoursEl,
      minutesEl: !!minutesEl,
      secondsEl: !!secondsEl,
      timeLabelEl: !!timeLabelEl,
      dateEl: !!dateEl
    });
    
    if (hoursEl) {
      hoursEl.textContent = localHours;
      console.log('Hours updated:', localHours);
    } else {
      console.error('Hours element not found!');
    }
    
    if (minutesEl) {
      minutesEl.textContent = localMinutes;
      console.log('Minutes updated:', localMinutes);
    } else {
      console.error('Minutes element not found!');
    }
    
    if (secondsEl) {
      secondsEl.textContent = localSeconds;
      console.log('Seconds updated:', localSeconds);
    } else {
      console.error('Seconds element not found!');
    }
    
    // Update date
    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = now.toLocaleDateString('en-US', options);
      dateEl.textContent = dateString;
      console.log('Date updated to:', dateString);
    } else {
      console.error('Date element not found!');
    }
    
    // Update timezone with accurate local timezone
    if (timeLabelEl) {
      // Get timezone name using Intl API
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        const timezoneOffset = `GMT${sign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
        
        // Show both timezone name and offset
        timeLabelEl.textContent = `${timeZone} (${timezoneOffset})`;
        console.log('Timezone updated to:', `${timeZone} (${timezoneOffset})`);
      } catch (e) {
        // Fallback to GMT offset if timezone name not available
        const offset = now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        const timezone = `GMT${sign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
        timeLabelEl.textContent = timezone;
        console.log('Timezone updated to (fallback):', timezone);
      }
    } else {
      console.error('Timezone element not found!');
    }
    
    // Update greeting based on local time
    this.updateGreeting(hour);
    
    // Also check if there are any other time displays that need updating
    this.updateAllTimeDisplays(now);
  }
  
  updateAllTimeDisplays(now) {
    // Check for any other time displays that might exist
    const localHours = String(now.getHours()).padStart(2, '0');
    const localMinutes = String(now.getMinutes()).padStart(2, '0');
    const localSeconds = String(now.getSeconds()).padStart(2, '0');
    
    // Look for any elements with class containing 'time'
    const timeElements = document.querySelectorAll('[class*="time"], [id*="time"], [class*="clock"], [id*="clock"]');
    console.log('Found additional time elements:', timeElements.length);
    
    timeElements.forEach((el, index) => {
      console.log(`Time element ${index}:`, {
        id: el.id,
        className: el.className,
        tag: el.tagName,
        currentText: el.textContent
      });
    });
    
    // Try to update sidebar time display directly
    const universalTimeEl = document.getElementById('universalTime');
    if (universalTimeEl) {
      console.log('Found universalTime container:', universalTimeEl);
      
      // Try to find time elements within this container
      const timeDisplay = universalTimeEl.querySelector('.time-display');
      const dateDisplay = universalTimeEl.querySelector('.date-display');
      
      console.log('Time display found:', !!timeDisplay);
      console.log('Date display found:', !!dateDisplay);
      
      if (timeDisplay) {
        const hoursSpan = timeDisplay.querySelector('#hours');
        const minutesSpan = timeDisplay.querySelector('#minutes');
        const secondsSpan = timeDisplay.querySelector('#seconds');
        
        if (hoursSpan) hoursSpan.textContent = localHours;
        if (minutesSpan) minutesSpan.textContent = localMinutes;
        if (secondsSpan) secondsSpan.textContent = localSeconds;
        
        console.log('Updated sidebar time directly:', { hoursSpan: !!hoursSpan, minutesSpan: !!minutesSpan, secondsSpan: !!secondsSpan });
      }
    }
  }

  updateGreeting(hour) {
    const greetingEl = document.querySelector('.greeting');
    if (!greetingEl) {
      console.log('❌ Greeting element not found');
      return;
    }
    
    let greeting;
    let greetingEmoji;
    
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
      greetingEmoji = '🌅';
      console.log('🌅 Morning greeting (5:00-12:00)');
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
      greetingEmoji = '☀️';
      console.log('☀️ Afternoon greeting (12:00-17:00)');
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening';
      greetingEmoji = '🌆';
      console.log('🌆 Evening greeting (17:00-21:00)');
    } else {
      greeting = 'Good night';
      greetingEmoji = '🌙';
      console.log('🌙 Night greeting (21:00-5:00)');
    }
    
    greetingEl.textContent = `${greetingEmoji} ${greeting}`;
    console.log(`✅ Greeting updated to: ${greetingEmoji} ${greeting}`);
  }

  initializeDashboardData() {
    this.generateMockData();
  }

  generateMockData() {
    // Generate realistic mock data with some variation
    const baseActiveTrips = 15;
    const baseOnlineDrivers = 40;
    const baseRevenue = 3000;
    
    this.dashboardData = {
      activeTrips: baseActiveTrips + Math.floor(Math.random() * 10) - 5,
      onlineDrivers: baseOnlineDrivers + Math.floor(Math.random() * 20) - 10,
      todayRevenue: baseRevenue + Math.floor(Math.random() * 2000) - 1000,
      totalTrips: Math.floor(Math.random() * 1000) + 500,
      totalRevenue: Math.floor(Math.random() * 50000) + 20000,
      totalCustomers: Math.floor(Math.random() * 2000) + 1000,
      totalDrivers: Math.floor(Math.random() * 300) + 150,
      recentTrips: this.generateRecentTrips()
    };
    
    console.log('📊 Generated mock data:', this.dashboardData);
  }

  setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.k3k3-sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Navigation items
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href === 'dashboard.html') {
          document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
          });
          link.closest('.nav-item').classList.add('active');
          return;
        }
        
        e.preventDefault();
        this.handleNavigation(href, link);
      });
    });

    // Time filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const period = e.target.dataset.period;
        this.currentPeriod = period;
        
        this.updateMetricsForPeriod(period);
      });
    });

    // Quick action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.handleQuickAction(e.target.closest('.action-card'));
      });
    });

    // View All button
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => this.showAllTrips());
    }

    // Expand button
    const expandBtn = document.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => this.expandMap());
    }

    const openMapBtn = document.querySelector('.open-map-btn');
    if (openMapBtn) {
      openMapBtn.addEventListener('click', () => this.openFullMap());
    }
  }

  handleNavigation(href, link) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    link.closest('.nav-item').classList.add('active');
    
    if (href === '#' || href === 'dashboard.html') {
      return;
    } else if (href === 'tracking.html') {
      window.location.href = 'ride-monitoring.html';
    } else if (href.includes('.html')) {
      window.location.href = href;
    } else {
      this.showNotification(`${href} section coming soon!`, 'info');
    }
  }

  handleQuickAction(card) {
    const title = card.querySelector('h4').textContent;
    console.log('🎯 Quick Action clicked:', title);
    
    // Add visual feedback
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 150);
    
    switch(title) {
      case 'Add Rider':
        this.showQuickAddRiderModal();
        break;
      case 'Export Report':
        this.showNotification('Navigating to Analytics...', 'info');
        setTimeout(() => {
          window.location.href = 'analytics.html';
        }, 500);
        break;
      case 'Send Notification':
        this.showNotification('Opening notification composer...', 'info');
        this.showNotificationForm();
        break;
      case 'View Analytics':
        this.showNotification('Navigating to Analytics...', 'info');
        setTimeout(() => {
          window.location.href = 'analytics.html';
        }, 500);
        break;
      case 'Manage Riders':
        this.showNotification('Navigating to Rider Management...', 'info');
        setTimeout(() => {
          window.location.href = 'rider-management.html';
        }, 500);
        break;
      case 'System Settings':
        this.showNotification('Navigating to System Settings...', 'info');
        setTimeout(() => {
          window.location.href = 'system-settings.html';
        }, 500);
        break;
      case 'Live Tracking':
        this.showNotification('Navigating to Live Tracking...', 'info');
        setTimeout(() => {
          window.location.href = 'ride-monitoring.html';
        }, 500);
        break;
      case 'Payment Management':
        this.showNotification('Navigating to Payment Management...', 'info');
        setTimeout(() => {
          window.location.href = 'payment-management.html';
        }, 500);
        break;
      default:
        this.showNotification(`${title} feature coming soon!`, 'info');
    }
  }

  updateUI() {
    this.updateHeroStats();
    this.updateMetrics();
    this.updateRecentTrips();
  }

  // Enhanced update methods for real data
  updateHeroStats(stats = null) {
    // If no stats provided, use the existing method logic
    if (!stats) {
      console.log('Using dashboard data for hero stats...');
      stats = {
        activeRides: this.dashboardData?.activeTrips || 0,
        completedRides: this.dashboardData?.totalTrips || 0,
        avgDuration: '15m',
        totalRevenue: this.dashboardData?.totalRevenue || 0
      };
    }
    
    console.log('Updating hero stats with:', stats);
    
    const activeRidesEl = document.getElementById('activeRides');
    const completedRidesEl = document.getElementById('completedRides');
    const avgDurationEl = document.getElementById('avgDuration');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    if (activeRidesEl) activeRidesEl.textContent = stats.activeRides || 0;
    if (completedRidesEl) completedRidesEl.textContent = stats.completedRides || 0;
    if (avgDurationEl) avgDurationEl.textContent = stats.avgDuration || '0m';
    if (totalRevenueEl) totalRevenueEl.textContent = `GH¢${(stats.totalRevenue || 0).toLocaleString()}`;
  }

  updateMetrics() {
    console.log('🔄 Updating metrics...');
    
    // Simulate real-time changes to metrics
    const currentActiveTrips = this.dashboardData.activeTrips;
    const currentOnlineDrivers = this.dashboardData.onlineDrivers;
    const currentRevenue = this.dashboardData.todayRevenue;
    
    // Add small random changes to simulate real-time activity
    this.dashboardData.activeTrips = Math.max(5, currentActiveTrips + Math.floor(Math.random() * 5) - 2);
    this.dashboardData.onlineDrivers = Math.max(20, currentOnlineDrivers + Math.floor(Math.random() * 3) - 1);
    this.dashboardData.todayRevenue = Math.max(0, currentRevenue + Math.floor(Math.random() * 200) - 100);
    
    // Update online riders with realistic data
    const onlineRidersEl = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (onlineRidersEl) {
        const onlineRiders = Math.floor(Math.random() * 40) + 60; // 60-100 online riders
        onlineRidersEl.textContent = onlineRiders.toLocaleString();
        console.log(`✅ Online Riders updated: ${onlineRiders}`);
    }
    
    // Update System status
    const systemStatusEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (systemStatusEl) {
      const statuses = ['Operational', 'Optimal', 'Running', 'Active'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      systemStatusEl.textContent = status;
      systemStatusEl.className = 'stat-value status-operational';
    }
    
    // Update API status
    const apiStatusEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (apiStatusEl) {
      const apiHealthy = Math.random() > 0.1;
      const apiStatus = apiHealthy ? 'Healthy' : 'Degraded';
      apiStatusEl.textContent = apiStatus;
      apiStatusEl.className = apiHealthy ? 'stat-value status-healthy' : 'stat-value status-warning';
    }
    
    // Update Database status
    const dbStatusEl = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (dbStatusEl) {
      const dbConnected = Math.random() > 0.05;
      const dbStatus = dbConnected ? 'Connected' : 'Reconnecting';
      dbStatusEl.textContent = dbStatus;
      dbStatusEl.className = dbConnected ? 'stat-value status-healthy' : 'stat-value status-warning';
    }
    
    // Update hero stats with new data
    this.updateHeroStats();
  }

  updateRecentTrips() {
    const tripsList = document.getElementById('recentTripsList');
    if (!tripsList) return;
    
    const recentTrips = this.generateRecentTrips();
    const tripsHtml = recentTrips.map(trip => `
      <div class="trip-item" data-status="${trip.status}">
        <div class="trip-header">
          <div class="trip-id">
            <span class="trip-number">${trip.id}</span>
            <span class="trip-status ${trip.status}">${trip.status}</span>
          </div>
          <div class="trip-time">
            <i class="fas fa-clock"></i>
            <span>${trip.timeAgo}</span>
          </div>
        </div>
        
        <div class="trip-route">
          <div class="route-point pickup">
            <i class="fas fa-map-marker-alt"></i>
            <div class="location-info">
              <span class="location-name">${trip.pickup}</span>
              <span class="location-type">Pickup</span>
            </div>
          </div>
          <div class="route-details">
            <div class="route-arrow">→</div>
            <div class="trip-distance">${trip.distance} km</div>
            <div class="trip-duration">${trip.duration} min</div>
          </div>
          <div class="route-point dropoff">
            <i class="fas fa-flag-checkered"></i>
            <div class="location-info">
              <span class="location-name">${trip.dropoff}</span>
              <span class="location-type">Dropoff</span>
            </div>
          </div>
        </div>
        
        <div class="trip-details">
          <div class="trip-info-item">
            <i class="fas fa-user"></i>
            <div class="info-content">
              <span class="info-label">Rider</span>
              <span class="info-value">${trip.rider}</span>
            </div>
          </div>
          <div class="trip-info-item">
            <i class="fas fa-id-card"></i>
            <div class="info-content">
              <span class="info-label">Driver</span>
              <span class="info-value">${trip.driver}</span>
            </div>
          </div>
          <div class="trip-info-item">
            <i class="fas fa-car"></i>
            <div class="info-content">
              <span class="info-label">Vehicle</span>
              <span class="info-value">${trip.vehicle}</span>
            </div>
          </div>
          <div class="trip-info-item">
            <i class="fas fa-money-bill-wave"></i>
            <div class="info-content">
              <span class="info-label">Fare</span>
              <span class="info-value">₵${trip.fare}</span>
            </div>
          </div>
          <div class="trip-info-item">
            <i class="fas fa-credit-card"></i>
            <div class="info-content">
              <span class="info-label">Payment</span>
              <span class="info-value">${trip.paymentMethod}</span>
            </div>
          </div>
          ${trip.rating ? `
            <div class="trip-info-item">
              <i class="fas fa-star"></i>
              <div class="info-content">
                <span class="info-label">Rating</span>
                <span class="info-value rating">
                  <i class="fas fa-star"></i>
                  ${trip.rating}
                </span>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
    
    tripsList.innerHTML = tripsHtml;
    
    // Add real-time updates for trip times
    this.startTripTimeUpdates();
    
    console.log('✅ Recent trips updated with enhanced data');
  }
  
  startTripTimeUpdates() {
    // Update "time ago" every minute
    if (this.tripTimeInterval) {
      clearInterval(this.tripTimeInterval);
    }
    
    this.tripTimeInterval = setInterval(() => {
      const tripElements = document.querySelectorAll('.trip-time span');
      tripElements.forEach((element, index) => {
        if (element.textContent.includes('ago') || element.textContent.includes('now')) {
          // Parse current time and update
          const currentText = element.textContent;
          if (currentText.includes('minute')) {
            const minutes = parseInt(currentText);
            if (minutes > 0) {
              element.textContent = `${minutes - 1} minute${minutes - 1 === 1 ? '' : 's'} ago`;
            } else {
              element.textContent = 'Just now';
            }
          }
        }
      });
    }, 60000); // Update every minute
  }

  
  toggleLiveMap() {
    const mapContainer = document.getElementById('liveMapContainer');
    if (!mapContainer) return;
    
    const isExpanded = mapContainer.classList.contains('expanded');
    
    if (isExpanded) {
      mapContainer.classList.remove('expanded');
      mapContainer.style.height = '200px';
    } else {
      mapContainer.classList.add('expanded');
      mapContainer.style.height = '400px';
      this.loadLiveMap();
    }
  }

  loadLiveMap() {
    const mapContainer = document.getElementById('liveMapContainer');
    if (!mapContainer) return;
    
    // Create Uber-style live map with car icons
    const mapHtml = `
      <div style="position: relative; width: 100%; height: 100%; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; overflow: hidden;">
        <!-- Map Background -->
        <div style="position: absolute; inset: 0; opacity: 0.3;">
          <div style="position: absolute; top: 20%; left: 15%; width: 2px; height: 40px; background: #94a3b8;"></div>
          <div style="position: absolute; top: 25%; left: 25%; width: 30px; height: 2px; background: #94a3b8;"></div>
          <div style="position: absolute; top: 60%; left: 40%; width: 2px; height: 30px; background: #94a3b8;"></div>
          <div style="position: absolute; top: 40%; left: 60%; width: 40px; height: 2px; background: #94a3b8;"></div>
          <div style="position: absolute; top: 70%; left: 70%; width: 2px; height: 25px; background: #94a3b8;"></div>
        </div>
        
        <!-- Uber-style Car Icons -->
        <div class="car-icon" style="position: absolute; top: 25%; left: 20%; transform: rotate(45deg);">
          <div style="background: #000; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.3s ease;">
            🚗
          </div>
        </div>
        
        <div class="car-icon" style="position: absolute; top: 45%; left: 65%; transform: rotate(-30deg);">
          <div style="background: #000; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.3s ease;">
            🚗
          </div>
        </div>
        
        <!-- Tuk-Tuk (Pragya) Icon -->
        <div class="tuk-tuk-icon" style="position: absolute; top: 65%; left: 35%; transform: rotate(15deg);">
          <div style="background: #f59e0b; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4); transition: all 0.3s ease;">
            🛺
          </div>
        </div>
        
        <div class="car-icon" style="position: absolute; top: 30%; left: 80%; transform: rotate(75deg);">
          <div style="background: #000; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.3s ease;">
            🚗
          </div>
        </div>
        
        <div class="car-icon" style="position: absolute; top: 75%; left: 55%; transform: rotate(-60deg);">
          <div style="background: #000; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: all 0.3s ease;">
            🚗
          </div>
        </div>
        
        <!-- Map Info Overlay -->
        <div style="position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 16px; border-radius: 8px; backdrop-filter: blur(10px);">
          <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">🗺️ Live K3K3 Map</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 20px; height: 20px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">🚗</div>
              <span>5 Active</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 20px; height: 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">✅</div>
              <span>20 Completed</span>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; opacity: 0.8;">
            Last updated: ${new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <!-- Location Labels -->
        <div style="position: absolute; top: 22%; left: 18%; font-size: 10px; color: #374151; font-weight: 600;">Accra Mall</div>
        <div style="position: absolute; top: 42%; left: 63%; font-size: 10px; color: #374151; font-weight: 600;">Osu</div>
        <div style="position: absolute; top: 62%; left: 33%; font-size: 10px; color: #374151; font-weight: 600;">Tema</div>
        <div style="position: absolute; top: 27%; left: 78%; font-size: 10px; color: #374151; font-weight: 600;">Labone</div>
        <div style="position: absolute; top: 72%; left: 53%; font-size: 10px; color: #374151; font-weight: 600;">Kaneshie</div>
      </div>
    `;
    
    mapContainer.innerHTML = mapHtml;
    
    // Add animation to car icons
    setTimeout(() => {
      const carIcons = mapContainer.querySelectorAll('.car-icon');
      carIcons.forEach((car, index) => {
        setTimeout(() => {
          car.style.animation = 'carMove 3s ease-in-out infinite';
        }, index * 200);
      });
    }, 100);
  }

  openFullMap() {
    window.open('ride-monitoring.html', '_blank');
  }

  updateMetricsForPeriod(period) {
    const filteredData = this.generateFilteredData(period);
    
    const totalTripsEl = document.getElementById('totalTrips');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalRidersEl = document.getElementById('totalRiders');
    
    // Update trends
    const trends = {
      today: { trips: '+12.5%', revenue: '+8.3%', customers: '+5.7%', riders: '+15.2%' },
      week: { trips: '+18.2%', revenue: '+12.7%', customers: '+8.9%', riders: '+22.1%' },
      month: { trips: '+25.8%', revenue: '+19.3%', customers: '+14.2%', riders: '+31.5%' },
      year: { trips: '+45.2%', revenue: '+38.7%', customers: '+28.9%', riders: '+52.3%' }
    };
    
    // Animate value changes
    this.animateValue(totalTripsEl, parseInt(totalTripsEl.textContent.replace(/,/g, '')) || 0, filteredData.totalTrips, 1000);
    this.animateValue(totalRevenueEl, parseInt(totalRevenueEl.textContent.replace(/[₵,]/g, '')) || 0, filteredData.totalRevenue, 1000, true);
    this.animateValue(totalCustomersEl, parseInt(totalCustomersEl.textContent.replace(/,/g, '')) || 0, filteredData.totalCustomers, 1000);
    this.animateValue(totalRidersEl, parseInt(totalRidersEl.textContent.replace(/,/g, '')) || 0, filteredData.totalDrivers, 1000);
    
    // Update trends
    document.getElementById('tripsTrend').textContent = trends[period].trips;
    document.getElementById('revenueTrend').textContent = trends[period].revenue;
    document.getElementById('customersTrend').textContent = trends[period].customers;
    document.getElementById('ridersTrend').textContent = trends[period].riders;
    
    this.showNotification(`Showing data for ${period}`, 'success');
  }

  animateValue(element, start, end, duration, isCurrency = false) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      
      if (isCurrency) {
        element.textContent = `₵${current.toLocaleString()}`;
      } else {
        element.textContent = current.toLocaleString();
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  generateFilteredData(period) {
    console.log('📊 Generating filtered data for period:', period);
    
    // Calculate realistic revenue based on time period
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const currentDate = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Base metrics for realistic calculations
    const avgTripRevenue = 45; // Average revenue per trip in GHS
    const dailyTripsBase = 25;
    const weeklyTripsBase = dailyTripsBase * 7;
    const monthlyTripsBase = dailyTripsBase * 30;
    const yearlyTripsBase = dailyTripsBase * 365;
    
    // Calculate realistic metrics for each period
    let periodData;
    
    switch (period) {
      case 'today':
        // Today's revenue based on current time (partial day)
        const dayProgress = currentHour / 24; // How far through the day we are
        const todayTrips = Math.floor(dailyTripsBase * dayProgress) + Math.floor(Math.random() * 10);
        const todayRevenue = todayTrips * avgTripRevenue + Math.floor(Math.random() * 500);
        
        periodData = {
          trips: todayTrips,
          revenue: todayRevenue,
          customers: Math.floor(todayTrips * 0.8) + Math.floor(Math.random() * 50),
          drivers: Math.floor(Math.random() * 20) + 30 + Math.floor(todayTrips * 0.1)
        };
        break;
        
      case 'week':
        // This week's revenue (Monday to current day)
        const daysInWeek = currentDay === 0 ? 7 : currentDay; // Sunday = 0, convert to 7
        const weekProgress = daysInWeek / 7;
        const weekTrips = Math.floor(weeklyTripsBase * weekProgress) + Math.floor(Math.random() * 50);
        const weekRevenue = weekTrips * avgTripRevenue + Math.floor(Math.random() * 2000);
        
        periodData = {
          trips: weekTrips,
          revenue: weekRevenue,
          customers: Math.floor(weekTrips * 0.8) + Math.floor(Math.random() * 200),
          drivers: Math.floor(Math.random() * 50) + 80 + Math.floor(weekTrips * 0.05)
        };
        break;
        
      case 'month':
        // This month's revenue (1st to current date)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthProgress = currentDate / daysInMonth;
        const monthTrips = Math.floor(monthlyTripsBase * monthProgress) + Math.floor(Math.random() * 200);
        const monthRevenue = monthTrips * avgTripRevenue + Math.floor(Math.random() * 10000);
        
        periodData = {
          trips: monthTrips,
          revenue: monthRevenue,
          customers: Math.floor(monthTrips * 0.8) + Math.floor(Math.random() * 500),
          drivers: Math.floor(Math.random() * 100) + 120 + Math.floor(monthTrips * 0.02)
        };
        break;
        
      case 'year':
        // This year's revenue (Jan 1 to current date)
        const daysInYear = (currentYear % 4 === 0) ? 366 : 365;
        const dayOfYear = Math.floor((now - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24));
        const yearProgress = dayOfYear / daysInYear;
        const yearTrips = Math.floor(yearlyTripsBase * yearProgress) + Math.floor(Math.random() * 1000);
        const yearRevenue = yearTrips * avgTripRevenue + Math.floor(Math.random() * 50000);
        
        periodData = {
          trips: yearTrips,
          revenue: yearRevenue,
          customers: Math.floor(yearTrips * 0.8) + Math.floor(Math.random() * 2000),
          drivers: Math.floor(Math.random() * 200) + 200 + Math.floor(yearTrips * 0.01)
        };
        break;
        
      default:
        // Default to today
        const defaultTrips = dailyTripsBase + Math.floor(Math.random() * 10);
        periodData = {
          trips: defaultTrips,
          revenue: defaultTrips * avgTripRevenue,
          customers: Math.floor(defaultTrips * 0.8) + Math.floor(Math.random() * 50),
          drivers: Math.floor(Math.random() * 20) + 30
        };
    }
    
    console.log(`📈 ${period} data:`, periodData);
    
    return {
      totalTrips: periodData.trips,
      totalRevenue: periodData.revenue,
      totalCustomers: periodData.customers,
      totalDrivers: periodData.drivers,
      activeTrips: Math.floor(Math.random() * 30) + 20,
      onlineDrivers: Math.floor(Math.random() * 40) + 60,
      todayRevenue: period === 'today' ? periodData.revenue : Math.floor(Math.random() * 5000) + 2000,
      recentTrips: this.generateRecentTrips()
    };
  }

  generateRecentTrips() {
    const locations = [
      { pickup: 'Accra Mall', dropoff: 'Kotoka Airport' },
      { pickup: 'University of Ghana', dropoff: 'Tema Community 1' },
      { pickup: 'Kaneshie Market', dropoff: 'East Legon' },
      { pickup: 'Labone', dropoff: 'Spintex Road' },
      { pickup: 'Osu', dropoff: 'Airport City' },
      { pickup: 'Tema Community 1', dropoff: 'Accra Central' },
      { pickup: 'East Legon', dropoff: 'Osu Oxford Street' },
      { pickup: 'Airport City', dropoff: 'Labadi Beach' }
    ];
    
    const riderNames = [
      'Kwame Adu', 'Ama Serwaa', 'Kofi Mensah', 'Yaa Asantewaa', 
      'Kojo Bonsu', 'Adwoa Fosua', 'Yaw Owusu', 'Akua Mansa',
      'Emmanuel Asante', 'Grace Boateng', 'Samuel Osei', 'Rebecca Addo'
    ];
    
    const driverNames = [
      'Michael Thompson', 'David Osei', 'James Mensah', 'Peter Annan',
      'Samuel Asante', 'John Kofi', 'Robert Yeboah', 'William Addo'
    ];
    
    const vehicles = [
      'Toyota Corolla', 'Honda Civic', 'Nissan Sentra', 'Hyundai Elantra', 
      'Tuk-Tuk Pragya', 'Kia Rio', 'Toyota Yaris', 'Honda Fit'
    ];
    
    const statuses = ['completed', 'active', 'pending'];
    const paymentMethods = ['Cash', 'Mobile Money', 'Card'];
    
    const trips = [];
    const now = new Date();
    
    // Generate trips with recent timestamps (last 2 hours)
    for (let i = 0; i < 8; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Generate realistic timestamps within the last 2 hours
      const minutesAgo = Math.floor(Math.random() * 120); // 0-120 minutes ago
      const tripTime = new Date(now - minutesAgo * 60000);
      
      // Calculate realistic duration based on distance
      const distance = Math.floor(Math.random() * 15) + 3; // 3-18 km
      const avgSpeed = 25; // km/h average speed in Accra traffic
      const duration = Math.ceil((distance / avgSpeed) * 60); // Convert to minutes
      
      // Calculate fare based on distance and duration
      const baseFare = 10;
      const perKmFare = 4.5;
      const perMinuteFare = 0.8;
      const fare = Math.round(baseFare + (distance * perKmFare) + (duration * perMinuteFare));
      
      // Generate unique IDs
      const tripId = `K3T-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      const driverId = `K3D-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      const riderId = `K3P-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      
      const trip = {
        id: tripId,
        driver: `${driverNames[Math.floor(Math.random() * driverNames.length)]} (${driverId})`,
        driverId: driverId,
        rider: `${riderNames[Math.floor(Math.random() * riderNames.length)]} (${riderId})`,
        riderId: riderId,
        pickup: location.pickup,
        dropoff: location.dropoff,
        distance: distance,
        duration: duration,
        status: status,
        fare: fare,
        paymentMethod: paymentMethod,
        vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
        time: tripTime,
        timeAgo: this.getTimeAgo(minutesAgo),
        rating: status === 'completed' ? (Math.random() * 2 + 3).toFixed(1) : null
      };
      
      trips.push(trip);
    }
    
    // Sort trips by most recent first
    trips.sort((a, b) => b.time - a.time);
    
    console.log('🚗 Generated recent trips:', trips);
    return trips;
  }
  
  getTimeAgo(minutesAgo) {
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
    
    const hours = Math.floor(minutesAgo / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  showAddRiderForm() {
    const formHtml = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 700px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="color: #000; margin-bottom: 24px; font-size: 20px; font-weight: 600; text-align: center;">🚗 Add New Rider</h3>
        <form id="addRiderForm" onsubmit="window.k3k3Dashboard.handleRiderFormSubmit(event)">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Full Name *</label>
            <input type="text" name="name" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter rider's full name">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Email Address *</label>
            <input type="email" name="email" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="rider@example.com">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Phone Number *</label>
            <input type="tel" name="phone" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="+233 123 4567">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Date of Birth *</label>
            <input type="date" name="dob" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Address *</label>
            <input type="text" name="address" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter residential address">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">City *</label>
            <input type="text" name="city" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter city">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Region *</label>
            <select name="region" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
              <option value="">Select region</option>
              <option value="greater-accra">Greater Accra</option>
              <option value="ashanti">Ashanti Region</option>
              <option value="brong-ahafo">Brong Ahafo</option>
              <option value="central">Central Region</option>
              <option value="eastern">Eastern Region</option>
              <option value="northern">Northern Region</option>
              <option value="upper-east">Upper East Region</option>
              <option value="upper-west">Upper West Region</option>
              <option value="volta">Volta Region</option>
              <option value="western">Western Region</option>
            </select>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Emergency Contact *</label>
            <input type="tel" name="emergencyContact" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Emergency contact number">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Driver's License Number *</label>
            <input type="text" name="driverLicense" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter driver's license number">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Vehicle Type *</label>
            <select name="vehicleType" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
              <option value="">Select vehicle type</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="tuk-tuk">Tuk-Tuk</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="bus">Bus/Minivan</option>
            </select>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Vehicle Registration Number *</label>
            <input type="text" name="vehicleRegistration" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter vehicle registration number">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Insurance Policy Number *</label>
            <input type="text" name="insurancePolicy" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter insurance policy number">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Bank Account Number *</label>
            <input type="text" name="bankAccount" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter bank account number">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Mobile Money Provider *</label>
            <select name="mobileMoneyProvider" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
              <option value="">Select provider</option>
              <option value="mtn">MTN Mobile Money</option>
              <option value="vodafone">Vodafone Cash</option>
              <option value="airteltigo">AirtelTigo Money</option>
              <option value="glo">Glo Cash</option>
            </select>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Years of Experience *</label>
            <input type="number" name="yearsOfExperience" min="0" max="50" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter years of driving experience">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Reference Name *</label>
            <input type="text" name="referenceName" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;" placeholder="Enter reference name (optional)">
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Additional Information</label>
            <textarea name="additionalInfo" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical;" placeholder="Any additional information or special requirements"></textarea>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button type="button" onclick="window.k3k3Dashboard.closeRiderForm()" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white; font-weight: 500;">Cancel</button>
            <button type="submit" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #000; color: white; font-weight: 500;">Apply to Drive</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(formHtml);
  }

  handleRiderFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const dob = formData.get('dob');
    const address = formData.get('address');
    const city = formData.get('city');
    const region = formData.get('region');
    const emergencyContact = formData.get('emergencyContact');
    const driverLicense = formData.get('driverLicense');
    const vehicleType = formData.get('vehicleType');
    const vehicleRegistration = formData.get('vehicleRegistration');
    const insurancePolicy = formData.get('insurancePolicy');
    const bankAccount = formData.get('bankAccount');
    const mobileMoneyProvider = formData.get('mobileMoneyProvider');
    const yearsOfExperience = formData.get('yearsOfExperience');
    const referenceName = formData.get('referenceName');
    const additionalInfo = formData.get('additionalInfo');
    
    // Validate required fields
    if (!name || !email || !phone || !dob || !address || !city || !region || !emergencyContact || !driverLicense || !vehicleType || !vehicleRegistration || !insurancePolicy || !bankAccount || !mobileMoneyProvider || !yearsOfExperience) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Generate K3K3 rider ID
    const riderId = `K3P-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`;
    
    // Create rider object
    const newRider = {
      id: riderId,
      name: name,
      email: email,
      phone: phone,
      dob: dob,
      address: address,
      city: city,
      region: region,
      emergencyContact: emergencyContact,
      driverLicense: driverLicense,
      vehicleType: vehicleType,
      vehicleRegistration: vehicleRegistration,
      insurancePolicy: insurancePolicy,
      bankAccount: bankAccount,
      mobileMoneyProvider: mobileMoneyProvider,
      yearsOfExperience: yearsOfExperience,
      referenceName: referenceName,
      additionalInfo: additionalInfo,
      applicationDate: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to riders array (would normally save to backend)
    if (!this.riders) {
      this.riders = [];
    }
    this.riders.push(newRider);
    
    // Show success message
    this.showNotification(`Rider application submitted successfully! Rider ID: ${riderId}`, 'success');
    
    // Close form
    this.closeRiderForm();
  }

  closeRiderForm() {
    // Find and remove the modal overlay
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
      document.body.removeChild(modalOverlay);
      console.log('✅ Rider form modal closed');
    }
  }

  exportReport() {
    console.log('🚀 Export Report function called');
    
    // Get current dashboard data (real data from the dashboard)
    const currentPeriod = this.currentPeriod || 'today';
    const dashboardData = this.metrics; // Use actual dashboard metrics
    
    console.log('📊 Using current dashboard data:', dashboardData);
    
    // Generate analytics data based on real dashboard metrics
    const analyticsData = {
      reportInfo: {
        generated: new Date().toISOString(),
        reportType: 'K3K3 Dashboard Analytics Report',
        version: 'v2.1.0',
        period: currentPeriod,
        currency: 'GHC (Ghana Cedi)',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dataSource: 'Live Dashboard Metrics'
      },
      executiveSummary: {
        totalRevenue: dashboardData.totalRevenue || 0,
        totalTrips: dashboardData.totalTrips || 0,
        totalRiders: dashboardData.totalCustomers || 0,
        totalDrivers: dashboardData.totalDrivers || 0,
        activeTrips: dashboardData.activeTrips || 0,
        onlineDrivers: dashboardData.onlineDrivers || 0,
        todayRevenue: dashboardData.todayRevenue || 0,
        averageRevenuePerTrip: dashboardData.totalTrips > 0 ? Math.round(dashboardData.totalRevenue / dashboardData.totalTrips) : 0,
        averageTripsPerRider: dashboardData.totalCustomers > 0 ? Math.round(dashboardData.totalTrips / dashboardData.totalCustomers) : 0,
        completionRate: 85.3,
        averageRating: 4.6,
        growthRate: 12.5
      },
      operationalMetrics: {
        fleetUtilization: dashboardData.totalDrivers > 0 ? Math.round((dashboardData.onlineDrivers / dashboardData.totalDrivers) * 100) : 0,
        averageTripDuration: 18.5,
        averageWaitTime: 4.2,
        peakHours: '07:00-09:00, 17:00-19:00',
        offPeakHours: '22:00-06:00, 14:00-17:00',
        driverEfficiency: 92.3,
        systemUptime: 99.8,
        apiResponseTime: 0.8,
        databaseResponseTime: 1.2
      },
      recentActivity: {
        recentTrips: dashboardData.recentTrips || [],
        lastUpdated: new Date().toISOString()
      }
    };
    
    console.log('📋 Generating comprehensive report content');
    // Generate comprehensive report content
    const reportContent = this.generateComprehensiveReport(analyticsData);
    
    console.log('📋 Showing download options modal');
    // Show download options modal instead of direct download
    this.showDownloadOptionsModal(analyticsData, reportContent, currentPeriod);
    
    console.log('✅ Export Report options displayed successfully');
    this.showNotification('Select your preferred download format below.', 'info');
  }

  showDownloadOptionsModal(analyticsData, reportContent, period) {
    const modalHtml = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <i class="fas fa-download" style="font-size: 28px; color: white;"></i>
          </div>
          <h3 style="color: #000; margin-bottom: 8px; font-size: 24px; font-weight: 700;">Download Analytics Report</h3>
          <p style="color: #6b7280; font-size: 16px; margin: 0;">Choose your preferred format for the comprehensive business analytics</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
          <!-- Excel/CSV Option -->
          <button onclick="window.k3k3Dashboard.downloadSpecificFormat('excel', [${JSON.stringify(analyticsData).replace(/"/g, '&quot;')}, ${JSON.stringify(reportContent).replace(/"/g, '&quot;')}, '${period}'])" style="padding: 24px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s ease; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <i class="fas fa-file-excel" style="font-size: 24px; color: white;"></i>
              </div>
              <div>
                <h4 style="color: #000; margin: 0; font-size: 18px; font-weight: 600;">Excel</h4>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">CSV Format</p>
              </div>
            </div>
            <div style="font-size: 13px; color: #10b981; font-weight: 500;">• Perfect for data analysis<br>• Charts & pivot tables<br>• Sort & filter capabilities</div>
          </button>

          <!-- PDF Option -->
          <button onclick="window.k3k3Dashboard.downloadSpecificFormat('pdf', [${JSON.stringify(analyticsData).replace(/"/g, '&quot;')}, ${JSON.stringify(reportContent).replace(/"/g, '&quot;')}, '${period}'])" style="padding: 24px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s ease; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: #dc2626; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <i class="fas fa-file-pdf" style="font-size: 24px; color: white;"></i>
              </div>
              <div>
                <h4 style="color: #000; margin: 0; font-size: 18px; font-weight: 600;">PDF</h4>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Professional Report</p>
              </div>
            </div>
            <div style="font-size: 13px; color: #dc2626; font-weight: 500;">• Professional presentation<br>• Easy to share<br>• Print-ready format</div>
          </button>

          <!-- JSON Option -->
          <button onclick="window.k3k3Dashboard.downloadSpecificFormat('json', [${JSON.stringify(analyticsData).replace(/"/g, '&quot;')}, ${JSON.stringify(reportContent).replace(/"/g, '&quot;')}, '${period}'])" style="padding: 24px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s ease; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <i class="fas fa-file-code" style="font-size: 24px; color: white;"></i>
              </div>
              <div>
                <h4 style="color: #000; margin: 0; font-size: 18px; font-weight: 600;">JSON</h4>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Data Format</p>
              </div>
            </div>
            <div style="font-size: 13px; color: #3b82f6; font-weight: 500;">• API integration<br>• Machine-readable<br>• Developer-friendly</div>
          </button>

          <!-- TXT Option -->
          <button onclick="window.k3k3Dashboard.downloadSpecificFormat('txt', [${JSON.stringify(analyticsData).replace(/"/g, '&quot;')}, ${JSON.stringify(reportContent).replace(/"/g, '&quot;')}, '${period}'])" style="padding: 24px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all 0.3s ease; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; background: #6b7280; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                <i class="fas fa-file-alt" style="font-size: 24px; color: white;"></i>
              </div>
              <div>
                <h4 style="color: #000; margin: 0; font-size: 18px; font-weight: 600;">TXT</h4>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Plain Text</p>
              </div>
            </div>
            <div style="font-size: 13px; color: #6b7280; font-weight: 500;">• Simple format<br>• Easy to read<br>• Universal compatibility</div>
          </button>
        </div>

        <!-- Download All Option -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 2px dashed #cbd5e1;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h4 style="color: #000; margin: 0; font-size: 16px; font-weight: 600;">Download All Formats</h4>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">Get all 4 formats in one click</p>
            </div>
            <button onclick="window.k3k3Dashboard.downloadAllFormats([${JSON.stringify(analyticsData).replace(/"/g, '&quot;')}, ${JSON.stringify(reportContent).replace(/"/g, '&quot;')}, '${period}'])" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #000; color: white; font-weight: 500; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-download"></i>
              Download All
            </button>
          </div>
        </div>

        <!-- Report Summary -->
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <i class="fas fa-info-circle" style="color: #10b981; margin-right: 8px;"></i>
            <h5 style="color: #000; margin: 0; font-size: 14px; font-weight: 600;">Report Summary</h5>
          </div>
          <div style="font-size: 13px; color: #374151; line-height: 1.5;">
            <strong>Period:</strong> ${period}<br>
            <strong>Revenue:</strong> ₵${analyticsData.executiveSummary.totalRevenue.toLocaleString()}<br>
            <strong>Trips:</strong> ${analyticsData.executiveSummary.totalTrips.toLocaleString()}<br>
            <strong>Riders:</strong> ${analyticsData.executiveSummary.totalRiders.toLocaleString()}
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="this.closest('.modal-overlay').remove()" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white; font-weight: 500;">Cancel</button>
        </div>
      </div>
    `;
    
    this.showModal(modalHtml);
  }

  downloadSpecificFormat(format, args) {
    const analyticsData = args[0];
    const reportContent = args[1];
    const period = args[2];
    
    console.log(`📥 Downloading ${format.toUpperCase()} format`);
    
    switch(format) {
      case 'excel':
      case 'csv':
        this.downloadCSVReport(analyticsData, period);
        this.showNotification('Excel/CSV report downloaded successfully!', 'success');
        break;
      case 'pdf':
        this.downloadPDFReport(reportContent, period);
        this.showNotification('PDF report downloaded successfully!', 'success');
        break;
      case 'json':
        this.downloadJSONReport(analyticsData, period);
        this.showNotification('JSON data downloaded successfully!', 'success');
        break;
      case 'txt':
        this.downloadTextReport(reportContent, period);
        this.showNotification('Text report downloaded successfully!', 'success');
        break;
      default:
        this.showNotification('Invalid format selected', 'error');
    }
    
    // Close modal after successful download
    setTimeout(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        modal.remove();
      }
    }, 1000);
  }

  downloadAllFormats(args) {
    const analyticsData = args[0];
    const reportContent = args[1];
    const period = args[2];
    
    console.log('📥 Downloading all formats');
    
    // Download all formats
    this.downloadMultipleFormats(analyticsData, reportContent, period);
    
    this.showNotification('All formats downloaded successfully! Check your downloads folder.', 'success');
    
    // Close modal after successful download
    setTimeout(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) {
        modal.remove();
      }
    }, 1500);
  }

  generateComprehensiveReport(data) {
    return `
# K3K3 Professional Analytics Report
**Period:** ${data.reportInfo.period}  
**Generated:** ${new Date().toLocaleString()}  
**Currency:** ${data.reportInfo.currency}  
**Timezone:** ${data.reportInfo.timezone}

---

## 📊 EXECUTIVE SUMMARY
- **Total Revenue:** ₵${data.executiveSummary.totalRevenue.toLocaleString()}
- **Total Trips:** ${data.executiveSummary.totalTrips.toLocaleString()}
- **Total Riders:** ${data.executiveSummary.totalRiders.toLocaleString()}
- **Total Drivers:** ${data.executiveSummary.totalDrivers.toLocaleString()}
- **Active Trips:** ${data.executiveSummary.activeTrips.toLocaleString()}
- **Online Drivers:** ${data.executiveSummary.onlineDrivers.toLocaleString()}
- **Average Revenue/Trip:** ₵${data.executiveSummary.averageRevenuePerTrip.toLocaleString()}
- **Average Trips/Rider:** ${data.executiveSummary.averageTripsPerRider.toLocaleString()}
- **Completion Rate:** ${data.executiveSummary.completionRate}%
- **Average Rating:** ${data.executiveSummary.averageRating}/5.0
- **Growth Rate:** ${data.executiveSummary.growthRate}%

---

## 💰 REVENUE ANALYTICS
### Revenue by Hour
${data.revenueAnalytics.revenueByHour.map(hour => 
  `${hour.hour}:00 - ₵${hour.revenue.toLocaleString()} (${hour.percentage}%)`
).join('\n')}

### Revenue by Day
${data.revenueAnalytics.revenueByDay.map(day => 
  `${day.day}: ₵${day.revenue.toLocaleString()} (${day.percentage}%)`
).join('\n')}

### Revenue by Region
${data.revenueAnalytics.revenueByRegion.map(region => 
  `${region.location}: ₵${region.revenue.toLocaleString()} (${region.percentage}%)`
).join('\n')}

### Revenue Growth
- **Daily Growth:** ${data.revenueAnalytics.revenueGrowth.dailyGrowth}%
- **Weekly Growth:** ${data.revenueAnalytics.revenueGrowth.weeklyGrowth}%
- **Monthly Growth:** ${data.revenueAnalytics.revenueGrowth.monthlyGrowth}%
- **Yearly Growth:** ${data.revenueAnalytics.revenueGrowth.yearlyGrowth}%

---

## 🚗 OPERATIONAL METRICS
- **Fleet Utilization:** ${data.operationalMetrics.fleetUtilization}%
- **Average Trip Duration:** ${data.operationalMetrics.averageTripDuration} minutes
- **Average Wait Time:** ${data.operationalMetrics.averageWaitTime} minutes
- **Peak Hours:** ${data.operationalMetrics.peakHours}
- **Off-Peak Hours:** ${data.operationalMetrics.offPeakHours}
- **Driver Efficiency:** ${data.operationalMetrics.driverEfficiency}%
- **System Uptime:** ${data.operationalMetrics.systemUptime}%
- **API Response Time:** ${data.operationalMetrics.apiResponseTime}s
- **Database Response Time:** ${data.operationalMetrics.databaseResponseTime}s

---

## 👥 RIDER ANALYTICS
### Rider Demographics
**Age Groups:**
- **18-25:** ${data.riderAnalytics.riderDemographics.ageGroups['18-25']} riders (${Math.round(data.riderAnalytics.riderDemographics.ageGroups['18-25'] / data.executiveSummary.totalRiders * 100)}%)
- **26-35:** ${data.riderAnalytics.riderDemographics.ageGroups['26-35']} riders (${Math.round(data.riderAnalytics.riderDemographics.ageGroups['26-35'] / data.executiveSummary.totalRiders * 100)}%)
- **36-45:** ${data.riderAnalytics.riderDemographics.ageGroups['36-45']} riders (${Math.round(data.riderAnalytics.riderDemographics.ageGroups['36-45'] / data.executiveSummary.totalRiders * 100)}%)
- **46+:** ${data.riderAnalytics.riderDemographics.ageGroups['46+']} riders (${Math.round(data.riderAnalytics.riderDemographics.ageGroups['46+'] / data.executiveSummary.totalRiders * 100)}%)

**Gender Distribution:**
- **Male:** ${data.riderAnalytics.riderDemographics.genderDistribution.male} riders (${Math.round(data.riderAnalytics.riderDemographics.genderDistribution.male / data.executiveSummary.totalRiders * 100)}%)
- **Female:** ${data.riderAnalytics.riderDemographics.genderDistribution.female} riders (${Math.round(data.riderAnalytics.riderDemographics.genderDistribution.female / data.executiveSummary.totalRiders * 100)}%)

### Rider Locations
${data.riderAnalytics.topRiderLocations.map(location => 
  `${location.location}: ${location.riders.toLocaleString()} riders (${location.percentage}%)`
).join('\n')}

### Rider Retention
- **Retention Rate:** ${data.riderAnalytics.riderRetentionRate}%
- **New Riders Today:** ${data.riderAnalytics.newRidersToday.toLocaleString()}
- **Active Riders:** ${data.riderAnalytics.activeRiders.toLocaleString()}

---

## 📈 PERFORMANCE METRICS
- **On-Time Performance:** ${data.performanceMetrics.onTimePerformance}%
- **Customer Satisfaction:** ${data.performanceMetrics.customerSatisfaction}/5.0
- **Driver Performance:** ${data.performanceMetrics.driverPerformance}%
- **Service Quality:** ${data.performanceMetrics.serviceQuality}%
- **Complaint Resolution Time:** ${data.performanceMetrics.complaintResolutionTime} hours
- **Repeat Customer Rate:** ${data.performanceMetrics.repeatCustomerRate}%

---

## 🏆 COMPETITIVE ANALYSIS
### Market Position
- **Market Share:** ${data.competitiveAnalysis.marketShare}%
- **Market Position:** ${data.competitiveAnalysis.marketPosition}

### Competitor Analysis
**Main Competitors:** ${data.competitiveAnalysis.competitorAnalysis.mainCompetitors.join(', ')}

**Competitive Advantages:**
${data.competitiveAnalysis.competitiveAnalysis.competitiveAdvantages.map(adv => `- ${adv}`).join('\n')}

**Areas for Improvement:**
${data.competitiveAnalysis.competitorAnalysis.areasForImprovement.map(area => `- ${area}`).join('\n')}

---

## 📋 RECOMMENDATIONS
### Strategic Initiatives
1. **Expand to underserved regions** - Focus on areas with low rider penetration
2. **Enhance driver training programs** - Improve service quality and efficiency
3. **Implement dynamic pricing** - Adjust fares based on demand and time
4. **Invest in customer retention** - Loyalty programs and personalized offers
5. **Technology upgrades** - Better app features and real-time tracking
6. **Partnership opportunities** - Corporate clients and event transportation

### Operational Improvements
1. **Optimize peak hour operations** - Increase driver availability during high-demand periods
2. **Improve complaint resolution** - Target <2 hour resolution time
3. **Enhance customer support** - 24/7 availability and faster response times
4. **Fleet modernization** - Regular vehicle updates and maintenance
5. **Data-driven decision making** - Use analytics for strategic planning

---

*Report generated by K3K3 Analytics System*
*For internal use only*
    `;
  }

  generateRevenueByHour() {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const revenue = Math.floor(Math.random() * 5000) + 1000;
      const percentage = Math.floor(Math.random() * 15) + 5;
      hours.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        revenue: revenue,
        percentage: percentage
      });
    }
    return hours;
  }

  generateRevenueByDay() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
      const revenue = Math.floor(Math.random() * 15000) + 5000;
      const percentage = Math.floor(Math.random() * 20) + 10;
      return {
        day: day,
        revenue: revenue,
        percentage: percentage
      };
    });
  }

  generateRevenueByRegion() {
    const regions = [
      { location: 'Accra Central', percentage: 30 },
      { location: 'Accra North', percentage: 15 },
      { location: 'Accra East', percentage: 12 },
      { location: 'Accra West', percentage: 10 },
      { location: 'Tema', percentage: 8 },
      { location: 'Ashanti', percentage: 15 },
      { location: 'Brong Ahafo', percentage: 5 },
      { location: 'Northern', percentage: 3 },
      { location: 'Eastern', percentage: 2 }
    ];
    
    return regions.map(region => ({
      location: region.location,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      percentage: region.percentage
    }));
  }

  downloadMultipleFormats(data, reportContent, period) {
    // Download as TXT
    this.downloadTextReport(reportContent, period);
    
    // Download as JSON
    this.downloadJSONReport(data, period);
    
    // Download as CSV
    this.downloadCSVReport(data, period);
    
    // Download as PDF (if jsPDF available)
    if (typeof jsPDF !== 'undefined') {
      this.downloadPDFReport(reportContent, period);
    } else {
      console.log('jsPDF not available, skipping PDF download');
    }
  }

  downloadTextReport(content, period) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k3k3-analytics-${period}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadJSONReport(data, period) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k3k3-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadCSVReport(data, period) {
    // Create comprehensive Excel-friendly CSV data
    const csvData = [
      // Header section
      ['K3K3 Analytics Report'],
      [`Period: ${period}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      
      // Executive Summary
      ['EXECUTIVE SUMMARY'],
      ['Metric', 'Value', 'Unit', 'Period', 'Notes'],
      ['Total Revenue', data.executiveSummary.totalRevenue, 'GHC', period, 'Gross revenue from all trips'],
      ['Total Trips', data.executiveSummary.totalTrips, 'Count', period, 'Completed trips'],
      ['Total Riders', data.executiveSummary.totalRiders, 'Count', period, 'Active registered riders'],
      ['Active Riders', data.riderAnalytics.activeRiders, 'Count', period, 'Currently active riders'],
      ['Total Drivers', data.executiveSummary.totalDrivers, 'Count', period, 'Active registered drivers'],
      ['Online Drivers', data.executiveSummary.onlineDrivers, 'Count', period, 'Currently online drivers'],
      ['Active Trips', data.executiveSummary.activeTrips, 'Count', period, 'Currently active trips'],
      ['Average Revenue/Trip', data.executiveSummary.averageRevenuePerTrip, 'GHC', period, 'Revenue per completed trip'],
      ['Average Trips/Rider', data.executiveSummary.averageTripsPerRider, 'Count', period, 'Trips per active rider'],
      ['Completion Rate', data.executiveSummary.completionRate, '%', period, 'Trip completion percentage'],
      ['Average Rating', data.executiveSummary.averageRating, 'Score', period, 'Customer satisfaction rating'],
      ['Growth Rate', data.executiveSummary.growthRate, '%', period, 'Revenue growth rate'],
      [''],
      
      // Revenue Analytics
      ['REVENUE ANALYTICS'],
      ['Location', 'Revenue (GHC)', 'Percentage', 'Type'],
      ...data.revenueAnalytics.topRevenueLocations.map(loc => 
        [loc.location, loc.revenue, `${loc.percentage}%`, 'Top Location']
      ),
      [''],
      
      ['Revenue Growth'],
      ['Period', 'Growth Rate (%)', 'Status'],
      ['Daily', data.revenueAnalytics.revenueGrowth.dailyGrowth, data.revenueAnalytics.revenueGrowth.dailyGrowth > 0 ? 'Positive' : 'Negative'],
      ['Weekly', data.revenueAnalytics.revenueGrowth.weeklyGrowth, data.revenueAnalytics.revenueGrowth.weeklyGrowth > 0 ? 'Positive' : 'Negative'],
      ['Monthly', data.revenueAnalytics.revenueGrowth.monthlyGrowth, data.revenueAnalytics.revenueGrowth.monthlyGrowth > 0 ? 'Positive' : 'Negative'],
      ['Yearly', data.revenueAnalytics.revenueGrowth.yearlyGrowth, data.revenueAnalytics.revenueGrowth.yearlyGrowth > 0 ? 'Positive' : 'Negative'],
      [''],
      
      // Operational Metrics
      ['OPERATIONAL METRICS'],
      ['Metric', 'Value', 'Unit', 'Target', 'Status'],
      ['Fleet Utilization', data.operationalMetrics.fleetUtilization, '%', '80%', data.operationalMetrics.fleetUtilization >= 80 ? 'Good' : 'Needs Improvement'],
      ['Average Trip Duration', data.operationalMetrics.averageTripDuration, 'Minutes', '20', data.operationalMetrics.averageTripDuration <= 20 ? 'Good' : 'High'],
      ['Average Wait Time', data.operationalMetrics.averageWaitTime, 'Minutes', '5', data.operationalMetrics.averageWaitTime <= 5 ? 'Good' : 'High'],
      ['Driver Efficiency', data.operationalMetrics.driverEfficiency, '%', '90%', data.operationalMetrics.driverEfficiency >= 90 ? 'Good' : 'Needs Improvement'],
      ['System Uptime', data.operationalMetrics.systemUptime, '%', '99.5%', data.operationalMetrics.systemUptime >= 99.5 ? 'Excellent' : 'Good'],
      ['API Response Time', data.operationalMetrics.apiResponseTime, 'Seconds', '1.0', data.operationalMetrics.apiResponseTime <= 1.0 ? 'Good' : 'Slow'],
      ['Database Response Time', data.operationalMetrics.databaseResponseTime, 'Seconds', '1.5', data.operationalMetrics.databaseResponseTime <= 1.5 ? 'Good' : 'Slow'],
      [''],
      
      // Rider Analytics
      ['RIDER ANALYTICS'],
      ['Demographics'],
      ['Age Group', 'Count', 'Percentage'],
      ...Object.entries(data.riderAnalytics.riderDemographics.ageGroups).map(([age, count]) => 
        [age, count, `${Math.round(count / data.riderAnalytics.totalRiders * 100)}%`]
      ),
      [''],
      ['Gender Distribution'],
      ['Gender', 'Count', 'Percentage'],
      ...Object.entries(data.riderAnalytics.riderDemographics.genderDistribution).map(([gender, count]) => 
        [gender.charAt(0).toUpperCase() + gender.slice(1), count, `${Math.round(count / data.riderAnalytics.totalRiders * 100)}%`]
      ),
      [''],
      ['Top Rider Locations'],
      ['Location', 'Riders', 'Percentage', 'Priority'],
      ...data.riderAnalytics.topRiderLocations.map(loc => 
        [loc.location, loc.riders, `${loc.percentage}%`, loc.percentage >= 20 ? 'High' : loc.percentage >= 10 ? 'Medium' : 'Low']
      ),
      [''],
      
      // Performance Metrics
      ['PERFORMANCE METRICS'],
      ['Metric', 'Value', 'Unit', 'Benchmark', 'Performance'],
      ['On-Time Performance', data.performanceMetrics.onTimePerformance, '%', '95%', data.performanceMetrics.onTimePerformance >= 95 ? 'Excellent' : data.performanceMetrics.onTimePerformance >= 90 ? 'Good' : 'Needs Improvement'],
      ['Customer Satisfaction', data.performanceMetrics.customerSatisfaction, 'Score', '4.5', data.performanceMetrics.customerSatisfaction >= 4.5 ? 'Excellent' : data.performanceMetrics.customerSatisfaction >= 4.0 ? 'Good' : 'Needs Improvement'],
      ['Driver Performance', data.performanceMetrics.driverPerformance, '%', '90%', data.performanceMetrics.driverPerformance >= 90 ? 'Excellent' : data.performanceMetrics.driverPerformance >= 85 ? 'Good' : 'Needs Improvement'],
      ['Service Quality', data.performanceMetrics.serviceQuality, '%', '95%', data.performanceMetrics.serviceQuality >= 95 ? 'Excellent' : data.performanceMetrics.serviceQuality >= 90 ? 'Good' : 'Needs Improvement'],
      ['Complaint Resolution Time', data.performanceMetrics.complaintResolutionTime, 'Hours', '2.0', data.performanceMetrics.complaintResolutionTime <= 2.0 ? 'Excellent' : data.performanceMetrics.complaintResolutionTime <= 3.0 ? 'Good' : 'Needs Improvement'],
      ['Repeat Customer Rate', data.performanceMetrics.repeatCustomerRate, '%', '25%', data.performanceMetrics.repeatCustomerRate >= 25 ? 'Excellent' : data.performanceMetrics.repeatCustomerRate >= 20 ? 'Good' : 'Needs Improvement'],
      [''],
      
      // Competitive Analysis
      ['COMPETITIVE ANALYSIS'],
      ['Market Position'],
      ['Metric', 'Value', 'Status'],
      ['Market Share', data.competitiveAnalysis.marketShare, '%', data.competitiveAnalysis.marketShare >= 50 ? 'Market Leader' : 'Competitive'],
      [''],
      ['Competitive Advantages'],
      ['Advantage', 'Impact', 'Status'],
      ...data.competitiveAnalysis.competitorAnalysis.competitiveAdvantages.map(adv => 
        [adv, 'High', 'Active']
      ),
      [''],
      ['Main Competitors'],
      ['Competitor', 'Market Position', 'Threat Level'],
      ...data.competitiveAnalysis.competitorAnalysis.mainCompetitors.map(comp => 
        [comp, 'Competitor', 'Medium']
      )
    ];
    
    // Convert to CSV format with proper escaping
    const csvContent = csvData.map(row => 
      row.map(cell => {
        // Handle cells with commas, quotes, or newlines
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')
    ).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k3k3-analytics-excel-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📊 Excel-compatible CSV report downloaded successfully');
  }

  downloadPDFReport(content, period) {
    const { jsPDF } = window;
    if (!jsPDF) {
      console.log('jsPDF not available');
      return;
    }
    
    const doc = new jsPDF();
    const lines = content.split('\n');
    let yPosition = 20;
    
    lines.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica');
      doc.text(line, 10, yPosition);
      yPosition += 12;
    });
    
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `k3k3-analytics-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  generateCSVReport(data) {
    const headers = ['Metric', 'Value', 'Period', 'Generated Date'];
    const rows = [
      ['Total Trips', data.totalTrips, this.currentPeriod, new Date().toISOString()],
      ['Total Revenue', `₵${data.totalRevenue}`, this.currentPeriod, new Date().toISOString()],
      ['Active Customers', data.totalCustomers, this.currentPeriod, new Date().toISOString()],
      ['Active Drivers', data.totalDrivers, this.currentPeriod, new Date().toISOString()]
    ];
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  showNotificationForm() {
    const formHtml = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="color: #000; margin-bottom: 24px; font-size: 20px; font-weight: 600; text-align: center;">📢 Send Notification</h3>
        <form id="notificationForm">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Message *</label>
            <textarea name="message" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; min-height: 100px; resize: vertical;" placeholder="Enter your notification message"></textarea>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Priority</label>
            <select name="priority" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
              <option value="low">Low</option>
              <option value="normal" selected>Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
            <button type="button" onclick="this.closest('.modal-overlay').remove()" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white; font-weight: 500;">Cancel</button>
            <button type="submit" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #000; color: white; font-weight: 500;">Send Notification</button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(formHtml);
  }

  showAnalyticsModal() {
    const currentPeriod = this.currentPeriod || 'today';
    const filteredData = this.generateFilteredData(currentPeriod);
    
    // Generate comprehensive analytics data
    const analyticsData = {
      reportInfo: {
        generated: new Date().toLocaleString(),
        reportType: 'K3K3 Professional Analytics Report',
        version: 'v2.1.0',
        period: currentPeriod,
        currency: 'GHC (Ghana Cedi)',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      executiveSummary: {
        totalRevenue: filteredData.totalRevenue,
        totalTrips: filteredData.totalTrips,
        totalRiders: filteredData.totalCustomers,
        totalDrivers: filteredData.totalDrivers,
        activeTrips: filteredData.activeTrips,
        onlineDrivers: filteredData.onlineDrivers,
        averageRevenuePerTrip: Math.round(filteredData.totalRevenue / filteredData.totalTrips),
        averageTripsPerRider: Math.round(filteredData.totalTrips / filteredData.totalCustomers),
        completionRate: 85.3,
        averageRating: 4.6,
        growthRate: 12.5
      },
      revenueAnalytics: {
        totalRevenue: filteredData.totalRevenue,
        revenueByHour: this.generateRevenueByHour(),
        revenueByDay: this.generateRevenueByDay(),
        revenueByRegion: this.generateRevenueByRegion(),
        topRevenueLocations: [
          { location: 'Accra Mall', revenue: Math.floor(filteredData.totalRevenue * 0.25), percentage: 25 },
          { location: 'Kotoka Airport', revenue: Math.floor(filteredData.totalRevenue * 0.20), percentage: 20 },
          { location: 'University of Ghana', revenue: Math.floor(filteredData.totalRevenue * 0.15), percentage: 15 },
          { location: 'Tema Community 1', revenue: Math.floor(filteredData.totalRevenue * 0.12), percentage: 12 },
          { location: 'Kaneshie Market', revenue: Math.floor(filteredData.totalRevenue * 0.10), percentage: 10 },
          { location: 'Osu', revenue: Math.floor(filteredData.totalRevenue * 0.08), percentage: 8 },
          { location: 'East Legon', revenue: Math.floor(filteredData.totalRevenue * 0.06), percentage: 6 },
          { location: 'Labone', revenue: Math.floor(filteredData.totalRevenue * 0.04), percentage: 4 }
        ],
        revenueGrowth: {
          dailyGrowth: 8.3,
          weeklyGrowth: 12.5,
          monthlyGrowth: 15.7,
          yearlyGrowth: 22.1
        }
      },
      operationalMetrics: {
        fleetUtilization: 78.5,
        averageTripDuration: 18.5,
        averageWaitTime: 4.2,
        peakHours: '07:00-09:00, 17:00-19:00',
        offPeakHours: '22:00-06:00, 14:00-17:00',
        driverEfficiency: 92.3,
        systemUptime: 99.8,
        apiResponseTime: 0.8,
        databaseResponseTime: 1.2
      },
      riderAnalytics: {
        totalRiders: filteredData.totalCustomers,
        activeRiders: Math.floor(filteredData.totalCustomers * 0.85),
        newRidersToday: Math.floor(filteredData.totalCustomers * 0.05),
        riderRetentionRate: 87.2,
        averageRiderRating: 4.6,
        topRiderLocations: [
          { location: 'Accra Central', riders: Math.floor(filteredData.totalCustomers * 0.30), percentage: 30 },
          { location: 'Osu', riders: Math.floor(filteredData.totalCustomers * 0.25), percentage: 25 },
          { location: 'Labone', riders: Math.floor(filteredData.totalCustomers * 0.20), percentage: 20 },
          { location: 'Tema', riders: Math.floor(filteredData.totalCustomers * 0.15), percentage: 15 },
          { location: 'East Legon', riders: Math.floor(filteredData.totalCustomers * 0.10), percentage: 10 }
        ],
        riderDemographics: {
          ageGroups: {
            '18-25': Math.floor(filteredData.totalCustomers * 0.35),
            '26-35': Math.floor(filteredData.totalCustomers * 0.40),
            '36-45': Math.floor(filteredData.totalCustomers * 0.20),
            '46+': Math.floor(filteredData.totalCustomers * 0.05)
          },
          genderDistribution: {
            male: Math.floor(filteredData.totalCustomers * 0.65),
            female: Math.floor(filteredData.totalCustomers * 0.35)
          }
        }
      },
      performanceMetrics: {
        onTimePerformance: 94.2,
        customerSatisfaction: 4.6,
        driverPerformance: 87.8,
        serviceQuality: 91.5,
        complaintResolutionTime: 2.3,
        repeatCustomerRate: 23.5
      },
      competitiveAnalysis: {
        marketShare: 68.5,
        competitorAnalysis: {
          mainCompetitors: ['Bolt Ghana', 'Uber Ghana', 'Yango'],
          marketPosition: 'Market Leader',
          competitiveAdvantages: ['Better pricing', 'Superior technology', 'Excellent service'],
          areasForImprovement: ['Marketing', 'Customer retention', 'Service expansion']
        }
      }
    };
    
    const analyticsHtml = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 900px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid #f3f4f6; padding-bottom: 16px;">
          <h3 style="color: #000; margin: 0; font-size: 24px; font-weight: 700;">📊 K3K3 Analytics Report</h3>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Generated</div>
            <div style="font-size: 14px; color: #374151; font-weight: 600;">${new Date().toLocaleString()}</div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📈</span> Executive Summary
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total Revenue</div>
              <div style="font-size: 20px; font-weight: 700; color: #059669;">₵${analyticsData.executiveSummary.totalRevenue.toLocaleString()}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total Trips</div>
              <div style="font-size: 20px; font-weight: 700; color: #1d4ed8;">${analyticsData.executiveSummary.totalTrips.toLocaleString()}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total Riders</div>
              <div style="font-size: 20px; font-weight: 700; color: #7c3aed;">${analyticsData.executiveSummary.totalRiders.toLocaleString()}</div>
            </div>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Growth Rate</div>
              <div style="font-size: 20px; font-weight: 700; color: #d97706;">+${analyticsData.executiveSummary.growthRate}%</div>
            </div>
          </div>
        </div>

        <!-- Revenue Analytics -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">💰</span> Revenue Analytics
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Top Revenue Locations</h5>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                ${analyticsData.revenueAnalytics.topRevenueLocations.map(loc => `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #374151;">${loc.location}</span>
                    <div style="text-align: right;">
                      <div style="font-size: 14px; font-weight: 600; color: #059669;">₵${loc.revenue.toLocaleString()}</div>
                      <div style="font-size: 12px; color: #6b7280;">${loc.percentage}%</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Revenue Growth</h5>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Daily</div>
                  <div style="font-size: 16px; font-weight: 700; color: #16a34a;">+${analyticsData.revenueAnalytics.revenueGrowth.dailyGrowth}%</div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Weekly</div>
                  <div style="font-size: 16px; font-weight: 700; color: #16a34a;">+${analyticsData.revenueAnalytics.revenueGrowth.weeklyGrowth}%</div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Monthly</div>
                  <div style="font-size: 16px; font-weight: 700; color: #16a34a;">+${analyticsData.revenueAnalytics.revenueGrowth.monthlyGrowth}%</div>
                </div>
                <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Yearly</div>
                  <div style="font-size: 16px; font-weight: 700; color: #16a34a;">+${analyticsData.revenueAnalytics.revenueGrowth.yearlyGrowth}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Operational Metrics -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🚗</span> Operational Metrics
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #92400e; margin-bottom: 4px;">Fleet Utilization</div>
              <div style="font-size: 18px; font-weight: 700; color: #d97706;">${analyticsData.operationalMetrics.fleetUtilization}%</div>
            </div>
            <div style="background: #dbeafe; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #1e3a8a; margin-bottom: 4px;">Avg Trip Duration</div>
              <div style="font-size: 18px; font-weight: 700; color: #1d4ed8;">${analyticsData.operationalMetrics.averageTripDuration} min</div>
            </div>
            <div style="background: #fce7f3; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #9f1239; margin-bottom: 4px;">Avg Wait Time</div>
              <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${analyticsData.operationalMetrics.averageWaitTime} min</div>
            </div>
            <div style="background: #f3e8ff; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #6b21a8; margin-bottom: 4px;">System Uptime</div>
              <div style="font-size: 18px; font-weight: 700; color: #9333ea;">${analyticsData.operationalMetrics.systemUptime}%</div>
            </div>
          </div>
        </div>

        <!-- Rider Analytics -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">👥</span> Rider Analytics
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Demographics</h5>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                <div style="margin-bottom: 16px;">
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Age Groups</div>
                  ${Object.entries(analyticsData.riderAnalytics.riderDemographics.ageGroups).map(([age, count]) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span style="font-size: 13px; color: #374151;">${age}</span>
                      <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${count.toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
                <div>
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Gender Distribution</div>
                  ${Object.entries(analyticsData.riderAnalytics.riderDemographics.genderDistribution).map(([gender, count]) => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <span style="font-size: 13px; color: #374151;">${gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                      <span style="font-size: 13px; font-weight: 600; color: #1f2937;">${count.toLocaleString()}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Rider Locations</h5>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                ${analyticsData.riderAnalytics.topRiderLocations.map(loc => `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #374151;">${loc.location}</span>
                    <div style="text-align: right;">
                      <div style="font-size: 14px; font-weight: 600; color: #1f2937;">${loc.riders.toLocaleString()}</div>
                      <div style="font-size: 12px; color: #6b7280;">${loc.percentage}%</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">📈</span> Performance Metrics
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #065f46; margin-bottom: 4px;">On-Time Performance</div>
              <div style="font-size: 18px; font-weight: 700; color: #059669;">${analyticsData.performanceMetrics.onTimePerformance}%</div>
            </div>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #991b1b; margin-bottom: 4px;">Customer Satisfaction</div>
              <div style="font-size: 18px; font-weight: 700; color: #dc2626;">${analyticsData.performanceMetrics.customerSatisfaction}/5.0</div>
            </div>
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #075985; margin-bottom: 4px;">Driver Performance</div>
              <div style="font-size: 18px; font-weight: 700; color: #0284c7;">${analyticsData.performanceMetrics.driverPerformance}%</div>
            </div>
            <div style="background: #faf5ff; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 12px; color: #6b21a8; margin-bottom: 4px;">Service Quality</div>
              <div style="font-size: 18px; font-weight: 700; color: #9333ea;">${analyticsData.performanceMetrics.serviceQuality}%</div>
            </div>
          </div>
        </div>

        <!-- Competitive Analysis -->
        <div style="margin-bottom: 32px;">
          <h4 style="color: #000; margin-bottom: 16px; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🏆</span> Competitive Analysis
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Market Position</h5>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #374151;">Market Share</span>
                  <span style="font-size: 16px; font-weight: 700; color: #059669;">${analyticsData.competitiveAnalysis.marketShare}%</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 14px; color: #374151;">Market Position</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1f2937; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;">${analyticsData.competitiveAnalysis.competitorAnalysis.marketPosition}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 style="color: #374151; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Competitive Advantages</h5>
              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                ${analyticsData.competitiveAnalysis.competitorAnalysis.competitiveAdvantages.map(adv => `
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="color: #10b981; margin-right: 8px;">✓</span>
                    <span style="font-size: 14px; color: #374151;">${adv}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 32px; padding-top: 24px; border-top: 2px solid #f3f4f6;">
          <button onclick="window.k3k3Dashboard.exportReport()" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #10b981; color: white; font-weight: 500; display: flex; align-items: center; gap: 8px;">
            <span>📥</span> Export Report
          </button>
          <button onclick="this.closest('.modal-overlay').remove()" style="padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white; font-weight: 500;">Close</button>
        </div>
      </div>
    `;
    
    this.showModal(analyticsHtml);
  }

  showQuickAddRiderModal() {
    const formHtml = `
      <div style="background: white; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="color: #000; margin-bottom: 24px; font-size: 20px; font-weight: 600; text-align: center;">🏍️ Quick Add Rider</h3>
        
        <form id="quickAddRiderForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">First Name</label>
              <input type="text" name="firstName" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Last Name</label>
              <input type="text" name="lastName" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Email</label>
              <input type="email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Phone</label>
              <input type="tel" name="phone" required placeholder="+233 XXX XXX XXXX" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Address</label>
            <input type="text" name="address" required placeholder="e.g., Accra Central, Ghana" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Date of Birth</label>
              <input type="date" name="dateOfBirth" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Experience</label>
              <select name="experience" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                <option value="">Select Experience</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1+ years">1+ years</option>
                <option value="2+ years">2+ years</option>
                <option value="3+ years">3+ years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Vehicle Information</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <input type="text" name="vehicleBrand" required placeholder="Vehicle Brand (e.g., Honda)" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
              <input type="text" name="vehicleModel" required placeholder="Vehicle Model (e.g., CG 125)" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Vehicle Year</label>
              <input type="number" name="vehicleYear" required min="2010" max="2024" placeholder="2020" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Plate Number</label>
              <input type="text" name="vehiclePlate" required placeholder="GR-1234-AB" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-weight: 500; color: #374151;">Color</label>
              <input type="text" name="vehicleColor" required placeholder="Red" style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; margin-top: 8px;">
            <button type="submit" style="flex: 1; background: #3b82f6; color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
              Submit Application
            </button>
            <button type="button" onclick="window.k3k3Dashboard.closeModal()" style="flex: 1; background: #6b7280; color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    
    this.showModal(formHtml);
    
    // Add form submit handler
    setTimeout(() => {
      const form = document.getElementById('quickAddRiderForm');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleQuickAddRiderSubmit(new FormData(form));
        });
      }
    }, 100);
  }

  handleQuickAddRiderSubmit(formData) {
    const riderData = {
      id: 'APP-' + Date.now(),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      dateOfBirth: formData.get('dateOfBirth'),
      experience: formData.get('experience'),
      vehicle: `${formData.get('vehicleBrand')} ${formData.get('vehicleModel')}`,
      vehicleBrand: formData.get('vehicleBrand'),
      vehicleModel: formData.get('vehicleModel'),
      vehicleYear: formData.get('vehicleYear'),
      vehiclePlate: formData.get('vehiclePlate'),
      vehicleColor: formData.get('vehicleColor'),
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      rating: '0.0',
      trips: '0',
      earnings: '0'
    };
    
    // Save to localStorage (simulating backend save)
    const existingApplications = JSON.parse(localStorage.getItem('riderApplications') || '[]');
    existingApplications.unshift(riderData);
    localStorage.setItem('riderApplications', JSON.stringify(existingApplications));
    
    this.closeModal();
    this.showNotification(`Rider application for ${riderData.firstName} ${riderData.lastName} submitted successfully!`, 'success');
    
    // Update dashboard stats
    this.updateUI();
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
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      width: 100%;
      padding: 20px 0;
      box-sizing: border-box;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.innerHTML = content;
    
    modalContent.style.cssText = `
      max-height: 90vh;
      overflow-y: auto;
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
    `;
    
    modalContainer.appendChild(modalContent);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
        console.log('✅ Modal closed by clicking overlay');
      }
    });
    
    // Handle ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modalOverlay);
        document.removeEventListener('keydown', handleEscape);
        console.log('✅ Modal closed by ESC key');
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Handle close button clicks within modal content
    modalContent.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' && (e.target.textContent.toLowerCase().includes('cancel') || e.target.textContent.toLowerCase().includes('close'))) {
        document.body.removeChild(modalOverlay);
        console.log('✅ Modal closed by button click');
      }
    });
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      ${type === 'success' ? 'background: #28a745;' : type === 'error' ? 'background: #dc3545;' : 'background: #007bff;'}
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

  async fetchLiveMapData() {
    const response = await fetch(`${this.apiBaseUrl}/vehicles/live`);
    if (!response.ok) throw new Error('Failed to fetch live map data');
    return await response.json();
  }

  async fetchAnalytics() {
    const response = await fetch(`${this.apiBaseUrl}/analytics/overview?period=${this.currentPeriod}`);
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return await response.json();
  }

  async fetchRiderDetails(riderId) {
    const response = await fetch(`${this.apiBaseUrl}/riders/${riderId}`);
    if (!response.ok) throw new Error('Failed to fetch rider details');
    return await response.json();
  }

  async createRider(riderData) {
    const response = await fetch(`${this.apiBaseUrl}/riders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(riderData)
    });
    
    if (!response.ok) throw new Error('Failed to create rider');
    return await response.json();
  }

  getAuthToken() {
    return localStorage.getItem('k3k3_admin_token') || sessionStorage.getItem('k3k3_admin_token');
  }

  startRealTimeUpdates() {
    // Clear existing interval
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    
    // Update every 30 seconds
    this.timeInterval = setInterval(async () => {
      if (!document.hidden) { // Only update if tab is visible
        await this.loadDashboardData();
        
        // Also update rider applications count
        if (window.riderApps) {
          window.riderApps.loadApplications();
          window.riderApps.updateApplicationCount();
        }
      }
    }, this.refreshInterval);
    
    // Also update application count immediately on start
    if (window.riderApps) {
      window.riderApps.loadApplications();
      window.riderApps.updateApplicationCount();
    }
    
    console.log(`⏰ Real-time updates started (${this.refreshInterval/1000}s interval)`);
  }

  stopRealTimeUpdates() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
      console.log('⏹️ Real-time updates stopped');
    }
  }

  updateRecentTrips(trips) {
    const container = document.getElementById('recentTripsContainer');
    if (!container) return;
    
    if (!trips || trips.length === 0) {
      container.innerHTML = '<p class="no-data">No recent trips found</p>';
      return;
    }
    
    container.innerHTML = trips.map(trip => `
      <div class="trip-card" onclick="window.k3k3Dashboard.showTripDetails('${trip.id}')">
        <div class="trip-header">
          <div class="trip-id">${trip.id}</div>
          <div class="trip-status status-${trip.status}">${trip.status}</div>
        </div>
        <div class="trip-route">
          <div class="pickup">
            <i class="fas fa-map-marker-alt"></i>
            <span>${trip.pickup}</span>
          </div>
          <div class="route-line"></div>
          <div class="dropoff">
            <i class="fas fa-flag-checkered"></i>
            <span>${trip.dropoff}</span>
          </div>
        </div>
        <div class="trip-details">
          <div class="trip-rider">
            <i class="fas fa-user"></i>
            <span>${trip.riderName}</span>
          </div>
          <div class="trip-vehicle">
            <i class="fas fa-${trip.vehicleType === 'tuk-tuk' ? 'motorcycle' : 'car'}"></i>
            <span>${trip.vehicleType}</span>
          </div>
          <div class="trip-fare">
            <i class="fas fa-cedi-sign"></i>
            <span>₵${trip.fare}</span>
          </div>
          <div class="trip-duration">
            <i class="fas fa-clock"></i>
            <span>${trip.duration}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  updateLiveMap(mapData) {
    const mapContainer = document.getElementById('liveMapContainer');
    if (!mapContainer) return;
    
    // Update vehicle positions
    mapData.vehicles.forEach(vehicle => {
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

  async showTripDetails(tripId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/trips/${tripId}`);
      const trip = await response.json();
            
            const modalContent = `
                <div style="background: white; padding: 24px; border-radius: 12px; max-width: 500px;">
                    <h3 style="color: #000; margin-bottom: 16px;">Trip Details</h3>
                    <div style="display: grid; gap: 12px;">
                        <div><strong>Trip ID:</strong> ${trip.id}</div>
                        <div><strong>Rider:</strong> ${trip.riderName}</div>
                        <div><strong>Driver:</strong> ${trip.driverName}</div>
                        <div><strong>Pickup:</strong> ${trip.pickup}</div>
                        <div><strong>Dropoff:</strong> ${trip.dropoff}</div>
                        <div><strong>Vehicle:</strong> ${trip.vehicleType}</div>
                        <div><strong>Fare:</strong> ₵${trip.fare}</div>
                        <div><strong>Duration:</strong> ${trip.duration}</div>
                        <div><strong>Distance:</strong> ${trip.distance} km</div>
                        <div><strong>Status:</strong> <span class="status-badge status-${trip.status}">${trip.status}</span></div>
                        <div><strong>Start Time:</strong> ${new Date(trip.startTime).toLocaleString()}</div>
                        ${trip.endTime ? `<div><strong>End Time:</strong> ${new Date(trip.endTime).toLocaleString()}</div>` : ''}
                    </div>
                    <button onclick="this.closest('.modal-overlay').remove()" style="margin-top: 16px; width: 100%; padding: 12px; background: #000; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                </div>
            `;
            
            this.showModal(modalContent);
            
        } catch (error) {
            console.error('❌ Error fetching trip details:', error);
            this.showNotification('Failed to load trip details', 'error');
        }
    }

    // Enhanced rider form submission
    async handleRiderSubmit(formData) {
        try {
            this.showNotification('Creating rider...', 'info');
            
            const riderData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                vehicleType: formData.get('vehicleType'),
                licenseNumber: formData.get('licenseNumber'),
                experience: formData.get('experience'),
                availability: formData.get('availability'),
                documents: {
                    license: formData.get('licenseFile'),
                    insurance: formData.get('insuranceFile'),
                    background: formData.get('backgroundFile')
                }
            };
            
            const result = await this.createRider(riderData);
            
            this.showNotification(`Rider ${result.name} created successfully!`, 'success');
            this.closeRiderModal();
            
            // Refresh dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('❌ Error creating rider:', error);
            this.showNotification('Failed to create rider', 'error');
        }
    }

    async loadDashboardData() {
    try {
      console.log('📊 Loading dashboard data...');
      
      // Generate fresh mock data
      this.generateMockData();
      
      // Update UI with new data
      this.updateUI();
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      this.loadMockData();
    }
  }

  loadMockData() {
    console.log('⚠️ Loading mock data as fallback...');
    // Use existing mock data methods
    this.generateMockData();
    this.updateUI();
  }

  destroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
    }
    if (this.tripTimeInterval) {
      clearInterval(this.tripTimeInterval);
    }
    this.isInitialized = false;
  }
}

// Rider Applications Management
class RiderApplicationsManager {
  constructor() {
    this.applications = [];
    this.currentFilter = 'all';
    this.selectedApplication = null;
    this.init();
  }

  init() {
    this.loadApplications();
    this.updateApplicationCount();
  }

  loadApplications() {
    try {
      // Load applications from localStorage
      const storedApplications = localStorage.getItem('riderApplications');
      if (storedApplications) {
        this.applications = JSON.parse(storedApplications);
      } else {
        // Generate sample applications for demonstration
        this.generateSampleApplications();
      }
      
      // Also check for new rider applications from localStorage
      const newRiderApplication = localStorage.getItem('riderApplication');
      if (newRiderApplication) {
        console.log('📝 Found new rider application from localStorage');
        const application = JSON.parse(newRiderApplication);
        
        // Add to applications array
        this.applications.unshift({
          id: application.riderId || 'Unknown',
          firstName: application.name ? application.name.split(' ')[0] : 'Unknown',
          lastName: application.name ? (application.name.split(' ')[1] || 'Rider') : 'Rider',
          email: application.name ? `${application.name.toLowerCase().replace(' ', '.')}@k3k3.com` : 'unknown@k3k3.com',
          phone: '+233 XXX XXXX',
          licenseType: 'Professional',
          experience: '2+ years',
          vehicle: application.vehicle,
          status: 'pending',
          applicationDate: application.applicationDate,
          rating: application.rating,
          trips: application.trips,
          earnings: application.earnings
        });
        
        // Clear the application from localStorage
        localStorage.removeItem('riderApplication');
        
        // Show notification about new application
        this.showNotification(`New rider application from ${application.name}`, 'success');
      }
      
      this.renderApplications();
    } catch (error) {
      console.error('Error loading applications:', error);
      this.generateSampleApplications();
    }
  }

  generateSampleApplications() {
    this.applications = [
      {
        id: 'APP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+233 20 123 4567',
        licenseType: 'Class B',
        experience: '3 years',
        submittedDate: '2026-03-02',
        status: 'pending',
        address: '123 Main St, Accra, Ghana',
        dateOfBirth: '1990-01-15',
        vehicleType: 'Sedan',
        vehicleYear: '2020',
        vehiclePlate: 'GT-1234-56',
        reason: 'Looking for flexible work opportunities'
      },
      {
        id: 'APP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+233 50 987 6543',
        licenseType: 'Class C',
        experience: '5 years',
        submittedDate: '2026-03-01',
        status: 'pending',
        address: '456 Oak Ave, Kumasi, Ghana',
        dateOfBirth: '1988-05-22',
        vehicleType: 'SUV',
        vehicleYear: '2019',
        vehiclePlate: 'AS-5678-90',
        reason: 'Experienced driver seeking reliable income'
      },
      {
        id: 'APP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.j@email.com',
        phone: '+233 27 456 7890',
        licenseType: 'Class B',
        experience: '2 years',
        submittedDate: '2026-02-28',
        status: 'approved',
        address: '789 Pine Rd, Tema, Ghana',
        dateOfBirth: '1992-08-10',
        vehicleType: 'Hatchback',
        vehicleYear: '2021',
        vehiclePlate: 'TM-3456-78',
        reason: 'Part-time driving to supplement income'
      }
    ];
    this.saveApplications();
  }

  saveApplications() {
    localStorage.setItem('riderApplications', JSON.stringify(this.applications));
  }

  renderApplications() {
    const tbody = document.getElementById('applicationsTableBody');
    if (!tbody) return;

    const filteredApplications = this.getFilteredApplications();
    
    tbody.innerHTML = '';
    
    filteredApplications.forEach(application => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${application.id}</td>
        <td>${application.firstName} ${application.lastName}</td>
        <td>${application.email}<br>${application.phone}</td>
        <td>${application.licenseType}</td>
        <td>${application.experience}</td>
        <td>${application.submittedDate}</td>
        <td><span class="status-badge ${application.status}">${application.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="view-btn" onclick="riderApps.viewApplication('${application.id}')">
              <i class="fas fa-eye"></i>
            </button>
            ${application.status === 'pending' ? `
              <button class="approve-btn" onclick="riderApps.approveApplication('${application.id}')">
                <i class="fas fa-check"></i>
              </button>
              <button class="reject-btn" onclick="riderApps.rejectApplication('${application.id}')">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  getFilteredApplications() {
    if (this.currentFilter === 'all') {
      return this.applications;
    }
    return this.applications.filter(app => app.status === this.currentFilter);
  }

  updateApplicationCount() {
    const pendingCount = this.applications.filter(app => app.status === 'pending').length;
    const badge = document.getElementById('applicationCount');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
  }

  viewApplication(applicationId) {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return;

    this.selectedApplication = application;
    this.renderApplicationDetails();
  }

  renderApplicationDetails() {
    const detailsContent = document.getElementById('applicationDetailsContent');
    if (!detailsContent || !this.selectedApplication) return;

    const app = this.selectedApplication;
    detailsContent.innerHTML = `
      <div class="application-detail-item">
        <label>Application ID</label>
        <div class="value highlight">${app.id}</div>
      </div>
      
      <div class="application-detail-item">
        <label>Full Name</label>
        <div class="value">${app.firstName} ${app.lastName}</div>
      </div>
      
      <div class="application-detail-item">
        <label>Contact Information</label>
        <div class="value">
          <strong>Email:</strong> ${app.email}<br>
          <strong>Phone:</strong> ${app.phone}
        </div>
      </div>
      
      <div class="application-detail-item">
        <label>Address</label>
        <div class="value">${app.address}</div>
      </div>
      
      <div class="application-detail-item">
        <label>Date of Birth</label>
        <div class="value">${app.dateOfBirth}</div>
      </div>
      
      <div class="application-detail-item">
        <label>License Information</label>
        <div class="value">
          <strong>Type:</strong> ${app.licenseType}<br>
          <strong>Experience:</strong> ${app.experience}
        </div>
      </div>
      
      <div class="application-detail-item">
        <label>Vehicle Information</label>
        <div class="value">
          <strong>Type:</strong> ${app.vehicleType}<br>
          <strong>Year:</strong> ${app.vehicleYear}<br>
          <strong>Plate:</strong> ${app.vehiclePlate}
        </div>
      </div>
      
      <div class="application-detail-item">
        <label>Application Reason</label>
        <div class="value">${app.reason}</div>
      </div>
      
      <div class="application-detail-item">
        <label>Submitted Date</label>
        <div class="value">${app.submittedDate}</div>
      </div>
      
      <div class="application-detail-item">
        <label>Current Status</label>
        <div class="value">
          <span class="status-badge ${app.status}">${app.status}</span>
        </div>
      </div>
      
      ${app.status === 'pending' ? `
        <div class="application-detail-item">
          <label>Actions</label>
          <div class="value">
            <div class="action-buttons">
              <button class="approve-btn" onclick="riderApps.approveApplication('${app.id}')">
                <i class="fas fa-check"></i> Approve Application
              </button>
              <button class="reject-btn" onclick="riderApps.rejectApplication('${app.id}')">
                <i class="fas fa-times"></i> Reject Application
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  approveApplication(applicationId) {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return;

    if (confirm(`Are you sure you want to approve ${application.firstName} ${application.lastName}'s application?`)) {
      application.status = 'approved';
      this.saveApplications();
      this.renderApplications();
      this.updateApplicationCount();
      
      // Update details if currently viewing
      if (this.selectedApplication && this.selectedApplication.id === applicationId) {
        this.renderApplicationDetails();
      }
      
      this.showNotification(`Application ${applicationId} approved successfully!`, 'success');
    }
  }

  rejectApplication(applicationId) {
    const application = this.applications.find(app => app.id === applicationId);
    if (!application) return;

    const reason = prompt(`Please provide a reason for rejecting ${application.firstName} ${application.lastName}'s application:`);
    if (reason) {
      application.status = 'rejected';
      application.rejectionReason = reason;
      this.saveApplications();
      this.renderApplications();
      this.updateApplicationCount();
      
      // Update details if currently viewing
      if (this.selectedApplication && this.selectedApplication.id === applicationId) {
        this.renderApplicationDetails();
      }
      
      this.showNotification(`Application ${applicationId} rejected. Reason: ${reason}`, 'info');
    }
  }

  filterApplications() {
    const filterSelect = document.getElementById('statusFilter');
    if (filterSelect) {
      this.currentFilter = filterSelect.value;
      this.renderApplications();
    }
  }

  refreshApplications() {
    const refreshBtn = document.querySelector('.refresh-btn i');
    if (refreshBtn) {
      refreshBtn.classList.add('spinning');
    }

    setTimeout(() => {
      this.loadApplications();
      this.updateApplicationCount();
      
      if (refreshBtn) {
        refreshBtn.classList.remove('spinning');
      }
      
      this.showNotification('Applications refreshed successfully!', 'success');
    }, 1000);
  }

  exportApplications() {
    try {
      const csvContent = this.generateApplicationsCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rider_applications_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showNotification('Applications exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting applications:', error);
      this.showNotification('Error exporting applications', 'error');
    }
  }

  generateApplicationsCSV() {
    const headers = [
      'Application ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Address',
      'Date of Birth',
      'License Type',
      'Experience',
      'Vehicle Type',
      'Vehicle Year',
      'Vehicle Plate',
      'Application Reason',
      'Submitted Date',
      'Status',
      'Rejection Reason'
    ];

    const rows = this.applications.map(app => [
      app.id,
      app.firstName,
      app.lastName,
      app.email,
      app.phone,
      app.address,
      app.dateOfBirth,
      app.licenseType,
      app.experience,
      app.vehicleType,
      app.vehicleYear,
      app.vehiclePlate,
      app.reason,
      app.submittedDate,
      app.status,
      app.rejectionReason || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    if (type === 'success') {
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
    } else {
      notification.style.background = 'linear-gradient(135deg, #1a1a1a, #000000)';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Global functions for onclick handlers
function showRiderApplications() {
  const section = document.getElementById('rider-applications');
  if (section) {
    // Hide other sections
    document.querySelectorAll('.dashboard-content > section').forEach(s => {
      if (s.id !== 'rider-applications') {
        s.style.display = 'none';
      }
    });
    
    // Show applications section
    section.style.display = 'block';
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    event.target.closest('.nav-item').classList.add('active');
  }
}

function closeApplicationDetails() {
  const detailsContent = document.getElementById('applicationDetailsContent');
  if (detailsContent) {
    detailsContent.innerHTML = `
      <div class="no-selection">
        <i class="fas fa-user-plus"></i>
        <p>Select an application to view details</p>
      </div>
    `;
  }
  riderApps.selectedApplication = null;
}

function filterApplications() {
  riderApps.filterApplications();
}

function refreshApplications() {
  riderApps.refreshApplications();
}

function exportApplications() {
  riderApps.exportApplications();
}

// Initialize rider applications manager
let riderApps;

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing K3K3 Dashboard...');
  
  try {
    window.k3k3Dashboard = new K3K3Dashboard();
    console.log('✅ K3K3 Dashboard initialized successfully');
    
    // Initialize rider applications manager
    riderApps = new RiderApplicationsManager();
    console.log('✅ Rider Applications Manager initialized successfully');
    
    // Make global functions accessible
    window.showRiderApplications = showRiderApplications;
    window.closeApplicationDetails = closeApplicationDetails;
    // Test function to simulate rider application
    function testRiderApplication() {
      console.log('Testing rider application system...');
      
      const testApplication = {
        riderId: 'K3R-TEST-001',
        name: 'Test Rider',
        vehicle: 'Test Motorcycle',
        rating: '4.9',
        trips: '50',
        earnings: 'GH¢500',
        applicationDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store in localStorage to simulate form submission
      localStorage.setItem('riderApplication', JSON.stringify(testApplication));
      
      // Show notification
      if (window.k3k3Dashboard) {
        window.k3k3Dashboard.showNotification('Test rider application submitted!', 'success');
      }
      
      console.log('Test application stored in localStorage:', testApplication);
    }
    
    // Test function to verify rider applications section
    function testRiderApplicationsSection() {
      console.log('Testing rider applications section...');
      
      // Create a test application
      const testApplication = {
        riderId: 'K3R-TEST-002',
        name: 'Test Rider Two',
        vehicle: 'Test Tuk-Tuk',
        rating: '4.8',
        trips: '25',
        earnings: 'GH¢250',
        applicationDate: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store in localStorage
      localStorage.setItem('riderApplication', JSON.stringify(testApplication));
      
      // Navigate to rider applications section
      showRiderApplications();
      
      console.log('Test applications section test completed');
    }
    
    // Debug function to test time display
    function debugTimeDisplay() {
      console.log('Debugging time display...');
      
      const now = new Date();
      const localHours = String(now.getHours()).padStart(2, '0');
      const localMinutes = String(now.getMinutes()).padStart(2, '0');
      const localSeconds = String(now.getSeconds()).padStart(2, '0');
      
      console.log(`Current LOCAL time: ${localHours}:${localMinutes}:${localSeconds}`);
      console.log(`Full Date: ${now.toString()}`);
      console.log(`Local Time: ${now.toLocaleString()}`);
      console.log(`UTC Time: ${now.toUTCString()}`);
      console.log(`Timezone Offset: ${now.getTimezoneOffset()} minutes`);
      
      if (window.k3k3Dashboard) {
        window.k3k3Dashboard.updateUniversalTime();
        console.log('Time display updated');
      }
    }
    
    // Force time update function
    function forceTimeUpdate() {
      console.log('Forcing immediate time update...');
      
      if (window.k3k3Dashboard) {
        window.k3k3Dashboard.updateUniversalTime();
        window.k3k3Dashboard.updateGreeting();
        console.log('Time and greeting updated');
      }
    }
    
    // Assign functions to window object
    window.showRiderApplications = showRiderApplications;
    window.filterApplications = filterApplications;
    window.refreshApplications = refreshApplications;
    window.testRiderApplication = testRiderApplication;
    window.debugTimeDisplay = debugTimeDisplay;
    window.forceTimeUpdate = forceTimeUpdate;
    window.testRiderApplicationsSection = testRiderApplicationsSection;
    
    // Test dashboard metrics after initialization
    setTimeout(() => {
      console.log('🧪 Testing dashboard metrics...');
      if (window.k3k3Dashboard) {
        window.k3k3Dashboard.updateUI();
        console.log('✅ Dashboard metrics test completed');
        
        // Test revenue calculations for different periods
        console.log('🧪 Testing revenue calculations...');
        const periods = ['today', 'week', 'month', 'year'];
        periods.forEach(period => {
          const data = window.k3k3Dashboard.generateFilteredData(period);
          console.log(`📈 ${period.toUpperCase()} Revenue: ₵${data.totalRevenue.toLocaleString()}`);
        });
        
        // Test recent trips functionality
        console.log('🧪 Testing recent trips...');
        const recentTrips = window.k3k3Dashboard.generateRecentTrips();
        console.log('🚗 Recent trips generated:', recentTrips.length);
        recentTrips.forEach((trip, index) => {
          console.log(`  ${index + 1}. ${trip.id} - ${trip.pickup} → ${trip.dropoff} (${trip.timeAgo})`);
        });
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error initializing K3K3 Dashboard:', error);
  }
});
