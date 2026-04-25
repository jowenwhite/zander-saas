/**
 * Generate Microsoft OAuth Integration Handoff Document
 * Run with: node scripts/generate-microsoft-oauth-handoff.mjs
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
  AlignmentType,
} from 'docx';
import * as fs from 'fs';

const today = new Date().toISOString().split('T')[0];

const doc = new Document({
  title: 'Zander Microsoft Outlook OAuth Integration - Deployment Handoff',
  description: 'Session handoff document for v88 Microsoft Outlook integration',
  sections: [
    {
      children: [
        new Paragraph({
          text: 'ZANDER — MICROSOFT OUTLOOK OAUTH INTEGRATION',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: 'Deployment Handoff — v88',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: `Date: ${today}`, italics: true })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: '' }),

        // Production State
        new Paragraph({ text: 'PRODUCTION STATE', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ text: 'Item', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('API Docker Image')] }),
              new TableCell({ children: [new Paragraph('zander-api:v88')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('ECR Repository')] }),
              new TableCell({ children: [new Paragraph('288720721534.dkr.ecr.us-east-1.amazonaws.com/zander-api')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('ECS Task Definition')] }),
              new TableCell({ children: [new Paragraph('zander-api:75')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Git Commits (this session)')] }),
              new TableCell({ children: [new Paragraph('0e969b0, f4c1474, ca1b8b5, c7c29ff')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('API Health')] }),
              new TableCell({ children: [new Paragraph('https://api.zanderos.com/health → {"status":"ok"}')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Deployed')] }),
              new TableCell({ children: [new Paragraph('2026-04-25')] }),
            ]}),
          ],
        }),
        new Paragraph({ text: '' }),

        // Azure AD App
        new Paragraph({ text: 'AZURE AD APP — CRITICAL', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Zander Systems has its own Azure AD app registration — DO NOT use the MCFOS app.', bold: true }),
        new Paragraph({ text: '' }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ text: 'Credential', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('MICROSOFT_CLIENT_ID (Zander)')] }),
              new TableCell({ children: [new Paragraph('c7588ee7-69ed-4c2c-b1a5-0d70507a800b')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('MICROSOFT_CLIENT_ID (MCFOS — WRONG for Zander)')] }),
              new TableCell({ children: [new Paragraph('b1ffa2d0-77c2-439a-9fbd-8517fefd01b0')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Production Redirect URI')] }),
              new TableCell({ children: [new Paragraph('https://api.zanderos.com/integrations/microsoft/callback')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Local Redirect URI')] }),
              new TableCell({ children: [new Paragraph('http://localhost:3001/integrations/microsoft/callback')] }),
            ]}),
          ],
        }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Both redirect URIs are registered in the Azure AD app. The local URI is for development only.' }),
        new Paragraph({ text: '' }),

        // What Shipped
        new Paragraph({ text: 'WHAT SHIPPED', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Backend — Tenant-Scoped Microsoft OAuth', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• apps/api/src/integrations/microsoft/microsoft-oauth.service.ts — OAuth flow, JWT-signed state, token refresh', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/integrations/microsoft/microsoft-oauth.controller.ts — GET /integrations/microsoft/auth (browser redirect), callback, status, disconnect', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/integrations/microsoft/microsoft-graph.service.ts — syncInbox, createEvent, listEvents, deleteEvent, isConnected', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/integrations/microsoft/microsoft.module.ts — MicrosoftIntegrationModule', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/integrations/email-calendar/email-calendar-provider.service.ts — getActiveProvider(tenantId, userId)', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Backend — Provider-Aware Gmail/Outlook Routing', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• apps/api/src/auth/google/gmail.controller.ts — POST /gmail/sync routes to Outlook if IntegrationConnection microsoft exists, else Gmail', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/calendar-events/calendar-events.service.ts — Outlook Calendar sync block added alongside Google Calendar', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/api/src/integrations/integrations.controller.ts — Microsoft entry in getAllIntegrations() platforms array', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Frontend — Settings > Integrations', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• apps/web/app/settings/integrations/page.tsx', bullet: { level: 0 } }),
        new Paragraph({ text: '  - microsoft=connected / error=... banner handling on OAuth return', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Microsoft connect uses GET redirect (window.location.href) not POST — required for browser OAuth flow', bullet: { level: 1 } }),
        new Paragraph({ text: '  - JWT token passed as ?token= query param (Authorization header not possible for redirects)', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Mutual exclusion: only one email provider (Google OR Microsoft) per tenant at a time', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Connected email address displayed in metadata.email', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Microsoft icon: 4-colored SVG squares', bullet: { level: 1 } }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Frontend — Pam Context', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• apps/web/app/api/ea/pam/route.ts — EMAIL PROVIDER section added to buildExecutiveAssistantContext', bullet: { level: 0 } }),
        new Paragraph({ text: '  - Fetches /gmail/status at context build time', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Shows active provider name and email, or "Not connected" if neither is active', bullet: { level: 1 } }),
        new Paragraph({ text: '  - Instructs Pam to use sync_gmail_inbox regardless of which provider is active', bullet: { level: 1 } }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Frontend — Bug Fixes', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• apps/web/app/cmo/ai/page.tsx — Removed banned <style jsx>, replaced with plain <style> + namespaced don-pulse / don-spin keyframes', bullet: { level: 0 } }),
        new Paragraph({ text: '• apps/web/app/ea/page.tsx — Removed banned <style jsx>, replaced with plain <style> + namespaced pam-pulse keyframe', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Architecture Notes
        new Paragraph({ text: 'ARCHITECTURE NOTES', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Two Microsoft OAuth flows coexist:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• User-scoped: auth/microsoft/ → MicrosoftToken table — individual user sign-in', bullet: { level: 0 } }),
        new Paragraph({ text: '• Tenant-scoped: integrations/microsoft/ → IntegrationConnection table — organizational email/calendar connection', bullet: { level: 0 } }),
        new Paragraph({ text: 'Both use the same Azure AD app (c7588ee7) with different redirect URIs registered.', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Provider dispatch is transparent to Pam:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: 'Pam always calls sync_gmail_inbox. GmailController checks IntegrationConnection for provider=microsoft first; if found, routes to MicrosoftGraphService. Otherwise falls back to GoogleToken/GmailService. No Pam tool changes required for provider switching.', }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'Circular dependency avoidance:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: 'MicrosoftGraphService and PrismaService are injected directly into GmailController for provider routing — EmailCalendarProviderService is NOT used there, avoiding a GoogleAuthModule ↔ EmailCalendarProviderModule circular dependency.', }),
        new Paragraph({ text: '' }),

        new Paragraph({ text: 'IntegrationConnection uniqueness:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '@@unique([tenantId, provider]) — one connection record per tenant per provider. Upsert on connect ensures idempotency.', }),
        new Paragraph({ text: '' }),

        // New Env Vars in ECS Task Def
        new Paragraph({ text: 'ENV VARS ADDED TO ECS TASK DEFINITION (v88 → task def :75)', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ text: 'Variable', bold: true })] }),
              new TableCell({ children: [new Paragraph({ text: 'Notes', bold: true })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('MICROSOFT_CLIENT_ID')] }),
              new TableCell({ children: [new Paragraph('c7588ee7 — Zander Systems Azure AD app')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('MICROSOFT_CLIENT_SECRET')] }),
              new TableCell({ children: [new Paragraph('Zander Systems Azure AD app secret')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('MICROSOFT_CALLBACK_URL')] }),
              new TableCell({ children: [new Paragraph('https://api.zanderos.com/integrations/microsoft/callback')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('RESEND_WEBHOOK_SECRET')] }),
              new TableCell({ children: [new Paragraph('(stored in ECS task definition — see task def :75)')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('CANVA_CLIENT_ID')] }),
              new TableCell({ children: [new Paragraph('(stored in ECS task definition — see task def :75)')] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('CANVA_CLIENT_SECRET')] }),
              new TableCell({ children: [new Paragraph('(stored in ECS task definition — see task def :75)')] }),
            ]}),
          ],
        }),
        new Paragraph({ text: '' }),

        // Outstanding Items
        new Paragraph({ text: 'OUTSTANDING ITEMS', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '1. End-to-end Microsoft OAuth test not yet performed in production (requires a real Microsoft account to connect)', bullet: { level: 0 } }),
        new Paragraph({ text: '2. Outlook Calendar sync double-sync prevention: fires only if no GoogleToken exists — verify in production once a real Outlook connection is live', bullet: { level: 0 } }),
        new Paragraph({ text: '3. Microsoft token refresh on 401: invalidation sets expiresAt = new Date(0) then retries — not yet exercised in production', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Verification Results
        new Paragraph({ text: 'PHASE 2 VERIFICATION RESULTS', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Conversation Persistence:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• Pam (apps/web/app/ea/page.tsx): sessionStorage key pam_chat_history — verified working', bullet: { level: 0 } }),
        new Paragraph({ text: '• Don (apps/web/app/cmo/ai/page.tsx): sessionStorage key don_chat_history — verified working', bullet: { level: 0 } }),
        new Paragraph({ text: '• SessionStorage is intentional design: tab-scoped, clears on tab close', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'CMO Dashboard Data:', heading: HeadingLevel.HEADING_2 }),
        new Paragraph({ text: '• All API calls verified real (no hardcoded data)', bullet: { level: 0 } }),
        new Paragraph({ text: '• cmo/dashboard/metrics — 200 OK', bullet: { level: 0 } }),
        new Paragraph({ text: '• cmo/funnels/overview — 200 OK', bullet: { level: 0 } }),
        new Paragraph({ text: '• cmo/insights/recommendations — 200 OK', bullet: { level: 0 } }),
        new Paragraph({ text: '' }),

        // Next Session Priorities
        new Paragraph({ text: 'NEXT SESSION PRIORITIES', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: '1. Test Outlook OAuth connect flow end-to-end in production with a real Microsoft account', bullet: { level: 0 } }),
        new Paragraph({ text: '2. Verify Pam routes sync_gmail_inbox to Outlook after Microsoft connection', bullet: { level: 0 } }),
        new Paragraph({ text: '3. Verify mutual exclusion in Settings > Integrations UI disables Google connect when Outlook is active', bullet: { level: 0 } }),
        new Paragraph({ text: '4. Test Microsoft Calendar sync through CalendarEventsService', bullet: { level: 0 } }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
const outputPath = './Microsoft_OAuth_Handoff_v88.docx';
fs.writeFileSync(outputPath, buffer);
console.log(`Handoff document generated: ${outputPath}`);
