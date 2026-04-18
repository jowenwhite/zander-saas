/**
 * Zander Consulting Brochure PDF Generator
 * Generates a premium branded PDF for Operating Simply Consulting
 *
 * Usage: node scripts/generate-pdfs/generate-consulting-brochure.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============================================
// ZANDER COMPASS LOGO SVG
// ============================================

function generateCompassLogo(fillColor, width) {
  const scale = width / 700;
  const height = Math.round(600 * scale);

  return `<svg width="${width}" height="${height}" viewBox="400 100 700 600" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(855,267)" d="m0 0h60l1 29v49l-151 151 150 1v79h-295v-76l27-27 7-8 24-24 1-2h2v-2l7-6 7-8 26-26 7-8 31-31 7-8 3-3-149-1 1-78z" fill="${fillColor}"/>
<path transform="translate(855,267)" d="m0 0h59l-2 4-27 27-1 2h-2l-2 4-15 15-7 8-10 10-7 8-19 19-7 8-22 22-4 5h-2l-2 4-4 2-2 4-6 7-5 5h-2l-2 4-3 1-2 5-5 4-7 8-12 13-15 16-7 8-5 5-8 9-21 21-7 8-15 16-19 19-7 8-7 7h-2l-1 2-1-3v-72l27-27 7-8 24-24 1-2h2v-2l7-6 7-8 26-26 7-8 31-31 7-8 3-3-149-1 1-78z" fill="${fillColor}"/>
<path transform="translate(794,162)" d="m0 0 29 5 20 5 24 8 24 11 22 12 17 12 14 11 10 9 6 5 7 8 7 7 11 14 12 17 11 19 10 21 9 25 6 22 5 27v3l-11-2-27-6-2-6-5-21-9-26-10-22-11-19-8-11-7-9-18-20-10-9-13-10-17-11-16-9-23-10-18-6-22-5-9-2-2-5-7-31z" fill="${fillColor}"/>
<path transform="translate(741,162)" d="m0 0h1l-1 10-6 26-4 2-20 4-26 8-21 9-17 9-15 10-14 11-15 14-8 8-9 11-13 18-12 21-8 18-9 27-6 25-1 2-36 8h-2l1-9 6-29 8-26 8-20 8-16 8-14 11-16 13-16 14-15 11-11 11-9 13-10 15-10 16-9 21-10 24-9 21-6z" fill="${fillColor}"/>
<path transform="translate(1035,450)" d="m0 0h4l-3 24-5 23-9 27-6 13-11 21-12 17-8 10-11 12-16 16-14 11-18 13-25 14-16 7-27 10-32 8-30 5h-2l2-11 5-22 2-3 28-6 17-5 19-7 25-12 14-8 16-11 11-9 13-12 11-12 13-18 9-16 9-19 7-22 4-21 1-8 2-2z" fill="${fillColor}"/>
<path transform="translate(498,450)" d="m0 0 11 2 23 5 4 2 5 27 5 16 8 20 9 17 12 17 11 13 17 17 9 7 14 10 13 8 18 10 21 9 24 8 31 7 3 9 6 26-2 1-28-5-29-7-28-10-24-11-16-9-15-10-13-10-14-12-19-19-11-14-11-16-9-16-8-17-7-19-6-24-4-25z" fill="${fillColor}"/>
<path transform="translate(914,267)" d="m0 0h1l1 29v49l-134 134-3-1-2-5 4-1-5-9-6-4-7-3v-2h-2v-2l-2-1-3-4-4 2h-6l-3-3 9-9 4-5 5-5 5-6 5-5h2l2-4 6-7 5-4 7-8 27-27 7-8 19-19 7-8 10-10 7-8 11-11 1-2h2l2-4 27-27z" fill="${fillColor}"/>
<path transform="translate(764,497)" d="m0 0h151v79l-11-1v-1l7-1-17-16-15-15-1-2-3-1h-153v-3l12-11 25-25z" fill="${fillColor}"/>
<path transform="translate(621,268)" d="m0 0 160 1v1l-8 1v6l2 7-6 9-1 3-4 2-2 3 3 2 26 1 3 2-85 1-45 1-8 7-17 16-10 9-5 5-4 1z" fill="${fillColor}"/>
<path transform="translate(709,306)" d="m0 0h107l-2 4-15 14-11 9-11 10-5 3h-151l5-4 10-10 8-7 15-14 5-4z" fill="${fillColor}"/>
<path transform="translate(693,428)" d="m0 0 2 4 1 8-1 6 1 14 4 8 2 7 1 1v6l-6 12-5 5-1 4-12 12-7 8-15 16-19 19-7 8-7 7h-2l-1 2-1-3v-72l27-27 7-8 24-24 1-2h2v-2l8-5z" fill="${fillColor}"/>
<path transform="translate(985,270)" d="m0 0 4 4 10 15 10 18 9 19 9 25 6 22 5 27v3l-11-2-27-6-2-6-5-21-9-26-10-22-11-19-8-11-3-5v-4l2-4 7 1 4 2h2l-2-6-3-1 1-2h5l1 3 3 1 4-2z" fill="${fillColor}"/>
<path transform="translate(914,267)" d="m0 0h1l1 29v49l-48 48-1-2-3 1v-2h-2l-3-11-3-9-4-13-3-5-3-2-6 1-6 3-3 2 2-4 13-13 7-8 10-10 7-8 11-11 1-2h2l2-4 27-27z" fill="${fillColor}"/>
<path transform="translate(766,350)" d="m0 0 2 1-14 15-9 9 1 3h2l-1 6-1 2v8l2 9 5 6 2 7 8 1-3 10-1 4-5 4-7 8-12 13-15 16-7 8-5 5-8 9-5 5-4 2 2-4 5-6 4-9v-6l-3-7-2-6-2-5-1-16 1-7-2-6-6 6-2-1 7-8 29-29 7-8 31-31z" fill="${fillColor}"/>
<path transform="translate(766,538)" d="m0 0h109l4 2-2 1-1 3h-2l-2 6-3 8-2 7-1 8 12 1v1h-94l-5-13-5-5-4-9-2-4v-4z" fill="${fillColor}"/>
<path transform="translate(792,498)" d="m0 0h121l-2 4-34 34-2 1h-42l-41-1v-1l21-1-2-6h-2v-2h-2l-5-14 1-7 3-5-14-1z" fill="${fillColor}"/>
<path transform="translate(534,296)" d="m0 0h3 5l3 4 2 5v3h2l4 7 3 9 3 1-3 9-7 18-7 23-4 18-1 2-36 8h-2l1-9 6-29 8-26 8-20 8-16z" fill="${fillColor}"/>
<path transform="translate(855,267)" d="m0 0h59l-2 4-27 27-1 2h-2l-2 4-15 15-7 8-6 1-10-6-8-6-6-3-2-3-1-10 1-7h2l2-14 1-5 3-4-211-1v-1z" fill="${fillColor}"/>
<path transform="translate(794,162)" d="m0 0 29 5 20 5 24 8 24 11 16 9 1 3-5-2-9 3-4 4-3 6-3 10 2 2-3 1-16-8-19-8-15-5-22-5-9-2-2-5-7-31z" fill="${fillColor}"/>
<path transform="translate(561,401)" d="m0 0h3l1 51-8-1-57-12-47-9-9-2 2-2 46-10 26-5z" fill="${fillColor}"/>
<path transform="translate(971,401)" d="m0 0 12 2 40 9 67 14 2 2-52 10-58 12-11 2z" fill="${fillColor}"/>
<path transform="translate(742,619)" d="m0 0h51l-1 8-14 62-9 40-2 2-3-12-19-83-3-14z" fill="${fillColor}"/>
<path transform="translate(767,111)" d="m0 0h2l9 43 9 40 6 27v4h-51l14-64z" fill="${fillColor}"/>
</svg>`;
}

const COMPASS_LOGO_WHITE_LARGE = generateCompassLogo('#FFFFFF', 120);
const COMPASS_LOGO_WHITE_XLARGE = generateCompassLogo('#FFFFFF', 160);
const COMPASS_LOGO_CYAN_SMALL = generateCompassLogo('#00D4FF', 40);
const COMPASS_LOGO_CYAN_MEDIUM = generateCompassLogo('#00D4FF', 60);

// ============================================
// HTML GENERATION
// ============================================

function generateHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* Base Styles */
    :root {
      --dark-bg: #0A0A0F;
      --elevated-surface: #111118;
      --accent-cyan: #00D4FF;
      --text-light: #F0F0F5;
      --text-muted: #9090A8;
      --text-dark: #1A1A24;
      --success-green: #22C55E;
      --warning-amber: #F59E0B;
      --danger-red: #EF4444;
    }

    @page {
      size: letter;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--text-dark);
      -webkit-font-smoothing: antialiased;
    }

    /* Cover Page */
    .cover-page {
      width: 100%;
      height: 11in;
      background: var(--dark-bg);
      color: var(--text-light);
      padding: 1in;
      display: flex;
      flex-direction: column;
      page-break-after: always;
      position: relative;
    }

    .cover-logo {
      width: 120px;
      height: auto;
      margin-bottom: auto;
    }

    .cover-logo svg {
      width: 100%;
      height: auto;
    }

    .cover-badge {
      display: inline-block;
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: var(--accent-cyan);
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 10pt;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .cover-title {
      font-size: 42pt;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-size: 18pt;
      font-weight: 600;
      color: var(--accent-cyan);
      margin-bottom: 24px;
    }

    .cover-description {
      font-size: 13pt;
      color: var(--text-muted);
      max-width: 70%;
      line-height: 1.7;
      margin-bottom: auto;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cover-contact {
      font-size: 10pt;
      color: var(--text-muted);
    }

    .cover-contact a {
      color: var(--accent-cyan);
      text-decoration: none;
    }

    /* Framework Page */
    .framework-page {
      width: 100%;
      min-height: 11in;
      background: #FFFFFF;
      padding: 0.75in;
      page-break-after: always;
      position: relative;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E5EA;
      margin-bottom: 32px;
    }

    .page-header-title {
      font-size: 9pt;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .page-header-logo {
      width: 40px;
      height: auto;
      opacity: 0.7;
    }

    .page-header-logo svg {
      width: 100%;
      height: auto;
    }

    .section-label {
      font-size: 10pt;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent-cyan);
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 28pt;
      font-weight: 800;
      color: var(--text-dark);
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .section-description {
      font-size: 12pt;
      color: var(--text-muted);
      max-width: 80%;
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .pillar-card {
      background: #F8F9FA;
      border: 1px solid #E5E5EA;
      border-radius: 12px;
      padding: 24px;
    }

    .pillar-icon {
      font-size: 28pt;
      margin-bottom: 12px;
    }

    .pillar-name {
      font-size: 16pt;
      font-weight: 700;
      color: var(--accent-cyan);
      margin-bottom: 8px;
    }

    .pillar-description {
      font-size: 11pt;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .process-note {
      background: var(--dark-bg);
      color: var(--text-light);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }

    .process-note-text {
      font-size: 11pt;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .process-note-text strong {
      color: var(--accent-cyan);
      font-weight: 600;
    }

    /* Scorecard Page */
    .scorecard-page {
      width: 100%;
      min-height: 11in;
      background: #FFFFFF;
      padding: 0.75in;
      page-break-after: always;
      position: relative;
    }

    .scorecard-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }

    .scorecard-item {
      background: rgba(0, 212, 255, 0.05);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 8px;
      padding: 16px 12px;
      text-align: center;
    }

    .scorecard-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.1) 100%);
      border: 2px solid var(--accent-cyan);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
      font-size: 14pt;
      font-weight: 700;
      color: var(--accent-cyan);
    }

    .scorecard-name {
      font-size: 10pt;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 4px;
    }

    .scorecard-desc {
      font-size: 8pt;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      padding-top: 20px;
      border-top: 1px solid #E5E5EA;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-text {
      font-size: 9pt;
      color: var(--text-muted);
    }

    /* Packages Page */
    .packages-page {
      width: 100%;
      min-height: 11in;
      background: #FFFFFF;
      padding: 0.75in;
      page-break-after: always;
      position: relative;
    }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .package-card {
      background: #F8F9FA;
      border: 1px solid #E5E5EA;
      border-radius: 12px;
      padding: 20px;
    }

    .package-card.featured {
      border: 2px solid var(--accent-cyan);
      background: rgba(0, 212, 255, 0.03);
    }

    .package-name {
      font-size: 14pt;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 4px;
    }

    .package-price {
      font-size: 24pt;
      font-weight: 800;
      color: var(--accent-cyan);
      margin-bottom: 4px;
    }

    .package-hours {
      font-size: 10pt;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .package-description {
      font-size: 10pt;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Process Page */
    .process-page {
      width: 100%;
      min-height: 11in;
      background: #FFFFFF;
      padding: 0.75in;
      page-break-after: always;
      position: relative;
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .process-step {
      background: #F8F9FA;
      border: 1px solid #E5E5EA;
      border-radius: 12px;
      padding: 24px;
    }

    .step-number {
      font-size: 36pt;
      font-weight: 800;
      color: rgba(0, 212, 255, 0.3);
      line-height: 1;
      margin-bottom: 12px;
    }

    .step-title {
      font-size: 16pt;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 8px;
    }

    .step-description {
      font-size: 11pt;
      color: var(--text-muted);
      line-height: 1.6;
    }

    /* CTA Page */
    .cta-page {
      width: 100%;
      height: 11in;
      background: var(--dark-bg);
      color: var(--text-light);
      padding: 1in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
    }

    .cta-title {
      font-size: 36pt;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 24px;
      letter-spacing: -0.02em;
    }

    .cta-title span {
      color: var(--accent-cyan);
    }

    .cta-description {
      font-size: 14pt;
      color: var(--text-muted);
      max-width: 500px;
      line-height: 1.7;
      margin-bottom: 40px;
    }

    .cta-button {
      background: var(--accent-cyan);
      color: var(--dark-bg);
      font-size: 14pt;
      font-weight: 700;
      padding: 16px 40px;
      border-radius: 10px;
      text-decoration: none;
      margin-bottom: 16px;
    }

    .cta-email {
      font-size: 12pt;
      color: var(--text-muted);
    }

    .cta-email a {
      color: var(--accent-cyan);
      text-decoration: none;
    }

    /* Back Cover */
    .back-cover {
      width: 100%;
      height: 11in;
      background: var(--dark-bg);
      color: var(--text-light);
      padding: 1in;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .back-logo {
      width: 160px;
      height: auto;
      margin-bottom: 40px;
    }

    .back-logo svg {
      width: 100%;
      height: auto;
    }

    .back-tagline {
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .back-description {
      font-size: 12pt;
      color: var(--text-muted);
      max-width: 400px;
      line-height: 1.7;
      margin-bottom: 40px;
    }

    .back-contact {
      font-size: 11pt;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .back-contact a {
      color: var(--accent-cyan);
      text-decoration: none;
    }

    .back-copyright {
      font-size: 9pt;
      color: var(--text-muted);
      opacity: 0.6;
      margin-top: 40px;
    }

    /* Page Footer */
    .page-footer {
      position: absolute;
      bottom: 0.4in;
      left: 0.75in;
      right: 0.75in;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: var(--text-muted);
    }

    .page-number {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-logo">
      ${COMPASS_LOGO_WHITE_LARGE}
    </div>
    <div class="cover-badge">Private Consulting Services</div>
    <h1 class="cover-title">Operating Simply Consulting</h1>
    <p class="cover-subtitle">by Zander Systems</p>
    <p class="cover-description">
      Expert guidance to organize, optimize, and grow your business.
      The Operating Simply methodology brings clarity to your operations
      through hands-on advisory work that creates lasting systems and structures.
    </p>
    <div class="cover-footer">
      <div class="cover-contact">
        <strong>Jonathan White</strong><br>
        <a href="mailto:jonathan@zanderos.com">jonathan@zanderos.com</a><br>
        <a href="https://zanderos.com">zanderos.com</a>
      </div>
      <div class="cover-contact" style="text-align: right;">
        <a href="https://calendly.com/jonathan-zanderos">calendly.com/jonathan-zanderos</a>
      </div>
    </div>
  </div>

  <!-- Framework Page -->
  <div class="framework-page">
    <div class="page-header">
      <span class="page-header-title">Operating Simply Consulting | The Framework</span>
      <span class="page-header-logo">${COMPASS_LOGO_CYAN_SMALL}</span>
    </div>

    <div class="section-label">The Framework</div>
    <h2 class="section-title">Operating Simply</h2>
    <p class="section-description">
      Every business can be understood through four pillars. Process isn't a pillar —
      it's the philosophy, methodology, and software that connects them all.
    </p>

    <div class="pillars-grid">
      <div class="pillar-card">
        <div class="pillar-icon">👥</div>
        <div class="pillar-name">People</div>
        <div class="pillar-description">
          Build and align your team. Define roles, responsibilities, and culture
          that supports your mission.
        </div>
      </div>
      <div class="pillar-card">
        <div class="pillar-icon">📦</div>
        <div class="pillar-name">Products</div>
        <div class="pillar-description">
          Clarify what you sell and how you deliver value to customers.
          Define your offerings and quality standards.
        </div>
      </div>
      <div class="pillar-card">
        <div class="pillar-icon">📋</div>
        <div class="pillar-name">Projects</div>
        <div class="pillar-description">
          Organize your work into manageable, trackable initiatives.
          Create visibility and accountability.
        </div>
      </div>
      <div class="pillar-card">
        <div class="pillar-icon">⚙️</div>
        <div class="pillar-name">Production</div>
        <div class="pillar-description">
          Systematize your operations for consistent, quality output.
          Build repeatable processes that scale.
        </div>
      </div>
    </div>

    <div class="process-note">
      <p class="process-note-text">
        <strong>Process</strong> is the thread that runs through everything —
        the philosophy, methodology, and systems that connect People, Products,
        Projects, and Production into a cohesive operation.
      </p>
    </div>

    <div class="page-footer">
      <span>© 2026 Zander Systems</span>
      <span class="page-number">2</span>
    </div>
  </div>

  <!-- Scorecard Page -->
  <div class="scorecard-page">
    <div class="page-header">
      <span class="page-header-title">Operating Simply Consulting | Assessment Tool</span>
      <span class="page-header-logo">${COMPASS_LOGO_CYAN_SMALL}</span>
    </div>

    <div class="section-label">Assessment Tool</div>
    <h2 class="section-title">The 10-Pillar Scorecard</h2>
    <p class="section-description">
      Every engagement begins with scoring your business across ten dimensions.
      Each pillar is rated 1-10, creating your baseline and guiding the entire engagement.
    </p>

    <div class="scorecard-grid">
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Vision</div>
        <div class="scorecard-desc">Clear direction and future state</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Mission</div>
        <div class="scorecard-desc">Purpose and core activities</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Values</div>
        <div class="scorecard-desc">Guiding principles and beliefs</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Strategy</div>
        <div class="scorecard-desc">Approach to achieving goals</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">People</div>
        <div class="scorecard-desc">Team building and culture</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Process</div>
        <div class="scorecard-desc">Operations and workflows</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Product</div>
        <div class="scorecard-desc">Offerings and quality</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Finance</div>
        <div class="scorecard-desc">Financial health and management</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Marketing</div>
        <div class="scorecard-desc">Brand and customer acquisition</div>
      </div>
      <div class="scorecard-item">
        <div class="scorecard-circle">?</div>
        <div class="scorecard-name">Growth</div>
        <div class="scorecard-desc">Scaling and expansion capacity</div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-dot" style="background: #22C55E;"></div>
        <span class="legend-text">Strong (8-10)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: #00D4FF;"></div>
        <span class="legend-text">Good (6-7)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: #F59E0B;"></div>
        <span class="legend-text">Needs Work (4-5)</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background: #EF4444;"></div>
        <span class="legend-text">Critical (1-3)</span>
      </div>
    </div>

    <div class="page-footer">
      <span>© 2026 Zander Systems</span>
      <span class="page-number">3</span>
    </div>
  </div>

  <!-- Packages Page -->
  <div class="packages-page">
    <div class="page-header">
      <span class="page-header-title">Operating Simply Consulting | Engagement Options</span>
      <span class="page-header-logo">${COMPASS_LOGO_CYAN_SMALL}</span>
    </div>

    <div class="section-label">Engagement Options</div>
    <h2 class="section-title">Consulting Packages</h2>
    <p class="section-description">
      Choose the engagement level that fits your needs.
      Every package includes direct access to your consultant.
    </p>

    <div class="packages-grid">
      <div class="package-card">
        <div class="package-name">Business Analysis</div>
        <div class="package-price">$500</div>
        <div class="package-description">
          Comprehensive business assessment, Operating Simply Scorecard baseline,
          written analysis with recommendations.
        </div>
      </div>
      <div class="package-card">
        <div class="package-name">Compass</div>
        <div class="package-price">$2,500</div>
        <div class="package-hours">20 hours</div>
        <div class="package-description">
          Strategic direction setting, priority identification, 90-day action plan.
        </div>
      </div>
      <div class="package-card featured">
        <div class="package-name">Foundation</div>
        <div class="package-price">$4,500</div>
        <div class="package-hours">40 hours</div>
        <div class="package-description">
          Full operational foundation build, SOPs, process documentation, team alignment.
        </div>
      </div>
      <div class="package-card">
        <div class="package-name">Blueprint</div>
        <div class="package-price">$8,000</div>
        <div class="package-hours">80 hours</div>
        <div class="package-description">
          Complete business transformation, all Foundation deliverables plus ongoing strategic partnership.
        </div>
      </div>
      <div class="package-card">
        <div class="package-name">Extension</div>
        <div class="package-price">$250</div>
        <div class="package-hours">10 hours / 3 months</div>
        <div class="package-description">
          Continue working together after any package. Extend your engagement timeline.
        </div>
      </div>
      <div class="package-card">
        <div class="package-name">Ad Hoc</div>
        <div class="package-price">$250/hour</div>
        <div class="package-description">
          Flexible support via invoice. Schedule sessions as needed.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>© 2026 Zander Systems</span>
      <span class="page-number">4</span>
    </div>
  </div>

  <!-- Process Page -->
  <div class="process-page">
    <div class="page-header">
      <span class="page-header-title">Operating Simply Consulting | How We Work</span>
      <span class="page-header-logo">${COMPASS_LOGO_CYAN_SMALL}</span>
    </div>

    <div class="section-label">How We Work</div>
    <h2 class="section-title">Our Process</h2>
    <p class="section-description">
      Every engagement follows a structured path from discovery to independence.
    </p>

    <div class="process-steps">
      <div class="process-step">
        <div class="step-number">01</div>
        <div class="step-title">Define</div>
        <div class="step-description">
          We start with a comprehensive intake to understand your business,
          challenges, and goals. The scorecard assessment establishes your baseline.
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">02</div>
        <div class="step-title">Engage</div>
        <div class="step-description">
          Collaborative working sessions where we build systems, solve problems,
          and document processes. Hands-on implementation, not just advice.
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">03</div>
        <div class="step-title">Transform</div>
        <div class="step-description">
          Implementation of new structures, habits, and tools that create lasting
          operational change. Regular check-ins to ensure adoption.
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">04</div>
        <div class="step-title">Graduate</div>
        <div class="step-description">
          You emerge with documented systems, clear direction, and the confidence
          to execute independently. Final scorecard shows your progress.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>© 2026 Zander Systems</span>
      <span class="page-number">5</span>
    </div>
  </div>

  <!-- CTA Page -->
  <div class="cta-page">
    <h2 class="cta-title">
      Ready to build something<br>
      <span>that actually works?</span>
    </h2>
    <p class="cta-description">
      Book a discovery call to discuss your business, explore whether
      consulting is the right fit, and learn how Operating Simply can
      bring clarity to your operations.
    </p>
    <div class="cta-button">Book a Discovery Call</div>
    <p class="cta-email">
      <a href="https://calendly.com/jonathan-zanderos/discovery-call">calendly.com/jonathan-zanderos/discovery-call</a>
    </p>
    <p class="cta-email" style="margin-top: 16px;">
      or email: <a href="mailto:jonathan@zanderos.com">jonathan@zanderos.com</a>
    </p>
  </div>

  <!-- Back Cover -->
  <div class="back-cover">
    <div class="back-logo">
      ${COMPASS_LOGO_WHITE_XLARGE}
    </div>
    <h2 class="back-tagline">Operating Simply</h2>
    <p class="back-description">
      Zander helps businesses build systems that scale. Our consulting and software
      platform combines hands-on advisory with AI-powered tools to bring clarity
      to your operations.
    </p>
    <p class="back-contact">
      <a href="https://zanderos.com">zanderos.com</a>
    </p>
    <p class="back-contact">
      <a href="mailto:jonathan@zanderos.com">jonathan@zanderos.com</a>
    </p>
    <p class="back-contact">
      <a href="https://calendly.com/jonathan-zanderos">calendly.com/jonathan-zanderos</a>
    </p>
    <p class="back-copyright">© 2026 Zander Systems LLC. All rights reserved.</p>
  </div>
</body>
</html>
`;
}

// ============================================
// PDF GENERATION
// ============================================

async function generateConsultingBrochure() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ZANDER CONSULTING BROCHURE PDF GENERATOR');
  console.log('   Premium Branded PDF');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📄 Generating: Consulting Brochure...');

  const html = generateHTML();

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../../apps/web/public/downloads');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });

  const pdfPath = path.join(outputDir, 'zander-consulting-brochure.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  const fileSizeKB = (stats.size / 1024).toFixed(0);

  console.log(`   ✅ Generated: zander-consulting-brochure.pdf (${fileSizeKB} KB)`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ Generation complete');
  console.log('   📁 Output: apps/web/public/downloads/zander-consulting-brochure.pdf');
  console.log(`   📊 File size: ${fileSizeKB} KB`);
  console.log('   📄 Pages: 6');
  console.log('═══════════════════════════════════════════════════════════\n');
}

generateConsultingBrochure().catch(console.error);
