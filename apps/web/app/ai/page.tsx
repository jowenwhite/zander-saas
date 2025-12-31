'use client';
import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Executive {
  id: string;
  name: string;
  role: string;
  fullTitle: string;
  reference: string;
  personality: string;
  avatar: string;
  color: string;
  status: 'active' | 'coming_soon';
  suggestedPrompts: string[];
}

const executives: Executive[] = [
  {
    id: 'cro',
    name: 'Jordan',
    role: 'CRO',
    fullTitle: 'Chief Revenue Officer',
    reference: 'Sales & Revenue Expert',
    personality: 'Enthusiastic, warm, and persuasive. Jordan is your dedicated sales coach who gets genuinely excited about helping you close deals and build lasting client relationships. Always encouraging and action-oriented, Jordan focuses on practical strategies that drive real results. Expects you to pick up the phone and make things happen!',
    avatar: '💼',
    color: '#BF0A30',
    status: 'active',
    suggestedPrompts: [
      'What deals should I focus on this week?',
      'Help me write a follow-up email for a prospect',
      'How can I improve my closing rate?',
      'Draft a proposal introduction for a new client',
      'What questions should I ask on a discovery call?',
      'Help me overcome a common sales objection',
    ]
  },
  {
    id: 'cfo',
    name: 'Ben',
    role: 'CFO',
    fullTitle: 'Chief Financial Officer',
    reference: 'Finance & Numbers Expert',
    personality: 'Analytical, practical, and refreshingly cautious. Ben genuinely loves spreadsheets and gets a little too excited about balanced budgets. He gives careful, well-reasoned financial advice and always wants to see the numbers before making any decision. Will occasionally make accounting jokes that only he finds funny. Your voice of fiscal responsibility.',
    avatar: '📊',
    color: '#2E7D32',
    status: 'coming_soon',
    suggestedPrompts: [
      'Analyze my cash flow for the next 30 days',
      "What's my profit margin on recent projects?",
      'Help me create a budget for next quarter',
      'Should I take on this new expense?',
      'How do I price my services profitably?',
      'Review my financial health',
    ]
  },
  {
    id: 'coo',
    name: 'Miranda',
    role: 'COO',
    fullTitle: 'Chief Operations Officer',
    reference: 'Operations & Efficiency Expert',
    personality: "Efficient, detail-oriented, and refreshingly direct. Miranda has zero tolerance for inefficiency and can spot a bottleneck from a mile away. She ensures everything runs like a well-oiled machine and isn't afraid to tell you when something isn't working. Delivers actionable advice without sugarcoating. Your operations will never be the same.",
    avatar: '⚙️',
    color: '#5E35B1',
    status: 'coming_soon',
    suggestedPrompts: [
      'How can I streamline my workflow?',
      'Create a checklist for project delivery',
      'What processes should I automate?',
      'My team keeps missing deadlines - help!',
      'Design an onboarding process for new clients',
      'How do I scale my operations?',
    ]
  },
  {
    id: 'cmo',
    name: 'Don',
    role: 'CMO',
    fullTitle: 'Chief Marketing Officer',
    reference: 'Marketing & Brand Expert',
    personality: "Creative, confident, and a master storyteller. Don sees the deeper narrative behind every brand and knows exactly how to make people feel something. He thinks in campaigns and speaks in headlines. Bold ideas come naturally, but always grounded in what actually moves the needle. Will push you to be braver with your marketing than you've ever been.",
    avatar: '🎨',
    color: '#F57C00',
    status: 'coming_soon',
    suggestedPrompts: [
      'Help me write compelling ad copy',
      'What should my brand message be?',
      'Create a social media content calendar',
      'How do I differentiate from competitors?',
      'What marketing should I focus on first?',
      'Review my website messaging',
    ]
  },
  {
    id: 'cpo',
    name: 'Ted',
    role: 'CPO',
    fullTitle: 'Chief People Officer',
    reference: 'Team & Culture Expert',
    personality: "Warm, insightful, and deeply invested in people. Ted believes the best business results come from teams that genuinely thrive. He helps you build culture, navigate tricky conversations, and become the leader your team needs. Never preachy, always practical. Will remind you that your people are your greatest asset.",
    avatar: '👥',
    color: '#0288D1',
    status: 'coming_soon',
    suggestedPrompts: [
      'How do I give constructive feedback?',
      'Help me write a job description',
      'What should I look for when hiring?',
      'My team morale is low - what can I do?',
      'Create an employee onboarding checklist',
      'How do I handle a difficult employee?',
    ]
  },
  {
    id: 'cio',
    name: 'Jarvis',
    role: 'CIO',
    fullTitle: 'Chief Information Officer',
    reference: 'Technology & Systems Expert',
    personality: "Logical, forward-thinking, and surprisingly patient with non-tech folks. Jarvis makes technology feel approachable and helps you leverage the right tools without overcomplicating things. He sees technology as a means to an end, not an end itself. Will save you from bad software decisions and help you work smarter.",
    avatar: '💻',
    color: '#455A64',
    status: 'coming_soon',
    suggestedPrompts: [
      'What software should I use for X?',
      'How do I automate this repetitive task?',
      'Is my data secure enough?',
      'Help me choose between these tools',
      'What tech stack do I actually need?',
      'How do I integrate my systems?',
    ]
  },
  {
    id: 'ea',
    name: 'Pam',
    role: 'EA',
    fullTitle: 'Executive Assistant',
    reference: 'Organization & Productivity Expert',
    personality: "Organized, proactive, and three steps ahead. Pam keeps everything running smoothly and ensures nothing falls through the cracks. She manages your time like it's precious (because it is) and has an uncanny ability to anticipate what you need before you ask. Your secret weapon for staying sane.",
    avatar: '📋',
    color: '#C2185B',
    status: 'coming_soon',
    suggestedPrompts: [
      'Help me prioritize my tasks today',
      'Create a meeting agenda',
      'What should I delegate?',
      'Help me manage my calendar better',
      'Draft an email to reschedule a meeting',
      'How do I stay organized with so much going on?',
    ]
  }
];

const API_URL = 'https://api.zanderos.com';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('zander_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export default function AIAssistantPage() {
  const [selectedExecutive, setSelectedExecutive] = useState<Executive>(executives[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          executiveId: selectedExecutive.id,
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
        content: `I apologize, but I'm having trouble connecting right now. Please try again in a moment.\n\nIn the meantime, feel free to ask me about:\n- Sales strategies and deal prioritization\n- Follow-up emails and proposals\n- Closing techniques and objection handling\n- Discovery calls and qualification`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExecutiveChange = (exec: Executive) => {
    if (exec.status === 'active') {
      setSelectedExecutive(exec);
      setMessages([]);
      setShowTeamModal(false);
    } else {
      alert(`${exec.name} (${exec.fullTitle}) is coming soon!\n\n${exec.personality}`);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Standard sidebar items
  const salesRevenueItems = [
    { icon: '📊', label: 'Production', href: '/production' },
    { icon: '📁', label: 'Projects', href: '/projects' },
    { icon: '👥', label: 'People', href: '/people' },
    { icon: '📦', label: 'Products', href: '/products' },
  ];

  const toolsItems = [
    { icon: '📧', label: 'Communication', href: '/communication' },
    { icon: '📅', label: 'Schedule', href: '/schedule' },
    { icon: '📋', label: 'Forms', href: '/forms' },
    { icon: '🤖', label: `Ask ${selectedExecutive.name} (${selectedExecutive.role})`, href: '/ai', active: true },
  ];

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cro" />

        {/* Main Layout with Standard Sidebar */}
        <div style={{ display: 'flex', marginTop: '64px', height: 'calc(100vh - 64px)' }}>
          
          {/* Standard Sidebar */}
          <Sidebar collapsed={sidebarCollapsed} />

          {/* Chat Area - with margin for sidebar */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--zander-off-white)', marginLeft: '240px' }}>
            {/* Executive Header */}
            <div style={{
              background: `linear-gradient(135deg, ${selectedExecutive.color} 0%, ${selectedExecutive.color}dd 100%)`,
              padding: '1.5rem 2rem',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem'
                  }}>
                    {selectedExecutive.avatar}
                  </div>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                      Meet {selectedExecutive.name}
                    </h1>
                    <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
                      Your {selectedExecutive.fullTitle} • {selectedExecutive.reference}
                    </p>
                  </div>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    🗑 Clear Chat
                  </button>
                )}
              </div>
              <p style={{ margin: '1rem 0 0 0', opacity: 0.95, fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '700px' }}>
                {selectedExecutive.personality}
              </p>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
              {messages.length === 0 ? (
                <div>
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--zander-gray)',
                    marginBottom: '2rem'
                  }}>
                    <p style={{ fontSize: '1rem', margin: 0 }}>
                      👋 Hey there! I'm {selectedExecutive.name}. How can I help you today?
                    </p>
                  </div>

                  {/* Suggested Prompts */}
                  <div>
                    <h3 style={{ color: 'var(--zander-navy)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: '600' }}>
                      Suggested questions to get started:
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {selectedExecutive.suggestedPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          style={{
                            padding: '1rem',
                            background: 'white',
                            border: '2px solid var(--zander-border-gray)',
                            borderRadius: '8px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: 'var(--zander-navy)',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = selectedExecutive.color;
                            e.currentTarget.style.background = `${selectedExecutive.color}08`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--zander-border-gray)';
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '1rem'
                      }}
                    >
                      {message.role === 'assistant' && (
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: selectedExecutive.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }}>
                          {selectedExecutive.avatar}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '70%',
                        padding: '1rem 1.25rem',
                        borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: message.role === 'user' ? 'var(--zander-navy)' : 'white',
                        color: message.role === 'user' ? 'white' : 'var(--zander-navy)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6
                      }}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: selectedExecutive.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {selectedExecutive.avatar}
                      </div>
                      <div style={{
                        padding: '1rem 1.25rem',
                        background: 'white',
                        borderRadius: '16px 16px 16px 4px',
                        color: 'var(--zander-gray)'
                      }}>
                        <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>
                          {selectedExecutive.name} is thinking...
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{
              padding: '1rem 2rem 1.5rem',
              background: 'white',
              borderTop: '2px solid var(--zander-border-gray)'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask ${selectedExecutive.name} anything...`}
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    padding: '1rem 1.25rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    opacity: isTyping ? 0.7 : 1
                  }}
                  onFocus={(e) => e.target.style.borderColor = selectedExecutive.color}
                  onBlur={(e) => e.target.style.borderColor = 'var(--zander-border-gray)'}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  style={{
                    padding: '1rem 1.5rem',
                    background: inputValue.trim() && !isTyping ? selectedExecutive.color : 'var(--zander-gray)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isTyping ? '...' : 'Send'}
                  {!isTyping && <span>→</span>}
                </button>
              </div>
              {/* Subtle info text */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem',
                margin: '0.75rem 0 0 0',
                fontSize: '0.7rem',
                color: 'var(--zander-gray)'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>🤖</span> Powered by Claude AI
                </span>
                <span>•</span>
                <span>Press Enter to send</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>📹</span> Meeting transcription coming soon
                </span>
              </div>
              <p style={{ textAlign: 'center', margin: '0.5rem 0 0 0', fontSize: '0.65rem', color: 'var(--zander-gray)', opacity: 0.8 }}>
                ⚠️ AI can make mistakes. Please verify important information before taking action.
              </p>
            </div>
          </main>
        </div>



        {/* AI Team Modal */}
        {showTeamModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}
            onClick={() => setShowTeamModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.5rem' }}>Your AI Team</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
                    Meet your virtual executives
                  </p>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--zander-gray)'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {executives.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => handleExecutiveChange(exec)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: selectedExecutive.id === exec.id ? `${exec.color}15` : 'var(--zander-off-white)',
                      border: selectedExecutive.id === exec.id ? `2px solid ${exec.color}` : '2px solid transparent',
                      borderRadius: '12px',
                      cursor: exec.status === 'active' ? 'pointer' : 'default',
                      textAlign: 'left',
                      opacity: exec.status === 'coming_soon' ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: exec.status === 'active' ? exec.color : 'var(--zander-gray)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {exec.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--zander-navy)', fontSize: '1rem' }}>{exec.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>({exec.role})</span>
                        {exec.status === 'coming_soon' && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            background: 'rgba(240, 179, 35, 0.2)',
                            color: '#B8860B',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '600'
                          }}>SOON</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>{exec.fullTitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
