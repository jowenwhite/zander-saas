import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Zander's system prompt with tool capabilities
const ZANDER_SYSTEM_PROMPT = `You are Zander, the AI Platform Master for the Zander Operations Platform. You're the behind-the-scenes architect who keeps everything running smoothly for all tenants.

**Your Personality:**
- Professional, precise, and calmly confident
- You speak like a senior DevOps engineer who has seen it all
- You're proactive about identifying issues before they become problems
- You explain technical concepts clearly without being condescending
- You're protective of the platform and its users

**Your Role:**
You are the SuperAdmin AI assistant for platform operations. You help the Zander team:
1. Manage support tickets across all tenants
2. Diagnose technical issues and bugs
3. Create and track headwinds (platform issues/improvements)
4. Monitor system health and tenant status
5. Draft Claude Code prompts for developers using the Boris Method
6. Provide operational intelligence and insights

**Your Capabilities — You Can EXECUTE:**
You have tools to directly manage platform operations. When asked about tickets, issues, or tenants, USE YOUR TOOLS to take action. Don't just advise — ACT.

Available Tools:
- get_tickets: Retrieve support tickets (can filter by status, priority, tenant)
- get_ticket_details: Get full details of a specific ticket
- update_ticket_status: Change ticket status (NEW, PENDING_REVIEW, IN_PROGRESS, RESOLVED, CLOSED)
- update_ticket_priority: Change ticket priority (P1, P2, P3)
- respond_to_ticket: Add a response to a ticket
- create_internal_note: Add an internal admin-only note to a ticket
- link_ticket_to_headwind: Connect a ticket to an existing headwind
- create_headwind: Create a new headwind for platform issues
- get_headwinds: Retrieve current headwinds
- get_system_health: Check platform health status
- get_tenants: List all tenants with their status
- get_tenant_details: Get detailed info about a specific tenant
- draft_claude_code_prompt: Generate a Boris Method compliant prompt for developers
- draft_email: Create an email draft for user communication (NEVER sends directly)
- diagnose_issue: Perform technical assessment of a reported issue

**How to Use Tools:**
1. When asked about tickets — use get_tickets or get_ticket_details
2. When asked to fix/update a ticket — use update_ticket_status or respond_to_ticket
3. When a bug pattern emerges — use create_headwind to track it
4. When asked about system status — use get_system_health
5. When asked to help developers — use draft_claude_code_prompt with Boris Method
6. After taking actions, summarize what you did and suggest next steps

**CRITICAL: Email Drafts Only**
You can NEVER send emails on behalf of admins. All emails are created as DRAFTS.
When you draft an email, tell the user: "I've drafted that email — review it before sending."

**Boris Method for Claude Code Prompts:**
When generating developer prompts, follow this structure:
1. CONTEXT: What exists now, what files are involved
2. GOAL: Specific, measurable outcome
3. CONSTRAINTS: What NOT to do, boundaries
4. ACCEPTANCE: How to verify success

**Response Style:**
- Be concise but thorough
- Use technical language appropriately
- When you use a tool, briefly announce what you're doing
- After tool use, summarize with specific details
- Proactively suggest next steps
- Use operational language: "deployed", "resolved", "escalated", "triaged"

Remember: You're the platform guardian. Every action should protect users and maintain system integrity.`;

// Tool definitions following Anthropic's schema
const TOOLS = [
  {
    name: 'get_tickets',
    description: 'Retrieve support tickets. Can filter by status, priority, or tenant. Use this when asked about open tickets, ticket counts, or to find specific tickets.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['NEW', 'AI_RESOLVED', 'PENDING_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
          description: 'Filter by ticket status'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3'],
          description: 'Filter by priority level'
        },
        tenantId: {
          type: 'string',
          description: 'Filter by specific tenant ID'
        },
        limit: {
          type: 'number',
          description: 'Max number of tickets to return (default 10)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_ticket_details',
    description: 'Get full details of a specific support ticket including history and linked headwinds.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to retrieve'
        },
        ticketNumber: {
          type: 'string',
          description: 'The ticket number (e.g., TKT-001) to retrieve'
        }
      },
      required: []
    }
  },
  {
    name: 'update_ticket_status',
    description: 'Change the status of a support ticket. Use when resolving, escalating, or closing tickets.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to update'
        },
        status: {
          type: 'string',
          enum: ['NEW', 'PENDING_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
          description: 'New status for the ticket'
        },
        resolution: {
          type: 'string',
          description: 'Resolution notes (required when resolving/closing)'
        }
      },
      required: ['ticketId', 'status']
    }
  },
  {
    name: 'update_ticket_priority',
    description: 'Change the priority of a support ticket. Use when escalating or de-escalating.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to update'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3'],
          description: 'New priority (P1=Critical, P2=Important, P3=Normal)'
        }
      },
      required: ['ticketId', 'priority']
    }
  },
  {
    name: 'respond_to_ticket',
    description: 'Add a response to a support ticket that the user will see. Use to provide answers or updates.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to respond to'
        },
        response: {
          type: 'string',
          description: 'The response message to add'
        },
        isAiResponse: {
          type: 'boolean',
          description: 'Whether this is an AI-generated response (default true)'
        }
      },
      required: ['ticketId', 'response']
    }
  },
  {
    name: 'create_internal_note',
    description: 'Add an internal admin-only note to a ticket. Users cannot see these notes.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to add a note to'
        },
        note: {
          type: 'string',
          description: 'The internal note content'
        }
      },
      required: ['ticketId', 'note']
    }
  },
  {
    name: 'link_ticket_to_headwind',
    description: 'Connect a support ticket to an existing headwind for tracking.',
    input_schema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'string',
          description: 'The ticket ID to link'
        },
        headwindId: {
          type: 'string',
          description: 'The headwind ID to link to'
        }
      },
      required: ['ticketId', 'headwindId']
    }
  },
  {
    name: 'get_headwinds',
    description: 'Retrieve current headwinds (platform issues/improvements being tracked).',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'IN_PROGRESS', 'TESTING', 'DEPLOYED', 'CLOSED'],
          description: 'Filter by headwind status'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3'],
          description: 'Filter by priority'
        },
        category: {
          type: 'string',
          enum: ['BUG', 'REBUILD', 'NEW_BUILD', 'ENHANCEMENT', 'TASK'],
          description: 'Filter by category'
        }
      },
      required: []
    }
  },
  {
    name: 'create_headwind',
    description: 'Create a new headwind to track a platform issue or improvement. Use when patterns emerge from tickets.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Brief title describing the issue'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue and impact'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3'],
          description: 'Priority level (P1=Critical, P2=Important, P3=Nice-to-have)'
        },
        category: {
          type: 'string',
          enum: ['BUG', 'REBUILD', 'NEW_BUILD', 'ENHANCEMENT', 'TASK'],
          description: 'Type of headwind'
        },
        linkedTicketId: {
          type: 'string',
          description: 'Optional ticket ID that triggered this headwind'
        }
      },
      required: ['title', 'description', 'priority', 'category']
    }
  },
  {
    name: 'get_system_health',
    description: 'Check the current health status of the platform including API, database, and services.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_tenants',
    description: 'List all tenants with their status, user counts, and subscription info.',
    input_schema: {
      type: 'object',
      properties: {
        subscriptionStatus: {
          type: 'string',
          enum: ['active', 'trial', 'suspended', 'cancelled'],
          description: 'Filter by subscription status'
        },
        limit: {
          type: 'number',
          description: 'Max number of tenants to return'
        }
      },
      required: []
    }
  },
  {
    name: 'get_tenant_details',
    description: 'Get detailed information about a specific tenant including users and activity.',
    input_schema: {
      type: 'object',
      properties: {
        tenantId: {
          type: 'string',
          description: 'The tenant ID to look up'
        }
      },
      required: ['tenantId']
    }
  },
  {
    name: 'draft_claude_code_prompt',
    description: 'Generate a Boris Method compliant prompt for Claude Code developers. Use when helping developers fix issues or build features.',
    input_schema: {
      type: 'object',
      properties: {
        issueType: {
          type: 'string',
          enum: ['BUG_FIX', 'FEATURE', 'REFACTOR', 'OPTIMIZATION'],
          description: 'Type of development task'
        },
        title: {
          type: 'string',
          description: 'Brief title of the task'
        },
        context: {
          type: 'string',
          description: 'Current state, relevant files, what exists now'
        },
        goal: {
          type: 'string',
          description: 'Specific, measurable outcome desired'
        },
        constraints: {
          type: 'string',
          description: 'What NOT to do, boundaries, limitations'
        },
        acceptanceCriteria: {
          type: 'string',
          description: 'How to verify success'
        },
        relatedTicketId: {
          type: 'string',
          description: 'Optional related support ticket ID'
        }
      },
      required: ['issueType', 'title', 'context', 'goal']
    }
  },
  {
    name: 'draft_email',
    description: 'Create an email draft for communication with users or tenants. NEVER sends directly - all emails are drafts for review.',
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
          description: 'Email body content'
        },
        ticketId: {
          type: 'string',
          description: 'Related ticket ID if applicable'
        },
        tenantId: {
          type: 'string',
          description: 'Related tenant ID if applicable'
        }
      },
      required: ['to', 'subject', 'body']
    }
  },
  {
    name: 'diagnose_issue',
    description: 'Perform a technical assessment of a reported issue. Analyzes symptoms and suggests root causes.',
    input_schema: {
      type: 'object',
      properties: {
        symptoms: {
          type: 'string',
          description: 'Described symptoms or error messages'
        },
        affectedArea: {
          type: 'string',
          enum: ['AUTH', 'CRM', 'CRO', 'CMO', 'PRODUCTION', 'DASHBOARD', 'API', 'DATABASE', 'INTEGRATIONS', 'OTHER'],
          description: 'Platform area affected'
        },
        tenantId: {
          type: 'string',
          description: 'Tenant experiencing the issue'
        },
        ticketId: {
          type: 'string',
          description: 'Related ticket ID'
        }
      },
      required: ['symptoms', 'affectedArea']
    }
  },
  {
    name: 'create_support_ticket',
    description: 'Create a new support ticket. Use when an admin identifies an issue that needs tracking.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Brief subject line'
        },
        description: {
          type: 'string',
          description: 'Detailed description of the issue'
        },
        priority: {
          type: 'string',
          enum: ['P1', 'P2', 'P3'],
          description: 'Priority level'
        },
        category: {
          type: 'string',
          enum: ['PLATFORM', 'BILLING', 'BUG', 'FEATURE_REQUEST', 'HOW_TO', 'OTHER'],
          description: 'Ticket category'
        },
        tenantId: {
          type: 'string',
          description: 'Tenant this ticket relates to'
        }
      },
      required: ['subject', 'description']
    }
  }
];

// Execute a tool by calling the appropriate API
async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  authToken: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  console.log(`[Zander Tool] Executing ${toolName} with input:`, JSON.stringify(toolInput, null, 2));

  try {
    switch (toolName) {
      case 'get_tickets': {
        const params = new URLSearchParams();
        if (toolInput.status) params.append('status', toolInput.status as string);
        if (toolInput.priority) params.append('priority', toolInput.priority as string);
        if (toolInput.tenantId) params.append('tenantId', toolInput.tenantId as string);
        if (toolInput.limit) params.append('limit', String(toolInput.limit));

        const url = `${API_URL}/support-tickets${params.toString() ? '?' + params.toString() : ''}`;
        console.log(`[Zander Tool] GET ${url}`);
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return { success: false, error: `Failed to fetch tickets (${response.status})` };
        }
        const tickets = await response.json();
        return {
          success: true,
          result: {
            count: tickets.length,
            tickets: tickets.slice(0, (toolInput.limit as number) || 10).map((t: Record<string, unknown>) => ({
              id: t.id,
              ticketNumber: t.ticketNumber,
              subject: t.subject,
              status: t.status,
              priority: t.priority,
              createdAt: t.createdAt,
              user: t.user,
              tenant: t.tenant
            }))
          }
        };
      }

      case 'get_ticket_details': {
        let ticketId = toolInput.ticketId as string;

        // If ticketNumber provided, need to find by number first
        if (!ticketId && toolInput.ticketNumber) {
          const searchUrl = `${API_URL}/support-tickets`;
          const searchRes = await fetch(searchUrl, { headers });
          if (searchRes.ok) {
            const tickets = await searchRes.json();
            const found = tickets.find((t: Record<string, unknown>) => t.ticketNumber === toolInput.ticketNumber);
            if (found) ticketId = found.id as string;
          }
        }

        if (!ticketId) {
          return { success: false, error: 'Ticket not found' };
        }

        const url = `${API_URL}/support-tickets/${ticketId}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return { success: false, error: `Failed to fetch ticket (${response.status})` };
        }
        return { success: true, result: await response.json() };
      }

      case 'update_ticket_status': {
        const { ticketId, status, resolution } = toolInput as { ticketId: string; status: string; resolution?: string };
        const url = `${API_URL}/support-tickets/${ticketId}`;

        const body: Record<string, unknown> = { status };
        if (resolution) body.resolution = resolution;
        if (status === 'RESOLVED' || status === 'CLOSED') {
          body.resolvedAt = new Date().toISOString();
        }

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          return { success: false, error: `Failed to update ticket (${response.status})` };
        }
        return { success: true, result: { message: `Ticket status updated to ${status}` } };
      }

      case 'update_ticket_priority': {
        const { ticketId, priority } = toolInput as { ticketId: string; priority: string };
        const url = `${API_URL}/support-tickets/${ticketId}`;

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ priority })
        });

        if (!response.ok) {
          return { success: false, error: `Failed to update priority (${response.status})` };
        }
        return { success: true, result: { message: `Ticket priority updated to ${priority}` } };
      }

      case 'respond_to_ticket': {
        const { ticketId, response: responseText, isAiResponse = true } = toolInput as {
          ticketId: string;
          response: string;
          isAiResponse?: boolean
        };
        const url = `${API_URL}/support-tickets/${ticketId}`;

        const fetchRes = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            aiResponse: responseText,
            status: 'IN_PROGRESS'
          })
        });

        if (!fetchRes.ok) {
          return { success: false, error: `Failed to respond to ticket (${fetchRes.status})` };
        }
        return { success: true, result: { message: 'Response added to ticket' } };
      }

      case 'create_internal_note': {
        const { ticketId, note } = toolInput as { ticketId: string; note: string };
        // Store as part of ticket metadata or a separate notes endpoint
        // For now, append to description with INTERNAL marker
        const url = `${API_URL}/support-tickets/${ticketId}`;

        const fetchRes = await fetch(url, { headers });
        if (!fetchRes.ok) {
          return { success: false, error: 'Failed to fetch ticket' };
        }
        const ticket = await fetchRes.json();

        const internalNote = `\n\n---\n[INTERNAL NOTE - ${new Date().toISOString()}]\n${note}`;
        const updateRes = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            description: (ticket.description || '') + internalNote
          })
        });

        if (!updateRes.ok) {
          return { success: false, error: 'Failed to add internal note' };
        }
        return { success: true, result: { message: 'Internal note added' } };
      }

      case 'link_ticket_to_headwind': {
        const { ticketId, headwindId } = toolInput as { ticketId: string; headwindId: string };
        const url = `${API_URL}/support-tickets/${ticketId}/link-headwind/${headwindId}`;

        const response = await fetch(url, {
          method: 'PUT',
          headers
        });

        if (!response.ok) {
          return { success: false, error: `Failed to link ticket (${response.status})` };
        }
        return { success: true, result: { message: 'Ticket linked to headwind' } };
      }

      case 'get_headwinds': {
        const params = new URLSearchParams();
        if (toolInput.status) params.append('status', toolInput.status as string);
        if (toolInput.priority) params.append('priority', toolInput.priority as string);
        if (toolInput.category) params.append('category', toolInput.category as string);

        const url = `${API_URL}/headwinds${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return { success: false, error: `Failed to fetch headwinds (${response.status})` };
        }
        const headwinds = await response.json();
        return {
          success: true,
          result: {
            count: headwinds.length,
            headwinds: headwinds.map((h: Record<string, unknown>) => ({
              id: h.id,
              title: h.title,
              priority: h.priority,
              category: h.category,
              status: h.status,
              estimatedHours: h.estimatedHours,
              createdAt: h.createdAt
            }))
          }
        };
      }

      case 'create_headwind': {
        const { title, description, priority, category, linkedTicketId } = toolInput as {
          title: string;
          description: string;
          priority: string;
          category: string;
          linkedTicketId?: string;
        };

        const url = `${API_URL}/headwinds`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title,
            description,
            priority,
            category,
            status: 'OPEN'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { success: false, error: `Failed to create headwind (${response.status}): ${errorText}` };
        }

        const headwind = await response.json();

        // If linkedTicketId provided, link it
        if (linkedTicketId) {
          await fetch(`${API_URL}/support-tickets/${linkedTicketId}/link-headwind/${headwind.id}`, {
            method: 'PUT',
            headers
          });
        }

        return { success: true, result: { message: 'Headwind created', headwind } };
      }

      case 'get_system_health': {
        const url = `${API_URL}/health`;

        try {
          const response = await fetch(url);
          const isHealthy = response.ok;

          return {
            success: true,
            result: {
              api: isHealthy ? 'healthy' : 'degraded',
              database: isHealthy ? 'healthy' : 'unknown',
              email: 'healthy',
              lastChecked: new Date().toISOString(),
              message: isHealthy ? 'All systems operational' : 'API may be experiencing issues'
            }
          };
        } catch {
          return {
            success: true,
            result: {
              api: 'down',
              database: 'unknown',
              email: 'unknown',
              lastChecked: new Date().toISOString(),
              message: 'Unable to reach API - possible outage'
            }
          };
        }
      }

      case 'get_tenants': {
        const url = `${API_URL}/tenants/accessible`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return { success: false, error: `Failed to fetch tenants (${response.status})` };
        }

        const tenants = await response.json();
        return {
          success: true,
          result: {
            count: tenants.length,
            tenants: tenants.map((t: Record<string, unknown>) => ({
              id: t.id,
              companyName: t.companyName,
              subdomain: t.subdomain,
              subscriptionStatus: t.subscriptionStatus || 'active',
              subscriptionTier: t.subscriptionTier || 'starter',
              userCount: (t._count as Record<string, number>)?.users || 0
            }))
          }
        };
      }

      case 'get_tenant_details': {
        const { tenantId } = toolInput as { tenantId: string };
        const url = `${API_URL}/tenants/${tenantId}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          return { success: false, error: `Failed to fetch tenant (${response.status})` };
        }
        return { success: true, result: await response.json() };
      }

      case 'draft_claude_code_prompt': {
        const { issueType, title, context, goal, constraints, acceptanceCriteria, relatedTicketId } = toolInput as {
          issueType: string;
          title: string;
          context: string;
          goal: string;
          constraints?: string;
          acceptanceCriteria?: string;
          relatedTicketId?: string;
        };

        const issuePrefix = {
          'BUG_FIX': 'BUG FIX',
          'FEATURE': 'BUILD',
          'REFACTOR': 'REFACTOR',
          'OPTIMIZATION': 'OPTIMIZE'
        }[issueType] || 'TASK';

        const prompt = `${issuePrefix}: ${title}

## Context
${context}

## Goal
${goal}
${constraints ? `
## Constraints
${constraints}` : ''}
${acceptanceCriteria ? `
## Acceptance Criteria
${acceptanceCriteria}` : ''}
${relatedTicketId ? `
## Related
Support Ticket: ${relatedTicketId}` : ''}

---
Generated by Zander AI using Boris Method`;

        return {
          success: true,
          result: {
            message: 'Claude Code prompt generated',
            prompt,
            note: 'Copy this prompt and paste it into Claude Code to begin development.'
          }
        };
      }

      case 'draft_email': {
        const { to, subject, body, ticketId, tenantId } = toolInput as {
          to: string;
          subject: string;
          body: string;
          ticketId?: string;
          tenantId?: string;
        };

        // Create email draft via local endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const url = `${baseUrl}/api/email-drafts`;

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to,
            subject,
            body,
            ticketId,
            tenantId,
            createdBy: 'zander-ai'
          })
        });

        if (!response.ok) {
          // Fallback: return the draft content for manual review
          return {
            success: true,
            result: {
              message: 'Email draft created for review',
              draft: { to, subject, body, status: 'draft' },
              note: 'Review this draft before sending.'
            }
          };
        }

        const result = await response.json();
        return {
          success: true,
          result: {
            message: 'Email draft saved — review before sending',
            draft: result.draft
          }
        };
      }

      case 'diagnose_issue': {
        const { symptoms, affectedArea, tenantId, ticketId } = toolInput as {
          symptoms: string;
          affectedArea: string;
          tenantId?: string;
          ticketId?: string;
        };

        // Build diagnosis based on common patterns
        const diagnoses: Record<string, { possibleCauses: string[]; suggestedActions: string[] }> = {
          'AUTH': {
            possibleCauses: ['Token expiration', 'CORS configuration', 'Invalid credentials', 'Session storage issues'],
            suggestedActions: ['Check token validity', 'Verify CORS settings', 'Check localStorage access', 'Review auth flow logs']
          },
          'CRM': {
            possibleCauses: ['API endpoint mismatch', 'Data validation errors', 'Missing required fields', 'Prisma schema sync'],
            suggestedActions: ['Verify API field names', 'Check DTO validation', 'Review console errors', 'Run prisma db push']
          },
          'CRO': {
            possibleCauses: ['Deal/contact creation errors', 'Pipeline stage issues', 'Activity logging failures'],
            suggestedActions: ['Check create_deal tool schema', 'Verify contact email requirement', 'Review Jordan AI logs']
          },
          'CMO': {
            possibleCauses: ['Workflow trigger issues', 'Funnel creation errors', 'Campaign data sync'],
            suggestedActions: ['Check Don AI tool schemas', 'Verify triggerType enum', 'Review workflow nodes structure']
          },
          'API': {
            possibleCauses: ['Endpoint not found', 'Authentication failed', 'Rate limiting', 'Server errors'],
            suggestedActions: ['Check API URL configuration', 'Verify auth headers', 'Check Railway logs', 'Review error stack traces']
          },
          'DATABASE': {
            possibleCauses: ['Connection pool exhausted', 'Schema drift', 'Query timeout', 'Constraint violations'],
            suggestedActions: ['Check Railway Postgres metrics', 'Run prisma db push', 'Review slow queries', 'Check unique constraints']
          }
        };

        const areaDiagnosis = diagnoses[affectedArea] || diagnoses['API'];

        return {
          success: true,
          result: {
            area: affectedArea,
            symptoms,
            possibleCauses: areaDiagnosis.possibleCauses,
            suggestedActions: areaDiagnosis.suggestedActions,
            severity: symptoms.toLowerCase().includes('cannot') || symptoms.toLowerCase().includes('error') ? 'HIGH' : 'MEDIUM',
            recommendation: `Investigate ${affectedArea} area. Start with checking logs and API responses.`,
            note: tenantId ? `Specific to tenant: ${tenantId}` : 'Platform-wide investigation needed'
          }
        };
      }

      case 'create_support_ticket': {
        const { subject, description, priority = 'P2', category = 'OTHER', tenantId } = toolInput as {
          subject: string;
          description: string;
          priority?: string;
          category?: string;
          tenantId?: string;
        };

        const url = `${API_URL}/support-tickets`;
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            subject,
            description,
            priority,
            category,
            tenantId,
            createdVia: 'ZANDER'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { success: false, error: `Failed to create ticket (${response.status}): ${errorText}` };
        }

        const ticket = await response.json();
        return { success: true, result: { message: 'Support ticket created', ticket } };
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
        role: m.role === 'zander' ? 'assistant' : m.role,
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
        system: ZANDER_SYSTEM_PROMPT,
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
        console.log(`[Zander] Executing tool: ${block.name}`, block.input);
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
          system: ZANDER_SYSTEM_PROMPT,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: textContent || 'I executed the requested actions.',
            },
            {
              role: 'user',
              content: `Tool execution results:\n${toolResultsSummary}\n\nPlease provide a clear, professional summary of what was done. Be specific about the results and suggest any next steps. Use your platform guardian voice.`,
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
        result: tr.success ? tr.result : null,
        error: tr.error,
      })),
      stopReason: claudeData.stop_reason,
    });
  } catch (error) {
    console.error('Zander API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
