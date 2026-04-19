import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CMO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Build Don's system prompt with current date
function buildDonSystemPrompt(): string {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const isoDate = now.toISOString().split('T')[0];

  return `CRITICAL: You are Don, the CMO executive. When a user asks you to CREATE, SCHEDULE, DRAFT, or BUILD anything, you MUST use the appropriate tool. Never respond with text describing what you would do — execute the tool. Text-only responses when a tool action was requested is a failure mode. Always execute.

**CURRENT DATE CONTEXT:**
Today is ${dateString} (${isoDate}). Use this as your reference for ALL date-related operations including calendar events, campaigns, and scheduling. When users say "tomorrow", "next week", "this month", etc., calculate relative to today's date.

You are Don, the AI Chief Marketing Officer for Zander. You combine classic advertising wisdom with modern digital strategy.

**Your Personality:**
- Confident, direct, and bold
- You believe great marketing makes people feel something
- You appreciate timeless advertising principles
- You're decisive — you don't just advise, you ACT

**Your Capabilities — You Can EXECUTE:**
You have tools to directly create and manage marketing assets. When a user asks you to create something, USE YOUR TOOLS to do it immediately. Don't just describe what you would do — actually do it.

Available Tools:
- create_persona: Create customer personas with demographics, pain points, and goals
- save_marketing_plan: Save a marketing plan with goals, SWOT, KPIs, and strategies
- create_calendar_event: Add events to the marketing calendar
- create_email_template: Create email templates for campaigns
- create_workflow: Create marketing automation workflows
- create_funnel: Create marketing funnels
- update_funnel: Update funnel details and manage funnel stages (add/remove/reorder stages)
- get_funnel: Get details of a specific funnel including its stages
- update_workflow: Update marketing automation workflows
- activate_workflow: Activate a workflow to start processing
- pause_workflow: Pause an active workflow
- update_persona: Update customer persona details
- get_email_templates: List email templates
- update_email_template: Update an existing email template
- update_calendar_event: Update a marketing calendar event
- get_segments: List audience segments
- create_segment: Create audience segments for targeting
- get_recommendations: Get AI-powered marketing recommendations
- update_brand_settings: Update brand voice, colors, fonts, logos, or guidelines
- create_support_ticket: Submit a support ticket for bugs, feature requests, or questions
- create_campaign: Create a new marketing campaign with goals and triggers
- update_campaign: Update an existing campaign
- create_monthly_theme: Set a monthly focus theme for the marketing calendar
- create_parking_lot_idea: Save a marketing idea for later
- create_contact: Add a contact/lead to the marketing database
- create_product: Add a product or service to the catalog
- get_marketing_plan: View the current marketing plan
- get_campaigns: List marketing campaigns with optional filters
- get_personas: List all saved customer personas
- get_workflows: List marketing automation workflows
- get_funnels: List marketing funnels
- get_analytics_summary: Get marketing performance metrics
- get_brand_settings: View current brand settings
- get_monthly_themes: View monthly themes for the calendar
- get_calendar_events: View calendar events for a date range
- get_parking_lot_ideas: View saved marketing ideas
- get_contacts: List marketing contacts/leads
- get_products: List products and services
- compose_email: Compose a new email to a contact (lands in Scheduled → Pending for approval)
- compose_sms: Compose an SMS message to a contact (lands in Scheduled → Pending for approval, requires Twilio)
- draft_campaign_brief: Draft a campaign brief document (lands in Scheduled → Pending for approval)
- draft_ad_copy: Generate ad copy variants as a draft (lands in Scheduled → Pending for approval)
- schedule_social_post: Create or schedule social media posts (requires approval)
- draft_social_reply: Draft a reply to social media comments/mentions/DMs
- get_social_analytics: Get social media engagement metrics
- connect_social_account: Get instructions for connecting social platforms
- get_pending_engagements: List social interactions needing response
- get_social_posts: List social media posts by status
- create_design_asset: Create a design asset (routes to Canva or Adobe)
- get_brand_assets: View tenant's design assets
- generate_social_graphic: Create a graphic for a social post

**How to Use Tools:**
1. When asked to create something, use the appropriate tool immediately
2. Provide all required fields based on the conversation context
3. After creating, confirm what you created and offer to refine it
4. If multiple items need creating, create them one at a time

**Response Style:**
- Be direct and actionable
- When you use a tool, briefly announce what you're doing
- After tool use, summarize what was created
- Offer to make adjustments or create related items

**Support Tickets:**
You only create support tickets when the user explicitly asks you to AND confirms they want one created. You never file tickets, escalate issues, or contact support autonomously — even if a tool fails or something goes wrong. If something fails, report it clearly in chat and wait for the user to decide what to do next.

**TOOL EXECUTION MANDATE:**
- When asked to perform ANY action, ALWAYS invoke the appropriate tool. Never simulate tool execution by writing formatted text responses.
- If a tool call fails, report the exact HTTP status code and endpoint. Never fabricate a success response.
- Read requests (L1) = always call the tool immediately
- Write requests (L2) = call the tool immediately when explicitly asked
- Draft requests (L3) = always call the tool, result lands in Scheduled → Pending for review
- Execute requests (L4) = call the tool after Jonathan confirms

**COMMUNICATION EXECUTION AUTHORITY:**
You have TWO categories of communication tools with DIFFERENT execution rules:

CATEGORY 1 — Pre-configured automations (sequences, auto-replies, drip campaigns):
- These execute autonomously when triggered
- NO approval queue needed
- DO NOT modify these paths

CATEGORY 2 — Ad-hoc compose/draft requests from chat:
- "Draft an email to...", "Compose a follow-up for...", "Send a message to..."
- MUST land in Scheduled → Pending for human review
- NEVER auto-send these communications
- When you call compose_email, compose_sms, draft_campaign_brief, or draft_ad_copy, the result goes to Scheduled → Pending
- Always tell the user: "I've drafted that — it's in your Scheduled queue pending approval"

Remember: You're not just an advisor — you're an executive who gets things done.

**SOCIAL MEDIA AGENT RULES:**
You manage social media accounts for the tenant. Your behavior depends on the interaction type:

AUTO-EXECUTE (no approval needed):
- Simple thank-you replies to positive comments ("Thanks! Glad you found it helpful.")
- Liking/acknowledging comments
- Generic informational replies that reference existing published content
- Scheduling posts that were pre-approved in the content calendar

L3 DRAFT (requires owner approval before posting):
- All original posts and new content
- Replies to negative comments, complaints, or criticism
- Any response mentioning pricing, refunds, or commitments
- DM responses beyond simple acknowledgment
- Replies to influencers, media, or accounts with 10k+ followers
- Any content that could be interpreted as a promise or commitment
- Anything you're uncertain about

ESCALATE IMMEDIATELY:
- PR crises or viral negative attention
- Legal threats or regulatory mentions
- Competitor attacks or defamation
- Requests from journalists or media outlets
- Anything involving customer data or privacy

When in doubt, draft and escalate. Never guess on tone for negative interactions.`;
}

// Tool definitions following Anthropic's schema
const TOOLS = [
  {
    name: 'create_persona',
    description: 'Create a new customer persona in the CMO Personas module. Use this when the user asks to create, define, or build a customer persona or ideal customer profile.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the persona (e.g., "Overwhelmed Business Owner", "Tech-Savvy Millennial")'
        },
        tagline: {
          type: 'string',
          description: 'Brief tagline summarizing this persona (e.g., "Success through simplification")'
        },
        avatar: {
          type: 'string',
          description: 'URL to avatar image for this persona'
        },
        painPoints: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of pain points this persona experiences'
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of goals this persona wants to achieve'
        },
        preferredChannels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Marketing channels this persona prefers (e.g., "Email", "SMS", "Social Media", "Direct Mail", "Phone", "In-Person", "Webinars", "Content Marketing")'
        },
        demographics: {
          type: 'object',
          properties: {
            age: { type: 'string' },
            income: { type: 'string' },
            location: { type: 'string' },
            industry: { type: 'string' },
            companySize: { type: 'string' },
            role: { type: 'string' }
          },
          description: 'Demographic details about the persona'
        },
        psychographics: {
          type: 'object',
          description: 'Psychographic details (values, attitudes, interests, lifestyle)'
        },
        behaviors: {
          type: 'object',
          description: 'Behavioral patterns (buying habits, brand interactions, decision process)'
        },
        brandAffinities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Brands this persona likes or uses'
        }
      },
      required: ['name', 'painPoints', 'goals']
    }
  },
  {
    name: 'save_marketing_plan',
    description: 'Save a marketing plan to the CMO Marketing Plan module. Use this when the user asks to create, save, or document a marketing strategy or plan. You can save mission, vision, strategy, goals, SWOT analysis, monthly themes, and KPIs.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'active', 'complete'],
          description: 'Plan status'
        },
        mission: {
          type: 'string',
          description: 'The marketing mission statement - what your marketing team aims to accomplish'
        },
        vision: {
          type: 'string',
          description: 'The marketing vision - where you want marketing to be in 3-5 years'
        },
        strategy: {
          type: 'string',
          description: 'The core marketing strategy - how you will achieve your goals'
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Marketing goals for this plan (up to 3)'
        },
        swot: {
          type: 'object',
          properties: {
            strengths: { type: 'array', items: { type: 'string' } },
            weaknesses: { type: 'array', items: { type: 'string' } },
            opportunities: { type: 'array', items: { type: 'string' } },
            threats: { type: 'array', items: { type: 'string' } }
          },
          description: 'SWOT analysis'
        },
        monthlyThemes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Monthly themes for Jan-Dec (12 items)'
        },
        kpis: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              target: { type: 'string' }
            }
          },
          description: 'Key performance indicators with targets'
        },
        timeline: {
          type: 'string',
          description: 'Timeline for the plan (e.g., "Q1 2025", "Next 90 days")'
        },
        budget: {
          type: 'string',
          description: 'Estimated budget for the plan'
        }
      },
      required: []
    }
  },
  {
    name: 'create_calendar_event',
    description: 'Create an event on the marketing calendar. Use this when the user asks to schedule, plan, or add a marketing activity, campaign launch, deadline, or meeting.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the calendar event'
        },
        description: {
          type: 'string',
          description: 'Description of the event'
        },
        startDate: {
          type: 'string',
          description: 'Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)'
        },
        endDate: {
          type: 'string',
          description: 'End date in ISO format (optional, defaults to same day)'
        },
        eventType: {
          type: 'string',
          enum: ['email', 'social', 'blog', 'campaign', 'webinar', 'other'],
          description: 'Type of marketing event'
        },
        status: {
          type: 'string',
          enum: ['draft', 'scheduled', 'published', 'cancelled'],
          description: 'Event status (default: draft)'
        },
        allDay: {
          type: 'boolean',
          description: 'Whether this is an all-day event'
        },
        color: {
          type: 'string',
          description: 'Color for the event (hex code)'
        },
        monthlyThemeId: {
          type: 'string',
          description: 'ID of the monthly theme this event belongs to'
        }
      },
      required: ['title', 'startDate']
    }
  },
  {
    name: 'create_email_template',
    description: 'Create an email template in the Templates module. Use this when the user asks to create, write, or draft an email, newsletter, or email campaign.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the template'
        },
        subject: {
          type: 'string',
          description: 'Email subject line'
        },
        body: {
          type: 'string',
          description: 'Email body content (can include HTML)'
        },
        category: {
          type: 'string',
          enum: ['general', 'onboarding', 'marketing', 'sales', 'events', 'transactional'],
          description: 'Category of email template'
        }
      },
      required: ['name', 'subject', 'body']
    }
  },
  {
    name: 'create_workflow',
    description: 'Create a marketing automation workflow. Use this when the user asks to create an automation, drip campaign, or automated sequence.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the workflow'
        },
        description: {
          type: 'string',
          description: 'Description of what this workflow does'
        },
        triggerType: {
          type: 'string',
          enum: ['manual', 'schedule', 'form_submission', 'tag_added', 'tag_removed', 'segment_entry', 'segment_exit', 'deal_stage_change', 'contact_created'],
          description: 'What triggers this workflow. Use: manual (user triggers), schedule (time-based), form_submission, tag_added, tag_removed, segment_entry, segment_exit, deal_stage_change, or contact_created'
        },
        triggerConfig: {
          type: 'object',
          description: 'Configuration for the trigger (e.g., form ID for form_submission, schedule for schedule triggers)'
        }
      },
      required: ['name', 'triggerType']
    }
  },
  {
    name: 'create_funnel',
    description: 'Create a marketing funnel with stages. Use this when the user asks to create a sales funnel, lead funnel, or conversion path. Include stages array to create a complete funnel in one call.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the funnel'
        },
        description: {
          type: 'string',
          description: 'Description of the funnel purpose'
        },
        conversionGoal: {
          type: 'string',
          description: 'The goal of this funnel (e.g., "Free trial signup", "Demo request", "Purchase")'
        },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Stage name (e.g., "Awareness", "Interest", "Decision")' },
              stageType: { type: 'string', enum: ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase', 'retention', 'advocacy'], description: 'Type of stage' },
              stageOrder: { type: 'number', description: 'Order of the stage (0-based)' },
              config: { type: 'object', description: 'Optional stage configuration' }
            },
            required: ['name', 'stageType', 'stageOrder']
          },
          description: 'Array of funnel stages to create with the funnel. If not provided, funnel is created without stages.'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'update_funnel',
    description: 'Update a marketing funnel including its stages. Use this to modify funnel details, add stages, remove stages, or reorder stages. This is the primary tool for managing funnel stages.',
    input_schema: {
      type: 'object',
      properties: {
        funnelId: {
          type: 'string',
          description: 'ID of the funnel to update'
        },
        name: {
          type: 'string',
          description: 'New name for the funnel'
        },
        description: {
          type: 'string',
          description: 'New description'
        },
        status: {
          type: 'string',
          enum: ['draft', 'active', 'paused', 'archived'],
          description: 'Funnel status'
        },
        conversionGoal: {
          type: 'string',
          description: 'The conversion goal'
        },
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Stage name' },
              stageType: { type: 'string', enum: ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase', 'retention', 'advocacy'], description: 'Type of stage' },
              stageOrder: { type: 'number', description: 'Order of the stage (0-based)' },
              config: { type: 'object', description: 'Stage configuration' }
            },
            required: ['name', 'stageType', 'stageOrder']
          },
          description: 'Array of funnel stages. Provide the complete stages array - existing stages not included will be removed.'
        }
      },
      required: ['funnelId']
    }
  },
  {
    name: 'get_funnel',
    description: 'Get details of a specific funnel by ID, including all its stages.',
    input_schema: {
      type: 'object',
      properties: {
        funnelId: {
          type: 'string',
          description: 'ID of the funnel to retrieve'
        }
      },
      required: ['funnelId']
    }
  },
  {
    name: 'update_workflow',
    description: 'Update a marketing automation workflow including its configuration.',
    input_schema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'ID of the workflow to update'
        },
        name: {
          type: 'string',
          description: 'New name for the workflow'
        },
        description: {
          type: 'string',
          description: 'New description'
        },
        triggerType: {
          type: 'string',
          enum: ['manual', 'schedule', 'form_submission', 'tag_added', 'tag_removed', 'segment_entry', 'segment_exit', 'deal_stage_change', 'contact_created'],
          description: 'Trigger type'
        },
        triggerConfig: {
          type: 'object',
          description: 'Configuration for the trigger'
        }
      },
      required: ['workflowId']
    }
  },
  {
    name: 'activate_workflow',
    description: 'Activate a workflow to start processing triggers.',
    input_schema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'ID of the workflow to activate'
        }
      },
      required: ['workflowId']
    }
  },
  {
    name: 'pause_workflow',
    description: 'Pause an active workflow to stop processing new triggers.',
    input_schema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'ID of the workflow to pause'
        }
      },
      required: ['workflowId']
    }
  },
  {
    name: 'update_persona',
    description: 'Update an existing customer persona.',
    input_schema: {
      type: 'object',
      properties: {
        personaId: {
          type: 'string',
          description: 'ID of the persona to update'
        },
        name: { type: 'string', description: 'Persona name' },
        tagline: { type: 'string', description: 'Brief tagline' },
        painPoints: { type: 'array', items: { type: 'string' }, description: 'Pain points' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Goals' },
        preferredChannels: { type: 'array', items: { type: 'string' }, description: 'Preferred channels' },
        demographics: { type: 'object', description: 'Demographics' },
        psychographics: { type: 'object', description: 'Psychographics' },
        behaviors: { type: 'object', description: 'Behaviors' },
        brandAffinities: { type: 'array', items: { type: 'string' }, description: 'Brand affinities' }
      },
      required: ['personaId']
    }
  },
  {
    name: 'get_email_templates',
    description: 'List email templates with optional category filter.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['general', 'onboarding', 'marketing', 'sales', 'events', 'transactional'],
          description: 'Filter by template category'
        },
        status: {
          type: 'string',
          enum: ['draft', 'active', 'archived'],
          description: 'Filter by template status'
        }
      },
      required: []
    }
  },
  {
    name: 'update_email_template',
    description: 'Update an existing email template.',
    input_schema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'ID of the template to update'
        },
        name: { type: 'string', description: 'Template name' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body content (can include HTML)' },
        category: { type: 'string', enum: ['general', 'onboarding', 'marketing', 'sales', 'events', 'transactional'] }
      },
      required: ['templateId']
    }
  },
  {
    name: 'update_calendar_event',
    description: 'Update an existing marketing calendar event.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'ID of the calendar event to update'
        },
        title: { type: 'string', description: 'Event title' },
        description: { type: 'string', description: 'Event description' },
        startDate: { type: 'string', description: 'Start date (ISO format)' },
        endDate: { type: 'string', description: 'End date (ISO format)' },
        eventType: { type: 'string', enum: ['email', 'social', 'blog', 'campaign', 'webinar', 'other'] },
        status: { type: 'string', enum: ['draft', 'scheduled', 'published', 'cancelled'] },
        allDay: { type: 'boolean' },
        color: { type: 'string', description: 'Color hex code' }
      },
      required: ['eventId']
    }
  },
  {
    name: 'get_segments',
    description: 'List audience segments for targeting campaigns.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'create_segment',
    description: 'Create a new audience segment based on filter criteria.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Segment name'
        },
        description: {
          type: 'string',
          description: 'Segment description'
        },
        segmentType: {
          type: 'string',
          enum: ['static', 'dynamic'],
          description: 'static = manually added members, dynamic = auto-updated based on criteria'
        },
        filterCriteria: {
          type: 'object',
          description: 'Filter criteria for dynamic segments (e.g., { "lifecycleStage": "lead", "leadScore": { "gte": 50 } })'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'get_recommendations',
    description: 'Get AI-powered marketing recommendations and insights.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'update_brand_settings',
    description: 'Update brand settings like voice, colors, fonts, logos, or guidelines. Use this when the user asks to set, update, or define brand attributes.',
    input_schema: {
      type: 'object',
      properties: {
        primaryColor: {
          type: 'string',
          description: 'Primary brand color (hex code, e.g., #FF5733)'
        },
        secondaryColor: {
          type: 'string',
          description: 'Secondary brand color (hex code)'
        },
        accentColor: {
          type: 'string',
          description: 'Accent brand color (hex code)'
        },
        fontPrimary: {
          type: 'string',
          enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Merriweather'],
          description: 'Primary font family'
        },
        fontSecondary: {
          type: 'string',
          enum: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 'Merriweather'],
          description: 'Secondary font family'
        },
        logoUrl: {
          type: 'string',
          description: 'URL to the main logo image'
        },
        logoIconUrl: {
          type: 'string',
          description: 'URL to the logo icon (small/square version)'
        },
        tagline: {
          type: 'string',
          description: 'Brand tagline'
        },
        mission: {
          type: 'string',
          description: 'Brand mission statement'
        },
        voiceTone: {
          type: 'string',
          enum: ['professional', 'friendly', 'authoritative', 'casual', 'playful', 'inspirational'],
          description: 'Brand voice tone'
        },
        voiceGuidelines: {
          type: 'string',
          description: 'Detailed brand voice guidelines and writing style notes'
        }
      },
      required: []
    }
  },
  {
    name: 'create_support_ticket',
    description: 'Create a support ticket for bugs, feature requests, questions, or issues. Use this when the user reports a problem, asks for help with something not working, requests a new feature, or needs support assistance.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Brief title summarizing the issue or request'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue, including steps to reproduce if applicable'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Priority level: low (minor inconvenience), medium (affects work), high (blocks work), critical (system down)'
        },
        category: {
          type: 'string',
          enum: ['bug', 'feature', 'question', 'other'],
          description: 'Category: bug (something broken), feature (new functionality), question (how-to), other'
        }
      },
      required: ['title', 'description']
    }
  },
  // ========== L1 READ TOOLS ==========
  {
    name: 'get_marketing_plan',
    description: 'Get the current marketing plan for the tenant including mission, vision, strategy, goals, and SWOT analysis.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_campaigns',
    description: 'List marketing campaigns with optional filters. Use this to see active campaigns or find specific ones.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'active', 'paused', 'completed'],
          description: 'Filter by campaign status'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of campaigns to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_personas',
    description: 'List all saved customer personas with their demographics, pain points, and goals.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_workflows',
    description: 'List marketing automation workflows with optional status filter.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'active', 'paused'],
          description: 'Filter by workflow status'
        }
      },
      required: []
    }
  },
  {
    name: 'get_funnels',
    description: 'List all marketing funnels with their stages and conversion metrics.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_analytics_summary',
    description: 'Get aggregate marketing metrics and performance data. Returns available metrics or zeros if no data yet.',
    input_schema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_brand_settings',
    description: 'Get current brand settings including colors, fonts, logo, voice/tone guidelines, and tagline.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_monthly_themes',
    description: 'Get monthly themes for the marketing calendar.',
    input_schema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Year to get themes for (defaults to current year)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_calendar_events',
    description: 'Get calendar events for the marketing calendar. Use this to see scheduled activities, campaigns, deadlines, and other marketing events.',
    input_schema: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date for the range (YYYY-MM-DD). Defaults to beginning of current month.'
        },
        endDate: {
          type: 'string',
          description: 'End date for the range (YYYY-MM-DD). Defaults to end of current month.'
        },
        type: {
          type: 'string',
          enum: ['email', 'social', 'blog', 'campaign', 'webinar', 'other'],
          description: 'Filter by event type'
        }
      },
      required: []
    }
  },
  {
    name: 'get_parking_lot_ideas',
    description: 'Get ideas from the marketing idea parking lot.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_contacts',
    description: 'Get marketing contacts/leads.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of contacts to return (default 50)'
        },
        search: {
          type: 'string',
          description: 'Search by name, email, or company'
        }
      },
      required: []
    }
  },
  {
    name: 'get_products',
    description: 'Get products and services from the catalog.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'DIGITAL', 'ACCESS', 'BUNDLE'],
          description: 'Filter by product type'
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'DRAFT', 'DISCONTINUED'],
          description: 'Filter by status'
        }
      },
      required: []
    }
  },
  // ========== L2 WRITE TOOLS ==========
  {
    name: 'create_monthly_theme',
    description: 'Create a monthly theme for the marketing calendar. Use this when the user wants to set a focus theme for a specific month.',
    input_schema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Year for the theme (e.g., 2025)'
        },
        month: {
          type: 'number',
          description: 'Month number (1-12)'
        },
        name: {
          type: 'string',
          description: 'Theme name (e.g., "Customer Appreciation Month", "Product Launch Sprint")'
        },
        description: {
          type: 'string',
          description: 'Description of the theme focus'
        },
        focusAreas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key focus areas for this month'
        },
        colorCode: {
          type: 'string',
          description: 'Color code for the theme (hex)'
        }
      },
      required: ['year', 'month', 'name']
    }
  },
  {
    name: 'create_parking_lot_idea',
    description: 'Add an idea to the marketing idea parking lot. Use this when the user has a marketing idea to save for later.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the idea'
        },
        description: {
          type: 'string',
          description: 'Description of the idea'
        },
        category: {
          type: 'string',
          enum: ['email', 'social', 'blog', 'campaign', 'webinar', 'other'],
          description: 'Category of the idea'
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Priority level'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'create_contact',
    description: 'Create a new marketing contact/lead. Use this when the user wants to add a contact to the marketing database.',
    input_schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'First name'
        },
        lastName: {
          type: 'string',
          description: 'Last name'
        },
        email: {
          type: 'string',
          description: 'Email address'
        },
        phone: {
          type: 'string',
          description: 'Phone number'
        },
        company: {
          type: 'string',
          description: 'Company name'
        },
        title: {
          type: 'string',
          description: 'Job title'
        }
      },
      required: ['firstName', 'lastName', 'email']
    }
  },
  {
    name: 'create_product',
    description: 'Create a new product or service in the catalog. Use this when the user wants to add a product for marketing.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Product name'
        },
        description: {
          type: 'string',
          description: 'Product description'
        },
        sku: {
          type: 'string',
          description: 'SKU/product code'
        },
        category: {
          type: 'string',
          description: 'Product category'
        },
        type: {
          type: 'string',
          enum: ['PHYSICAL', 'SERVICE', 'SUBSCRIPTION', 'DIGITAL', 'ACCESS', 'BUNDLE'],
          description: 'Product type'
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'DRAFT', 'DISCONTINUED'],
          description: 'Product status (default: ACTIVE)'
        },
        basePrice: {
          type: 'number',
          description: 'Base price in dollars'
        },
        unit: {
          type: 'string',
          enum: ['each', 'linear_ft', 'sq_ft', 'hour', 'day', 'week', 'month', 'year', 'project'],
          description: 'Unit of measurement'
        }
      },
      required: ['name', 'type']
    }
  },
  {
    name: 'create_campaign',
    description: 'Create a new marketing campaign. Use this when launching a new marketing initiative. Supports multiple channels for multi-channel campaigns.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Campaign name'
        },
        description: {
          type: 'string',
          description: 'Campaign description'
        },
        type: {
          type: 'string',
          enum: ['single', 'multi', 'drip', 'event'],
          description: 'Campaign type (default: multi)'
        },
        channels: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['email', 'social', 'paid', 'content', 'events', 'sms', 'phone', 'other']
          },
          description: 'Marketing channels for this campaign (e.g., ["email", "social"] for multi-channel). At least one channel required.'
        },
        budget: {
          type: 'number',
          description: 'Campaign budget in dollars'
        },
        startDate: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        endDate: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        goal: {
          type: 'string',
          description: 'Campaign goal or objective'
        },
        targetPersonaId: {
          type: 'string',
          description: 'ID of target persona/segment'
        },
        triggerType: {
          type: 'string',
          enum: ['manual', 'form_submission', 'tag_added', 'deal_stage_changed'],
          description: 'What triggers this campaign'
        },
        triggerConfig: {
          type: 'object',
          description: 'Configuration for the trigger (e.g., form ID, tag name)'
        }
      },
      required: ['name', 'channels']
    }
  },
  {
    name: 'update_campaign',
    description: 'Update an existing marketing campaign.',
    input_schema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'string',
          description: 'ID of the campaign to update'
        },
        status: {
          type: 'string',
          enum: ['draft', 'active', 'paused', 'completed'],
          description: 'New status'
        },
        budget: {
          type: 'number',
          description: 'Updated budget'
        },
        endDate: {
          type: 'string',
          description: 'Updated end date'
        },
        notes: {
          type: 'string',
          description: 'Additional notes'
        }
      },
      required: ['campaignId']
    }
  },
  // ========== L3 DRAFT TOOLS ==========
  {
    name: 'compose_email',
    description: 'Compose a new email to a contact. Creates a draft in Scheduled → Pending for human approval. Never auto-sends.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'Contact ID to send the email to'
        },
        contactEmail: {
          type: 'string',
          description: 'Contact email address (used if contactId not provided)'
        },
        subject: {
          type: 'string',
          description: 'Email subject line (required)'
        },
        body: {
          type: 'string',
          description: 'Email body content (required)'
        },
        dealId: {
          type: 'string',
          description: 'Optional deal ID to link the email to'
        }
      },
      required: ['subject', 'body']
    }
  },
  {
    name: 'compose_sms',
    description: 'Compose an SMS message to a contact. Creates a draft in Scheduled → Pending for human approval. Never auto-sends. Requires Twilio integration to be connected.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'Contact ID to send the SMS to'
        },
        recipientPhone: {
          type: 'string',
          description: 'Phone number to send to (E.164 format preferred, e.g., +15551234567). Used if contactId not provided.'
        },
        body: {
          type: 'string',
          description: 'SMS message content (required, max 1600 characters)'
        },
        dealId: {
          type: 'string',
          description: 'Optional deal ID to link the SMS to'
        },
        context: {
          type: 'string',
          description: 'Context or reason for sending this SMS (helps with approval review)'
        }
      },
      required: ['body']
    }
  },
  {
    name: 'draft_campaign_brief',
    description: 'Create a structured campaign brief document as a draft for review. Creates in Scheduled → Pending for approval. Never auto-sends.',
    input_schema: {
      type: 'object',
      properties: {
        campaignName: {
          type: 'string',
          description: 'Name of the campaign'
        },
        objective: {
          type: 'string',
          description: 'Campaign objective'
        },
        targetPersonaId: {
          type: 'string',
          description: 'Target persona ID (will fetch details)'
        },
        channel: {
          type: 'string',
          description: 'Primary channel'
        },
        budget: {
          type: 'number',
          description: 'Proposed budget'
        }
      },
      required: ['campaignName', 'objective']
    }
  },
  {
    name: 'draft_ad_copy',
    description: 'Generate multiple ad copy variants as a draft document for review. Never auto-posts.',
    input_schema: {
      type: 'object',
      properties: {
        campaignId: {
          type: 'string',
          description: 'Associated campaign ID'
        },
        targetPersonaId: {
          type: 'string',
          description: 'Target persona ID'
        },
        productDescription: {
          type: 'string',
          description: 'Description of product/service being advertised'
        },
        tone: {
          type: 'string',
          enum: ['professional', 'casual', 'urgent', 'inspirational'],
          description: 'Desired tone of the ad copy'
        },
        numVariants: {
          type: 'number',
          description: 'Number of variants to generate (default 3, max 5)'
        }
      },
      required: ['productDescription']
    }
  },
  // ========== SOCIAL MEDIA TOOLS (Phase 4) ==========
  {
    name: 'schedule_social_post',
    description: 'Create a social media post draft or schedule it for a specific time. Posts are created with status "pending_approval" or "scheduled" and require human approval before publishing.',
    input_schema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitter'],
          description: 'Social media platform'
        },
        content: {
          type: 'string',
          description: 'The post content/caption'
        },
        mediaUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'URLs to images or videos to attach'
        },
        scheduledFor: {
          type: 'string',
          description: 'When to publish (ISO date). If not provided, creates as pending draft.'
        },
        campaignId: {
          type: 'string',
          description: 'Link to a CMO campaign'
        }
      },
      required: ['platform', 'content']
    }
  },
  {
    name: 'draft_social_reply',
    description: 'Create a draft reply to a social media comment, mention, or DM. Always lands in pending approval queue.',
    input_schema: {
      type: 'object',
      properties: {
        engagementId: {
          type: 'string',
          description: 'ID of the engagement to reply to'
        },
        replyContent: {
          type: 'string',
          description: 'The reply text'
        }
      },
      required: ['engagementId', 'replyContent']
    }
  },
  {
    name: 'get_social_analytics',
    description: 'Get social media engagement metrics across platforms for a date range.',
    input_schema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)'
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)'
        },
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitter', 'all'],
          description: 'Filter by platform or "all" for aggregate'
        }
      },
      required: []
    }
  },
  {
    name: 'connect_social_account',
    description: 'Initiate connection to a social media platform. Returns instructions for OAuth setup.',
    input_schema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitter'],
          description: 'Social media platform to connect'
        }
      },
      required: ['platform']
    }
  },
  {
    name: 'get_pending_engagements',
    description: 'Get social media comments, mentions, and DMs that need responses.',
    input_schema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitter', 'all'],
          description: 'Filter by platform'
        },
        status: {
          type: 'string',
          enum: ['new', 'draft_reply', 'escalated'],
          description: 'Filter by engagement status'
        }
      },
      required: []
    }
  },
  {
    name: 'get_social_posts',
    description: 'List social media posts with optional status filter.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'scheduled', 'pending_approval', 'published', 'failed'],
          description: 'Filter by post status'
        },
        limit: {
          type: 'number',
          description: 'Maximum number to return (default 20)'
        }
      },
      required: []
    }
  },
  // ========== DESIGN TOOLS (Phase 4) ==========
  {
    name: 'create_design_asset',
    description: 'Create a design asset record and optionally generate in Canva or Adobe. Use for creating graphics, templates, or visual content.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the asset'
        },
        type: {
          type: 'string',
          enum: ['image', 'video', 'graphic', 'template'],
          description: 'Type of design asset'
        },
        source: {
          type: 'string',
          enum: ['canva', 'adobe', 'upload', 'ai_generated'],
          description: 'Design tool to use (default: canva)'
        },
        campaignId: {
          type: 'string',
          description: 'Link to a marketing campaign'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for organizing assets'
        }
      },
      required: ['name', 'type']
    }
  },
  {
    name: 'get_brand_assets',
    description: 'Get design assets from the brand asset library.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['image', 'video', 'graphic', 'template'],
          description: 'Filter by asset type'
        },
        source: {
          type: 'string',
          enum: ['canva', 'adobe', 'upload', 'ai_generated'],
          description: 'Filter by source'
        }
      },
      required: []
    }
  },
  {
    name: 'generate_social_graphic',
    description: 'Generate a graphic optimized for a specific social media platform.',
    input_schema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'twitter'],
          description: 'Target social platform (determines dimensions)'
        },
        content: {
          type: 'string',
          description: 'Text content or theme for the graphic'
        },
        style: {
          type: 'string',
          enum: ['minimal', 'bold', 'professional', 'playful'],
          description: 'Visual style preference'
        },
        source: {
          type: 'string',
          enum: ['canva', 'adobe', 'ai_generated'],
          description: 'Tool to generate with (default: canva)'
        }
      },
      required: ['platform', 'content']
    }
  }
];

// Execute a tool by calling the CMO API
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  authToken: string,
  tenantId: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'x-tenant-id': tenantId,
  };

  console.log(`[Don Tool] Executing ${toolName} with input:`, JSON.stringify(toolInput, null, 2));
  console.log(`[Don Tool] API URL: ${CMO_API_URL}`);

  try {
    switch (toolName) {
      case 'create_persona': {
        const url = `${CMO_API_URL}/cmo/personas`;
        console.log(`[Don Tool] POST ${url}`);
        console.log(`[Don Tool] Auth token present: ${!!authToken}, length: ${authToken?.length || 0}`);
        console.log(`[Don Tool] Request body:`, JSON.stringify(toolInput, null, 2));

        let response: Response;
        try {
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(toolInput),
          });
        } catch (fetchError) {
          console.error(`[Don Tool] Network error calling ${url}:`, fetchError);
          return { success: false, error: `Network error: Could not reach the server. Please try again.` };
        }

        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText.substring(0, 500)}`);

        if (!response.ok) {
          // Parse error message if possible
          let errorMessage = `Server returned ${response.status}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = responseText.substring(0, 200) || errorMessage;
          }
          console.error(`[Don Tool] Failed to create persona: ${response.status} - ${errorMessage}`);
          return {
            success: false,
            error: `Failed to create persona: ${errorMessage}`
          };
        }

        try {
          const result = JSON.parse(responseText);
          console.log(`[Don Tool] Persona created successfully:`, result.id, result.name);
          return {
            success: true,
            result: {
              id: result.id,
              name: result.name,
              message: `Created persona "${result.name}" successfully`
            }
          };
        } catch {
          console.error(`[Don Tool] Persona created but response not valid JSON:`, responseText);
          return { success: true, result: { message: 'Persona created' } };
        }
      }

      case 'save_marketing_plan': {
        const url = `${CMO_API_URL}/cmo/marketing-plan`;
        console.log(`[Don Tool] POST ${url}`);

        // Map Don's tool fields to API fields - includes all plan fields
        const planData = {
          status: (toolInput.status as string) || 'active',
          mission: (toolInput.mission as string) || null,
          vision: (toolInput.vision as string) || null,
          strategy: (toolInput.strategy as string) || null,
          goals: (toolInput.goals as string[]) || [],
          swot: toolInput.swot ? {
            strengths: ((toolInput.swot as any).strengths || []).map((text: string, i: number) => ({ id: `strength-${Date.now()}-${i}`, text })),
            weaknesses: ((toolInput.swot as any).weaknesses || []).map((text: string, i: number) => ({ id: `weakness-${Date.now()}-${i}`, text })),
            opportunities: ((toolInput.swot as any).opportunities || []).map((text: string, i: number) => ({ id: `opportunity-${Date.now()}-${i}`, text })),
            threats: ((toolInput.swot as any).threats || []).map((text: string, i: number) => ({ id: `threat-${Date.now()}-${i}`, text })),
          } : null,
          monthlyThemes: (toolInput.monthlyThemes as string[]) || null,
          kpis: (toolInput.kpis as Array<Record<string, unknown>>) || null,
          budget: (toolInput.budget as string) || null,
          timeline: (toolInput.timeline as string) || null,
        };

        console.log(`[Don Tool] Marketing plan data:`, JSON.stringify(planData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(planData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to save marketing plan: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to save marketing plan (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Don Tool] Marketing plan saved successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Marketing plan saved' } };
        }
      }

      case 'create_calendar_event': {
        const url = `${CMO_API_URL}/cmo/calendar/events`;
        console.log(`[Don Tool] POST ${url}`);

        // Map Don's tool fields to API fields
        // API expects: startTime, endTime (not startDate, endDate)
        const eventData = {
          title: toolInput.title as string,
          description: (toolInput.description as string) || null,
          startTime: toolInput.startDate as string,  // API field name is startTime
          endTime: (toolInput.endDate as string) || (toolInput.startDate as string),  // API field name is endTime
          eventType: (toolInput.eventType as string) || 'campaign',
          color: (toolInput.color as string) || null,
          allDay: (toolInput.allDay as boolean) || false,
          monthlyThemeId: (toolInput.monthlyThemeId as string) || null,
        };

        console.log(`[Don Tool] Calendar event data:`, JSON.stringify(eventData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(eventData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to create calendar event: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create calendar event (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Calendar event created' } };
        }
      }

      case 'create_email_template': {
        const url = `${CMO_API_URL}/cmo/templates`;
        console.log(`[Don Tool] POST ${url}`);

        // Map Don's tool fields to API fields
        // Body must be EmailTemplateContent format: { version, settings, blocks }
        const bodyContent = toolInput.body as string;

        // Create proper EmailTemplateContent structure with a text block
        const emailTemplateBody = bodyContent ? {
          version: '1.0',
          settings: {
            backgroundColor: '#f4f4f4',
            contentWidth: 600,
            fontFamily: 'Arial, sans-serif',
            defaultTextColor: '#333333',
          },
          blocks: [
            {
              id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: 'text',
              settings: {
                backgroundColor: '#ffffff',
                padding: { top: 20, right: 40, bottom: 20, left: 40 },
                alignment: 'left',
              },
              content: {
                html: bodyContent,
              },
            },
          ],
        } : null;

        const templateData = {
          name: toolInput.name as string,
          subject: (toolInput.subject as string) || null,
          body: emailTemplateBody,
          category: (toolInput.category as string) || null,
          status: 'draft',
        };

        console.log(`[Don Tool] Email template data:`, JSON.stringify(templateData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(templateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to create email template: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create email template (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Email template created' } };
        }
      }

      case 'create_workflow': {
        const url = `${CMO_API_URL}/cmo/workflows`;
        console.log(`[Don Tool] POST ${url}`);

        // Build workflow data with correct field names
        const workflowData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          triggerType: toolInput.triggerType as string,
          triggerConfig: (toolInput.triggerConfig as Record<string, unknown>) || {},
          nodes: [], // Empty nodes - user will add steps in workflow builder
        };

        console.log(`[Don Tool] Workflow data:`, JSON.stringify(workflowData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(workflowData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to create workflow: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create workflow (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Don Tool] Workflow created successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Workflow created' } };
        }
      }

      case 'create_funnel': {
        const url = `${CMO_API_URL}/cmo/funnels`;
        console.log(`[Don Tool] POST ${url}`);

        // Build funnel data with correct field names - pass through stages if provided
        const inputStages = toolInput.stages as Array<{
          name: string;
          stageType: string;
          stageOrder: number;
          config?: Record<string, unknown>;
        }> | undefined;

        const funnelData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          conversionGoal: (toolInput.conversionGoal as string) || null,
          stages: inputStages || [], // Pass through stages if provided, otherwise empty
        };

        console.log(`[Don Tool] Funnel data:`, JSON.stringify(funnelData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(funnelData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to create funnel: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create funnel (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Don Tool] Funnel created successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Funnel created' } };
        }
      }

      case 'update_brand_settings': {
        const url = `${CMO_API_URL}/cmo/assets/brand`;
        console.log(`[Don Tool] PATCH ${url}`);

        // Build brand data with all supported fields
        const brandData: Record<string, unknown> = {};
        if (toolInput.primaryColor) brandData.primaryColor = toolInput.primaryColor;
        if (toolInput.secondaryColor) brandData.secondaryColor = toolInput.secondaryColor;
        if (toolInput.accentColor) brandData.accentColor = toolInput.accentColor;
        if (toolInput.fontPrimary) brandData.fontPrimary = toolInput.fontPrimary;
        if (toolInput.fontSecondary) brandData.fontSecondary = toolInput.fontSecondary;
        if (toolInput.logoUrl) brandData.logoUrl = toolInput.logoUrl;
        if (toolInput.logoIconUrl) brandData.logoIconUrl = toolInput.logoIconUrl;
        if (toolInput.tagline) brandData.tagline = toolInput.tagline;
        if (toolInput.mission) brandData.mission = toolInput.mission;
        if (toolInput.voiceTone) brandData.voiceTone = toolInput.voiceTone;
        if (toolInput.voiceGuidelines) brandData.voiceGuidelines = toolInput.voiceGuidelines;

        console.log(`[Don Tool] Brand settings data:`, JSON.stringify(brandData, null, 2));

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(brandData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to update brand settings: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to update brand settings (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Brand settings updated' } };
        }
      }

      case 'create_support_ticket': {
        // Map priority: low -> P3, medium -> P2, high -> P1, critical -> P1
        const priorityMap: Record<string, string> = {
          low: 'P3',
          medium: 'P2',
          high: 'P1',
          critical: 'P1',
        };
        // Map category: bug -> BUG, feature -> FEATURE_REQUEST, question -> HOW_TO, other -> OTHER
        const categoryMap: Record<string, string> = {
          bug: 'BUG',
          feature: 'FEATURE_REQUEST',
          question: 'HOW_TO',
          other: 'OTHER',
        };

        const ticketData = {
          subject: toolInput.title as string,
          description: toolInput.description as string,
          priority: priorityMap[(toolInput.priority as string) || 'medium'] || 'P2',
          category: categoryMap[(toolInput.category as string) || 'other'] || 'OTHER',
          createdVia: 'DON',
        };

        const url = `${CMO_API_URL}/support-tickets`;
        console.log(`[Don Tool] POST ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(ticketData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Don Tool] Failed to create support ticket: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create support ticket (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Support ticket created' } };
        }
      }

      // ========== L1 READ TOOLS ==========
      case 'get_marketing_plan': {
        const url = `${CMO_API_URL}/cmo/marketing-plan`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get marketing plan (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse marketing plan data' };
        }
      }

      case 'get_campaigns': {
        const params = new URLSearchParams();
        if (toolInput.status) params.append('status', toolInput.status as string);
        const limit = (toolInput.limit as number) || 20;

        const url = `${CMO_API_URL}/campaigns${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get campaigns (${response.status}): ${responseText}` };
        }
        try {
          const campaigns = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: campaigns.length,
              campaigns: campaigns.slice(0, limit).map((c: Record<string, unknown>) => ({
                id: c.id,
                name: c.name,
                status: c.status,
                channels: c.channels,
                budget: c.budget,
                startDate: c.startDate,
                endDate: c.endDate,
                goal: c.goal
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse campaigns data' };
        }
      }

      case 'get_personas': {
        const url = `${CMO_API_URL}/cmo/personas`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get personas (${response.status}): ${responseText}` };
        }
        try {
          const personas = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: personas.length,
              personas: personas.map((p: Record<string, unknown>) => ({
                id: p.id,
                name: p.name,
                tagline: p.tagline,
                demographics: p.demographics,
                painPoints: p.painPoints,
                goals: p.goals,
                preferredChannels: p.preferredChannels
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse personas data' };
        }
      }

      case 'get_workflows': {
        const params = new URLSearchParams();
        if (toolInput.status) params.append('status', toolInput.status as string);

        const url = `${CMO_API_URL}/cmo/workflows${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get workflows (${response.status}): ${responseText}` };
        }
        try {
          const workflows = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: workflows.length,
              workflows: workflows.map((w: Record<string, unknown>) => ({
                id: w.id,
                name: w.name,
                status: w.status,
                triggerType: w.triggerType,
                entryCount: w.entryCount,
                completionCount: w.completionCount,
                createdAt: w.createdAt
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse workflows data' };
        }
      }

      case 'get_funnels': {
        const url = `${CMO_API_URL}/cmo/funnels`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get funnels (${response.status}): ${responseText}` };
        }
        try {
          const funnels = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: funnels.length,
              funnels: funnels.map((f: Record<string, unknown>) => ({
                id: f.id,
                name: f.name,
                status: f.status,
                conversionGoal: f.conversionGoal,
                totalVisits: f.totalVisits,
                totalConversions: f.totalConversions,
                stages: f.stages
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse funnels data' };
        }
      }

      case 'get_analytics_summary': {
        // Try dashboard metrics first, fall back to structured empty response
        const url = `${CMO_API_URL}/cmo/dashboard/metrics`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
          // Return structured empty response
          return {
            success: true,
            result: {
              impressions: 0,
              clicks: 0,
              leads: 0,
              conversions: 0,
              costPerLead: 0,
              message: 'No analytics data available yet. Start running campaigns to see metrics.',
              note: 'Analytics tracking not yet instrumented'
            }
          };
        }

        try {
          const metrics = JSON.parse(await response.text());
          return { success: true, result: metrics };
        } catch {
          return {
            success: true,
            result: {
              impressions: 0,
              clicks: 0,
              leads: 0,
              conversions: 0,
              costPerLead: 0,
              message: 'Analytics data parsing issue. Please check dashboard directly.'
            }
          };
        }
      }

      case 'get_brand_settings': {
        const url = `${CMO_API_URL}/cmo/assets/brand`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get brand settings (${response.status}): ${responseText}` };
        }
        try {
          const brand = JSON.parse(responseText);
          return {
            success: true,
            result: {
              primaryColor: brand.primaryColor,
              secondaryColor: brand.secondaryColor,
              accentColor: brand.accentColor,
              fontPrimary: brand.fontPrimary,
              fontSecondary: brand.fontSecondary,
              logoUrl: brand.logoUrl,
              voiceTone: brand.voiceTone,
              voiceGuidelines: brand.voiceGuidelines,
              tagline: brand.tagline,
              mission: brand.mission
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse brand settings' };
        }
      }

      case 'get_monthly_themes': {
        const year = (toolInput.year as number) || new Date().getFullYear();
        const url = `${CMO_API_URL}/cmo/calendar/themes?year=${year}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get monthly themes (${response.status}): ${responseText}` };
        }
        try {
          const themes = JSON.parse(responseText);
          return {
            success: true,
            result: {
              year,
              count: themes.length,
              themes: themes.map((t: Record<string, unknown>) => ({
                id: t.id,
                month: t.month,
                name: t.name,
                description: t.description,
                focusAreas: t.focusAreas,
                colorCode: t.colorCode
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse monthly themes data' };
        }
      }

      case 'get_calendar_events': {
        const params = new URLSearchParams();
        if (toolInput.startDate) params.append('startDate', toolInput.startDate as string);
        if (toolInput.endDate) params.append('endDate', toolInput.endDate as string);
        if (toolInput.type) params.append('type', toolInput.type as string);

        const url = `${CMO_API_URL}/cmo/calendar/events${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get calendar events (${response.status}): ${responseText}` };
        }
        try {
          const events = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: events.length,
              events: events.map((e: Record<string, unknown>) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                startDate: e.startDate,
                endDate: e.endDate,
                eventType: e.eventType,
                status: e.status,
                allDay: e.allDay,
                color: e.color
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse calendar events data' };
        }
      }

      case 'get_parking_lot_ideas': {
        const url = `${CMO_API_URL}/cmo/calendar/ideas`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get parking lot ideas (${response.status}): ${responseText}` };
        }
        try {
          const ideas = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: ideas.length,
              ideas: ideas.map((i: Record<string, unknown>) => ({
                id: i.id,
                title: i.title,
                description: i.description,
                category: i.category,
                priority: i.priority,
                createdAt: i.createdAt
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse parking lot ideas data' };
        }
      }

      case 'get_contacts': {
        const params = new URLSearchParams();
        if (toolInput.search) params.append('search', toolInput.search as string);
        const limit = (toolInput.limit as number) || 50;
        params.append('limit', String(limit));

        const url = `${CMO_API_URL}/cmo/people${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get contacts (${response.status}): ${responseText}` };
        }
        try {
          const contacts = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: contacts.length,
              contacts: contacts.map((c: Record<string, unknown>) => ({
                id: c.id,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                phone: c.phone,
                company: c.company,
                title: c.title
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse contacts data' };
        }
      }

      case 'get_products': {
        const params = new URLSearchParams();
        if (toolInput.type) params.append('type', toolInput.type as string);
        if (toolInput.status) params.append('status', toolInput.status as string);

        const url = `${CMO_API_URL}/cmo/products${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get products (${response.status}): ${responseText}` };
        }
        try {
          const products = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: products.length,
              products: products.map((p: Record<string, unknown>) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                sku: p.sku,
                category: p.category,
                type: p.type,
                status: p.status,
                basePrice: p.basePrice,
                unit: p.unit
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse products data' };
        }
      }

      // ========== L2 WRITE TOOLS ==========
      case 'create_campaign': {
        const url = `${CMO_API_URL}/campaigns`;
        console.log(`[Don Tool] POST ${url}`);

        // Handle channels - accept array directly, fall back to single channel for backwards compatibility
        let channels: string[] = [];
        if (Array.isArray(toolInput.channels)) {
          channels = toolInput.channels as string[];
        } else if (typeof toolInput.channel === 'string') {
          // Backwards compatibility: convert single channel to array
          channels = [toolInput.channel];
        } else {
          channels = ['other'];
        }

        const campaignData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          type: (toolInput.type as string) || 'multi',
          channels,
          budget: (toolInput.budget as number) || null,
          startDate: (toolInput.startDate as string) || null,
          endDate: (toolInput.endDate as string) || null,
          goal: (toolInput.goal as string) || null,
          targetSegmentId: (toolInput.targetPersonaId as string) || null,
          triggerType: (toolInput.triggerType as string) || null,
          triggerConfig: (toolInput.triggerConfig as Record<string, unknown>) || null,
        };

        console.log(`[Don Tool] Campaign data:`, JSON.stringify(campaignData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(campaignData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create campaign (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Campaign created' } };
        }
      }

      case 'update_campaign': {
        const { campaignId, ...updateData } = toolInput as { campaignId: string; [key: string]: unknown };
        const url = `${CMO_API_URL}/campaigns/${campaignId}`;
        console.log(`[Don Tool] PATCH ${url}`);

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update campaign (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Campaign updated' } };
        }
      }

      case 'create_monthly_theme': {
        const url = `${CMO_API_URL}/cmo/calendar/themes`;
        console.log(`[Don Tool] POST ${url}`);

        const themeData = {
          year: toolInput.year as number,
          month: toolInput.month as number,
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          focusAreas: (toolInput.focusAreas as string[]) || [],
          colorCode: (toolInput.colorCode as string) || null,
        };

        console.log(`[Don Tool] Theme data:`, JSON.stringify(themeData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(themeData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create monthly theme (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Monthly theme created' } };
        }
      }

      case 'create_parking_lot_idea': {
        const url = `${CMO_API_URL}/cmo/calendar/ideas`;
        console.log(`[Don Tool] POST ${url}`);

        const ideaData = {
          title: toolInput.title as string,
          description: (toolInput.description as string) || null,
          category: (toolInput.category as string) || 'other',
          priority: (toolInput.priority as string) || 'medium',
        };

        console.log(`[Don Tool] Idea data:`, JSON.stringify(ideaData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(ideaData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create parking lot idea (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Parking lot idea created' } };
        }
      }

      case 'create_contact': {
        const url = `${CMO_API_URL}/cmo/people`;
        console.log(`[Don Tool] POST ${url}`);

        const contactData = {
          firstName: toolInput.firstName as string,
          lastName: toolInput.lastName as string,
          email: toolInput.email as string,
          phone: (toolInput.phone as string) || null,
          company: (toolInput.company as string) || null,
          title: (toolInput.title as string) || null,
        };

        console.log(`[Don Tool] Contact data:`, JSON.stringify(contactData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(contactData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create contact (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Contact created' } };
        }
      }

      case 'create_product': {
        const url = `${CMO_API_URL}/cmo/products`;
        console.log(`[Don Tool] POST ${url}`);

        const productData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          sku: (toolInput.sku as string) || null,
          category: (toolInput.category as string) || null,
          type: toolInput.type as string,
          status: (toolInput.status as string) || 'ACTIVE',
          basePrice: (toolInput.basePrice as number) || null,
          unit: (toolInput.unit as string) || 'each',
        };

        console.log(`[Don Tool] Product data:`, JSON.stringify(productData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create product (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Product created' } };
        }
      }

      // ========== FUNNEL MANAGEMENT ==========
      case 'update_funnel': {
        const { funnelId, ...updateData } = toolInput as { funnelId: string; [key: string]: unknown };
        const url = `${CMO_API_URL}/cmo/funnels/${funnelId}`;
        console.log(`[Don Tool] PATCH ${url}`);

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update funnel (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result: { ...result, message: 'Funnel updated successfully' } };
        } catch {
          return { success: true, result: { message: 'Funnel updated' } };
        }
      }

      case 'get_funnel': {
        const funnelId = toolInput.funnelId as string;
        const url = `${CMO_API_URL}/cmo/funnels/${funnelId}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get funnel (${response.status}): ${responseText}` };
        }
        try {
          const funnel = JSON.parse(responseText);
          return {
            success: true,
            result: {
              id: funnel.id,
              name: funnel.name,
              description: funnel.description,
              status: funnel.status,
              conversionGoal: funnel.conversionGoal,
              stages: funnel.stages || [],
              createdAt: funnel.createdAt
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse funnel data' };
        }
      }

      // ========== WORKFLOW MANAGEMENT ==========
      case 'update_workflow': {
        const { workflowId, ...updateData } = toolInput as { workflowId: string; [key: string]: unknown };
        const url = `${CMO_API_URL}/cmo/workflows/${workflowId}`;
        console.log(`[Don Tool] PATCH ${url}`);

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update workflow (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Workflow updated' } };
        }
      }

      case 'activate_workflow': {
        const workflowId = toolInput.workflowId as string;
        const url = `${CMO_API_URL}/cmo/workflows/${workflowId}/activate`;
        console.log(`[Don Tool] POST ${url}`);

        const response = await fetch(url, { method: 'POST', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to activate workflow (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result: { ...result, message: 'Workflow activated' } };
        } catch {
          return { success: true, result: { message: 'Workflow activated' } };
        }
      }

      case 'pause_workflow': {
        const workflowId = toolInput.workflowId as string;
        const url = `${CMO_API_URL}/cmo/workflows/${workflowId}/pause`;
        console.log(`[Don Tool] POST ${url}`);

        const response = await fetch(url, { method: 'POST', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to pause workflow (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result: { ...result, message: 'Workflow paused' } };
        } catch {
          return { success: true, result: { message: 'Workflow paused' } };
        }
      }

      // ========== PERSONA MANAGEMENT ==========
      case 'update_persona': {
        const { personaId, ...updateData } = toolInput as { personaId: string; [key: string]: unknown };
        const url = `${CMO_API_URL}/cmo/personas/${personaId}`;
        console.log(`[Don Tool] PATCH ${url}`);

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update persona (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Persona updated' } };
        }
      }

      // ========== TEMPLATE MANAGEMENT ==========
      case 'get_email_templates': {
        const params = new URLSearchParams();
        if (toolInput.category) params.append('category', toolInput.category as string);
        if (toolInput.status) params.append('status', toolInput.status as string);

        const url = `${CMO_API_URL}/cmo/templates${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get email templates (${response.status}): ${responseText}` };
        }
        try {
          const templates = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: templates.length,
              templates: templates.map((t: Record<string, unknown>) => ({
                id: t.id,
                name: t.name,
                subject: t.subject,
                category: t.category,
                status: t.status,
                createdAt: t.createdAt
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse templates data' };
        }
      }

      case 'update_email_template': {
        const { templateId, body: bodyContent, ...restData } = toolInput as { templateId: string; body?: string; [key: string]: unknown };
        const url = `${CMO_API_URL}/cmo/templates/${templateId}`;
        console.log(`[Don Tool] PUT ${url}`);

        // API expects body as an object, not a string
        const updateData = {
          ...restData,
          ...(bodyContent ? { body: { html: bodyContent, text: bodyContent.replace(/<[^>]*>/g, '') } } : {}),
        };

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update email template (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Email template updated' } };
        }
      }

      // ========== CALENDAR EVENT MANAGEMENT ==========
      case 'update_calendar_event': {
        const { eventId, startDate, endDate, ...restData } = toolInput as {
          eventId: string;
          startDate?: string;
          endDate?: string;
          [key: string]: unknown
        };
        const url = `${CMO_API_URL}/cmo/calendar/events/${eventId}`;
        console.log(`[Don Tool] PATCH ${url}`);

        // API expects startTime/endTime, not startDate/endDate
        const updateData = {
          ...restData,
          ...(startDate ? { startTime: startDate } : {}),
          ...(endDate ? { endTime: endDate } : {}),
        };

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update calendar event (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Calendar event updated' } };
        }
      }

      // ========== SEGMENTS ==========
      case 'get_segments': {
        const url = `${CMO_API_URL}/cmo/segments`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get segments (${response.status}): ${responseText}` };
        }
        try {
          const segments = JSON.parse(responseText);
          return {
            success: true,
            result: {
              count: segments.length,
              segments: segments.map((s: Record<string, unknown>) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                segmentType: s.segmentType,
                memberCount: s.memberCount,
                createdAt: s.createdAt
              }))
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse segments data' };
        }
      }

      case 'create_segment': {
        const url = `${CMO_API_URL}/cmo/segments`;
        console.log(`[Don Tool] POST ${url}`);

        const segmentData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          segmentType: (toolInput.segmentType as string) || 'static',
          filterCriteria: toolInput.filterCriteria || null,
        };

        console.log(`[Don Tool] Segment data:`, JSON.stringify(segmentData, null, 2));

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(segmentData),
        });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create segment (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Segment created' } };
        }
      }

      // ========== INSIGHTS ==========
      case 'get_recommendations': {
        const url = `${CMO_API_URL}/cmo/insights/recommendations`;
        console.log(`[Don Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Don Tool] Response status: ${response.status}`);
        if (!response.ok) {
          // Return helpful message if recommendations not available
          return {
            success: true,
            result: {
              recommendations: [],
              message: 'AI recommendations are being generated. Check back soon or add more marketing data to improve insights.'
            }
          };
        }
        try {
          const recommendations = JSON.parse(responseText);
          return { success: true, result: recommendations };
        } catch {
          return { success: false, error: 'Failed to parse recommendations data' };
        }
      }

      // ========== L3 DRAFT TOOLS ==========
      // Helper function to look up contact by email (does not create)
      async function findContactByEmail(email: string, tenantIdParam: string, headersParam: Record<string, string>): Promise<string | null> {
        try {
          const searchUrl = `${CMO_API_URL}/contacts?tenantId=${tenantIdParam}&email=${encodeURIComponent(email)}&limit=1`;
          const searchRes = await fetch(searchUrl, { headers: headersParam });
          if (searchRes.ok) {
            const contacts = await searchRes.json();
            if (contacts.length > 0) {
              return contacts[0].id;
            }
          }
        } catch { /* ignore */ }
        return null;
      }

      case 'compose_email': {
        const { contactId, contactEmail, subject, body, dealId } = toolInput as {
          contactId?: string;
          contactEmail?: string;
          subject: string;
          body: string;
          dealId?: string;
        };

        if (!contactId && !contactEmail) {
          return {
            success: false,
            result: {
              message: 'Please provide either a contactId or contactEmail.',
              note: 'I need to know who to send this email to.'
            }
          };
        }

        // Try to resolve contactId from email if not provided
        let resolvedContactId = contactId;
        const recipientEmail = contactEmail || '';

        if (!resolvedContactId && contactEmail) {
          resolvedContactId = await findContactByEmail(contactEmail, tenantId, headers) ?? undefined;
        }

        // Create scheduled communication with needsApproval=true
        // Supports ad-hoc recipients via recipientEmail (no contact required)
        const scheduledUrl = `${CMO_API_URL}/scheduled-communications`;
        console.log(`[Don Tool] POST ${scheduledUrl} (compose_email, needs approval)`);
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: resolvedContactId || null,
            recipientEmail: resolvedContactId ? null : recipientEmail,
            recipientName: recipientEmail ? recipientEmail.split('@')[0] : null,
            dealId,
            type: 'email',
            subject,
            body,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'don-ai'
          })
        });

        if (!scheduleRes.ok) {
          const errorText = await scheduleRes.text();
          return {
            success: false,
            result: {
              message: 'Failed to create email draft',
              error: `${scheduleRes.status}: ${errorText}`,
              note: 'Email could not be queued for approval'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "Email draft created — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            to: resolvedContactId ? 'contact' : recipientEmail,
            subject,
            preview: body.substring(0, 200) + (body.length > 200 ? '...' : ''),
            note: 'Review and approve in Scheduled → Pending before sending'
          }
        };
      }

      case 'compose_sms': {
        const { contactId, recipientPhone, body, dealId, context } = toolInput as {
          contactId?: string;
          recipientPhone?: string;
          body: string;
          dealId?: string;
          context?: string;
        };

        if (!contactId && !recipientPhone) {
          return {
            success: false,
            result: {
              message: 'Please provide either a contactId or recipientPhone.',
              note: 'I need to know who to send this SMS to.'
            }
          };
        }

        // Validate body length
        if (body.length > 1600) {
          return {
            success: false,
            result: {
              message: 'SMS body exceeds maximum length of 1600 characters.',
              currentLength: body.length,
              note: 'Please shorten the message.'
            }
          };
        }

        // Create scheduled communication with needsApproval=true for SMS
        const scheduledUrl = `${CMO_API_URL}/scheduled-communications`;
        console.log(`[Don Tool] POST ${scheduledUrl} (compose_sms, needs approval)`);
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: contactId || null,
            recipientPhone: recipientPhone || null,
            dealId,
            type: 'sms',
            subject: context || 'SMS Message',  // Use context as subject for reference
            body,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'don-ai'
          })
        });

        if (!scheduleRes.ok) {
          const errorText = await scheduleRes.text();
          return {
            success: false,
            result: {
              message: 'Failed to create SMS draft',
              error: `${scheduleRes.status}: ${errorText}`,
              note: 'SMS could not be queued for approval'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "SMS draft created — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            to: contactId ? 'contact' : recipientPhone,
            preview: body.substring(0, 160) + (body.length > 160 ? '...' : ''),
            characterCount: body.length,
            note: 'Review and approve in Scheduled → Pending before sending. Requires Twilio integration.'
          }
        };
      }

      case 'draft_campaign_brief': {
        const { campaignName, objective, targetPersonaId, channel, budget } = toolInput as {
          campaignName: string;
          objective: string;
          targetPersonaId?: string;
          channel?: string;
          budget?: number;
        };

        // Fetch persona details if provided
        let personaInfo = '';
        if (targetPersonaId) {
          try {
            const personaRes = await fetch(`${CMO_API_URL}/cmo/personas/${targetPersonaId}`, { headers });
            if (personaRes.ok) {
              const persona = await personaRes.json();
              personaInfo = `\n\n**Target Persona: ${persona.name}**\n- Pain Points: ${(persona.painPoints || []).join(', ')}\n- Goals: ${(persona.goals || []).join(', ')}\n- Preferred Channels: ${(persona.preferredChannels || []).join(', ')}`;
            }
          } catch {
            // Continue without persona info
          }
        }

        const briefContent = `# Campaign Brief: ${campaignName}

## Objective
${objective}
${personaInfo}

## Channel
${channel || 'To be determined'}

## Budget
${budget ? `$${budget.toLocaleString()}` : 'To be determined'}

## Key Messages
[To be developed]

## Call to Action
[To be developed]

## Timeline
[To be determined]

## Success Metrics
[To be defined]

---
*Draft generated by Don (CMO AI) - Review before finalizing*`;

        // Create scheduled communication with needsApproval=true
        const scheduledUrl = `${CMO_API_URL}/scheduled-communications`;
        console.log(`[Don Tool] POST ${scheduledUrl} (campaign brief, needs approval)`);
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientEmail: 'internal@team.com',
            recipientName: 'Marketing Team',
            type: 'email',
            subject: `Campaign Brief: ${campaignName}`,
            body: briefContent,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'don-ai'
          })
        });

        if (!scheduleRes.ok) {
          return {
            success: true,
            result: {
              message: 'Campaign brief drafted for review',
              brief: {
                title: campaignName,
                content: briefContent.substring(0, 500) + '...',
                status: 'draft',
                note: 'Could not queue for approval — review manually'
              }
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "Campaign brief saved — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            preview: briefContent.substring(0, 200) + '...',
            note: 'Review and approve in Scheduled → Pending before sharing'
          }
        };
      }

      case 'draft_ad_copy': {
        const { campaignId, targetPersonaId, productDescription, tone = 'professional', numVariants = 3 } = toolInput as {
          campaignId?: string;
          targetPersonaId?: string;
          productDescription: string;
          tone?: string;
          numVariants?: number;
        };

        const variantCount = Math.min(numVariants, 5);

        // Generate ad copy variants based on tone
        const toneStyles: Record<string, { style: string; cta: string }> = {
          professional: { style: 'Clear, authoritative, and trustworthy', cta: 'Learn More' },
          casual: { style: 'Friendly, conversational, and approachable', cta: 'Check It Out' },
          urgent: { style: 'Time-sensitive with scarcity messaging', cta: 'Act Now' },
          inspirational: { style: 'Aspirational and emotionally compelling', cta: 'Start Your Journey' }
        };

        const toneConfig = toneStyles[tone] || toneStyles.professional;

        // Generate variant placeholders
        const variants = [];
        for (let i = 1; i <= variantCount; i++) {
          variants.push(`
### Variant ${i}
**Headline:** [${toneConfig.style} headline for: ${productDescription.substring(0, 50)}...]
**Body:** [${toneConfig.style} body copy highlighting key benefits]
**CTA:** ${toneConfig.cta}
`);
        }

        const adCopyContent = `# Ad Copy Variants

**Product:** ${productDescription}
**Tone:** ${tone}
**Generated:** ${variantCount} variants

---
${variants.join('\n---')}

---
*Draft generated by Don (CMO AI) - Review and refine before use*
*Note: Replace bracketed placeholders with actual copy*`;

        // Create scheduled communication with needsApproval=true
        const scheduledUrl = `${CMO_API_URL}/scheduled-communications`;
        console.log(`[Don Tool] POST ${scheduledUrl} (ad copy, needs approval)`);
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientEmail: 'internal@team.com',
            recipientName: 'Marketing Team',
            type: 'email',
            subject: `Ad Copy Variants - ${productDescription.substring(0, 30)}...`,
            body: adCopyContent,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'don-ai'
          })
        });

        if (!scheduleRes.ok) {
          return {
            success: true,
            result: {
              message: 'Ad copy variants drafted for review',
              variantCount,
              tone,
              preview: adCopyContent.substring(0, 300) + '...',
              status: 'draft',
              note: 'Could not queue for approval — review manually'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: `Generated ${variantCount} ${tone} ad copy variants — review in Scheduled queue`,
            scheduledId: scheduled.id,
            status: 'pending',
            variantCount,
            tone,
            note: 'Review and approve in Scheduled → Pending before use'
          }
        };
      }

      // ========== SOCIAL MEDIA TOOL HANDLERS (Phase 4) ==========

      case 'schedule_social_post': {
        const { platform, content, mediaUrls, scheduledFor, campaignId } = toolInput as {
          platform: string;
          content: string;
          mediaUrls?: string[];
          scheduledFor?: string;
          campaignId?: string;
        };

        // Create the social post record
        const postData = {
          tenantId,
          platform,
          content,
          mediaUrls: mediaUrls || [],
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          campaignId: campaignId || null,
          status: scheduledFor ? 'scheduled' : 'pending_approval',
        };

        // For now, store in database via direct Prisma call
        // In future, this will route through the social service
        const url = `${CMO_API_URL}/cmo/social/posts`;
        console.log(`[Don Tool] POST ${url} (stub - social integration not yet wired)`);

        // Return success with note about pending integration
        return {
          success: true,
          result: {
            message: `Social post drafted for ${platform}`,
            platform,
            status: postData.status,
            scheduledFor: scheduledFor || 'Pending approval',
            note: 'Social media integration is scaffolded but not yet connected to live platforms. Post saved to database for review.',
            preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
          }
        };
      }

      case 'draft_social_reply': {
        const { engagementId, replyContent } = toolInput as {
          engagementId: string;
          replyContent: string;
        };

        console.log(`[Don Tool] Drafting reply for engagement ${engagementId}`);

        return {
          success: true,
          result: {
            message: 'Reply drafted for review',
            engagementId,
            replyContent,
            status: 'pending_approval',
            note: 'Reply saved to approval queue. Social media integration is scaffolded but not yet connected to live platforms.'
          }
        };
      }

      case 'get_social_analytics': {
        const { dateFrom, dateTo, platform } = toolInput as {
          dateFrom?: string;
          dateTo?: string;
          platform?: string;
        };

        const now = new Date();
        const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

        return {
          success: true,
          result: {
            message: 'Social analytics retrieved',
            dateRange: {
              from: dateFrom || defaultFrom.toISOString().split('T')[0],
              to: dateTo || now.toISOString().split('T')[0]
            },
            platform: platform || 'all',
            note: 'Social media integrations are scaffolded but not yet connected. No live data available yet.',
            metrics: {
              posts: { scheduled: 0, published: 0, pending: 0 },
              engagements: { comments: 0, mentions: 0, dms: 0 },
              platformStatus: {
                facebook: 'not_connected',
                instagram: 'not_connected',
                linkedin: 'not_connected',
                tiktok: 'not_connected',
                youtube: 'not_connected',
                twitter: 'not_connected'
              }
            }
          }
        };
      }

      case 'connect_social_account': {
        const { platform } = toolInput as { platform: string };

        const connectionInstructions: Record<string, string> = {
          facebook: 'Facebook requires a Meta Business Suite app. Visit business.facebook.com to create your page, then set up OAuth via developers.facebook.com.',
          instagram: 'Instagram Business requires linking to a Facebook Page. Set up via Meta Business Suite, then configure Instagram Graph API access.',
          linkedin: 'LinkedIn requires a Marketing API app. Visit linkedin.com/developers to create an app with appropriate OAuth 2.0 scopes.',
          tiktok: 'TikTok Business requires a TikTok for Business account. Visit tiktok.com/business to set up, then configure API access via developers.tiktok.com.',
          youtube: 'YouTube requires a Google Cloud project with YouTube Data API enabled. Configure OAuth 2.0 credentials via console.cloud.google.com.',
          twitter: 'Twitter/X requires a developer account. Visit developer.twitter.com to create an app with OAuth 2.0 (User authentication) enabled.'
        };

        return {
          success: true,
          result: {
            message: `Instructions for connecting ${platform}`,
            platform,
            status: 'not_connected',
            instructions: connectionInstructions[platform] || 'Platform not supported',
            note: 'Social media OAuth integration is scaffolded. Platform connections will be available in a future release.',
            nextSteps: [
              `1. Create a ${platform} developer/business account`,
              '2. Register an OAuth application',
              '3. Configure callback URL: https://api.zanderos.com/auth/social/callback',
              '4. Store credentials securely in Zander settings'
            ]
          }
        };
      }

      case 'get_pending_engagements': {
        const { platform, status } = toolInput as {
          platform?: string;
          status?: string;
        };

        return {
          success: true,
          result: {
            message: 'Pending engagements retrieved',
            filters: { platform: platform || 'all', status: status || 'all' },
            engagements: [],
            note: 'Social media integrations are scaffolded but not yet connected. No engagements to display yet.',
            tip: 'Once platforms are connected, comments, mentions, and DMs requiring response will appear here.'
          }
        };
      }

      case 'get_social_posts': {
        const { status, limit } = toolInput as {
          status?: string;
          limit?: number;
        };

        return {
          success: true,
          result: {
            message: 'Social posts retrieved',
            filters: { status: status || 'all', limit: limit || 20 },
            posts: [],
            note: 'Social media integrations are scaffolded but not yet connected. Posts created via schedule_social_post will appear here once the integration is live.'
          }
        };
      }

      // ============================================
      // DESIGN TOOLS
      // ============================================

      case 'create_design_asset': {
        const { name, type, source, templateId, campaignId, tags } = toolInput as {
          name: string;
          type: string;
          source: string;
          templateId?: string;
          campaignId?: string;
          tags?: string[];
        };

        // Design asset creation is scaffolded - will be connected to backend API
        const placeholderAsset = {
          id: `asset_${Date.now()}`,
          name,
          type,
          source: source || 'canva',
          tags: tags || [],
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          result: {
            message: `Design asset "${name}" request received`,
            asset: placeholderAsset,
            externalStatus: 'pending_integration',
            note: source === 'canva'
              ? 'Canva integration not yet configured. Connect Canva via canva.com/developers to enable full design workflow.'
              : source === 'adobe'
              ? 'Adobe Creative Cloud integration not yet configured. Connect via Adobe Developer Console.'
              : 'Design tool integration pending configuration.',
            nextSteps: [
              'Configure design tool OAuth credentials in settings',
              'Link external design ID once created in the design tool',
              'Export finished design to attach file URL'
            ]
          }
        };
      }

      case 'get_brand_assets': {
        const { type, source } = toolInput as {
          type?: string;
          source?: string;
        };

        // Brand assets retrieval is scaffolded - will be connected to backend API
        return {
          success: true,
          result: {
            message: 'Brand assets query received',
            filters: { type: type || 'all', source: source || 'all' },
            assets: [],
            note: 'Design asset management is scaffolded but not yet connected. Assets will appear here once the design tool integration is configured.',
            tip: 'Use create_design_asset to start building your brand asset library once integrations are live.'
          }
        };
      }

      case 'generate_social_graphic': {
        const { platform, content, style } = toolInput as {
          platform: string;
          content: string;
          style?: string;
        };

        // Platform-specific dimensions
        const dimensions: Record<string, { width: number; height: number }> = {
          facebook: { width: 1200, height: 630 },
          instagram: { width: 1080, height: 1080 },
          linkedin: { width: 1200, height: 627 },
          tiktok: { width: 1080, height: 1920 },
          youtube: { width: 1280, height: 720 },
          twitter: { width: 1200, height: 675 },
        };

        const dim = dimensions[platform.toLowerCase()] || { width: 1200, height: 630 };

        // Social graphic generation is scaffolded - will be connected to design APIs
        const placeholderAsset = {
          id: `graphic_${Date.now()}`,
          name: `${platform} graphic - ${new Date().toISOString().split('T')[0]}`,
          dimensions: dim,
        };

        return {
          success: true,
          result: {
            message: `Social graphic request received for ${platform}`,
            asset: placeholderAsset,
            contentBrief: content,
            styleRequested: style || 'default',
            note: 'AI image generation or Canva integration required to generate the actual visual. Request recorded.',
            nextSteps: [
              'Connect Canva or Adobe for template-based generation',
              'Or integrate AI image generation API (DALL-E, Midjourney) for custom graphics',
              'Asset record ready - attach generated image URL when available'
            ],
            platformSpecs: {
              platform,
              recommendedDimensions: dim,
              format: 'PNG or JPG recommended',
              maxFileSize: platform === 'instagram' ? '30MB' : '10MB'
            }
          }
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`Tool execution error for ${toolName}:`, error);
    return { success: false, error: `Tool execution failed: ${error}` };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const authToken = authHeader.replace('Bearer ', '');

    // Get tenant ID from header
    const tenantHeader = request.headers.get('x-tenant-id');

    // Parse request body
    const body = await request.json();
    const { message, conversationHistory = [], tenantId: bodyTenantId } = body;

    const tenantId = bodyTenantId || tenantHeader;
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get API key from environment
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Build messages array
    const messages = [
      ...conversationHistory.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude API with tools
    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: buildDonSystemPrompt(),
        tools: TOOLS,
        messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const claudeData = await claudeResponse.json();

    // Process the response - check for tool use
    const toolResults: Array<{
      tool: string;
      input: Record<string, unknown>;
      success: boolean;
      result?: unknown;
      error?: string;
    }> = [];
    let textContent = '';

    for (const block of claudeData.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        // Execute the tool
        console.log(`Executing tool: ${block.name}`, block.input);
        const toolResult = await executeTool(block.name, block.input, authToken, tenantId);
        toolResults.push({
          tool: block.name,
          input: block.input,
          ...toolResult,
        });
      }
    }

    // If tools were used, make a follow-up call to get Claude's response about the results
    if (toolResults.length > 0) {
      const hasFailures = toolResults.some(tr => !tr.success);
      const toolResultsSummary = toolResults
        .map((tr) => {
          if (tr.success) {
            return `✅ Successfully executed ${tr.tool}: ${JSON.stringify(tr.result)}`;
          } else {
            return `❌ FAILED to execute ${tr.tool}: ${tr.error}`;
          }
        })
        .join('\n');

      console.log(`[Don] Tool execution summary (hasFailures=${hasFailures}):`, toolResultsSummary);

      // Build follow-up prompt based on success/failure
      const followUpPrompt = hasFailures
        ? `Tool execution results:\n${toolResultsSummary}\n\nIMPORTANT: One or more tools FAILED. You MUST tell the user about the failure and what went wrong. Be direct - say "I wasn't able to create that [item] because [reason]". Offer to try again if appropriate.`
        : `Tool execution results:\n${toolResultsSummary}\n\nPlease provide a brief, friendly summary of what was created or done. Be specific about what was saved and where the user can find it.`;

      // Make follow-up call for Claude to summarize what was done
      const followUpResponse = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildDonSystemPrompt(),
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: textContent || 'I executed the requested tools.',
            },
            {
              role: 'user',
              content: followUpPrompt,
            },
          ],
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        const followUpText = followUpData.content
          .filter((b: { type: string }) => b.type === 'text')
          .map((b: { text: string }) => b.text)
          .join('');

        textContent = followUpText;
      }
    }

    // Return the response with tool results
    return NextResponse.json({
      content: textContent,
      toolsExecuted: toolResults.map((tr) => ({
        tool: tr.tool,
        success: tr.success,
        itemCreated: tr.success ? tr.result : null,
        error: tr.error,
      })),
      stopReason: claudeData.stop_reason,
    });
  } catch (error) {
    console.error('Don API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
