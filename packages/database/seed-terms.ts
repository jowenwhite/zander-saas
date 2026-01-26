import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTerms() {
  const termsContent = `# ZANDER TERMS OF SERVICE

**Version 1.0**
**Effective Date: January 26, 2026**
**Last Updated: January 26, 2026**

---

## 1. AGREEMENT TO TERMS

By accessing or using Zander ("Service"), operated by 64 West Holdings LLC ("Company," "we," "us," or "our"), you ("User," "you," or "your") agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.

**If you do not agree to these Terms, you may not access or use the Service.**

---

## 2. DESCRIPTION OF SERVICE

Zander is a business operations software platform providing:

- **CRO Module**: Customer relationship management, sales pipeline, deal tracking
- **CFO Module**: Financial analytics, reporting, budgeting tools
- **COO Module**: Operations management, workflow automation
- **CMO Module**: Marketing campaign management, analytics
- **CPO Module**: Product management, development tracking
- **CIO Module**: Technology infrastructure management
- **EA Module**: Executive assistant, task management, scheduling

The Service is provided as Software-as-a-Service (SaaS) on a subscription basis.

---

## 3. ACCOUNT REGISTRATION & SECURITY

### 3.1 Account Creation
To use the Service, you must:
- Provide accurate, current, and complete registration information
- Maintain and update your information to keep it accurate
- Be at least 18 years of age
- Have authority to enter into this agreement

### 3.2 Account Security
You are responsible for:
- Maintaining the confidentiality of your login credentials
- All activities that occur under your account
- Immediately notifying us of any unauthorized access or security breach
- Enabling two-factor authentication when available (strongly recommended)

### 3.3 Account Termination
We reserve the right to suspend or terminate accounts that:
- Violate these Terms
- Engage in fraudulent or illegal activity
- Remain inactive for extended periods (with prior notice)
- Fail to pay subscription fees when due

---

## 4. SUBSCRIPTION & PAYMENT TERMS

### 4.1 Subscription Plans
- Subscriptions are billed monthly or annually as selected
- Pricing is subject to change with 30 days' notice
- Changes to your plan take effect at the next billing cycle

### 4.2 Payment
- Payment is due at the beginning of each billing period
- All fees are non-refundable except as required by law
- Failed payments may result in service suspension
- You authorize us to charge your designated payment method

### 4.3 Taxes
You are responsible for all applicable taxes. Stated prices do not include taxes unless explicitly noted.

### 4.4 Refund Policy
- Annual subscriptions: Pro-rata refund within first 30 days only
- Monthly subscriptions: No refunds for partial months
- Refund requests must be submitted in writing to support@zanderos.com

---

## 5. DATA OWNERSHIP & PRIVACY

### 5.1 Your Data
- **You retain all ownership rights** to data you input into the Service ("User Data")
- We do not claim ownership of your User Data
- Upon termination, you may export your data for 30 days before deletion

### 5.2 Our Use of Your Data
We may access your User Data only to:
- Provide and maintain the Service
- Respond to support requests
- Comply with legal obligations
- Prevent fraud or security threats

### 5.3 Data Protection
We implement industry-standard security measures including:
- Encryption in transit (TLS/SSL) and at rest
- Regular security audits
- Access controls and authentication
- Automated backups

### 5.4 Multi-Tenant Architecture
The Service operates on a multi-tenant architecture. Your data is logically isolated from other users. We implement strict tenant separation controls to prevent unauthorized cross-tenant data access.

### 5.5 Privacy Policy
Our collection and use of personal information is governed by our Privacy Policy, incorporated herein by reference. Please review it at [zanderos.com/privacy].

---

## 6. ACCEPTABLE USE POLICY

### 6.1 Permitted Use
The Service is intended for lawful business operations only.

### 6.2 Prohibited Activities
You agree NOT to:
- Violate any applicable laws or regulations
- Infringe on intellectual property rights of others
- Upload malicious code, viruses, or harmful content
- Attempt to gain unauthorized access to the Service or other accounts
- Reverse engineer, decompile, or disassemble the Service
- Use the Service to send spam or unsolicited communications
- Share login credentials with unauthorized parties
- Resell or redistribute the Service without authorization
- Use the Service to store or process illegal content
- Intentionally overload or disrupt Service infrastructure
- Scrape, harvest, or collect data from the Service without permission

### 6.3 Enforcement
Violations may result in immediate suspension or termination without refund.

---

## 7. INTELLECTUAL PROPERTY

### 7.1 Our Intellectual Property
The Service, including all software, designs, text, graphics, interfaces, and trademarks, is owned by 64 West Holdings LLC and protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable license to use the Service during your subscription.

### 7.2 Feedback
Any suggestions, feedback, or ideas you provide about the Service become our property and may be used without compensation or attribution.

### 7.3 Third-Party Components
The Service may include third-party software components subject to their own licenses.

---

## 8. THIRD-PARTY INTEGRATIONS

### 8.1 Available Integrations
The Service may integrate with third-party services including:
- Email providers (Gmail, Microsoft Outlook)
- Payment processors (Stripe)
- Accounting software (QuickBooks)
- Communication platforms
- Other business tools

### 8.2 Third-Party Terms
Your use of third-party integrations is subject to those providers' terms of service. We are not responsible for third-party services' availability, accuracy, or security.

### 8.3 API Access
API access is subject to rate limits and usage policies. Abuse of API access may result in throttling or suspension.

---

## 9. SERVICE AVAILABILITY & SUPPORT

### 9.1 Availability
- We target 99.9% uptime but do not guarantee uninterrupted service
- Scheduled maintenance will be announced in advance when possible
- Emergency maintenance may occur without notice

### 9.2 Support
- Support is available via email at support@zanderos.com
- Response times vary by subscription tier
- Support covers Service functionality, not general business advice

### 9.3 Modifications
We reserve the right to modify, update, or discontinue features with reasonable notice. Material changes affecting your use will be communicated in advance.

---

## 10. DISCLAIMER OF WARRANTIES

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR COMPLETENESS OF DATA
- UNINTERRUPTED OR ERROR-FREE OPERATION

WE DO NOT WARRANT THAT THE SERVICE WILL MEET YOUR SPECIFIC REQUIREMENTS OR THAT ANY ERRORS WILL BE CORRECTED.

---

## 11. LIMITATION OF LIABILITY

### 11.1 Exclusion of Damages
TO THE MAXIMUM EXTENT PERMITTED BY LAW, 64 WEST HOLDINGS LLC SHALL NOT BE LIABLE FOR:

- INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
- LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES
- COST OF SUBSTITUTE SERVICES
- DAMAGES ARISING FROM SERVICE INTERRUPTION OR DATA LOSS

### 11.2 Cap on Liability
OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

### 11.3 Exceptions
Some jurisdictions do not allow limitation of certain damages. In such cases, limitations apply to the fullest extent permitted by law.

---

## 12. INDEMNIFICATION

You agree to indemnify, defend, and hold harmless 64 West Holdings LLC, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorney fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any third-party rights
- Your User Data or content
- Any disputes between you and your customers or users

---

## 13. CONFIDENTIALITY

### 13.1 Confidential Information
Both parties agree to protect confidential information disclosed during the relationship, including:
- Business strategies and plans
- Technical specifications
- Customer lists and data
- Pricing and financial information

### 13.2 Exclusions
Confidentiality obligations do not apply to information that:
- Is publicly available through no fault of the receiving party
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

---

## 14. DISPUTE RESOLUTION

### 14.1 Governing Law
These Terms are governed by the laws of the State of Georgia, USA, without regard to conflict of law principles.

### 14.2 Informal Resolution
Before filing any legal claim, you agree to attempt informal resolution by contacting us at legal@zanderos.com. We will attempt to resolve disputes within 30 days.

### 14.3 Arbitration
Any disputes not resolved informally shall be settled by binding arbitration in accordance with the American Arbitration Association rules. Arbitration shall occur in Atlanta, Georgia, USA.

### 14.4 Class Action Waiver
YOU AGREE TO RESOLVE DISPUTES ONLY ON AN INDIVIDUAL BASIS AND WAIVE ANY RIGHT TO PARTICIPATE IN CLASS ACTIONS OR CLASS-WIDE ARBITRATION.

### 14.5 Exceptions
Either party may seek injunctive relief in court for intellectual property violations or unauthorized access.

---

## 15. TERM & TERMINATION

### 15.1 Term
These Terms remain in effect while you use the Service.

### 15.2 Termination by You
You may terminate your account at any time through account settings or by contacting support. Termination does not entitle you to refunds for prepaid periods.

### 15.3 Termination by Us
We may terminate or suspend your account:
- Immediately for Terms violations
- With 30 days' notice for any other reason
- Immediately if required by law

### 15.4 Effect of Termination
Upon termination:
- Your access to the Service ends immediately
- You have 30 days to export your User Data
- After 30 days, your data will be permanently deleted
- Provisions that should survive termination will remain in effect

---

## 16. GENERAL PROVISIONS

### 16.1 Entire Agreement
These Terms, together with our Privacy Policy, constitute the entire agreement between you and 64 West Holdings LLC regarding the Service.

### 16.2 Severability
If any provision is found unenforceable, the remaining provisions remain in full effect.

### 16.3 Waiver
Failure to enforce any provision does not constitute a waiver of that provision.

### 16.4 Assignment
You may not assign these Terms without our written consent. We may assign our rights and obligations freely.

### 16.5 Notices
Notices to you will be sent to your registered email address. Notices to us should be sent to legal@zanderos.com.

### 16.6 Force Majeure
We are not liable for failures or delays caused by circumstances beyond our reasonable control.

### 16.7 Updates to Terms
We may update these Terms with 30 days' notice. Continued use after changes constitutes acceptance. Material changes will require explicit re-acceptance.

---

## 17. CONTACT INFORMATION

**64 West Holdings LLC**

- **General Inquiries**: hello@zanderos.com
- **Support**: support@zanderos.com
- **Legal**: legal@zanderos.com
- **Website**: https://zanderos.com

---

## 18. ACKNOWLEDGMENT

BY CLICKING "I ACCEPT" OR BY ACCESSING OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.

---

*© 2026 64 West Holdings LLC. All rights reserved.*`;

  const terms = await prisma.termsVersion.upsert({
    where: { version: '1.0' },
    update: {
      content: termsContent,
      effectiveDate: new Date('2026-01-26'),
    },
    create: {
      version: '1.0',
      effectiveDate: new Date('2026-01-26'),
      content: termsContent,
    }
  });

  console.log('Terms seeded:', { id: terms.id, version: terms.version, effectiveDate: terms.effectiveDate });
}

seedTerms()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
