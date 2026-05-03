// K3K3 Admin - Apply to Drive Management System
class ApplyToDrive {
    constructor() {
        this.riders = [];
        this.filteredRiders = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.apiBaseUrl = '/api/v1';
        this.init();
    }

    init() {
        console.log('🚗 Initializing Apply to Drive Management System...');
        this.loadRiderData();
        this.setupEventListeners();
        this.updateStats();
        this.renderRidersTable();
        console.log('✅ Apply to Drive System Ready');
    }

    async loadRiderData() {
        try {
            console.log('📊 Loading rider data...');
            
            // First check for new rider applications from localStorage
            const newApplication = localStorage.getItem('riderApplication');
            if (newApplication) {
                console.log('📝 Found new rider application from localStorage');
                const application = JSON.parse(newApplication);
                
                // Add to existing riders array
                this.riders.unshift({
                    ...application,
                    id: application.riderId,
                    email: `${application.name.toLowerCase().replace(' ', '.')}@k3k3.com`,
                    phone: '+233 XXX XXXX',
                    joinDate: new Date().toISOString().split('T')[0],
                    avatar: '👨‍🦱'
                });
                
                // Clear the application from localStorage
                localStorage.removeItem('riderApplication');
                
                // Show success notification
                this.showToast(`New application received from ${application.name}`, 'success');
            }
            
            const response = await fetch(`${this.apiBaseUrl}/riders/applications`);
            if (!response.ok) throw new Error('Failed to fetch rider applications');
            const apiRiders = await response.json();
            
            // Merge localStorage applications with API data
            this.riders = [...this.riders, ...apiRiders];
            this.filteredRiders = [...this.riders];
        } catch (error) {
            console.error('❌ Error loading rider data:', error);
            this.loadMockData();
        }
    }

    loadMockData() {
        // Generate mock rider application data
        this.riders = [
            {
                id: 'K3R-000001',
                name: 'Kofi Osei',
                email: 'kofi.osei@email.com',
                phone: '+233 123 4567',
                vehicle: 'Tuk-Tuk (4-seater)',
                status: 'active',
                joinDate: '2024-01-15',
                trips: 245,
                rating: 4.8,
                avatar: '👨'
            },
            {
                id: 'K3R-000002',
                name: 'Ama Mensah',
                email: 'ama.mensah@email.com',
                phone: '+233 234 5678',
                vehicle: 'Tuk-Tuk (2-seater)',
                status: 'pending',
                joinDate: '2024-02-20',
                trips: 89,
                rating: 4.5,
                avatar: '👩'
            },
            {
                id: 'K3R-000003',
                name: 'Kojo Thompson',
                email: 'kojo.thompson@email.com',
                phone: '+233 345 6789',
                vehicle: 'Car (4-seater)',
                status: 'suspended',
                joinDate: '2023-12-10',
                trips: 156,
                rating: 4.2,
                avatar: '👨'
            },
            {
                id: 'K3R-000004',
                name: 'Adwoa Asante',
                email: 'adwoa.asante@email.com',
                phone: '+233 456 7890',
                vehicle: 'Tuk-Tuk (2-seater)',
                status: 'active',
                joinDate: '2024-01-28',
                trips: 312,
                rating: 4.9,
                avatar: '👩'
            },
            {
                id: 'K3R-000005',
                name: 'Yaw Boateng',
                email: 'yaw.boateng@email.com',
                phone: '+233 567 8901',
                vehicle: 'Car (7-seater)',
                status: 'rejected',
                joinDate: '2024-02-15',
                trips: 0,
                rating: 0,
                avatar: '👨'
            }
        ];
        this.filteredRiders = [...this.riders];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchRiders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterRiders();
            });
        }

        // Filter functionality
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.filterRiders();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Add new rider button
        const addRiderBtn = document.getElementById('addRiderBtn');
        if (addRiderBtn) {
            addRiderBtn.addEventListener('click', () => {
                this.showAddRiderModal();
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
                this.exportData();
            });
        }

        // Modal close button
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal on outside click
        const modal = document.getElementById('riderModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.k3k3-sidebar').classList.toggle('collapsed');
            });
        }
    }

    filterRiders() {
        this.filteredRiders = this.riders.filter(rider => {
            const matchesSearch = !this.searchTerm || 
                rider.name.toLowerCase().includes(this.searchTerm) ||
                rider.email.toLowerCase().includes(this.searchTerm) ||
                rider.id.toLowerCase().includes(this.searchTerm) ||
                rider.phone.includes(this.searchTerm);
            
            const matchesFilter = this.currentFilter === 'all' || rider.status === this.currentFilter;
            
            return matchesSearch && matchesFilter;
        });
        
        this.renderRidersTable();
    }

    clearFilters() {
        this.searchTerm = '';
        this.currentFilter = 'all';
        
        const searchInput = document.getElementById('searchRiders');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = 'all';
        
        this.filteredRiders = [...this.riders];
        this.renderRidersTable();
    }

    updateStats() {
        const totalRiders = this.riders.length;
        const activeRiders = this.riders.filter(r => r.status === 'active').length;
        const pendingRiders = this.riders.filter(r => r.status === 'pending').length;
        const suspendedRiders = this.riders.filter(r => r.status === 'suspended').length;

        this.updateElement('totalRiders', totalRiders);
        this.updateElement('activeRiders', activeRiders);
        this.updateElement('pendingRiders', pendingRiders);
        this.updateElement('suspendedRiders', suspendedRiders);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    renderRidersTable() {
        const tbody = document.getElementById('ridersTableBody');
        if (!tbody) return;

        if (this.filteredRiders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 16px; display: block;"></i>
                        <div>No riders found matching your criteria</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredRiders.map(rider => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.2rem;">${rider.avatar}</span>
                        <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">${rider.id}</span>
                    </div>
                </td>
                <td>${rider.name}</td>
                <td>${rider.email}</td>
                <td>${rider.phone}</td>
                <td>${rider.vehicle}</td>
                <td>
                    <span class="status-badge status-${rider.status}">${rider.status}</span>
                </td>
                <td>${new Date(rider.joinDate).toLocaleDateString()}</td>
                <td>${rider.trips}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-star" style="color: #ffc107; font-size: 0.8rem;"></i>
                        <span>${rider.rating.toFixed(1)}</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="window.applyToDrive.showRiderDetails('${rider.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${rider.status === 'pending' ? `
                            <button class="btn-action btn-approve" onclick="window.applyToDrive.approveRider('${rider.id}')" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action btn-reject" onclick="window.applyToDrive.rejectRider('${rider.id}')" title="Reject">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        ${rider.status === 'active' ? `
                            <button class="btn-action btn-suspend" onclick="window.applyToDrive.suspendRider('${rider.id}')" title="Suspend">
                                <i class="fas fa-pause"></i>
                            </button>
                        ` : ''}
                        ${rider.status === 'suspended' ? `
                            <button class="btn-action btn-activate" onclick="window.applyToDrive.activateRider('${rider.id}')" title="Activate">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async approveRider(riderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/riders/${riderId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to approve rider');
            
            this.showToast('Rider approved successfully', 'success');
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
        } catch (error) {
            console.error('❌ Error approving rider:', error);
            this.showToast('Failed to approve rider', 'error');
        }
    }

    async rejectRider(riderId) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/riders/${riderId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) throw new Error('Failed to reject rider');
            
            this.showToast('Rider rejected successfully', 'success');
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
        } catch (error) {
            console.error('❌ Error rejecting rider:', error);
            this.showToast('Failed to reject rider', 'error');
        }
    }

    async suspendRider(riderId) {
        const reason = prompt('Please enter suspension reason:');
        if (!reason) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/riders/${riderId}/suspend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) throw new Error('Failed to suspend rider');
            
            this.showToast('Rider suspended successfully', 'success');
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
        } catch (error) {
            console.error('❌ Error suspending rider:', error);
            this.showToast('Failed to suspend rider', 'error');
        }
    }

    async activateRider(riderId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/riders/${riderId}/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to activate rider');
            
            this.showToast('Rider activated successfully', 'success');
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
        } catch (error) {
            console.error('❌ Error activating rider:', error);
            this.showToast('Failed to activate rider', 'error');
        }
    }

    showRiderDetails(riderId) {
        const rider = this.riders.find(r => r.id === riderId);
        if (!rider) return;

        const modalContent = `
            <div style="display: grid; gap: 20px;">
                <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 4rem; margin-bottom: 16px;">${rider.avatar}</div>
                    <h3 style="margin: 0; color: #1a1a1a;">${rider.name}</h3>
                    <p style="margin: 8px 0 0 0; color: #6c757d; font-family: 'JetBrains Mono', monospace;">${rider.id}</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Email</label>
                        <p style="margin: 0; color: #6c757d;">${rider.email}</p>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Phone</label>
                        <p style="margin: 0; color: #6c757d;">${rider.phone}</p>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Vehicle</label>
                        <p style="margin: 0; color: #6c757d;">${rider.vehicle}</p>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Status</label>
                        <span class="status-badge status-${rider.status}">${rider.status}</span>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Join Date</label>
                        <p style="margin: 0; color: #6c757d;">${new Date(rider.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Total Trips</label>
                        <p style="margin: 0; color: #6c757d;">${rider.trips}</p>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Rating</label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="display: flex; gap: 2px;">
                                ${this.generateStarRating(rider.rating)}
                            </div>
                            <span style="font-weight: 600; color: #1a1a1a;">${rider.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.9rem; color: #6c757d;">Performance</div>
                        <div style="font-weight: 600; color: ${rider.rating >= 4.5 ? '#28a745' : rider.rating >= 4.0 ? '#ffc107' : '#dc3545'};">
                            ${rider.rating >= 4.5 ? 'Excellent' : rider.rating >= 4.0 ? 'Good' : 'Needs Improvement'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.showModal('Rider Details', modalContent);
    }

    generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star" style="color: #ffc107;"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt" style="color: #ffc107;"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star" style="color: #ffc107;"></i>';
        }
        
        return stars;
    }

    showAddRiderModal() {
        const modalContent = `
            <form id="addRiderForm" style="display: grid; gap: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Full Name *</label>
                    <input type="text" name="name" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Email Address *</label>
                    <input type="email" name="email" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Phone Number *</label>
                    <input type="tel" name="phone" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Vehicle Type *</label>
                    <select name="vehicleType" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                        <option value="">Select Vehicle Type</option>
                        <option value="tuk-tuk-2seater">Tuk-Tuk (2-seater)</option>
                        <option value="tuk-tuk-4seater">Tuk-Tuk (4-seater)</option>
                        <option value="car-4seater">Car (4-seater)</option>
                        <option value="car-7seater">Car (7-seater)</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">License Number *</label>
                    <input type="text" name="licenseNumber" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 4px; font-weight: 600; color: #495057;">Experience (years)</label>
                    <input type="number" name="experience" min="0" max="50" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem;">
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" onclick="window.applyToDrive.closeModal()" style="padding: 12px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">Cancel</button>
                    <button type="submit" style="padding: 12px 20px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer;">Add Rider</button>
                </div>
            </form>
        `;

        this.showModal('Add New Rider', modalContent);

        // Handle form submission
        const form = document.getElementById('addRiderForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddRider(new FormData(form));
            });
        }
    }

    async handleAddRider(formData) {
        try {
            const riderData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                vehicleType: formData.get('vehicleType'),
                licenseNumber: formData.get('licenseNumber'),
                experience: formData.get('experience'),
                status: 'pending'
            };

            const response = await fetch(`${this.apiBaseUrl}/riders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(riderData)
            });

            if (!response.ok) throw new Error('Failed to add rider');

            this.showToast('Rider added successfully', 'success');
            this.closeModal();
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
        } catch (error) {
            console.error('❌ Error adding rider:', error);
            this.showToast('Failed to add rider', 'error');
        }
    }

    async refreshData() {
        try {
            this.showToast('Refreshing data...', 'info');
            await this.loadRiderData();
            this.updateStats();
            this.renderRidersTable();
            this.showToast('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
            this.showToast('Failed to refresh data', 'error');
        }
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `k3k3-riders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }

    generateCSV() {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Vehicle', 'Status', 'Join Date', 'Trips', 'Rating'];
        const rows = this.filteredRiders.map(rider => [
            rider.id,
            rider.name,
            rider.email,
            rider.phone,
            rider.vehicle,
            rider.status,
            rider.joinDate,
            rider.trips,
            rider.rating
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showModal(title, content) {
        const modal = document.getElementById('riderModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.classList.add('show');
        }
    }

    closeModal() {
        const modal = document.getElementById('riderModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
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
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    getAuthToken() {
        return localStorage.getItem('k3k3_admin_token') || sessionStorage.getItem('k3k3_admin_token');
    }
}

// Initialize the Apply to Drive system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.applyToDrive = new ApplyToDrive();
});
