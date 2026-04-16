# Zander LLC — Social Account Setup Guide

## Recommended Handles
Primary: @zanderos or @zandersystems
Fallback: @zander_os, @zanderhq

Use consistent handle across all platforms. Check availability before committing.

## Platform Setup

### Facebook Business Page
- URL: https://business.facebook.com/latest/home
- Create as: Business Page (not personal)
- Business name: Zander Systems LLC
- Category: Software Company / Business Service
- Description: AI executive team for small businesses. Your CRO, CMO, EA — and more. One platform, one team.
- Website: zanderos.com
- OAuth App: https://developers.facebook.com — create app for Pages API + Instagram Graph API
- Required scopes: pages_manage_posts, pages_read_engagement, pages_messaging

### Instagram Business Account
- Link to Facebook Business Page (required for business features)
- Switch to Professional Account → Business
- Category: Software
- Same bio/description as Facebook
- OAuth: Uses same Facebook developer app (Instagram Graph API)
- Required scopes: instagram_basic, instagram_content_publish, instagram_manage_comments

### LinkedIn Company Page
- URL: https://www.linkedin.com/company/setup/new/
- Company name: Zander Systems
- URL: linkedin.com/company/zandersystems
- Industry: Software Development
- Company size: 1 employee
- Type: Privately Held
- Description: AI executive team for small businesses
- OAuth App: https://developer.linkedin.com — create app for Marketing API
- Required scopes: w_member_social, r_organization_social, w_organization_social

### TikTok Business Account
- URL: https://www.tiktok.com/signup
- Switch to Business Account in Settings
- Category: Tech & Apps
- OAuth App: https://developers.tiktok.com — Content Publishing API
- Required scopes: video.publish, video.list
- Note: TikTok requires app review before API access

### YouTube Channel
- URL: https://studio.youtube.com
- Create channel as: Zander Systems (use brand account, not personal)
- Handle: @zanderos
- Description: AI executive team for small businesses
- OAuth App: https://console.cloud.google.com — YouTube Data API v3
- Required scopes: youtube.upload, youtube.readonly
- Note: Uses same Google Cloud project as existing Google integrations

### Twitter/X
- URL: https://x.com/i/flow/signup
- Handle: @zanderos
- Bio: AI executive team for small businesses. Built by a founder who ran one for 32 years.
- OAuth App: https://developer.x.com — Twitter API v2
- Required scopes: tweet.read, tweet.write, users.read
- Note: Free tier allows 1,500 tweets/month

## Priority Order for Account Creation
1. Facebook + Instagram (linked, biggest organic reach for ICP)
2. LinkedIn (B2B credibility)
3. YouTube (demo content home)
4. TikTok (short-form founder content)
5. Twitter/X (lowest priority for our ICP)

## API Integration Priority (matches INTEGRATION_ROADMAP.md)
1. LinkedIn OAuth — P1 (strongest B2B signal)
2. Facebook/Instagram Graph API — P2
3. YouTube Data API — P2
4. TikTok Content Publishing — P3
5. Twitter API v2 — P3
