// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const themeSelect = document.getElementById('themeSelect');
    const themeSelectPanel = document.getElementById('themeSelectPanel');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    const backToTopBtn = document.getElementById('backToTop');
    const scrollProgress = document.getElementById('scrollProgress');
    const projectSearch = document.getElementById('projectSearch');
    const projectFilter = document.getElementById('projectFilter');
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const commandPalette = document.getElementById('commandPalette');
    const commandInput = document.getElementById('commandInput');
    const commandList = document.getElementById('commandList');
    const THEME_KEY = 'lav_theme';
    const REDUCED_MOTION_KEY = 'lav_reduced_motion';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    let selectedCommandIndex = 0;

    function applyTheme(theme) {
        const resolvedTheme = theme === 'auto' ? (prefersDark.matches ? 'dark' : 'light') : theme;
        document.body.setAttribute('data-theme', resolvedTheme);
        document.body.setAttribute('data-theme-mode', theme);
        localStorage.setItem(THEME_KEY, theme);
        if (themeSelect) themeSelect.value = theme;
        if (themeSelectPanel) themeSelectPanel.value = theme;
    }

    function applyReducedMotion(enabled) {
        document.body.setAttribute('data-reduced-motion', enabled ? 'true' : 'false');
        localStorage.setItem(REDUCED_MOTION_KEY, String(enabled));
        if (reducedMotionToggle) reducedMotionToggle.checked = enabled;
    }

    function syncThemeSelectors(e) {
        applyTheme(e.target.value);
    }

    function applyProjectFilters() {
        if (!projectCards.length) return;
        const searchQuery = (projectSearch ? projectSearch.value : '').trim().toLowerCase();
        const filterValue = projectFilter ? projectFilter.value : 'all';

        projectCards.forEach(card => {
            const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const description = (card.querySelector('p')?.textContent || '').toLowerCase();
            const tags = (card.dataset.tags || '').toLowerCase();
            const textBlob = `${title} ${description} ${tags}`;
            const matchesSearch = !searchQuery || textBlob.includes(searchQuery);
            const matchesFilter = filterValue === 'all' || tags.includes(filterValue);
            card.classList.toggle('is-hidden', !(matchesSearch && matchesFilter));
        });
    }

    function initCountUpStats() {
        const statNumbers = document.querySelectorAll('.about-stats .stat h3');
        if (!statNumbers.length) return;
        const reduced = document.body.getAttribute('data-reduced-motion') === 'true';

        const animateStat = (el) => {
            const rawText = el.textContent.trim();
            const target = parseInt(rawText, 10);
            const suffix = rawText.includes('+') ? '+' : '';
            if (Number.isNaN(target)) return;
            if (reduced) {
                el.textContent = `${target}${suffix}`;
                return;
            }

            let current = 0;
            const steps = 36;
            const stepSize = Math.max(1, Math.ceil(target / steps));
            const timer = setInterval(() => {
                current += stepSize;
                if (current >= target) {
                    el.textContent = `${target}${suffix}`;
                    clearInterval(timer);
                } else {
                    el.textContent = `${current}${suffix}`;
                }
            }, 28);
        };

        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;
        const io = new IntersectionObserver((entries, observerRef) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    statNumbers.forEach(animateStat);
                    observerRef.disconnect();
                }
            });
        }, { threshold: 0.35 });
        io.observe(aboutSection);
    }

    function commandItems() {
        return [
            { label: 'Go to Home', hint: 'Navigation', action: () => document.querySelector('a[href="#home"]')?.click() },
            { label: 'Go to Projects', hint: 'Navigation', action: () => document.querySelector('a[href="#projects"]')?.click() },
            { label: 'Go to Contact', hint: 'Navigation', action: () => document.querySelector('a[href="#contact"]')?.click() },
            { label: 'Switch Theme: Light', hint: 'Appearance', action: () => applyTheme('light') },
            { label: 'Switch Theme: Dark', hint: 'Appearance', action: () => applyTheme('dark') },
            { label: 'Switch Theme: Aurora', hint: 'Appearance', action: () => applyTheme('aurora') },
            { label: 'Download Resume', hint: 'Quick Action', action: () => document.getElementById('downloadResume')?.click() },
            { label: 'Open LinkedIn', hint: 'Social', action: () => window.open('https://www.linkedin.com/in/lavkush-pandey-3521451b9/', '_blank', 'noopener,noreferrer') },
            { label: 'Open GitHub', hint: 'Social', action: () => window.open('https://github.com/lavkushp0777', '_blank', 'noopener,noreferrer') },
            { label: 'Toggle Reduced Motion', hint: 'Accessibility', action: () => applyReducedMotion(document.body.getAttribute('data-reduced-motion') !== 'true') }
        ];
    }

    function renderCommands(query = '') {
        if (!commandList) return [];
        const q = query.trim().toLowerCase();
        const filtered = commandItems().filter(item => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q));
        commandList.innerHTML = filtered.map((item, idx) => `
            <li class="command-item ${idx === selectedCommandIndex ? 'active' : ''}" data-index="${idx}">
                <span>${item.label}</span><small>${item.hint}</small>
            </li>
        `).join('') || '<li class="command-item"><span>No command found</span><small>Try another keyword</small></li>';
        return filtered;
    }

    function openCommandPalette() {
        if (!commandPalette || !commandInput) return;
        selectedCommandIndex = 0;
        commandPalette.classList.add('open');
        commandPalette.setAttribute('aria-hidden', 'false');
        renderCommands('');
        commandInput.value = '';
        commandInput.focus();
    }

    function closeCommandPalette() {
        if (!commandPalette) return;
        commandPalette.classList.remove('open');
        commandPalette.setAttribute('aria-hidden', 'true');
    }

    function initCursorOrb() {
        const isFinePointer = window.matchMedia('(pointer: fine)').matches;
        if (!isFinePointer) return;

        const orb = document.createElement('div');
        orb.className = 'cursor-orb';
        const orbTrail = document.createElement('div');
        orbTrail.className = 'cursor-orb-trail';
        document.body.appendChild(orb);
        document.body.appendChild(orbTrail);

        let targetX = window.innerWidth * 0.5;
        let targetY = window.innerHeight * 0.5;
        let currentX = targetX;
        let currentY = targetY;
        let trailX = targetX;
        let trailY = targetY;
        const ORB_RADIUS = 120;
        const TRAIL_RADIUS = 180;

        const updateTarget = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            const hidden = document.body.getAttribute('data-reduced-motion') === 'true';
            orb.style.opacity = hidden ? '0' : '';
            orbTrail.style.opacity = hidden ? '0' : '';
        };

        document.addEventListener('mousemove', updateTarget);
        document.addEventListener('mouseenter', () => {
            if (document.body.getAttribute('data-reduced-motion') !== 'true') {
                orb.style.opacity = '';
                orbTrail.style.opacity = '';
            }
        });
        document.addEventListener('mouseleave', () => {
            orb.style.opacity = '0';
            orbTrail.style.opacity = '0';
        });

        const animate = () => {
            if (document.body.getAttribute('data-reduced-motion') === 'true') {
                orb.style.opacity = '0';
                orbTrail.style.opacity = '0';
                requestAnimationFrame(animate);
                return;
            }

            // Fast, premium feel: primary orb responds quickly, trail follows smoothly.
            currentX += (targetX - currentX) * 0.28;
            currentY += (targetY - currentY) * 0.28;
            trailX += (targetX - trailX) * 0.14;
            trailY += (targetY - trailY) * 0.14;
            orb.style.transform = `translate3d(${currentX - ORB_RADIUS}px, ${currentY - ORB_RADIUS}px, 0)`;
            orbTrail.style.transform = `translate3d(${trailX - TRAIL_RADIUS}px, ${trailY - TRAIL_RADIUS}px, 0)`;
            requestAnimationFrame(animate);
        };

        animate();
    }

    const savedTheme = localStorage.getItem(THEME_KEY) || 'auto';
    const savedReducedMotion = localStorage.getItem(REDUCED_MOTION_KEY) === 'true';
    applyTheme(savedTheme);
    applyReducedMotion(savedReducedMotion);

    if (themeSelect) themeSelect.addEventListener('change', syncThemeSelectors);
    if (themeSelectPanel) themeSelectPanel.addEventListener('change', syncThemeSelectors);
    if (projectSearch) projectSearch.addEventListener('input', applyProjectFilters);
    if (projectFilter) projectFilter.addEventListener('change', applyProjectFilters);

    prefersDark.addEventListener('change', () => {
        const currentMode = document.body.getAttribute('data-theme-mode') || 'auto';
        if (currentMode === 'auto') applyTheme('auto');
    });

    if (settingsToggle && settingsPanel) {
        settingsToggle.addEventListener('click', function() {
            settingsPanel.classList.toggle('open');
            settingsPanel.setAttribute('aria-hidden', String(!settingsPanel.classList.contains('open')));
        });
    }

    if (reducedMotionToggle) {
        reducedMotionToggle.addEventListener('change', function(e) {
            applyReducedMotion(e.target.checked);
            showNotification(`Reduced motion ${e.target.checked ? 'enabled' : 'disabled'}.`, 'success');
        });
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key.toLowerCase() === 'j') {
            e.preventDefault();
            if (settingsPanel) {
                settingsPanel.classList.toggle('open');
                settingsPanel.setAttribute('aria-hidden', String(!settingsPanel.classList.contains('open')));
            }
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
    });

    document.addEventListener('click', function(e) {
        if (!settingsPanel || !settingsToggle) return;
        const clickedInsidePanel = settingsPanel.contains(e.target);
        const clickedToggle = settingsToggle.contains(e.target);
        if (!clickedInsidePanel && !clickedToggle) {
            settingsPanel.classList.remove('open');
            settingsPanel.setAttribute('aria-hidden', 'true');
        }
    });

    if (commandInput) {
        commandInput.addEventListener('input', function(e) {
            selectedCommandIndex = 0;
            renderCommands(e.target.value);
        });

        commandInput.addEventListener('keydown', function(e) {
            const commands = renderCommands(commandInput.value);
            if (!commands.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedCommandIndex = (selectedCommandIndex + 1) % commands.length;
                renderCommands(commandInput.value);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedCommandIndex = (selectedCommandIndex - 1 + commands.length) % commands.length;
                renderCommands(commandInput.value);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                commands[selectedCommandIndex]?.action();
                closeCommandPalette();
            }
            if (e.key === 'Escape') {
                closeCommandPalette();
            }
        });
    }

    if (commandList) {
        commandList.addEventListener('click', function(e) {
            const commandItem = e.target.closest('.command-item');
            if (!commandItem) return;
            const commands = renderCommands(commandInput ? commandInput.value : '');
            const idx = Number(commandItem.dataset.index);
            if (!Number.isNaN(idx) && commands[idx]) {
                commands[idx].action();
                closeCommandPalette();
            }
        });
    }

    if (commandPalette) {
        commandPalette.addEventListener('click', function(e) {
            if (e.target === commandPalette) closeCommandPalette();
        });
    }

    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlight on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });

        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        if (scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
            scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', window.scrollY > 360);
        }
    });

    // Resume download functionality
    const downloadBtn = document.getElementById('downloadResume');
    downloadBtn.addEventListener('click', function() {
        const a = document.createElement('a');
        a.href = 'Lavkush_Pandey.pdf';
        a.download = 'Lavkush_Pandey.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Show success message
        showNotification('Resume downloaded successfully!', 'success');
    });

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields!', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address!', 'error');
            return;
        }
        
        // Simulate form submission (replace with actual form handling)
        simulateFormSubmission(name, email, subject, message);
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.skill-category, .project-card, .stat, .education-item, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Typing animation for hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        setTimeout(() => {
            const typeWriter = setInterval(() => {
                if (i < text.length) {
                    heroTitle.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeWriter);
                }
            }, 50);
        }, 1000);
    }

    // Skill tags hover effect
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(2deg)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Project cards tilt effect
    const projectCardsTilt = document.querySelectorAll('.project-card');
    projectCardsTilt.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotateX(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateX(0deg)';
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        if (document.body.getAttribute('data-reduced-motion') === 'true') return;
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    window.dispatchEvent(new Event('scroll'));
    applyProjectFilters();
    initCountUpStats();
    initCursorOrb();

    // Certificate modal functionality
    const certificateModal = document.getElementById('certificateModal');
    const modalClose = document.querySelector('.certificate-modal-close');
    const downloadCertBtn = document.getElementById('downloadCertBtn');
    let currentCertType = '';
    
    // Close modal when clicking the X
    modalClose.addEventListener('click', function() {
        certificateModal.style.display = 'none';
    });
    
    // Download certificate functionality
    downloadCertBtn.addEventListener('click', function() {
        if (currentCertType) {
            downloadCertificateImage(currentCertType);
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === certificateModal) {
            certificateModal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certificateModal.style.display === 'block') {
            certificateModal.style.display = 'none';
        }
    });

    // Initialize particles effect (simple version)
    createParticles();
});

// Global variable to track current certificate
let currentCertType = '';

// Certificate viewing functionality
function viewCertificate(certType) {
    currentCertType = certType;

    const certificateFiles = {
        python: 'TalentBattle_Lavkush_Pandey_Python_Programming.pdf',
        aws: 'TalentBattle_Lavkush_Pandey_Cloud_Computing_Using_AWS.pdf',
        java: 'TalentBattle_Lavkush_Pandey_Java_Programming.pdf',
        powerbi: 'TalentBattle_Lavkush_Pandey_Power_BI.pdf',
        agile: 'agileandscrum.pdf'
    };

    const file = certificateFiles[certType];
    if (!file) {
        showNotification('Certificate file not found.', 'error');
        return;
    }

    const opened = window.open(file, '_blank', 'noopener,noreferrer');
    if (!opened) {
        showNotification('Popup blocked. Please allow popups to view the certificate.', 'error');
    }
}

// Download certificate as text file
function downloadCertificateImage(certType) {
    const certificateFiles = {
        python: 'TalentBattle_Lavkush_Pandey_Python_Programming.pdf',
        aws: 'TalentBattle_Lavkush_Pandey_Cloud_Computing_Using_AWS.pdf',
        java: 'TalentBattle_Lavkush_Pandey_Java_Programming.pdf',
        powerbi: 'TalentBattle_Lavkush_Pandey_Power_BI.pdf',
        agile: 'agileandscrum.pdf'
    };

    const file = certificateFiles[certType];
    if (!file) return;

    const a = document.createElement('a');
    a.href = file;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Show success message
    showNotification('Certificate downloaded successfully!', 'success');
}
// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to simulate form submission
function simulateFormSubmission(name, email, subject, message) {
    // Show loading state
    const submitBtn = document.querySelector('.contact-form .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Clear form
        document.getElementById('contactForm').reset();
        
        // Show success message
        showNotification(`Thank you ${name}! Your message has been received. I'll get back to you soon.`, 'success');
        
        // In a real implementation, you would send this data to your backend
        console.log('Form submission:', { name, email, subject, message });
    }, 2000);
}

// Helper function to show notifications
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        line-height: 1;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Simple particles effect
function createParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
    `;
    
    hero.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s infinite linear;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Add CSS for particles animation
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes float {
        0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyles);

