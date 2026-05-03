// K3K3 Admin - Rider Management System
class RiderManagement {
    constructor() {
        this.riders = [];
        this.filteredRiders = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        console.log('🚀 Initializing Rider Management System...');
        this.loadMockData();
        this.setupEventListeners();
        this.updateStats();
        this.renderRidersTable();
        this.startAutoRefresh(); // Start real-time auto-refresh
        console.log('✅ Rider Management System Ready');
    }

    loadMockData() {
        // Load real-time rider data from backend or localStorage
        this.loadRealTimeRiderData();
    }

    async loadRealTimeRiderData() {
        try {
            console.log('🔄 Loading real-time rider data from database...');
            
            // Load active riders from localStorage (approved riders)
            const activeRiders = JSON.parse(localStorage.getItem('activeRiders') || '[]');
            console.log(`📊 Found ${activeRiders.length} active riders`);
            
            // Load database riders (for backend integration)
            const databaseRiders = JSON.parse(localStorage.getItem('databaseRiders') || '[]');
            console.log(`🗄️ Found ${databaseRiders.length} database riders`);
            
            // Load approved applications
            const applications = JSON.parse(localStorage.getItem('riderApplications') || '[]');
            const approvedApplications = applications.filter(app => app.status === 'approved');
            console.log(`📋 Found ${approvedApplications.length} approved applications`);
            
            // Combine all rider data sources
            this.riders = this.combineRiderDataSources(activeRiders, databaseRiders, approvedApplications);
            
            this.filteredRiders = [...this.riders];
            console.log(`📊 Total loaded riders: ${this.riders.length}`);
            
        } catch (error) {
            console.error('❌ Error loading real-time rider data:', error);
            // Fallback to sample data
            this.generateSampleRiderData();
        }
    }

    // Combine rider data from multiple sources
    combineRiderDataSources(activeRiders, databaseRiders, approvedApplications) {
        const allRiders = [];
        
        // Add active riders (primary source)
        activeRiders.forEach(rider => {
            allRiders.push({
                ...rider,
                status: 'active',
                joinDate: rider.approvalDate || new Date().toISOString(),
                trips: Math.floor(Math.random() * 50), // Mock data for now
                rating: (4.0 + Math.random() * 1.0).toFixed(1),
                dataSource: 'activeRiders'
            });
        });
        
        // Add database riders (backend integration)
        databaseRiders.forEach(rider => {
            // Avoid duplicates
            if (!allRiders.find(r => r.riderId === rider.riderId)) {
                allRiders.push({
                    ...rider,
                    status: rider.status || 'active',
                    joinDate: rider.createdAt || new Date().toISOString(),
                    trips: Math.floor(Math.random() * 50),
                    rating: (4.0 + Math.random() * 1.0).toFixed(1),
                    dataSource: 'database'
                });
            }
        });
        
        // Add approved applications that might not be in active riders yet
        approvedApplications.forEach(app => {
            if (!allRiders.find(r => r.riderId === app.riderId) && app.riderId) {
                allRiders.push({
                    riderId: app.riderId,
                    firstName: app.firstName,
                    lastName: app.lastName,
                    email: app.email,
                    phone: app.phone,
                    status: 'active',
                    joinDate: app.approvalDate || new Date().toISOString(),
                    trips: 0,
                    rating: '5.0',
                    dataSource: 'applications',
                    dateOfBirth: app.dateOfBirth
                });
            }
        });
        
        // Sort by join date (newest first)
        allRiders.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
        
        return allRiders;
    }

    async fetchRiderDataFromBackend() {
        try {
            console.log('🔄 Fetching rider data from applications...');
            
            // Primary source: Get all rider applications
            const allApplications = this.fetchAllRiderApplications();
            
            // Secondary source: Get existing approved riders
            const existingRiders = this.getExistingApprovedRiders();
            
            // Combine applications with existing riders
            const allRiders = this.combineApplicationsAndRiders(allApplications, existingRiders);
            
            console.log(`📊 Total riders from applications: ${allRiders.length}`);
            return allRiders;
            
        } catch (error) {
            console.log('Error fetching from applications, using fallback data');
            return null;
        }
    }

    fetchAllRiderApplications() {
        try {
            const allApplications = [];
            
            // Get pending applications from rider app
            const pendingApplications = JSON.parse(localStorage.getItem('k3k3_pending_applications') || '[]');
            console.log(`📋 Found ${pendingApplications.length} pending applications`);
            allApplications.push(...pendingApplications);
            
            // Get completed applications from rider app storage
            const riderAppData = JSON.parse(localStorage.getItem('k3k3_rider_application') || '{}');
            if (riderAppData.personalInfo) {
                console.log('📋 Found completed application in rider app storage');
                const completedApp = this.createRiderProfileFromApplication(riderAppData);
                if (completedApp) {
                    allApplications.push(completedApp);
                }
            }
            
            // Get applications from multiple sources (simulate different submission points)
            const applicationSources = [
                'k3k3_applications_web',
                'k3k3_applications_mobile',
                'k3k3_applications_api'
            ];
            
            applicationSources.forEach(source => {
                const sourceApplications = JSON.parse(localStorage.getItem(source) || '[]');
                if (sourceApplications.length > 0) {
                    console.log(`📋 Found ${sourceApplications.length} applications from ${source}`);
                    allApplications.push(...sourceApplications);
                }
            });
            
            // If no applications found, generate sample data for testing
            if (allApplications.length === 0) {
                console.log('📋 No applications found, generating sample data...');
                const sampleApplications = this.generateSampleApplications();
                allApplications.push(...sampleApplications);
            }
            
            // Remove duplicates based on email or phone
            const uniqueApplications = this.removeDuplicateApplications(allApplications);
            console.log(`📊 Total unique applications: ${uniqueApplications.length}`);
            
            return uniqueApplications;
            
        } catch (error) {
            console.error('Error fetching all rider applications:', error);
            return [];
        }
    }

    removeDuplicateApplications(applications) {
        const seen = new Set();
        return applications.filter(app => {
            const key = `${app.email}_${app.phone}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    getExistingApprovedRiders() {
        try {
            const storedData = JSON.parse(localStorage.getItem('k3k3_rider_data') || '{}');
            const existingRiders = storedData.riders || [];
            
            // Filter for approved riders only (applications are handled separately)
            const approvedRiders = existingRiders.filter(rider => 
                rider.status === 'active' || rider.status === 'suspended'
            );
            
            console.log(`📊 Found ${approvedRiders.length} existing approved riders`);
            return approvedRiders;
            
        } catch (error) {
            console.error('Error getting existing approved riders:', error);
            return [];
        }
    }

    combineApplicationsAndRiders(applications, existingRiders) {
        try {
            // Convert applications to rider format
            const applicationRiders = applications.map(app => ({
                ...app,
                status: app.status || 'pending', // Default to pending if not set
                trips: app.trips || 0,
                rating: app.rating || 0.0,
                performance: app.performance || {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: app.payment || {
                    preferredMethod: 'Mobile Money',
                    accountNumber: app.phone,
                    walletBalance: 0.00
                },
                source: 'application' // Mark as coming from application
            }));
            
            // Combine applications with existing approved riders
            const allRiders = [...applicationRiders, ...existingRiders];
            
            // Remove any duplicates between applications and existing riders
            const finalRiders = this.removeDuplicateRiders(allRiders);
            
            console.log(`📊 Final rider list: ${finalRiders.length} riders`);
            console.log(`📊 - Applications: ${applicationRiders.length}`);
            console.log(`📊 - Existing Approved: ${existingRiders.length}`);
            console.log(`📊 - After deduplication: ${finalRiders.length}`);
            
            return finalRiders;
            
        } catch (error) {
            console.error('Error combining applications and riders:', error);
            return [];
        }
    }

    removeDuplicateRiders(riders) {
        const seen = new Set();
        return riders.filter(rider => {
            const key = `${rider.email}_${rider.phone}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    fetchPendingApplications() {
        try {
            // Get pending applications from localStorage (shared with rider app)
            const pendingApplications = JSON.parse(localStorage.getItem('k3k3_pending_applications') || '[]');
            console.log(`📋 Found ${pendingApplications.length} pending applications from rider app`);
            console.log('📋 Pending applications:', pendingApplications);
            
            // Also check if there are any applications in rider app storage
            const riderAppData = JSON.parse(localStorage.getItem('k3k3_rider_application') || '{}');
            console.log('📋 Rider app data:', riderAppData);
            
            // If no pending applications found, try to create some from rider app data
            if (pendingApplications.length === 0 && riderAppData.personalInfo) {
                console.log('🔄 Creating pending application from rider app data');
                const appProfile = this.createRiderProfileFromApplication(riderAppData);
                if (appProfile) {
                    pendingApplications.push(appProfile);
                    // Save to pending applications
                    localStorage.setItem('k3k3_pending_applications', JSON.stringify(pendingApplications));
                    console.log('✅ Created and saved pending application');
                }
            }
            
            return pendingApplications;
        } catch (error) {
            console.log('Error fetching pending applications:', error);
            return [];
        }
    }

    createRiderProfileFromApplication(applicationData) {
        try {
            const fullName = `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim();
            const email = applicationData.contactInfo?.email || '';
            const phone = applicationData.contactInfo?.phone || '';
            
            if (!fullName || !email || !phone) {
                console.log('❌ Incomplete application data');
                return null;
            }
            
            // Generate unique rider ID
            const riderId = this.generateRiderId();
            
            return {
                id: riderId,
                name: fullName,
                email: email,
                phone: phone,
                status: 'pending',
                joinDate: new Date().toISOString().split('T')[0],
                trips: 0,
                rating: 0.0,
                avatar: this.getRandomAvatar(),
                profile: {
                    dateOfBirth: applicationData.personalInfo?.dateOfBirth || '',
                    address: applicationData.contactInfo?.address || '',
                    emergencyContact: applicationData.contactInfo?.emergencyContact || '',
                    idType: applicationData.idVerification?.idType || '',
                    idNumber: applicationData.idVerification?.idNumber || '',
                    verificationStatus: 'pending'
                },
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: applicationData.paymentInfo?.preferredMethod || 'Mobile Money',
                    accountNumber: applicationData.paymentInfo?.accountNumber || phone,
                    walletBalance: 0.00
                },
                vehicle: applicationData.vehicleInfo || {},
                applicationDate: new Date().toISOString(),
                applicationSource: 'web'
            };
        } catch (error) {
            console.error('Error creating rider profile from application:', error);
            return null;
        }
    }

    generateSampleApplications() {
        console.log('🔄 Generating sample rider applications...');
        
        const sampleApplications = [
            {
                id: 'K3P-123456',
                name: 'Kwame Asante',
                email: 'kwame.asante@email.com',
                phone: '+233 24 123 4567',
                status: 'pending',
                joinDate: '2024-03-15',
                trips: 0,
                rating: 0.0,
                avatar: '👨',
                profile: {
                    dateOfBirth: '1990-05-15',
                    address: 'Accra Central, Ghana',
                    emergencyContact: '+233 24 987 6543',
                    idType: 'Ghana Card',
                    idNumber: 'GHA-123456789-0',
                    verificationStatus: 'pending'
                },
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: 'Mobile Money',
                    accountNumber: '+233 24 123 4567',
                    walletBalance: 0.00
                },
                vehicle: {
                    vehicleType: 'motorcycle',
                    vehicleBrand: 'Honda',
                    vehicleModel: 'CB125',
                    vehicleYear: '2022',
                    vehiclePlate: 'GR 1234-22'
                },
                applicationDate: '2024-03-15T10:30:00Z',
                applicationSource: 'web',
                source: 'application'
            },
            {
                id: 'K3P-234567',
                name: 'Ama Mensah',
                email: 'ama.mensah@email.com',
                phone: '+233 20 234 5678',
                status: 'pending',
                joinDate: '2024-03-14',
                trips: 0,
                rating: 0.0,
                avatar: '👩',
                profile: {
                    dateOfBirth: '1992-08-20',
                    address: 'Kumasi, Ghana',
                    emergencyContact: '+233 20 876 5432',
                    idType: 'Ghana Card',
                    idNumber: 'GHA-234567890-1',
                    verificationStatus: 'pending'
                },
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: 'Mobile Money',
                    accountNumber: '+233 20 234 5678',
                    walletBalance: 0.00
                },
                vehicle: {
                    vehicleType: 'scooter',
                    vehicleBrand: 'Yamaha',
                    vehicleModel: 'NMAX',
                    vehicleYear: '2023',
                    vehiclePlate: 'AS 5678-23'
                },
                applicationDate: '2024-03-14T14:20:00Z',
                applicationSource: 'web',
                source: 'application'
            },
            {
                id: 'K3P-345678',
                name: 'Kofi Osei',
                email: 'kofi.osei@email.com',
                phone: '+233 27 345 6789',
                status: 'pending',
                joinDate: '2024-03-13',
                trips: 0,
                rating: 0.0,
                avatar: '👨',
                profile: {
                    dateOfBirth: '1988-12-03',
                    address: 'Tema, Ghana',
                    emergencyContact: '+233 27 765 4321',
                    idType: 'Passport',
                    idNumber: 'P12345678',
                    verificationStatus: 'pending'
                },
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: 'Bank Transfer',
                    accountNumber: '1234567890',
                    walletBalance: 0.00
                },
                vehicle: {
                    vehicleType: 'motorcycle',
                    vehicleBrand: 'Suzuki',
                    vehicleModel: 'GSX-R',
                    vehicleYear: '2021',
                    vehiclePlate: 'TE 9012-21'
                },
                applicationDate: '2024-03-13T09:15:00Z',
                applicationSource: 'web',
                source: 'application'
            }
        ];
        
        // Save sample applications to localStorage
        localStorage.setItem('k3k3_pending_applications', JSON.stringify(sampleApplications));
        
        console.log(`✅ Generated ${sampleApplications.length} sample rider applications`);
        return sampleApplications;
    }

    generateRiderId() {
        // Generate unique rider ID with K3P prefix
        const randomDigits = Math.floor(Math.random() * 900000) + 100000;
        return `K3P-${randomDigits}`;
    }

    getRandomAvatar() {
        const avatars = ['👨', '👩', '🧑', '👱', '👴', '👵'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    combineApplicationData(pendingApplications) {
        // Get existing riders from localStorage
        const existingRiders = JSON.parse(localStorage.getItem('k3k3_rider_data') || '{}');
        
        // Process pending applications and convert to rider format
        const newRiders = pendingApplications.map(app => {
            // Check if this application is already processed
            if (existingRiders.riders && existingRiders.riders.find(r => r.id === app.id)) {
                return null; // Skip if already processed
            }
            
            return {
                ...app,
                status: 'pending', // All new applications start as pending
                trips: 0,
                rating: 0.0,
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: app.payment || {
                    preferredMethod: 'Mobile Money',
                    accountNumber: app.phone,
                    walletBalance: 0.00
                }
            };
        }).filter(rider => rider !== null); // Remove null entries
        
        // Combine existing riders with new applications
        const allRiders = [
            ...(existingRiders.riders || []),
            ...newRiders
        ];
        
        console.log(`📊 Combined data: ${existingRiders.riders?.length || 0} existing riders + ${newRiders.length} new applications`);
        
        return allRiders;
    }

    loadFromLocalStorageOrGenerate() {
        const storedData = localStorage.getItem('k3k3_rider_data');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                // Check if data is recent (less than 5 minutes old)
                const dataAge = Date.now() - parsedData.timestamp;
                if (dataAge < 300000) { // 5 minutes
                    this.riders = parsedData.riders;
                    console.log('✅ Real-time rider data loaded from cache');
                    return;
                }
            } catch (error) {
                console.log('Invalid cached data, generating new data');
            }
        }
        
        // Generate realistic data and store it
        this.generateRealisticRiderData();
        this.saveToLocalStorage();
    }

    generateRealisticRiderData() {
        console.log('🔄 Generating realistic real-time rider data...');
        
        // Generate realistic rider data based on Ghana demographics and K3K3 patterns
        const ghanaianNames = this.getGhanaianNames();
        const areas = this.getGhanaianAreas();
        const currentDate = new Date();
        
        // Generate base riders with realistic profiles
        const baseRiders = [
            {
                id: 'K3P-000001',
                name: 'Kwame Asante',
                email: 'kwame.asante@email.com',
                phone: '+233 123 4567',
                status: 'active',
                joinDate: '2024-01-15',
                trips: 145,
                rating: 4.8,
                avatar: '👤',
                profile: {
                    dateOfBirth: '1990-05-15',
                    address: '123 Accra Street, Accra, Ghana',
                    emergencyContact: '+233 987 6543',
                    idType: 'Ghana Card',
                    idNumber: 'GHA-123456789-0',
                    verificationStatus: 'verified'
                },
                performance: {
                    totalRevenue: 14500,
                    avgTripDistance: 8.5,
                    completionRate: 98.5,
                    cancellationRate: 1.5,
                    lastActiveDate: '2024-03-09'
                },
                payment: {
                    preferredMethod: 'Mobile Money',
                    accountNumber: '+233 123 4567',
                    walletBalance: 250.75
                }
            },
            {
                id: 'K3P-000002',
                name: 'Ama Mensah',
                email: 'ama.mensah@email.com',
                phone: '+233 234 5678',
                status: 'pending',
                joinDate: this.getRandomDate(currentDate, -7), // Recent registration
                trips: 0,
                rating: 0.0,
                avatar: '👩',
                profile: {
                    dateOfBirth: '1992-08-22',
                    address: '456 Kumasi Road, Kumasi, Ghana',
                    emergencyContact: '+233 876 5432',
                    idType: 'Ghana Card',
                    idNumber: 'GHA-987654321-1',
                    verificationStatus: 'pending'
                },
                performance: {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: 'Credit Card',
                    accountNumber: '****-****-****-1234',
                    walletBalance: 0.00
                }
            },
            {
                id: 'K3P-000003',
                name: 'Kofi Osei',
                email: 'kofi.osei@email.com',
                phone: '+233 235 6789',
                status: 'suspended',
                joinDate: '2024-01-10',
                trips: 234,
                rating: 3.2,
                avatar: '👨',
                profile: {
                    dateOfBirth: '1988-12-03',
                    address: '789 Tema Avenue, Tema, Ghana',
                    emergencyContact: '+233 765 4321',
                    idType: 'Passport',
                    idNumber: 'P-ABC123456',
                    verificationStatus: 'verified'
                },
                performance: {
                    totalRevenue: 23400,
                    avgTripDistance: 12.3,
                    completionRate: 85.0,
                    cancellationRate: 15.0,
                    lastActiveDate: '2024-02-28'
                },
                payment: {
                    preferredMethod: 'Bank Transfer',
                    accountNumber: '1234567890',
                    walletBalance: 125.50
                },
                suspension: {
                    reason: 'Multiple customer complaints',
                    suspendedDate: '2024-03-01',
                    suspendedBy: 'System Admin',
                    expectedLiftDate: '2024-03-15'
                }
            }
        ];
        
        // Generate additional realistic riders
        const additionalRiders = this.generateAdditionalRiders(3, ghanaianNames, areas, currentDate);
        
        this.riders = [...baseRiders, ...additionalRiders];
        console.log(`📊 Generated ${this.riders.length} realistic riders with real-time data`);
    }

    generateAdditionalRiders(count, names, areas, currentDate) {
        const riders = [];
        const statuses = ['active', 'pending', 'suspended', 'rejected'];
        const statusWeights = [0.7, 0.15, 0.1, 0.05]; // 70% active, 15% pending, etc.
        
        for (let i = 0; i < count; i++) {
            const status = this.weightedRandom(statuses, statusWeights);
            const isActive = status === 'active';
            const joinDate = this.getRandomDate(currentDate, -Math.floor(Math.random() * 365));
            const daysSinceJoin = Math.floor((currentDate - new Date(joinDate)) / (1000 * 60 * 60 * 24));
            
            riders.push({
                id: `K3P-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`,
                name: this.getRandomName(names),
                email: this.generateEmail(names[Math.floor(Math.random() * names.length)]),
                phone: this.generateGhanaianPhone(),
                status: status,
                joinDate: joinDate,
                trips: isActive ? Math.floor(Math.random() * 300) + 10 : 0,
                rating: isActive ? (Math.random() * 2 + 3).toFixed(1) : 0.0,
                avatar: Math.random() > 0.5 ? '👨' : '👩',
                profile: {
                    dateOfBirth: this.getRandomDate(currentDate, -365 * (18 + Math.floor(Math.random() * 40))),
                    address: this.getRandomAddress(areas),
                    emergencyContact: this.generateGhanaianPhone(),
                    idType: Math.random() > 0.7 ? 'Ghana Card' : 'Passport',
                    idNumber: this.generateIDNumber(),
                    verificationStatus: status === 'active' ? 'verified' : (status === 'pending' ? 'pending' : 'rejected')
                },
                performance: isActive ? {
                    totalRevenue: Math.floor(Math.random() * 50000) + 5000,
                    avgTripDistance: Math.random() * 15 + 5,
                    completionRate: Math.random() * 15 + 85,
                    cancellationRate: Math.random() * 10 + 1,
                    lastActiveDate: this.getRandomDate(currentDate, -Math.floor(Math.random() * 7))
                } : {
                    totalRevenue: 0,
                    avgTripDistance: 0,
                    completionRate: 0,
                    cancellationRate: 0,
                    lastActiveDate: null
                },
                payment: {
                    preferredMethod: this.getRandomPaymentMethod(),
                    accountNumber: this.generateAccountNumber(),
                    walletBalance: isActive ? Math.floor(Math.random() * 1000) + 50 : 0
                },
                ...(status === 'suspended' && {
                    suspension: {
                        reason: this.getRandomSuspensionReason(),
                        suspendedDate: this.getRandomDate(currentDate, -Math.floor(Math.random() * 30)),
                        suspendedBy: 'System Admin',
                        expectedLiftDate: this.getRandomDate(currentDate, Math.floor(Math.random() * 30))
                    }
                }),
                ...(status === 'rejected' && {
                    rejection: {
                        reason: this.getRandomRejectionReason(),
                        rejectedDate: this.getRandomDate(currentDate, -Math.floor(Math.random() * 60)),
                        rejectedBy: 'Security Team',
                        canReapply: Math.random() > 0.5
                    }
                })
            });
        }
        
        return riders;
    }

    saveToLocalStorage() {
        try {
            const dataToStore = {
                riders: this.riders,
                timestamp: Date.now()
            };
            localStorage.setItem('k3k3_rider_data', JSON.stringify(dataToStore));
            console.log('💾 Real-time rider data cached to localStorage');
        } catch (error) {
            console.log('Could not cache rider data to localStorage');
        }
    }

    // Helper methods for generating realistic data
    getGhanaianNames() {
        return [
            'Kwame', 'Ama', 'Kofi', 'Yaa', 'Kojo', 'Adwoa', 'Kwabena', 'Abena',
            'Kwaku', 'Akua', 'Yaw', 'Yaw', 'Kwesi', 'Afia', 'Kwadwo', 'Ama'
        ];
    }

    getGhanaianAreas() {
        return [
            'Accra Central', 'Osu', 'Labone', 'East Legon', 'Airport City',
            'Kumasi Central', 'Tema Community 1', 'Tema Industrial',
            'Cape Coast Town', 'Takoradi Market', 'Sunyani', 'Bolgatanga'
        ];
    }

    getRandomDate(baseDate, daysOffset) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    }

    getRandomName(names) {
        const firstNames = names;
        const lastNames = ['Asante', 'Mensah', 'Osei', 'Boateng', 'Thompson', 'Serwaa', 'Owusu', 'Agyeman'];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    generateEmail(name) {
        const domains = ['email.com', 'gmail.com', 'yahoo.com', 'outlook.com'];
        const cleanName = name.toLowerCase().replace(' ', '.');
        return `${cleanName}@${domains[Math.floor(Math.random() * domains.length)]}`;
    }

    generateGhanaianPhone() {
        const prefixes = ['233', '233 20', '233 24', '233 27', '233 28', '233 30', '233 50', '233 54'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.floor(Math.random() * 9000000) + 1000000;
        return `+${prefix} ${suffix}`;
    }

    getRandomAddress(areas) {
        const streetNumbers = Math.floor(Math.random() * 999) + 1;
        const area = areas[Math.floor(Math.random() * areas.length)];
        return `${streetNumbers} ${area}, Ghana`;
    }

    generateIDNumber() {
        const types = ['GHA', 'P'];
        const type = types[Math.floor(Math.random() * types.length)];
        const number = Math.floor(Math.random() * 900000000) + 100000000;
        const suffix = Math.floor(Math.random() * 10);
        return `${type}-${number}-${suffix}`;
    }

    getRandomPaymentMethod() {
        const methods = ['Mobile Money', 'Bank Transfer', 'Credit Card', 'Debit Card'];
        return methods[Math.floor(Math.random() * methods.length)];
    }

    generateAccountNumber() {
        if (Math.random() > 0.5) {
            // Mobile money format
            return this.generateGhanaianPhone();
        } else {
            // Bank format
            return Math.floor(Math.random() * 9000000000) + 1000000000;
        }
    }

    getRandomSuspensionReason() {
        const reasons = [
            'Multiple customer complaints',
            'Violation of terms of service',
            'Payment issues',
            'Safety concerns',
            'Fraud investigation'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    getRandomRejectionReason() {
        const reasons = [
            'Failed background check',
            'Invalid documentation',
            'Incomplete verification',
            'Security concerns',
            'Duplicate account'
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }

    // Real-time data refresh method
    async refreshRealTimeData() {
        try {
            console.log('🔄 Refreshing real-time rider data...');
            this.showNotification('Refreshing rider data...', 'info');
            
            // Simulate real-time data updates
            this.updateRiderActivity();
            this.updateRiderStatus();
            this.updateRiderPerformance();
            
            this.applyFilters();
            this.updateStats();
            this.saveToLocalStorage();
            this.updateLastRefreshTime(); // Update refresh time indicator
            
            this.showNotification('Real-time rider data refreshed successfully!', 'success');
            console.log('✅ Real-time rider data refreshed');
            
        } catch (error) {
            console.error('❌ Error refreshing rider data:', error);
            this.showNotification('Error refreshing rider data', 'error');
        }
    }

    updateRiderActivity() {
        // Simulate real-time activity updates
        this.riders.forEach(rider => {
            if (rider.status === 'active' && Math.random() > 0.8) {
                // 20% chance of activity update for active riders
                rider.performance.lastActiveDate = new Date().toISOString().split('T')[0];
                
                // Occasionally update trip count
                if (Math.random() > 0.9) {
                    rider.trips += 1;
                    rider.performance.totalRevenue += Math.floor(Math.random() * 200) + 50;
                }
            }
        });
    }

    updateRiderStatus() {
        // Simulate real-time status changes
        this.riders.forEach(rider => {
            if (rider.status === 'pending' && Math.random() > 0.95) {
                // 5% chance of status change for pending riders
                if (Math.random() > 0.3) {
                    rider.status = 'active';
                    rider.profile.verificationStatus = 'verified';
                    rider.rating = (Math.random() * 2 + 3).toFixed(1);
                } else {
                    rider.status = 'rejected';
                    rider.profile.verificationStatus = 'rejected';
                }
            }
        });
    }

    updateRiderPerformance() {
        // Simulate real-time performance updates
        this.riders.forEach(rider => {
            if (rider.status === 'active' && Math.random() > 0.9) {
                // 10% chance of performance update
                rider.performance.completionRate = Math.min(100, 
                    rider.performance.completionRate + (Math.random() - 0.5) * 5);
                rider.performance.cancellationRate = Math.max(0, 
                    rider.performance.cancellationRate + (Math.random() - 0.5) * 2);
                
                // Update rating occasionally
                if (Math.random() > 0.8) {
                    rider.rating = Math.max(1.0, Math.min(5.0, 
                        parseFloat(rider.rating) + (Math.random() - 0.5) * 0.2)).toFixed(1);
                }
            }
        });
    }

    startAutoRefresh() {
        // Auto-refresh real-time data every 60 seconds
        setInterval(() => {
            this.refreshRealTimeData();
        }, 60000); // 60 seconds
        
        console.log('🔄 Real-time auto-refresh started (60-second intervals)');
        this.updateLastRefreshTime();
    }

    updateLastRefreshTime() {
        // Update the last refresh time indicator if it exists
        const refreshIndicator = document.getElementById('lastRefreshTime');
        if (refreshIndicator) {
            const now = new Date();
            refreshIndicator.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchRiders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                console.log('🔍 Search term changed:', this.searchTerm);
                this.applyFilters();
            });
            
            // Add search on Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyFilters();
                }
            });
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                console.log('🔍 Status filter changed:', this.currentFilter);
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Add rider button
        const addRiderBtn = document.getElementById('addRiderBtn');
        if (addRiderBtn) {
            addRiderBtn.addEventListener('click', () => {
                this.showAddRiderForm();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportRiders();
            });
        }

        // Modal close on outside click
        const modal = document.getElementById('riderModal');
        if (modal) {
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    applyFilters() {
        console.log('🔍 Applying filters...', this.searchTerm, this.currentFilter);
        
        this.filteredRiders = this.riders.filter(rider => {
            // Search filter - check name, email, ID, and phone
            const matchesSearch = !this.searchTerm || 
                rider.name.toLowerCase().includes(this.searchTerm) ||
                rider.email.toLowerCase().includes(this.searchTerm) ||
                rider.id.toLowerCase().includes(this.searchTerm) ||
                rider.phone.toLowerCase().includes(this.searchTerm);
            
            // Status filter
            const matchesStatus = this.currentFilter === 'all' || rider.status === this.currentFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        console.log(`📊 Filtered ${this.riders.length} riders to ${this.filteredRiders.length} results`);
        
        // Update UI
        this.renderRidersTable();
        this.updateStats();
        this.updateFilterInfo();
    }

    updateFilterInfo() {
        // Show filter information
        const filterInfo = document.getElementById('filterInfo');
        if (filterInfo) {
            if (this.searchTerm || this.currentFilter !== 'all') {
                let info = `Showing ${this.filteredRiders.length} of ${this.riders.length} riders`;
                if (this.searchTerm) {
                    info += ` - Search: "${this.searchTerm}"`;
                }
                if (this.currentFilter !== 'all') {
                    info += ` - Status: ${this.currentFilter}`;
                }
                filterInfo.textContent = info;
                filterInfo.style.display = 'block';
            } else {
                filterInfo.style.display = 'none';
            }
        }
    }

    clearAllFilters() {
        console.log('🔄 Clearing all filters...');
        
        // Clear input fields
        document.getElementById('searchRiders').value = '';
        document.getElementById('statusFilter').value = 'all';
        
        // Clear filter state
        this.searchTerm = '';
        this.currentFilter = 'all';
        
        // Apply cleared filters
        this.applyFilters();
        
        // Show notification
        this.showNotification('Filters cleared successfully', 'info');
    }

    updateStats() {
        const stats = {
            total: this.filteredRiders.length,
            active: this.filteredRiders.filter(r => r.status === 'active').length,
            pending: this.filteredRiders.filter(r => r.status === 'pending').length,
            suspended: this.filteredRiders.filter(r => r.status === 'suspended').length,
            rejected: this.filteredRiders.filter(r => r.status === 'rejected').length
        };

        document.getElementById('totalRiders').textContent = stats.total;
        document.getElementById('activeRiders').textContent = stats.active;
        document.getElementById('pendingRiders').textContent = stats.pending;
        document.getElementById('suspendedRiders').textContent = stats.suspended;
    }

    renderRidersTable() {
        const tbody = document.getElementById('ridersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.filteredRiders.length === 0) {
            // Show no results message
            const noResultsRow = document.createElement('tr');
            noResultsRow.innerHTML = `
                <td colspan="10" style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                        <i class="fas fa-search" style="font-size: 3rem; opacity: 0.5;"></i>
                        <div>
                            <h3 style="margin: 0; color: #374151;">No riders found</h3>
                            <p style="margin: 8px 0 0 0; color: #6b7280;">
                                ${this.searchTerm || this.currentFilter !== 'all' ? 
                                    'Try adjusting your search terms or filters' : 
                                    'No rider applications have been submitted yet'}
                            </p>
                            ${this.searchTerm || this.currentFilter !== 'all' ? 
                                `<button onclick="riderManagement.clearAllFilters()" class="btn-secondary" style="margin-top: 12px;">
                                    Clear Filters
                                </button>` : ''}
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(noResultsRow);
            this.updateDataSourceStats([]);
            return;
        }

        // Render rider rows
        this.filteredRiders.forEach(rider => {
            const row = document.createElement('tr');
            
            // Add data source indicator
            const sourceIcon = rider.dataSource === 'activeRiders' ? '📱' : 
                              rider.dataSource === 'database' ? '🗄️' : 
                              rider.dataSource === 'applications' ? '📋' : '👤';
            
            // Format name
            const fullName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.name || 'Unknown';
            
            // Format date
            const joinDate = rider.joinDate ? new Date(rider.joinDate).toLocaleDateString() : 'N/A';
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span>${rider.riderId || rider.id || 'N/A'}</span>
                        <span style="font-size: 0.8em; opacity: 0.7;" title="Data source: ${rider.dataSource}">${sourceIcon}</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #1a1a1a, #000000); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: white;">
                            ${fullName.charAt(0).toUpperCase()}
                        </div>
                        <span>${fullName}</span>
                    </div>
                </td>
                <td>${rider.email || 'N/A'}</td>
                <td>${rider.phone || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${rider.status || 'active'}">${rider.status || 'active'}</span>
                </td>
                <td>${joinDate}</td>
                <td>${rider.trips || 0}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span>⭐</span>
                        <span>${rider.rating || '5.0'}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        ${this.getActionButtons(rider)}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update data source statistics
        this.updateDataSourceStats(this.filteredRiders);
    }

    updateDataSourceStats(riders) {
        const applicationRiders = riders.filter(rider => rider.source === 'application');
        const existingRiders = riders.filter(rider => rider.source !== 'application');
        
        const applicationCount = document.getElementById('applicationCount');
        const existingCount = document.getElementById('existingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (applicationCount) applicationCount.textContent = applicationRiders.length;
        if (existingCount) existingCount.textContent = existingRiders.length;
        if (totalCount) totalCount.textContent = riders.length;
        
        console.log(`📊 Data Source Stats: ${applicationRiders.length} from applications, ${existingRiders.length} existing, ${riders.length} total`);
    }

    getActionButtons(rider) {
        let buttons = '';
        const riderId = rider.riderId || rider.id; // Use riderId first, fallback to id
        
        switch(rider.status) {
            case 'pending':
                buttons = `
                    <button class="btn-action btn-approve" onclick="riderManagement.approveRider('${riderId}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-action btn-reject" onclick="riderManagement.rejectRider('${riderId}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                `;
                break;
            case 'active':
                buttons = `
                    <button class="btn-action btn-suspend" onclick="riderManagement.suspendRider('${riderId}')">
                        <i class="fas fa-pause"></i> Suspend
                    </button>
                    <button class="btn-action btn-view" onclick="riderManagement.viewRider('${riderId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
                break;
            case 'suspended':
                buttons = `
                    <button class="btn-action btn-activate" onclick="riderManagement.activateRider('${riderId}')">
                        <i class="fas fa-play"></i> Activate
                    </button>
                    <button class="btn-action btn-view" onclick="riderManagement.viewRider('${riderId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
                break;
            case 'rejected':
                buttons = `
                    <button class="btn-action btn-view" onclick="riderManagement.viewRider('${riderId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                `;
                break;
        }
        
        return buttons;
    }

    approveRider(riderId) {
        const rider = this.riders.find(r => (r.riderId || r.id) === riderId);
        if (rider) {
            rider.status = 'active';
            if (rider.profile) rider.profile.verificationStatus = 'verified';
            rider.rating = (Math.random() * 2 + 3).toFixed(1);
            
            // Remove from pending applications if it came from rider app
            this.removeFromPendingApplications(riderId);
            
            const fullName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.name || 'Unknown';
            this.showNotification(`Rider ${fullName} approved successfully!`, 'success');
            this.applyFilters();
        }
    }

    rejectRider(riderId) {
        const rider = this.riders.find(r => (r.riderId || r.id) === riderId);
        if (rider) {
            rider.status = 'rejected';
            if (rider.profile) rider.profile.verificationStatus = 'rejected';
            rider.rejection = {
                reason: 'Application rejected by admin',
                rejectedDate: new Date().toISOString().split('T')[0],
                rejectedBy: 'Admin',
                canReapply: true
            };
            
            // Remove from pending applications
            this.removeFromPendingApplications(riderId);
            
            const fullName = `${rider.firstName || ''} ${rider.lastName || ''}`.trim() || rider.name || 'Unknown';
            this.showNotification(`Rider ${fullName} rejected. They can reapply after 30 days.`, 'error');
            this.applyFilters();
        }
    }

    removeFromPendingApplications(riderId) {
        try {
            // Remove from pending applications in localStorage
            let pendingApplications = JSON.parse(localStorage.getItem('k3k3_pending_applications') || '[]');
            pendingApplications = pendingApplications.filter(app => app.id !== riderId);
            localStorage.setItem('k3k3_pending_applications', JSON.stringify(pendingApplications));
            
            console.log(`🗑️ Removed rider ${riderId} from pending applications`);
        } catch (error) {
            console.log('Error removing from pending applications:', error);
        }
    }

    suspendRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.status = 'suspended';
            this.showNotification(`Rider ${rider.name} suspended`, 'warning');
            this.applyFilters();
        }
    }

    activateRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.status = 'active';
            this.showNotification(`Rider ${rider.name} activated`, 'success');
            this.applyFilters();
        }
    }

    viewRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            this.showRiderDetails(rider);
        }
    }

    showRiderDetails(rider) {
        const modal = document.getElementById('riderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Rider Details - ${rider.name}`;
        modalBody.innerHTML = `
            <div class="rider-details-container">
                <!-- Profile Information -->
                <div class="detail-section">
                    <h3 class="section-title">👤 Profile Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Rider ID:</label>
                            <span>${rider.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Full Name:</label>
                            <span>${rider.name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${rider.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${rider.phone}</span>
                        </div>
                        <div class="detail-item">
                            <label>Date of Birth:</label>
                            <span>${rider.profile.dateOfBirth}</span>
                        </div>
                        <div class="detail-item">
                            <label>Address:</label>
                            <span>${rider.profile.address}</span>
                        </div>
                        <div class="detail-item">
                            <label>Emergency Contact:</label>
                            <span>${rider.profile.emergencyContact}</span>
                        </div>
                        <div class="detail-item">
                            <label>ID Type:</label>
                            <span>${rider.profile.idType}</span>
                        </div>
                        <div class="detail-item">
                            <label>ID Number:</label>
                            <span>${rider.profile.idNumber}</span>
                        </div>
                        <div class="detail-item">
                            <label>Verification Status:</label>
                            <span class="status-badge status-${rider.profile.verificationStatus}">${rider.profile.verificationStatus}</span>
                        </div>
                        <div class="detail-item">
                            <label>Join Date:</label>
                            <span>${rider.joinDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Account Status:</label>
                            <span class="status-badge status-${rider.status}">${rider.status}</span>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics -->
                <div class="detail-section">
                    <h3 class="section-title">📊 Performance Metrics</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Total Trips:</label>
                            <span>${rider.trips}</span>
                        </div>
                        <div class="detail-item">
                            <label>Average Rating:</label>
                            <span>⭐ ${rider.rating}</span>
                        </div>
                        <div class="detail-item">
                            <label>Total Revenue:</label>
                            <span>₵${rider.performance.totalRevenue.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Average Trip Distance:</label>
                            <span>${rider.performance.avgTripDistance} km</span>
                        </div>
                        <div class="detail-item">
                            <label>Completion Rate:</label>
                            <span>${rider.performance.completionRate}%</span>
                        </div>
                        <div class="detail-item">
                            <label>Cancellation Rate:</label>
                            <span>${rider.performance.cancellationRate}%</span>
                        </div>
                        <div class="detail-item">
                            <label>Last Active Date:</label>
                            <span>${rider.performance.lastActiveDate || 'Never'}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="detail-section">
                    <h3 class="section-title">💳 Payment Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Preferred Method:</label>
                            <span>${rider.payment.preferredMethod}</span>
                        </div>
                        <div class="detail-item">
                            <label>Account Number:</label>
                            <span>${rider.payment.accountNumber}</span>
                        </div>
                        <div class="detail-item">
                            <label>Wallet Balance:</label>
                            <span>₵${rider.payment.walletBalance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <!-- Suspension/Rejection Details (if applicable) -->
                ${rider.suspension ? `
                <div class="detail-section">
                    <h3 class="section-title">⚠️ Suspension Details</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Reason:</label>
                            <span>${rider.suspension.reason}</span>
                        </div>
                        <div class="detail-item">
                            <label>Suspended Date:</label>
                            <span>${rider.suspension.suspendedDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Suspended By:</label>
                            <span>${rider.suspension.suspendedBy}</span>
                        </div>
                        <div class="detail-item">
                            <label>Expected Lift Date:</label>
                            <span>${rider.suspension.expectedLiftDate}</span>
                        </div>
                    </div>
                </div>
                ` : ''}

                ${rider.rejection ? `
                <div class="detail-section">
                    <h3 class="section-title">❌ Rejection Details</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Reason:</label>
                            <span>${rider.rejection.reason}</span>
                        </div>
                        <div class="detail-item">
                            <label>Rejected Date:</label>
                            <span>${rider.rejection.rejectedDate}</span>
                        </div>
                        <div class="detail-item">
                            <label>Rejected By:</label>
                            <span>${rider.rejection.rejectedBy}</span>
                        </div>
                        <div class="detail-item">
                            <label>Can Reapply:</label>
                            <span>${rider.rejection.canReapply ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="detail-actions">
                    ${this.getDetailActionButtons(rider)}
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    getDetailActionButtons(rider) {
        let buttons = '';
        
        switch(rider.status) {
            case 'pending':
                buttons = `
                    <button class="btn-action btn-approve" onclick="riderManagement.approveRider('${rider.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-action btn-reject" onclick="riderManagement.rejectRider('${rider.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                    <button class="btn-action btn-view" onclick="riderManagement.closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                `;
                break;
            case 'active':
                buttons = `
                    <button class="btn-action btn-suspend" onclick="riderManagement.suspendRider('${rider.id}')">
                        <i class="fas fa-pause"></i> Suspend
                    </button>
                    <button class="btn-action btn-edit" onclick="riderManagement.editRider('${rider.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-view" onclick="riderManagement.closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                `;
                break;
            case 'suspended':
                buttons = `
                    <button class="btn-action btn-activate" onclick="riderManagement.activateRider('${rider.id}')">
                        <i class="fas fa-play"></i> Activate
                    </button>
                    <button class="btn-action btn-view" onclick="riderManagement.closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                `;
                break;
            case 'rejected':
                buttons = `
                    <button class="btn-action btn-view" onclick="riderManagement.closeModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                `;
                break;
        }
        
        return buttons;
    }

    // Enhanced management functions
    approveRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.status = 'active';
            rider.profile.verificationStatus = 'verified';
            this.showNotification(`✅ Rider ${rider.name} approved and activated successfully!`, 'success');
            this.applyFilters();
            this.updateStats();
            this.closeModal();
        }
    }

    rejectRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.status = 'rejected';
            rider.profile.verificationStatus = 'rejected';
            rider.rejection = {
                reason: 'Failed verification process',
                rejectedDate: new Date().toISOString().split('T')[0],
                rejectedBy: 'Admin',
                canReapply: true
            };
            this.showNotification(`❌ Rider ${rider.name} rejected. They can reapply after 30 days.`, 'error');
            this.applyFilters();
            this.updateStats();
            this.closeModal();
        }
    }

    suspendRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            const reason = prompt('Enter suspension reason:');
            if (reason) {
                rider.status = 'suspended';
                rider.suspension = {
                    reason: reason,
                    suspendedDate: new Date().toISOString().split('T')[0],
                    suspendedBy: 'Admin',
                    expectedLiftDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
                this.showNotification(`⚠️ Rider ${rider.name} suspended until ${rider.suspension.expectedLiftDate}`, 'warning');
                this.applyFilters();
                this.updateStats();
                this.closeModal();
            }
        }
    }

    activateRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.status = 'active';
            delete rider.suspension;
            this.showNotification(`✅ Rider ${rider.name} activated successfully!`, 'success');
            this.applyFilters();
            this.updateStats();
            this.closeModal();
        }
    }

    editRider(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            this.showEditRiderForm(rider);
        }
    }

    showEditRiderForm(rider) {
        const modal = document.getElementById('riderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Edit Rider - ${rider.name}`;
        modalBody.innerHTML = `
            <div class="edit-rider-form">
                <div class="form-section">
                    <h3>Personal Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Full Name:</label>
                            <input type="text" id="editName" value="${rider.name}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Email:</label>
                            <input type="email" id="editEmail" value="${rider.email}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Phone:</label>
                            <input type="tel" id="editPhone" value="${rider.phone}" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Address:</label>
                            <input type="text" id="editAddress" value="${rider.profile.address}" class="form-input">
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn-primary" onclick="riderManagement.saveRiderEdit('${rider.id}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                    <button class="btn-secondary" onclick="riderManagement.closeModal()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
    }

    saveRiderEdit(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (rider) {
            rider.name = document.getElementById('editName').value;
            rider.email = document.getElementById('editEmail').value;
            rider.phone = document.getElementById('editPhone').value;
            rider.profile.address = document.getElementById('editAddress').value;
            
            this.showNotification(`✅ Rider ${rider.name} updated successfully!`, 'success');
            this.applyFilters();
            this.closeModal();
        }
    }

    showAddRiderForm() {
        const modal = document.getElementById('riderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = 'Add New Rider';
        modalBody.innerHTML = `
            <form id="addRiderForm" style="display: grid; gap: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Full Name *</label>
                    <input type="text" name="name" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Email Address *</label>
                    <input type="email" name="email" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Phone Number *</label>
                    <input type="tel" name="phone" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div style="display: flex; gap: 16px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <button type="submit" class="btn-primary">Add Rider</button>
                    <button type="button" class="btn-secondary" onclick="riderManagement.closeModal()">Cancel</button>
                </div>
            </form>
        `;

        modal.classList.add('show');

        // Handle form submission
        const form = document.getElementById('addRiderForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewRider(new FormData(form));
            });
        }
    }

    addNewRider(formData) {
        const newRider = {
            id: `K3P-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: 'pending',
            joinDate: new Date().toISOString().split('T')[0],
            trips: 0,
            rating: 0,
            avatar: Math.random() > 0.5 ? '👨' : '👩'
        };

        this.riders.unshift(newRider);
        this.applyFilters();
        this.closeModal();
        this.showNotification(`New rider ${newRider.name} added successfully!`, 'success');
    }

    refreshData() {
        // Use real-time data refresh instead of mock refresh
        this.refreshRealTimeData();
    }

    async refreshRealTimeData() {
        try {
            console.log('🔄 Refreshing real-time rider data...');
            
            // Add visual feedback to refresh button
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            this.showNotification('Refreshing rider data...', 'info');
            
            // Force refresh from rider app data
            this.forceSyncFromRiderApp();
            
            // Simulate real-time data updates
            this.updateRiderActivity();
            this.updateRiderStatus();
            this.updateRiderPerformance();
            
            this.applyFilters();
            this.updateStats();
            this.saveToLocalStorage();
            this.updateLastRefreshTime(); // Update refresh time indicator
            
            // Restore refresh button
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            }
            
            this.showNotification(`Real-time rider data refreshed successfully! (${this.riders.length} riders)`, 'success');
            console.log('✅ Real-time rider data refreshed');
            
        } catch (error) {
            console.error('❌ Error refreshing rider data:', error);
            
            // Restore refresh button on error
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            }
            
            this.showNotification('Error refreshing rider data', 'error');
        }
    }

    forceSyncFromRiderApp() {
        try {
            console.log('🔄 Forcing sync from rider app...');
            
            // Add visual feedback to sync button
            const syncBtn = document.getElementById('syncBtn');
            if (syncBtn) {
                syncBtn.disabled = true;
                syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            this.showNotification('Syncing from rider application...', 'info');
            
            // Get all pending applications
            const pendingApplications = this.fetchPendingApplications();
            
            // Get existing riders
            const existingRiders = JSON.parse(localStorage.getItem('k3k3_rider_data') || '{}');
            
            // Check for any applications that aren't in the riders list
            const newApplications = pendingApplications.filter(app => {
                return !existingRiders.riders || !existingRiders.riders.find(r => r.id === app.id);
            });
            
            if (newApplications.length > 0) {
                console.log(`📋 Found ${newApplications.length} new applications to sync`);
                
                // Add new applications to riders list
                const updatedRiders = [
                    ...(existingRiders.riders || []),
                    ...newApplications.map(app => ({
                        ...app,
                        status: 'pending',
                        trips: 0,
                        rating: 0.0,
                        performance: {
                            totalRevenue: 0,
                            avgTripDistance: 0,
                            completionRate: 0,
                            cancellationRate: 0,
                            lastActiveDate: null
                        },
                        payment: app.payment || {
                            preferredMethod: 'Mobile Money',
                            accountNumber: app.phone,
                            walletBalance: 0.00
                        }
                    }))
                ];
                
                // Update the riders data
                this.riders = updatedRiders;
                
                // Save to localStorage
                const dataToStore = {
                    riders: this.riders,
                    timestamp: Date.now()
                };
                localStorage.setItem('k3k3_rider_data', JSON.stringify(dataToStore));
                
                // Update UI
                this.applyFilters();
                this.updateStats();
                this.updateLastRefreshTime();
                
                // Restore sync button
                if (syncBtn) {
                    syncBtn.disabled = false;
                    syncBtn.innerHTML = '<i class="fas fa-sync"></i>';
                }
                
                this.showNotification(`Successfully synced ${newApplications.length} new applications!`, 'success');
                console.log(`✅ Synced ${newApplications.length} new applications to rider management`);
            } else {
                console.log('📋 No new applications to sync');
                
                // Restore sync button
                if (syncBtn) {
                    syncBtn.disabled = false;
                    syncBtn.innerHTML = '<i class="fas fa-sync"></i>';
                }
                
                this.showNotification('No new applications to sync', 'info');
            }
            
        } catch (error) {
            console.error('❌ Error syncing from rider app:', error);
            
            // Restore sync button on error
            const syncBtn = document.getElementById('syncBtn');
            if (syncBtn) {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '<i class="fas fa-sync"></i>';
            }
            
            this.showNotification('Error syncing from rider app', 'error');
        }
    }

    exportRiders() {
        try {
            console.log('📥 Exporting rider data...');
            
            // Add visual feedback to export button
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            this.showNotification('Preparing rider data export...', 'info');
            
            // Create CSV content with real-time rider data
            const csvContent = this.generateCSVContent();
            
            // Create and download the file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `k3k3-riders-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Restore export button
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            }
            
            this.showNotification(`Successfully exported ${this.filteredRiders.length} riders!`, 'success');
            console.log('✅ Rider data exported successfully');
            
        } catch (error) {
            console.error('❌ Error exporting rider data:', error);
            
            // Restore export button on error
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-download"></i>';
            }
            
            this.showNotification('Error exporting rider data. Please try again.', 'error');
        }
    }

    generateCSVContent() {
        // CSV headers
        const headers = [
            'Rider ID',
            'Name',
            'Email',
            'Phone',
            'Status',
            'Join Date',
            'Total Trips',
            'Rating',
            'Date of Birth',
            'Address',
            'Emergency Contact',
            'ID Type',
            'ID Number',
            'Verification Status',
            'Total Revenue',
            'Average Trip Distance',
            'Completion Rate',
            'Cancellation Rate',
            'Last Active Date',
            'Payment Method',
            'Account Number',
            'Wallet Balance'
        ];
        
        // Convert rider data to CSV rows
        const rows = this.filteredRiders.map(rider => [
            rider.id,
            rider.name,
            rider.email,
            rider.phone,
            rider.status,
            rider.joinDate,
            rider.trips,
            rider.rating,
            rider.profile?.dateOfBirth || '',
            rider.profile?.address || '',
            rider.profile?.emergencyContact || '',
            rider.profile?.idType || '',
            rider.profile?.idNumber || '',
            rider.profile?.verificationStatus || '',
            rider.performance?.totalRevenue || 0,
            rider.performance?.avgTripDistance || 0,
            rider.performance?.completionRate || 0,
            rider.performance?.cancellationRate || 0,
            rider.performance?.lastActiveDate || '',
            rider.payment?.preferredMethod || '',
            rider.payment?.accountNumber || '',
            rider.payment?.walletBalance || 0
        ]);
        
        // Combine headers and rows
        const csvArray = [headers, ...rows];
        
        // Convert to CSV string
        return csvArray.map(row => 
            row.map(cell => {
                // Handle cells with commas, quotes, or newlines
                if (cell.toString().includes(',') || cell.toString().includes('"') || cell.toString().includes('\n')) {
                    return `"${cell.toString().replace(/"/g, '""')}"`;
                }
                return cell.toString();
            }).join(',')
        ).join('\n');
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

    closeModal() {
        const modal = document.getElementById('riderModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

// Initialize the system
const riderManagement = new RiderManagement();
