const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ===== Toast Notification System ===== */
const Toast = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.id = 'toastContainer';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 4000) {
        if (!this.container) this.init();
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" type="button">&times;</button>
        `;
        
        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.hide(toast);
        });
        
        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }
        
        return toast;
    },
    
    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    },
    
    success(message, duration) { return this.show(message, 'success', duration); },
    error(message, duration) { return this.show(message, 'error', duration); },
    warning(message, duration) { return this.show(message, 'warning', duration); },
    info(message, duration) { return this.show(message, 'info', duration); }
};

/* ===== MOBILE burger/nav FIX (работает, не ломает ПК) ===== */
let nav = null;
let burger = null;

const setBurgerState = (open) => {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('open', open);
};

/* ===== FIXED: load init WITHOUT forced home reset that broke mobile menu ===== */
window.addEventListener('load', () => {
    nav = $('#main-nav');
    burger = $('.hamburger');

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

    /*
    $('#logoHome')?.addEventListener('click', (e) => {
        e.preventDefault();

        // всегда домой и закрыть меню
        setBurgerState(false);
        location.hash = 'home';
        applyPageMode();
        window.scrollTo({ top: 0, behavior: 'auto' });
    });
    */
    applyPageMode();
});

const obs = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('active')));
$$('section').forEach(el => obs.observe(el));

const quoteAnimObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const el = entry.target;
        if (window.matchMedia('(max-width: 860px)').matches) {
            el.classList.toggle('anim-on', entry.isIntersecting);
        } else {
            el.classList.remove('anim-on');
        }
    });
}, { threshold: 0.55 });

$$('.btn-quote-animated').forEach(btn => quoteAnimObserver.observe(btn));

window.addEventListener('resize', () => {
    $$('.btn-quote-animated').forEach(btn => {
        if (!window.matchMedia('(max-width: 860px)').matches) btn.classList.remove('anim-on');
    });
});

const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close')?.focus();
};

const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal.open')) document.body.classList.remove('modal-open');
};

$('#areasTrigger').onclick = () => openModal($('#citiesModal'));

$$('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        const service = card.getAttribute('data-service');
        openModal(document.querySelector(`#modal-${service}`));
    });
});

$$('.modal-close').forEach(btn => btn.onclick = () => closeModal(btn.closest('.modal')));

$$('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) closeModal(m); }));

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal.open').forEach(closeModal); });

document.querySelectorAll('.faq-col').forEach(col => {
    col.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            col.querySelectorAll('.faq-item').forEach(x => { if (x !== item) x.classList.remove('active'); });
            item.classList.toggle('active');
        });
    });
});

const applyPageMode = () => {
    const h = (location.hash || '').toLowerCase();
    if (h === '#quote') {
        document.body.classList.add('quote-mode');
        setBurgerState(false);
        window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
        document.body.classList.remove('quote-mode');
    }
};

applyPageMode();

$$('[data-page-link="quote"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        location.hash = 'quote';
        applyPageMode();
    });
});

$('#backToHome')?.addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = 'home';
    applyPageMode();
    window.scrollTo({ top: 0, behavior: 'auto' });
});

window.addEventListener('hashchange', applyPageMode);

$$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href) return;
        if (href === '#quote' || href === '#home') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const doScroll = () => {
            const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--headerH')) || 120;
            const topPos = target.getBoundingClientRect().top + window.pageYOffset - headerH;
            window.scrollTo({ top: topPos, behavior: 'smooth' });
        };

        if (document.body.classList.contains('quote-mode')) {
            location.hash = href;
            applyPageMode();
            requestAnimationFrame(() => requestAnimationFrame(doScroll));
            return;
        }

        history.replaceState(null, '', href);
        doScroll();
    });
});

/* ====== Quote: alternating wiggle + validation (one-page) ====== */
const btnText = $('#btnText');
const btnEmail = $('#btnEmail');
const cycleMs = 5000;

function triggerWiggle(el){
    if (!el) return;
    el.classList.remove('wiggle');
    void el.offsetWidth;
    el.classList.add('wiggle');
    setTimeout(() => el.classList.remove('wiggle'), 950);
}

let turn = 0;
function runCycle(){
    if (!btnText || !btnEmail) return;
    if (!document.body.classList.contains('quote-mode')) return;
    if (turn % 2 === 0) triggerWiggle(btnText);
    else triggerWiggle(btnEmail);
    turn++;
}
runCycle();
setInterval(runCycle, cycleMs);

const serviceError = $('#serviceError');
const consentError = $('#consentError');

function validateServices(){
    const anyChecked = $$('input[name="service"]:checked').length > 0;
    if (!anyChecked){
        if (serviceError) serviceError.style.display = 'block';
        return false;
    }
    if (serviceError) serviceError.style.display = 'none';
    return true;
}

function validateConsentRequired(){
    const ok = !!$('#consentTerms')?.checked;
    if (consentError) {
        if (!ok){
            consentError.style.display = 'block';
            return false;
        }
        consentError.style.display = 'none';
    }
    return true;
}

$$('input[name="service"]').forEach(cb => cb.addEventListener('change', validateServices));
$('#consentTerms')?.addEventListener('change', validateConsentRequired);

$('#quoteForm')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!form.checkValidity()){
        form.reportValidity();
        return;
    }

    // reCAPTCHA check
    const captchaError = document.getElementById('captchaError');
    const token = (window.grecaptcha && typeof window.grecaptcha.getResponse === 'function')
        ? window.grecaptcha.getResponse()
        : '';

    if (!token) {
        if (captchaError) captchaError.style.display = 'block';
        document.querySelector('.g-recaptcha')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    } else {
        if (captchaError) captchaError.style.display = 'none';
    }

    if (!validateServices()){
        const block = document.querySelector('.services-group');
        block?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (!validateConsentRequired()){
        $('#consentBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const services = $$('input[name="service"]:checked').map(x => x.value).join(', ');
    const contact = $('input[name="contact"]:checked')?.value || 'SMS';

    let message = '';
    message += 'Contact Method: ' + contact + "<br>";
    message += 'Address: ' + ($('#address')?.value?.trim() || '') + "<br>";
    message += 'Postal: ' + ($('#postal')?.value?.trim() || '') + "<br>";
    message += 'Services: ' + services + "<br>";
    message += 'Promo: ' + ($('#promo')?.value?.trim() || '-') + "<br>";
    message += 'Details: ' + ($('#notes')?.value?.trim() || '-') + "<br>";

    // Get CSRF token
    const csrfToken = $('input[name="csrf_token"]')?.value || '';

    const payload = {
        name: $('#name')?.value?.trim() || '',
        phone: $('#phone')?.value?.trim() || '',
        email: $('#email')?.value?.trim() || '',
        city: $('#city')?.value?.trim() || '',
        message: message,
        notes: $('#notes')?.value?.trim() || '',
        consent_terms: !!$('#consentTerms')?.checked,
        consent_contact_all: !!$('#consentContactAll')?.checked,
        uploaded_photos: $('#uploadedPhotos')?.value || '',
        csrf_token: csrfToken
    };

    fetch('/applications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Success
        })
        .catch(error => {
            Toast.error('Error sending form. Please try again.');
        });


    const success = $('#successMsg');
    if (success){
        // Reset form
        $('#quoteForm').reset();
        
        // Clear uploaded photos using global function
        if (typeof window.clearUploadedPhotos === 'function') {
            window.clearUploadedPhotos();
        }
        
        // Clear simple photo selector too
        if (photosPreview) {
            photosPreview.innerHTML = '';
        }
        if (photosInput) {
            photosInput.value = '';
        }
        setPhotosStatus('');
        
        // Reset reCAPTCHA
        if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
            window.grecaptcha.reset();
        }
        
        success.style.display = 'block';
        success.textContent = 'Thanks! We received your request and will reply shortly.';
        
        // Show toast notification
        Toast.success('Your request has been sent! We will contact you shortly.');
    }

});

/* ====== Desktop header phone: click copies phone + shows ✓ Copied badge (desktop only) ====== */
(function(){
    const phoneBtn = $('#headerPhoneBtn');
    const badge = $('#copiedBadge');
    const phoneToCopy = '+1 (672) 500-6060';

    let badgeTimer = null;

    function showBadge(){
        if (!badge) return;
        badge.classList.add('show');
        if (badgeTimer) clearTimeout(badgeTimer);
        badgeTimer = setTimeout(() => {
            badge.classList.remove('show');
        }, 1600);
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

/* ===== photos preview (FIXED, no syntax errors) ===== */
const photosInput = document.getElementById('photos');
const photosPreview = document.getElementById('photosPreview');
const photosStatus = document.getElementById('photosStatus');
const btnUpload = document.getElementById('btnUploadPhotos');

function setPhotosStatus(text){
    if (!photosStatus) return;
    if (!text){
        photosStatus.classList.remove('show');
        photosStatus.textContent = '';
        return;
    }
    photosStatus.textContent = text;
    photosStatus.classList.add('show');
}

function renderPhotosPreview(files){
    if (!photosPreview) return;
    photosPreview.innerHTML = '';

    [...files].forEach(file => {
        const card = document.createElement('div');
        card.className = 'photos-thumb';

        const img = document.createElement('img');
        const name = document.createElement('div');
        name.className = 'photos-name';
        name.textContent = file.name;

        card.appendChild(img);
        card.appendChild(name);
        photosPreview.appendChild(card);

        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result; };
        reader.readAsDataURL(file);
    });
}

if (btnUpload && photosInput){
    btnUpload.addEventListener('click', () => photosInput.click());
    btnUpload.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' '){
            e.preventDefault();
            photosInput.click();
        }
    });
}

if (photosInput){
    photosInput.addEventListener('change', () => {
        const files = photosInput.files ? [...photosInput.files] : [];
        if (files.length > 10){
            setPhotosStatus('Please select up to 10 photos.');
            photosInput.value = '';
            if (photosPreview) photosPreview.innerHTML = '';
            return;
        }
        setPhotosStatus(files.length ? `${files.length} photo(s) selected.` : '');
        renderPhotosPreview(files);
    });
}

/* ===== CGC Robot widget logic (inserted) ===== */
/* ===== CGC Robot widget logic (tap target is small hit button on mobile) ===== */
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

    // на мобилке кликаем по маленькой зоне, на пк можно по самому роботу
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


/* ========================================
   PHOTO UPLOAD FUNCTIONALITY
======================================== */
// Global function to clear uploaded photos (called after form submit)
window.clearUploadedPhotos = function() {
    const previewGrid = document.getElementById('photoPreviewGrid');
    const uploadedPhotosInput = document.getElementById('uploadedPhotos');
    if (previewGrid) previewGrid.innerHTML = '';
    if (uploadedPhotosInput) uploadedPhotosInput.value = '';
};

(function() {
    'use strict';

    const uploadZone = document.getElementById('photoUploadZone');
    const photoInput = document.getElementById('photoInput');
    const previewGrid = document.getElementById('photoPreviewGrid');
    const uploadedPhotosInput = document.getElementById('uploadedPhotos');
    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (!uploadZone || !photoInput) return;

    // Хранилище загруженных фотографий
    let uploadedFiles = [];
    const MAX_FILES = 10;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    
    // Update global clear function to also clear local array
    const originalClear = window.clearUploadedPhotos;
    window.clearUploadedPhotos = function() {
        originalClear();
        uploadedFiles = [];
    };

    // Клик по зоне загрузки
    uploadZone.addEventListener('click', () => photoInput.click());

    // Выбор файлов через input
    photoInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        photoInput.value = ''; // Сброс для повторного выбора того же файла
    });

    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // Обработка выбранных файлов
    function handleFiles(files) {
        const fileArray = Array.from(files);

        // Проверка лимита
        if (uploadedFiles.length + fileArray.length > MAX_FILES) {
            Toast.warning(`Maximum ${MAX_FILES} photos allowed. You can add ${MAX_FILES - uploadedFiles.length} more.`);
            return;
        }

        fileArray.forEach(file => {
            // Валидация типа
            if (!ALLOWED_TYPES.includes(file.type)) {
                showError(`Invalid file type: ${file.name}`);
                return;
            }

            // Валидация размера
            if (file.size > MAX_SIZE) {
                showError(`File too large: ${file.name} (max 10MB)`);
                return;
            }

            // Создаем превью и начинаем загрузку
            const previewId = 'preview-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            createPreview(file, previewId);
            uploadFile(file, previewId);
        });
    }

    // Создание превью
    function createPreview(file, previewId) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'photo-preview-item uploading';
            div.id = previewId;
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="upload-spinner"></div>
                <button type="button" class="remove-photo" title="Remove" style="display:none;">&times;</button>
            `;
            previewGrid.appendChild(div);

            // Кнопка удаления
            div.querySelector('.remove-photo').addEventListener('click', () => removePhoto(previewId));
        };

        reader.readAsDataURL(file);
    }

    // Загрузка файла через AJAX
    function uploadFile(file, previewId) {
        const formData = new FormData();
        formData.append('photos', file);

        const xhr = new XMLHttpRequest();

        // Прогресс загрузки
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                updateProgress(percent);
            }
        });

        // Завершение загрузки
        xhr.addEventListener('load', () => {
            const previewItem = document.getElementById(previewId);
            if (!previewItem) return;

            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);

                    if (response.success && response.uploaded && response.uploaded.length > 0) {
                        const uploadedFile = response.uploaded[0];

                        // Успешная загрузка
                        previewItem.classList.remove('uploading');
                        previewItem.querySelector('.upload-spinner')?.remove();
                        previewItem.querySelector('.remove-photo').style.display = 'flex';
                        previewItem.dataset.filename = uploadedFile.name;
                        previewItem.dataset.url = uploadedFile.url;

                        // Добавляем в массив
                        uploadedFiles.push({
                            id: previewId,
                            name: uploadedFile.name,
                            url: uploadedFile.url,
                            originalName: uploadedFile.originalName
                        });

                        updateHiddenInput();
                    } else {
                        // Ошибка от сервера
                        showPreviewError(previewItem, response.errors?.[0] || 'Upload failed');
                    }
                } catch (e) {
                    showPreviewError(previewItem, 'Invalid response');
                }
            } else {
                showPreviewError(previewItem, 'Upload failed');
            }

            hideProgress();
        });

        // Ошибка сети
        xhr.addEventListener('error', () => {
            const previewItem = document.getElementById(previewId);
            if (previewItem) {
                showPreviewError(previewItem, 'Network error');
            }
            hideProgress();
        });

        // Показываем прогресс
        showProgress();

        // Отправляем
        xhr.open('POST', '/upload/photos');
        xhr.send(formData);
    }

    // Удаление фото
    function removePhoto(previewId) {
        const previewItem = document.getElementById(previewId);
        if (!previewItem) return;

        const filename = previewItem.dataset.filename;

        // Удаляем с сервера если загружено
        if (filename) {
            fetch('/upload/photos', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: filename })
            }).catch(() => {}); // Игнорируем ошибки удаления
        }

        // Удаляем из массива
        uploadedFiles = uploadedFiles.filter(f => f.id !== previewId);
        updateHiddenInput();

        // Удаляем превью
        previewItem.remove();
    }

    // Обновление скрытого input с JSON
    function updateHiddenInput() {
        uploadedPhotosInput.value = JSON.stringify(uploadedFiles.map(f => ({
            name: f.name,
            url: f.url,
            originalName: f.originalName
        })));
    }

    // Показать ошибку на превью
    function showPreviewError(previewItem, message) {
        previewItem.classList.remove('uploading');
        previewItem.classList.add('error');
        previewItem.querySelector('.upload-spinner')?.remove();

        const errorBadge = document.createElement('div');
        errorBadge.className = 'error-badge';
        errorBadge.textContent = message;
        previewItem.appendChild(errorBadge);

        // Кнопка удаления для удаления ошибочного превью
        const removeBtn = previewItem.querySelector('.remove-photo');
        if (removeBtn) {
            removeBtn.style.display = 'flex';
            removeBtn.addEventListener('click', () => previewItem.remove());
        }
    }

    // Прогресс-бар
    function showProgress() {
        progressContainer.style.display = 'block';
    }

    function hideProgress() {
        setTimeout(() => {
            progressContainer.style.display = 'none';
            progressFill.style.width = '0%';
        }, 500);
    }

    function updateProgress(percent) {
        progressFill.style.width = percent + '%';
        progressText.textContent = `Uploading... ${percent}%`;
    }

    // Показать общую ошибку
    function showError(message) {
        Toast.error(message);
    }
})();


/* ========================================
   QUICK QUOTE (CALLBACK) FUNCTIONALITY
======================================== */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const btnCallMeBack = document.getElementById('btnCallMeBack');
    const overlay = document.getElementById('quickQuoteOverlay');
    const modal = document.getElementById('quickQuoteModal');
    const closeBtn = document.getElementById('quickQuoteClose');
    const form = document.getElementById('quickQuoteForm');
    const phoneInput = document.getElementById('quickPhone');
    const submitBtn = document.getElementById('btnQuickSubmit');
    const successBlock = document.getElementById('quickQuoteSuccess');

    if (!btnCallMeBack || !overlay) {
        // Quick Quote: elements not found
        return;
    }

    let scrollY = 0;

    // Открыть модалку
    function openModal() {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        
        overlay.classList.add('open');
        
        setTimeout(() => phoneInput?.focus(), 150);
    }

    // Закрыть модалку
    function closeModalFn() {
        overlay.classList.remove('open');
        
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        
        window.scrollTo(0, scrollY);
    }

    btnCallMeBack.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModalFn);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModalFn();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeModalFn();
        }
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const phone = phoneInput?.value?.trim();
        const csrfToken = form.querySelector('input[name="csrf_token"]')?.value || '';

        if (!phone || phone.length < 10) {
            phoneInput?.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-quick-text').textContent = '...';

        try {
            const response = await fetch('/quick-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone, csrf_token: csrfToken })
            });

            if (response.ok) {
                form.style.display = 'none';
                successBlock.style.display = 'block';
                
                Toast.success('We will call you back shortly!');

                setTimeout(() => {
                    closeModalFn();
                    setTimeout(() => {
                        form.style.display = 'block';
                        form.reset();
                        successBlock.style.display = 'none';
                        submitBtn.disabled = false;
                        submitBtn.querySelector('.btn-quick-text').textContent = 'Send';
                    }, 300);
                }, 3000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            Toast.error('Error sending request. Please try again.');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-quick-text').textContent = 'Send';
        }
    });
});


/* ========================================
   PRICE MODAL
======================================== */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const btnPrice = document.getElementById('btnPrice');
    const priceOverlay = document.getElementById('priceModalOverlay');
    const priceModal = document.getElementById('priceModal');
    const priceClose = document.getElementById('priceModalClose');
    const priceCallMeBack = document.getElementById('priceCallMeBack');
    const quickQuoteOverlay = document.getElementById('quickQuoteOverlay');
    
    if (!btnPrice || !priceOverlay) return;
    
    let scrollY = 0;
    
    function openPriceModal() {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflow = 'hidden';
        priceOverlay.classList.add('open');
    }
    
    function closePriceModal() {
        priceOverlay.classList.remove('open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
    }
    
    btnPrice.addEventListener('click', openPriceModal);
    priceClose?.addEventListener('click', closePriceModal);
    
    priceOverlay.addEventListener('click', (e) => {
        if (e.target === priceOverlay) {
            closePriceModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && priceOverlay.classList.contains('open')) {
            closePriceModal();
        }
    });
    
    // "Call me back" button opens quick quote modal
    if (priceCallMeBack && quickQuoteOverlay) {
        priceCallMeBack.addEventListener('click', () => {
            closePriceModal();
            setTimeout(() => {
                scrollY = window.pageYOffset || document.documentElement.scrollTop;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.overflow = 'hidden';
                quickQuoteOverlay.classList.add('open');
                const phoneInput = document.getElementById('quickPhone');
                if (phoneInput) setTimeout(() => phoneInput.focus(), 150);
            }, 300);
        });
    }
    
    // Close price modal when clicking quote link
    const quoteLinks = priceModal?.querySelectorAll('a[href*="quote"]');
    quoteLinks?.forEach(link => {
        link.addEventListener('click', () => {
            closePriceModal();
        });
    });
});


/* ========================================
   STICKY BOTTOM BAR MENU
======================================== */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const stickyMenuBtn = document.getElementById('stickyMenuBtn');
    const stickyMenu = document.getElementById('stickyMenu');
    const stickyOverlay = document.getElementById('stickyMenuOverlay');
    const stickyClose = document.getElementById('stickyMenuClose');
    const stickyCallMeBack = document.getElementById('stickyCallMeBack');
    const quickQuoteOverlay = document.getElementById('quickQuoteOverlay');
    
    if (!stickyMenuBtn || !stickyMenu) return;
    
    let scrollY = 0;
    
    function openStickyMenu() {
        scrollY = window.pageYOffset || document.documentElement.scrollTop;
        stickyMenu.classList.add('open');
        stickyOverlay.classList.add('open');
        stickyMenuBtn.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    function closeStickyMenu() {
        stickyMenu.classList.remove('open');
        stickyOverlay.classList.remove('open');
        stickyMenuBtn.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    stickyMenuBtn.addEventListener('click', () => {
        if (stickyMenu.classList.contains('open')) {
            closeStickyMenu();
        } else {
            openStickyMenu();
        }
    });
    
    stickyOverlay.addEventListener('click', closeStickyMenu);
    stickyClose.addEventListener('click', closeStickyMenu);
    
    // "Call me back" opens the quick quote modal
    if (stickyCallMeBack && quickQuoteOverlay) {
        stickyCallMeBack.addEventListener('click', () => {
            closeStickyMenu();
            setTimeout(() => {
                quickQuoteOverlay.classList.add('open');
                document.body.style.overflow = 'hidden';
                const phoneInput = document.getElementById('quickPhone');
                if (phoneInput) setTimeout(() => phoneInput.focus(), 150);
            }, 300);
        });
    }
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && stickyMenu.classList.contains('open')) {
            closeStickyMenu();
        }
    });
    
    // Hide sticky bar when scrolling to footer
    let lastScroll = 0;
    const stickyBar = document.getElementById('stickyBottomBar');
    const footer = document.querySelector('footer');
    
    if (stickyBar && footer) {
        window.addEventListener('scroll', () => {
            const footerTop = footer.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (footerTop < windowHeight) {
                stickyBar.style.transform = 'translateY(100%)';
            } else {
                stickyBar.style.transform = 'translateY(0)';
            }
        }, { passive: true });
    }
});