document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const domainLogo = document.getElementById('domain-logo');
    const footerText = document.getElementById('footer-text');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessage = document.getElementById('error-message');
    const togglePasswordBtn = document.getElementById('toggle-password');

    // Track login attempts
    let loginAttempts = 0;
    
    // Function to extract domain from email
    function extractDomain(email) {
        if (!email) return null;
        const atIndex = email.indexOf('@');
        if (atIndex === -1) return null;
        return email.slice(atIndex + 1).toLowerCase();
    }
    
    // Function to fetch domain logo
    function fetchDomainLogo(domain) {
        if (!domain) {
            domainLogo.classList.add('d-none');
            return;
        }
        
        // Set logo URL from Clearbit
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        
        // Create a new image to test if the logo exists
        const testImage = new Image();
        testImage.onload = function() {
            domainLogo.src = logoUrl;
            domainLogo.classList.remove('d-none');
        };
        testImage.onerror = function() {
            domainLogo.classList.add('d-none');
        };
        testImage.src = logoUrl;
    }
    
    // Function to update footer text with domain
    function updateFooterText(domain) {
        if (!domain) {
            footerText.textContent = 'Enter your email to see domain information';
            footerText.classList.remove('text-primary');
            footerText.removeAttribute('href');
            return;
        }
        
        footerText.textContent = `${domain}`;
        
        // On second attempt, make it a clickable link
        if (loginAttempts === 1) {
            const protocol = 'https://';
            footerText.href = `${protocol}${domain}`;
            footerText.classList.add('text-primary');
        }
    }
    
    // Function to show loading overlay
    function showLoading() {
        loadingOverlay.classList.remove('d-none');
    }
    
    // Function to hide loading overlay
    function hideLoading() {
        loadingOverlay.classList.add('d-none');
    }
    
    // Function to show error message
    function showError() {
        errorMessage.classList.remove('d-none');
        errorMessage.classList.add('shake');
        
        // Remove shake animation after it completes
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 820);
    }
    
    // Email input event handler
    emailInput.addEventListener('input', function() {
        const domain = extractDomain(this.value);
        fetchDomainLogo(domain);
        updateFooterText(domain);
    });
    
    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        const eyeIcon = this.querySelector('i');
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });
    
    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate form
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        // Get domain for later use
        const domain = extractDomain(emailInput.value);
        
        // Simulate login process
        showLoading();
        
        // Simulate server delay
        setTimeout(() => {
            hideLoading();
            
            // Always "fail" the login for the demo
            loginAttempts++;
            
            if (loginAttempts === 1) {
                // First attempt: show error message
                showError();
            } else {
                // Second attempt: convert footer to clickable link
                updateFooterText(domain);
                // Optional: hide the error message on second attempt
                errorMessage.classList.add('d-none');
            }
        }, 5000);
    });
});
