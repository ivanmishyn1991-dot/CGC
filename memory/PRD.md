# Clean Gutters Crew - Cleaning Services Website

## Original Problem Statement
Enhance and polish an existing cleaning service website built with PHP and Twig. Primary goals:
1. Achieve Google PageSpeed score of 80+ for both mobile and desktop
2. Eliminate font loading "jumps" (FOUT) that cause Cumulative Layout Shift (CLS)
3. Keep repository clean of unnecessary files

## Tech Stack
- **Backend:** PHP 8.x with FlightPHP framework
- **Templating:** Twig
- **Frontend:** Vanilla JavaScript, CSS, HTML
- **Database:** MySQL (via Doctrine ORM)
- **Integrations:** Telegram API (notifications), Google reCAPTCHA

## Project Structure
```
/app/
├── app/                  # PHP Controllers, Middleware, Services
├── public/
│   ├── assets/
│   │   ├── css/          # Main stylesheets (style.css, main-page.css)
│   │   ├── js/           # JavaScript (app.js)
│   │   ├── images/       # Site images
│   │   └── fonts/        # Self-hosted Inter fonts (latin subset)
│   ├── admin/            # Admin panel assets (OPTIMIZED)
│   │   ├── css/          # fontawesome.min.css (updated)
│   │   └── webfonts/     # FontAwesome fonts (SVG/EOT removed)
│   └── index.php         # Main router
├── resources/
│   └── templates/        # Twig templates
├── .env                  # Environment configuration
├── .gitignore            # Updated to exclude vendor/, .emergent/
└── composer.json
```

## What's Been Implemented

### Performance Optimizations (Previous Agent)
- ✅ Replaced oversized Inter font files with correct latin subsets
- ✅ Fixed CSS animations to reduce CLS (removed transform from .reveal)
- ✅ Added `.active` class to hero and sections for instant visibility
- ✅ Deferred FontAwesome and Facebook Pixel loading
- ✅ Optimized CSS transitions (specific properties vs `transition: all`)
- ✅ Updated minified assets (.min.css, .min.js)

### Repository Cleanup (Previous Agent)
- ✅ Fixed `.gitignore` to properly exclude `vendor/` and `.emergent/`
- ✅ Removed `.emergent/` from git tracking

### Admin Panel Optimization (Current Session - Dec 9, 2025)
- ✅ Removed SVG font files (~1.4MB saved):
  - fa-brands-400.svg (616KB)
  - fa-regular-400.svg (139KB)
  - fa-solid-900.svg (613KB)
- ✅ Removed EOT font files (~325KB saved):
  - fa-brands-400.eot (116KB)
  - fa-regular-400.eot (40KB)
  - fa-solid-900.eot (168KB)
- ✅ Updated fontawesome.min.css to reference only woff2/woff/ttf
- ✅ Compressed admin background images (~328KB saved):
  - dash-bg-01.jpg: 214KB → 172KB (20%)
  - dash-bg-02.jpg: 284KB → 216KB (24%)
  - dash-bg-03.jpg: 369KB → 222KB (40%)
  - product-image.jpg: 57KB → 8.5KB (85%)
  - profile-image.png: 108KB → 86KB (20%)
- **Total savings: ~2MB (fonts + images)**

## Current Status: USER VERIFICATION PENDING

The user needs to run a new Google PageSpeed Insights test to verify:
1. CLS score improvement
2. Overall performance score (target: 80+)
3. Admin panel still works correctly after font optimization

## API Endpoints
- `POST /quick-quote` - Quick quote form submission
- `POST /applications` - Full application submission
- `POST /upload/photos` - Photo upload
- `DELETE /upload/photos` - Photo deletion
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin authentication

## Environment Variables (.env)
```
PROJECT_NAME=cgc_landing
DEV_MODE=1
DB_CONNECTION=pdo_mysql
DB_HOST=localhost
DB_DATABASE=db
DB_USERNAME=username
DB_PASSWORD=password
TG_TOKEN=[telegram_bot_token]
TG_CHANNEL=[telegram_channel_id]
```

## Pending Tasks

### P0 - Critical
- [ ] User to verify PageSpeed scores (mobile & desktop)
- [ ] User to verify admin panel works correctly

### P1 - Important (if PageSpeed not improved)
- [ ] Further CLS optimization based on new reports
- [ ] Additional third-party script optimization

### P2 - Future/Backlog
- [ ] Animate robot mascot (social-robot.png)

## Known Issues
- Preview URL not working in Emergent environment (PHP project, not React/FastAPI)
- This is expected - project should be tested on actual hosting

## 3rd Party Integrations
- Telegram API (for form notifications)
- Google reCAPTCHA (form validation - identified as performance blocker)
- Facebook Pixel (deferred loading implemented)
