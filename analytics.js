/**
 * Analytics and Tracking Setup for Harness the Spark
 * Includes Google Analytics 4, Hotjar, and custom event tracking
 */

class AnalyticsManager {
    constructor() {
        this.isEnabled = true;
        this.hasConsent = false;
        this.trackingId = 'GA_MEASUREMENT_ID'; // Replace with actual GA4 Measurement ID
        this.hotjarId = 0000000; // Replace with actual Hotjar ID
        
        this.init();
    }

    /**
     * Initialise analytics
     */
    init() {
        // Check for Do Not Track or consent
        if (navigator.doNotTrack === '1' || localStorage.getItem('analytics-consent') === 'false') {
            this.isEnabled = false;
            console.log('Analytics disabled due to user preference');
            return;
        }

        // Check for existing consent
        const consent = localStorage.getItem('analytics-consent');
        if (consent === 'true') {
            this.hasConsent = true;
            this.loadAnalytics();
        } else if (consent === null) {
            // First visit - show consent banner
            this.showConsentBanner();
        }

        // Setup event listeners
        this.setupEventTracking();
    }

    /**
     * Show GDPR consent banner
     */
    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'analytics-consent-banner';
        banner.innerHTML = `
            <div class="consent-banner">
                <div class="consent-content">
                    <h3>We value your privacy</h3>
                    <p>We use analytics to improve your experience and understand how our website is used. This helps us provide better coaching services.</p>
                    <div class="consent-buttons">
                        <button id="accept-analytics" class="btn-accept">Accept Analytics</button>
                        <button id="decline-analytics" class="btn-decline">Essential Only</button>
                        <a href="/privacy-policy" class="privacy-link">Privacy Policy</a>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const styles = `
            .consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                color: white;
                padding: 1.5rem;
                z-index: 10001;
                border-top: 3px solid #8B5CF6;
                animation: slideUp 0.5s ease-out;
            }
            
            .consent-content {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
            }
            
            .consent-content h3 {
                margin: 0 0 0.5rem 0;
                color: #EC4899;
            }
            
            .consent-content p {
                margin: 0 0 1rem 0;
                opacity: 0.9;
            }
            
            .consent-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .btn-accept, .btn-decline {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-accept {
                background: #8B5CF6;
                color: white;
            }
            
            .btn-accept:hover {
                background: #7C3AED;
                transform: translateY(-2px);
            }
            
            .btn-decline {
                background: transparent;
                color: white;
                border: 2px solid #666;
            }
            
            .btn-decline:hover {
                border-color: #999;
                background: rgba(255, 255, 255, 0.1);
            }
            
            .privacy-link {
                color: #EC4899;
                text-decoration: none;
                font-size: 0.9rem;
            }
            
            .privacy-link:hover {
                text-decoration: underline;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .consent-buttons {
                    flex-direction: column;
                }
                
                .btn-accept, .btn-decline {
                    width: 100%;
                }
            }
        `;

        // Add styles to document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Add banner to document
        document.body.appendChild(banner);

        // Setup event listeners
        document.getElementById('accept-analytics').addEventListener('click', () => {
            this.grantConsent();
            banner.remove();
        });

        document.getElementById('decline-analytics').addEventListener('click', () => {
            this.denyConsent();
            banner.remove();
        });
    }

    /**
     * Grant analytics consent
     */
    grantConsent() {
        localStorage.setItem('analytics-consent', 'true');
        this.hasConsent = true;
        this.loadAnalytics();
        
        // Track consent granted
        this.trackEvent('consent', 'granted', 'analytics');
        
        console.log('Analytics consent granted');
    }

    /**
     * Deny analytics consent
     */
    denyConsent() {
        localStorage.setItem('analytics-consent', 'false');
        this.hasConsent = false;
        this.isEnabled = false;
        
        console.log('Analytics consent denied');
    }

    /**
     * Load analytics scripts
     */
    async loadAnalytics() {
        if (!this.isEnabled || !this.hasConsent) return;

        try {
            // Load Google Analytics 4
            await this.loadGoogleAnalytics();
            
            // Load Hotjar
            await this.loadHotjar();
            
            // Initialise custom tracking
            this.initCustomTracking();
            
            console.log('Analytics loaded successfully');
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    }

    /**
     * Load Google Analytics 4
     */
    async loadGoogleAnalytics() {
        return new Promise((resolve, reject) => {
            // Don't load if already loaded
            if (window.gtag) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
            script.onload = () => {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                
                gtag('js', new Date());
                gtag('config', this.trackingId, {
                    page_title: document.title,
                    page_location: window.location.href,
                    custom_map: {
                        custom_parameter_1: 'coaching_page'
                    }
                });

                resolve();
            };
            script.onerror = reject;
            
            document.head.appendChild(script);
        });
    }

    /**
     * Load Hotjar
     */
    async loadHotjar() {
        return new Promise((resolve) => {
            if (window.hj) {
                resolve();
                return;
            }

            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:this.hotjarId,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                r.onload = resolve;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        });
    }

    /**
     * Initialise custom tracking
     */
    initCustomTracking() {
        // Track initial page load
        this.trackPageView();
        
        // Track page engagement time
        this.trackEngagementTime();
        
        // Track scroll depth
        this.trackScrollDepth();
        
        // Track outbound links
        this.trackOutboundLinks();
    }

    /**
     * Setup event tracking
     */
    setupEventTracking() {
        // Form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                this.trackEvent('form', 'submit', form.className || 'unnamed_form');
            }
        });

        // Button clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .btn, .cta-button, .btn-primary, .btn-secondary');
            if (target) {
                const text = target.textContent.trim();
                const type = target.classList.contains('cta-button') ? 'cta' :
                            target.classList.contains('btn-primary') ? 'primary' :
                            target.classList.contains('btn-secondary') ? 'secondary' : 'button';
                
                this.trackEvent('button', 'click', `${type}_${text.toLowerCase().replace(/\s+/g, '_')}`);
            }
        });

        // Section visibility (for measuring engagement)
        this.trackSectionVisibility();
    }

    /**
     * Track section visibility
     */
    trackSectionVisibility() {
        const sections = document.querySelectorAll('section[id], .hero, .services, .sparkhub, .about, .contact');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0] || 'unnamed_section';
                    this.trackEvent('section', 'view', sectionName);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    /**
     * Track page view
     */
    trackPageView(page = window.location.pathname) {
        if (!this.isEnabled) return;

        if (window.gtag) {
            gtag('config', this.trackingId, {
                page_path: page,
                page_title: document.title,
                page_location: window.location.href
            });
        }

        // Custom page view tracking
        this.trackEvent('page', 'view', page);
    }

    /**
     * Track custom events
     */
    trackEvent(category, action, label, value) {
        if (!this.isEnabled) return;

        // Google Analytics
        if (window.gtag) {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value,
                custom_parameter_1: 'coaching_site'
            });
        }

        // Hotjar
        if (window.hj) {
            hj('event', `${category}_${action}`);
        }

        // Console logging for development
        if (process.env.NODE_ENV === 'development') {
            console.log('Analytics Event:', { category, action, label, value });
        }
    }

    /**
     * Track engagement time
     */
    trackEngagementTime() {
        let startTime = Date.now();
        let isActive = true;

        // Track when user becomes inactive
        const events = ['mouseout', 'blur', 'beforeunload'];
        events.forEach(event => {
            window.addEventListener(event, () => {
                if (isActive) {
                    const engagementTime = Date.now() - startTime;
                    this.trackEvent('engagement', 'time_on_page', 'seconds', Math.round(engagementTime / 1000));
                    isActive = false;
                }
            });
        });

        // Track when user becomes active again
        const activeEvents = ['mouseover', 'focus', 'scroll', 'click', 'keypress'];
        activeEvents.forEach(event => {
            window.addEventListener(event, () => {
                if (!isActive) {
                    startTime = Date.now();
                    isActive = true;
                }
            });
        });
    }

    /**
     * Track scroll depth
     */
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
            }

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('scroll', 'depth', `${milestone}%`, milestone);
                }
            });
        });
    }

    /**
     * Track outbound links
     */
    trackOutboundLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hostname !== window.location.hostname) {
                this.trackEvent('outbound', 'click', link.hostname);
            }
        });
    }

    /**
     * Track conversion goals
     */
    trackConversion(goal, value = null) {
        if (!this.isEnabled) return;

        this.trackEvent('conversion', goal, window.location.pathname, value);
        
        // Enhanced ecommerce tracking for GA4
        if (window.gtag) {
            gtag('event', 'conversion', {
                send_to: this.trackingId,
                event_category: 'conversion',
                event_label: goal,
                value: value
            });
        }
    }

    /**
     * Track user properties
     */
    setUserProperty(name, value) {
        if (!this.isEnabled) return;

        if (window.gtag) {
            gtag('config', this.trackingId, {
                custom_map: {
                    [name]: value
                }
            });
        }
    }

    /**
     * Enable/disable analytics
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('analytics-enabled', enabled.toString());
        
        if (!enabled) {
            // Disable Google Analytics
            if (window.gtag) {
                gtag('consent', 'update', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied'
                });
            }
        }
    }

    /**
     * Get analytics status
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            hasConsent: this.hasConsent,
            trackingId: this.trackingId,
            hotjarId: this.hotjarId
        };
    }
}

// Initialise analytics
const analytics = new AnalyticsManager();

// Make analytics available globally
window.analytics = analytics;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}

console.log('Analytics system initialised');