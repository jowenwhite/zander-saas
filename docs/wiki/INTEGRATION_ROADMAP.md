# Integration Roadmap

**Last Updated:** 2026-04-16
**Phase:** 4D Marketing Execution
**Status:** Active Planning Document

---

## Overview

This document tracks all integrations that are scaffolded but not yet fully implemented. Each integration includes architecture notes, implementation requirements, and priority level.

---

## 1. Social Media Platform Integrations

### Status: Scaffolded (Adapters + DB Models in Place)

The social media integration architecture is complete:
- Database models: `SocialAccount`, `SocialPost`, `SocialEngagement`
- Service layer: `apps/api/src/cmo/social/social.service.ts`
- Don tools: 6 social media tools implemented
- Agent escalation rules: Defined in Don's system prompt

### Individual Platform Status

| Platform | OAuth Required | API Docs | Priority | Notes |
|----------|---------------|----------|----------|-------|
| **LinkedIn** | Yes | [LinkedIn Marketing API](https://docs.microsoft.com/linkedin/marketing/) | P1 | Primary B2B channel for 64 West |
| **Facebook** | Yes | [Graph API](https://developers.facebook.com/docs/graph-api/) | P2 | Page posts, comments, messenger |
| **Instagram** | Yes (via Facebook) | [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/) | P2 | Requires Facebook Business connection |
| **Twitter/X** | Yes | [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api) | P3 | API access tiers have changed |
| **YouTube** | Yes | [YouTube Data API](https://developers.google.com/youtube/v3) | P4 | Video content when ready |
| **TikTok** | Yes | [TikTok for Business API](https://developers.tiktok.com/) | P4 | Future consideration |

### Implementation Requirements

```typescript
// Each platform adapter needs:
interface PlatformAdapter {
  // OAuth flow
  getAuthUrl(tenantId: string): string;
  handleCallback(code: string): Promise<TokenResponse>;
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  // Publishing
  createPost(accountId: string, content: PostContent): Promise<PostResult>;
  schedulePost(accountId: string, content: PostContent, scheduledFor: Date): Promise<PostResult>;
  deletePost(platformPostId: string): Promise<void>;

  // Engagement
  getComments(postId: string): Promise<Comment[]>;
  replyToComment(commentId: string, reply: string): Promise<Comment>;
  getDirectMessages(): Promise<Message[]>;
  sendDirectMessage(recipientId: string, message: string): Promise<Message>;

  // Analytics
  getPostAnalytics(postId: string): Promise<Analytics>;
  getAccountAnalytics(dateRange: DateRange): Promise<AccountAnalytics>;
}
```

### OAuth Callback Routes Needed

```
POST /api/auth/social/linkedin/callback
POST /api/auth/social/facebook/callback
POST /api/auth/social/twitter/callback
POST /api/auth/social/youtube/callback
POST /api/auth/social/tiktok/callback
```

---

## 2. Design Tool Integrations

### Status: Scaffolded (Adapters in Place)

Architecture complete in `apps/api/src/cmo/design/design.service.ts`:
- Database model: `DesignAsset`
- Canva adapter (placeholder)
- Adobe Creative Cloud adapter (placeholder)
- Don tools: 3 design tools implemented

### Canva Integration

**Priority:** P2
**API:** [Canva Connect API](https://www.canva.dev/docs/connect/)

**Requirements:**
1. Register app in Canva Developer Portal
2. Configure OAuth credentials
3. Implement template browsing
4. Implement design creation from templates
5. Implement asset export (PNG, JPG, PDF)

**Key Endpoints:**
```
GET /v1/designs - List user designs
POST /v1/designs - Create new design
GET /v1/templates - Browse templates
POST /v1/designs/:id/export - Export design
```

### Adobe Creative Cloud Integration

**Priority:** P3
**API:** [Adobe Creative Cloud APIs](https://developer.adobe.com/)

**Requirements:**
1. Register app in Adobe Developer Console
2. Enable Creative SDK
3. Implement asset browsing from CC Libraries
4. Implement export to Asset Library

**Notes:**
- Adobe Express API may be simpler for quick designs
- Full CC integration requires enterprise agreement

---

## 3. AI Image Generation

### Status: Not Started

**Priority:** P2
**Options:**
1. **OpenAI DALL-E 3** - High quality, easy API
2. **Midjourney** - Best quality, no official API (Discord bot workaround)
3. **Stable Diffusion** - Self-hosted option
4. **Replicate** - Hosted SD models

**Implementation Location:**
- Add to `DesignService` as a generation method
- Or create separate `AIImageService`

**Proposed Interface:**
```typescript
interface AIImageService {
  generateImage(prompt: string, options: {
    style?: 'photorealistic' | 'illustration' | 'minimal';
    size?: { width: number; height: number };
    n?: number; // number of variations
  }): Promise<{
    imageUrls: string[];
    revisedPrompt: string;
  }>;
}
```

---

## 4. Campaigns Module Controller

### Status: Deferred (Don Direct Writes Work)

**Priority:** P3

Currently, Don writes directly to the Campaign table via Prisma. A dedicated CampaignsController would provide:
- REST endpoints for CRUD operations
- Webhook triggers for campaign events
- Better separation of concerns

**Why Deferred:**
- Don's direct Prisma writes work fine for MVP
- No immediate need for external API access to campaigns
- Focus resources on social media integrations first

**When to Implement:**
- When building campaign automation workflows
- When integrating with external marketing platforms
- When campaign volume justifies dedicated microservice

---

## 5. Email Service Integrations

### Status: Partially Implemented (SendGrid scaffolded)

**Current State:**
- Email templates: Fully implemented (10 templates seeded)
- Email sending: SendGrid adapter exists but not production-ready

**Needed:**
- Production SendGrid API key configuration
- Email tracking (opens, clicks)
- Bounce handling
- Unsubscribe management

**Alternative Providers to Consider:**
- Resend (modern, developer-friendly)
- Postmark (transactional focus)
- Amazon SES (cost-effective at scale)

---

## 6. Calendar/Scheduling Integrations

### Status: Not Started

**Priority:** P3

**Potential Integrations:**
- Google Calendar sync
- Microsoft Outlook/365 sync
- Calendly integration for discovery calls

**Use Cases:**
- Sync marketing calendar events to team calendars
- Auto-schedule webinars and create calendar invites
- Track meeting attendance and follow-ups

---

## 7. Analytics Integrations

### Status: Not Started

**Priority:** P3

**Potential Integrations:**
- Google Analytics 4 (website traffic)
- Google Search Console (SEO)
- LinkedIn Analytics API
- Facebook Insights API

**Use Cases:**
- Unified marketing dashboard
- Campaign attribution
- ROI tracking

---

## Implementation Priority Matrix

| Priority | Integration | Effort | Business Value | Dependencies |
|----------|-------------|--------|----------------|--------------|
| **P1** | LinkedIn OAuth | Medium | High | None |
| **P2** | Facebook/Instagram OAuth | Medium | High | Facebook Business Account |
| **P2** | Canva Connect | Medium | Medium | Canva Dev Account |
| **P2** | AI Image Generation | Low | Medium | API Key |
| **P3** | Email Service (Production) | Low | High | SendGrid Account |
| **P3** | Twitter OAuth | Medium | Low | Twitter Dev Account |
| **P3** | Adobe CC | High | Low | Adobe Enterprise |
| **P4** | YouTube/TikTok | Medium | Low | Content strategy |
| **P4** | Calendar Sync | Medium | Medium | OAuth setup |
| **P4** | Analytics | Medium | Medium | API access |

---

## Next Steps

1. **Immediate (This Week):**
   - Set up LinkedIn Developer Application
   - Implement LinkedIn OAuth flow
   - Test posting to LinkedIn via API

2. **Short Term (This Month):**
   - Complete Facebook/Instagram OAuth
   - Integrate AI image generation (DALL-E)
   - Production email service configuration

3. **Medium Term (This Quarter):**
   - Canva Connect integration
   - Twitter integration (evaluate new API tiers)
   - Marketing analytics dashboard

---

## Development Notes

### Testing Social Integrations

Each social integration should be tested in sandbox/development mode before production:
- LinkedIn: Use LinkedIn Developer sandbox
- Facebook: Use Facebook Test Users
- Twitter: Use Twitter API sandbox environment

### Security Considerations

- Store OAuth tokens encrypted in database
- Implement token refresh before expiration
- Log all social media actions for audit trail
- Implement rate limiting to avoid API bans

### Monitoring

- Set up alerts for:
  - OAuth token expiration warnings
  - API rate limit approaching
  - Failed post attempts
  - Engagement spike detection (for escalation)

---

*This document will be updated as integrations are implemented.*
