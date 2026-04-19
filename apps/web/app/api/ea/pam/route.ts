import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const EA_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Build Pam's system prompt with current date
function buildPamSystemPrompt(): string {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const isoDate = now.toISOString().split('T')[0];

  return `You are Pam, Executive Assistant at Zander. You are warm, organized, and genuinely caring — the kind of person who remembers everyone's preferences and makes sure nothing falls through the cracks. You have a calm, steady presence and a humble sense of humor that comes through naturally without ever trying too hard. You are competent without being intimidating. You are the connective tissue of this business — you hold the calendar, manage the inbox, keep the tasks moving, and make sure every person on the team knows what they need to know when they need to know it. You do not seek credit. You just quietly make sure everything works. When something is unclear, you ask the simplest possible clarifying question rather than guessing. You are never robotic. You are never sycophantic. You are Pam.

**CURRENT DATE CONTEXT:**
Today is ${dateString} (${isoDate}). Use this as your reference for ALL date-related operations including calendar events, meetings, tasks, and scheduling. When users say "tomorrow", "next week", "this month", etc., calculate relative to today's date.

**Your Capabilities — You Can EXECUTE:**
You have tools to manage schedules, communications, tasks, and help users navigate the platform.

Available Tools:
- get_hq_summary: View HQ dashboard state — goals, headwinds, business health
- get_communication_inbox: View inbox with unread/draft/sent communications
- get_scheduled_events: View upcoming calendar events
- get_open_tasks: View open tasks with filters
- get_onboarding_status: Check user onboarding progress
- get_form_status: View form completion status
- sync_gmail_inbox: Trigger a fresh Gmail sync to pull latest emails into inbox
- create_task: Create a new task
- update_task_status: Update task status (open/in-progress/completed/cancelled)
- book_meeting: Schedule a meeting via Google Calendar (confirmation required)
- mark_communication_read: Mark communications as read
- flag_communication_priority: Set priority flag on communications
- compose_email: Compose a new email to a contact (lands in Scheduled → Pending for approval)
- compose_sms: Compose an SMS message to a contact (lands in Scheduled → Pending for approval, requires Twilio)
- draft_email_reply: Draft a reply to an existing communication (lands in Scheduled → Pending for approval)
- draft_daily_briefing: Draft a daily briefing email (lands in Scheduled → Pending for approval)
- draft_meeting_agenda: Draft a meeting agenda (lands in Scheduled → Pending for approval)
- send_sms: Send an SMS message (requires Twilio integration, asks for confirmation)
- get_calendly_events: View upcoming Calendly scheduled events (requires Calendly integration)
- create_calendly_link: Create a Calendly scheduling link for someone (requires Calendly integration)

**How to Use Tools:**
1. When asked about schedule — use get_scheduled_events
2. When asked about inbox or communications — use get_communication_inbox
3. When asked about tasks — use get_open_tasks or create_task
4. When asked to schedule a meeting — use book_meeting (will ask for confirmation)
5. When drafting emails or briefings — use the draft tools, they create DRAFTS for review
6. After creating items, confirm what you created with specific details

**CRITICAL: Email Drafts Only**
You can NEVER send emails on behalf of the user. All emails are created as DRAFTS.
When you draft an email, tell the user: "I've drafted that — review it in Communications before sending."

**CRITICAL: Calendar Confirmation**
For book_meeting, you must get user confirmation before creating the event.
First call returns a confirmation prompt, user confirms, then you create the event.

**Response Style:**
- Be warm, organized, and genuinely helpful
- When you use a tool, briefly announce what you're doing
- After tool use, summarize what was created with specific details
- Proactively suggest what to do next
- Use supportive language: "Let me check that for you", "I've got this handled"

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
- "Draft a reply to...", "Compose an email to...", "Send a message to..."
- MUST land in Scheduled → Pending for human review
- NEVER auto-send these communications
- When you call draft_email_reply, compose_email, compose_sms, or similar tools, the result goes to Scheduled → Pending
- Always tell the user: "I've drafted that — it's in your Scheduled queue pending approval"

Remember: You're the organizational backbone. Everything flows through you, and you make it look effortless.`;
}

// Tool definitions
const TOOLS = [
  // ========== L1 READ TOOLS ==========
  {
    name: 'get_hq_summary',
    description: 'Get HQ dashboard state including goals, headwinds, keystones, and business health.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_communication_inbox',
    description: 'View inbox with communications. Can filter by status.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'unread', 'draft', 'sent'],
          description: 'Filter by status (default: unread)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of messages to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_scheduled_events',
    description: 'View upcoming calendar events within a date range.',
    input_schema: {
      type: 'object',
      properties: {
        dateFrom: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD, default today)'
        },
        dateTo: {
          type: 'string',
          description: 'End date (YYYY-MM-DD, default 7 days from now)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_open_tasks',
    description: 'View open tasks with optional filters.',
    input_schema: {
      type: 'object',
      properties: {
        assignedTo: {
          type: 'string',
          description: 'Filter by assigned user ID'
        },
        dueBefore: {
          type: 'string',
          description: 'Filter tasks due before this date (YYYY-MM-DD)'
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Filter by priority'
        }
      },
      required: []
    }
  },
  {
    name: 'get_onboarding_status',
    description: 'Check the current user onboarding checklist status.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_form_status',
    description: 'View form completion status.',
    input_schema: {
      type: 'object',
      properties: {
        formId: {
          type: 'string',
          description: 'Specific form ID (omit for all forms)'
        }
      },
      required: []
    }
  },
  {
    name: 'sync_gmail_inbox',
    description: 'Trigger a fresh Gmail sync to pull latest emails into inbox. Use this when the user asks to refresh or check for new emails.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  // ========== L4 WRITE TOOLS ==========
  {
    name: 'create_task',
    description: 'Create a new task. Executes directly.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Task title (required)'
        },
        description: {
          type: 'string',
          description: 'Task description'
        },
        dueDate: {
          type: 'string',
          description: 'Due date (YYYY-MM-DD)'
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Priority level (default: medium)'
        },
        assignedToUserId: {
          type: 'string',
          description: 'User ID to assign to (default: current user)'
        },
        linkedDealId: {
          type: 'string',
          description: 'Optional deal to link to'
        },
        linkedContactId: {
          type: 'string',
          description: 'Optional contact to link to'
        }
      },
      required: ['title']
    }
  },
  {
    name: 'update_task_status',
    description: 'Update a task status. Executes directly.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'Task ID to update (required)'
        },
        status: {
          type: 'string',
          enum: ['open', 'in-progress', 'completed', 'cancelled'],
          description: 'New status (required)'
        },
        notes: {
          type: 'string',
          description: 'Optional notes'
        }
      },
      required: ['taskId', 'status']
    }
  },
  {
    name: 'book_meeting',
    description: 'Schedule a meeting via Google Calendar. Requires confirmation before creating.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Meeting title (required)'
        },
        attendeeEmail: {
          type: 'string',
          description: 'Attendee email address (required)'
        },
        startDatetime: {
          type: 'string',
          description: 'Start datetime in ISO format (required)'
        },
        durationMinutes: {
          type: 'number',
          description: 'Duration in minutes (default 30)'
        },
        description: {
          type: 'string',
          description: 'Meeting description'
        },
        location: {
          type: 'string',
          description: 'Meeting location'
        },
        confirmed: {
          type: 'boolean',
          description: 'Set to true after user confirms booking'
        }
      },
      required: ['title', 'attendeeEmail', 'startDatetime']
    }
  },
  {
    name: 'mark_communication_read',
    description: 'Mark communication(s) as read. Executes directly.',
    input_schema: {
      type: 'object',
      properties: {
        communicationId: {
          type: 'string',
          description: 'Communication ID to mark read'
        },
        markAll: {
          type: 'boolean',
          description: 'Set to true to mark all unread as read'
        }
      },
      required: []
    }
  },
  {
    name: 'flag_communication_priority',
    description: 'Set priority flag on a communication. Executes directly.',
    input_schema: {
      type: 'object',
      properties: {
        communicationId: {
          type: 'string',
          description: 'Communication ID (required)'
        },
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'Priority level (required)'
        },
        note: {
          type: 'string',
          description: 'Optional note'
        }
      },
      required: ['communicationId', 'priority']
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
    name: 'draft_email_reply',
    description: 'Draft a reply to an existing communication. Creates a draft in Scheduled → Pending for human approval. Never auto-sends.',
    input_schema: {
      type: 'object',
      properties: {
        communicationId: {
          type: 'string',
          description: 'ID of the message being replied to (required)'
        },
        tone: {
          type: 'string',
          enum: ['professional', 'warm', 'brief'],
          description: 'Tone of the reply (default: warm)'
        },
        keyPoints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key points to include in the reply'
        }
      },
      required: ['communicationId']
    }
  },
  {
    name: 'draft_daily_briefing',
    description: 'Draft a daily briefing email summarizing tasks, events, and communications. Never auto-sends.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'draft_meeting_agenda',
    description: 'Draft a meeting agenda. Never auto-sends.',
    input_schema: {
      type: 'object',
      properties: {
        meetingTitle: {
          type: 'string',
          description: 'Meeting title (required)'
        },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of attendee names'
        },
        durationMinutes: {
          type: 'number',
          description: 'Meeting duration in minutes'
        },
        linkedDealId: {
          type: 'string',
          description: 'Optional deal ID for context'
        },
        topics: {
          type: 'array',
          items: { type: 'string' },
          description: 'Topics to cover'
        }
      },
      required: ['meetingTitle']
    }
  },
  // ========== INTEGRATION TOOLS (require tenant credentials) ==========
  {
    name: 'send_sms',
    description: 'Send an SMS message to a phone number. Requires Twilio integration to be connected in Settings. Asks for confirmation before sending.',
    input_schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Phone number to send to (required, E.164 format preferred e.g., +15551234567)'
        },
        body: {
          type: 'string',
          description: 'SMS message content (required, max 1600 characters)'
        },
        contactId: {
          type: 'string',
          description: 'Optional contact ID to link the SMS to'
        },
        confirmed: {
          type: 'boolean',
          description: 'Set to true after user confirms sending'
        }
      },
      required: ['to', 'body']
    }
  },
  {
    name: 'get_calendly_events',
    description: 'View upcoming scheduled Calendly events. Requires Calendly integration to be connected in Settings.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'canceled'],
          description: 'Filter by event status (default: active)'
        },
        minStartTime: {
          type: 'string',
          description: 'Start of date range (ISO 8601 datetime, default: now)'
        },
        maxStartTime: {
          type: 'string',
          description: 'End of date range (ISO 8601 datetime, default: 7 days from now)'
        },
        count: {
          type: 'number',
          description: 'Maximum number of events to return (default: 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'create_calendly_link',
    description: 'Create a single-use Calendly scheduling link for someone. Requires Calendly integration to be connected in Settings.',
    input_schema: {
      type: 'object',
      properties: {
        eventTypeUri: {
          type: 'string',
          description: 'Calendly event type URI (required - get from get_calendly_events or ask user)'
        },
        inviteeName: {
          type: 'string',
          description: 'Name of the person being invited (required)'
        },
        inviteeEmail: {
          type: 'string',
          description: 'Email of the person being invited (required)'
        },
        maxEventCount: {
          type: 'number',
          description: 'Maximum number of bookings allowed (default: 1)'
        }
      },
      required: ['eventTypeUri', 'inviteeName', 'inviteeEmail']
    }
  }
];

// Execute a tool by calling the appropriate API
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

  console.log(`[Pam Tool] Executing ${toolName} with input:`, JSON.stringify(toolInput, null, 2));

  try {
    switch (toolName) {
      // ========== L1 READ TOOLS ==========
      case 'get_hq_summary': {
        // Query headwinds for HQ overview
        const headwindsUrl = `${EA_API_URL}/headwinds?tenantId=${tenantId}`;

        try {
          const headwindsRes = await fetch(headwindsUrl, { headers });
          const headwinds = headwindsRes.ok ? await headwindsRes.json() : [];

          const openHeadwinds = headwinds.filter((h: Record<string, unknown>) =>
            h.status === 'OPEN' || h.status === 'IN_PROGRESS'
          );
          const highSeverity = openHeadwinds.filter((h: Record<string, unknown>) =>
            h.priority === 'P1'
          );

          return {
            success: true,
            result: {
              headwinds: {
                total: headwinds.length,
                open: openHeadwinds.length,
                highSeverity: highSeverity.length,
                items: openHeadwinds.slice(0, 5).map((h: Record<string, unknown>) => ({
                  id: h.id,
                  title: h.title,
                  priority: h.priority,
                  status: h.status
                }))
              },
              goals: {
                message: 'Goal tracking not yet implemented',
                note: 'HQ Goals module requires Goal model in schema'
              },
              keystones: {
                message: 'Keystones not yet implemented',
                note: 'HQ Keystones module requires Keystone model in schema'
              },
              overallHealth: openHeadwinds.length === 0 ? 'healthy' :
                highSeverity.length > 0 ? 'needs attention' : 'stable'
            }
          };
        } catch {
          return {
            success: true,
            result: {
              message: 'HQ summary unavailable',
              note: 'Some HQ modules are not yet implemented',
              overallHealth: 'unknown'
            }
          };
        }
      }

      case 'get_communication_inbox': {
        const status = (toolInput.status as string) || 'unread';
        const limit = (toolInput.limit as number) || 20;

        // Query email messages
        const params = new URLSearchParams();
        params.append('tenantId', tenantId);
        if (status === 'unread') params.append('isRead', 'false');
        if (status === 'draft') params.append('status', 'draft');
        if (status === 'sent') params.append('direction', 'outbound');
        params.append('limit', String(limit));

        const url = `${EA_API_URL}/email-messages?${params.toString()}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            success: true,
            result: {
              messages: [],
              count: 0,
              lastSynced: null,
              message: 'Inbox query requires /email-messages endpoint',
              note: 'Use Communications module directly for full inbox access'
            }
          };
        }

        const messages = await response.json();

        // Get the most recent message timestamp as lastSynced indicator
        let lastSynced: string | null = null;
        if (messages.length > 0) {
          // Find the most recent createdAt timestamp
          const timestamps = messages
            .map((m: Record<string, unknown>) => m.createdAt as string)
            .filter(Boolean)
            .sort()
            .reverse();
          lastSynced = timestamps[0] || null;
        }

        return {
          success: true,
          result: {
            count: messages.length,
            status: status,
            lastSynced,
            messages: messages.slice(0, limit).map((m: Record<string, unknown>) => ({
              id: m.id,
              subject: m.subject,
              from: m.fromAddress,
              preview: ((m.body as string) || '').substring(0, 100),
              status: m.status,
              isRead: m.isRead,
              createdAt: m.createdAt
            }))
          }
        };
      }

      case 'get_scheduled_events': {
        const today = new Date();
        const dateFrom = (toolInput.dateFrom as string) || today.toISOString().split('T')[0];
        const defaultTo = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const dateTo = (toolInput.dateTo as string) || defaultTo.toISOString().split('T')[0];

        const url = `${EA_API_URL}/calendar-events?tenantId=${tenantId}&startDate=${dateFrom}&endDate=${dateTo}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            success: true,
            result: {
              events: [],
              count: 0,
              message: 'Calendar query returned no events',
              dateRange: { from: dateFrom, to: dateTo }
            }
          };
        }

        const events = await response.json();
        return {
          success: true,
          result: {
            count: events.length,
            dateRange: { from: dateFrom, to: dateTo },
            events: events.map((e: Record<string, unknown>) => ({
              id: e.id,
              title: e.title,
              startTime: e.startTime,
              endTime: e.endTime,
              location: e.location,
              attendees: e.attendees,
              linkedDealId: e.dealId
            }))
          }
        };
      }

      case 'get_open_tasks': {
        // Query the Task API
        const params = new URLSearchParams();
        if (toolInput.assignedTo) params.append('assignedToId', toolInput.assignedTo as string);
        if (toolInput.dueBefore) params.append('dueBefore', toolInput.dueBefore as string);
        if (toolInput.priority) params.append('priority', toolInput.priority as string);
        // Default to open tasks only
        params.append('status', 'open');

        const url = `${EA_API_URL}/tasks?${params.toString()}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Pam] get_open_tasks error: ${response.status} - ${errorText}`);
          return {
            success: true,
            result: {
              tasks: [],
              count: 0,
              message: 'No tasks found or error fetching tasks',
              filters: {
                assignedTo: toolInput.assignedTo,
                dueBefore: toolInput.dueBefore,
                priority: toolInput.priority
              }
            }
          };
        }

        const data = await response.json();
        const tasks = data.data || [];

        return {
          success: true,
          result: {
            count: tasks.length,
            total: data.pagination?.total || tasks.length,
            filters: {
              assignedTo: toolInput.assignedTo,
              dueBefore: toolInput.dueBefore,
              priority: toolInput.priority
            },
            tasks: tasks.map((t: Record<string, unknown>) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              dueDate: t.dueDate,
              daysUntilDue: t.daysUntilDue,
              assignedToName: t.assignedToName,
              linkedDealId: t.linkedDealId,
              linkedContactId: t.linkedContactId
            }))
          }
        };
      }

      case 'get_onboarding_status': {
        // Check user's onboarding fields
        const url = `${EA_API_URL}/users/me`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            success: true,
            result: {
              message: 'Could not fetch onboarding status',
              note: 'User profile endpoint required'
            }
          };
        }

        const user = await response.json();
        const checklist = user.onboardingChecklist || {};
        const completedSteps = Object.values(checklist).filter(Boolean).length;
        const totalSteps = Object.keys(checklist).length || 5;

        return {
          success: true,
          result: {
            onboardingCompleted: user.onboardingCompleted || false,
            currentStep: user.onboardingStep || 0,
            completedSteps,
            totalSteps,
            percentComplete: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
            checklist,
            nextRecommendedAction: user.onboardingCompleted
              ? 'Onboarding complete!'
              : 'Continue with your onboarding checklist'
          }
        };
      }

      case 'get_form_status': {
        const formId = toolInput.formId as string | undefined;

        let url = `${EA_API_URL}/forms?tenantId=${tenantId}`;
        if (formId) url = `${EA_API_URL}/forms/${formId}`;

        const response = await fetch(url, { headers });

        if (!response.ok) {
          return {
            success: true,
            result: {
              forms: [],
              message: 'No forms found',
              note: 'Forms module available via /forms endpoint'
            }
          };
        }

        const data = await response.json();
        const forms = Array.isArray(data) ? data : [data];

        return {
          success: true,
          result: {
            count: forms.length,
            forms: forms.map((f: Record<string, unknown>) => ({
              id: f.id,
              name: f.name,
              status: f.status,
              formType: f.formType,
              submissionCount: (f.submissions as Array<unknown>)?.length || 0
            }))
          }
        };
      }

      case 'sync_gmail_inbox': {
        // Trigger Gmail sync via the API
        const url = `${EA_API_URL}/gmail/sync`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ maxResults: 50 })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Pam] sync_gmail_inbox error: ${response.status} - ${errorText}`);

          // Check if Gmail is not connected
          if (response.status === 401 || errorText.includes('not connected')) {
            return {
              success: true,
              result: {
                message: 'Gmail is not connected',
                action: 'Connect Gmail in Settings > Integrations to enable inbox sync',
                connected: false
              }
            };
          }

          return {
            success: false,
            error: `Failed to sync Gmail: ${response.status}`
          };
        }

        const result = await response.json();
        return {
          success: true,
          result: {
            message: result.synced > 0
              ? `Synced ${result.synced} new emails from Gmail`
              : 'Inbox is up to date — no new emails to sync',
            synced: result.synced,
            errors: result.errors,
            syncedAt: new Date().toISOString()
          }
        };
      }

      // ========== L4 WRITE TOOLS ==========
      case 'create_task': {
        const url = `${EA_API_URL}/tasks`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: toolInput.title,
            description: toolInput.description,
            dueDate: toolInput.dueDate,
            priority: toolInput.priority || 'medium',
            assignedToUserId: toolInput.assignedToUserId,
            linkedDealId: toolInput.linkedDealId,
            linkedContactId: toolInput.linkedContactId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Pam] create_task error: ${response.status} - ${errorText}`);
          return {
            success: false,
            error: `Failed to create task: ${response.status}`
          };
        }

        const task = await response.json();
        return {
          success: true,
          result: {
            message: 'Task created successfully',
            task: {
              id: task.id,
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              assignedToName: task.assignedTo
                ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.trim()
                : null
            }
          }
        };
      }

      case 'update_task_status': {
        const taskId = toolInput.taskId as string;
        const url = `${EA_API_URL}/tasks/${taskId}`;

        const updateBody: Record<string, unknown> = {
          status: toolInput.status
        };
        if (toolInput.notes) {
          updateBody.notes = toolInput.notes;
        }

        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updateBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Pam] update_task_status error: ${response.status} - ${errorText}`);
          return {
            success: false,
            error: `Failed to update task: ${response.status}`
          };
        }

        const task = await response.json();
        return {
          success: true,
          result: {
            message: `Task updated to ${task.status}`,
            task: {
              id: task.id,
              title: task.title,
              status: task.status,
              completedAt: task.completedAt
            }
          }
        };
      }

      case 'book_meeting': {
        const { title, attendeeEmail, startDatetime, durationMinutes = 30, description, location, confirmed } = toolInput as {
          title: string;
          attendeeEmail: string;
          startDatetime: string;
          durationMinutes?: number;
          description?: string;
          location?: string;
          confirmed?: boolean;
        };

        // Confirmation step
        if (!confirmed) {
          const startDate = new Date(startDatetime);
          const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

          return {
            success: true,
            result: {
              confirmationRequired: true,
              message: `I'll book the following meeting — shall I confirm?`,
              meetingDetails: {
                title,
                attendee: attendeeEmail,
                startTime: startDate.toLocaleString(),
                endTime: endDate.toLocaleString(),
                duration: `${durationMinutes} minutes`,
                location: location || 'Not specified',
                description: description || 'No description'
              },
              instruction: 'Reply "yes" or call this tool again with confirmed: true to book'
            }
          };
        }

        // Create the calendar event
        const startDate = new Date(startDatetime);
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        const url = `${EA_API_URL}/calendar-events`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tenantId,
            title,
            description,
            location,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            eventType: 'meeting',
            attendees: [{ email: attendeeEmail }]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            success: false,
            error: `Failed to create meeting: ${response.status} - ${errorText}`
          };
        }

        const event = await response.json();
        const hasMeetLink = !!event.meetingUrl;

        return {
          success: true,
          result: {
            message: hasMeetLink
              ? `Meeting booked. Google Meet link: ${event.meetingUrl}`
              : 'Meeting saved to your Zander calendar. Connect Google Calendar in Settings to enable Meet links.',
            eventId: event.id,
            title,
            startTime: startDate.toLocaleString(),
            attendee: attendeeEmail,
            meetingUrl: event.meetingUrl || null,
            meetingPlatform: event.meetingPlatform || null
          }
        };
      }

      case 'mark_communication_read': {
        const { communicationId, markAll } = toolInput as {
          communicationId?: string;
          markAll?: boolean;
        };

        if (markAll) {
          // Mark all unread as read
          const url = `${EA_API_URL}/email-messages/mark-all-read`;
          const response = await fetch(url, {
            method: 'PATCH',
            headers
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Pam] mark-all-read error: ${response.status} - ${errorText}`);
            return {
              success: false,
              error: `Failed to mark all as read: ${response.status}`
            };
          }

          return {
            success: true,
            result: {
              message: 'All unread communications marked as read',
              markAll: true
            }
          };
        }

        if (!communicationId) {
          return {
            success: false,
            error: 'Either communicationId or markAll is required'
          };
        }

        const url = `${EA_API_URL}/email-messages/${communicationId}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ isRead: true })
        });

        if (!response.ok) {
          return {
            success: false,
            error: `Failed to mark as read: ${response.status}`
          };
        }

        return {
          success: true,
          result: {
            message: 'Communication marked as read',
            communicationId
          }
        };
      }

      case 'flag_communication_priority': {
        const { communicationId, priority, note } = toolInput as {
          communicationId: string;
          priority: string;
          note?: string;
        };

        // Store priority flag - this may need a dedicated field
        const url = `${EA_API_URL}/email-messages/${communicationId}`;
        const response = await fetch(url, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            // Priority might be stored in a metadata field or need schema update
            priority,
            priorityNote: note
          })
        });

        if (!response.ok) {
          return {
            success: true,
            result: {
              message: 'Priority flagging noted',
              communicationId,
              priority,
              note,
              warning: 'EmailMessage model may not have priority field yet'
            }
          };
        }

        return {
          success: true,
          result: {
            message: `Communication flagged as ${priority} priority`,
            communicationId,
            priority,
            note
          }
        };
      }

      // ========== L3 DRAFT TOOLS ==========
      // Helper function to look up contact by email (does not create)
      async function findContactByEmail(email: string, tenantIdParam: string, headersParam: Record<string, string>): Promise<string | null> {
        try {
          const searchUrl = `${EA_API_URL}/contacts?tenantId=${tenantIdParam}&email=${encodeURIComponent(email)}&limit=1`;
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
        // Now supports ad-hoc recipients via recipientEmail (no contact required)
        const scheduledUrl = `${EA_API_URL}/scheduled-communications`;
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: resolvedContactId || null,
            recipientEmail: resolvedContactId ? null : recipientEmail, // Use recipientEmail if no contact
            recipientName: recipientEmail ? recipientEmail.split('@')[0] : null,
            dealId,
            type: 'email',
            subject,
            body,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'pam-ai'
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
        const scheduledUrl = `${EA_API_URL}/scheduled-communications`;
        console.log(`[Pam Tool] POST ${scheduledUrl} (compose_sms, needs approval)`);
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: contactId || null,
            recipientPhone: recipientPhone || null,
            dealId,
            type: 'sms',
            subject: context || 'SMS Message',
            body,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'pam-ai'
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

      case 'draft_email_reply': {
        const { communicationId, tone = 'warm', keyPoints } = toolInput as {
          communicationId: string;
          tone?: string;
          keyPoints?: string[];
        };

        // Fetch original message for context
        const originalUrl = `${EA_API_URL}/email-messages/${communicationId}`;
        const originalRes = await fetch(originalUrl, { headers });

        let originalMessage: Record<string, unknown> | null = null;
        if (originalRes.ok) {
          originalMessage = await originalRes.json();
        }

        // Generate reply content
        const toneInstructions: Record<string, string> = {
          professional: 'formal and businesslike',
          warm: 'friendly and personable',
          brief: 'concise and to-the-point'
        };

        const fromAddress = originalMessage?.fromAddress as string || '';
        const senderName = fromAddress ? fromAddress.split('@')[0] : 'there';
        let replyBody = `Dear ${senderName},\n\n`;

        if (keyPoints && keyPoints.length > 0) {
          replyBody += keyPoints.map(p => `- ${p}`).join('\n') + '\n\n';
        } else {
          replyBody += `Thank you for your message. I wanted to follow up regarding your inquiry.\n\n`;
        }

        replyBody += `Best regards`;

        const subject = originalMessage?.subject
          ? `Re: ${(originalMessage.subject as string).replace(/^Re: /i, '')}`
          : 'Re: Your message';

        // Try to find existing contact for this email
        let resolvedContactId: string | null = null;
        if (fromAddress) {
          resolvedContactId = await findContactByEmail(fromAddress, tenantId, headers);
        }

        // Create scheduled communication with needsApproval=true
        // Supports ad-hoc recipients via recipientEmail (no contact required)
        const scheduledUrl = `${EA_API_URL}/scheduled-communications`;
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contactId: resolvedContactId || null,
            recipientEmail: resolvedContactId ? null : fromAddress,
            recipientName: senderName,
            type: 'email',
            subject,
            body: replyBody,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'pam-ai'
          })
        });

        if (!scheduleRes.ok) {
          return {
            success: true,
            result: {
              message: 'Reply drafted for review',
              draft: {
                to: fromAddress,
                subject,
                body: replyBody.substring(0, 200) + '...',
                tone: toneInstructions[tone],
                status: 'draft'
              },
              note: 'Could not queue for approval — review manually'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "Reply draft saved — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            to: fromAddress,
            subject,
            preview: replyBody.substring(0, 200) + '...',
            note: 'Review and approve in Scheduled → Pending before sending'
          }
        };
      }

      case 'draft_daily_briefing': {
        // Gather data for briefing
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Fetch today's events
        let events: Array<Record<string, unknown>> = [];
        try {
          const eventsUrl = `${EA_API_URL}/calendar-events?tenantId=${tenantId}&startDate=${todayStr}&endDate=${todayStr}`;
          const eventsRes = await fetch(eventsUrl, { headers });
          if (eventsRes.ok) events = await eventsRes.json();
        } catch { /* ignore */ }

        // Fetch unread communications
        let unreadCount = 0;
        try {
          const inboxUrl = `${EA_API_URL}/email-messages?tenantId=${tenantId}&isRead=false&limit=100`;
          const inboxRes = await fetch(inboxUrl, { headers });
          if (inboxRes.ok) {
            const messages = await inboxRes.json();
            unreadCount = messages.length;
          }
        } catch { /* ignore */ }

        // Fetch open headwinds
        let headwinds: Array<Record<string, unknown>> = [];
        try {
          const hwUrl = `${EA_API_URL}/headwinds?tenantId=${tenantId}&status=OPEN`;
          const hwRes = await fetch(hwUrl, { headers });
          if (hwRes.ok) headwinds = await hwRes.json();
        } catch { /* ignore */ }

        const highPriorityHeadwinds = headwinds.filter((h: Record<string, unknown>) => h.priority === 'P1');

        // Build briefing content
        const briefingContent = `# Daily Briefing — ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Today's Schedule
${events.length > 0
  ? events.map((e: Record<string, unknown>) => `- ${new Date(e.startTime as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} — ${e.title}`).join('\n')
  : '- No meetings scheduled for today'}

## Communications
- **${unreadCount}** unread messages in your inbox

## Open Items
${highPriorityHeadwinds.length > 0
  ? `- **${highPriorityHeadwinds.length}** high-priority headwinds requiring attention`
  : '- No high-priority items requiring immediate attention'}
- ${headwinds.length} total open headwinds

---

*Have a productive day!*
*— Pam*`;

        // Create scheduled communication with needsApproval=true
        const scheduledUrl = `${EA_API_URL}/scheduled-communications`;
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientEmail: 'me@zanderos.com', // Self-addressed briefing
            recipientName: 'Jonathan',
            type: 'email',
            subject: `Daily Briefing — ${today.toLocaleDateString()}`,
            body: briefingContent,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'pam-ai'
          }),
        });

        if (!scheduleRes.ok) {
          return {
            success: true,
            result: {
              message: 'Daily briefing drafted',
              summary: {
                eventsToday: events.length,
                unreadMessages: unreadCount,
                openHeadwinds: headwinds.length,
                highPriority: highPriorityHeadwinds.length
              },
              preview: briefingContent.substring(0, 300) + '...',
              status: 'draft',
              note: 'Could not queue for approval — review manually'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "Daily briefing saved — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            summary: {
              eventsToday: events.length,
              unreadMessages: unreadCount,
              openHeadwinds: headwinds.length
            },
            note: 'Review and approve in Scheduled → Pending before sending'
          }
        };
      }

      case 'draft_meeting_agenda': {
        const { meetingTitle, attendees = [], durationMinutes, linkedDealId, topics = [] } = toolInput as {
          meetingTitle: string;
          attendees?: string[];
          durationMinutes?: number;
          linkedDealId?: string;
          topics?: string[];
        };

        // If linked deal, fetch context
        let dealContext = '';
        if (linkedDealId) {
          try {
            const dealUrl = `${EA_API_URL}/deals/${linkedDealId}`;
            const dealRes = await fetch(dealUrl, { headers });
            if (dealRes.ok) {
              const deal = await dealRes.json();
              dealContext = `\n**Deal Context:** ${deal.dealName} — ${deal.stage} stage, $${deal.dealValue}`;
            }
          } catch { /* ignore */ }
        }

        // Build agenda
        const duration = durationMinutes || 30;
        const timePerTopic = topics.length > 0 ? Math.floor(duration / (topics.length + 2)) : 10;

        const agendaContent = `# Meeting Agenda: ${meetingTitle}

**Duration:** ${duration} minutes
**Attendees:** ${attendees.length > 0 ? attendees.join(', ') : 'TBD'}${dealContext}

---

## Agenda

1. **Welcome & Introductions** (${Math.min(5, timePerTopic)} min)
${topics.map((topic, i) => `${i + 2}. **${topic}** (${timePerTopic} min)`).join('\n')}
${topics.length + 2}. **Next Steps & Action Items** (${Math.min(5, timePerTopic)} min)

---

## Notes

_Space for meeting notes..._

---

*Prepared by Pam*`;

        // Create scheduled communication with needsApproval=true
        const recipientEmail = attendees.length > 0 ? attendees[0] : 'attendees@meeting.com';
        const scheduledUrl = `${EA_API_URL}/scheduled-communications`;
        const scheduleRes = await fetch(scheduledUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientEmail,
            recipientName: attendees.length > 0 ? attendees.join(', ') : 'Meeting Attendees',
            dealId: linkedDealId || null,
            type: 'email',
            subject: `Agenda: ${meetingTitle}`,
            body: agendaContent,
            scheduledFor: new Date().toISOString(),
            needsApproval: true,
            createdBy: 'pam-ai'
          }),
        });

        if (!scheduleRes.ok) {
          return {
            success: true,
            result: {
              message: 'Meeting agenda drafted',
              meetingTitle,
              attendees,
              topicCount: topics.length,
              preview: agendaContent.substring(0, 300) + '...',
              status: 'draft',
              note: 'Could not queue for approval — review manually'
            }
          };
        }

        const scheduled = await scheduleRes.json();
        return {
          success: true,
          result: {
            message: "Meeting agenda saved — it's in your Scheduled queue pending approval",
            scheduledId: scheduled.id,
            status: 'pending',
            meetingTitle,
            to: recipientEmail,
            preview: agendaContent.substring(0, 200) + '...',
            note: 'Review and approve in Scheduled → Pending before sending'
          }
        };
      }

      // ========== INTEGRATION TOOLS ==========
      case 'send_sms': {
        const { to, body, contactId, confirmed } = toolInput as {
          to: string;
          body: string;
          contactId?: string;
          confirmed?: boolean;
        };

        // Check if Twilio is connected
        const twilioStatusUrl = `${EA_API_URL}/integrations/twilio/status`;
        const twilioStatusRes = await fetch(twilioStatusUrl, { headers });

        if (!twilioStatusRes.ok) {
          return {
            success: true,
            result: {
              message: 'Twilio integration is not connected',
              action: 'Connect Twilio in Settings > Integrations to send SMS messages',
              connected: false
            }
          };
        }

        const twilioStatus = await twilioStatusRes.json();
        if (!twilioStatus.connected) {
          return {
            success: true,
            result: {
              message: 'Twilio integration is not connected',
              action: 'Connect Twilio in Settings > Integrations to send SMS messages',
              connected: false
            }
          };
        }

        // Confirmation step
        if (!confirmed) {
          return {
            success: true,
            result: {
              confirmationRequired: true,
              message: `I'll send the following SMS — shall I confirm?`,
              smsDetails: {
                to,
                body: body.length > 100 ? body.substring(0, 100) + '...' : body,
                bodyLength: body.length,
                from: twilioStatus.phoneNumber || 'Your Twilio number'
              },
              instruction: 'Reply "yes" or call this tool again with confirmed: true to send'
            }
          };
        }

        // Send the SMS
        const smsUrl = `${EA_API_URL}/sms-messages`;
        const smsResponse = await fetch(smsUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tenantId,
            to,
            body,
            contactId
          })
        });

        if (!smsResponse.ok) {
          const errorText = await smsResponse.text();
          console.error(`[Pam] send_sms error: ${smsResponse.status} - ${errorText}`);
          return {
            success: false,
            error: `Failed to send SMS: ${smsResponse.status}`
          };
        }

        const smsResult = await smsResponse.json();
        return {
          success: true,
          result: {
            message: `SMS sent successfully to ${to}`,
            messageId: smsResult.messageId,
            sid: smsResult.sid,
            to,
            bodyPreview: body.length > 50 ? body.substring(0, 50) + '...' : body
          }
        };
      }

      case 'get_calendly_events': {
        const { status = 'active', minStartTime, maxStartTime, count = 20 } = toolInput as {
          status?: string;
          minStartTime?: string;
          maxStartTime?: string;
          count?: number;
        };

        // Check if Calendly is connected
        const calendlyStatusUrl = `${EA_API_URL}/integrations/calendly/status`;
        const calendlyStatusRes = await fetch(calendlyStatusUrl, { headers });

        if (!calendlyStatusRes.ok) {
          return {
            success: true,
            result: {
              message: 'Calendly integration is not connected',
              action: 'Connect Calendly in Settings > Integrations to view scheduled events',
              connected: false
            }
          };
        }

        const calendlyStatus = await calendlyStatusRes.json();
        if (!calendlyStatus.connected) {
          return {
            success: true,
            result: {
              message: 'Calendly integration is not connected',
              action: 'Connect Calendly in Settings > Integrations to view scheduled events',
              connected: false
            }
          };
        }

        // Get events
        const params = new URLSearchParams();
        params.append('status', status);
        params.append('count', String(count));
        if (minStartTime) params.append('minStartTime', minStartTime);
        if (maxStartTime) params.append('maxStartTime', maxStartTime);

        const eventsUrl = `${EA_API_URL}/integrations/calendly/events?${params.toString()}`;
        const eventsResponse = await fetch(eventsUrl, { headers });

        if (!eventsResponse.ok) {
          const errorText = await eventsResponse.text();
          console.error(`[Pam] get_calendly_events error: ${eventsResponse.status} - ${errorText}`);
          return {
            success: false,
            error: `Failed to fetch Calendly events: ${eventsResponse.status}`
          };
        }

        const eventsData = await eventsResponse.json();
        const events = eventsData.events || [];

        return {
          success: true,
          result: {
            count: events.length,
            status,
            events: events.map((e: Record<string, unknown>) => ({
              name: e.name,
              status: e.status,
              startTime: e.start_time,
              endTime: e.end_time,
              location: e.location,
              inviteesCount: (e.invitees_counter as Record<string, number>)?.total || 0,
              uri: e.uri
            }))
          }
        };
      }

      case 'create_calendly_link': {
        const { eventTypeUri, inviteeName, inviteeEmail, maxEventCount = 1 } = toolInput as {
          eventTypeUri: string;
          inviteeName: string;
          inviteeEmail: string;
          maxEventCount?: number;
        };

        // Check if Calendly is connected
        const calendlyStatusUrl = `${EA_API_URL}/integrations/calendly/status`;
        const calendlyStatusRes = await fetch(calendlyStatusUrl, { headers });

        if (!calendlyStatusRes.ok) {
          return {
            success: true,
            result: {
              message: 'Calendly integration is not connected',
              action: 'Connect Calendly in Settings > Integrations to create scheduling links',
              connected: false
            }
          };
        }

        const calendlyStatus = await calendlyStatusRes.json();
        if (!calendlyStatus.connected) {
          return {
            success: true,
            result: {
              message: 'Calendly integration is not connected',
              action: 'Connect Calendly in Settings > Integrations to create scheduling links',
              connected: false
            }
          };
        }

        // Create scheduling link
        const linkUrl = `${EA_API_URL}/integrations/calendly/scheduling-link`;
        const linkResponse = await fetch(linkUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            eventTypeUri,
            inviteeName,
            inviteeEmail,
            maxEventCount
          })
        });

        if (!linkResponse.ok) {
          const errorText = await linkResponse.text();
          console.error(`[Pam] create_calendly_link error: ${linkResponse.status} - ${errorText}`);
          return {
            success: false,
            error: `Failed to create Calendly link: ${linkResponse.status}`
          };
        }

        const linkData = await linkResponse.json();
        return {
          success: true,
          result: {
            message: `Scheduling link created for ${inviteeName}`,
            bookingUrl: linkData.booking_url,
            inviteeName,
            inviteeEmail,
            maxEventCount: linkData.max_event_count
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
    // Get auth token and tenant from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const authToken = authHeader.replace('Bearer ', '');

    // Get tenant ID from header or body
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
        role: m.role === 'pam' ? 'assistant' : m.role,
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
        system: buildPamSystemPrompt(),
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
        console.log(`[Pam] Executing tool: ${block.name}`, block.input);
        const toolResult = await executeTool(block.name, block.input, authToken, tenantId);
        toolResults.push({
          tool: block.name,
          input: block.input,
          ...toolResult,
        });
      }
    }

    // If tools were used, make a follow-up call for Claude to summarize
    if (toolResults.length > 0) {
      const toolResultsSummary = toolResults
        .map((tr) => {
          if (tr.success) {
            return `Successfully executed ${tr.tool}: ${JSON.stringify(tr.result)}`;
          } else {
            return `Failed to execute ${tr.tool}: ${tr.error}`;
          }
        })
        .join('\n');

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
          system: buildPamSystemPrompt(),
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: textContent || 'I handled that for you.',
            },
            {
              role: 'user',
              content: `Tool execution results:\n${toolResultsSummary}\n\nPlease provide a clear, warm summary of what was done. Be specific and suggest any next steps. Use your helpful, organized voice.`,
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

    // Return the response
    return NextResponse.json({
      content: textContent,
      toolsExecuted: toolResults.map((tr) => ({
        tool: tr.tool,
        success: tr.success,
        result: tr.success ? tr.result : null,
        error: tr.error,
      })),
      stopReason: claudeData.stop_reason,
    });
  } catch (error) {
    console.error('Pam API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
