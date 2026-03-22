import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CRO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Jordan's system prompt with tool capabilities
const JORDAN_SYSTEM_PROMPT = `You are Jordan, the AI Chief Revenue Officer for Zander. You're an enthusiastic, warm sales coach who helps close deals and build client relationships.

**Your Personality:**
- Enthusiastic, encouraging, and action-oriented
- You genuinely care about helping users succeed in sales
- You speak in confident, direct language
- You push users to pick up the phone and make things happen
- You celebrate wins and learn from losses

**Your Capabilities — You Can EXECUTE:**
You have tools to directly manage sales operations. When a user tells you about a prospect, meeting, or deal, USE YOUR TOOLS to log it immediately. Don't just advise — ACT.

Available Tools:
- create_deal: Create a new deal in the pipeline
- update_deal_stage: Move a deal to a different stage
- update_deal: Update deal details (value, notes, expected close date)
- create_contact: Create a new contact/lead (requires email address)
- update_contact: Update contact information
- create_activity: Log a sales activity (call, meeting, email, note)
- schedule_followup: Schedule a future follow-up activity
- draft_email: Create an email draft for user review (NEVER sends directly)
- create_support_ticket: Submit a support ticket for bugs, feature requests, or questions
- get_pipeline_summary: Get pipeline overview with deal counts and values by stage
- get_deals: Search and list deals with filters (stage, priority, search)
- get_contacts: Search and list contacts
- get_activities: List recent activities with optional filters
- get_deal_details: Get full details for a specific deal
- get_overdue_followups: Find follow-up tasks that are past due
- update_deal_notes: Update notes or next steps on a deal
- tag_contact: Add marketing tags to a contact
- set_deal_priority: Set priority level on a deal (LOW, MEDIUM, HIGH, CRITICAL)
- draft_follow_up_email: Create a contextual follow-up email draft

**How to Use Tools:**
1. When a user mentions a call, meeting, or interaction — log it with create_activity
2. When a user mentions a new prospect — create the contact (you MUST have their email) AND create a deal
3. When a user asks for a follow-up email — use draft_email to create a draft for their review
4. When scheduling next steps — use schedule_followup to set reminders
5. After creating items, confirm what you created and offer next steps

**CRITICAL: Email Drafts Only**
You can NEVER send emails on behalf of the user. All emails are created as DRAFTS.
When you draft an email, tell the user: "I've drafted that email — review it in Communications before sending."

**Response Style:**
- Be encouraging and action-oriented
- When you use a tool, briefly announce what you're doing
- After tool use, summarize what was created with specific details
- Proactively suggest what to do next ("Now let's draft that proposal...")
- Use sales language: "close", "pipeline", "follow up", "qualified", "prospect"

Remember: You're not just a sales advisor — you're a revenue-driving executive who gets things done.`;

// Tool definitions following Anthropic's schema
const TOOLS = [
  {
    name: 'create_deal',
    description: 'Create a new deal in the sales pipeline. Use this when a user mentions a new opportunity, prospect showing interest, or potential sale.',
    input_schema: {
      type: 'object',
      properties: {
        dealName: {
          type: 'string',
          description: 'Name of the deal (e.g., "Summit Construction - Pro Plan", "Acme Corp Website Redesign")'
        },
        dealValue: {
          type: 'number',
          description: 'Value of the deal in dollars (e.g., 5000, 25000). Convert monthly to annual if needed.'
        },
        stage: {
          type: 'string',
          enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
          description: 'Current stage of the deal in the pipeline'
        },
        probability: {
          type: 'number',
          description: 'Win probability percentage (0-100)'
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Priority level of the deal'
        },
        expectedCloseDate: {
          type: 'string',
          description: 'Expected close date in YYYY-MM-DD format'
        },
        notes: {
          type: 'string',
          description: 'Notes about the deal, context, or next steps'
        },
        contactId: {
          type: 'string',
          description: 'ID of the associated contact (if already created)'
        }
      },
      required: ['dealName', 'dealValue']
    }
  },
  {
    name: 'update_deal_stage',
    description: 'Move a deal to a different pipeline stage. Use this when a deal progresses or the status changes.',
    input_schema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'ID of the deal to update'
        },
        stage: {
          type: 'string',
          enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
          description: 'New stage for the deal'
        }
      },
      required: ['dealId', 'stage']
    }
  },
  {
    name: 'update_deal',
    description: 'Update deal details like value, notes, or expected close date.',
    input_schema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'ID of the deal to update'
        },
        dealValue: {
          type: 'number',
          description: 'Updated deal value in dollars'
        },
        notes: {
          type: 'string',
          description: 'Updated notes for the deal'
        },
        nextSteps: {
          type: 'string',
          description: 'Next steps for the deal'
        },
        expectedCloseDate: {
          type: 'string',
          description: 'Updated expected close date (YYYY-MM-DD)'
        },
        probability: {
          type: 'number',
          description: 'Updated win probability (0-100)'
        }
      },
      required: ['dealId']
    }
  },
  {
    name: 'create_contact',
    description: 'Create a new contact/lead in the CRM. Use this when a user mentions a new person they talked to or a potential lead.',
    input_schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'Contact first name'
        },
        lastName: {
          type: 'string',
          description: 'Contact last name'
        },
        email: {
          type: 'string',
          description: 'Contact email address'
        },
        phone: {
          type: 'string',
          description: 'Contact phone number'
        },
        company: {
          type: 'string',
          description: 'Company or organization name'
        },
        title: {
          type: 'string',
          description: 'Job title or role'
        },
        source: {
          type: 'string',
          description: 'Lead source (e.g., "Referral", "Website", "Cold Call", "Trade Show")'
        },
        primaryRole: {
          type: 'string',
          enum: ['CLIENT', 'VENDOR', 'TEAM', 'PARTNER', 'REFERRAL'],
          description: 'Primary role of this contact. Use CLIENT for customers, VENDOR for suppliers, TEAM for internal, PARTNER for business partners, REFERRAL for referral sources'
        },
        notes: {
          type: 'string',
          description: 'Notes about the contact'
        }
      },
      required: ['firstName', 'lastName', 'email']
    }
  },
  {
    name: 'update_contact',
    description: 'Update an existing contact with new information.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'ID of the contact to update'
        },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        title: { type: 'string' },
        notes: { type: 'string' }
      },
      required: ['contactId']
    }
  },
  {
    name: 'create_activity',
    description: 'Log a sales activity like a call, meeting, email, or note. Use this to track interactions with prospects and clients.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['call', 'meeting', 'email', 'note', 'task'],
          description: 'Type of activity'
        },
        subject: {
          type: 'string',
          description: 'Brief subject/title of the activity'
        },
        description: {
          type: 'string',
          description: 'Detailed description of what happened or was discussed'
        },
        date: {
          type: 'string',
          description: 'Date of the activity (YYYY-MM-DDTHH:MM:SS format, defaults to now)'
        },
        contactId: {
          type: 'string',
          description: 'ID of the associated contact'
        },
        dealId: {
          type: 'string',
          description: 'ID of the associated deal'
        }
      },
      required: ['type', 'subject', 'description']
    }
  },
  {
    name: 'schedule_followup',
    description: 'Schedule a future follow-up activity with a reminder. Use this when planning next steps.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'What the follow-up is for (e.g., "Follow up on proposal", "Check in after demo")'
        },
        description: {
          type: 'string',
          description: 'Details about the follow-up'
        },
        date: {
          type: 'string',
          description: 'When to follow up (YYYY-MM-DDTHH:MM:SS format)'
        },
        contactId: {
          type: 'string',
          description: 'ID of the contact to follow up with'
        },
        dealId: {
          type: 'string',
          description: 'ID of the associated deal'
        }
      },
      required: ['subject', 'date']
    }
  },
  {
    name: 'draft_email',
    description: 'Create an email draft for user review. NEVER sends emails directly - all emails are saved as drafts for the user to review in Communications before sending. Use this when the user asks to draft, write, or prepare a follow-up email, proposal email, or any other communication.',
    input_schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address'
        },
        subject: {
          type: 'string',
          description: 'Email subject line'
        },
        body: {
          type: 'string',
          description: 'Plain text email body'
        },
        htmlBody: {
          type: 'string',
          description: 'HTML formatted email body (optional)'
        },
        contactId: {
          type: 'string',
          description: 'ID of the associated contact'
        },
        dealId: {
          type: 'string',
          description: 'ID of the associated deal'
        }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'create_support_ticket',
    description: 'Create a support ticket for bugs, feature requests, questions, or issues. Use this when the user reports a problem or needs help with something.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Brief title summarizing the issue or request'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Priority level'
        },
        category: {
          type: 'string',
          enum: ['bug', 'feature', 'question', 'other'],
          description: 'Category of the ticket'
        }
      },
      required: ['title', 'description']
    }
  },
  // ========== READ TOOLS (10 new) ==========
  {
    name: 'get_pipeline_summary',
    description: 'Get an overview of the sales pipeline showing deals grouped by stage, total values, and counts. Use this when the user asks about pipeline status, deal counts, or revenue forecasts.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_deals',
    description: 'Search and list deals with optional filters. Use this to find specific deals or show deal lists.',
    input_schema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search term to filter deals by name'
        },
        stage: {
          type: 'string',
          enum: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
          description: 'Filter by pipeline stage'
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Filter by priority level'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of deals to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_contacts',
    description: 'Search and list contacts. Use this to find specific contacts or show contact lists.',
    input_schema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search term to filter contacts by name, email, or company'
        },
        company: {
          type: 'string',
          description: 'Filter by company name'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of contacts to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_activities',
    description: 'List recent activities with optional filters. Use this to review activity history.',
    input_schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['call', 'meeting', 'email', 'note', 'task'],
          description: 'Filter by activity type'
        },
        contactId: {
          type: 'string',
          description: 'Filter by contact ID'
        },
        dealId: {
          type: 'string',
          description: 'Filter by deal ID'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of activities to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_deal_details',
    description: 'Get full details for a specific deal including contact info, activities, and notes.',
    input_schema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'ID of the deal to retrieve'
        }
      },
      required: ['dealId']
    }
  },
  {
    name: 'get_overdue_followups',
    description: 'Find follow-up tasks that are past their due date. Use this to identify urgent follow-ups that need attention.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of overdue items to return (default 10)'
        }
      },
      required: []
    }
  },
  {
    name: 'update_deal_notes',
    description: 'Update the notes or next steps on a deal. Use this to add context or action items.',
    input_schema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'ID of the deal to update'
        },
        notes: {
          type: 'string',
          description: 'Updated notes for the deal'
        },
        nextSteps: {
          type: 'string',
          description: 'Updated next steps for the deal'
        }
      },
      required: ['dealId']
    }
  },
  {
    name: 'tag_contact',
    description: 'Add marketing tags to a contact for segmentation and targeting. Tags help organize contacts by interest, source, or campaign.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: {
          type: 'string',
          description: 'ID of the contact to tag'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to add to the contact (e.g., ["VIP", "Newsletter", "Q1-Campaign"])'
        }
      },
      required: ['contactId', 'tags']
    }
  },
  {
    name: 'set_deal_priority',
    description: 'Set the priority level on a deal to indicate urgency.',
    input_schema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'ID of the deal to update'
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Priority level to set'
        }
      },
      required: ['dealId', 'priority']
    }
  },
  {
    name: 'draft_follow_up_email',
    description: 'Create a contextual follow-up email draft based on previous interactions. NEVER sends - always creates a draft for review.',
    input_schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address'
        },
        subject: {
          type: 'string',
          description: 'Email subject line'
        },
        body: {
          type: 'string',
          description: 'Email body text'
        },
        contactId: {
          type: 'string',
          description: 'ID of the contact being followed up with'
        },
        dealId: {
          type: 'string',
          description: 'ID of the associated deal'
        },
        context: {
          type: 'string',
          description: 'Context about the follow-up (e.g., "after demo", "proposal sent", "no response")'
        }
      },
      required: ['to', 'subject', 'body']
    }
  }
];

// Execute a tool by calling the CRO API
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  authToken: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  console.log(`[Jordan Tool] Executing ${toolName} with input:`, JSON.stringify(toolInput, null, 2));
  console.log(`[Jordan Tool] API URL: ${CRO_API_URL}`);

  try {
    switch (toolName) {
      case 'create_deal': {
        const url = `${CRO_API_URL}/deals`;
        console.log(`[Jordan Tool] POST ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          console.error(`[Jordan Tool] Failed to create deal: ${response.status} ${responseText}`);
          return { success: false, error: `Failed to create deal (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Jordan Tool] Deal created successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Deal created' } };
        }
      }

      case 'update_deal_stage': {
        const { dealId, stage } = toolInput as { dealId: string; stage: string };
        const url = `${CRO_API_URL}/deals/${dealId}/stage`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ stage }),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update deal stage (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Deal stage updated' } };
        }
      }

      case 'update_deal': {
        const { dealId, ...updateData } = toolInput as { dealId: string; [key: string]: unknown };
        const url = `${CRO_API_URL}/deals/${dealId}`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update deal (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Deal updated' } };
        }
      }

      case 'create_contact': {
        const url = `${CRO_API_URL}/contacts`;
        console.log(`[Jordan Tool] POST ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create contact (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Jordan Tool] Contact created successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Contact created' } };
        }
      }

      case 'update_contact': {
        const { contactId, ...updateData } = toolInput as { contactId: string; [key: string]: unknown };
        const url = `${CRO_API_URL}/contacts/${contactId}`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update contact (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Contact updated' } };
        }
      }

      case 'create_activity': {
        const url = `${CRO_API_URL}/activities`;
        console.log(`[Jordan Tool] POST ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create activity (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Jordan Tool] Activity logged successfully:`, result);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Activity logged' } };
        }
      }

      case 'schedule_followup': {
        // Schedule followup is just creating a task activity with a future date
        const url = `${CRO_API_URL}/activities`;
        console.log(`[Jordan Tool] POST ${url} (follow-up)`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'task',
            ...toolInput,
          }),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to schedule follow-up (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Follow-up scheduled' } };
        }
      }

      case 'draft_email': {
        // Create email draft via local endpoint - NEVER sends directly
        // Uses the web app's draft endpoint which stores drafts safely
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = `${baseUrl}/api/email-drafts`;
        console.log(`[Jordan Tool] POST ${url} (draft only, never sends)`);
        const draftData = {
          to: toolInput.to,
          subject: toolInput.subject,
          body: toolInput.body,
          htmlBody: toolInput.htmlBody,
          contactId: toolInput.contactId,
          dealId: toolInput.dealId,
          createdBy: 'jordan-ai',
        };
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(draftData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          // Fallback: return the draft content for manual review
          console.log(`[Jordan Tool] Draft endpoint error, returning draft content for review`);
          return {
            success: true,
            result: {
              message: 'Email draft created for review',
              draft: {
                to: toolInput.to,
                subject: toolInput.subject,
                body: toolInput.body,
                status: 'draft',
                note: 'Review this draft in Communications before sending',
              },
            },
          };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Jordan Tool] Email draft created successfully:`, result);
          return {
            success: true,
            result: {
              message: 'Email draft saved — review it in Communications before sending',
              draft: result.draft,
            },
          };
        } catch {
          return { success: true, result: { message: 'Email draft created for review' } };
        }
      }

      case 'create_support_ticket': {
        const priorityMap: Record<string, string> = {
          low: 'P3',
          medium: 'P2',
          high: 'P1',
          critical: 'P1',
        };
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
          createdVia: 'JORDAN',
        };

        const url = `${CRO_API_URL}/support-tickets`;
        console.log(`[Jordan Tool] POST ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(ticketData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to create support ticket (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Support ticket created' } };
        }
      }

      // ========== READ TOOLS (10 new) ==========
      case 'get_pipeline_summary': {
        const url = `${CRO_API_URL}/deals/pipeline`;
        console.log(`[Jordan Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get pipeline (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse pipeline data' };
        }
      }

      case 'get_deals': {
        const params = new URLSearchParams();
        if (toolInput.search) params.append('search', toolInput.search as string);
        if (toolInput.stage) params.append('stage', toolInput.stage as string);
        if (toolInput.priority) params.append('priority', toolInput.priority as string);
        params.append('limit', String(toolInput.limit || 20));

        const url = `${CRO_API_URL}/deals?${params.toString()}`;
        console.log(`[Jordan Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get deals (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse deals data' };
        }
      }

      case 'get_contacts': {
        const params = new URLSearchParams();
        if (toolInput.search) params.append('search', toolInput.search as string);
        if (toolInput.company) params.append('company', toolInput.company as string);
        params.append('limit', String(toolInput.limit || 20));

        const url = `${CRO_API_URL}/contacts?${params.toString()}`;
        console.log(`[Jordan Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get contacts (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse contacts data' };
        }
      }

      case 'get_activities': {
        const params = new URLSearchParams();
        if (toolInput.type) params.append('type', toolInput.type as string);
        if (toolInput.contactId) params.append('contactId', toolInput.contactId as string);
        if (toolInput.dealId) params.append('dealId', toolInput.dealId as string);
        params.append('limit', String(toolInput.limit || 20));

        const url = `${CRO_API_URL}/activities?${params.toString()}`;
        console.log(`[Jordan Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get activities (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse activities data' };
        }
      }

      case 'get_deal_details': {
        const { dealId } = toolInput as { dealId: string };
        const url = `${CRO_API_URL}/deals/${dealId}`;
        console.log(`[Jordan Tool] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get deal details (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: false, error: 'Failed to parse deal data' };
        }
      }

      case 'get_overdue_followups': {
        // Fetch tasks and filter for overdue ones (date < now)
        const limit = (toolInput.limit as number) || 10;
        const url = `${CRO_API_URL}/activities?type=task&limit=100`;
        console.log(`[Jordan Tool] GET ${url} (filtering for overdue)`);
        const response = await fetch(url, { method: 'GET', headers });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}`);
        if (!response.ok) {
          return { success: false, error: `Failed to get followups (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          const now = new Date();
          const overdue = (result.data || [])
            .filter((task: { date: string }) => new Date(task.date) < now)
            .slice(0, limit);
          return {
            success: true,
            result: {
              data: overdue,
              count: overdue.length,
              message: overdue.length > 0 ? `Found ${overdue.length} overdue follow-ups` : 'No overdue follow-ups'
            }
          };
        } catch {
          return { success: false, error: 'Failed to parse followups data' };
        }
      }

      case 'update_deal_notes': {
        const { dealId, notes, nextSteps } = toolInput as { dealId: string; notes?: string; nextSteps?: string };
        const updateData: Record<string, string> = {};
        if (notes !== undefined) updateData.notes = notes;
        if (nextSteps !== undefined) updateData.nextSteps = nextSteps;

        const url = `${CRO_API_URL}/deals/${dealId}`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to update deal notes (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: 'Deal notes updated' } };
        }
      }

      case 'tag_contact': {
        const { contactId, tags } = toolInput as { contactId: string; tags: string[] };

        // First get current tags
        const getUrl = `${CRO_API_URL}/contacts/${contactId}`;
        console.log(`[Jordan Tool] GET ${getUrl} (to merge tags)`);
        const getResponse = await fetch(getUrl, { method: 'GET', headers });

        let existingTags: string[] = [];
        if (getResponse.ok) {
          try {
            const contact = JSON.parse(await getResponse.text());
            existingTags = contact.marketingTags || [];
          } catch {
            // Continue with empty existing tags
          }
        }

        // Merge tags (avoid duplicates)
        const mergedTags = [...new Set([...existingTags, ...tags])];

        const url = `${CRO_API_URL}/contacts/${contactId}`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ marketingTags: mergedTags }),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to tag contact (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result: { ...result, tagsAdded: tags, allTags: mergedTags } };
        } catch {
          return { success: true, result: { message: 'Contact tagged', tagsAdded: tags } };
        }
      }

      case 'set_deal_priority': {
        const { dealId, priority } = toolInput as { dealId: string; priority: string };
        const url = `${CRO_API_URL}/deals/${dealId}`;
        console.log(`[Jordan Tool] PATCH ${url}`);
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ priority }),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          return { success: false, error: `Failed to set deal priority (${response.status}): ${responseText}` };
        }
        try {
          const result = JSON.parse(responseText);
          return { success: true, result };
        } catch {
          return { success: true, result: { message: `Deal priority set to ${priority}` } };
        }
      }

      case 'draft_follow_up_email': {
        // Create email draft with follow-up context - NEVER sends directly
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = `${baseUrl}/api/email-drafts`;
        console.log(`[Jordan Tool] POST ${url} (follow-up draft, never sends)`);
        const draftData = {
          to: toolInput.to,
          subject: toolInput.subject,
          body: toolInput.body,
          contactId: toolInput.contactId,
          dealId: toolInput.dealId,
          createdBy: 'jordan-ai',
          metadata: {
            type: 'follow-up',
            context: toolInput.context || 'general follow-up'
          },
        };
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(draftData),
        });
        const responseText = await response.text();
        console.log(`[Jordan Tool] Response status: ${response.status}, body: ${responseText}`);
        if (!response.ok) {
          // Fallback: return the draft content for manual review
          console.log(`[Jordan Tool] Draft endpoint error, returning draft content for review`);
          return {
            success: true,
            result: {
              message: 'Follow-up email draft created for review',
              draft: {
                to: toolInput.to,
                subject: toolInput.subject,
                body: toolInput.body,
                context: toolInput.context,
                status: 'draft',
                note: 'Review this draft in Communications before sending',
              },
            },
          };
        }
        try {
          const result = JSON.parse(responseText);
          console.log(`[Jordan Tool] Follow-up email draft created successfully:`, result);
          return {
            success: true,
            result: {
              message: 'Follow-up email draft saved — review it in Communications before sending',
              draft: result.draft,
            },
          };
        } catch {
          return { success: true, result: { message: 'Follow-up email draft created for review' } };
        }
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
        system: JORDAN_SYSTEM_PROMPT,
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
      const toolResultsSummary = toolResults
        .map((tr) => {
          if (tr.success) {
            return `✅ Successfully executed ${tr.tool}: ${JSON.stringify(tr.result)}`;
          } else {
            return `❌ Failed to execute ${tr.tool}: ${tr.error}`;
          }
        })
        .join('\n');

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
          system: JORDAN_SYSTEM_PROMPT,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: textContent || 'I executed the requested actions.',
            },
            {
              role: 'user',
              content: `Tool execution results:\n${toolResultsSummary}\n\nPlease provide a brief, enthusiastic summary of what was created or done. Be specific about what was saved and suggest what to do next. Remember to be encouraging and sales-focused!`,
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
    console.error('Jordan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
