// Validate admin credentials against REAL database
async function validateAdminCredentials(email, password) {
  try {
    console.log('🔐 Validating admin credentials against database...');
    
    // Call the same login endpoint as all users
    const response = await fetch('http://localhost:8810/api/v1/users/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const user = await response.json();
      
      // Verify this user has admin role
      if (user.role_type === 'admin') {
        console.log('✅ Admin credentials validated against database');
        
        // Store admin session in localStorage
        localStorage.setItem('k3k3_admin_token', 'admin_session_token');
        localStorage.setItem('current_admin', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'admin',
          loginTime: new Date().toISOString()
        }));
        
        return { success: true, user: user };
      } else {
        console.log('❌ User exists but is not an admin:', user.role_type);
        return { success: false, message: 'Access denied: Not an admin user' };
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Admin credentials validation failed:', errorData.detail);
      return { success: false, message: errorData.detail || 'Invalid credentials' };
    }
    
  } catch (error) {
    console.error('❌ Error validating admin credentials:', error);
    return { success: false, message: 'Network error during login' };
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
    console.log('🔐 Attempting admin login for:', email);
    
    // Validate against REAL database
    const validationResult = await validateAdminCredentials(email, password);
    
    if (!validationResult.success) {
      errorMessage.textContent = validationResult.message || "Invalid admin credentials. Access denied.";
      errorMessage.style.display = "block";
      return;
    }

    console.log('✅ Admin login successful, redirecting to dashboard...');
    
    // Show success message
    errorMessage.textContent = "Login successful! Redirecting...";
    errorMessage.style.color = "#10b981";
    errorMessage.style.display = "block";

    // Redirect to admin dashboard after short delay
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);

  } catch (error) {
    console.error("❌ Login error:", error);
    errorMessage.textContent = "Login failed. Please try again.";
    errorMessage.style.display = "block";
  }
});
