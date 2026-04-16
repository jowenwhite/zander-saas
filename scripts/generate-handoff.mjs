/**
 * Generate Phase 5 Consulting Module Handoff Document
 * Run with: node scripts/generate-handoff.mjs
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from 'docx';
import * as fs from 'fs';

const today = new Date().toISOString().split('T')[0];

const doc = new Document({
  title: 'Zander Phase 5 Consulting Module - Deployment Handoff',
  description: 'Session handoff document for Phase 5 consulting module deployment',
  sections: [
    {
      children: [
        // Title
        new Paragraph({
          text: 'ZANDER PHASE 5 CONSULTING MODULE',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: 'Deployment Handoff Document',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Date: ${today}`, italics: true }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),

        // What Shipped
        new Paragraph({
          text: 'WHAT SHIPPED',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Backend - NestJS API (apps/api)',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• ConsultingModule with full CRUD operations', bullet: { level: 0 } }),
        new Paragraph({ text: '• ConsultingEngagement - package purchases and tracking', bullet: { level: 1 } }),
        new Paragraph({ text: '• ConsultingTimeEntry - hour logging with auto-decrement', bullet: { level: 1 } }),
        new Paragraph({ text: '• ConsultingDeliverable - deliverable tracking and status', bullet: { level: 1 } }),
        new Paragraph({ text: '• ConsultingIntake - intake survey submissions', bullet: { level: 1 } }),
        new Paragraph({ text: '• Webhook handlers for consulting one-time payments', bullet: { level: 0 } }),
        new Paragraph({ text: '• Webhook handlers for digital store purchases', bullet: { level: 0 } }),
        new Paragraph({ text: '• All management endpoints gated by isSuperAdmin', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Frontend - Support Admin (apps/web)',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• ConsultingTab component in Support Admin', bullet: { level: 0 } }),
        new Paragraph({ text: '• Engagement management with hours progress visualization', bullet: { level: 1 } }),
        new Paragraph({ text: '• Time entry logging with category tracking', bullet: { level: 1 } }),
        new Paragraph({ text: '• Deliverable management interface', bullet: { level: 1 } }),
        new Paragraph({ text: '• ConsultingIntakeSurvey component', bullet: { level: 0 } }),
        new Paragraph({ text: '• Intake viewing and status management', bullet: { level: 1 } }),
        new Paragraph({ text: '• Convert intake to engagement flow', bullet: { level: 1 } }),
        new Paragraph({ text: '• useConsulting hook for API interactions', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Digital Store (apps/web/app/store)',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• Store page with 6 digital products', bullet: { level: 0 } }),
        new Paragraph({ text: '• Stripe checkout integration', bullet: { level: 0 } }),
        new Paragraph({ text: '• Success page with download link', bullet: { level: 0 } }),
        new Paragraph({ text: '• All products now have live Stripe price IDs', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Database Schema (packages/database)',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• ConsultingEngagement model', bullet: { level: 0 } }),
        new Paragraph({ text: '• ConsultingTimeEntry model', bullet: { level: 0 } }),
        new Paragraph({ text: '• ConsultingDeliverable model', bullet: { level: 0 } }),
        new Paragraph({ text: '• ConsultingIntake model', bullet: { level: 0 } }),
        new Paragraph({ text: '• Consulting fields on Tenant model', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Version Numbers
        new Paragraph({
          text: 'VERSION NUMBERS',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: 'Component', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Version', bold: true })] }),
                new TableCell({ children: [new Paragraph({ text: 'Notes', bold: true })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('API Docker Image')] }),
                new TableCell({ children: [new Paragraph('v56')] }),
                new TableCell({ children: [new Paragraph('ECR: 288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Git Commit')] }),
                new TableCell({ children: [new Paragraph('3fb6983')] }),
                new TableCell({ children: [new Paragraph('master branch')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Prisma')] }),
                new TableCell({ children: [new Paragraph('5.22.0')] }),
                new TableCell({ children: [new Paragraph('Schema synced to RDS')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Stripe')] }),
                new TableCell({ children: [new Paragraph('17.7.0')] }),
                new TableCell({ children: [new Paragraph('11 products created')] }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: '' }),

        // Stripe Products
        new Paragraph({
          text: 'STRIPE PRODUCTS CREATED',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Consulting Packages',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• Business Analysis: $500 (price_1TMrUlCesrE5OiIGm3P5qwpM)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Compass: $2,500 / 20 hours (price_1TMrUmCesrE5OiIGFhluNodU)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Foundation: $4,500 / 40 hours (price_1TMrUnCesrE5OiIGe6YO8ROu)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Blueprint: $8,000 / 80 hours (price_1TMrUoCesrE5OiIG4b894eDD)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Extension: $250 / 10 hours (price_1TMrUpCesrE5OiIGlGoEknqD)', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({
          text: 'Digital Store Products',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: '• Operations Playbook: $79 (price_1TMrUqCesrE5OiIGA4bIIMuQ)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Startup Foundations Kit: $99 (price_1TMrUqCesrE5OiIGTdRgIrWD)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Sales and Marketing Kit: $99 (price_1TMrUrCesrE5OiIG5x1t2cky)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Hiring and Team Building Kit: $99 (price_1TMrUsCesrE5OiIGBAGXRGvX)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Financial Clarity Kit: $79 (price_1TMrUtCesrE5OiIGMZtWMuK4)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Industry Starter Packs: $149 (price_1TMrUuCesrE5OiIG12AsAs2F)', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Deployment Status
        new Paragraph({
          text: 'DEPLOYMENT STATUS',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '• API Health: OK (api.zanderos.com/health)', bullet: { level: 0 } }),
        new Paragraph({ text: '• App: 200 OK (app.zanderos.com)', bullet: { level: 0 } }),
        new Paragraph({ text: '• Store: 200 OK (www.zanderos.com/store)', bullet: { level: 0 } }),
        new Paragraph({ text: '• ECS Service: ACTIVE, steady state', bullet: { level: 0 } }),
        new Paragraph({ text: '• Frontend: Auto-deployed via Vercel', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Outstanding Items
        new Paragraph({
          text: 'OUTSTANDING ITEMS',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '1. Digital product download files need to be uploaded to storage and URLs added to PRODUCT_DOWNLOADS map in download/route.ts', bullet: { level: 0 } }),
        new Paragraph({ text: '2. Consulting purchase flow needs Stripe webhook endpoint registered in Stripe Dashboard', bullet: { level: 0 } }),
        new Paragraph({ text: '3. Email templates for consulting welcome may need styling tweaks', bullet: { level: 0 } }),
        new Paragraph({ text: '4. Client-facing consulting dashboard (HQ view) not yet built', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Next Session Priorities
        new Paragraph({
          text: 'NEXT SESSION PRIORITIES',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '1. Test end-to-end consulting purchase flow with real Stripe checkout', bullet: { level: 0 } }),
        new Paragraph({ text: '2. Test digital store purchase and download flow', bullet: { level: 0 } }),
        new Paragraph({ text: '3. Build client-facing consulting view in HQ dashboard', bullet: { level: 0 } }),
        new Paragraph({ text: '4. Add consulting intake survey to public-facing site', bullet: { level: 0 } }),
        new Paragraph({ text: '5. Create actual downloadable content for store products', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Files Changed
        new Paragraph({
          text: 'KEY FILES CHANGED',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '• apps/api/src/consulting/ (entire new module)', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/billing/webhook.controller.ts', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/app.module.ts', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/admin/support-admin/components/ConsultingTab.tsx', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/admin/support-admin/components/ConsultingIntakeSurvey.tsx', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/admin/support-admin/hooks/useConsulting.ts', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/admin/support-admin/page.tsx', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/store/page.tsx', bullet: { level: 0 } }),
        new Paragraph({ text: '• packages/database/prisma/schema.prisma', bullet: { level: 0 } }),
        new Paragraph({ text: '• scripts/create-consulting-stripe-products.ts', bullet: { level: 0 } }),
      ],
    },
  ],
});

// Generate the document
const buffer = await Packer.toBuffer(doc);
const outputPath = './Phase5_Consulting_Handoff.docx';
fs.writeFileSync(outputPath, buffer);
console.log(`Handoff document generated: ${outputPath}`);
