// K3K3 Admin - Payment & Commission Management System
class PaymentManagement {
    constructor() {
        this.transactions = [];
        this.commissionSettings = {
            driverRate: 20,
            driverBaseFee: 5,
            platformRate: 15
        };
        this.charts = {
            revenue: null,
            volume: null,
            commission: null
        };
        this.init();
    }

    init() {
        console.log('💰 Initializing Payment Management System...');
        this.loadMockData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateFinancialOverview();
        this.renderTransactionsTable();
        console.log('✅ Payment Management System Ready');
    }

    loadMockData() {
        // Generate mock transaction data
        this.transactions = [
            {
                id: 'TXN-20241216-000001',
                type: 'payment',
                from: 'K3P-000001 (Kwame Asante)',
                to: 'K3D-000001 (Kofi Osei)',
                amount: 45.50,
                status: 'completed',
                date: '2024-12-16T10:30:00',
                commission: 9.10,
                rideId: 'K3T-20241216-000001'
            },
            {
                id: 'TXN-20241216-000002',
                type: 'commission',
                from: 'Platform',
                to: 'K3D-000001 (Kofi Osei)',
                amount: 9.10,
                status: 'completed',
                date: '2024-12-16T10:30:00',
                rideId: 'K3T-20241216-000001'
            },
            {
                id: 'TXN-20241216-000003',
                type: 'payment',
                from: 'K3P-000002 (Ama Mensah)',
                to: 'K3D-000002 (Ama Mensah)',
                amount: 32.00,
                status: 'pending',
                date: '2024-12-16T11:45:00',
                commission: 6.40,
                rideId: 'K3T-20241216-000002'
            },
            {
                id: 'TXN-20241216-000004',
                type: 'refund',
                from: 'Platform',
                to: 'K3P-000003 (Kofi Osei)',
                amount: 15.00,
                status: 'completed',
                date: '2024-12-16T09:20:00',
                rideId: 'K3T-20241216-000003'
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchTransactions');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTransactions(e.target.value);
            });
        }

        // Transaction filter
        const transactionFilter = document.getElementById('transactionFilter');
        if (transactionFilter) {
            transactionFilter.addEventListener('change', (e) => {
                this.filterTransactions(e.target.value);
            });
        }

        // Add transaction button
        const addTransactionBtn = document.getElementById('addTransactionBtn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.showAddTransactionForm();
            });
        }

        // Save commission settings
        const saveCommissionBtn = document.getElementById('saveCommissionBtn');
        if (saveCommissionBtn) {
            saveCommissionBtn.addEventListener('click', () => {
                this.saveCommissionSettings();
            });
        }

        // Analytics period
        const analyticsPeriod = document.getElementById('analyticsPeriod');
        if (analyticsPeriod) {
            analyticsPeriod.addEventListener('change', (e) => {
                this.updateAnalytics(e.target.value);
            });
        }

        // Modal close
        const modal = document.getElementById('transactionModal');
        const closeModal = document.getElementById('closeModal');
        if (modal && closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    updateFinancialOverview() {
        const stats = {
            totalRevenue: this.transactions
                .filter(t => t.type === 'payment')
                .reduce((sum, t) => sum + t.amount, 0),
            commissionEarned: this.transactions
                .filter(t => t.type === 'commission')
                .reduce((sum, t) => sum + t.amount, 0),
            pendingPayments: this.transactions
                .filter(t => t.type === 'payment' && t.status === 'pending')
                .length,
            avgTransaction: this.transactions
                .filter(t => t.type === 'payment')
                .reduce((sum, t) => sum + t.amount, 0) / this.transactions.filter(t => t.type === 'payment').length || 1
        };

        document.getElementById('totalRevenue').textContent = `₵${stats.totalRevenue.toFixed(2)}`;
        document.getElementById('commissionEarned').textContent = `₵${stats.commissionEarned.toFixed(2)}`;
        document.getElementById('pendingPayments').textContent = stats.pendingPayments;
        document.getElementById('avgTransaction').textContent = `₵${stats.avgTransaction.toFixed(2)}`;
    }

    renderTransactionsTable() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>
                    <span class="transaction-type ${transaction.type}">${transaction.type}</span>
                </td>
                <td>${transaction.from}</td>
                <td>${transaction.to}</td>
                <td>₵${transaction.amount.toFixed(2)}</td>
                <td>
                    <span class="transaction-status ${transaction.status}">${transaction.status}</span>
                </td>
                <td>${transaction.date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="paymentManagement.viewTransaction('${transaction.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${transaction.status === 'pending' ? `
                            <button class="btn-action btn-success" onclick="paymentManagement.approveTransaction('${transaction.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-action btn-reject" onclick="paymentManagement.rejectTransaction('${transaction.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filterTransactions(searchTerm = '') {
        const transactionFilter = document.getElementById('transactionFilter').value;
        
        this.transactions.forEach(transaction => {
            const row = document.querySelector(`[data-transaction-id="${transaction.id}"]`);
            if (row) {
                const matchesSearch = !searchTerm || 
                    transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transaction.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    transaction.amount.toString().includes(searchTerm);
                
                const matchesType = transactionFilter === 'all' || transaction.type === transactionFilter;
                
                row.style.display = (matchesSearch && matchesType) ? '' : 'none';
            }
        });
    }

    viewTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            this.showTransactionDetails(transaction);
        }
    }

    approveTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.status = 'completed';
            this.showNotification(`Transaction ${transactionId} approved`, 'success');
            this.renderTransactionsTable();
            this.updateFinancialOverview();
        }
    }

    rejectTransaction(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.status = 'failed';
            this.showNotification(`Transaction ${transactionId} rejected`, 'error');
            this.renderTransactionsTable();
            this.updateFinancialOverview();
        }
    }

    showTransactionDetails(transaction) {
        const modal = document.getElementById('transactionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Transaction Details - ${transaction.id}`;
        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="color: #1a1a1a; margin-bottom: 12px;">Transaction Information</h4>
                    <div style="display: grid; gap: 8px;">
                        <p><strong>Transaction ID:</strong> ${transaction.id}</p>
                        <p><strong>Type:</strong> <span class="transaction-type ${transaction.type}">${transaction.type}</span></p>
                        <p><strong>From:</strong> ${transaction.from}</p>
                        <p><strong>To:</strong> ${transaction.to}</p>
                        <p><strong>Amount:</strong> ₵${transaction.amount.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span class="transaction-status ${transaction.status}">${transaction.status}</span></p>
                        <p><strong>Date:</strong> ${transaction.date}</p>
                        <p><strong>Ride ID:</strong> ${transaction.rideId || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <h4 style="color: #1a1a1a; margin-bottom: 12px;">Commission Details</h4>
                    <div style="display: grid; gap: 8px;">
                        <p><strong>Commission Amount:</strong> ₵${transaction.commission ? transaction.commission.toFixed(2) : '0.00'}</p>
                        <p><strong>Commission Rate:</strong> ${this.commissionSettings.platformRate}%</p>
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <button class="btn-primary" onclick="paymentManagement.closeModal()">Close</button>
            </div>
        `;

        modal.classList.add('show');
    }

    closeModal() {
        const modal = document.getElementById('transactionModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showAddTransactionForm() {
        const modal = document.getElementById('transactionModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = 'Add New Transaction';
        modalBody.innerHTML = `
            <form id="addTransactionForm" style="display: grid; gap: 16px;">
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Transaction Type *</label>
                    <select name="type" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                        <option value="">Select type</option>
                        <option value="payment">Payment</option>
                        <option value="commission">Commission</option>
                        <option value="refund">Refund</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">From *</label>
                    <input type="text" name="from" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">To *</label>
                    <input type="text" name="to" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Amount (₵) *</label>
                    <input type="number" name="amount" step="0.01" required style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a1a1a;">Ride ID</label>
                    <input type="text" name="rideId" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div style="display: flex; gap: 16px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <button type="submit" class="btn-primary">Add Transaction</button>
                    <button type="button" class="btn-secondary" onclick="paymentManagement.closeModal()">Cancel</button>
                </div>
            </form>
        `;

        modal.classList.add('show');

        // Handle form submission
        const form = document.getElementById('addTransactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewTransaction(new FormData(form));
            });
        }
    }

    addNewTransaction(formData) {
        const newTransaction = {
            id: `TXN-${Date.now()}`,
            type: formData.get('type'),
            from: formData.get('from'),
            to: formData.get('to'),
            amount: parseFloat(formData.get('amount')),
            status: 'pending',
            date: new Date().toISOString(),
            rideId: formData.get('rideId') || null,
            commission: formData.get('type') === 'payment' ? parseFloat(formData.get('amount')) * (this.commissionSettings.platformRate / 100) : 0
        };

        this.transactions.unshift(newTransaction);
        this.filterTransactions();
        this.closeModal();
        this.showNotification(`New transaction added successfully`, 'success');
    }

    saveCommissionSettings() {
        this.commissionSettings.driverRate = parseFloat(document.getElementById('driverCommissionRate').value);
        this.commissionSettings.driverBaseFee = parseFloat(document.getElementById('driverBaseFee').value);
        this.commissionSettings.platformRate = parseFloat(document.getElementById('platformCommissionRate').value);

        this.showNotification('Commission settings saved successfully', 'success');
    }

    initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Daily Revenue',
                        data: [1200, 1450, 1300, 1600, 1750, 1400, 1100],
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Revenue (₵)'
                            }
                        }
                    }
                }
            });
        }

        // Volume Chart
        const volumeCtx = document.getElementById('volumeChart');
        if (volumeCtx) {
            this.charts.volume = new Chart(volumeCtx, {
                type: 'bar',
                data: {
                    labels: ['Payments', 'Commissions', 'Refunds'],
                    datasets: [{
                        label: 'Transaction Volume',
                        data: [45, 15, 3],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(23, 162, 184, 0.8)',
                            'rgba(220, 53, 69, 0.8)'
                        ],
                        borderColor: [
                            '#28a745',
                            '#17a2b8',
                            '#dc3545'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Transactions'
                            }
                        }
                    }
                }
            });
        }

        // Commission Chart
        const commissionCtx = document.getElementById('commissionChart');
        if (commissionCtx) {
            this.charts.commission = new Chart(commissionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Driver Commission', 'Platform Revenue'],
                    datasets: [{
                        data: [80, 20],
                        backgroundColor: [
                            'rgba(40, 167, 69, 0.8)',
                            'rgba(23, 162, 184, 0.8)'
                        ],
                        borderColor: [
                            '#28a745',
                            '#17a2b8'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateAnalytics(period = 'daily') {
        if (!this.charts.revenue) return;

        let labels, data;

        switch(period) {
            case 'daily':
                labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
                data = [300, 450, 380, 520, 480, 350];
                break;
            case 'weekly':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                data = [2100, 2450, 2240, 2800, 3150, 1890];
                break;
            case 'monthly':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                data = [8500, 9200, 8900, 9450, 8100];
                break;
        }

        this.charts.revenue.data.labels = labels;
        this.charts.revenue.data.datasets[0].data = data;
        this.charts.revenue.update();
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
const paymentManagement = new PaymentManagement();
