'use client';
import { useState, useRef, useEffect } from 'react';
import { CMOLayout } from '../components';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const suggestedPrompts = [
  'What campaign should I launch next?',
  'Help me write compelling ad copy',
  'Review my marketing funnel and suggest improvements',
  'Create a content calendar for this month',
  'How can I improve my email open rates?',
  'What makes my brand unique?',
];

export default function AskDonPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${apiUrl}/cmo/don/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
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
  };

  return (
    <CMOLayout>
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
              color: 'var(--zander-navy)',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Ask Don
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
            Your AI Chief Marketing Officer - bold ideas, timeless wisdom
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--zander-off-white)',
              border: '1px solid var(--zander-border-gray)',
              borderRadius: '6px',
              color: 'var(--zander-gray)',
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
          height: 'calc(100vh - 240px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid var(--zander-border-gray)',
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
                  background: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)',
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
                  color: 'var(--zander-navy)',
                  marginBottom: '0.5rem',
                }}
              >
                Meet Don, Your CMO
              </h2>
              <p
                style={{
                  color: 'var(--zander-gray)',
                  maxWidth: '500px',
                  margin: '0 auto 2rem',
                  lineHeight: '1.6',
                }}
              >
                Classic Madison Avenue meets modern digital strategy. I believe great
                marketing is about making people feel something. Let's make your brand
                impossible to ignore.
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
                      background: 'white',
                      border: '1px solid var(--zander-border-gray)',
                      borderRadius: '20px',
                      color: 'var(--zander-navy)',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#F57C00';
                      e.currentTarget.style.background = 'rgba(245, 124, 0, 0.05)';
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
                          ? 'var(--zander-navy)'
                          : 'rgba(245, 124, 0, 0.1)',
                      color: message.role === 'user' ? 'white' : 'var(--zander-navy)',
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
                          color: '#F57C00',
                        }}
                      >
                        <span>🎨</span> Don
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
                      background: 'rgba(245, 124, 0, 0.1)',
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
                        color: '#F57C00',
                      }}
                    >
                      <span>🎨</span> Don
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#F57C00',
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
            borderTop: '1px solid var(--zander-border-gray)',
            padding: '1rem 1.5rem',
            background: 'white',
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
                    background: 'var(--zander-off-white)',
                    border: '1px solid var(--zander-border-gray)',
                    borderRadius: '16px',
                    color: 'var(--zander-gray)',
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
              placeholder="Ask Don anything about marketing..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                border: '2px solid var(--zander-border-gray)',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#F57C00')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--zander-border-gray)')}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                padding: '0.875rem 1.5rem',
                background: input.trim() && !isLoading ? '#F57C00' : 'var(--zander-border-gray)',
                color: 'white',
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
    </CMOLayout>
  );
}
