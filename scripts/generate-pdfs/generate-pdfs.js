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

// Zander logo SVG (inline for PDF generation)
const ZANDER_LOGO_WHITE = `<svg width="180" height="36" viewBox="0 0 180 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="28" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="800" fill="#FFFFFF" letter-spacing="-0.02em">ZANDER</text>
</svg>`;

const ZANDER_ICON = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" stroke="#00D4FF" stroke-width="2" fill="none"/>
  <path d="M12 14L20 26L28 14" stroke="#00D4FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="20" cy="12" r="2" fill="#00D4FF"/>
</svg>`;

// Read CSS styles
const cssPath = path.join(__dirname, 'styles.css');
const cssStyles = fs.readFileSync(cssPath, 'utf-8');

// Generate cover page HTML
function generateCoverPage(product) {
  return `
    <div class="cover-page">
      <div style="margin-bottom: auto;">
        ${ZANDER_LOGO_WHITE}
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
      ${ZANDER_LOGO_WHITE}
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
          <span class="page-header-logo">${ZANDER_ICON}</span>
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
  console.log('   📁 Output: public/downloads/');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
