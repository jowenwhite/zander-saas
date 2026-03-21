'use client';
import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { Ticket, AlertTriangle, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const JORDAN_STORAGE_KEY = 'jordan_chat_history';

const suggestedPrompts = [
  'What deals should I focus on this week?',
  'Help me write a follow-up email for a prospect',
  'How can I improve my closing rate?',
  'Draft a proposal introduction for a new client',
  'What questions should I ask on a discovery call?',
  'Help me overcome a common sales objection',
];

const API_URL = 'https://api.zanderos.com';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zander_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default function AskJordanPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', category: 'HOW_TO', priority: 'P3' });
  const [savingTicket, setSavingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(JORDAN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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
        sessionStorage.setItem(JORDAN_STORAGE_KEY, JSON.stringify(messages));
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          executiveId: 'cro',
          message: userMessage.content,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Please try again in a moment.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
    sessionStorage.removeItem(JORDAN_STORAGE_KEY);
  };

  const openTicketModal = (assistantMessage: string) => {
    setTicketForm({
      subject: 'Question for Jordan (CRO)',
      description: `Original question: ${messages[messages.length - 2]?.content || 'N/A'}\n\nAI Response: ${assistantMessage}\n\nReason for escalation: `,
      category: 'HOW_TO',
      priority: 'P3'
    });
    setShowTicketModal(true);
  };

  const submitTicket = async () => {
    setSavingTicket(true);
    try {
      const response = await fetch(`${API_URL}/support-tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          subject: ticketForm.subject,
          description: ticketForm.description,
          category: ticketForm.category,
          priority: ticketForm.priority,
          createdVia: 'JORDAN'
        })
      });

      if (response.ok) {
        const ticket = await response.json();
        alert(`Support ticket #${ticket.ticketNumber} created successfully! Our team will review it shortly.`);
        setShowTicketModal(false);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    }
    setSavingTicket(false);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#09090F' }}>
        <NavBar activeModule="cro" />

        <div style={{ display: 'flex', marginTop: '64px', height: 'calc(100vh - 64px)' }}>
          <Sidebar collapsed={false} />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#09090F', marginLeft: '240px', padding: '2rem' }}>
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
                  Ask Jordan
                </h1>
                <p style={{ color: '#8888A0', margin: 0 }}>
                  Your AI Chief Revenue Officer - sales coach and deal closer
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#1C1C26',
                    border: '1px solid #2A2A38',
                    borderRadius: '6px',
                    color: '#8888A0',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Chat Container */}
            <div
              style={{
                flex: 1,
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
                        background: 'linear-gradient(135deg, #00CCEE 0%, #0066CC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        margin: '0 auto 1.5rem',
                      }}
                    >
                      💼
                    </div>
                    <h2
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#F0F0F5',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Meet Jordan, Your CRO
                    </h2>
                    <p
                      style={{
                        color: '#8888A0',
                        maxWidth: '500px',
                        margin: '0 auto 1rem',
                        lineHeight: '1.6',
                      }}
                    >
                      Enthusiastic, warm, and persuasive. I'm your dedicated sales coach who gets
                      genuinely excited about helping you close deals and build lasting client relationships.
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
                      I don't just advise — I help you take action. Ask me to write follow-ups, craft proposals,
                      prepare for discovery calls, or overcome objections. Let's close some deals.
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
                              <span>💼</span> Jordan
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

                          {message.role === 'assistant' && (
                            <button
                              onClick={() => openTicketModal(message.content)}
                              style={{
                                marginTop: '0.75rem',
                                padding: '0.5rem 0.75rem',
                                background: 'transparent',
                                border: '1px solid #2A2A38',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: '#8888A0',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 204, 238, 0.1)'; e.currentTarget.style.borderColor = '#00CCEE'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#2A2A38'; }}
                            >
                              <Ticket size={12} /> Need more help? Create Support Ticket
                            </button>
                          )}
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
                            <span>💼</span> Jordan
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: '#00CCEE',
                                  animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
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
                    placeholder="Ask Jordan about deals, follow-ups, proposals, closing strategies..."
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

                {/* AI Disclaimer only */}
                <p style={{
                  textAlign: 'center',
                  margin: '0.75rem 0 0 0',
                  fontSize: '0.7rem',
                  color: '#8888A0',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}>
                  <AlertTriangle size={12} /> AI can make mistakes. Please verify important information before taking action.
                </p>
              </div>
            </div>
          </main>
        </div>

        {/* Support Ticket Modal */}
        {showTicketModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid #2A2A38'
            }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', background: '#13131A', borderRadius: '12px 12px 0 0' }}>
                <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Ticket size={20} /> Create Support Ticket
                </h2>
                <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                  Escalate this conversation to human support
                </p>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }}
                    >
                      <option value="HOW_TO">How To</option>
                      <option value="BUG">Bug Report</option>
                      <option value="FEATURE_REQUEST">Feature Request</option>
                      <option value="PLATFORM">Platform Issue</option>
                      <option value="BILLING">Billing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }}
                    >
                      <option value="P3">Low</option>
                      <option value="P2">Medium</option>
                      <option value="P1">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '6px', fontSize: '1rem', minHeight: '150px', fontFamily: 'inherit', background: '#13131A', color: '#F0F0F5' }}
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>
                <div style={{ background: '#13131A', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#8888A0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Lightbulb size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> <span><strong>Tip:</strong> Include specific details about what you were trying to do and any error messages you encountered.</span>
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid #2A2A38', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => setShowTicketModal(false)}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #2A2A38', borderRadius: '6px', cursor: 'pointer', background: '#13131A', color: '#8888A0' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitTicket}
                  disabled={savingTicket || !ticketForm.subject || !ticketForm.description}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: '#00CCEE',
                    color: '#000000',
                    fontWeight: '600',
                    opacity: savingTicket || !ticketForm.subject || !ticketForm.description ? 0.5 : 1
                  }}
                >
                  {savingTicket ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 0.4;
              transform: scale(0.8);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
