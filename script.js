/**
 * Harness the Spark - Main JavaScript File
 * Production-ready with performance optimizations and accessibility features
 */

class HarnessTheSparkApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupPerformanceObserver();
        this.setupAccessibility();
    }

    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApp();
            });
        } else {
            this.setupApp();
        }
    }

    /**
     * Setup the main application functionality
     */
    setupApp() {
        this.setupSmoothScrolling();
        this.setupHeaderScrollEffect();
        this.setupAnimations();
        this.setupFormValidation();
        this.setupContactForm();
        this.setupLazyLoading();
        this.setupServiceWorker();
        
        // Analytics
        this.trackPageLoad();
        
        console.log('🚀 Harness the Spark website loaded successfully');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Scroll events (throttled)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // ~60fps
        }, { passive: true });

        // Resize events (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        }, { passive: true });

        // Form submissions
        document.addEventListener('submit', (e) => {
            this.handleFormSubmission(e);
        });

        // Button clicks with analytics
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cta-button, .btn-primary, .btn-secondary')) {
                this.trackButtonClick(e.target);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Intersection Observer for animations
        this.setupIntersectionObserver();
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without triggering scroll
                    history.pushState(null, null, anchor.getAttribute('href'));
                    
                    // Track navigation
                    this.trackNavigation(anchor.getAttribute('href'));
                }
            });
        });
    }

    /**
     * Setup header scroll effects
     */
    setupHeaderScrollEffect() {
        const header = document.querySelector('header');
        let lastScrollTop = 0;

        this.handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add scrolled class for styling
            if (scrollTop > 100) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }

            // Hide/show header on scroll (optional)
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        };
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll(
            '.service-card, .transformation-story, .sparkhub-content, .about-content, .contact-option'
        );

        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    /**
     * Setup animations and transitions
     */
    setupAnimations() {
        // Add CSS classes for animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.8s ease-out, transform 0.8s ease-out;
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .animate-on-scroll:nth-child(2) { transition-delay: 0.1s; }
            .animate-on-scroll:nth-child(3) { transition-delay: 0.2s; }
            .animate-on-scroll:nth-child(4) { transition-delay: 0.3s; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup form validation and handling
     */
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Real-time validation
            form.addEventListener('input', (e) => {
                this.validateField(e.target);
            });

            // Focus events for better UX
            form.addEventListener('focusin', (e) => {
                e.target.parentElement?.classList.add('field-focused');
            });

            form.addEventListener('focusout', (e) => {
                e.target.parentElement?.classList.remove('field-focused');
                this.validateField(e.target);
            });
        });
    }

    /**
     * Validate individual form fields
     */
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Update field state
        field.classList.toggle('field-error', !isValid);
        field.classList.toggle('field-valid', isValid && value);

        // Update error message
        const existingError = field.parentElement?.querySelector('.field-error-message');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid && errorMessage) {
            const errorEl = document.createElement('div');
            errorEl.className = 'field-error-message';
            errorEl.textContent = errorMessage;
            errorEl.setAttribute('role', 'alert');
            field.parentElement?.appendChild(errorEl);
        }

        return isValid;
    }

    /**
     * Handle form submissions
     */
    handleFormSubmission(e) {
        const form = e.target;
        
        // Handle contact form specifically
        if (form.id === 'contact-form') {
            e.preventDefault();
            this.handleContactFormSubmission(form);
            return;
        }

        const fields = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        // Validate all fields
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            e.preventDefault();
            
            // Focus on first error field
            const firstError = form.querySelector('.field-error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Show error notification
            this.showNotification('Please correct the errors before submitting', 'error');
            return;
        }

        // Handle successful submission
        this.trackFormSubmission(form);
        this.showNotification('Thank you! Your message has been sent.', 'success');
    }

    /**
     * Setup contact form functionality
     */
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        // Add real-time validation
        const fields = contactForm.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateContactField(field);
            });

            field.addEventListener('input', () => {
                // Clear error state on input
                const formGroup = field.closest('.form-group');
                formGroup.classList.remove('field-error');
                formGroup.querySelector('.field-error-message').textContent = '';
            });
        });
    }

    /**
     * Handle contact form submission
     */
    async handleContactFormSubmission(form) {
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        // Validate form
        const isValid = this.validateContactForm(form);
        if (!isValid) return;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service: formData.get('service'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                source: 'website_contact_form'
            };

            // Track form submission
            this.trackEvent('form', 'submit', 'contact_form', data.service);

            // Send to backend (replace contact-handler.php with your preferred backend)
            await this.submitContactForm(data);

            // Show success message
            this.showNotification('Thank you! I\'ll be in touch within 24 hours.', 'success');
            
            // Reset form
            form.reset();
            
            // Track conversion
            this.trackConversion('contact_form_submit', data.service);

        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Sorry, there was an error sending your message. Please try email instead.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    /**
     * Validate contact form
     */
    validateContactForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateContactField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Validate individual contact form field
     */
    validateContactField(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = formGroup.querySelector('.field-error-message');
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        let error = '';

        // Required validation
        if (isRequired && !value) {
            error = 'This field is required';
        }
        
        // Email validation
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                error = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (UK format)
        else if (field.type === 'tel' && value) {
            const phoneRegex = /^(\+44|0)[0-9\s\-]{9,}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                error = 'Please enter a valid UK phone number';
            }
        }

        // Update UI
        if (error) {
            formGroup.classList.add('field-error');
            formGroup.classList.remove('field-valid');
            errorMessage.textContent = error;
            return false;
        } else {
            formGroup.classList.remove('field-error');
            if (value) {
                formGroup.classList.add('field-valid');
            }
            errorMessage.textContent = '';
            return true;
        }
    }

    /**
     * Submit contact form to backend
     */
    async submitContactForm(data) {
        const response = await fetch('/contact-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Network error');
        }

        return await response.json();
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy');
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Setup service worker for caching
     */
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Skip link functionality
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link sr-only';
        skipLink.addEventListener('focus', () => skipLink.classList.remove('sr-only'));
        skipLink.addEventListener('blur', () => skipLink.classList.add('sr-only'));
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Announce dynamic content changes to screen readers
        this.ariaLiveRegion = document.createElement('div');
        this.ariaLiveRegion.setAttribute('aria-live', 'polite');
        this.ariaLiveRegion.setAttribute('aria-atomic', 'true');
        this.ariaLiveRegion.className = 'sr-only';
        document.body.appendChild(this.ariaLiveRegion);

        // Enhanced focus management
        this.setupFocusManagement();
    }

    /**
     * Setup focus management for better keyboard navigation
     */
    setupFocusManagement() {
        let lastFocusedElement = null;

        document.addEventListener('focusin', (e) => {
            lastFocusedElement = e.target;
        });

        // Trap focus in modals (if any)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
                if (modal) {
                    this.trapFocusInModal(e, modal);
                }
            }
        });
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        // Escape key to close modals or menus
        if (e.key === 'Escape') {
            const openModal = document.querySelector('[role="dialog"][aria-modal="true"]');
            if (openModal) {
                this.closeModal(openModal);
            }
        }

        // Enter/Space for buttons
        if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"]')) {
            e.preventDefault();
            e.target.click();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate any dynamic measurements
        this.updateViewportHeight();
    }

    /**
     * Update viewport height for mobile browsers
     */
    updateViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    /**
     * Show notifications to users
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification__content">
                <span class="notification__message">${message}</span>
                <button class="notification__close" aria-label="Close notification">×</button>
            </div>
        `;

        // Add styles
        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification--success {
                background: #10b981;
                color: white;
            }
            
            .notification--error {
                background: #ef4444;
                color: white;
            }
            
            .notification--info {
                background: #3b82f6;
                color: white;
            }
            
            .notification__content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            
            .notification__close {
                background: none;
                border: none;
                color: currentColor;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        if (!document.querySelector('#notification-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'notification-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Close button handler
        notification.querySelector('.notification__close').addEventListener('click', () => {
            notification.remove();
        });

        // Announce to screen readers
        if (this.ariaLiveRegion) {
            this.ariaLiveRegion.textContent = message;
        }
    }

    /**
     * Setup performance observer
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                this.trackPerformance('lcp', lastEntry.startTime);
            });

            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Fallback for browsers that don't support LCP
            }

            // First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.trackPerformance('fid', entry.processingStart - entry.startTime);
                });
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // Fallback for browsers that don't support FID
            }
        }
    }

    // Analytics and tracking methods
    trackPageLoad() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    trackButtonClick(button) {
        const text = button.textContent.trim();
        const href = button.href || '';
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'Button',
                event_label: text,
                value: href
            });
        }

        console.log('Button clicked:', text);
    }

    trackNavigation(anchor) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation', {
                event_category: 'Internal Link',
                event_label: anchor
            });
        }
    }

    trackFormSubmission(form) {
        const formName = form.getAttribute('name') || form.className || 'Unknown Form';
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'Form',
                event_label: formName
            });
        }

        console.log('Form submitted:', formName);
    }

    trackPerformance(metric, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', metric, {
                event_category: 'Performance',
                value: Math.round(value),
                non_interaction: true
            });
        }
    }

    /**
     * Track conversion goals
     */
    trackConversion(goal, value = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                event_category: 'Conversion',
                event_label: goal,
                value: value
            });
        }

        console.log('Conversion tracked:', goal, value);
    }
}

// Initialize the application
new HarnessTheSparkApp();

// Global utility functions
window.HarnessTheSparkUtils = {
    /**
     * Debounce function to limit function calls
     */
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function to limit function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Animate element into view
     */
    animateIntoView(element, animationClass = 'animate-in') {
        element.classList.add(animationClass);
    },

    /**
     * Format phone number
     */
    formatPhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        return phoneNumber;
    },

    /**
     * Validate email address
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HarnessTheSparkApp;
}
