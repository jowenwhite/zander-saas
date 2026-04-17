/**
 * Zander Premium PDF Generator
 * Generates McKinsey/Bain quality PDFs from markdown content
 *
 * Usage: node scripts/generate-pdfs/generate-pdfs.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Product configurations
const PRODUCTS = [
  {
    id: 'operations-playbook',
    filename: 'operations-playbook.pdf',
    contentFile: 'operations-playbook.md',
    title: 'Operations Playbook',
    subtitle: 'Your Complete Guide to Daily, Weekly, and Monthly Operations',
    price: '$79',
    chapters: [
      { num: 1, title: 'Introduction to Operational Excellence', subtitle: 'Why systems beat personality every time' },
      { num: 2, title: 'The Daily Operations Framework', subtitle: 'The Power Hour and daily rhythms' },
      { num: 3, title: 'Weekly Rhythm: The Pulse of Your Business', subtitle: 'Monday kickoffs to Friday reviews' },
      { num: 4, title: 'Monthly Operations Review', subtitle: 'The most important meeting of the month' },
      { num: 5, title: 'Standard Operating Procedure Templates', subtitle: 'SOPs that actually get used' },
      { num: 6, title: 'Process Documentation Best Practices', subtitle: 'Write once, reference forever' },
      { num: 7, title: 'Metrics That Matter', subtitle: 'Track what moves the needle' },
      { num: 8, title: 'Implementation Checklist', subtitle: 'Your 4-week action plan' },
    ]
  },
  {
    id: 'startup-foundations-kit',
    filename: 'startup-foundations-kit.pdf',
    contentFile: 'startup-foundations-kit.md',
    title: 'Startup Foundations Kit',
    subtitle: 'Everything You Need to Launch with Structure',
    price: '$99',
    chapters: [
      { num: 1, title: 'Business Planning Fundamentals', subtitle: 'From idea to execution plan' },
      { num: 2, title: 'Legal Foundations', subtitle: 'Protect yourself from day one' },
      { num: 3, title: 'Financial Projections', subtitle: '12-month and 3-year models' },
      { num: 4, title: 'Go-to-Market Strategy', subtitle: 'Launch with purpose, not hope' },
      { num: 5, title: 'Brand Foundation', subtitle: 'More than just a logo' },
      { num: 6, title: 'Entity Structure', subtitle: 'Choose the right business type' },
      { num: 7, title: 'Founding Documents', subtitle: 'Essential paperwork checklist' },
      { num: 8, title: 'The 90-Day Launch Roadmap', subtitle: 'Week by week action items' },
    ]
  },
  {
    id: 'sales-marketing-kit',
    filename: 'sales-marketing-kit.pdf',
    contentFile: 'sales-marketing-kit.md',
    title: 'Sales & Marketing Kit',
    subtitle: 'Build Your Pipeline and Grow Your Brand',
    price: '$99',
    chapters: [
      { num: 1, title: 'Email Sequence Templates', subtitle: 'Cold outreach to close' },
      { num: 2, title: 'Social Media Calendar', subtitle: '90 days of content planned' },
      { num: 3, title: 'Lead Scoring Framework', subtitle: 'Focus on the right prospects' },
      { num: 4, title: 'Sales Scripts & Talk Tracks', subtitle: 'What to say, when to say it' },
      { num: 5, title: 'Pipeline Management', subtitle: 'From lead to customer' },
      { num: 6, title: 'Objection Handling', subtitle: 'Turn no into yes' },
      { num: 7, title: 'Marketing Calendar Templates', subtitle: 'Plan campaigns that convert' },
      { num: 8, title: 'The Complete Playbook', subtitle: 'Putting it all together' },
    ]
  },
  {
    id: 'hiring-team-building-kit',
    filename: 'hiring-team-building-kit.pdf',
    contentFile: 'hiring-team-building-kit.md',
    title: 'Hiring & Team Building Kit',
    subtitle: 'Recruit, Onboard, and Retain Great People',
    price: '$99',
    chapters: [
      { num: 1, title: 'Job Description Templates', subtitle: '10+ roles ready to post' },
      { num: 2, title: 'Interview Question Banks', subtitle: 'Structured interviews that work' },
      { num: 3, title: 'Interview Scorecards', subtitle: 'Objective candidate evaluation' },
      { num: 4, title: 'The 30-60-90 Onboarding System', subtitle: 'Set new hires up for success' },
      { num: 5, title: 'Performance Review Templates', subtitle: 'Fair, consistent feedback' },
      { num: 6, title: 'Team Building Activities', subtitle: 'Culture beyond ping pong tables' },
      { num: 7, title: 'Culture Documentation', subtitle: 'Define who you are' },
      { num: 8, title: 'The Hiring Flowchart', subtitle: 'Process from posting to offer' },
    ]
  },
  {
    id: 'financial-clarity-kit',
    filename: 'financial-clarity-kit.pdf',
    contentFile: 'financial-clarity-kit.md',
    title: 'Financial Clarity Kit',
    subtitle: 'Take Control of Your Numbers',
    price: '$79',
    chapters: [
      { num: 1, title: 'Cash Flow Projections', subtitle: 'Know your runway' },
      { num: 2, title: 'Budget Planning Frameworks', subtitle: 'Spend with intention' },
      { num: 3, title: 'Pricing Calculator', subtitle: 'Price for profit' },
      { num: 4, title: 'Financial Dashboards', subtitle: 'Numbers at a glance' },
      { num: 5, title: 'P&L Analysis Guide', subtitle: 'Understand your statements' },
      { num: 6, title: 'Break-Even Calculator', subtitle: 'Know your threshold' },
      { num: 7, title: 'Financial Health Scorecard', subtitle: 'Grade your business' },
      { num: 8, title: 'Implementation Guide', subtitle: 'Put it all into action' },
    ]
  },
  {
    id: 'industry-starter-packs',
    filename: 'industry-pack-construction.pdf',
    contentFile: 'industry-pack-construction.md',
    title: 'Industry Starter Pack',
    subtitle: 'Construction & Trades Edition',
    price: '$149',
    chapters: [
      { num: 1, title: 'Estimating & Bidding', subtitle: 'Win profitable projects' },
      { num: 2, title: 'Project Management', subtitle: 'On time, on budget' },
      { num: 3, title: 'Crew Scheduling', subtitle: 'Right people, right place' },
      { num: 4, title: 'Safety & Compliance', subtitle: 'Protect your team' },
      { num: 5, title: 'Subcontractor Management', subtitle: 'Build your network' },
      { num: 6, title: 'Client Communication', subtitle: 'Updates that build trust' },
      { num: 7, title: 'Financial Controls', subtitle: 'Job costing that works' },
      { num: 8, title: 'Growth Strategy', subtitle: 'Scale without chaos' },
    ]
  }
];

// ============================================
// ZANDER COMPASS LOGO SVGs
// Extracted from apps/web/public/images/zander-icon.svg
// ============================================

// Generate compass logo with custom fill color and size
function generateCompassLogo(fillColor, width) {
  // Scale factor based on original viewBox 700x600
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

// Preset logo sizes with colors
const COMPASS_LOGO_WHITE_LARGE = generateCompassLogo('#FFFFFF', 100);  // Cover page - 100px
const COMPASS_LOGO_WHITE_XLARGE = generateCompassLogo('#FFFFFF', 140); // Back cover - 140px
const COMPASS_LOGO_CYAN_SMALL = generateCompassLogo('#00D4FF', 35);    // Page headers - 35px
const COMPASS_LOGO_CYAN_MEDIUM = generateCompassLogo('#00D4FF', 50);   // TOC page - 50px

// Read CSS styles
const cssPath = path.join(__dirname, 'styles.css');
const cssStyles = fs.readFileSync(cssPath, 'utf-8');

// Generate cover page HTML
function generateCoverPage(product) {
  return `
    <div class="cover-page">
      <div class="cover-logo">
        ${COMPASS_LOGO_WHITE_LARGE}
      </div>
      <div class="cover-accent-bar"></div>
      <h1 class="cover-title">${product.title}</h1>
      <p class="cover-subtitle">${product.subtitle}</p>
      <p class="cover-tagline">A Zander Systems Publication</p>
      <div class="cover-footer">
        <span class="cover-attribution">Operating Simply Methodology</span>
        <span class="cover-price">${product.price}</span>
      </div>
    </div>
  `;
}

// Generate table of contents HTML
function generateTOC(product) {
  const tocItems = product.chapters.map((ch, i) => `
    <div class="toc-item">
      <span class="toc-number">${String(ch.num).padStart(2, '0')}</span>
      <span class="toc-title">${ch.title}</span>
      <span class="toc-dots"></span>
      <span class="toc-page-num">${(i + 1) * 2 + 3}</span>
    </div>
  `).join('');

  return `
    <div class="toc-page">
      <div class="toc-logo">
        ${COMPASS_LOGO_CYAN_MEDIUM}
      </div>
      <h1 class="toc-header">Contents</h1>
      <div class="toc-accent"></div>
      ${tocItems}
    </div>
  `;
}

// Generate section divider HTML
function generateSectionDivider(chapter) {
  return `
    <div class="section-divider">
      <div class="section-number">${String(chapter.num).padStart(2, '0')}</div>
      <h2 class="section-title">${chapter.title}</h2>
      <p class="section-subtitle">${chapter.subtitle}</p>
    </div>
  `;
}

// Generate back cover HTML
function generateBackCover() {
  return `
    <div class="back-cover">
      <div class="back-logo">
        ${COMPASS_LOGO_WHITE_XLARGE}
      </div>
      <h2 class="back-tagline">Operating Simply</h2>
      <p class="back-description">
        Zander helps businesses build systems that scale. Our consulting and software platform
        combines hands-on advisory with AI-powered tools to bring clarity to your operations.
      </p>
      <div class="back-cta">Book a Business Analysis Session</div>
      <p class="back-contact">
        <a href="https://zanderos.com">zanderos.com</a>
      </p>
      <p class="back-copyright">© 2026 Zander Systems LLC. All rights reserved.</p>
    </div>
  `;
}

// Convert markdown to styled HTML
function markdownToHTML(markdown) {
  // Configure marked for proper rendering
  marked.setOptions({
    gfm: true,
    breaks: false,
    headerIds: true,
  });

  let html = marked.parse(markdown);

  // Enhance tables with proper styling
  html = html.replace(/<table>/g, '<table class="styled-table">');

  // Convert checkbox-style lists to styled checklists
  html = html.replace(/<pre><code>([^<]*□[^<]*)<\/code><\/pre>/g, (match, content) => {
    const items = content.split('\n')
      .filter(line => line.trim().startsWith('□'))
      .map(line => `<li>${line.replace('□', '').trim()}</li>`)
      .join('');
    return `<div class="checklist"><div class="checklist-title">Checklist</div><ul>${items}</ul></div>`;
  });

  // Wrap code blocks in proper pre tags
  html = html.replace(/<pre><code>/g, '<pre>');
  html = html.replace(/<\/code><\/pre>/g, '</pre>');

  return html;
}

// Process markdown content into sections
function processContent(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = { title: '', content: [] };

  for (const line of lines) {
    if (line.startsWith('## Chapter') || line.startsWith('## ')) {
      if (currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      const title = line.replace(/^##\s*(Chapter\s*\d+:\s*)?/, '').trim();
      currentSection = { title, content: [] };
    } else {
      currentSection.content.push(line);
    }
  }

  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

// Generate content pages HTML
function generateContentPages(markdown, product) {
  const sections = processContent(markdown);
  let pagesHTML = '';
  let pageNum = 4; // Start after cover, TOC, first section divider

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const chapter = product.chapters[i];

    // Add section divider for each chapter
    if (chapter && i > 0) {
      pagesHTML += generateSectionDivider(chapter);
    }

    const contentHTML = markdownToHTML(section.content.join('\n'));

    pagesHTML += `
      <div class="content-page">
        <div class="page-header">
          <span class="page-header-title">${product.title} | ${section.title}</span>
          <span class="page-header-logo">${COMPASS_LOGO_CYAN_SMALL}</span>
        </div>
        <div class="content-body">
          ${contentHTML}
        </div>
        <div class="page-footer">
          <span>© 2026 Zander Systems</span>
          <span class="page-number">${pageNum}</span>
        </div>
      </div>
    `;
    pageNum++;
  }

  return pagesHTML;
}

// Generate complete PDF HTML
function generatePDFHTML(product, markdown) {
  const firstChapter = product.chapters[0];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>${cssStyles}</style>
    </head>
    <body>
      ${generateCoverPage(product)}
      ${generateTOC(product)}
      ${generateSectionDivider(firstChapter)}
      ${generateContentPages(markdown, product)}
      ${generateBackCover()}
    </body>
    </html>
  `;
}

// Main PDF generation function
async function generatePDF(product) {
  console.log(`\n📄 Generating: ${product.title}...`);

  // Read markdown content
  const contentPath = path.join(__dirname, '../../docs/digital-products/content', product.contentFile);

  if (!fs.existsSync(contentPath)) {
    console.log(`   ⚠️  Content file not found: ${contentPath}`);
    return;
  }

  const markdown = fs.readFileSync(contentPath, 'utf-8');

  // Generate HTML
  const html = generatePDFHTML(product, markdown);

  // Ensure output directory exists (in apps/web/public for Next.js serving)
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

  const pdfPath = path.join(outputDir, product.filename);

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log(`   ✅ Generated: ${product.filename} (${(stats.size / 1024).toFixed(0)} KB)`);

  return pdfPath;
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ZANDER PREMIUM PDF GENERATOR');
  console.log('   McKinsey/Bain Quality Digital Products');
  console.log('   With Official Compass Z Logo');
  console.log('═══════════════════════════════════════════════════════════');

  const startTime = Date.now();

  for (const product of PRODUCTS) {
    try {
      await generatePDF(product);
    } catch (error) {
      console.log(`   ❌ Error generating ${product.id}: ${error.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`   ✅ Generation complete in ${elapsed}s`);
  console.log('   📁 Output: apps/web/public/downloads/');
  console.log('');
  console.log('   Logo Placements:');
  console.log('   • Cover page: White compass logo (100px)');
  console.log('   • TOC page: Cyan compass logo (50px)');
  console.log('   • Page headers: Cyan compass logo (35px)');
  console.log('   • Back cover: White compass logo (140px)');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
