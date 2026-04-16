import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Phase 4C Marketing Content Seed
 *
 * Adds to existing marketing content:
 * - 5 additional campaigns (total 11)
 * - 22 additional calendar events (total 30-day calendar)
 * - 10 email templates
 * - Social post drafts
 */
async function main() {
  console.log('Starting Phase 4C marketing content seed...\n');

  // Find 64 West Holdings tenant
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: '64west' },
  });

  if (!tenant) {
    console.error('64 West Holdings tenant not found. Run seed-marketing.ts first.');
    process.exit(1);
  }

  console.log(`Found tenant: ${tenant.companyName} (${tenant.id})`);

  // Find admin user
  const user = await prisma.user.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!user) {
    console.error('No user found for tenant. Run seed-marketing.ts first.');
    process.exit(1);
  }

  // ==========================================
  // ADDITIONAL CAMPAIGNS (5 more for total of 11)
  // ==========================================
  console.log('\nSeeding additional campaigns...');

  const additionalCampaigns = [
    {
      name: 'Thought Leadership Series',
      description: 'LinkedIn article series establishing 64 West as thought leaders in business consulting and fractional executive services',
      businessUnit: 'consulting',
      status: 'active',
      type: 'multi',
      channels: ['linkedin', 'email', 'content'],
      goal: 'Generate 100 LinkedIn followers and 15 inbound inquiries per month',
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'CFO Office Hours Webinar Series',
      description: 'Monthly webinar series offering free CFO advice sessions to attract fractional CFO clients',
      businessUnit: 'consulting',
      status: 'active',
      type: 'multi',
      channels: ['webinar', 'email', 'linkedin'],
      goal: 'Host 12 webinars with 50+ attendees each, convert 10% to consultations',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Case Study Showcase',
      description: 'Client success stories highlighting ROI from consulting engagements across all service lines',
      businessUnit: 'consulting',
      status: 'draft',
      type: 'multi',
      channels: ['email', 'content', 'social'],
      goal: 'Publish 6 case studies, generate 200 downloads and 25 discovery calls',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Strategic Planning Workshop Promotion',
      description: 'Promote quarterly strategic planning workshops for SMB leadership teams',
      businessUnit: 'consulting',
      status: 'active',
      type: 'multi',
      channels: ['email', 'linkedin', 'direct'],
      goal: 'Fill 4 workshops with 15 participants each at $2,500/seat',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Referral Partner Program Launch',
      description: 'Launch and promote referral program for CPAs, attorneys, and business advisors',
      businessUnit: 'consulting',
      status: 'draft',
      type: 'multi',
      channels: ['email', 'direct', 'events'],
      goal: 'Recruit 20 referral partners, generate 30 qualified referrals in Q1',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const campaign of additionalCampaigns) {
    const existing = await prisma.campaign.findFirst({
      where: { tenantId: tenant.id, name: campaign.name },
    });

    if (!existing) {
      await prisma.campaign.create({
        data: {
          tenantId: tenant.id,
          ...campaign,
        },
      });
      console.log(`  Created campaign: ${campaign.name}`);
    } else {
      console.log(`  Campaign already exists: ${campaign.name}`);
    }
  }

  // ==========================================
  // EMAIL TEMPLATES (10 templates)
  // ==========================================
  console.log('\nSeeding email templates...');

  const emailTemplates = [
    {
      name: 'Welcome Email - New Lead',
      subject: 'Welcome to 64 West Holdings',
      body: `Hi {{firstName}},

Thank you for your interest in 64 West Holdings. We're excited to connect with you.

At 64 West, we help businesses like yours grow through strategic consulting, flexible financing solutions, and innovative technology. Whether you're looking for fractional executive support, need help scaling your operations, or want to explore financing options, we're here to help.

Here's what you can expect from us:
• Personalized guidance based on your business needs
• Access to our team of experienced consultants and advisors
• Regular insights and resources to help you grow

If you have any questions or want to schedule a discovery call, simply reply to this email or book a time directly on my calendar: {{calendarLink}}

Looking forward to learning more about your business.

Best regards,
{{senderName}}
64 West Holdings`,
      type: 'email',
      category: 'nurture',
      stage: 'awareness',
      status: 'active',
      variables: JSON.stringify(['firstName', 'senderName', 'calendarLink']),
    },
    {
      name: 'Discovery Call Follow-up',
      subject: 'Great connecting with you, {{firstName}}',
      body: `Hi {{firstName}},

Thank you for taking the time to speak with me today. I enjoyed learning about {{companyName}} and the challenges you're facing.

As we discussed, here are the key areas we identified:
{{keyPoints}}

Based on our conversation, I believe we can help you {{proposedOutcome}}.

Next steps:
1. I'll prepare a tailored proposal outlining our recommended approach
2. We'll schedule a follow-up call to review the proposal together
3. If it makes sense for both sides, we'll kick off the engagement

In the meantime, I've attached a case study from a similar client that might be helpful.

Let me know if you have any questions!

Best,
{{senderName}}`,
      type: 'email',
      category: 'sales',
      stage: 'interest',
      status: 'active',
      variables: JSON.stringify(['firstName', 'companyName', 'keyPoints', 'proposedOutcome', 'senderName']),
    },
    {
      name: 'Proposal Delivery',
      subject: 'Your Custom Proposal from 64 West Holdings',
      body: `Hi {{firstName}},

As promised, I've prepared a customized proposal for {{companyName}} based on our discovery conversation.

**Proposal Summary:**
{{proposalSummary}}

**Investment:** {{investmentAmount}}
**Timeline:** {{timeline}}

The attached document includes our full methodology, deliverables, and terms.

I'd love to schedule a 30-minute call to walk through this together and answer any questions. Would {{proposedDate}} work for you?

Looking forward to potentially working together.

Best regards,
{{senderName}}
64 West Holdings`,
      type: 'email',
      category: 'sales',
      stage: 'decision',
      status: 'active',
      variables: JSON.stringify(['firstName', 'companyName', 'proposalSummary', 'investmentAmount', 'timeline', 'proposedDate', 'senderName']),
    },
    {
      name: 'Webinar Invitation',
      subject: 'You\'re Invited: {{webinarTitle}}',
      body: `Hi {{firstName}},

You're invited to our upcoming webinar:

**{{webinarTitle}}**
📅 {{webinarDate}}
🕐 {{webinarTime}}
💻 Online (link will be sent upon registration)

**What You'll Learn:**
{{learningPoints}}

**Who Should Attend:**
This webinar is perfect for business owners, executives, and leaders who want to {{targetAudience}}.

**Register Now:** {{registrationLink}}

Space is limited to ensure an interactive experience, so reserve your spot today.

Can't make it live? Register anyway and we'll send you the recording.

See you there!
{{senderName}}
64 West Holdings`,
      type: 'email',
      category: 'event',
      stage: 'awareness',
      status: 'active',
      variables: JSON.stringify(['firstName', 'webinarTitle', 'webinarDate', 'webinarTime', 'learningPoints', 'targetAudience', 'registrationLink', 'senderName']),
    },
    {
      name: 'Webinar Reminder - 24 Hours',
      subject: 'Tomorrow: {{webinarTitle}}',
      body: `Hi {{firstName}},

Just a friendly reminder that our webinar is tomorrow!

**{{webinarTitle}}**
📅 {{webinarDate}}
🕐 {{webinarTime}}

**Join Link:** {{joinLink}}

**Quick Tips:**
• Join 5 minutes early to test your audio/video
• Have questions ready - we'll have Q&A at the end
• Download our prep worksheet: {{worksheetLink}}

See you tomorrow!
{{senderName}}`,
      type: 'email',
      category: 'event',
      stage: 'awareness',
      status: 'active',
      variables: JSON.stringify(['firstName', 'webinarTitle', 'webinarDate', 'webinarTime', 'joinLink', 'worksheetLink', 'senderName']),
    },
    {
      name: 'Webinar Recording + Resources',
      subject: 'Recording: {{webinarTitle}} + Bonus Resources',
      body: `Hi {{firstName}},

Thank you for attending "{{webinarTitle}}"!

As promised, here are your resources:

📹 **Webinar Recording:** {{recordingLink}}
📄 **Slides:** {{slidesLink}}
📋 **Worksheet:** {{worksheetLink}}

**Key Takeaways:**
{{keyTakeaways}}

**Ready to Take the Next Step?**
If you'd like to discuss how these strategies apply to your business, I'd be happy to schedule a complimentary 30-minute consultation.

👉 Book a call: {{calendarLink}}

Thanks again for joining us!
{{senderName}}
64 West Holdings`,
      type: 'email',
      category: 'event',
      stage: 'interest',
      status: 'active',
      variables: JSON.stringify(['firstName', 'webinarTitle', 'recordingLink', 'slidesLink', 'worksheetLink', 'keyTakeaways', 'calendarLink', 'senderName']),
    },
    {
      name: 'Monthly Newsletter',
      subject: '{{monthName}} Insights from 64 West Holdings',
      body: `Hi {{firstName}},

Here's what's happening at 64 West Holdings this month:

**📰 Featured Article:**
{{featuredArticleTitle}}
{{featuredArticleSummary}}
Read more: {{featuredArticleLink}}

**📊 Business Tip of the Month:**
{{tipOfMonth}}

**📅 Upcoming Events:**
{{upcomingEvents}}

**🎯 Client Spotlight:**
{{clientSpotlight}}

**💡 Quick Win:**
{{quickWin}}

Questions or ideas for future content? Just reply to this email - we read every response.

To your success,
The 64 West Holdings Team`,
      type: 'email',
      category: 'newsletter',
      stage: 'retention',
      status: 'active',
      variables: JSON.stringify(['firstName', 'monthName', 'featuredArticleTitle', 'featuredArticleSummary', 'featuredArticleLink', 'tipOfMonth', 'upcomingEvents', 'clientSpotlight', 'quickWin']),
    },
    {
      name: 'Case Study Delivery',
      subject: 'Case Study: How {{clientName}} Achieved {{result}}',
      body: `Hi {{firstName}},

I wanted to share a recent success story that might resonate with you.

**Client:** {{clientName}}
**Industry:** {{clientIndustry}}
**Challenge:** {{clientChallenge}}

**What We Did:**
{{solution}}

**Results:**
{{results}}

**Timeline:** {{timeline}}

📥 **Download the Full Case Study:** {{downloadLink}}

Does this sound like something that could help {{companyName}}? I'd be happy to discuss how we achieved these results and whether a similar approach might work for you.

Let me know if you'd like to chat.

Best,
{{senderName}}`,
      type: 'email',
      category: 'nurture',
      stage: 'interest',
      status: 'active',
      variables: JSON.stringify(['firstName', 'clientName', 'clientIndustry', 'clientChallenge', 'solution', 'results', 'timeline', 'downloadLink', 'companyName', 'senderName']),
    },
    {
      name: 'Re-engagement - Dormant Lead',
      subject: 'Still thinking about {{topic}}, {{firstName}}?',
      body: `Hi {{firstName}},

It's been a while since we last connected, and I wanted to check in.

When we last spoke, you were exploring {{topic}}. I'm curious if that's still on your radar or if your priorities have shifted.

Since then, we've helped several businesses like yours:
{{recentWins}}

No pressure at all - I just wanted to make sure you have access to any resources that might help.

If you'd like to reconnect, I'm happy to schedule a quick call: {{calendarLink}}

Either way, I hope your business is thriving!

Best,
{{senderName}}`,
      type: 'email',
      category: 'nurture',
      stage: 'decision',
      status: 'active',
      variables: JSON.stringify(['firstName', 'topic', 'recentWins', 'calendarLink', 'senderName']),
    },
    {
      name: 'Referral Request',
      subject: 'Quick favor, {{firstName}}?',
      body: `Hi {{firstName}},

I hope you're doing well! It's been great working with you on {{projectName}}.

I have a quick ask: Do you know anyone who might benefit from the kind of help we provided to you?

We're specifically looking to connect with:
{{idealReferralProfile}}

If someone comes to mind, I'd be grateful for an introduction. You can simply reply to this email with their name and email, or forward this message to them directly.

As a thank you for any referral that becomes a client, we offer {{referralIncentive}}.

No pressure at all - I just know that the best clients often come from referrals from great clients like you.

Thanks for considering it!

Best,
{{senderName}}`,
      type: 'email',
      category: 'referral',
      stage: 'retention',
      status: 'active',
      variables: JSON.stringify(['firstName', 'projectName', 'idealReferralProfile', 'referralIncentive', 'senderName']),
    },
  ];

  for (const template of emailTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { tenantId: tenant.id, name: template.name },
    });

    if (!existing) {
      await prisma.emailTemplate.create({
        data: {
          tenantId: tenant.id,
          ...template,
        },
      });
      console.log(`  Created template: ${template.name}`);
    } else {
      console.log(`  Template already exists: ${template.name}`);
    }
  }

  // ==========================================
  // ADDITIONAL CALENDAR EVENTS (22 more for 30-day calendar)
  // ==========================================
  console.log('\nSeeding additional calendar events...');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const getDateThisMonth = (day: number, hour: number = 10) => {
    return new Date(currentYear, currentMonth - 1, day, hour, 0, 0);
  };

  const additionalCalendarEvents = [
    // Week 1
    {
      title: 'LinkedIn Post: Industry Insight',
      description: 'Share thought leadership content about current consulting industry trends',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(1, 9),
      endTime: getDateThisMonth(1, 10),
      marketingChannel: 'linkedin',
      contentStatus: 'scheduled',
    },
    {
      title: 'Client Success Story Draft',
      description: 'Draft case study for recent fractional CFO engagement',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(2, 14),
      endTime: getDateThisMonth(2, 16),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Newsletter Content Planning',
      description: 'Plan content topics for next month newsletter',
      eventType: 'meeting',
      category: 'internal',
      startTime: getDateThisMonth(4, 10),
      endTime: getDateThisMonth(4, 11),
      marketingChannel: null,
      contentStatus: null,
    },
    // Week 2
    {
      title: 'Facebook: Small Business Tip',
      description: 'Share weekly small business tip with link to blog',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(7, 11),
      endTime: getDateThisMonth(7, 12),
      marketingChannel: 'facebook',
      contentStatus: 'draft',
    },
    {
      title: 'Blog Post: Strategic Planning Guide',
      description: 'Publish comprehensive guide to annual strategic planning',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(9, 10),
      endTime: getDateThisMonth(9, 11),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Email: Webinar Announcement',
      description: 'Send webinar invitation to prospect list',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(11, 9),
      endTime: getDateThisMonth(11, 10),
      marketingChannel: 'email',
      contentStatus: 'scheduled',
    },
    {
      title: 'LinkedIn Post: Behind the Scenes',
      description: 'Share team culture and client work highlights',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(12, 14),
      endTime: getDateThisMonth(12, 15),
      marketingChannel: 'linkedin',
      contentStatus: 'draft',
    },
    // Week 3
    {
      title: 'Partner Webinar Co-Host',
      description: 'Joint webinar with CPA partner on financial planning for SMBs',
      eventType: 'meeting',
      category: 'event',
      startTime: getDateThisMonth(14, 13),
      endTime: getDateThisMonth(14, 14),
      marketingChannel: 'webinar',
      contentStatus: 'scheduled',
    },
    {
      title: 'Case Study Publication',
      description: 'Publish approved case study to website and promote',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(16, 10),
      endTime: getDateThisMonth(16, 11),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Email: Case Study Promotion',
      description: 'Send case study to nurture list',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(18, 9),
      endTime: getDateThisMonth(18, 10),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Instagram: Quote Graphic',
      description: 'Share motivational business quote with branded graphic',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(19, 11),
      endTime: getDateThisMonth(19, 12),
      marketingChannel: 'instagram',
      contentStatus: 'draft',
    },
    // Week 4
    {
      title: 'LinkedIn Article: CFO Insights',
      description: 'Publish long-form article on fractional CFO value proposition',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(21, 10),
      endTime: getDateThisMonth(21, 12),
      marketingChannel: 'linkedin',
      contentStatus: 'draft',
    },
    {
      title: 'Referral Partner Outreach',
      description: 'Send personalized outreach to 5 potential referral partners',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(23, 10),
      endTime: getDateThisMonth(23, 11),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Facebook: Client Testimonial',
      description: 'Share video testimonial from satisfied consulting client',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(24, 14),
      endTime: getDateThisMonth(24, 15),
      marketingChannel: 'facebook',
      contentStatus: 'draft',
    },
    {
      title: 'Email: Monthly Newsletter',
      description: 'Send monthly newsletter to full subscriber list',
      eventType: 'task',
      category: 'newsletter',
      startTime: getDateThisMonth(26, 9),
      endTime: getDateThisMonth(26, 10),
      marketingChannel: 'email',
      contentStatus: 'scheduled',
    },
    {
      title: 'LinkedIn Post: Team Highlight',
      description: 'Spotlight a team member and their expertise',
      eventType: 'task',
      category: 'social',
      startTime: getDateThisMonth(27, 11),
      endTime: getDateThisMonth(27, 12),
      marketingChannel: 'linkedin',
      contentStatus: 'draft',
    },
    // End of month
    {
      title: 'Blog Post: Industry Trends',
      description: 'Publish monthly industry trends analysis',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(28, 10),
      endTime: getDateThisMonth(28, 11),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Email: Re-engagement Campaign',
      description: 'Send re-engagement email to dormant leads (90+ days)',
      eventType: 'task',
      category: 'campaign',
      startTime: getDateThisMonth(29, 9),
      endTime: getDateThisMonth(29, 10),
      marketingChannel: 'email',
      contentStatus: 'draft',
    },
    {
      title: 'Social Media Scheduling',
      description: 'Schedule all social posts for next month',
      eventType: 'task',
      category: 'planning',
      startTime: getDateThisMonth(30, 14),
      endTime: getDateThisMonth(30, 16),
      marketingChannel: 'social',
      contentStatus: null,
    },
    // Additional strategic tasks
    {
      title: 'Lead Magnet Creation',
      description: 'Create downloadable checklist: "10 Signs You Need a Fractional CFO"',
      eventType: 'task',
      category: 'content',
      startTime: getDateThisMonth(6, 10),
      endTime: getDateThisMonth(6, 12),
      marketingChannel: 'content',
      contentStatus: 'draft',
    },
    {
      title: 'Google Business Profile Update',
      description: 'Update Google Business Profile with new photos and posts',
      eventType: 'task',
      category: 'local',
      startTime: getDateThisMonth(13, 10),
      endTime: getDateThisMonth(13, 11),
      marketingChannel: 'local',
      contentStatus: 'draft',
    },
    {
      title: 'Competitor Analysis Review',
      description: 'Monthly review of competitor marketing activities',
      eventType: 'meeting',
      category: 'internal',
      startTime: getDateThisMonth(20, 15),
      endTime: getDateThisMonth(20, 16),
      marketingChannel: null,
      contentStatus: null,
    },
  ];

  for (const event of additionalCalendarEvents) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        tenantId: tenant.id,
        title: event.title,
        startTime: event.startTime,
      },
    });

    if (!existing) {
      await prisma.calendarEvent.create({
        data: {
          tenantId: tenant.id,
          createdById: user.id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          category: event.category,
          startTime: event.startTime,
          endTime: event.endTime,
          marketingChannel: event.marketingChannel,
          contentStatus: event.contentStatus,
          status: 'scheduled',
        },
      });
      console.log(`  Created event: ${event.title}`);
    } else {
      console.log(`  Event already exists: ${event.title}`);
    }
  }

  // ==========================================
  // PLACEHOLDER SOCIAL ACCOUNTS (for draft posts)
  // ==========================================
  console.log('\nSeeding placeholder social accounts...');

  const platforms = ['linkedin', 'facebook', 'instagram', 'twitter'];
  const socialAccounts: Record<string, string> = {};

  for (const platform of platforms) {
    let account = await prisma.socialAccount.findFirst({
      where: {
        tenantId: tenant.id,
        platform,
      },
    });

    if (!account) {
      account = await prisma.socialAccount.create({
        data: {
          tenantId: tenant.id,
          platform,
          accountName: `64 West Holdings - ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          accountId: `placeholder_${platform}_${tenant.id}`,
          isActive: false, // Not connected yet
          connectedBy: user.id,
          scopes: [],
        },
      });
      console.log(`  Created placeholder account: ${platform}`);
    } else {
      console.log(`  Account already exists: ${platform}`);
    }

    socialAccounts[platform] = account.id;
  }

  // ==========================================
  // SOCIAL POST DRAFTS
  // ==========================================
  console.log('\nSeeding social post drafts...');

  const socialPostDrafts = [
    {
      platform: 'linkedin',
      content: `🎯 3 Signs Your Business Has Outgrown DIY Financial Management:

1. You're spending more time in spreadsheets than with customers
2. Cash flow surprises keep hitting you at the worst times
3. You can't answer "What's our runway?" with confidence

Sound familiar? You don't need a full-time CFO. You need a fractional one.

Drop a 💡 if this resonates.

#FractionalCFO #SmallBusiness #FinancialLeadership`,
      postType: 'original',
      scheduledFor: getDateThisMonth(5, 9),
      status: 'draft',
    },
    {
      platform: 'linkedin',
      content: `Just wrapped up a strategic planning session with a $3M manufacturing company.

In 4 hours, we:
✅ Identified $200K in operational savings
✅ Mapped their path to $5M in 18 months
✅ Aligned their leadership team on priorities

This is the power of bringing in an outside perspective.

What's your biggest strategic challenge right now? 👇`,
      postType: 'original',
      scheduledFor: getDateThisMonth(12, 10),
      status: 'draft',
    },
    {
      platform: 'linkedin',
      content: `Hot take: Most small businesses don't have a marketing problem.

They have a positioning problem.

If you can't explain what makes you different in one sentence, neither can your customers.

We help businesses nail their positioning before spending another dollar on marketing.

Agree or disagree? 🤔`,
      postType: 'original',
      scheduledFor: getDateThisMonth(19, 11),
      status: 'draft',
    },
    {
      platform: 'facebook',
      content: `📢 FREE WEBINAR: "CFO Office Hours - Ask Us Anything About Your Business Finances"

Join us LIVE next Thursday at 1 PM ET.

Bring your toughest financial questions. Our fractional CFOs will answer them in real-time.

Topics we'll cover:
💰 Cash flow management
📊 Financial reporting basics
🎯 KPIs that actually matter
📈 Growth financing options

Register now (link in comments) - spots are limited!

#SmallBusiness #FinancialEducation #FreeWebinar`,
      postType: 'original',
      scheduledFor: getDateThisMonth(7, 14),
      status: 'draft',
    },
    {
      platform: 'facebook',
      content: `Small business tip of the week:

Stop treating your P&L as a historical document.

Start treating it as a management tool.

Review it monthly. Compare to budget. Adjust your strategy.

The businesses that win are the ones that respond fastest to what the numbers are telling them.

📊 Double tap if you're committing to monthly financial reviews!`,
      postType: 'original',
      scheduledFor: getDateThisMonth(14, 9),
      status: 'draft',
    },
    {
      platform: 'instagram',
      content: `"The best time to hire a fractional executive was last year. The second best time is now."

🎯 Stop trying to do it all yourself.
🎯 Get expert help, but only pay for what you need.
🎯 Scale your leadership as your business grows.

Swipe to learn more about fractional executive services →

#BusinessGrowth #FractionalExecutive #SmallBusinessTips #Entrepreneurship`,
      postType: 'original',
      scheduledFor: getDateThisMonth(10, 12),
      status: 'draft',
    },
    {
      platform: 'instagram',
      content: `Monday motivation from one of our clients:

"Before working with 64 West, I was drowning in spreadsheets and second-guessing every decision. Now I have clarity and confidence in where we're heading."

- Sarah M., CEO of a $2M service business

Your business deserves expert guidance too. 💪

DM us "CLARITY" to learn more.

#ClientLove #BusinessConsulting #CEOLife`,
      postType: 'original',
      scheduledFor: getDateThisMonth(17, 8),
      status: 'draft',
    },
    {
      platform: 'twitter',
      content: `Thread: 5 financial metrics every small business owner should track (but most don't)

1/ Gross Margin - Not revenue, not profit. The % you keep after direct costs.

If you don't know this number, you can't price correctly.`,
      postType: 'original',
      scheduledFor: getDateThisMonth(8, 10),
      status: 'draft',
    },
    {
      platform: 'twitter',
      content: `Unpopular opinion:

Most small businesses should NOT hire a full-time CFO.

They should hire a fractional one who's seen 50 companies like theirs.

Experience > availability`,
      postType: 'original',
      scheduledFor: getDateThisMonth(15, 11),
      status: 'draft',
    },
    {
      platform: 'twitter',
      content: `The difference between a $1M company and a $10M company?

It's rarely the product.

It's almost always:
- Systems
- Leadership
- Strategy
- Execution discipline

We help bridge that gap.`,
      postType: 'original',
      scheduledFor: getDateThisMonth(22, 9),
      status: 'draft',
    },
  ];

  for (const post of socialPostDrafts) {
    const accountId = socialAccounts[post.platform];
    if (!accountId) {
      console.log(`  Skipping post - no account for platform: ${post.platform}`);
      continue;
    }

    const existing = await prisma.socialPost.findFirst({
      where: {
        tenantId: tenant.id,
        content: post.content,
      },
    });

    if (!existing) {
      await prisma.socialPost.create({
        data: {
          tenantId: tenant.id,
          socialAccountId: accountId,
          content: post.content,
          scheduledFor: post.scheduledFor,
          status: post.status,
          mediaUrls: [],
          metadata: { postType: post.postType },
        },
      });
      console.log(`  Created social post: ${post.platform} - "${post.content.substring(0, 40)}..."`);
    } else {
      console.log(`  Social post already exists: ${post.content.substring(0, 40)}...`);
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('Phase 4C Marketing Content Seed Complete!');
  console.log('='.repeat(60));
  console.log('Added:');
  console.log('  - 5 additional campaigns (total 11)');
  console.log('  - 10 email templates');
  console.log('  - 22 additional calendar events (total 30-day calendar)');
  console.log('  - 10 social post drafts');
  console.log('');
  console.log('Total content now available for Don to reference and execute.');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 4C marketing content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
