// K3K3 Rider Login System with DOB Password Validation
class RiderLoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupPasswordToggle();
        this.setupLoginForm();
    }

    // Get active riders from localStorage
    getActiveRiders() {
        const stored = localStorage.getItem('activeRiders');
        return stored ? JSON.parse(stored) : [];
    }

    // Validate rider credentials (supports both Rider ID and Email)
    validateRiderCredentials(identifier, password) {
        try {
            const activeRiders = this.getActiveRiders();
            
            // Find rider by Rider ID or Email
            const rider = activeRiders.find(r => 
                r.riderId === identifier || r.email === identifier
            );
            
            if (!rider) {
                console.log('Rider not found with identifier:', identifier);
                return { success: false, message: 'Rider not found' };
            }

            // Check if password matches DOB format (first login)
            if (rider.isFirstLogin) {
                const expectedPassword = this.formatDOBPassword(rider.dateOfBirth);
                if (password === expectedPassword) {
                    console.log('First login validated with DOB password');
                    return { 
                        success: true, 
                        rider: rider,
                        isFirstLogin: true,
                        message: 'First login - password change required'
                    };
                } else {
                    console.log('Invalid DOB password for first login');
                    return { 
                        success: false, 
                        message: 'Invalid password. Use your Date of Birth (DD-MM-YYYY format)' 
                    };
                }
            }

            // For subsequent logins, validate against stored password
            if (password === rider.password || password === rider.defaultPassword) {
                console.log('Rider credentials validated');
                return { 
                    success: true, 
                    rider: rider,
                    isFirstLogin: false,
                    message: 'Login successful'
                };
            }

            console.log('Invalid credentials for rider:', identifier);
            return { 
                success: false, 
                message: 'Invalid credentials' 
            };

        } catch (error) {
            console.error('Error validating rider credentials:', error);
            return { 
                success: false, 
                message: 'System error during validation' 
            };
        }
    }

    // Format date of birth as password (DD-MM-YYYY)
    formatDOBPassword(dateOfBirth) {
        if (!dateOfBirth) return '01-01-1990';
        
        const date = new Date(dateOfBirth);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
    }

    // Validate password requirements
    validatePasswordRequirements(password) {
        const minLength = 8;
        const hasNumber = /\d/.test(password);
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        
        if (password.length < minLength) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (!hasNumber) {
            errors.push('Password must contain at least 1 number');
        }
        
        if (!hasLetter) {
            errors.push('Password must contain at least 1 letter');
        }
        
        if (!hasSpecialChar) {
            errors.push('Password must contain at least 1 special character');
        }

        // Check if it's still the DOB format
        if (password.match(/^\d{2}-\d{2}-\d{4}$/)) {
            errors.push('Password cannot be in Date of Birth format');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Show password change modal for first login
    showPasswordChangeModal(rider) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'password-change-overlay';
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
            z-index: 10000;
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 450px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
            animation: slideUp 0.3s ease;
        `;

        modalContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%); color: white; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px;">
                    <i class="fas fa-lock" style="font-size: 32px; color: #FFD700;"></i>
                    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">First Login - Change Password</h2>
                </div>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">For your security, please create a new password</p>
            </div>
            
            <div style="padding: 32px 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0 auto 16px;">
                        ${rider.firstName.charAt(0)}${rider.lastName.charAt(0)}
                    </div>
                    <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Welcome, ${rider.firstName}!</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">Rider ID: ${rider.riderId}</p>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b; font-size: 18px; margin-top: 2px;"></i>
                        <div>
                            <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">SECURITY REQUIREMENT</h4>
                            <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
                                You must change your password before continuing. Your current password (Date of Birth) is temporary.
                            </p>
                        </div>
                    </div>
                </div>
                
                <form id="passwordChangeForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">New Password</label>
                        <div style="position: relative;">
                            <input type="password" id="newPassword" required style="
                                width: 100%;
                                padding: 12px 40px 12px 12px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                transition: border-color 0.3s ease;
                            " placeholder="Enter new password">
                            <button type="button" id="toggleNewPassword" style="
                                position: absolute;
                                right: 12px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: none;
                                border: none;
                                color: #6b7280;
                                cursor: pointer;
                                font-size: 16px;
                            ">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Confirm New Password</label>
                        <div style="position: relative;">
                            <input type="password" id="confirmNewPassword" required style="
                                width: 100%;
                                padding: 12px 40px 12px 12px;
                                border: 1px solid #d1d5db;
                                border-radius: 8px;
                                font-size: 14px;
                                transition: border-color 0.3s ease;
                            " placeholder="Confirm new password">
                            <button type="button" id="toggleConfirmPassword" style="
                                position: absolute;
                                right: 12px;
                                top: 50%;
                                transform: translateY(-50%);
                                background: none;
                                border: none;
                                color: #6b7280;
                                cursor: pointer;
                                font-size: 16px;
                            ">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="passwordRequirements" style="
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 24px;
                        font-size: 13px;
                        color: #6b7280;
                    ">
                        <h5 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">Password Requirements:</h5>
                        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                            <li>At least 8 characters long</li>
                            <li>Contains at least 1 number</li>
                            <li>Contains at least 1 letter</li>
                            <li>Contains at least 1 special character</li>
                            <li>Cannot be your Date of Birth</li>
                        </ul>
                    </div>
                    
                    <div id="passwordError" style="
                        background: #fee2e2;
                        border: 1px solid #ef4444;
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 20px;
                        color: #991b1b;
                        font-size: 13px;
                        display: none;
                    "></div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button type="button" id="cancelPasswordChange" style="
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
                        <button type="submit" id="submitPasswordChange" style="
                            flex: 1;
                            padding: 12px 20px;
                            background: linear-gradient(135deg, #1a1a1a, #000000);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        ">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Setup password change form handlers
        this.setupPasswordChangeForm(rider, modalOverlay);
    }

    // Setup password change form handlers
    setupPasswordChangeForm(rider, modalOverlay) {
        const form = document.getElementById('passwordChangeForm');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmNewPassword');
        const passwordError = document.getElementById('passwordError');
        const toggleNewBtn = document.getElementById('toggleNewPassword');
        const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
        const cancelBtn = document.getElementById('cancelPasswordChange');

        // Password visibility toggles
        toggleNewBtn.addEventListener('click', () => {
            const type = newPasswordInput.type === 'password' ? 'text' : 'password';
            newPasswordInput.type = type;
            toggleNewBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        toggleConfirmBtn.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            toggleConfirmBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                this.showPasswordError('Passwords do not match');
                return;
            }
            
            // Validate password requirements
            const validation = this.validatePasswordRequirements(newPassword);
            if (!validation.isValid) {
                this.showPasswordError(validation.errors.join('<br>'));
                return;
            }
            
            // Update rider password
            this.updateRiderPassword(rider.riderId, newPassword);
            
            // Show success and redirect
            this.showPasswordChangeSuccess(rider);
            
            // Remove modal
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
                this.redirectToDashboard(rider);
            }, 2000);
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });
    }

    // Show password error
    showPasswordError(message) {
        const errorDiv = document.getElementById('passwordError');
        errorDiv.innerHTML = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Update rider password
    updateRiderPassword(riderId, newPassword) {
        const activeRiders = this.getActiveRiders();
        const riderIndex = activeRiders.findIndex(r => r.riderId === riderId);
        
        if (riderIndex !== -1) {
            activeRiders[riderIndex].password = newPassword;
            activeRiders[riderIndex].isFirstLogin = false;
            activeRiders[riderIndex].passwordChangedDate = new Date().toISOString();
            
            localStorage.setItem('activeRiders', JSON.stringify(activeRiders));
            console.log('Password updated for rider:', riderId);
        }
    }

    // Show password change success
    showPasswordChangeSuccess(rider) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-check-circle" style="font-size: 20px;"></i>
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">Password Updated Successfully!</div>
                    <div style="font-size: 14px; opacity: 0.9;">Welcome to K3K3 Rider Dashboard</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successDiv);
    }

    // Redirect to dashboard
    redirectToDashboard(rider) {
        // Store rider session
        const sessionData = {
            riderId: rider.riderId,
            firstName: rider.firstName,
            lastName: rider.lastName,
            email: rider.email,
            phone: rider.phone,
            loginTime: new Date().toISOString(),
            isFirstLogin: false
        };
        
        localStorage.setItem('riderSession', JSON.stringify(sessionData));
        
        // Redirect to dashboard
        window.location.href = 'rider-dashboard.html';
    }

    // Setup password toggle for login form
    setupPasswordToggle() {
        const passwordToggle = document.querySelector('.password-toggle');
        const passwordInput = document.getElementById('password');
        const passwordIcon = document.getElementById('passwordIcon');

        if (passwordToggle && passwordInput && passwordIcon) {
            passwordToggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    passwordToggle.style.background = 'rgba(255,204,0,0.2)';
                    passwordIcon.classList.remove('fa-eye');
                    passwordIcon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    passwordToggle.style.background = 'transparent';
                    passwordIcon.classList.remove('fa-eye-slash');
                    passwordIcon.classList.add('fa-eye');
                }
            });
        }
    }

    // Setup login form
    setupLoginForm() {
        const loginForm = document.getElementById('riderLoginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const identifier = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorMessage = document.getElementById('errorMessage');
            
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';

            try {
                // Validate rider credentials
                const validation = this.validateRiderCredentials(identifier, password);
                
                if (!validation.success) {
                    errorMessage.textContent = validation.message;
                    errorMessage.style.display = 'block';
                    return;
                }

                // Check if first login
                if (validation.isFirstLogin) {
                    // Show password change modal
                    this.showPasswordChangeModal(validation.rider);
                    return;
                }

                // Regular login - redirect to dashboard
                this.redirectToDashboard(validation.rider);

            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'Login failed. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }
}

// Initialize the rider login system
document.addEventListener('DOMContentLoaded', function() {
    window.riderLogin = new RiderLoginSystem();
});
