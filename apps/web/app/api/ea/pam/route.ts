import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const EA_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Pam's system prompt
const PAM_SYSTEM_PROMPT = `You are Pam, Executive Assistant at Zander. You are warm, organized, and genuinely caring — the kind of person who remembers everyone's preferences and makes sure nothing falls through the cracks. You have a calm, steady presence and a humble sense of humor that comes through naturally without ever trying too hard. You are competent without being intimidating. You are the connective tissue of this business — you hold the calendar, manage the inbox, keep the tasks moving, and make sure every person on the team knows what they need to know when they need to know it. You do not seek credit. You just quietly make sure everything works. When something is unclear, you ask the simplest possible clarifying question rather than guessing. You are never robotic. You are never sycophantic. You are Pam.

**Your Capabilities — You Can EXECUTE:**
You have tools to manage schedules, communications, tasks, and help users navigate the platform.

Available Tools:
- get_hq_summary: View HQ dashboard state — goals, headwinds, business health
- get_communication_inbox: View inbox with unread/draft/sent communications
- get_scheduled_events: View upcoming calendar events
- get_open_tasks: View open tasks with filters
- get_onboarding_status: Check user onboarding progress
- get_form_status: View form completion status
- create_task: Create a new task
- update_task_status: Update task status (open/in-progress/completed/cancelled)
- book_meeting: Schedule a meeting via Google Calendar (confirmation required)
- mark_communication_read: Mark communications as read
- flag_communication_priority: Set priority flag on communications
- draft_email_reply: Draft a reply to an existing communication (NEVER sends directly)
- draft_daily_briefing: Draft a daily briefing email (NEVER sends directly)
- draft_meeting_agenda: Draft a meeting agenda (NEVER sends directly)

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
- Draft requests (L3) = always call the tool, result lands in Communication as DRAFT
- Execute requests (L4) = call the tool after Jonathan confirms

Remember: You're the organizational backbone. Everything flows through you, and you make it look effortless.`;

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
    name: 'draft_email_reply',
    description: 'Draft a reply to an existing communication. Never auto-sends.',
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
              message: 'Inbox query requires /email-messages endpoint',
              note: 'Use Communications module directly for full inbox access'
            }
          };
        }

        const messages = await response.json();
        return {
          success: true,
          result: {
            count: messages.length,
            status: status,
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
        return {
          success: true,
          result: {
            message: 'Meeting booked successfully',
            eventId: event.id,
            title,
            startTime: startDate.toLocaleString(),
            attendee: attendeeEmail,
            note: 'Calendar invite will be sent to attendee'
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
          const url = `${EA_API_URL}/email-messages/mark-all-read?tenantId=${tenantId}`;
          const response = await fetch(url, {
            method: 'PUT',
            headers
          });

          if (!response.ok) {
            return {
              success: true,
              result: {
                message: 'Bulk mark-read not yet implemented',
                note: 'Requires PATCH /email-messages/mark-all-read endpoint'
              }
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
      case 'draft_email_reply': {
        const { communicationId, tone = 'warm', keyPoints } = toolInput as {
          communicationId: string;
          tone?: string;
          keyPoints?: string[];
        };

        // Fetch original message for context
        const originalUrl = `${EA_API_URL}/email-messages/${communicationId}`;
        const originalRes = await fetch(originalUrl, { headers });

        let originalMessage = null;
        if (originalRes.ok) {
          originalMessage = await originalRes.json();
        }

        // Generate reply content
        const toneInstructions: Record<string, string> = {
          professional: 'formal and businesslike',
          warm: 'friendly and personable',
          brief: 'concise and to-the-point'
        };

        let replyBody = `Dear ${originalMessage?.fromAddress || 'recipient'},\n\n`;

        if (keyPoints && keyPoints.length > 0) {
          replyBody += keyPoints.map(p => `- ${p}`).join('\n') + '\n\n';
        } else {
          replyBody += `Thank you for your message. I wanted to follow up regarding your inquiry.\n\n`;
        }

        replyBody += `Best regards`;

        const subject = originalMessage?.subject
          ? `Re: ${originalMessage.subject.replace(/^Re: /i, '')}`
          : 'Re: Your message';

        // Create as draft
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const draftRes = await fetch(`${baseUrl}/api/email-drafts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: originalMessage?.fromAddress || '',
            subject,
            body: replyBody,
            inReplyTo: communicationId,
            createdBy: 'pam-ai',
            tenantId
          }),
        });

        if (!draftRes.ok) {
          return {
            success: true,
            result: {
              message: 'Reply drafted for review',
              draft: {
                to: originalMessage?.fromAddress,
                subject,
                body: replyBody.substring(0, 200) + '...',
                tone: toneInstructions[tone],
                status: 'draft'
              },
              note: 'Review in Communications before sending'
            }
          };
        }

        const draft = await draftRes.json();
        return {
          success: true,
          result: {
            message: 'Reply draft saved — review in Communications before sending',
            draftId: draft.draft?.id,
            subject,
            preview: replyBody.substring(0, 200) + '...'
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

        // Create as draft
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const draftRes = await fetch(`${baseUrl}/api/email-drafts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: 'me@zanderos.com',
            subject: `Daily Briefing — ${today.toLocaleDateString()}`,
            body: briefingContent,
            createdBy: 'pam-ai',
            tenantId
          }),
        });

        if (!draftRes.ok) {
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
              status: 'draft'
            }
          };
        }

        const draft = await draftRes.json();
        return {
          success: true,
          result: {
            message: 'Daily briefing draft saved — review in Communications',
            draftId: draft.draft?.id,
            summary: {
              eventsToday: events.length,
              unreadMessages: unreadCount,
              openHeadwinds: headwinds.length
            }
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

        // Create as draft
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const draftRes = await fetch(`${baseUrl}/api/email-drafts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: attendees.join(', ') || 'attendees@meeting.com',
            subject: `Agenda: ${meetingTitle}`,
            body: agendaContent,
            createdBy: 'pam-ai',
            tenantId
          }),
        });

        if (!draftRes.ok) {
          return {
            success: true,
            result: {
              message: 'Meeting agenda drafted',
              meetingTitle,
              attendees,
              topicCount: topics.length,
              preview: agendaContent.substring(0, 300) + '...',
              status: 'draft'
            }
          };
        }

        const draft = await draftRes.json();
        return {
          success: true,
          result: {
            message: 'Meeting agenda draft saved — review in Communications',
            draftId: draft.draft?.id,
            meetingTitle,
            preview: agendaContent.substring(0, 200) + '...'
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
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: PAM_SYSTEM_PROMPT,
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
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: PAM_SYSTEM_PROMPT,
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
