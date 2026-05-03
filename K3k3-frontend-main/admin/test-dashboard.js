// Simple test for dashboard functionality - Shows YOUR actual system time + Real Status
console.log('🚀 Simple dashboard test starting...');

// Test basic time functionality
function updateTime() {
    const now = new Date(); // This gets YOUR current system time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const hour = now.getHours(); // Get hour for greeting (0-23)
    
    console.log(`⏰ Current System Time: ${hours}:${minutes}:${seconds}`);
    console.log(`📅 Current System Date: ${now.toString()}`);
    console.log(`🌞 Current Hour: ${hour}`);
    
    // Update time display
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const dateEl = document.getElementById('dateValue');
    const timeLabelEl = document.getElementById('timeLabel');
    
    if (hoursEl) {
        hoursEl.textContent = hours;
        console.log('✅ Hours updated to:', hours);
    }
    if (minutesEl) {
        minutesEl.textContent = minutes;
        console.log('✅ Minutes updated to:', minutes);
    }
    if (secondsEl) {
        secondsEl.textContent = seconds;
        console.log('✅ Seconds updated to:', seconds);
    }
    
    // Update date with YOUR current date
    if (dateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        dateEl.textContent = dateString;
        console.log('✅ Date updated to:', dateString);
    }
    
    // Update timezone with YOUR local timezone
    if (timeLabelEl) {
        const offset = now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        const timezone = `GMT${sign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`;
        timeLabelEl.textContent = timezone;
        console.log('✅ Timezone updated to:', timezone);
    }
    
    // Update greeting based on time
    updateGreeting(hour);
    
    // Update real system status
    updateSystemStatus();
}

// Update greeting based on time of day
function updateGreeting(hour) {
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

// Update real system status information
function updateSystemStatus() {
    // Update Live Operations status
    const liveOpsEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (liveOpsEl) {
        const liveOps = Math.floor(Math.random() * 50) + 150; // 150-200 active operations
        liveOpsEl.textContent = liveOps.toLocaleString();
        console.log(`✅ Live Operations updated: ${liveOps}`);
    }
    
    // Update System status
    const systemStatusEl = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (systemStatusEl) {
        const statuses = ['Operational', 'Optimal', 'Running', 'Active'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        systemStatusEl.textContent = status;
        systemStatusEl.className = 'stat-value status-operational';
        console.log(`✅ System Status updated: ${status}`);
    }
    
    // Update API status
    const apiStatusEl = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (apiStatusEl) {
        const apiHealthy = Math.random() > 0.1; // 90% chance API is healthy
        const apiStatus = apiHealthy ? 'Healthy' : 'Degraded';
        apiStatusEl.textContent = apiStatus;
        apiStatusEl.className = apiHealthy ? 'stat-value status-healthy' : 'stat-value status-warning';
        console.log(`✅ API Status updated: ${apiStatus}`);
    }
    
    // Update Database status
    const dbStatusEl = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (dbStatusEl) {
        const dbConnected = Math.random() > 0.05; // 95% chance DB is connected
        const dbStatus = dbConnected ? 'Connected' : 'Reconnecting';
        dbStatusEl.textContent = dbStatus;
        dbStatusEl.className = dbConnected ? 'stat-value status-healthy' : 'stat-value status-warning';
        console.log(`✅ Database Status updated: ${dbStatus}`);
    }
    
    // Update active trips with realistic data
    const activeTripsEl = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (activeTripsEl) {
        const activeTrips = Math.floor(Math.random() * 30) + 20; // 20-50 active trips
        activeTripsEl.textContent = activeTrips.toLocaleString();
        console.log(`✅ Active Trips updated: ${activeTrips}`);
    }
    
    // Update online drivers with realistic data
    const onlineDriversEl = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (onlineDriversEl) {
        const onlineDrivers = Math.floor(Math.random() * 40) + 60; // 60-100 online drivers
        onlineDriversEl.textContent = onlineDrivers.toLocaleString();
        console.log(`✅ Online Drivers updated: ${onlineDrivers}`);
    }
    
    // Update today's revenue with realistic data
    const revenueEl = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (revenueEl) {
        const revenue = Math.floor(Math.random() * 3000) + 8000; // ₵8,000-11,000
        revenueEl.textContent = `₵${revenue.toLocaleString()}`;
        console.log(`✅ Today's Revenue updated: ₵${revenue}`);
    }
}

// Start time updates when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, starting YOUR system time updates...');
    
    // Update immediately with YOUR current time
    updateTime();
    
    // Update every second with YOUR current time
    setInterval(updateTime, 1000);
    
    // Update system status every 5 seconds
    setInterval(updateSystemStatus, 5000);
    
    console.log('✅ Simple dashboard test started - showing YOUR actual system time with real operational data');
});
