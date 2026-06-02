
(function () {
    const sticky = document.getElementById('sticky-nav');
    const findOut = document.querySelector('.find-out');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileToggleSticky = document.getElementById('mobile-toggle-sticky');
    const drawer = document.getElementById('mobile-drawer');
    const drawerNav = drawer && drawer.querySelector('.drawer-nav');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerClose = document.getElementById('drawer-close');

    if (!sticky || !findOut) return;

    // ensure starting hidden state (opacity/transform keep it visually out)
    sticky.style.visibility = 'hidden';

    const toleranceTop = 10; // px before findOut top

    function showSticky() {
        if (sticky.classList.contains('visible')) return;
        // make visible immediately then animate in
        sticky.style.visibility = 'visible';
        sticky.classList.add('visible');
        sticky.setAttribute('aria-hidden', 'false');
    }

    function hideSticky() {
        if (!sticky.classList.contains('visible')) return;
        // animate out then hide via transitionend
        sticky.classList.remove('visible');
        sticky.setAttribute('aria-hidden', 'true');
        const onEnd = (e) => {
            if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                sticky.style.visibility = 'hidden';
                sticky.removeEventListener('transitionend', onEnd);
            }
        };
        sticky.addEventListener('transitionend', onEnd);
    }

    function checkSticky() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const findTop = findOut.offsetTop;
        const enteredFind = (scrollY + 1) >= (findTop - toleranceTop);

        if (enteredFind) showSticky(); else hideSticky();
    }

    // Drawer handling
    let _lastFocused = null;
    function openDrawer() {
        if (!drawer) return;
        // populate links from main nav ul if empty (ignore comments)
        if (drawerNav && drawerNav.querySelectorAll('a,button').length === 0) {
            const mainNav = document.querySelector('#main-nav ul');
            if (mainNav) {
                // Build a simplified, mobile-friendly list: Features, Testimonials, Guides, Get the app
                const anchors = Array.from(mainNav.querySelectorAll('a'));
                // Preferred labels to include (order matters)
                const wanted = ['Features', 'Testimonials', 'Guides', 'Get the app'];
                const frag = document.createDocumentFragment();
                wanted.forEach(label => {
                    const match = anchors.find(a => (a.textContent || '').trim().includes(label));
                    if (match) {
                        const link = document.createElement('a');
                        link.href = match.getAttribute('href') || '#';
                        link.textContent = (match.textContent || '').trim();
                        link.className = '';
                        link.setAttribute('role', 'menuitem');
                        frag.appendChild(link);
                    }
                });
                // clear and append
                drawerNav.innerHTML = '';
                drawerNav.appendChild(frag);
            }
        }
        _lastFocused = document.activeElement;
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        // reflect expanded state on toggles
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
        if (mobileToggleSticky) mobileToggleSticky.setAttribute('aria-expanded', 'true');
        // move focus to close button or first link
        const firstFocusable = drawer.querySelector('button, a');
        if (firstFocusable) firstFocusable.focus();
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        if (mobileToggleSticky) mobileToggleSticky.setAttribute('aria-expanded', 'false');
        // restore focus
        try { if (_lastFocused && typeof _lastFocused.focus === 'function') _lastFocused.focus(); } catch (e) { }
        _lastFocused = null;
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
    if (mobileToggleSticky) mobileToggleSticky.addEventListener('click', openDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

    window.addEventListener('scroll', checkSticky, { passive: true });
    window.addEventListener('resize', checkSticky);

    // initial check
    setTimeout(checkSticky, 50);

    // Testimonials carousel controls (mobile)
    (function setupTestimonialsCarousel() {
        const carousel = document.querySelector('.testimonials-grid');
        const prev = document.getElementById('testimonial-prev');
        const next = document.getElementById('testimonial-next');
        if (!carousel || !prev || !next) return;

        // show buttons on mobile (remove sr-only)
        const showButtons = () => {
            if (window.innerWidth <= 640) {
                prev.classList.remove('sr-only');
                next.classList.remove('sr-only');
            } else {
                prev.classList.add('sr-only');
                next.classList.add('sr-only');
            }
        };

        function scrollByAmount(amount) {
            carousel.scrollBy({ left: amount, behavior: 'smooth' });
        }

        prev.addEventListener('click', () => {
            scrollByAmount(-carousel.clientWidth);
            // update after a short delay in case of smooth scrolling
            setTimeout(updateDots, 250);
        });
        next.addEventListener('click', () => {
            scrollByAmount(carousel.clientWidth);
            setTimeout(updateDots, 250);
        });

        // pagination dots (if present)
        const dots = Array.from(document.querySelectorAll('#testimonials-dots span'));

        function updateDots() {
            if (!dots || dots.length === 0) return;
            const idx = Math.round((carousel.scrollLeft || 0) / (carousel.clientWidth || 1));
            dots.forEach((d, i) => d.style.background = (i === idx) ? '#ff6b57' : '#6b7280');
        }

        function updateButtons() {
            const max = carousel.scrollWidth - carousel.clientWidth;
            prev.disabled = carousel.scrollLeft <= 8;
            next.disabled = carousel.scrollLeft >= (max - 8);
            updateDots();
        }

        carousel.addEventListener('scroll', () => { updateButtons(); }, { passive: true });
        window.addEventListener('resize', () => { showButtons(); updateButtons(); });
        // initial
        showButtons();
        updateButtons();
    })();
})();
