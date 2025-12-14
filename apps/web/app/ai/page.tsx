'use client';

import { useState, useRef, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';

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
      'What\'s my profit margin on recent projects?',
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
    personality: 'Efficient, detail-oriented, and refreshingly direct. Miranda has zero tolerance for inefficiency and can spot a bottleneck from a mile away. She ensures everything runs like a well-oiled machine and isn\'t afraid to tell you when something isn\'t working. Delivers actionable advice without sugarcoating. Your operations will never be the same.',
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
    personality: 'Creative, confident, and a master storyteller. Don sees the deeper narrative behind every brand and knows exactly how to make people feel something. He thinks in campaigns and speaks in headlines. Bold ideas come naturally, but always grounded in what actually moves the needle. Will push you to be braver with your marketing than you\'ve ever been.',
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
    reference: 'People & Culture Expert',
    personality: 'Relentlessly positive and genuinely believes in the potential of every person. Ted knows that business success comes down to people - hiring right, treating them well, and building a culture worth showing up for. Encouraging without being naive, he focuses on practical team development while never losing sight of the human element. Believes biscuits solve most problems.',
    avatar: '🤝',
    color: '#0288D1',
    status: 'coming_soon',
    suggestedPrompts: [
      'How do I give constructive feedback?',
      'Help me write a job description',
      'Ideas for team building activities',
      'How do I handle a difficult employee conversation?',
      'What should I look for when hiring?',
      'How do I build a positive company culture?',
    ]
  },
  {
    id: 'cio',
    name: 'Jarvis',
    role: 'CIO',
    fullTitle: 'Chief Information Officer',
    reference: 'Technology & Systems Expert',
    personality: 'Calm, knowledgeable, and always one step ahead. Jarvis understands technology at every level and has a gift for explaining complex systems in simple terms. Security-minded but practical, focused on solutions that actually work for your business. Never condescending, always helpful. Like having a brilliant tech advisor who actually speaks your language.',
    avatar: '🖥️',
    color: '#455A64',
    status: 'coming_soon',
    suggestedPrompts: [
      'What tools should I use for my business?',
      'How do I keep my data secure?',
      'Explain this technical concept simply',
      'Should I build or buy this software?',
      'How do I choose the right CRM?',
      'Help me understand cloud vs on-premise',
    ]
  },
  {
    id: 'ea',
    name: 'Pam',
    role: 'EA',
    fullTitle: 'Executive Assistant',
    reference: 'Organization & Productivity Expert',
    personality: 'Warm, organized, and somehow always one step ahead of what you need. Pam has a remarkable ability to anticipate problems before they happen and keeps everything running smoothly without making a fuss about it. Friendly and approachable, but don\'t mistake her warmth for lack of capability - she\'s the reason things actually get done. Your secret weapon for productivity.',
    avatar: '📋',
    color: '#C2185B',
    status: 'coming_soon',
    suggestedPrompts: [
      'What should I prioritize today?',
      'Help me draft a professional email',
      'Create an agenda for my meeting',
      'How do I manage my time better?',
      'I\'m overwhelmed - help me organize',
      'Set up a follow-up system for me',
    ]
  },
];

// Mock responses for Jordan (CRO)
const jordanResponses: Record<string, string> = {
  'What deals should I focus on this week?': `Great question! Let me help you prioritize. 🎯

Based on solid sales principles, here's how I'd approach your week:

**Focus on these deal categories (in order):**

1. **Deals closest to closing** - Any deals in Negotiation or Proposal stage? These are your hot opportunities. A quick follow-up call could push them over the line.

2. **Deals going stale** - Check for any deals that haven't had activity in 7+ days. Silence is a deal killer! Reach out today.

3. **High-value prospects** - Your biggest potential deals deserve extra attention. Even if they're early stage, nurturing them pays off.

**My challenge for you this week:**
Make 5 more follow-up calls than you normally would. I guarantee at least one will surprise you.

What specific deals would you like me to help you strategize on?`,

  'Help me write a follow-up email for a prospect': `Absolutely! Follow-up emails are where deals are won or lost. Let me give you a template that works:

---

**Subject:** Quick question about [their project/need]

Hi [Name],

I've been thinking about our conversation regarding [specific thing they mentioned]. 

I wanted to share a quick thought: [one valuable insight or idea relevant to their situation].

Would it be helpful to jump on a 15-minute call this week to explore this further? I have [Day] at [Time] or [Day] at [Time] available.

Looking forward to hearing from you!

[Your name]

---

**Key principles I used:**
- ✅ Personalized subject line (not "Following up")
- ✅ Reference something specific they said
- ✅ Provide value, don't just ask for something
- ✅ Clear call-to-action with specific times
- ✅ Keep it short (under 100 words)

Want me to customize this for a specific prospect? Just tell me about them!`,

  'How can I improve my closing rate?': `Now we're talking! 🔥 Improving your close rate is the fastest way to grow revenue without finding more leads.

**The top 5 close-rate killers (and fixes):**

1. **Talking too much, listening too little**
   - Fix: Use the 70/30 rule. Prospect talks 70%, you talk 30%.

2. **Not qualifying hard enough upfront**
   - Fix: Ask about budget, timeline, and decision-makers on the FIRST call. No more wasted proposals.

3. **Waiting too long to follow up**
   - Fix: Speed to lead! Follow up within 5 minutes of inquiry. Within 24 hours max on all touches.

4. **Not creating urgency**
   - Fix: Every proposal needs a deadline. "This pricing is valid until [date]."

5. **Afraid to ask for the sale**
   - Fix: After presenting, simply ask: "Does this look like what you need? Should we move forward?"

**Quick win for this week:**
Review your last 5 lost deals. I bet at least 2 of them had one of these issues. Learn from it!

Which of these resonates most with your situation?`,

  'default': `Great question! Let me think about this from a sales and revenue perspective... 🤔

Here's my take:

The key to success in sales is always about **understanding your customer's needs** and **providing genuine value**. Whatever challenge you're facing, start by asking:

1. What does my customer really want?
2. How can I make their decision easier?
3. What's holding them back?

I'd love to give you more specific advice. Can you tell me more about:
- What industry you're in?
- What specific challenge you're facing?
- What you've already tried?

Let's figure this out together! 💪`
};

function generateJordanResponse(userMessage: string): string {
  // Check for exact matches first
  if (jordanResponses[userMessage]) {
    return jordanResponses[userMessage];
  }
  
  // Check for partial matches
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('deal') && (lowerMessage.includes('focus') || lowerMessage.includes('prioritize') || lowerMessage.includes('week'))) {
    return jordanResponses['What deals should I focus on this week?'];
  }
  
  if (lowerMessage.includes('follow') && lowerMessage.includes('email') || lowerMessage.includes('follow-up email') || lowerMessage.includes('followup')) {
    return jordanResponses['Help me write a follow-up email for a prospect'];
  }
  
  if (lowerMessage.includes('closing') || lowerMessage.includes('close rate') || lowerMessage.includes('close more')) {
    return jordanResponses['How can I improve my closing rate?'];
  }
  
  if (lowerMessage.includes('proposal') || lowerMessage.includes('quote')) {
    return `Proposals are your moment to shine! 📄✨

Here's my framework for proposals that close:

**The 5-Part Winning Proposal:**

1. **Executive Summary** (their words, not yours)
   - Restate their problem in their language
   - Show you listened

2. **Your Solution**
   - Focus on outcomes, not features
   - Paint a picture of success

3. **Why You** (brief!)
   - 2-3 credibility points max
   - Social proof if you have it

4. **Investment** (not "price")
   - Present options when possible
   - Anchor high, offer value

5. **Clear Next Steps**
   - Exactly what happens when they say yes
   - Deadline for the offer

**Pro tip:** Call them BEFORE sending the proposal to walk through it. Proposals sent without a conversation close at 1/3 the rate.

Want me to help you structure a specific proposal?`;
  }
  
  if (lowerMessage.includes('discovery') || lowerMessage.includes('call') || lowerMessage.includes('question')) {
    return `Discovery calls are where deals are won! The best salespeople are the best question-askers. 🎯

**My Top 10 Discovery Questions:**

1. "What prompted you to reach out today?"
2. "What have you tried before?"
3. "What would success look like for this project?"
4. "Who else is involved in this decision?"
5. "What's your timeline looking like?"
6. "What's the budget range you're working with?"
7. "What's the cost of NOT solving this problem?"
8. "What concerns do you have about moving forward?"
9. "What would make this a 'no' for you?"
10. "If everything looks good, what's the next step on your end?"

**The secret:** Ask, then SHUT UP. Let silence do the heavy lifting. Most salespeople talk themselves out of deals.

Which part of your discovery process would you like to improve?`;
  }
  
  if (lowerMessage.includes('objection') || lowerMessage.includes('too expensive') || lowerMessage.includes('think about it')) {
    return `Objections are just questions in disguise! Let's handle them like a pro. 💪

**The 3 Most Common Objections & How to Handle Them:**

**1. "It's too expensive"**
> "I hear you. Let me ask - too expensive compared to what?"
> Then: Focus on ROI, not cost. "If this brings in $X, is $Y a good investment?"

**2. "I need to think about it"**
> "Of course! Just so I can help - what specifically do you need to think through?"
> This surfaces the REAL objection.

**3. "I need to talk to my [partner/boss]"**
> "Makes sense. What questions do you think they'll have?"
> Then: "Would it help if I joined that conversation?"

**The Master Framework (works for ANY objection):**
1. **Acknowledge** - "I understand..."
2. **Ask** - "Help me understand... / Can you tell me more?"
3. **Address** - Solve the real problem
4. **Advance** - "Does that help? Should we move forward?"

What objection are you running into most?`;
  }
  
  // Default response
  return jordanResponses['default'];
}

export default function AIAssistantPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [selectedExecutive, setSelectedExecutive] = useState<Executive>(executives[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateJordanResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      {/* Top Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '2px solid var(--zander-border-gray)',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', letterSpacing: '-0.5px' }}>ZANDER</span>
        </a>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['CRO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'EA'].map((module) => (
            <button
              key={module}
              onClick={() => setActiveModule(module.toLowerCase())}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: activeModule === module.toLowerCase() ? 'var(--zander-red)' : 'transparent',
                color: activeModule === module.toLowerCase() ? 'white' : 'var(--zander-gray)',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {module}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>JW</div>
          <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>Jonathan White</span>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>Logout</button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Layout */}
      <div style={{ display: 'flex', marginTop: '64px', height: 'calc(100vh - 64px)' }}>
        {/* Executive Sidebar */}
        <aside style={{
          width: '280px',
          background: 'white',
          borderRight: '2px solid var(--zander-border-gray)',
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Your AI Team</h2>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>
            Meet your virtual executives, each specialized to help you succeed.
          </p>

          <div style={{ flex: 1 }}>
            {executives.map((exec) => (
              <button
                key={exec.id}
                onClick={() => {
                  if (exec.status === 'active') {
                    setSelectedExecutive(exec);
                    setMessages([]);
                  } else {
                    alert(`${exec.name} (${exec.fullTitle}) is coming soon!\n\n${exec.personality}`);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: selectedExecutive.id === exec.id ? `${exec.color}15` : 'transparent',
                  border: selectedExecutive.id === exec.id ? `2px solid ${exec.color}` : '2px solid transparent',
                  borderRadius: '8px',
                  cursor: exec.status === 'active' ? 'pointer' : 'default',
                  textAlign: 'left',
                  opacity: exec.status === 'coming_soon' ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: exec.status === 'active' ? exec.color : 'var(--zander-gray)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {exec.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{exec.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>({exec.role})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{exec.fullTitle}</div>
                </div>
                {exec.status === 'coming_soon' && (
                  <span style={{
                    padding: '0.125rem 0.375rem',
                    background: 'rgba(240, 179, 35, 0.2)',
                    color: '#B8860B',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    fontWeight: '600'
                  }}>SOON</span>
                )}
              </button>
            ))}
          </div>

          {/* API Note */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--zander-off-white)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'var(--zander-gray)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>🤖</span>
              <strong>Powered by AI</strong>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Claude API integration coming soon. Currently using smart mock responses for demonstration.
            </p>
          </div>

          {/* Meeting Integration Note */}
          <div style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(191, 10, 48, 0.05)',
            border: '1px solid rgba(191, 10, 48, 0.2)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'var(--zander-navy)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>📹</span>
              <strong>Coming Soon</strong>
            </div>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Meeting transcription & summaries with Zoom, Teams, and Google Meet integration.
            </p>
          </div>
        </aside>

        {/* Chat Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--zander-off-white)' }}>
          {/* Executive Header */}
          <div style={{
            background: `linear-gradient(135deg, ${selectedExecutive.color} 0%, ${selectedExecutive.color}dd 100%)`,
            padding: '1.5rem 2rem',
            color: 'white'
          }}>
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
                      {selectedExecutive.name} is thinking...
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
                style={{
                  flex: 1,
                  padding: '1rem 1.25rem',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
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
                Send
                <span>→</span>
              </button>
            </div>
            <div style={{
              textAlign: 'center',
              margin: '0.75rem 0 0 0',
              fontSize: '0.7rem',
              color: 'var(--zander-gray)'
            }}>
              <p style={{ margin: '0 0 0.25rem 0' }}>
                Press Enter to send • {selectedExecutive.name} is here to help you succeed
              </p>
              <p style={{ margin: 0, opacity: 0.8 }}>
                ⚠️ AI can make mistakes. Please verify important information before taking action.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
