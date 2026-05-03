// Validate admin credentials against database
function validateAdminCredentials(email, password) {
  try {
    // Get stored admin credentials from localStorage
    const storedCredentials = JSON.parse(localStorage.getItem('k3k3_admin_credentials') || '[]');
    
    // Check if provided credentials match any stored admin
    const isValid = storedCredentials.some(cred => 
      cred.email === email && cred.password === password
    );
    
    if (isValid) {
      console.log(' Admin credentials validated against database');
      return true;
    } else {
      console.log(' Admin credentials validation failed');
      return false;
    }
  } catch (error) {
    console.error('Error validating admin credentials:', error);
    return false;
  }
}

// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('passwordIcon');

  if (passwordToggle && passwordInput && passwordIcon) {
    console.log('Admin password toggle elements found:', passwordToggle, passwordInput, passwordIcon);
    
    // Add click event listener with visual feedback
    passwordToggle.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Admin password toggle clicked');
      
      // Simple toggle
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.style.background = 'rgba(255,204,0,0.2)';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
        console.log('Admin password now visible');
      } else {
        passwordInput.type = 'password';
        passwordToggle.style.background = 'transparent';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
        console.log('Admin password now hidden');
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
    console.log('Admin password toggle elements NOT found:', passwordToggle, passwordInput, passwordIcon);
  }
});

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = "";

  try {
    // First validate against database credentials
    const isValidAdmin = validateAdminCredentials(email, password);
    
    if (!isValidAdmin) {
      errorMessage.textContent = "Invalid admin credentials. Access denied.";
      errorMessage.style.display = "block";
      return;
    }

    // If valid, proceed with API authentication
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; padding: 15px 25px; border-radius: 10px; 
        z-index: 9999; font-weight: 500; font-size: 16px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      `;
      toast.textContent = "Admin login successful! Welcome to K3K3 Dashboard.";
      document.body.appendChild(toast);
      
      // Store admin data using safe storage
      if (window.k3k3Storage) {
        window.k3k3Storage.setToken(data.token, 'localStorage');
        window.k3k3Storage.setItem('activeUser', 'admin', 'localStorage');
        window.k3k3Storage.setItem('email', data.user.email, 'localStorage');
        window.k3k3Storage.setUser(data.user, 'localStorage');
      } else {
        // Fallback to direct storage access
        try {
          localStorage.setItem("token", data.token);
          localStorage.setItem("activeUser", "admin");
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("k3k3_user", JSON.stringify(data.user));
        } catch (e) {
          console.warn('Storage access blocked during admin login:', e.message);
        }
      }
      setTimeout(() => {
        toast.remove();
        window.location.href = "dashboard.html";
      }, 2000);
    } else {
      errorMessage.textContent = data.error || data.message || "Login failed.";
    }
  } catch (err) {
    errorMessage.textContent = "Server error. Try again later.";
  }
});
