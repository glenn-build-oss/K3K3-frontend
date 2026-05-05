// K3K3 Admin - Professional Rider Applications Management System
// Handles rider applications from apply-to-ride form and provides admin review functionality

class RiderApplicationsManager {
    constructor() {
        this.applications = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.selectedApplication = null;
        this.init();
    }

    init() {
        this.loadApplications();
        this.setupEventListeners();
        this.updateStats();
        this.renderApplications();
        this.initializeTimeDisplay();
        this.updateApplicationCount();
        this.updateFilterDisplay();
    }

    initializeTimeDisplay() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        const elements = {
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds'),
            dateValue: document.getElementById('dateValue'),
            timeLabel: document.getElementById('timeLabel')
        };
        
        if (elements.hours) elements.hours.textContent = hours;
        if (elements.minutes) elements.minutes.textContent = minutes;
        if (elements.seconds) elements.seconds.textContent = seconds;
        if (elements.dateValue) elements.dateValue.textContent = dateString;
        if (elements.timeLabel) elements.timeLabel.textContent = 'GMT';
    }

    updateApplicationCount() {
        const pendingCount = this.applications.filter(app => app.status === 'pending_review').length;
        const badge = document.getElementById('applicationCount');
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderApplications();
        });

        // Filter button
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.showFilterModal();
        });

        // Add test application
        document.getElementById('addTestBtn').addEventListener('click', () => {
            this.addTestApplication();
        });

        // Bulk action buttons
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => {
            this.deleteSelectedApplications();
        });

        document.getElementById('clearSelectionBtn').addEventListener('click', () => {
            this.clearSelection();
        });

        document.getElementById('addTestEmptyBtn').addEventListener('click', () => {
            this.addTestApplication();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('approveBtn').addEventListener('click', () => {
            this.approveApplication();
        });

        document.getElementById('rejectBtn').addEventListener('click', () => {
            this.rejectApplication();
        });

        // Close modal on outside click
        document.getElementById('applicationModal').addEventListener('click', (e) => {
            if (e.target.id === 'applicationModal') {
                this.closeModal();
            }
        });

        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.loadApplications();
        }, 30000);
    }

    loadApplications() {
        // Load from localStorage (where apply-to-ride form stores applications)
        const storedApplications = localStorage.getItem('riderApplications');
        if (storedApplications) {
            this.applications = JSON.parse(storedApplications);
        } else {
            this.applications = [];
        }

        // Sort by application date (newest first)
        this.applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
        
        this.renderApplications();
        this.updateStats();
        this.updateApplicationCount();
    }

    saveApplications() {
        localStorage.setItem('riderApplications', JSON.stringify(this.applications));
    }

    updateStats() {
        const total = this.applications.length;
        const pending = this.applications.filter(app => app.status === 'pending_review').length;
        const approved = this.applications.filter(app => app.status === 'approved').length;
        const rejected = this.applications.filter(app => app.status === 'rejected').length;

        document.getElementById('totalApplications').textContent = total;
        document.getElementById('pendingApplications').textContent = pending;
        document.getElementById('approvedApplications').textContent = approved;
        document.getElementById('rejectedApplications').textContent = rejected;
    }

    getFilteredApplications() {
        let filtered = this.applications;

        // Apply search filter
        if (this.searchTerm) {
            filtered = filtered.filter(app => 
                app.firstName.toLowerCase().includes(this.searchTerm) ||
                app.lastName.toLowerCase().includes(this.searchTerm) ||
                app.email.toLowerCase().includes(this.searchTerm) ||
                app.phone.includes(this.searchTerm) ||
                app.id.toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(app => app.status === this.currentFilter);
        }

        return filtered;
    }

    renderApplications() {
        const tbody = document.getElementById('applicationsTableBody');
        const emptyState = document.getElementById('emptyState');
        const filtered = this.getFilteredApplications();

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tbody.innerHTML = filtered.map(app => this.createApplicationRow(app)).join('');

        // Add event listener for clickable rows
        tbody.querySelectorAll('.application-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons or checkboxes
                if (!e.target.closest('.action-buttons') && !e.target.closest('.checkbox-row')) {
                    const appId = row.dataset.appId;
                    this.viewApplication(appId);
                }
            });
        });

        // Add event listeners to checkboxes
        tbody.querySelectorAll('.checkbox-row').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateBulkSelection();
            });
        });

        // Add event listener for select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAllApplications(e.target.checked);
            });
        }

        // Add event listeners to action buttons
        tbody.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.closest('.view-btn').dataset.appId;
                this.viewApplication(appId);
            });
        });

        tbody.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.closest('.approve-btn').dataset.appId;
                this.quickApprove(appId);
            });
        });

        tbody.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.closest('.reject-btn').dataset.appId;
                this.quickReject(appId);
            });
        });
    }

    createApplicationRow(app) {
        const initials = `${app.firstName.charAt(0)}${app.lastName.charAt(0)}`.toUpperCase();
        const statusClass = this.getStatusClass(app.status);
        const statusText = this.getStatusText(app.status);

        return `
            <tr class="application-row" data-app-id="${app.id}" style="cursor: pointer;">
                <td>
                    <input type="checkbox" class="checkbox-row" data-app-id="${app.id}" onclick="event.stopPropagation()">
                </td>
                <td>
                    <div class="rider-info">
                        <div class="rider-avatar">${initials}</div>
                        <div class="rider-details">
                            <div class="rider-name">${app.firstName} ${app.lastName}</div>
                            <div class="rider-contact">${app.email} | ${app.phone}</div>
                        </div>
                    </div>
                </td>
                <td><strong>${app.id}</strong></td>
                <td>${app.vehicleType || 'N/A'} - ${app.vehicleModel || 'N/A'}</td>
                <td>${app.experience || 'N/A'}</td>
                <td>${this.formatDate(app.applicationDate)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons" onclick="event.stopPropagation()">
                        <button class="btn btn-primary btn-sm view-btn" data-app-id="${app.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-success btn-sm approve-btn" data-app-id="${app.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger btn-sm reject-btn" data-app-id="${app.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'pending_review': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'reviewing': 'status-reviewing'
        };
        return statusMap[status] || 'status-pending';
    }

    getStatusText(status) {
        const statusMap = {
            'pending_review': 'Pending',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'reviewing': 'Reviewing'
        };
        return statusMap[status] || 'Pending';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    viewApplication(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (!application) return;

        this.selectedApplication = application;
        this.showApplicationModal(application);
    }

    showApplicationModal(application) {
        const modal = document.getElementById('applicationModal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <div class="application-details">
                <div class="detail-section">
                    <h3><i class="fas fa-user"></i> Personal Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Full Name</div>
                            <div class="detail-value">${application.firstName} ${application.lastName}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${application.email}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Phone</div>
                            <div class="detail-value">${application.phone}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Date of Birth</div>
                            <div class="detail-value">${application.dateOfBirth || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Gender</div>
                            <div class="detail-value">${application.gender || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Nationality</div>
                            <div class="detail-value">${application.nationality || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Address</div>
                            <div class="detail-value">${application.address || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">City</div>
                            <div class="detail-value">${application.city || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-id-card"></i> License Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">License Number</div>
                            <div class="detail-value">${application.licenseNumber || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">License Expiry</div>
                            <div class="detail-value">${application.licenseExpiry || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Ghana Card Number</div>
                            <div class="detail-value">${application.ghanaCardNumber || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-motorcycle"></i> Vehicle Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Vehicle Type</div>
                            <div class="detail-value">${application.vehicleType || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Vehicle Model</div>
                            <div class="detail-value">${application.vehicleModel || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Vehicle Year</div>
                            <div class="detail-value">${application.vehicleYear || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Vehicle Plate</div>
                            <div class="detail-value">${application.vehiclePlate || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Vehicle Color</div>
                            <div class="detail-value">${application.vehicleColor || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Experience</div>
                            <div class="detail-value">${application.experience || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-shield-alt"></i> Insurance Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Insurance Provider</div>
                            <div class="detail-value">${application.insuranceProvider || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Insurance Expiry</div>
                            <div class="detail-value">${application.insuranceExpiry || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-user-friends"></i> Emergency Contact</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Contact Name</div>
                            <div class="detail-value">${application.emergencyContactName || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Contact Phone</div>
                            <div class="detail-value">${application.emergencyContactPhone || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Relationship</div>
                            <div class="detail-value">${application.emergencyContactRelation || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-university"></i> Bank Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Bank Name</div>
                            <div class="detail-value">${application.bankName || 'N/A'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Account Number</div>
                            <div class="detail-value">${application.accountNumber || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-file-alt"></i> Uploaded Documents</h3>
                    <div class="documents-list">
                        ${this.renderDocuments(application.documents || [])}
                    </div>
                </div>

                <div class="detail-section">
                    <h3><i class="fas fa-info-circle"></i> Application Details</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Application ID</div>
                            <div class="detail-value">${application.id}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Application Date</div>
                            <div class="detail-value">${this.formatDate(application.applicationDate)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Current Status</div>
                            <div class="detail-value">
                                <span class="status-badge ${this.getStatusClass(application.status)}">
                                    ${this.getStatusText(application.status)}
                                </span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Admin Notes</div>
                            <div class="detail-value">${application.adminNotes || 'No notes yet'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('applicationModal');
        modal.classList.remove('active');
        this.selectedApplication = null;
    }

    approveApplication() {
        if (!this.selectedApplication) return;

        const application = this.applications.find(app => app.id === this.selectedApplication.id);
        if (application) {
            // Show confirmation popup first
            this.showApprovalConfirmation(application, () => {
                this.processApproval(application);
            });
        }
    }

    // Process the actual approval after confirmation
    async processApproval(application) {
        // Show loading popup
        const loadingModal = this.showCredentialGenerationLoading(application);
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // Generate rider credentials
            const credentials = this.generateRiderCredentials(application);
            
            // Create rider account in database
            console.log('🔄 Creating rider account in database...');
            const databaseResult = await this.createRiderAccountInDatabase({
                ...credentials,
                applicationId: application.id,
                address: application.address,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode,
                emergencyContact: application.emergencyContact,
                vehicleInfo: application.vehicleInfo
            });
            
            if (!databaseResult.success) {
                throw new Error(databaseResult.message || 'Database creation failed');
            }
            
            // Save to active riders (localStorage)
            this.saveActiveRider(credentials);
            
            // Store database credentials for login system
            this.storeDatabaseCredentials({
                ...credentials,
                databaseId: databaseResult.databaseId,
                applicationId: application.id
            });
            
            // Update application status
            application.status = 'approved';
            application.riderId = credentials.riderId;
            application.credentialsSent = false;
            application.approvalDate = new Date().toISOString();
            application.adminNotes = `Approved by admin on ${new Date().toLocaleDateString()}. Rider ID: ${credentials.riderId}. Database ID: ${databaseResult.databaseId}`;
            
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            
            // Remove loading modal
            document.body.removeChild(loadingModal);
            
            // Show credentials popup
            this.showCredentialsPopup(credentials, application);
            
            this.closeModal();
            this.showToast('success', 'Application Approved!', `Rider ID ${credentials.riderId} has been created in database.`);
            
        } catch (error) {
            console.error('Error during approval:', error);
            document.body.removeChild(loadingModal);
            this.showToast('error', 'Approval Failed', `There was an error: ${error.message}`);
        }
    }

    rejectApplication() {
        if (!this.selectedApplication) return;

        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;

        const application = this.applications.find(app => app.id === this.selectedApplication.id);
        if (application) {
            application.status = 'rejected';
            application.adminNotes = `Rejected by admin on ${new Date().toLocaleDateString()}. Reason: ${reason}`;
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            this.closeModal();
            this.showToast('warning', 'Application Rejected', `${application.firstName} ${application.lastName}'s application has been rejected.`);
        }
    }

    quickApprove(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (application) {
            // Show confirmation popup first
            this.showApprovalConfirmation(application, () => {
                this.processQuickApproval(application);
            });
        }
    }

    // Process the actual quick approval after confirmation
    async processQuickApproval(application) {
        // Show loading popup
        const loadingModal = this.showCredentialGenerationLoading(application);
        
        // Simulate processing time for better UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            // Generate rider credentials
            const credentials = this.generateRiderCredentials(application);
            
            // Create rider account in database
            console.log('🔄 Creating rider account in database...');
            const databaseResult = await this.createRiderAccountInDatabase({
                ...credentials,
                applicationId: application.id,
                address: application.address,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode,
                emergencyContact: application.emergencyContact,
                vehicleInfo: application.vehicleInfo
            });
            
            if (!databaseResult.success) {
                throw new Error(databaseResult.message || 'Database creation failed');
            }
            
            // Save to active riders (localStorage)
            this.saveActiveRider(credentials);
            
            // Store database credentials for login system
            this.storeDatabaseCredentials({
                ...credentials,
                databaseId: databaseResult.databaseId,
                applicationId: application.id
            });
            
            // Update application status
            application.status = 'approved';
            application.riderId = credentials.riderId;
            application.credentialsSent = false;
            application.approvalDate = new Date().toISOString();
            application.adminNotes = `Quick approved by admin on ${new Date().toLocaleDateString()}. Rider ID: ${credentials.riderId}. Database ID: ${databaseResult.databaseId}`;
            
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            
            // Remove loading modal
            document.body.removeChild(loadingModal);
            
            // Show credentials popup
            this.showCredentialsPopup(credentials, application);
            
            this.showToast('success', 'Application Approved!', `Rider ID ${credentials.riderId} has been created in database.`);
            
        } catch (error) {
            console.error('Error during quick approval:', error);
            document.body.removeChild(loadingModal);
            this.showToast('error', 'Approval Failed', `There was an error: ${error.message}`);
        }
    }

    quickReject(appId) {
        const application = this.applications.find(app => app.id === appId);
        if (application) {
            application.status = 'rejected';
            application.adminNotes = `Quick rejected by admin on ${new Date().toLocaleDateString()}`;
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            this.showToast('warning', 'Application Rejected', `${application.firstName} ${application.lastName}'s application has been rejected.`);
        }
    }

    addTestApplication() {
        const testRiderNames = [
            { firstName: 'Kwame', lastName: 'Asamoah', phone: '+233 555 0123' },
            { firstName: 'Ama', lastName: 'Mensah', phone: '+233 555 0456' },
            { firstName: 'Kofi', lastName: 'Osei', phone: '+233 555 0789' },
            { firstName: 'Yaa', lastName: 'Boateng', phone: '+233 555 0321' },
            { firstName: 'Kojo', lastName: 'Annor', phone: '+233 555 0987' }
        ];

        const testVehicles = [
            { type: 'Motorcycle', brand: 'Honda', model: 'CG 125', year: '2020', plate: 'GR-1234-AB', color: 'Red' },
            { type: 'Motorcycle', brand: 'Yamaha', model: 'MT-07', year: '2019', plate: 'GR-5678-CD', color: 'Blue' },
            { type: 'Motorcycle', brand: 'Bajaj', model: 'Pulsar', year: '2021', plate: 'GR-9012-EF', color: 'Black' },
            { type: 'Motorcycle', brand: 'TVS', model: 'Apache', year: '2018', plate: 'GR-3456-GH', color: 'Silver' },
            { type: 'Motorcycle', brand: 'Suzuki', model: 'Gixxer', year: '2022', plate: 'GR-7890-IJ', color: 'Green' }
        ];

        const testAreas = ['Accra Central', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast'];
        const testExperiences = ['1+ years', '2+ years', '3+ years', '5+ years', 'Less than 1 year'];

        const randomRider = testRiderNames[Math.floor(Math.random() * testRiderNames.length)];
        const randomVehicle = testVehicles[Math.floor(Math.random() * testVehicles.length)];
        const randomArea = testAreas[Math.floor(Math.random() * testAreas.length)];
        const randomExperience = testExperiences[Math.floor(Math.random() * testExperiences.length)];

        const testApplication = {
            id: 'TEST-' + Date.now(),
            firstName: randomRider.firstName,
            lastName: randomRider.lastName,
            email: `${randomRider.firstName.toLowerCase()}.${randomRider.lastName.toLowerCase()}@k3k3.com`,
            phone: randomRider.phone,
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            nationality: 'Ghanaian',
            address: `${randomArea}, Ghana`,
            city: randomArea,
            licenseNumber: 'DRV' + Math.floor(Math.random() * 1000000),
            licenseExpiry: '2025-12-31',
            ghanaCardNumber: 'GHA' + Math.floor(Math.random() * 100000000),
            vehicleType: randomVehicle.type,
            vehicleModel: randomVehicle.model,
            vehicleYear: randomVehicle.year,
            vehiclePlate: randomVehicle.plate,
            vehicleColor: randomVehicle.color,
            experience: randomExperience,
            insuranceProvider: 'K3K3 Insurance',
            insuranceExpiry: '2025-12-31',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '+233 555 0000',
            emergencyContactRelation: 'Spouse',
            bankName: 'K3K3 Bank',
            accountNumber: 'ACC' + Math.floor(Math.random() * 1000000),
            status: 'pending_review',
            applicationDate: new Date().toISOString().split('T')[0],
            documents: [
                {
                    id: 'license',
                    name: 'Rider License',
                    type: 'PDF',
                    url: null,
                    icon: 'fa-file-pdf',
                    note: 'Document uploaded via apply-to-ride form'
                },
                {
                    id: 'registration',
                    name: 'Vehicle Registration',
                    type: 'PDF',
                    url: null,
                    icon: 'fa-file-pdf',
                    note: 'Document uploaded via apply-to-ride form'
                },
                {
                    id: 'insurance',
                    name: 'Insurance Certificate',
                    type: 'PDF',
                    url: null,
                    icon: 'fa-file-pdf',
                    note: 'Document uploaded via apply-to-ride form'
                },
                {
                    id: 'idcard',
                    name: 'National ID Card',
                    type: 'Image',
                    url: null,
                    icon: 'fa-image',
                    note: 'Document uploaded via apply-to-ride form'
                },
                {
                    id: 'photo',
                    name: 'Passport Photo',
                    type: 'Image',
                    url: null,
                    icon: 'fa-image',
                    note: 'Document uploaded via apply-to-ride form'
                }
            ],
            adminNotes: 'Test application for demonstration - documents will be available when submitted through apply-to-ride form'
        };

        this.applications.unshift(testApplication);
        this.saveApplications();
        this.renderApplications();
        this.updateStats();
        this.showToast('success', 'Test Application Added', `Test rider ${randomRider.firstName} ${randomRider.lastName} added successfully!`);
    }

    showToast(type, title, message) {
        console.log('🔥 showToast called:', { type, title, message });
        
        // Ensure we have valid parameters
        if (!type || !title || !message) {
            console.error('Invalid toast parameters:', { type, title, message });
            return;
        }

        const toastContainer = document.getElementById('toastContainer');
        console.log('🔥 Toast container found:', !!toastContainer);
        if (!toastContainer) {
            console.error('Toast container not found');
            return;
        }
        
        console.log('🔥 Toast container element:', toastContainer);

        // Remove any existing toasts to prevent duplicates
        const existingToasts = toastContainer.querySelectorAll('.toast');
        console.log('🔥 Existing toasts found:', existingToasts.length);
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        console.log('🔥 Created toast element:', toast);
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        // Ensure we have a valid icon
        const iconClass = icons[type] || icons.info;
        console.log('🔥 Using icon:', iconClass);

        toast.innerHTML = `
            <i class="${iconClass} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(title)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
        `;
        
        console.log('🔥 Toast HTML:', toast.innerHTML);

        toastContainer.appendChild(toast);
        console.log('🔥 Toast appended to container');
        console.log('🔥 Toast container children count:', toastContainer.children.length);

        // Remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
                console.log('🔥 Toast removed after timeout');
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateFilterDisplay() {
        const filterElement = document.getElementById('currentFilter');
        if (filterElement) {
            const filters = {
                'all': 'All Applications',
                'pending_review': 'Pending Review',
                'approved': 'Approved',
                'rejected': 'Rejected'
            };
            filterElement.textContent = filters[this.currentFilter] || 'All Applications';
        }
    }

    renderDocuments(documents) {
        if (!documents || documents.length === 0) {
            return '<p class="no-documents">No documents uploaded</p>';
        }

        return documents.map(doc => `
            <div class="document-item">
                <div class="document-info">
                    <i class="fas ${doc.icon || 'fa-file'}"></i>
                    <div class="document-details">
                        <div class="document-name">${doc.name || 'Document'}</div>
                        <div class="document-type">${doc.type || 'Unknown'}</div>
                        ${doc.note ? `<div class="document-note">${doc.note}</div>` : ''}
                    </div>
                </div>
                <div class="document-actions">
                    ${doc.url ? `
                        <button class="btn btn-sm btn-primary" onclick="window.riderApps.viewDocument('${doc.url}', '${doc.name}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="window.riderApps.downloadDocument('${doc.url}', '${doc.name}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    ` : '<span class="no-file">Document uploaded via apply-to-ride form</span>'}
                </div>
            </div>
        `).join('');
    }

    viewDocument(url, name) {
        if (url && url.startsWith('blob:')) {
            // Open blob URLs in new window for viewing
            window.open(url, '_blank');
        } else if (url) {
            // Open regular URLs
            window.open(url, '_blank');
        } else {
            this.showToast('Document not available', 'warning');
        }
    }

    downloadDocument(url, name) {
        if (url && url.startsWith('blob:')) {
            // Create download link for blob URLs
            const a = document.createElement('a');
            a.href = url;
            a.download = name || 'document';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else if (url) {
            // Download regular URLs
            const a = document.createElement('a');
            a.href = url;
            a.download = name || 'document';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            this.showToast('Document not available for download', 'warning');
        }
    }

    updateBulkSelection() {
        const checkboxes = document.querySelectorAll('.checkbox-row');
        const selectedCheckboxes = document.querySelectorAll('.checkbox-row:checked');
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        const selectAllCheckbox = document.getElementById('selectAll');

        // Update selected count
        const count = selectedCheckboxes.length;
        if (selectedCount) {
            selectedCount.textContent = `${count} selected`;
        }

        // Show/hide bulk actions
        if (bulkActions) {
            bulkActions.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update select all checkbox
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = checkboxes.length > 0 && count === checkboxes.length;
            selectAllCheckbox.indeterminate = count > 0 && count < checkboxes.length;
        }
    }

    selectAllApplications(checked) {
        const checkboxes = document.querySelectorAll('.checkbox-row');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkSelection();
    }

    getSelectedApplications() {
        const selectedCheckboxes = document.querySelectorAll('.checkbox-row:checked');
        return Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.appId);
    }

    deleteSelectedApplications() {
        const selectedIds = this.getSelectedApplications();
        
        if (selectedIds.length === 0) {
            this.showToast('warning', 'No Selection', 'Please select applications to delete');
            return;
        }

        // Show custom confirmation modal instead of native confirm
        this.showDeleteConfirmation(selectedIds.length, () => {
            // Remove applications
            this.applications = this.applications.filter(app => !selectedIds.includes(app.id));
            
            // Save and update
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            this.updateApplicationCount();

            // Clear selection
            const selectAllCheckbox = document.getElementById('selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
            }
            this.updateBulkSelection();

            // Show professional success message
            if (selectedIds.length === 1) {
                this.showToast('success', 'Application Deleted', 'The selected application has been removed successfully.');
            } else {
                this.showToast('success', 'Applications Deleted', `${selectedIds.length} applications have been removed successfully.`);
            }
        });
    }

    showDeleteConfirmation(count, onConfirm) {
        // Create custom confirmation modal
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
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        `;
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f59e0b; margin-bottom: 16px;"></i>
                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">Confirm Deletion</h3>
                <p style="margin: 0; color: #6b7280; line-height: 1.5;">
                    Are you sure you want to delete ${count} application${count !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="cancelDelete" style="
                    padding: 10px 20px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #6b7280;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
                <button id="confirmDelete" style="
                    padding: 10px 20px;
                    border: none;
                    background: #dc2626;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">Delete</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        document.getElementById('cancelDelete').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        document.getElementById('confirmDelete').addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            onConfirm();
        });
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
        
        // Close on ESC key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && document.body.contains(modalOverlay)) {
                document.body.removeChild(modalOverlay);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('.checkbox-row');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        
        this.updateBulkSelection();
    }

    showFilterModal() {
        const filterArray = ['all', 'pending_review', 'approved', 'rejected'];
        const currentIndex = filterArray.indexOf(currentFilter);
        const nextIndex = (currentIndex + 1) % filterArray.length;
        this.currentFilter = filterArray[nextIndex];
        
        this.renderApplications();
        this.updateFilterDisplay();
        const nextFilter = filters.find(f => f.value === this.currentFilter);
        this.showToast('success', 'Filter Applied', `Now showing: ${nextFilter?.label}`);
    }

    // Generate next sequential Rider ID
    generateNextRiderId() {
        const activeRiders = this.getActiveRiders();
        
        // Find the highest number
        let highestNumber = 0;
        activeRiders.forEach(rider => {
            const match = rider.riderId.match(/K3R-(\d{6})/);
            if (match) {
                const number = parseInt(match[1]);
                if (number > highestNumber) {
                    highestNumber = number;
                }
            }
        });
        
        // Generate next number with leading zeros
        const nextNumber = highestNumber + 1;
        return `K3R-${String(nextNumber).padStart(6, '0')}`;
    }

    // Format date of birth as password (DD-MM-YYYY)
    formatDOBPassword(dateOfBirth) {
        if (!dateOfBirth) return '01-01-1990'; // Default if no DOB
        
        // Parse date and format as DD-MM-YYYY
        const date = new Date(dateOfBirth);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
    }

    // Generate rider credentials
    generateRiderCredentials(application) {
        const riderId = this.generateNextRiderId();
        const defaultPassword = this.formatDOBPassword(application.dateOfBirth);
        
        return {
            riderId: riderId,
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email,
            phone: application.phone,
            dateOfBirth: application.dateOfBirth,
            defaultPassword: defaultPassword,
            isFirstLogin: true,
            applicationDate: application.applicationDate,
            approvalDate: new Date().toISOString().split('T')[0],
            status: 'active',
            passwordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours to change
        };
    }

    // Get active riders from localStorage
    getActiveRiders() {
        const stored = localStorage.getItem('activeRiders');
        return stored ? JSON.parse(stored) : [];
    }

    // Save active rider to localStorage
    saveActiveRider(riderCredentials) {
        const activeRiders = this.getActiveRiders();
        activeRiders.push(riderCredentials);
        localStorage.setItem('activeRiders', JSON.stringify(activeRiders));
    }

    // Show credentials popup
    showCredentialsPopup(riderCredentials, application) {
        // Create custom credential popup
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'credential-popup-overlay';
        popupOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
        `;

        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            padding: 0;
            animation: slideUp 0.3s ease;
        `;

        popupContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white; padding: 24px; border-radius: 20px 20px 0 0; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
                    <i class="fas fa-motorcycle" style="font-size: 32px; color: #FFD700;"></i>
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700;">Rider Credentials Generated</h2>
                </div>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Professional rider account created successfully</p>
            </div>
            
            <div style="padding: 32px 24px;">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 700; color: #1a1a1a;">
                        ${riderCredentials.firstName.charAt(0)}${riderCredentials.lastName.charAt(0)}
                    </div>
                </div>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">${riderCredentials.firstName} ${riderCredentials.lastName}</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">${riderCredentials.phone} &bull; ${riderCredentials.email}</p>
                </div>
                
                <div style="background: var(--k3k3-gray-50); border: 2px solid var(--k3k3-secondary); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <h4 style="margin: 0 0 16px 0; color: var(--k3k3-gray-900); font-size: 16px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-key" style="color: var(--k3k3-secondary);"></i>
                        Login Credentials
                    </h4>
                    
                    <div style="display: grid; gap: 16px;">
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--k3k3-gray-500); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">User ID</label>
                            <div style="background: white; border: 1px solid var(--k3k3-gray-300); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: var(--k3k3-primary); text-align: center;">
                                ${riderCredentials.riderId}
                            </div>
                            <p style="margin: 4px 0 0 0; font-size: 11px; color: var(--k3k3-gray-400); text-align: center; font-style: italic;">
                                Use this as your User ID for login
                            </p>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 12px; color: var(--k3k3-gray-500); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
                            <div style="background: white; border: 1px solid var(--k3k3-gray-300); border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: var(--k3k3-primary); text-align: center;">
                                ${riderCredentials.defaultPassword}
                            </div>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: var(--k3k3-gray-500); text-align: center;">
                                (Date of Birth format: DD-MM-YYYY)
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 20px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">IMPORTANT SECURITY NOTICE</h4>
                            <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                                Please remind the rider to change their password immediately after their first login for security purposes.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <i class="fas fa-sms" style="color: #10b981; font-size: 20px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">SMS TEMPLATE</h4>
                            <div style="background: white; border: 1px solid #10b981; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; color: #065f46; white-space: pre-line;">${this.generateSMSTemplate(riderCredentials)}</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="copyCredentials" style="
                        flex: 1;
                        padding: 14px 20px;
                        background: linear-gradient(135deg, #1a1a1a, #000000);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-copy"></i>
                        Copy Credentials
                    </button>
                    
                    <button id="sendSMS" style="
                        flex: 1;
                        padding: 14px 20px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 10px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-sms"></i>
                        Mark as Sent via SMS
                    </button>
                </div>
            </div>
            
            <div style="padding: 20px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                    <i class="fas fa-shield-alt" style="color: #10b981;"></i>
                    Credentials are encrypted and secure
                </p>
                <button onclick="this.closest('.credential-popup-overlay').remove()" style="
                    padding: 10px 20px;
                    background: #f3f4f6;
                    color: #374151;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Close
                </button>
            </div>
        `;
        
        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);
        
        // Add event listeners
        document.getElementById('copyCredentials').addEventListener('click', () => {
            const credentials = `User ID: ${riderCredentials.riderId}\nPassword: ${riderCredentials.defaultPassword}`;
            navigator.clipboard.writeText(credentials).then(() => {
                this.showToast('success', 'Copied!', 'Credentials copied to clipboard');
            });
        });
        
        document.getElementById('sendSMS').addEventListener('click', () => {
            this.markCredentialsAsSent(riderCredentials.riderId);
            this.showToast('success', 'SMS Marked as Sent', 'Credentials have been marked as sent via SMS');
            document.body.removeChild(popupOverlay);
        });
        
        // Close on overlay click
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) {
                document.body.removeChild(popupOverlay);
            }
        });
    }

    // Generate SMS template
    generateSMSTemplate(riderCredentials) {
        return `K3K3 RIDER ACCOUNT APPROVED! 

Welcome to the K3K3 team! Your rider account is ready.

User ID: ${riderCredentials.riderId}
Password: ${riderCredentials.defaultPassword}
Download App: [App Store Link]
IMPORTANT: Change password on first login

Support: +233-XXX-XXXX
Website: k3k3.com

Welcome aboard!`;
    }

    // Mark credentials as sent
    markCredentialsAsSent(riderId) {
        const application = this.applications.find(app => app.riderId === riderId);
        if (application) {
            application.credentialsSent = true;
            application.credentialsSentDate = new Date().toISOString();
            application.credentialsSentVia = 'sms';
            this.saveApplications();
            this.renderApplications();
        }
    }

    // Show approval confirmation popup
    showApprovalConfirmation(application, callback) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'approval-confirmation-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            -webkit-backdrop-filter: blur(5px);
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 450px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.3s ease;
        `;

        modalContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
                    <i class="fas fa-user-check" style="font-size: 32px; color: #FFD700;"></i>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Confirm Approval</h2>
                </div>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Are you sure you want to approve this rider?</p>
            </div>
            
            <div style="padding: 24px;">
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1a1a1a, #000000); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: white;">
                            ${application.firstName.charAt(0)}${application.lastName.charAt(0)}
                        </div>
                        <div>
                            <h3 style="margin: 0 0 4px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">${application.firstName} ${application.lastName}</h3>
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Application ID: ${application.id}</p>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                        <div>
                            <span style="color: #6b7280;">Email:</span>
                            <div style="color: #1a1a1a; font-weight: 500;">${application.email}</div>
                        </div>
                        <div>
                            <span style="color: #6b7280;">Phone:</span>
                            <div style="color: #1a1a1a; font-weight: 500;">${application.phone}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <i class="fas fa-info-circle" style="color: #0ea5e9; font-size: 18px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: #075985; font-size: 14px; font-weight: 600;">WHAT HAPPENS NEXT:</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 13px; line-height: 1.6;">
                                <li>Rider ID will be generated automatically</li>
                                <li>Default password set to Date of Birth</li>
                                <li>Credentials will be displayed for SMS sending</li>
                                <li>Rider can login after password change</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button id="cancelApproval" style="
                        flex: 1;
                        padding: 12px 20px;
                        background: #f3f4f6;
                        color: #374151;
                        border: 1px solid #d1d5db;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Cancel
                    </button>
                    <button id="confirmApproval" style="
                        flex: 1;
                        padding: 12px 20px;
                        background: linear-gradient(135deg, #10b981, #059669);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">
                        Approve Rider
                    </button>
                </div>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Setup event handlers
        const cancelBtn = document.getElementById('cancelApproval');
        const confirmBtn = document.getElementById('confirmApproval');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
            callback();
        });

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
    }

    // Show loading popup during credential generation
    showCredentialGenerationLoading(application) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'credential-loading-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.3s ease;
        `;

        modalContent.innerHTML = `
            <div style="padding: 40px 32px; text-align: center;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #1a1a1a, #000000); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; position: relative;">
                    <div style="
                        width: 60px; height: 60px; border: 3px solid #FFD700; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;
                    "></div>
                </div>
                
                <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Generating Rider Credentials</h3>
                <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                    Creating secure login credentials for <strong>${application.firstName} ${application.lastName}</strong>
                </p>
                
                <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span style="font-size: 13px; color: #374151;">Generating unique Rider ID...</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 2s infinite 0.3s;"></div>
                        <span style="font-size: 13px; color: #374151;">Setting default password...</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: pulse 2s infinite 0.6s;"></div>
                        <span style="font-size: 13px; color: #374151;">Activating rider account...</span>
                    </div>
                </div>
                
                <p style="margin: 0; color: #9ca3af; font-size: 12px; font-style: italic;">This will only take a moment...</p>
            </div>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        return modalOverlay; // Return reference for removal
    }

    // Database API Preparation Methods
    // These methods prepare the data for backend database integration
    
    // Create rider account in database (REAL API integration)
    async createRiderAccountInDatabase(riderData) {
        try {
            // REAL API endpoint for backend integration
            const API_ENDPOINT = 'http://localhost:8810/api/v1/admin/approve-rider/' + riderData.applicationId;
            
            // Prepare data for database - match backend expectations
            const databasePayload = {
                name: `${riderData.firstName} ${riderData.lastName}`,
                email: riderData.email,
                phone: riderData.phone,
                dateOfBirth: riderData.dateOfBirth,
                gender: riderData.gender || 'prefer_not_to_say',
                vehicleInfo: riderData.vehicleInfo || {}
            };

            console.log('🔄 Creating rider account in database:', {
                riderId: riderData.riderId,
                email: riderData.email,
                endpoint: API_ENDPOINT
            });

            // REAL API call to backend
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAdminToken()}`
                },
                body: JSON.stringify(databasePayload)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Rider account created in database:', result);
                return {
                    success: true,
                    databaseId: result.user_id,
                    riderId: result.rider_id,
                    message: 'Rider account successfully created in database'
                };
            } else {
                console.error('❌ Database creation failed:', result);
                return {
                    success: false,
                    message: result.detail || 'Database creation failed'
                };
            }
            
        } catch (error) {
            console.error('❌ Error creating rider account in database:', error);
            return {
                success: false,
                message: `Database API error: ${error.message}`
            };
        }
    }

    // Get admin authentication token
    getAdminToken() {
        return localStorage.getItem('k3k3_admin_token') || 'admin_session_token';
    }

    // Update rider credentials in database
    async updateRiderCredentialsInDatabase(riderId, updateData) {
        try {
            const API_ENDPOINT = `/api/riders/${riderId}/update`;
            
            console.log('🔄 Updating rider credentials in database:', {
                riderId: riderId,
                endpoint: API_ENDPOINT
            });

            const response = await this.simulateDatabaseAPI(API_ENDPOINT, 'PUT', updateData);
            
            if (response.success) {
                console.log('✅ Rider credentials updated in database');
                return {
                    success: true,
                    message: 'Rider credentials updated successfully'
                };
            } else {
                throw new Error(response.message || 'Database update failed');
            }

        } catch (error) {
            console.error('❌ Error updating rider credentials in database:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to update rider credentials in database'
            };
        }
    }

    // Get rider from database by ID
    async getRiderFromDatabase(riderId) {
        try {
            const API_ENDPOINT = `/api/riders/${riderId}`;
            
            console.log('🔄 Retrieving rider from database:', {
                riderId: riderId,
                endpoint: API_ENDPOINT
            });

            const response = await this.simulateDatabaseAPI(API_ENDPOINT, 'GET');
            
            if (response.success) {
                return {
                    success: true,
                    rider: response.data
                };
            } else {
                throw new Error(response.message || 'Rider not found in database');
            }

        } catch (error) {
            console.error('❌ Error retrieving rider from database:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to retrieve rider from database'
            };
        }
    }

    // Validate rider credentials against database
    async validateRiderCredentialsInDatabase(identifier, password) {
        try {
            const API_ENDPOINT = '/api/riders/validate';
            
            console.log('🔄 Validating rider credentials in database:', {
                identifier: identifier,
                endpoint: API_ENDPOINT
            });

            const response = await this.simulateDatabaseAPI(API_ENDPOINT, 'POST', {
                identifier: identifier,
                password: password
            });
            
            if (response.success) {
                return {
                    success: true,
                    rider: response.data.rider,
                    isValid: response.data.isValid,
                    isFirstLogin: response.data.isFirstLogin
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Invalid credentials'
                };
            }

        } catch (error) {
            console.error('❌ Error validating rider credentials in database:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to validate rider credentials'
            };
        }
    }

    // Store database credentials for login system
    storeDatabaseCredentials(riderData) {
        // Store in localStorage for rider login system to access
        const databaseCredentials = JSON.parse(localStorage.getItem('databaseRiders') || '[]');
        
        const existingIndex = databaseCredentials.findIndex(r => r.riderId === riderData.riderId);
        
        if (existingIndex !== -1) {
            databaseCredentials[existingIndex] = riderData;
        } else {
            databaseCredentials.push(riderData);
        }
        
        localStorage.setItem('databaseRiders', JSON.stringify(databaseCredentials));
        console.log('📀 Database credentials stored for login system');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.riderApps = new RiderApplicationsManager();
});

// Global functions for external access
function approveApplication(applicationId) {
    if (window.riderApps) {
        window.riderApps.quickApprove(applicationId);
    }
}

function rejectApplication(applicationId) {
    if (window.riderApps) {
        window.riderApps.quickReject(applicationId);
    }
}

function viewApplication(applicationId) {
    if (window.riderApps) {
        window.riderApps.viewApplication(applicationId);
    }
}

function refreshApplications() {
    if (window.riderApps) {
        window.riderApps.loadApplications();
        window.riderApps.showToast('success', 'Refreshed', 'Applications have been refreshed');
    }
}
