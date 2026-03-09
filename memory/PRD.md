# Clean Gutters Crew - Cleaning Services Website

## Original Problem Statement
Optimize and refactor a PHP/Twig cleaning service website (cgc-services.ca) to:
1. Achieve Google PageSpeed score of 90-95+ for mobile version
2. Declutter mobile UI for better performance
3. Maintain SEO structure and desktop functionality

## Tech Stack
- **Backend:** PHP 8.x with FlightPHP framework
- **Templating:** Twig
- **Frontend:** Vanilla JavaScript, CSS, HTML
- **Database:** MySQL (via Doctrine ORM)
- **Integrations:** Telegram API (notifications), Google reCAPTCHA, Cloudflare CDN

## Project Structure
```
/app/
├── app/
│   └── Controllers/
│       └── MainController.php    # Routes: index, quotePage, areasPage, cityPage
├── public/
│   ├── assets/
│   │   ├── css/                  # style.css, main-page.css, style.min.css
│   │   ├── js/                   # app.js, app.min.js
│   │   ├── images/               # logo-optimized.webp, social-robot-small.webp
│   │   └── fonts/                # Self-hosted Inter/Poppins fonts (woff2)
│   └── index.php                 # Main router (routes: /, /quote, /areas, /cities/*)
├── resources/
│   └── templates/
│       ├── landing/
│       │   ├── main.html.twig        # Homepage
│       │   ├── quote.html.twig       # Quote form page
│       │   ├── areas.html.twig       # Service areas page (NEW)
│       │   └── components/
│       │       └── header.html.twig  # Header with mobile-only/desktop-only elements
│       └── template.html.twig        # Base template
├── .htaccess                     # Apache config (CAUTION: sensitive to changes)
└── .env
```

## What's Been Implemented

### Mobile UI Decluttering (Dec 9, 2025 - Current Session)
- ✅ **Robot Widget Removed on Mobile:**
  - JS script removes `.cgc-robot-wrap` from DOM when `window.innerWidth <= 860`
  - No images loaded, no JS executed, no overlay on mobile
  - Desktop: works unchanged
  
- ✅ **Call Button Hidden on Mobile:**
  - `#headerPhoneBtn` has `desktop-only` class
  - Mobile header shows hamburger + logo + Facebook icon only
  
- ✅ **Facebook SVG Icon Added to Mobile Header:**
  - Inline SVG (no FontAwesome dependency)
  - `mobile-only` class - displays only on mobile
  - Links to business Facebook page
  
- ✅ **Separate /areas Page Created:**
  - Template: `resources/templates/landing/areas.html.twig`
  - Route: `Flight::route('/areas', ...)`
  - Controller: `MainController::areasPage()`
  - Contains full grid of service areas with links to city pages
  
- ✅ **Cities Modal Removed from Homepage:**
  - `#citiesModal` removed from `main.html.twig`
  - JS modal triggers removed from `app.js`
  - Service areas bar now links directly to `/areas`

### CSS Utility Classes Added
- `.desktop-only` - `display: inline-flex` on desktop, `display: none` on mobile
- `.mobile-only` - `display: none` on desktop, `display: inline-flex` on mobile
- `.header-social-fb` - Facebook icon button styling
- `.areas-page-section`, `.areas-grid`, `.area-card` - Areas page styling

### Previous Optimizations (Before This Session)
- Quote form moved to separate `/quote` page
- Critical CSS inlined in `<head>`
- Font preloading with `font-display: optional`
- reCAPTCHA lazy loading (only when needed)
- Facebook Pixel deferred loading
- Image optimization (WebP, srcset for logo)
- FontAwesome loaded via `media="print"` onload trick

## Current Status

### Completed
- ✅ Robot widget removed on mobile (not just hidden - fully removed from DOM)
- ✅ Call button hidden on mobile
- ✅ Facebook SVG icon in header (mobile only)
- ✅ /areas page created
- ✅ Cities modal removed from homepage
- ✅ Header links to /areas work correctly

### User Verification Required
- [ ] Deploy files to production server
- [ ] Verify all city links work: `/cities/vancouver`, `/cities/surrey`, etc.
- [ ] Verify anchor links work: `/#about`, `/#services`, `/#faq`
- [ ] Verify robot widget works on desktop
- [ ] Run PageSpeed Insights to check improvement

## Routes
- `GET /` - Homepage
- `GET /quote` - Quote form page
- `GET /areas` - Service areas page (NEW)
- `GET /cities/{city}` - City-specific pages
- `POST /applications` - Form submission
- `POST /quick-quote` - Quick callback form
- `POST /upload/photos` - Photo upload
- `DELETE /upload/photos` - Photo deletion

## Files Changed in This Session
1. `app/Controllers/MainController.php` - Added `areasPage()` method
2. `public/index.php` - Added `/areas` route
3. `public/assets/css/style.css` - Added mobile-only/desktop-only classes, areas page styles
4. `public/assets/css/style.min.css` - Minified version
5. `public/assets/js/app.js` - Removed cities modal triggers
6. `public/assets/js/app.min.js` - Minified version
7. `resources/templates/landing/main.html.twig` - Removed citiesModal, updated areas bar
8. `resources/templates/landing/components/header.html.twig` - Already had desktop-only/mobile-only
9. `resources/templates/landing/areas.html.twig` - NEW file
10. `resources/templates/template.html.twig` - Already had robot removal script

## Pending Tasks

### P0 - Critical (User Action Required)
- [ ] Deploy to production and verify functionality
- [ ] Run PageSpeed Insights test (target: 90-95+ mobile)
- [ ] Verify CLS < 0.03

### P1 - Performance Optimization (if scores not improved)
- [ ] Further LCP optimization based on new reports
- [ ] Critical CSS refinement
- [ ] JS deferral optimization

### P2 - Future/Backlog
- [ ] Re-implement button visual effects (glows, hover animations) after score achieved
- [ ] Animate robot mascot (desktop only)

## Environment Notes
- **Preview URL not working** - This is a PHP project, Emergent preview runs Python/FastAPI
- **Test on production server** - User deploys via FTP to their hosting
- **.htaccess is sensitive** - User's shared hosting doesn't support all Apache modules

## 3rd Party Integrations
- Telegram API (form notifications)
- Google reCAPTCHA (lazy loaded)
- Facebook Pixel (deferred)
- Cloudflare CDN (active)
