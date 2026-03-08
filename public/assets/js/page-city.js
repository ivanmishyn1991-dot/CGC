const $ = s => document.querySelector(s);

/* burger/nav */
let nav = null;
let burger = null;

const setBurgerState = (open) => {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
};

window.addEventListener('load', () => {
    nav = $('#main-nav');
    burger = document.querySelector('.hamburger');

    if (burger && nav){
        burger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setBurgerState(!nav.classList.contains('open'));
        });

        nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setBurgerState(false)));

        document.addEventListener('click', (e) => {
            if (!nav.classList.contains('open')) return;
            const clickedInside = nav.contains(e.target) || burger.contains(e.target);
            if (!clickedInside) setBurgerState(false);
        });
    }
});

/* desktop phone: click copies phone + badge */
(function(){
    const phoneBtn = $('#headerPhoneBtn');
    const badge = $('#copiedBadge');
    const phoneToCopy = '+1 (672) 500-6060';

    let badgeTimer = null;

    function showBadge(){
        if (!badge) return;
        badge.classList.add('show');
        if (badgeTimer) clearTimeout(badgeTimer);
        badgeTimer = setTimeout(() => badge.classList.remove('show'), 1600);
    }

    if (!phoneBtn) return;

    phoneBtn.addEventListener('click', async (e) => {
        const isDesktop = window.matchMedia('(min-width: 861px)').matches;
        if (!isDesktop) return; // mobile keeps tel:
        e.preventDefault();

        try{
            await navigator.clipboard.writeText(phoneToCopy);
            showBadge();
        }catch(err){
            const ta = document.createElement('textarea');
            ta.value = phoneToCopy;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try{ document.execCommand('copy'); }catch(e2){}
            document.body.removeChild(ta);
            showBadge();
        }
    });
})();

/* robot widget logic */
(function(){
    const wrap = document.getElementById('cgcRobotWrap');
    const btn  = document.getElementById('cgcRobotBtn');
    const hit  = document.getElementById('cgcRobotHit');
    const bubble = document.getElementById('cgcRobotBubble');

    if (!wrap || !btn || !bubble) return;

    const toggle = (e) => {
        e.stopPropagation();
        const isOpen = wrap.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };

    if (hit) hit.addEventListener('click', toggle);
    btn.addEventListener('click', toggle);

    document.addEventListener('click', (e) => {
        if (!wrap.classList.contains('is-open')) return;
        if (wrap.contains(e.target)) return;
        wrap.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
    });

    function showBubble(){
        if (wrap.classList.contains('is-open')) return;
        bubble.classList.add('is-visible');
        setTimeout(() => bubble.classList.remove('is-visible'), 2500);
    }

    setTimeout(showBubble, 3000);
    setInterval(showBubble, 10000);
})();

/* photo modal: click opens, second click closes */
(function(){
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('photoModalImg');
    const closeBtn = document.getElementById('photoModalClose');

    if (!modal || !modalImg) return;

    let currentSrc = "";

    function openModal(src, alt){
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        modalImg.src = src;
        modalImg.alt = alt || 'Photo preview';
        document.body.classList.add('modal-open');
        currentSrc = src;
    }

    function closeModal(){
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalImg.src = "";
        document.body.classList.remove('modal-open');
        currentSrc = "";
    }

    document.addEventListener('click', (e) => {
        const img = e.target.closest('img.work-photo');
        if (!img) return;

        e.preventDefault();
        e.stopPropagation();

        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || '';

        if (modal.classList.contains('open') && currentSrc === src){
            closeModal();
            return;
        }

        openModal(src, alt);
    });

    closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        const inner = e.target.closest('.photo-modal-inner');
        if (inner) return;
        closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
})();

/* Services accordion logic (left panel) */
(function(){
    const btn = document.getElementById('servicesAccBtn');
    const panel = document.getElementById('servicesAccPanel');
    if (!btn || !panel) return;

    const setOpen = (open) => {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.classList.toggle('open', open);
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        setOpen(!isOpen);
    });
})();

/* ===== Side CTA Buttons (PC only) ===== */
(function(){
    const sideCallMeBack = document.getElementById('sideCallMeBack');
    const sidePriceBtn = document.getElementById('sidePriceBtn');
    
    // Call me back - открывает Quick Quote модал
    if (sideCallMeBack) {
        sideCallMeBack.addEventListener('click', () => {
            const quickQuoteOverlay = document.getElementById('quickQuoteOverlay');
            const quickQuoteModal = document.getElementById('quickQuoteModal');
            if (quickQuoteOverlay && quickQuoteModal) {
                quickQuoteOverlay.classList.add('open');
                quickQuoteModal.classList.add('open');
                document.body.style.overflow = 'hidden';
                const phoneInput = document.getElementById('quickPhone');
                if (phoneInput) setTimeout(() => phoneInput.focus(), 150);
            }
        });
    }
    
    // Price - открывает Price модал
    if (sidePriceBtn) {
        sidePriceBtn.addEventListener('click', () => {
            const priceOverlay = document.getElementById('priceModalOverlay');
            const priceModal = document.getElementById('priceModal');
            if (priceOverlay && priceModal) {
                priceOverlay.classList.add('open');
                priceModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }
})();

/* ===== Quick Quote & Price Modals Handling ===== */
(function(){
    // Quick Quote Modal
    const quickQuoteOverlay = document.getElementById('quickQuoteOverlay');
    const quickQuoteModal = document.getElementById('quickQuoteModal');
    const quickQuoteClose = document.getElementById('quickQuoteClose');
    const quickQuoteForm = document.getElementById('quickQuoteForm');
    const quickPhoneInput = document.getElementById('quickPhone');
    const quickQuoteSuccess = document.getElementById('quickQuoteSuccess');
    const btnQuickSubmit = document.getElementById('btnQuickSubmit');
    
    // Price Modal
    const priceOverlay = document.getElementById('priceModalOverlay');
    const priceModal = document.getElementById('priceModal');
    const priceClose = document.getElementById('priceModalClose');
    const priceCallMeBack = document.getElementById('priceCallMeBack');
    
    function closeQuickQuote() {
        if (quickQuoteOverlay) quickQuoteOverlay.classList.remove('open');
        if (quickQuoteModal) quickQuoteModal.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    function closePriceModal() {
        if (priceOverlay) priceOverlay.classList.remove('open');
        if (priceModal) priceModal.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    // Close buttons
    if (quickQuoteClose) quickQuoteClose.addEventListener('click', closeQuickQuote);
    if (priceClose) priceClose.addEventListener('click', closePriceModal);
    
    // Click outside to close
    if (quickQuoteOverlay) quickQuoteOverlay.addEventListener('click', (e) => {
        if (e.target === quickQuoteOverlay) closeQuickQuote();
    });
    if (priceOverlay) priceOverlay.addEventListener('click', (e) => {
        if (e.target === priceOverlay) closePriceModal();
    });
    
    // Price modal "Call me back" button
    if (priceCallMeBack) {
        priceCallMeBack.addEventListener('click', () => {
            closePriceModal();
            setTimeout(() => {
                if (quickQuoteOverlay && quickQuoteModal) {
                    quickQuoteOverlay.classList.add('open');
                    quickQuoteModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                    if (quickPhoneInput) setTimeout(() => quickPhoneInput.focus(), 150);
                }
            }, 300);
        });
    }
    
    // Keyboard - Escape to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (quickQuoteOverlay?.classList.contains('open')) closeQuickQuote();
            if (priceOverlay?.classList.contains('open')) closePriceModal();
        }
    });
    
    // Quick Quote Form Submission
    if (quickQuoteForm && btnQuickSubmit) {
        quickQuoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = quickPhoneInput?.value?.trim();
            const csrfToken = quickQuoteForm.querySelector('input[name="csrf_token"]')?.value || '';
            
            if (!phone || phone.length < 10) {
                quickPhoneInput?.focus();
                return;
            }
            
            btnQuickSubmit.disabled = true;
            const btnText = btnQuickSubmit.querySelector('.btn-quick-text');
            if (btnText) btnText.textContent = '...';
            
            try {
                const response = await fetch('/quick-quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phone, csrf_token: csrfToken })
                });
                
                if (response.ok) {
                    quickQuoteForm.style.display = 'none';
                    if (quickQuoteSuccess) quickQuoteSuccess.style.display = 'block';
                    
                    // Show toast if available
                    if (typeof Toast !== 'undefined') {
                        Toast.success('We will call you back shortly!');
                    }
                    
                    setTimeout(() => {
                        closeQuickQuote();
                        setTimeout(() => {
                            quickQuoteForm.style.display = 'block';
                            quickQuoteForm.reset();
                            if (quickQuoteSuccess) quickQuoteSuccess.style.display = 'none';
                            btnQuickSubmit.disabled = false;
                            if (btnText) btnText.textContent = 'Send';
                        }, 300);
                    }, 3000);
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                if (typeof Toast !== 'undefined') {
                    Toast.error('Error sending request. Please try again.');
                } else {
                    alert('Error sending request. Please try again.');
                }
                btnQuickSubmit.disabled = false;
                if (btnText) btnText.textContent = 'Send';
            }
        });
    }
})();

/* ===== Scroll Reveal Animations ===== */
(function(){
    // Select content area - works for both city pages and service pages
    const contentArea = document.querySelector('.article-doc') || 
                       document.querySelector('[class$="-section"]');
    if (!contentArea) return;

    // Elements to animate: headings, paragraphs, lists, tables, images
    // Using broader selectors to cover both article-doc and service sections
    const selectors = [
        '.article-doc h1',
        '.article-doc h2',
        '.article-doc p',
        '.article-doc ul',
        '.article-doc ol',
        '.article-doc blockquote',
        '.article-doc .table-wrapper',
        '.article-doc img',
        // Service pages sections
        '[class$="-section"] h1',
        '[class$="-section"] h2',
        '[class$="-section"] p',
        '[class$="-section"] ul',
        '[class$="-section"] ol',
        '[class$="-section"] .table-wrapper',
        '[class$="-section"] img',
        // CTA button
        '.seo-cta-outside'
    ];

    const elements = document.querySelectorAll(selectors.join(', '));
    
    // Add reveal class with staggered delays
    let delayIndex = 0;
    elements.forEach((el, index) => {
        el.classList.add('reveal-on-scroll');
        
        // Reset delay counter for each new section (h1, h2)
        if (el.tagName === 'H1' || el.tagName === 'H2') {
            delayIndex = 0;
        }
        
        // Add staggered delay (cycle through 1-4)
        if (delayIndex > 0 && delayIndex <= 4) {
            el.classList.add('delay-' + delayIndex);
        }
        delayIndex++;
        
        // Add variant for images
        if (el.tagName === 'IMG') {
            el.classList.add('scale-up');
        }
    });

    // Intersection Observer for revealing elements
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(revealCallback, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
})();

/* ===== Photo Lightbox ===== */
(function(){
    const lightbox = document.getElementById('photoLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = lightbox?.querySelector('.photo-lightbox-close');
    const prevBtn = lightbox?.querySelector('.photo-lightbox-prev');
    const nextBtn = lightbox?.querySelector('.photo-lightbox-next');
    
    if (!lightbox || !lightboxImg) return;
    
    // Collect all work photos
    let photos = [];
    let currentIndex = 0;
    
    function collectPhotos() {
        photos = [];
        document.querySelectorAll('.work-photo').forEach((img, idx) => {
            photos.push({
                src: img.src,
                alt: img.alt || 'Work photo ' + (idx + 1)
            });
        });
    }
    
    function openLightbox(index) {
        if (photos.length === 0) return;
        
        currentIndex = index;
        updateLightboxImage();
        
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Update nav visibility
        updateNavVisibility();
    }
    
    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    function updateLightboxImage() {
        if (photos[currentIndex]) {
            lightboxImg.src = photos[currentIndex].src;
            lightboxImg.alt = photos[currentIndex].alt;
            lightboxCaption.textContent = photos[currentIndex].alt;
        }
    }
    
    function updateNavVisibility() {
        if (photos.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
    
    function showPrev() {
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;
        updateLightboxImage();
    }
    
    function showNext() {
        currentIndex = (currentIndex + 1) % photos.length;
        updateLightboxImage();
    }
    
    // Event listeners for work-open buttons
    document.querySelectorAll('.work-open').forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            collectPhotos();
            openLightbox(idx);
        });
    });
    
    // Close button
    closeBtn?.addEventListener('click', closeLightbox);
    
    // Click outside to close
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigation
    prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });
    
    nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });
    
    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                showNext();
            } else {
                showPrev();
            }
        }
    }, { passive: true });
})();

/* ===== Sticky Bottom Bar (Mobile - Services/Cities pages) ===== */
(function(){
    const stickyBar = document.getElementById('stickyBottomBar');
    const stickyMenuBtn = document.getElementById('stickyMenuBtn');
    const stickyMenu = document.getElementById('stickyMenu');
    const stickyOverlay = document.getElementById('stickyMenuOverlay');
    const stickyCallMeBack = document.getElementById('stickyCallMeBack');
    
    if (!stickyBar || !stickyMenuBtn || !stickyMenu) return;
    
    // Add class to body for padding
    document.body.classList.add('has-sticky-bar');
    
    // Open/close menu
    function openMenu() {
        stickyMenu.classList.add('open');
        stickyOverlay.classList.add('open');
        stickyMenuBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        stickyMenu.classList.remove('open');
        stickyOverlay.classList.remove('open');
        stickyMenuBtn.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    stickyMenuBtn.addEventListener('click', () => {
        if (stickyMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    stickyOverlay.addEventListener('click', closeMenu);
    
    // Call me back - открывает Quick Quote модал
    if (stickyCallMeBack) {
        stickyCallMeBack.addEventListener('click', () => {
            closeMenu();
            // Открываем Quick Quote модал
            const quickQuoteOverlay = document.getElementById('quickQuoteOverlay');
            const quickQuoteModal = document.getElementById('quickQuoteModal');
            if (quickQuoteOverlay && quickQuoteModal) {
                quickQuoteOverlay.classList.add('open');
                quickQuoteModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }
    
    // Close menu when clicking on links
    stickyMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });
    
    // Hide bar on scroll down, show on scroll up
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateStickyBar() {
        const currentScrollY = window.scrollY;
        
        // If scrolling down and scrolled more than 100px from top
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            stickyBar.classList.add('hidden');
        } else {
            // Scrolling up - show bar
            stickyBar.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateStickyBar);
            ticking = true;
        }
    }, { passive: true });
    
    // Also hide when footer is visible (keep this as extra check)
    const footer = document.querySelector('footer');
    if (footer) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stickyBar.classList.add('hidden');
                }
            });
        }, { threshold: 0.1 });
        
        footerObserver.observe(footer);
    }
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && stickyMenu.classList.contains('open')) {
            closeMenu();
        }
    });
    
    // Swipe down to close
    let touchStartY = 0;
    stickyMenu.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    stickyMenu.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].screenY;
        const diff = touchEndY - touchStartY;
        
        if (diff > 80) {
            closeMenu();
        }
    }, { passive: true });
})();