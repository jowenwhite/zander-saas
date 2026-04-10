'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Minimize2, Send, Bot, Lock, SquarePen } from 'lucide-react';
import { usePEP, Executive, ExecutiveInfo, EXECUTIVES, ZANDER } from './PEPContext';
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

const STORAGE_PREFIX = 'pep_chat_';

// Get storage key for an executive
const getStorageKey = (executive: Executive) => `${STORAGE_PREFIX}${executive}`;

export default function PersistentExecutivePanel() {
  const {
    panelState,
    openPanel,
    closePanel,
    togglePanel,
    enterFullscreen,
    exitFullscreen,
    activeExecutive,
    setActiveExecutive,
    getExecutiveInfo,
    getAvailableExecutives,
  } = usePEP();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('starter');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tenantId, setTenantId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user plan, superadmin status, and tenantId
  useEffect(() => {
    const userStr = localStorage.getItem('zander_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsSuperAdmin(user.isSuperAdmin || false);
        setUserPlan(user.plan || 'starter');
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Get tenantId from active tenant (stored in zander_active_tenant)
    const activeTenant = getActiveTenant();
    if (activeTenant?.id) {
      setTenantId(activeTenant.id);
    }
  }, []);

  // Load messages for current executive from sessionStorage
  useEffect(() => {
    const key = getStorageKey(activeExecutive);
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored = parsed.map((m: Message) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(restored);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error('Failed to restore chat history:', e);
      setMessages([]);
    }
  }, [activeExecutive]);

  // Save messages to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      const key = getStorageKey(activeExecutive);
      try {
        sessionStorage.setItem(key, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages, activeExecutive]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (panelState !== 'hidden') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [panelState]);

  const execInfo = getExecutiveInfo(activeExecutive);
  const availableExecs = getAvailableExecutives(userPlan, isSuperAdmin);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!execInfo || execInfo.status !== 'active') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('zander_token');
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get tenantId fresh at request time (may have loaded after component mount)
      const activeTenant = getActiveTenant();
      // Fallback chain: activeTenant.id -> state tenantId -> direct localStorage read
      let currentTenantId = activeTenant?.id || tenantId;
      if (!currentTenantId) {
        // Direct localStorage fallback in case getActiveTenant failed
        try {
          const storedTenant = localStorage.getItem('zander_active_tenant');
          if (storedTenant) {
            const parsed = JSON.parse(storedTenant);
            currentTenantId = parsed?.id;
          }
        } catch (e) {
          console.error('Failed to parse tenant from localStorage:', e);
        }
      }

      if (!currentTenantId) {
        console.error('No tenant ID available for AI request');
        throw new Error('Tenant ID not available');
      }

      const response = await fetch(execInfo.apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(currentTenantId && { 'x-tenant-id': currentTenantId }),
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          tenantId: currentTenantId,
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
      setMessages(prev => [...prev, assistantMessage]);

      // Emit tool-executed event if tools were used
      if (data.toolsExecuted && data.toolsExecuted.length > 0) {
        window.dispatchEvent(new CustomEvent('pep:tool-executed', {
          detail: {
            executive: activeExecutive,
            tools: data.toolsExecuted,
          },
        }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
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

  const handleExecutiveClick = (exec: ExecutiveInfo) => {
    if (exec.status === 'coming_soon') return;
    if (exec.status === 'upgrade') {
      // Could show upgrade modal here
      return;
    }
    setActiveExecutive(exec.id);
  };

  const handleNewChat = () => {
    setMessages([]);
    const key = getStorageKey(activeExecutive);
    sessionStorage.removeItem(key);
  };

  // Robot icon - shown when panel is hidden
  if (panelState === 'hidden') {
    return (
      <button
        onClick={openPanel}
        title="Your executive team is ready"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00CCEE 0%, #0088AA 100%)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,204,238,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'pep-pulse 4s ease-in-out infinite',
        }}
      >
        <Bot size={32} />
        <style jsx>{`
          @keyframes pep-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 204, 238, 0); }
            50% { box-shadow: 0 0 0 8px rgba(0, 204, 238, 0.15); }
          }
        `}</style>
      </button>
    );
  }

  const panelWidth = panelState === 'fullscreen' ? '100vw' : '380px';

  return (
    <>
      {/* Backdrop for fullscreen */}
      {panelState === 'fullscreen' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
          onClick={exitFullscreen}
        />
      )}

      {/* Panel */}
      <aside
        style={{
          position: 'fixed',
          top: '64px',
          right: 0,
          width: panelWidth,
          height: 'calc(100vh - 64px)',
          background: '#1C1C26',
          borderLeft: '1px solid rgba(0, 204, 238, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
          transition: 'width 200ms ease',
        }}
      >
        {/* Panel Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #2A2A38',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#13131A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: execInfo?.color || '#00CCEE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              {execInfo?.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ color: '#F0F0F5', fontWeight: '600', fontSize: '1rem' }}>
                {execInfo?.name || 'Executive'}
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.8rem' }}>
                {execInfo?.fullTitle || ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleNewChat}
              title="New Conversation"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8888A0',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SquarePen size={18} />
            </button>
            <button
              onClick={panelState === 'fullscreen' ? exitFullscreen : enterFullscreen}
              title={panelState === 'fullscreen' ? 'Exit fullscreen' : 'Fullscreen'}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8888A0',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {panelState === 'fullscreen' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={closePanel}
              title="Close panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8888A0',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Executive Roster */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #2A2A38',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            background: '#13131A',
          }}
        >
          {availableExecs.map((exec) => {
            const isActive = exec.id === activeExecutive;
            const isDisabled = exec.status === 'coming_soon' || exec.status === 'upgrade';

            return (
              <button
                key={exec.id}
                onClick={() => handleExecutiveClick(exec)}
                title={
                  exec.status === 'coming_soon'
                    ? `${exec.name} - Coming Soon`
                    : exec.status === 'upgrade'
                    ? `${exec.name} - Available on ${exec.requiredPlan?.toUpperCase()}`
                    : `${exec.name} (${exec.role})`
                }
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isDisabled ? '#2A2A38' : exec.color,
                  border: isActive ? '2px solid #00CCEE' : '2px solid transparent',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 150ms ease',
                }}
              >
                {exec.name[0]}
                {exec.status === 'upgrade' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#F0B323',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lock size={10} color="#000" />
                  </div>
                )}
                {exec.status === 'coming_soon' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#2A2A38',
                      color: '#8888A0',
                      fontSize: '0.5rem',
                      padding: '1px 4px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Soon
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: execInfo?.color || '#00CCEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  margin: '0 auto 1rem',
                  color: 'white',
                  fontWeight: '700',
                }}
              >
                {execInfo?.name?.[0] || '?'}
              </div>
              <h3 style={{ color: '#F0F0F5', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
                Chat with {execInfo?.name || 'your executive'}
              </h3>
              <p style={{ color: '#8888A0', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                {execInfo?.fullTitle || 'AI Executive'} ready to help.
              </p>
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
                      maxWidth: '85%',
                      padding: '0.75rem 1rem',
                      borderRadius:
                        message.role === 'user'
                          ? '12px 12px 4px 12px'
                          : '12px 12px 12px 4px',
                      background:
                        message.role === 'user'
                          ? '#13131A'
                          : `${execInfo?.color || '#00CCEE'}15`,
                      color: '#F0F0F5',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {message.role === 'assistant' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          marginBottom: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: execInfo?.color || '#00CCEE',
                        }}
                      >
                        {execInfo?.name || 'Assistant'}
                      </div>
                    )}

                    {/* Tool execution badges */}
                    {message.toolsExecuted && message.toolsExecuted.length > 0 && (
                      <div
                        style={{
                          marginBottom: '0.5rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.35rem',
                        }}
                      >
                        {message.toolsExecuted.map((tool, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '500',
                              background: tool.success
                                ? 'rgba(16, 185, 129, 0.2)'
                                : 'rgba(239, 68, 68, 0.2)',
                              color: tool.success ? '#10B981' : '#EF4444',
                            }}
                          >
                            {tool.success ? '✓' : '✗'} {tool.tool.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '12px 12px 12px 4px',
                      background: `${execInfo?.color || '#00CCEE'}15`,
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: execInfo?.color || '#00CCEE',
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
            padding: '0.75rem 1rem',
            borderTop: '1px solid #2A2A38',
            background: '#13131A',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                execInfo?.status !== 'active'
                  ? 'Executive not available'
                  : `Ask ${execInfo?.name || 'your executive'}...`
              }
              disabled={isLoading || execInfo?.status !== 'active'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid #2A2A38',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#09090F',
                color: '#F0F0F5',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || execInfo?.status !== 'active'}
              style={{
                padding: '0.75rem',
                background: input.trim() && !isLoading ? '#00CCEE' : '#2A2A38',
                color: input.trim() && !isLoading ? '#09090F' : '#8888A0',
                border: 'none',
                borderRadius: '8px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </aside>
    </>
  );
}
