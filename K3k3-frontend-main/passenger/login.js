// K3K3 Passenger Login & Sign Up - Professional JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load safe storage utility
    const script = document.createElement('script');
    script.src = '../js/storage-utils.js';
    document.head.appendChild(script);
    
    // Initialize Google OAuth
    if (typeof initGoogleOAuth === 'function') {
        initGoogleOAuth();
    }
    
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeSlashIcon = this.querySelector('.eye-slash-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeSlashIcon.style.display = 'block';
                this.style.background = '#f0f0f0';
                this.style.color = '#667eea';
            } else {
                passwordInput.type = 'password';
                eyeIcon.style.display = 'block';
                eyeSlashIcon.style.display = 'none';
                this.style.background = 'none';
                this.style.color = '#666';
            }
        });
        
        // Hide password on mouse release (click and hold functionality)
        toggle.addEventListener('mousedown', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeSlashIcon = this.querySelector('.eye-slash-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeSlashIcon.style.display = 'block';
                this.style.background = '#f0f0f0';
                this.style.color = '#667eea';
            }
        });
        
        toggle.addEventListener('mouseup', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeSlashIcon = this.querySelector('.eye-slash-icon');
            
            passwordInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeSlashIcon.style.display = 'none';
            this.style.background = 'none';
            this.style.color = '#666';
        });
        
        toggle.addEventListener('mouseleave', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeSlashIcon = this.querySelector('.eye-slash-icon');
            
            passwordInput.type = 'password';
            eyeIcon.style.display = 'block';
            eyeSlashIcon.style.display = 'none';
            this.style.background = 'none';
            this.style.color = '#666';
        });
    });
    
    // Check URL hash for default tab
    function checkDefaultTab() {
        const hash = window.location.hash;
        if (hash === '#signup') {
            // Switch to signup tab
            document.querySelector('[data-tab="signup"]').click();
        }
    }
    
    checkDefaultTab();
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.querySelector('input[name="remember"]').checked;
            
            // Show loading state
            const loginBtn = this.querySelector('.login-btn');
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            loginBtn.disabled = true;
            
            try {
                // Call login API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store user data and token using safe storage
                    if (window.k3k3Storage) {
                        const storageType = rememberMe ? 'localStorage' : 'sessionStorage';
                        window.k3k3Storage.setToken(data.token, storageType);
                        window.k3k3Storage.setUser(data.user, storageType);
                        window.k3k3Storage.setItem('k3k3_user_name', data.user.name || data.user.firstName, storageType);
                        window.k3k3Storage.setItem('k3k3_user_email', data.user.email, storageType);
                        window.k3k3Storage.setItem('k3k3_user_type', data.user.userType || 'passenger', storageType);
                    } else {
                        // Fallback to direct storage access
                        try {
                            if (rememberMe) {
                                localStorage.setItem('k3k3_token', data.token);
                                localStorage.setItem('k3k3_user', JSON.stringify(data.user));
                                localStorage.setItem('k3k3_user_name', data.user.name || data.user.firstName);
                                localStorage.setItem('k3k3_user_email', data.user.email);
                                localStorage.setItem('k3k3_user_type', data.user.userType || 'passenger');
                            } else {
                                sessionStorage.setItem('k3k3_token', data.token);
                                sessionStorage.setItem('k3k3_user', JSON.stringify(data.user));
                                sessionStorage.setItem('k3k3_user_name', data.user.name || data.user.firstName);
                                sessionStorage.setItem('k3k3_user_email', data.user.email);
                                sessionStorage.setItem('k3k3_user_type', data.user.userType || 'passenger');
                            }
                        } catch (e) {
                            console.warn('Storage access blocked during login:', e.message);
                            showToast('Login successful but session may not persist due to browser privacy settings', 'warning');
                        }
                    }
                    
                    // Show success toast with user's name
                    if (data.user && data.user.name) {
                        showToast('success', `Welcome back to K3K3, ${data.user.name}!`);
                    } else {
                        showToast('success', 'Welcome back to K3K3!');
                    }
                    
                    // Redirect to dashboard after delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showToast('error', data.error || 'Login failed. Please try again.');
                }
            } catch (error) {
                console.error('Login error:', error);
                showToast('error', 'Network error. Please try again.');
            } finally {
                // Restore button state
                loginBtn.innerHTML = originalBtnText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // Sign up form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('signup-firstname').value;
            const middleName = document.getElementById('signup-middlename').value;
            const lastName = document.getElementById('signup-lastname').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value.trim();
            const countryCode = document.getElementById('signup-countryCode').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const termsAccepted = document.querySelector('input[name="terms"]').checked;
            
            // Validation
            if (!phone || phone.trim() === '') {
                showToast('error', 'Please enter your phone number.');
                return;
            }
            
            // Remove Ghana-specific validation - accept any international phone format
            const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
            if (!phoneRegex.test(phone.trim()) || phone.replace(/\D/g, '').length < 7) {
                showToast('error', 'Please enter a valid phone number.');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('error', 'Passwords do not match. Please try again.');
                return;
            }
            
            if (!termsAccepted) {
                showToast('error', 'Please accept the terms and conditions.');
                return;
            }
            
            // Password strength validation
            if (!validatePassword(password)) {
                showToast('error', 'Password does not meet the requirements.');
                return;
            }
            
            // Show loading state
            const signupBtn = this.querySelector('.signup-btn');
            const originalBtnText = signupBtn.innerHTML;
            signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            signupBtn.disabled = true;
            
            try {
                // Call register API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        firstName, 
                        middleName, 
                        lastName, 
                        email, 
                        phone: countryCode + ' ' + phone,
                        countryCode,
                        phoneNumber: phone,
                        password 
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store user data and token using safe storage
                    if (window.k3k3Storage) {
                        const storageType = rememberMe ? 'localStorage' : 'sessionStorage';
                        window.k3k3Storage.setToken(data.token, storageType);
                        window.k3k3Storage.setUser(data.user, storageType);
                        window.k3k3Storage.setItem('k3k3_user_name', data.user.name || data.user.firstName, storageType);
                        window.k3k3Storage.setItem('k3k3_user_email', data.user.email, storageType);
                        window.k3k3Storage.setItem('k3k3_user_type', data.user.userType || 'passenger', storageType);
                    } else {
                        // Fallback to direct storage access
                        try {
                            if (rememberMe) {
                                localStorage.setItem('k3k3_token', data.token);
                                localStorage.setItem('k3k3_user', JSON.stringify(data.user));
                                localStorage.setItem('k3k3_user_name', data.user.name || data.user.firstName);
                                localStorage.setItem('k3k3_user_email', data.user.email);
                                localStorage.setItem('k3k3_user_type', data.user.userType || 'passenger');
                            } else {
                                sessionStorage.setItem('k3k3_token', data.token);
                                sessionStorage.setItem('k3k3_user', JSON.stringify(data.user));
                                sessionStorage.setItem('k3k3_user_name', data.user.name || data.user.firstName);
                                sessionStorage.setItem('k3k3_user_email', data.user.email);
                                sessionStorage.setItem('k3k3_user_type', data.user.userType || 'passenger');
                            }
                        } catch (e) {
                            console.warn('Storage access blocked during signup:', e.message);
                            showToast('Account created but session may not persist due to browser privacy settings', 'warning');
                        }
                    }
                    
                    // Show success toast with personalized message
                    const firstName = data.user.name || data.user.firstName || 'User';
                    showToast('success', `Welcome to K3K3, ${firstName}! Your account has been created successfully.`);
                    
                    // Redirect to dashboard after delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2500);
                } else {
                    showToast('error', data.error || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showToast('error', 'Network error. Please try again.');
            } finally {
                // Restore button state
                signupBtn.innerHTML = originalBtnText;
                signupBtn.disabled = false;
            }
        });
    }
    
    // Password validation function
    function validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        return minLength && hasUpper && hasLower && hasNumber;
    }
    
    // Real-time password validation
    const signupPassword = document.getElementById('signup-password');
    const confirmPassword = document.getElementById('signup-confirm-password');
    
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            const isValid = validatePassword(this.value);
            const requirements = document.querySelector('.password-requirements');
            
            if (this.value.length > 0) {
                if (isValid) {
                    requirements.style.borderColor = '#28a745';
                    requirements.style.backgroundColor = '#f8fff9';
                } else {
                    requirements.style.borderColor = '#dc3545';
                    requirements.style.backgroundColor = '#fff8f8';
                }
            } else {
                requirements.style.borderColor = '#667eea';
                requirements.style.backgroundColor = '#f8f9fa';
            }
        });
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const signupPasswordValue = signupPassword.value;
            
            if (this.value.length > 0) {
                if (this.value === signupPasswordValue) {
                    this.style.borderColor = '#28a745';
                    this.style.boxShadow = '0 0 0 3px rgba(40, 167, 69, 0.1)';
                } else {
                    this.style.borderColor = '#dc3545';
                    this.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
                }
            } else {
                this.style.borderColor = '#e1e8ed';
                this.style.boxShadow = 'none';
            }
        });
    }
    
    // Social login handlers
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('google') ? 'Google' : 'Social';
            // Check if Google OAuth is available
            if (this.classList.contains('google') && typeof loginWithGooglePopup === 'function') {
                loginWithGooglePopup();
            } else {
                showToast('info', `${platform} login coming soon!`);
            }
        });
    });
    
    // Forgot password handler
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'forgot-password.html';
        });
    }
    
    // Terms and conditions handlers
    const termsLinks = document.querySelectorAll('.terms-link');
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Allow navigation to actual pages
                return true;
            } else {
                // Show toast for placeholder links
                e.preventDefault();
                showToast('info', 'Terms and conditions page coming soon!');
            }
        });
    });
});

// Uber-style Notification System
function showNotification(message, type = 'success', title = '') {
    const notification = document.getElementById('notification');
    
    // Create Uber-style toast content with icon and structure
    let icon = '';
    let titleText = '';
    
    switch(type) {
        case 'error':
            icon = 'fas fa-exclamation-circle';
            titleText = 'Error';
            break;
        case 'info':
        case 'warning':
            icon = 'fas fa-info-circle';
            titleText = 'Info';
            break;
        case 'success':
            icon = 'fas fa-check-circle';
            titleText = 'Success';
            break;
        default:
            icon = 'fas fa-bell';
            titleText = 'Notification';
    }
    
    // Use custom title if provided
    if (title) {
        titleText = title;
    }
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${titleText}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress"></div>
    `;
    
    notification.className = `notification ${type}`;
    
    // Show notification with Uber-style animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
        hideNotification();
    }, 6000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Wait for animation to complete before clearing
    setTimeout(() => {
        notification.innerHTML = '';
        notification.classList.remove('hide');
    }, 400);
}

// Export showNotification function for global use
window.showNotification = showNotification;

// Backward compatibility - map showToast to showNotification
window.showToast = showNotification;
