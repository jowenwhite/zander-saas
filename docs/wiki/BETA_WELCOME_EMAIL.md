# Beta Welcome Email

**Purpose:** Sent once to new users immediately after successful registration
**From:** jonathan@zanderos.com
**Reply-To:** jonathan@zanderos.com
**Subject:** Welcome to Zander — and thank you for taking the leap

## Target Audience
Founding Beta users who are small business owners/operators taking a risk on new technology.

## Emotional Tone
- Validating and respectful of their entrepreneurial courage
- Personal and authentic (not corporate)
- Builds trust through transparency about beta status
- Inspiring without being preachy

## Template Location
`apps/api/src/email/templates/beta-welcome.ts`

## Trigger
- Called from `AuthService.register()` after successful user creation
- Only sent once per user (on registration, not login)
- Uses `welcomeEmailSent` flag on User model to prevent duplicates

## Content Structure

### Opening Hook
Personal acknowledgment of the courage it takes to be an entrepreneur.

**Key Line:** "Well done." — Large, bold, and visually prominent. This is the emotional anchor.

### Story Section
Jonathan's personal journey building Zander — relatable pain points about tool sprawl and overwhelm.

### Section: "What you're getting into"
Sets expectations for beta:
- Founding Beta user status
- Acknowledgment that bugs will happen
- Promise of fast response and personal investment

### Section: "The team behind the curtain"
Technology partners and their track records:
- Anthropic (Claude AI)
- AWS (infrastructure)
- Vercel (delivery)

Transparency about shared downtime risks.

### Section: "What I hope Zander becomes for you"
Vision statement — "Freedom for founders"

### Closing
Warm, action-oriented: "Let's get to work."

## Brand Styling
- Background: #0D1117 (dark)
- Text: white/light gray
- Accent: #00D4FF (cyan)
- Logo: Zander compass logo from brand assets
- Signature: Standard Zander dark signature

## Testing
Send test to jonathan@zanderos.com before deployment.

---

**Created:** April 2026
**Author:** Jonathan White / Claude
