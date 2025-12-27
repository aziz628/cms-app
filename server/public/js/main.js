// CombatZone Template Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Navigation Menu Toggle
    setupMobileMenu();
    
    // Dropdown Menu Enhancement
    setupDropdownMenu();

    // Scroll Animation
    setupScrollAnimation();

    // Schedule Tabs
    setupScheduleTabs();

    // Form Validation
    setupFormValidation();
});

// Enhanced Dropdown Menu with Delay
function setupDropdownMenu() {
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    let timeout;
    
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            dropdownItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.add('active');
        });
        
        item.addEventListener('mouseleave', () => {
            timeout = setTimeout(() => {
                item.classList.remove('active');
            }, 150); // Small delay to prevent accidental mouseout
        });
    });
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');
    const mobileLinks = document.querySelectorAll('#mobile-menu .nav-link');
    const body = document.body;
    
    if (menuButton && mobileMenu) {
        // show the menu by removing the translate-x-full class
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.remove('translate-x-full');
            // prevent body from scrolling when menu is open
            body.classList.add('overflow-hidden');
        });
        //  hide the menu by adding the translate-x-full class
        if (closeMenu) {
            closeMenu.addEventListener('click', function() {
                mobileMenu.classList.add('translate-x-full');
                // allow body to scroll when menu is closed
                body.classList.remove('overflow-hidden');
            });
        }
        
        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('translate-x-full');
            });
        });
    }
}


// Scroll Animation
function setupScrollAnimation() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    // Check if elements are in view and add 'animated' class
    if (animatedElements.length > 0) {
        const checkInView = function() {
            animatedElements.forEach(element => {
                // Get the distance from the top of the viewport to the element , viewport means the visible part of the web page 
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.classList.add('animated');
                }
            });
        };
        
        // Check on load
        checkInView();
        
        // Check on scroll
        window.addEventListener('scroll', checkInView);
    }
}

// Schedule Tabs
function setupScheduleTabs() {
    const tabs = document.querySelectorAll('.schedule-nav-item');
    const panes = document.querySelectorAll('.schedule-pane');
    
    if (tabs.length > 0 && panes.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Get the target pane
                const targetId = this.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                
                // Hide all panes
                panes.forEach(pane => pane.classList.remove('active'));
                
                // Show target pane
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
}

// Gallery Lightbox



// Form Validation
function setupFormValidation() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Reset errors
            const errorElements = document.querySelectorAll('.error-message');
            errorElements.forEach(el => el.remove());
            
            // Validate name
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            }
            
            // Validate email
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email');
                isValid = false;
            }
            
            // Validate message
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            }
            
            if (isValid) {
                // when editing this template replace by real request to the server
                // for now since it's a default , we'll just show a success message
                const successMessage = document.createElement('div');
                successMessage.className = 'p-4 bg-combatzone-primary text-white mb-4';
                successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                
                contactForm.parentNode.insertBefore(successMessage, contactForm);
                contactForm.reset();
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
    }
}

// Helper function to show form errors
function showError(inputElement, message) {
    // create a div with error message text
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;

    // add the error message item to the input container
    inputElement.parentNode.appendChild(errorElement);
    inputElement.classList.add('border-red-500');
}

// Helper function to validate email
function isValidEmail(email) {
    // complex email validation regex   
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Smooth scroll to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    
    // Add smooth scrolling behavior when clicking anchor links
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
});
