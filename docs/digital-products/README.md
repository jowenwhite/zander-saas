# Digital Products - Content Requirements

This document outlines the content needed for each of the 6 digital products sold on zanderos.com/store.

## Product Specifications

### 1. Operations Playbook ($79)
**Filename:** `operations-playbook.pdf`
**S3 Key:** `products/operations-playbook.pdf`

**Content:**
- Daily operation checklists
- Weekly rhythm templates
- Monthly review frameworks
- Standard Operating Procedure (SOP) templates
- Role accountability charts
- Process documentation guides
- Quality control checklists

**Target Length:** 40-60 pages

---

### 2. Startup Foundations Kit ($99)
**Filename:** `startup-foundations-kit.pdf`
**S3 Key:** `products/startup-foundations-kit.pdf`

**Content:**
- Business plan template (lean canvas + traditional)
- Legal checklist for new businesses
- Financial projection spreadsheets (12-month, 3-year)
- Go-to-market framework
- Brand foundation workbook
- Entity structure decision guide
- Founding documents checklist

**Target Length:** 50-75 pages

---

### 3. Sales and Marketing Kit ($99)
**Filename:** `sales-marketing-kit.pdf`
**S3 Key:** `products/sales-marketing-kit.pdf`

**Content:**
- Email sequence templates (cold outreach, follow-up, nurture)
- Social media calendar templates
- Lead scoring frameworks
- Sales scripts and talk tracks
- Pipeline management guides
- Objection handling playbook
- Marketing calendar templates

**Target Length:** 50-70 pages

---

### 4. Hiring and Team Building Kit ($99)
**Filename:** `hiring-team-building-kit.pdf`
**S3 Key:** `products/hiring-team-building-kit.pdf`

**Content:**
- Job description templates (10+ roles)
- Interview question banks
- Structured interview scorecards
- Onboarding checklist (30-60-90 day)
- Performance review templates
- Team building activities guide
- Culture documentation framework

**Target Length:** 50-70 pages

---

### 5. Financial Clarity Kit ($79)
**Filename:** `financial-clarity-kit.pdf`
**S3 Key:** `products/financial-clarity-kit.pdf`

**Content:**
- Cash flow projection templates
- Budget planning frameworks
- Pricing calculator worksheets
- Financial dashboard templates
- P&L analysis guide
- Break-even calculators
- Financial health scorecard

**Target Length:** 35-50 pages

---

### 6. Industry Starter Packs ($149)
**Filename:** `industry-starter-packs.pdf`
**S3 Key:** `products/industry-starter-packs.pdf`

**Content:**
Four industry-specific bundles:
1. **Construction/Trades**
   - Bid/estimate templates
   - Project timeline tools
   - Crew scheduling
   - Safety checklists

2. **Professional Services**
   - Client intake forms
   - Statement of Work templates
   - Retainer agreements
   - Time tracking systems

3. **Retail**
   - Inventory management
   - Visual merchandising guides
   - Staff scheduling
   - POS integration checklists

4. **E-commerce**
   - Product listing templates
   - Shipping workflow guides
   - Customer service scripts
   - Return/refund policies

**Target Length:** 80-120 pages (20-30 per industry)

---

## Branding Requirements

All PDFs should include:

### Cover Page
- Zander logo (cyan: #00CCEE)
- Product title
- "Operating Simply" tagline
- Dark background (#09090F or #1C1C26)

### Headers/Footers
- Zander logo (small)
- Page numbers
- Copyright: "2026 Zander Systems LLC"
- Website: zanderos.com

### Typography
- Headings: Bold, clean sans-serif (Inter or similar)
- Body: Readable sans-serif, 11-12pt
- Code/templates: Monospace where appropriate

### Color Palette
- Primary: #00CCEE (Zander Cyan)
- Dark: #09090F, #1C1C26
- Light: #F0F0F5
- Accents: #7C3AED (Violet), #22C55E (Success), #F59E0B (Amber/Warning)

---

## Upload Instructions

1. Create PDFs following the branding requirements above
2. Upload to S3 bucket: `zander-digital-products`
3. Set S3 key as specified for each product
4. Update `placeholder: false` in `/apps/web/app/api/store/download/route.ts`
5. Test download flow end-to-end

---

## Content Files

Full content has been written for each product in markdown format. These files contain the complete, professional content ready for PDF conversion.

### Content Location: `docs/digital-products/content/`

| Product | Content File | Word Count |
|---------|--------------|------------|
| Operations Playbook | `operations-playbook.md` | ~3,200 |
| Startup Foundations Kit | `startup-foundations-kit.md` | ~3,500 |
| Sales and Marketing Kit | `sales-marketing-kit.md` | ~3,800 |
| Hiring and Team Building Kit | `hiring-team-building-kit.md` | ~4,000 |
| Financial Clarity Kit | `financial-clarity-kit.md` | ~3,400 |
| Industry Starter Pack (Construction) | `industry-pack-construction.md` | ~4,200 |

### PDF Generation Instructions

**Option 1: Using Pandoc (Recommended)**
```bash
# Install pandoc and wkhtmltopdf
brew install pandoc wkhtmltopdf

# Generate PDF with branding
pandoc content/operations-playbook.md \
  -o operations-playbook.pdf \
  --pdf-engine=wkhtmltopdf \
  --css=branding.css \
  --metadata title="Operations Playbook"
```

**Option 2: Using Markdown Preview (VS Code)**
1. Open markdown file in VS Code
2. Install "Markdown PDF" extension
3. Right-click → "Markdown PDF: Export (pdf)"

**Option 3: Professional Design**
For polished, designed PDFs:
1. Import content into Figma/Canva
2. Apply Zander brand templates
3. Export as PDF

---

## Current Status

| Product | Content | PDF Generated | Download Wired |
|---------|---------|---------------|----------------|
| Operations Playbook | ✅ Complete | ✅ 680 KB | ✅ Ready |
| Startup Foundations Kit | ✅ Complete | ✅ 712 KB | ✅ Ready |
| Sales and Marketing Kit | ✅ Complete | ✅ 703 KB | ✅ Ready |
| Hiring and Team Building Kit | ✅ Complete | ✅ 706 KB | ✅ Ready |
| Financial Clarity Kit | ✅ Complete | ✅ 651 KB | ✅ Ready |
| Industry Starter Pack (Construction) | ✅ Complete | ✅ 660 KB | ✅ Ready |

### PDF Generation

PDFs are generated using Puppeteer with premium branded HTML/CSS templates.

**To regenerate PDFs:**
```bash
node scripts/generate-pdfs/generate-pdfs.js
```

**Output location:** `apps/web/public/downloads/`

### Download Flow
1. Customer purchases via Stripe checkout
2. Redirected to `/store/success?session_id=xxx`
3. Success page calls `/api/store/download` to get download URL
4. Download URL points to static PDF in `/downloads/`

Last Updated: 2026-04-17
