import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const CMO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

// Don's system prompt with tool capabilities
const DON_SYSTEM_PROMPT = `You are Don Draper, the AI Chief Marketing Officer for Zander. You combine classic Madison Avenue wisdom with modern digital strategy.

**Your Personality:**
- Confident, direct, and bold
- You believe great marketing makes people feel something
- You quote advertising legends and classic campaigns
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
    description: 'Save a marketing plan to the CMO Marketing Plan module. Use this when the user asks to create, save, or document a marketing strategy or plan.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the marketing plan'
        },
        summary: {
          type: 'string',
          description: 'Executive summary of the plan'
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Marketing goals for this plan'
        },
        strategies: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key strategies to achieve the goals'
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
      required: ['title', 'summary', 'goals']
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
        trigger: {
          type: 'string',
          description: 'What triggers this workflow (e.g., "Form submission", "Tag added", "Purchase made")'
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['email', 'wait', 'tag', 'notification', 'condition'] },
              config: { type: 'object' }
            }
          },
          description: 'Steps in the workflow'
        }
      },
      required: ['name', 'trigger']
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
        stages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['landing', 'form', 'email', 'offer', 'checkout', 'thank_you'] }
            }
          },
          description: 'Stages in the funnel'
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

  try {
    switch (toolName) {
      case 'create_persona': {
        const response = await fetch(`${CMO_API_URL}/cmo/personas`, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to create persona: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'save_marketing_plan': {
        const response = await fetch(`${CMO_API_URL}/cmo/plan`, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to save marketing plan: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'create_calendar_event': {
        const response = await fetch(`${CMO_API_URL}/cmo/calendar/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(toolInput),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to create calendar event: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'create_email_template': {
        const response = await fetch(`${CMO_API_URL}/cmo/templates`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...toolInput,
            type: 'email',
          }),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to create email template: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'create_workflow': {
        const response = await fetch(`${CMO_API_URL}/cmo/workflows`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...toolInput,
            status: 'draft',
          }),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to create workflow: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'create_funnel': {
        const response = await fetch(`${CMO_API_URL}/cmo/funnels`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...toolInput,
            status: 'draft',
          }),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to create funnel: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
      }

      case 'update_brand_settings': {
        const response = await fetch(`${CMO_API_URL}/cmo/assets/brand`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(toolInput),
        });
        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: `Failed to update brand settings: ${error}` };
        }
        const result = await response.json();
        return { success: true, result };
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
          system: DON_SYSTEM_PROMPT,
          messages: [
            ...messages,
            {
              role: 'assistant',
              content: textContent || 'I executed the requested tools.',
            },
            {
              role: 'user',
              content: `Tool execution results:\n${toolResultsSummary}\n\nPlease provide a brief, friendly summary of what was created or done. Be specific about what was saved and where the user can find it.`,
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
