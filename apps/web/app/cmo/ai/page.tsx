'use client';
import { useState, useRef, useEffect } from 'react';
import { SquarePen } from 'lucide-react';
import { CMOLayout } from '../components';
import { getActiveTenant } from '../../utils/auth';

type ToolExecution = {
  tool: string;
  success: boolean;
  itemCreated?: unknown;
  error?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsExecuted?: ToolExecution[];
};

const STORAGE_KEY = 'don_chat_history';

const suggestedPrompts = [
  'Create a target persona for a 45-year-old HVAC business owner',
  'Help me write compelling ad copy',
  'Add a campaign launch to my calendar for next week',
  'Create a welcome email sequence for new leads',
  'Build a lead generation funnel',
  'What makes my brand unique?',
];

// Map tool names to user-friendly labels and icons
const toolLabels: Record<string, { label: string; icon: string; link: string }> = {
  create_persona: { label: 'Persona', icon: '🎯', link: '/cmo/personas' },
  save_marketing_plan: { label: 'Marketing Plan', icon: '📝', link: '/cmo/plan' },
  create_calendar_event: { label: 'Calendar Event', icon: '📅', link: '/cmo/calendar' },
  create_email_template: { label: 'Email Template', icon: '📧', link: '/cmo/templates' },
  create_workflow: { label: 'Workflow', icon: '⚡', link: '/cmo/workflows' },
  create_funnel: { label: 'Funnel', icon: '🎯', link: '/cmo/funnels' },
  update_brand_settings: { label: 'Brand Settings', icon: '🎨', link: '/cmo/brand' },
  create_support_ticket: { label: 'Support Ticket', icon: '🎫', link: '/settings' },
};

export default function AskDonPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executingTools, setExecutingTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore messages with Date objects
        const restored = parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      }
    } catch (e) {
      console.error('Failed to restore chat history:', e);
    }
  }, []);

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setExecutingTools([]);

    try {
      const token = localStorage.getItem('zander_token');
      const activeTenant = getActiveTenant();
      const tenantId = activeTenant?.id;

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call our new API route with tool use support
      const response = await fetch('/api/cmo/don', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(tenantId && { 'x-tenant-id': tenantId }),
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        toolsExecuted: data.toolsExecuted,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setExecutingTools([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CMOLayout>
      <style>{`
        @keyframes don-pulse { 0%,100%{opacity:.4;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes don-spin { to{transform:rotate(360deg)} }
      `}</style>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#F0F0F5',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Ask Don
          </h1>
          <p style={{ color: '#8888A0', margin: 0 }}>
            Your AI Chief Marketing Officer - bold ideas, real actions
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            title="New Conversation"
            style={{
              padding: '0.5rem',
              background: '#1C1C26',
              border: '1px solid #2A2A38',
              borderRadius: '6px',
              color: '#8888A0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SquarePen size={18} />
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div
        style={{
          height: 'calc(100vh - 240px)',
          display: 'flex',
          flexDirection: 'column',
          background: '#1C1C26',
          borderRadius: '12px',
          border: '1px solid #2A2A38',
          overflow: 'hidden',
        }}
      >
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00CCEE 0%, #E65100 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  margin: '0 auto 1.5rem',
                }}
              >
                🎨
              </div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#F0F0F5',
                  marginBottom: '0.5rem',
                }}
              >
                Meet Don, Your CMO
              </h2>
              <p
                style={{
                  color: '#8888A0',
                  maxWidth: '500px',
                  margin: '0 auto 1rem',
                  lineHeight: '1.6',
                }}
              >
                Classic Madison Avenue meets modern digital strategy. I believe great
                marketing is about making people feel something.
              </p>
              <p
                style={{
                  color: '#00CCEE',
                  maxWidth: '500px',
                  margin: '0 auto 2rem',
                  lineHeight: '1.6',
                  fontWeight: '500',
                }}
              >
                I don't just advise — I execute. Ask me to create personas, plan campaigns,
                schedule events, or build funnels. I'll do it right here.
              </p>

              {/* Suggested Prompts */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'center',
                  maxWidth: '600px',
                  margin: '0 auto',
                }}
              >
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      padding: '0.625rem 1rem',
                      background: '#1C1C26',
                      border: '1px solid #2A2A38',
                      borderRadius: '20px',
                      color: '#F0F0F5',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00CCEE';
                      e.currentTarget.style.background = 'rgba(0, 204, 238, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2A2A38';
                      e.currentTarget.style.background = '#1C1C26';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '1rem 1.25rem',
                      borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background:
                        message.role === 'user'
                          ? '#13131A'
                          : 'rgba(0, 204, 238, 0.1)',
                      color: message.role === 'user' ? 'white' : '#F0F0F5',
                    }}
                  >
                    {message.role === 'assistant' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: '#00CCEE',
                        }}
                      >
                        <span>🎨</span> Don
                      </div>
                    )}

                    {/* Tool Execution Indicators */}
                    {message.toolsExecuted && message.toolsExecuted.length > 0 && (
                      <div
                        style={{
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          background: 'rgba(0, 204, 238, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 204, 238, 0.2)',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#00CCEE',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          Actions Taken
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {message.toolsExecuted.map((tool, idx) => {
                            const toolInfo = toolLabels[tool.tool] || { label: tool.tool, icon: '🔧', link: '#' };
                            return (
                              <a
                                key={idx}
                                href={toolInfo.link}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.375rem',
                                  padding: '0.375rem 0.75rem',
                                  background: tool.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  border: `1px solid ${tool.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                                  borderRadius: '16px',
                                  fontSize: '0.8rem',
                                  color: tool.success ? '#10B981' : '#EF4444',
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <span>{tool.success ? '✅' : '❌'}</span>
                                <span>{toolInfo.icon}</span>
                                <span>{toolInfo.label}</span>
                                {tool.success && (
                                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>→ View</span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '0.95rem',
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '16px 16px 16px 4px',
                      background: 'rgba(0, 204, 238, 0.1)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#00CCEE',
                      }}
                    >
                      <span>🎨</span> Don
                    </div>

                    {/* Show executing tools */}
                    {executingTools.length > 0 && (
                      <div
                        style={{
                          marginBottom: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#00CCEE',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="spinner" style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid rgba(0, 204, 238, 0.3)',
                            borderTopColor: '#00CCEE',
                            borderRadius: '50%',
                            animation: 'don-spin 1s linear infinite',
                          }} />
                          Executing: {executingTools.map(t => toolLabels[t]?.label || t).join(', ')}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#00CCEE',
                            animation: `don-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: '1px solid #2A2A38',
            padding: '1rem 1.5rem',
            background: '#1C1C26',
          }}
        >
          {/* Quick prompts when in conversation */}
          {messages.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem',
              }}
            >
              {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '16px',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Don to create personas, plan campaigns, schedule events..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                border: '2px solid #2A2A38',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                background: '#13131A',
                color: '#F0F0F5',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#00CCEE')}
              onBlur={(e) => (e.target.style.borderColor = '#2A2A38')}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: '0.875rem 1.5rem',
                background: input.trim() && !isLoading ? '#00CCEE' : '#2A2A38',
                color: input.trim() && !isLoading ? '#09090F' : '#8888A0',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

    </CMOLayout>
  );
}
