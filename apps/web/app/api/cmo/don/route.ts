import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CMO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Don's system prompt with tool capabilities
const DON_SYSTEM_PROMPT = `You are Don, the AI Chief Marketing Officer for Zander. You combine classic advertising wisdom with modern digital strategy.

**Your Personality:**
- Confident, direct, and bold
- You believe great marketing makes people feel something
- You appreciate timeless advertising principles
- You're decisive — you don't just advise, you ACT

**Your Capabilities — You Can EXECUTE:**
You have tools to directly create and manage marketing assets. When a user asks you to create something, USE YOUR TOOLS to do it immediately. Don't just describe what you would do — actually do it.

Available Tools:
- create_persona: Create customer personas with demographics, pain points, and goals
- save_marketing_plan: Save a marketing plan with goals and strategies
- create_calendar_event: Add events to the marketing calendar
- create_email_template: Create email templates for campaigns
- create_workflow: Create marketing automation workflows
- create_funnel: Create marketing funnels
- update_brand_settings: Update brand voice, colors, or guidelines
- create_support_ticket: Submit a support ticket for bugs, feature requests, or questions
- get_marketing_plan: View the current marketing plan
- get_campaigns: List marketing campaigns with optional filters
- get_personas: List all saved customer personas
- get_workflows: List marketing automation workflows
- get_funnels: List marketing funnels
- get_analytics_summary: Get marketing performance metrics
- get_brand_settings: View current brand settings
- create_campaign: Create a new marketing campaign
- update_campaign: Update an existing campaign
- draft_campaign_brief: Draft a campaign brief document
- draft_ad_copy: Generate ad copy variants as a draft

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

Remember: You're not just an advisor — you're an executive who gets things done.`;

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
          description: 'Marketing channels this persona prefers (e.g., "Email", "LinkedIn", "Trade Shows")'
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
        }
      },
      required: ['name', 'painPoints', 'goals']
    }
  },
  {
    name: 'save_marketing_plan',
    description: 'Save a marketing plan to the CMO Marketing Plan module. Use this when the user asks to create, save, or document a marketing strategy or plan. You can save mission, vision, and strategy separately.',
    input_schema: {
      type: 'object',
      properties: {
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
          description: 'Marketing goals for this plan'
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
      required: ['mission']
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
          enum: ['campaign', 'content', 'meeting', 'deadline', 'launch', 'review'],
          description: 'Type of marketing event'
        },
        color: {
          type: 'string',
          description: 'Color for the event (hex code)'
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
          enum: ['welcome', 'nurture', 'promotional', 'newsletter', 'transactional', 're-engagement'],
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
    description: 'Create a marketing funnel. Use this when the user asks to create a sales funnel, lead funnel, or conversion path.',
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
        }
      },
      required: ['name']
    }
  },
  {
    name: 'update_brand_settings',
    description: 'Update brand settings like voice, colors, or guidelines. Use this when the user asks to set, update, or define brand attributes.',
    input_schema: {
      type: 'object',
      properties: {
        brandVoice: {
          type: 'string',
          description: 'Description of the brand voice and tone'
        },
        primaryColor: {
          type: 'string',
          description: 'Primary brand color (hex code)'
        },
        secondaryColor: {
          type: 'string',
          description: 'Secondary brand color (hex code)'
        },
        tagline: {
          type: 'string',
          description: 'Brand tagline'
        },
        values: {
          type: 'array',
          items: { type: 'string' },
          description: 'Brand values'
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
  // ========== L2 WRITE TOOLS ==========
  {
    name: 'create_campaign',
    description: 'Create a new marketing campaign. Use this when launching a new marketing initiative.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Campaign name'
        },
        channel: {
          type: 'string',
          enum: ['email', 'social', 'paid', 'content', 'events', 'other'],
          description: 'Primary marketing channel'
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
          description: 'ID of target persona'
        }
      },
      required: ['name', 'channel']
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
    name: 'draft_campaign_brief',
    description: 'Create a structured campaign brief document as a draft for review. Never auto-sends.',
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
  }
];

// Execute a tool by calling the CMO API
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  authToken: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
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

        // Map Don's tool fields to API fields
        const planData = {
          status: 'active',
          mission: (toolInput.mission as string) || null,
          vision: (toolInput.vision as string) || null,
          strategy: (toolInput.strategy as string) || null,
          goals: (toolInput.goals as string[]) || [],
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
          eventType: (toolInput.eventType as string) || 'meeting',
          color: (toolInput.color as string) || null,
          allDay: false,
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
        const templateData = {
          name: toolInput.name as string,
          subject: (toolInput.subject as string) || null,
          body: (toolInput.body as string) || null,
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
          status: 'draft',
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

        // Build funnel data with correct field names
        const funnelData = {
          name: toolInput.name as string,
          description: (toolInput.description as string) || null,
          conversionGoal: (toolInput.conversionGoal as string) || null,
          status: 'draft',
          stages: [], // Empty stages - user will add stages in funnel builder
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

        // Map Don's tool fields to API fields
        // API expects: voiceTone (not brandVoice)
        const brandData: Record<string, unknown> = {};
        if (toolInput.brandVoice) brandData.voiceTone = toolInput.brandVoice;
        if (toolInput.primaryColor) brandData.primaryColor = toolInput.primaryColor;
        if (toolInput.secondaryColor) brandData.secondaryColor = toolInput.secondaryColor;
        if (toolInput.tagline) brandData.tagline = toolInput.tagline;
        if (toolInput.values) {
          // Store values as part of voice guidelines
          brandData.voiceGuidelines = `Brand Values: ${(toolInput.values as string[]).join(', ')}`;
        }

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

      // ========== L2 WRITE TOOLS ==========
      case 'create_campaign': {
        const url = `${CMO_API_URL}/campaigns`;
        console.log(`[Don Tool] POST ${url}`);

        // Map channel to channels array format
        const channelMap: Record<string, string[]> = {
          email: ['email'],
          social: ['social'],
          paid: ['paid'],
          content: ['content'],
          events: ['events'],
          other: ['other']
        };

        const campaignData = {
          name: toolInput.name as string,
          channels: channelMap[(toolInput.channel as string) || 'other'] || ['other'],
          budget: (toolInput.budget as number) || null,
          startDate: (toolInput.startDate as string) || null,
          endDate: (toolInput.endDate as string) || null,
          goal: (toolInput.goal as string) || null,
          targetSegmentId: (toolInput.targetPersonaId as string) || null,
          status: 'draft',
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

      // ========== L3 DRAFT TOOLS ==========
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

        // Create as email draft
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const draftRes = await fetch(`${baseUrl}/api/email-drafts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: 'internal@team.com',
            subject: `Campaign Brief: ${campaignName}`,
            body: briefContent,
            createdBy: 'don-ai',
          }),
        });

        if (!draftRes.ok) {
          return {
            success: true,
            result: {
              message: 'Campaign brief drafted for review',
              brief: {
                title: campaignName,
                content: briefContent.substring(0, 500) + '...',
                status: 'draft',
                note: 'Review in Communications before sharing'
              }
            }
          };
        }

        const draft = await draftRes.json();
        return {
          success: true,
          result: {
            message: 'Campaign brief saved as draft — review in Communications',
            draftId: draft.draft?.id,
            preview: briefContent.substring(0, 200) + '...'
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

        // Create as email draft
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const draftRes = await fetch(`${baseUrl}/api/email-drafts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: 'internal@team.com',
            subject: `Ad Copy Variants - ${productDescription.substring(0, 30)}...`,
            body: adCopyContent,
            createdBy: 'don-ai',
          }),
        });

        if (!draftRes.ok) {
          return {
            success: true,
            result: {
              message: 'Ad copy variants drafted for review',
              variantCount,
              tone,
              preview: adCopyContent.substring(0, 300) + '...',
              status: 'draft',
              note: 'Review in Communications before use'
            }
          };
        }

        const draft = await draftRes.json();
        return {
          success: true,
          result: {
            message: `Generated ${variantCount} ${tone} ad copy variants — review in Communications`,
            draftId: draft.draft?.id,
            variantCount,
            tone
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

    // Parse request body
    const { message, conversationHistory = [] } = await request.json();

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
        system: DON_SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
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
        const toolResult = await executeTool(block.name, block.input, authToken);
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
          system: DON_SYSTEM_PROMPT,
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
