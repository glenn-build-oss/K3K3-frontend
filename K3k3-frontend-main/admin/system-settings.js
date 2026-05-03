// K3K3 Admin - System Settings Management
class SystemSettings {
    constructor() {
        this.settings = {
            general: {
                platformName: 'K3K3 Transport',
                version: 'v2.1.0',
                maintenanceMode: 'disabled',
                timezone: 'GMT',
                dateFormat: 'DD/MM/YYYY',
                currency: 'GHS'
            },
            security: {
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                lockoutDuration: 15,
                minPasswordLength: 8,
                requireSpecialChars: true,
                passwordExpiry: 90
            },
            notifications: {
                adminEmail: 'admin@k3k3.com',
                emailNotifications: true,
                lowBalanceAlert: 100,
                systemAlerts: true,
                rideMonitoring: true,
                paymentAlerts: true
            },
            api: {
                enabled: 'enabled',
                apiKey: 'k3k3_live_20241216abcdef123456',
                rateLimit: 100,
                allowedOrigins: ['https://k3k3.com', 'https://app.k3k3.com']
            },
            backup: {
                autoBackup: true,
                backupFrequency: 'daily',
                backupRetention: 30,
                lastBackup: '2024-12-16T02:00:00',
                nextBackup: '2024-12-17T02:00:00'
            }
        };
        this.init();
    }

    init() {
        console.log('⚙️ Initializing System Settings...');
        this.loadSettings();
        this.setupEventListeners();
        this.populateSettings();
        console.log('✅ System Settings Ready');
    }

    loadSettings() {
        // Load settings from localStorage
        const saved = localStorage.getItem('k3k3_system_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    saveSettings() {
        localStorage.setItem('k3k3_system_settings', JSON.stringify(this.settings));
        this.showNotification('Settings saved successfully', 'success');
    }

    setupEventListeners() {
        // General settings
        const saveGeneralBtn = document.getElementById('saveGeneralBtn');
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', () => {
                this.saveGeneralSettings();
            });
        }

        // Security settings
        const saveSecurityBtn = document.getElementById('saveSecurityBtn');
        if (saveSecurityBtn) {
            saveSecurityBtn.addEventListener('click', () => {
                this.saveSecuritySettings();
            });
        }

        // Notification settings
        const saveNotificationBtn = document.getElementById('saveNotificationBtn');
        if (saveNotificationBtn) {
            saveNotificationBtn.addEventListener('click', () => {
                this.saveNotificationSettings();
            });
        }

        // API settings
        const saveApiBtn = document.getElementById('saveApiBtn');
        if (saveApiBtn) {
            saveApiBtn.addEventListener('click', () => {
                this.saveApiSettings();
            });
        }

        const regenerateApiBtn = document.getElementById('regenerateApiBtn');
        if (regenerateApiBtn) {
            regenerateApiBtn.addEventListener('click', () => {
                this.regenerateApiKey();
            });
        }

        const copyApiBtn = document.getElementById('copyApiBtn');
        if (copyApiBtn) {
            copyApiBtn.addEventListener('click', () => {
                this.copyApiKey();
            });
        }

        // Backup settings
        const backupNowBtn = document.getElementById('backupNowBtn');
        if (backupNowBtn) {
            backupNowBtn.addEventListener('click', () => {
                this.performBackup();
            });
        }

        const restoreBtn = document.getElementById('restoreBtn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.showRestoreDialog();
            });
        }

        // Add backup settings save listener
        const autoBackupCheckbox = document.getElementById('autoBackup');
        const backupFrequencySelect = document.getElementById('backupFrequency');
        const backupRetentionInput = document.getElementById('backupRetention');

        if (autoBackupCheckbox) {
            autoBackupCheckbox.addEventListener('change', () => {
                this.saveBackupSettings();
            });
        }

        if (backupFrequencySelect) {
            backupFrequencySelect.addEventListener('change', () => {
                this.saveBackupSettings();
            });
        }

        if (backupRetentionInput) {
            backupRetentionInput.addEventListener('change', () => {
                this.saveBackupSettings();
            });
        }

        // Add refresh and export button listeners
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshSettings();
            });
        }

        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSettings();
            });
        }

        // System management buttons
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateSystemReport();
            });
        }

        const testApiBtn = document.getElementById('testApiBtn');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => {
                this.testApiConnection();
            });
        }

        const testEmailBtn = document.getElementById('testEmailBtn');
        if (testEmailBtn) {
            testEmailBtn.addEventListener('click', () => {
                this.sendTestEmail();
            });
        }

        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => {
                this.resetToDefaults();
            });
        }

        // Add real-time validation listeners
        this.addValidationListeners();
    }

    addValidationListeners() {
        // Validate email in real-time
        const adminEmailInput = document.getElementById('adminEmail');
        if (adminEmailInput) {
            adminEmailInput.addEventListener('blur', () => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(adminEmailInput.value)) {
                    adminEmailInput.style.borderColor = '#dc3545';
                    this.showNotification('Please enter a valid email address', 'error');
                } else {
                    adminEmailInput.style.borderColor = '#28a745';
                }
            });
        }

        // Validate API rate limit
        const rateLimitInput = document.getElementById('rateLimit');
        if (rateLimitInput) {
            rateLimitInput.addEventListener('blur', () => {
                const value = parseInt(rateLimitInput.value);
                if (value < 10 || value > 1000) {
                    rateLimitInput.style.borderColor = '#dc3545';
                    this.showNotification('Rate limit must be between 10 and 1000', 'error');
                } else {
                    rateLimitInput.style.borderColor = '#28a745';
                }
            });
        }

        // Validate session timeout
        const sessionTimeoutInput = document.getElementById('sessionTimeout');
        if (sessionTimeoutInput) {
            sessionTimeoutInput.addEventListener('blur', () => {
                const value = parseInt(sessionTimeoutInput.value);
                if (value < 5 || value > 240) {
                    sessionTimeoutInput.style.borderColor = '#dc3545';
                    this.showNotification('Session timeout must be between 5 and 240 minutes', 'error');
                } else {
                    sessionTimeoutInput.style.borderColor = '#28a745';
                }
            });
        }
    }

    refreshSettings() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        this.showNotification('Refreshing settings...', 'info');

        // Simulate refresh process
        setTimeout(() => {
            this.loadSettings();
            this.populateSettings();
            this.updateBackupStatus();
            
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            
            this.showNotification('Settings refreshed successfully', 'success');
        }, 1000);
    }

    populateSettings() {
        // General settings
        const platformName = document.getElementById('platformName');
        if (platformName) platformName.value = this.settings.general.platformName;
        
        const platformVersion = document.getElementById('platformVersion');
        if (platformVersion) platformVersion.value = this.settings.general.version;
        
        const maintenanceMode = document.getElementById('maintenanceMode');
        if (maintenanceMode) maintenanceMode.value = this.settings.general.maintenanceMode;
        
        const timezone = document.getElementById('timezone');
        if (timezone) timezone.value = this.settings.general.timezone;
        
        const dateFormat = document.getElementById('dateFormat');
        if (dateFormat) dateFormat.value = this.settings.general.dateFormat;
        
        const currency = document.getElementById('currency');
        if (currency) currency.value = this.settings.general.currency;

        // Security settings
        const sessionTimeout = document.getElementById('sessionTimeout');
        if (sessionTimeout) sessionTimeout.value = this.settings.security.sessionTimeout;
        
        const maxLoginAttempts = document.getElementById('maxLoginAttempts');
        if (maxLoginAttempts) maxLoginAttempts.value = this.settings.security.maxLoginAttempts;
        
        const lockoutDuration = document.getElementById('lockoutDuration');
        if (lockoutDuration) lockoutDuration.value = this.settings.security.lockoutDuration;
        
        const minPasswordLength = document.getElementById('minPasswordLength');
        if (minPasswordLength) minPasswordLength.value = this.settings.security.minPasswordLength;
        
        const requireSpecialChars = document.getElementById('requireSpecialChars');
        if (requireSpecialChars) requireSpecialChars.value = this.settings.security.requireSpecialChars ? 'yes' : 'no';
        
        const passwordExpiry = document.getElementById('passwordExpiry');
        if (passwordExpiry) passwordExpiry.value = this.settings.security.passwordExpiry;

        // Notification settings
        const adminEmail = document.getElementById('adminEmail');
        if (adminEmail) adminEmail.value = this.settings.notifications.adminEmail;
        
        const emailNotifications = document.getElementById('emailNotifications');
        if (emailNotifications) emailNotifications.checked = this.settings.notifications.emailNotifications;
        
        const lowBalanceAlert = document.getElementById('lowBalanceAlert');
        if (lowBalanceAlert) lowBalanceAlert.value = this.settings.notifications.lowBalanceAlert;
        
        const systemAlerts = document.getElementById('systemAlerts');
        if (systemAlerts) systemAlerts.checked = this.settings.notifications.systemAlerts;
        
        const rideMonitoring = document.getElementById('rideMonitoring');
        if (rideMonitoring) rideMonitoring.checked = this.settings.notifications.rideMonitoring;
        
        const paymentAlerts = document.getElementById('paymentAlerts');
        if (paymentAlerts) paymentAlerts.checked = this.settings.notifications.paymentAlerts;

        // API settings
        const apiEnabled = document.getElementById('apiEnabled');
        if (apiEnabled) apiEnabled.value = this.settings.api.enabled;
        
        const apiKey = document.getElementById('apiKey');
        if (apiKey) apiKey.value = this.settings.api.apiKey;
        
        const rateLimit = document.getElementById('rateLimit');
        if (rateLimit) rateLimit.value = this.settings.api.rateLimit;
        
        const allowedOrigins = document.getElementById('allowedOrigins');
        if (allowedOrigins) allowedOrigins.value = this.settings.api.allowedOrigins.join('\n');

        // Backup settings
        const autoBackup = document.getElementById('autoBackup');
        if (autoBackup) autoBackup.checked = this.settings.backup.autoBackup;
        
        const backupFrequency = document.getElementById('backupFrequency');
        if (backupFrequency) backupFrequency.value = this.settings.backup.backupFrequency;
        
        const backupRetention = document.getElementById('backupRetention');
        if (backupRetention) backupRetention.value = this.settings.backup.backupRetention;
        
        // Update backup status
        this.updateBackupStatus();
        
        // Update system information
        this.updateSystemInfo();
    }

    updateSystemInfo() {
        const systemStatus = this.getSystemStatus();
        const storage = this.getStorageUsage();
        
        // Update system information display
        document.getElementById('platformInfo').textContent = systemStatus.platform;
        document.getElementById('versionInfo').textContent = systemStatus.version;
        document.getElementById('uptimeInfo').textContent = systemStatus.uptime;
        document.getElementById('activeUsersInfo').textContent = systemStatus.activeUsers;
        document.getElementById('storageInfo').textContent = `${storage.used} MB / ${storage.total} GB (${storage.percentage}%)`;
        document.getElementById('apiStatusInfo').textContent = systemStatus.apiStatus.charAt(0).toUpperCase() + systemStatus.apiStatus.slice(1);
        
        // Update API status color based on status
        const apiStatusEl = document.getElementById('apiStatusInfo');
        if (systemStatus.apiStatus === 'enabled') {
            apiStatusEl.style.color = '#28a745';
        } else if (systemStatus.apiStatus === 'disabled') {
            apiStatusEl.style.color = '#dc3545';
        } else {
            apiStatusEl.style.color = '#ffc107';
        }
        
        // Update storage usage color based on percentage
        const storageEl = document.getElementById('storageInfo');
        const percentage = parseFloat(storage.percentage);
        if (percentage > 80) {
            storageEl.style.color = '#dc3545';
        } else if (percentage > 60) {
            storageEl.style.color = '#ffc107';
        } else {
            storageEl.style.color = '#28a745';
        }
    }

    saveGeneralSettings() {
        const platformNameEl = document.getElementById('platformName');
        const maintenanceModeEl = document.getElementById('maintenanceMode');
        const timezoneEl = document.getElementById('timezone');
        const dateFormatEl = document.getElementById('dateFormat');
        const currencyEl = document.getElementById('currency');
        
        if (!platformNameEl || !maintenanceModeEl || !timezoneEl || !dateFormatEl || !currencyEl) {
            this.showNotification('Required elements not found', 'error');
            return;
        }
        
        const platformName = platformNameEl.value.trim();
        const maintenanceMode = maintenanceModeEl.value;
        
        // Validate platform name
        if (!platformName) {
            this.showNotification('Platform name is required', 'error');
            return;
        }
        
        this.settings.general.platformName = platformName;
        this.settings.general.version = document.getElementById('platformVersion')?.value || 'v2.1.0';
        this.settings.general.maintenanceMode = maintenanceMode;
        this.settings.general.timezone = timezoneEl.value;
        this.settings.general.dateFormat = dateFormatEl.value;
        this.settings.general.currency = currencyEl.value;
        
        // Handle maintenance mode
        if (maintenanceMode === 'active') {
            this.activateMaintenanceMode();
        } else {
            this.deactivateMaintenanceMode();
        }
        
        this.saveSettings();
        this.showNotification('General settings saved successfully', 'success');
    }

    activateMaintenanceMode() {
        // Show maintenance mode notification
        this.showNotification('Maintenance mode activated - Users will see maintenance page', 'warning');
        
        // Update page title to indicate maintenance
        document.title = '🔧 Under Maintenance - K3K3 Admin';
        
        // Add maintenance mode indicator
        const maintenanceIndicator = document.createElement('div');
        maintenanceIndicator.id = 'maintenanceIndicator';
        maintenanceIndicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        maintenanceIndicator.innerHTML = `
            <i class="fas fa-tools"></i> Maintenance Mode Active - Users cannot access the platform
        `;
        document.body.appendChild(maintenanceIndicator);
    }

    deactivateMaintenanceMode() {
        // Remove maintenance mode indicator
        const indicator = document.getElementById('maintenanceIndicator');
        if (indicator) {
            document.body.removeChild(indicator);
        }
        
        // Reset page title
        document.title = 'System Settings - K3K3 Admin';
        
        this.showNotification('Maintenance mode deactivated - Platform is now accessible', 'success');
    }

    getSystemStatus() {
        const status = {
            platform: this.settings.general.platformName,
            version: this.settings.general.version,
            maintenance: this.settings.general.maintenanceMode,
            uptime: this.calculateUptime(),
            lastBackup: this.settings.backup.lastBackup,
            apiStatus: this.settings.api.enabled,
            storageUsed: this.getStorageUsage(),
            activeUsers: this.getActiveUsersCount()
        };
        
        return status;
    }

    calculateUptime() {
        // Simulate uptime calculation
        const startTime = Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000); // Random uptime up to 30 days
        const uptime = Date.now() - startTime;
        
        const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
        
        return `${days}d ${hours}h ${minutes}m`;
    }

    getStorageUsage() {
        // Calculate actual localStorage usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        const sizeInKB = totalSize / 1024;
        const sizeInMB = sizeInKB / 1024;
        
        return {
            used: sizeInMB.toFixed(2),
            total: '10.00',
            percentage: ((sizeInMB / 10) * 100).toFixed(1)
        };
    }

    getActiveUsersCount() {
        // Simulate active users count
        return Math.floor(Math.random() * 100) + 50;
    }

    testApiConnection() {
        this.showNotification('Testing API connection...', 'info');
        
        // Simulate API test
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                this.showNotification('API connection test successful', 'success');
            } else {
                this.showNotification('API connection test failed', 'error');
            }
        }, 1500);
    }

    sendTestEmail() {
        this.showNotification('Sending test email...', 'info');
        
        // Simulate email sending
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                this.showNotification('Test email sent successfully', 'success');
            } else {
                this.showNotification('Failed to send test email', 'error');
            }
        }, 2000);
    }

    clearCache() {
        if (confirm('Are you sure you want to clear the system cache? This may temporarily slow down the system.')) {
            this.showNotification('Clearing system cache...', 'info');
            
            // Simulate cache clearing
            setTimeout(() => {
                // Clear some localStorage items that represent cache
                const cacheKeys = ['k3k3_cache_data', 'k3k3_temp_data', 'k3k3_session_cache'];
                cacheKeys.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                    }
                });
                
                this.showNotification('System cache cleared successfully', 'success');
            }, 1500);
        }
    }

    generateSystemReport() {
        const report = {
            timestamp: new Date().toISOString(),
            systemStatus: this.getSystemStatus(),
            settings: this.settings,
            storageUsage: this.getStorageUsage(),
            recommendations: this.generateRecommendations()
        };
        
        // Download report
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `k3k3_system_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('System report generated successfully', 'success');
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check backup frequency
        if (this.settings.backup.backupFrequency === 'monthly') {
            recommendations.push('Consider changing backup frequency to daily for better data protection');
        }
        
        // Check session timeout
        if (this.settings.security.sessionTimeout > 120) {
            recommendations.push('Consider reducing session timeout for better security');
        }
        
        // Check password policy
        if (this.settings.security.minPasswordLength < 8) {
            recommendations.push('Increase minimum password length to at least 8 characters');
        }
        
        // Check API rate limit
        if (this.settings.api.rateLimit > 500) {
            recommendations.push('Consider reducing API rate limit for better performance');
        }
        
        // Check storage usage
        const storage = this.getStorageUsage();
        if (parseFloat(storage.percentage) > 80) {
            recommendations.push('Storage usage is high. Consider cleaning up old data');
        }
        
        return recommendations;
    }

    saveSecuritySettings() {
        this.settings.security.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
        this.settings.security.maxLoginAttempts = parseInt(document.getElementById('maxLoginAttempts').value);
        this.settings.security.lockoutDuration = parseInt(document.getElementById('lockoutDuration').value);
        this.settings.security.minPasswordLength = parseInt(document.getElementById('minPasswordLength').value);
        this.settings.security.requireSpecialChars = document.getElementById('requireSpecialChars').value === 'yes';
        this.settings.security.passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
        
        this.saveSettings();
    }

    saveNotificationSettings() {
        this.settings.notifications.adminEmail = document.getElementById('adminEmail').value;
        this.settings.notifications.emailNotifications = document.getElementById('emailNotifications').checked;
        this.settings.notifications.lowBalanceAlert = parseFloat(document.getElementById('lowBalanceAlert').value);
        this.settings.notifications.systemAlerts = document.getElementById('systemAlerts').checked;
        this.settings.notifications.rideMonitoring = document.getElementById('rideMonitoring').checked;
        this.settings.notifications.paymentAlerts = document.getElementById('paymentAlerts').checked;
        
        this.saveSettings();
    }

    saveApiSettings() {
        this.settings.api.enabled = document.getElementById('apiEnabled').value;
        this.settings.api.apiKey = document.getElementById('apiKey').value;
        this.settings.api.rateLimit = parseInt(document.getElementById('rateLimit').value);
        this.settings.api.allowedOrigins = document.getElementById('allowedOrigins').value.split('\n').filter(origin => origin.trim());
        
        // Validate API settings
        if (this.settings.api.rateLimit < 10 || this.settings.api.rateLimit > 1000) {
            this.showNotification('Rate limit must be between 10 and 1000 requests per minute', 'error');
            return;
        }
        
        if (this.settings.api.allowedOrigins.length === 0) {
            this.showNotification('At least one allowed origin must be specified', 'error');
            return;
        }
        
        this.saveSettings();
        this.showNotification('API settings saved successfully', 'success');
    }

    regenerateApiKey() {
        if (confirm('Are you sure you want to regenerate the API key? This will invalidate the current key.')) {
            const newKey = `k3k3_live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.settings.api.apiKey = newKey;
            document.getElementById('apiKey').value = newKey;
            
            this.showNotification('API key regenerated successfully', 'success');
            this.saveSettings();
        }
    }

    copyApiKey() {
        const apiKey = document.getElementById('apiKey');
        apiKey.select();
        document.execCommand('copy');
        
        this.showNotification('API key copied to clipboard', 'success');
    }

    performBackup() {
        const backupBtn = document.getElementById('backupNowBtn');
        backupBtn.disabled = true;
        backupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Backing Up...';
        
        this.showNotification('Starting backup process...', 'info');
        
        // Simulate backup process with progress
        setTimeout(() => {
            this.settings.backup.lastBackup = new Date().toISOString();
            this.updateBackupStatus();
            this.saveSettings();
            
            // Create backup data
            const backupData = {
                timestamp: new Date().toISOString(),
                settings: this.settings,
                riders: JSON.parse(localStorage.getItem('k3k3_rider_data') || '{}'),
                applications: JSON.parse(localStorage.getItem('k3k3_pending_applications') || '[]')
            };
            
            // Download backup file
            this.downloadBackup(backupData);
            
            backupBtn.disabled = false;
            backupBtn.innerHTML = '<i class="fas fa-download"></i> Backup Now';
            
            this.showNotification('Backup completed successfully', 'success');
        }, 2000);
    }

    downloadBackup(backupData) {
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `k3k3_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    updateBackupStatus() {
        const lastBackupEl = document.getElementById('lastBackupDate');
        const nextBackupEl = document.getElementById('nextBackupDate');
        const storageUsedEl = document.getElementById('storageUsed');
        
        if (lastBackupEl) {
            const lastBackup = new Date(this.settings.backup.lastBackup);
            lastBackupEl.textContent = lastBackup.toLocaleString();
        }
        
        if (nextBackupEl) {
            const nextBackup = new Date(this.settings.backup.lastBackup);
            
            switch (this.settings.backup.backupFrequency) {
                case 'daily':
                    nextBackup.setDate(nextBackup.getDate() + 1);
                    break;
                case 'weekly':
                    nextBackup.setDate(nextBackup.getDate() + 7);
                    break;
                case 'monthly':
                    nextBackup.setMonth(nextBackup.getMonth() + 1);
                    break;
            }
            
            nextBackupEl.textContent = nextBackup.toLocaleString();
        }
        
        if (storageUsedEl) {
            // Simulate storage calculation
            const usedStorage = Math.random() * 10; // Random GB
            storageUsedEl.textContent = `${usedStorage.toFixed(1)} GB / 10 GB`;
        }
    }

    saveBackupSettings() {
        this.settings.backup.autoBackup = document.getElementById('autoBackup').checked;
        this.settings.backup.backupFrequency = document.getElementById('backupFrequency').value;
        this.settings.backup.backupRetention = parseInt(document.getElementById('backupRetention').value);
        
        this.saveSettings();
        this.updateBackupStatus();
        this.showNotification('Backup settings saved successfully', 'success');
    }

    showRestoreDialog() {
        const modal = document.createElement('div');
        modal.className = 'restore-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="restore-dialog" style="
                background: white;
                padding: 2rem;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <h3 style="margin: 0 0 1rem 0; color: #333;">Restore from Backup</h3>
                <p style="margin: 0 0 1.5rem 0; color: #666;">
                    Select a backup file to restore. This will replace all current settings and data.
                </p>
                <div class="restore-form">
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label for="backupFile" style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Backup File</label>
                        <input type="file" id="backupFile" accept=".json" style="width: 100%; padding: 0.75rem; border: 2px solid #e9ecef; border-radius: 8px;">
                    </div>
                    <div class="restore-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
                        <button class="btn-secondary" id="cancelRestore" style="padding: 0.75rem 1.5rem; border: 2px solid #6c757d; background: white; color: #6c757d; border-radius: 8px; cursor: pointer;">Cancel</button>
                        <button class="btn-primary" id="confirmRestore" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer;">Restore</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle restore actions
        document.getElementById('cancelRestore').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('confirmRestore').addEventListener('click', () => {
            const fileInput = document.getElementById('backupFile');
            if (fileInput.files.length > 0) {
                this.restoreFromBackup(fileInput.files[0]);
                document.body.removeChild(modal);
            } else {
                this.showNotification('Please select a backup file', 'error');
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    restoreFromBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validate backup data
                if (!backupData.settings || !backupData.timestamp) {
                    throw new Error('Invalid backup file format');
                }
                
                // Restore settings
                this.settings = backupData.settings;
                this.saveSettings();
                this.populateSettings();
                
                // Restore other data if available
                if (backupData.riders) {
                    localStorage.setItem('k3k3_rider_data', JSON.stringify(backupData.riders));
                }
                
                if (backupData.applications) {
                    localStorage.setItem('k3k3_pending_applications', JSON.stringify(backupData.applications));
                }
                
                this.showNotification('Backup restored successfully', 'success');
                
                // Refresh the page to apply all changes
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
            } catch (error) {
                this.showNotification('Failed to restore backup: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    validateSettings() {
        const errors = [];
        
        // Validate general settings
        if (!this.settings.general.platformName.trim()) {
            errors.push('Platform name is required');
        }
        
        // Validate security settings
        if (this.settings.security.sessionTimeout < 5 || this.settings.security.sessionTimeout > 240) {
            errors.push('Session timeout must be between 5 and 240 minutes');
        }
        
        if (this.settings.security.maxLoginAttempts < 3 || this.settings.security.maxLoginAttempts > 10) {
            errors.push('Max login attempts must be between 3 and 10');
        }
        
        if (this.settings.security.minPasswordLength < 6 || this.settings.security.minPasswordLength > 20) {
            errors.push('Minimum password length must be between 6 and 20 characters');
        }
        
        // Validate notification settings
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.settings.notifications.adminEmail)) {
            errors.push('Admin email is not valid');
        }
        
        return errors;
    }

    exportSettings() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.1.0',
            settings: this.settings
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `k3k3_settings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Settings exported successfully', 'success');
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
            // Reset to default settings
            this.settings = {
                general: {
                    platformName: 'K3K3 Transport',
                    version: 'v2.1.0',
                    maintenanceMode: 'disabled',
                    timezone: 'GMT',
                    dateFormat: 'DD/MM/YYYY',
                    currency: 'GHS'
                },
                security: {
                    sessionTimeout: 30,
                    maxLoginAttempts: 5,
                    lockoutDuration: 15,
                    minPasswordLength: 8,
                    requireSpecialChars: true,
                    passwordExpiry: 90
                },
                notifications: {
                    adminEmail: 'admin@k3k3.com',
                    emailNotifications: true,
                    lowBalanceAlert: 100,
                    systemAlerts: true,
                    rideMonitoring: true,
                    paymentAlerts: true
                },
                api: {
                    enabled: 'enabled',
                    apiKey: 'k3k3_live_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    rateLimit: 100,
                    allowedOrigins: ['https://k3k3.com', 'https://app.k3k3.com']
                },
                backup: {
                    autoBackup: true,
                    backupFrequency: 'daily',
                    backupRetention: 30,
                    lastBackup: new Date().toISOString(),
                    nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            };
            
            this.saveSettings();
            this.populateSettings();
            this.showNotification('Settings reset to default values', 'success');
        }
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
const systemSettings = new SystemSettings();
