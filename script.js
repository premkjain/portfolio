// Global variable to track form submission state for the iframe
var submitted = false;

document.addEventListener('DOMContentLoaded', function() {
    // --- Canvas Background Drawing (Placeholder/Example) ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        function drawInitialCanvasBackground() { console.log("Canvas initialized. Add drawing logic here for the main background."); }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); 
        drawInitialCanvasBackground(); 
    }

    // --- Intersection Observer for Section Animations ---
    const elementsToObserve = document.querySelectorAll('.resume-section'); 
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback = function(entries, observer) {
        entries.forEach(entry => { 
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                // entry.target.classList.remove('is-visible'); 
            }
        });
    };
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    elementsToObserve.forEach(el => {
        if (!el.classList.contains('animate-slide-in-left') && !el.classList.contains('animate-slide-in-right')) {
            el.classList.add('fade-in-section'); 
        }
        scrollObserver.observe(el);
    });

    // --- Current Year for Footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

    // --- Contact Form Submission Handling ---
    window.handleFormSubmission = function() {
        if (submitted) {
            const form = document.getElementById('contact-form');
            const submissionMessage = document.getElementById('form-submission-message');
            submissionMessage.textContent = 'Thank you! Your message has been sent successfully.';
            submissionMessage.className = 'success'; 
            submissionMessage.style.display = 'block';
            form.reset();
            submitted = false;
            setTimeout(() => { submissionMessage.style.display = 'none'; }, 5000);
        }
    }

    // --- SCROLL-BASED GRADIENT BACKGROUND COLOR CHANGE ---
    const bodyElement = document.body;
    const documentElement = document.documentElement;
    
    let lightScrollColorStops = [], lightScrollColorStopsMid = [], lightScrollColorStopsBottom = [];
    let darkScrollColorStops = [], darkScrollColorStopsMid = [], darkScrollColorStopsBottom = [];

    function hexToRgb(hex) { 
        let r = 0, g = 0, b = 0;
        if (!hex || hex.charAt(0) !== '#') { return {r:128,g:128,b:128}; } 
        hex = hex.slice(1);
        if (hex.length === 3) { 
            r = parseInt(hex[0] + hex[0], 16); g = parseInt(hex[1] + hex[1], 16); b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) { 
            r = parseInt(hex.substring(0,2), 16); g = parseInt(hex.substring(2,4), 16); b = parseInt(hex.substring(4,6), 16);
        }
        return {r, g, b};
    }
    
    function populateScrollGradientColors(theme) {
        const s = getComputedStyle(bodyElement); 
        const prefix = theme === 'dark' ? '-dark' : '-light';

        const currentThemeColorStops = [
            hexToRgb(s.getPropertyValue(`--scroll-gradient-color-1${prefix}`).trim()),
            hexToRgb(s.getPropertyValue(`--scroll-gradient-color-2${prefix}`).trim()),
            hexToRgb(s.getPropertyValue(`--scroll-gradient-color-3${prefix}`).trim()),
            hexToRgb(s.getPropertyValue(`--scroll-gradient-color-4${prefix}`).trim()),
            hexToRgb(s.getPropertyValue(`--scroll-gradient-color-5${prefix}`).trim())
        ];
        
        if (theme === 'dark') {
            darkScrollColorStops = currentThemeColorStops;
            darkScrollColorStopsMid = [ { r: 20, g: 30, b: 48 }, { r: 30, g: 45, b: 70 }, { r: 40, g: 58, b: 89 }, { r: 50, g: 70, b: 108 }, { r: 20, g: 30, b: 48 }];
            darkScrollColorStopsBottom = [ { r: 28, g: 28, b: 28 }, { r: 42, g: 42, b: 42 }, { r: 58, g: 58, b: 58 }, { r: 70, g: 70, b: 70 }, { r: 28, g: 28, b: 28 }];
        } else { 
            lightScrollColorStops = currentThemeColorStops;
            lightScrollColorStopsMid = [ { r: 109, g: 213, b: 237 }, { r: 50, g: 120, b: 180 }, { r: 248, g: 255, b: 174 }, { r: 67, g: 198, b: 172 }, { r: 109, g: 213, b: 237 } ];
            lightScrollColorStopsBottom = [ { r: 255, g: 165, b: 0 }, { r: 255, g: 193, b: 75 }, { r: 255, g: 223, b: 150 }, { r: 255, g: 248, b: 225 }, { r: 255, g: 165, b: 0 } ];
        }
    }

    function interpolateColor(c1, c2, f) { const r = Math.round(c1.r + f * (c2.r - c1.r)), g = Math.round(c1.g + f * (c2.g - c1.g)), b = Math.round(c1.b + f * (c2.b - c1.b)); return `rgb(${r},${g},${b})`; }
    function interpolateGradientSet(s1, s2, f) { 
        const nS = []; 
        for (let i=0; i<5; i++) { 
            if(s1 && s1[i] && s2 && s2[i]) { 
                nS.push(interpolateColor(s1[i], s2[i], f)); 
            } else {
                nS.push('transparent'); 
            }
        } 
        return nS; 
    }

    function updateGradientOnScroll() {
        const currentTheme = bodyElement.getAttribute('data-theme') || 'light';
        let activeStops, activeStopsMid, activeStopsBottom;

        if (currentTheme === 'dark') {
            if (darkScrollColorStops.length === 0) populateScrollGradientColors('dark'); // Populate if empty
            activeStops = darkScrollColorStops;
            activeStopsMid = darkScrollColorStopsMid;
            activeStopsBottom = darkScrollColorStopsBottom;
        } else {
            if (lightScrollColorStops.length === 0) populateScrollGradientColors('light'); // Populate if empty
            activeStops = lightScrollColorStops;
            activeStopsMid = lightScrollColorStopsMid;
            activeStopsBottom = lightScrollColorStopsBottom;
        }

        if (!activeStops.length || !activeStopsMid.length || !activeStopsBottom.length) return;


        const sT = window.pageYOffset || documentElement.scrollTop, sH = documentElement.scrollHeight - documentElement.clientHeight, sP = sH === 0 ? 0 : sT / sH;
        let cGC;
        
        if (sP <= 0.5) cGC = interpolateGradientSet(activeStops, activeStopsMid, sP / 0.5);
        else cGC = interpolateGradientSet(activeStopsMid, activeStopsBottom, (sP - 0.5) / 0.5);
        
        const themeSuffix = currentTheme === 'dark' ? '-dark' : '-light';
        for(let i=0; i<5; i++) {
             bodyElement.style.setProperty(`--scroll-gradient-color-${i+1}${themeSuffix}`, cGC[i]);
        }
    }
    let scrollTimeout;
    window.addEventListener('scroll', () => { if (scrollTimeout) window.cancelAnimationFrame(scrollTimeout); scrollTimeout = window.requestAnimationFrame(updateGradientOnScroll); }, { passive: true });
    

    // --- THEME TOGGLE ---
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const initialUserTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = initialUserTheme || (systemPrefersDark ? 'dark' : 'light'); 
    const themeIcon = themeToggleButton.querySelector('i');

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        populateScrollGradientColors(theme); 
        updateGradientOnScroll(); 
    }
    applyTheme(currentTheme); 

    themeToggleButton.addEventListener('click', () => {
        let newTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { 
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });


    // --- BACK TO TOP BUTTON ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) { 
                backToTopButton.style.display = 'flex'; 
                setTimeout(() => backToTopButton.style.opacity = '1', 10); 
            } else {
                backToTopButton.style.opacity = '0';
                setTimeout(() => backToTopButton.style.display = 'none', 300); 
            }
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- SCROLL DOWN CUE ---
    const scrollDownCueButton = document.getElementById('scroll-down-cue');
    const mainContentContainer = document.querySelector('.container'); // Target the main content container

    if (scrollDownCueButton && mainContentContainer) {
        scrollDownCueButton.addEventListener('click', () => {
            // Scroll to the top of the main content container
            mainContentContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Hide the scroll-down cue once user starts scrolling significantly
        // or if they click it.
        let cueHiddenByScroll = false;
        const hideCue = () => {
            if (scrollDownCueButton.style.opacity !== '0') { // Prevent multiple timeouts
                scrollDownCueButton.style.opacity = '0';
                setTimeout(() => { 
                    scrollDownCueButton.style.display = 'none'; 
                }, 300); // Match CSS transition time
            }
        };
        
        scrollDownCueButton.addEventListener('click', hideCue);

        window.addEventListener('scroll', () => {
            if (!cueHiddenByScroll && window.pageYOffset > 100) { // Hide after scrolling 100px
                hideCue();
                cueHiddenByScroll = true; // Ensure it only triggers once due to scroll
            }
        }, { passive: true });
    }

});