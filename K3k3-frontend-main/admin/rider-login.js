// Validate rider credentials against database
function validateRiderCredentials(email, password) {
  try {
    // Get stored rider credentials from localStorage
    const storedCredentials = JSON.parse(localStorage.getItem('k3k3_rider_credentials') || '[]');
    
    // Check if provided credentials match any stored rider
    const isValid = storedCredentials.some(cred => 
      cred.email === email && cred.password === password
    );
    
    if (isValid) {
      console.log('🏍️ Rider credentials validated against database');
      return true;
    } else {
      console.log('❌ Rider credentials validation failed');
      return false;
    }
  } catch (error) {
    console.error('Error validating rider credentials:', error);
    return false;
  }
}

// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('passwordIcon');

  if (passwordToggle && passwordInput && passwordIcon) {
    console.log('Rider password toggle elements found:', passwordToggle, passwordInput, passwordIcon);
    
    // Add click event listener with visual feedback
    passwordToggle.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Rider password toggle clicked');
      
      // Simple toggle
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.style.background = 'rgba(255,204,0,0.2)';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
        console.log('Rider password now visible');
      } else {
        passwordInput.type = 'password';
        passwordToggle.style.background = 'transparent';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
        console.log('Rider password now hidden');
      }
    });
    
    // Also add mouse down/up for show while holding
    passwordToggle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      passwordInput.type = 'text';
      passwordToggle.style.background = 'rgba(255,204,0,0.2)';
      passwordIcon.classList.remove('fa-eye');
      passwordIcon.classList.add('fa-eye-slash');
    });
    
    passwordToggle.addEventListener('mouseup', function(e) {
      e.preventDefault();
      passwordInput.type = 'password';
      passwordToggle.style.background = 'transparent';
      passwordIcon.classList.remove('fa-eye-slash');
      passwordIcon.classList.add('fa-eye');
    });
    
    passwordToggle.addEventListener('mouseleave', function(e) {
      passwordInput.type = 'password';
      passwordToggle.style.background = 'transparent';
      passwordIcon.classList.remove('fa-eye-slash');
      passwordIcon.classList.add('fa-eye');
    });
  } else {
    console.log('Rider password toggle elements NOT found:', passwordToggle, passwordInput, passwordIcon);
  }
});

document.getElementById("riderLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = "";

  try {
    // First validate against database credentials
    const isValidRider = validateRiderCredentials(email, password);
    
    if (!isValidRider) {
      errorMessage.textContent = "Invalid rider credentials. Access denied.";
      errorMessage.style.display = "block";
      return;
    }

    // If valid, proceed with API authentication
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: 'rider' }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
        color: white; padding: 15px 25px; border-radius: 10px; 
        z-index: 9999; font-weight: 500; font-size: 16px;
        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
      `;
      toast.textContent = "Rider login successful! Welcome to K3K3 Rider Dashboard.";
      document.body.appendChild(toast);
      
      // Store rider data using safe storage
      if (window.k3k3Storage) {
        window.k3k3Storage.setToken(data.token, 'localStorage');
        window.k3k3Storage.setItem('activeUser', 'rider', 'localStorage');
        window.k3k3Storage.setItem('email', data.user.email, 'localStorage');
        window.k3k3Storage.setUser(data.user, 'localStorage');
      } else {
        // Fallback to direct storage access
        try {
          localStorage.setItem("token", data.token);
          localStorage.setItem("activeUser", "rider");
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("k3k3_user", JSON.stringify(data.user));
        } catch (e) {
          console.warn('Storage access blocked during rider login:', e.message);
        }
      }
      setTimeout(() => {
        toast.remove();
        window.location.href = "rider-dashboard.html";
      }, 2000);
    } else {
      errorMessage.textContent = data.error || data.message || "Login failed.";
    }
  } catch (err) {
    errorMessage.textContent = "Server error. Try again later.";
  }
});

// Toast notification helper function
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;
  
  const container = document.getElementById('toastContainer');
  if (container) {
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }
}
