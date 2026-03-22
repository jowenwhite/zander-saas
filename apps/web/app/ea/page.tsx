'use client';
import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { ClipboardList, Calendar, Inbox, LayoutDashboard, CheckSquare, Clock, AlertTriangle, Send, Plus, ChevronRight, Circle } from 'lucide-react';

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

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedToId?: string;
  createdAt: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  type: string;
  location?: string;
};

const PAM_STORAGE_KEY = 'pam_chat_history';
const MODULE_COLOR = '#C2185B';

const suggestedPrompts = [
  'What tasks do I have today?',
  'Create a task for reviewing Q4 proposals',
  'What meetings are on my calendar?',
  'Mark the client follow-up task as completed',
  'What are my overdue tasks?',
  'Schedule a team check-in for tomorrow',
];

const toolLabels: Record<string, { label: string; icon: string; link: string }> = {
  get_open_tasks: { label: 'Tasks', icon: '📋', link: '/ea?tab=tasks' },
  create_task: { label: 'Task Created', icon: '✅', link: '/ea?tab=tasks' },
  update_task_status: { label: 'Task Updated', icon: '📝', link: '/ea?tab=tasks' },
  get_calendar_events: { label: 'Calendar', icon: '📅', link: '/ea?tab=calendar' },
  schedule_meeting: { label: 'Meeting', icon: '🗓️', link: '/schedule' },
};

export default function EAPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inbox' | 'calendar' | 'tasks'>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PAM_STORAGE_KEY);
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
        sessionStorage.setItem(PAM_STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat history:', e);
      }
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch tasks when on tasks tab
  useEffect(() => {
    if (activeTab === 'tasks' || activeTab === 'dashboard') {
      fetchTasks();
    }
  }, [activeTab]);

  // Fetch calendar events when on calendar tab
  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'dashboard') {
      fetchEvents();
    }
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/calendar-events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

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
      const token = localStorage.getItem('zander_token');

      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ea/pam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
        timestamp: new Date(),
        toolsExecuted: data.toolsExecuted
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Refresh tasks if any task-related tools were executed
      if (data.toolsExecuted?.some((t: ToolExecution) =>
        ['create_task', 'update_task_status', 'get_open_tasks'].includes(t.tool)
      )) {
        fetchTasks();
      }
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
    sessionStorage.removeItem(PAM_STORAGE_KEY);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const priorityColors: Record<string, string> = {
    HIGH: '#EF4444',
    MEDIUM: '#F59E0B',
    LOW: '#10B981',
    URGENT: '#DC2626',
  };

  const statusColors: Record<string, string> = {
    PENDING: '#8888A0',
    IN_PROGRESS: '#00CCEE',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ] as const;

  const overdueTasks = tasks.filter(t =>
    t.status !== 'COMPLETED' &&
    t.dueDate &&
    new Date(t.dueDate) < new Date()
  );
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'COMPLETED') return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'COMPLETED') return false;
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate > today && dueDate.toDateString() !== today.toDateString();
  }).slice(0, 5);

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#09090F' }}>
        <NavBar activeModule="ea" />

        <div style={{ display: 'flex', marginTop: '64px', height: 'calc(100vh - 64px)' }}>
          <Sidebar collapsed={false} />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#09090F', marginLeft: '240px', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: MODULE_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 20px ${MODULE_COLOR}40`
                }}>
                  <ClipboardList size={24} color="white" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5', margin: 0 }}>
                    Ask Pam
                  </h1>
                  <p style={{ color: '#8888A0', margin: 0, fontSize: '0.9rem' }}>
                    Your AI Executive Assistant - keeping you organized and on track
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.25rem',
              marginBottom: '1.5rem',
              background: '#13131A',
              padding: '0.25rem',
              borderRadius: '10px',
              border: '1px solid #2A2A38',
              width: 'fit-content'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: activeTab === tab.id ? MODULE_COLOR : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#8888A0',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
              {/* Left Panel - Chat (Inbox Tab) or Dashboard/Tasks/Calendar Content */}
              {activeTab === 'inbox' ? (
                // Full width chat for Inbox tab
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1C1C26',
                    borderRadius: '12px',
                    border: '1px solid #2A2A38',
                    overflow: 'hidden'
                  }}>
                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                      {messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: MODULE_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            margin: '0 auto 1.5rem',
                            boxShadow: `0 0 30px ${MODULE_COLOR}40`
                          }}>
                            <ClipboardList size={36} color="white" />
                          </div>
                          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#F0F0F5', marginBottom: '0.5rem' }}>
                            Meet Pam, Your EA
                          </h2>
                          <p style={{ color: '#8888A0', maxWidth: '500px', margin: '0 auto 1rem', lineHeight: '1.6' }}>
                            Organized, proactive, and always three steps ahead. I manage your tasks,
                            coordinate your calendar, and ensure nothing slips through the cracks.
                          </p>
                          <p style={{ color: MODULE_COLOR, maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6', fontWeight: '500' }}>
                            I can create tasks, check your calendar, mark items complete, and keep you
                            focused on what matters most.
                          </p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
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
                                  e.currentTarget.style.borderColor = MODULE_COLOR;
                                  e.currentTarget.style.background = `${MODULE_COLOR}10`;
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
                            <div key={message.id} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                              <div style={{
                                maxWidth: '80%',
                                padding: '1rem 1.25rem',
                                borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: message.role === 'user' ? '#13131A' : `${MODULE_COLOR}15`,
                                color: '#F0F0F5',
                              }}>
                                {message.role === 'assistant' && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: MODULE_COLOR }}>
                                    <ClipboardList size={14} /> Pam
                                  </div>
                                )}

                                {message.toolsExecuted && message.toolsExecuted.length > 0 && (
                                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: `${MODULE_COLOR}10`, borderRadius: '8px', border: `1px solid ${MODULE_COLOR}30` }}>
                                    <div style={{ fontSize: '0.75rem', color: MODULE_COLOR, fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Actions Taken
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      {message.toolsExecuted.map((tool, idx) => {
                                        const toolInfo = toolLabels[tool.tool] || { label: tool.tool, icon: '🔧', link: '#' };
                                        return (
                                          <span
                                            key={idx}
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
                                              fontWeight: '500',
                                            }}
                                          >
                                            <span>{tool.success ? '✅' : '❌'}</span>
                                            <span>{toolInfo.icon}</span>
                                            <span>{toolInfo.label}</span>
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          ))}

                          {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                              <div style={{ padding: '1rem 1.25rem', borderRadius: '16px 16px 16px 4px', background: `${MODULE_COLOR}15` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: MODULE_COLOR }}>
                                  <ClipboardList size={14} /> Pam
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {[0, 1, 2].map((i) => (
                                    <div
                                      key={i}
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: MODULE_COLOR,
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
                    <div style={{ borderTop: '1px solid #2A2A38', padding: '1rem 1.5rem', background: '#1C1C26' }}>
                      {messages.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                          <button onClick={handleClearChat} style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: 'none', color: '#8888A0', fontSize: '0.75rem', cursor: 'pointer' }}>
                            Clear Chat
                          </button>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Ask Pam about tasks, calendar, or to-dos..."
                          disabled={isLoading}
                          style={{
                            flex: 1,
                            padding: '0.875rem 1rem',
                            border: '2px solid #2A2A38',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            outline: 'none',
                            background: '#13131A',
                            color: '#F0F0F5',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = MODULE_COLOR)}
                          onBlur={(e) => (e.target.style.borderColor = '#2A2A38')}
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          style={{
                            padding: '0.875rem 1.5rem',
                            background: input.trim() && !isLoading ? MODULE_COLOR : '#2A2A38',
                            color: input.trim() && !isLoading ? 'white' : '#8888A0',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <p style={{ textAlign: 'center', margin: '0.75rem 0 0 0', fontSize: '0.7rem', color: '#8888A0', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <AlertTriangle size={12} /> AI can make mistakes. Please verify important information.
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'dashboard' ? (
                // Dashboard View
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'Overdue', value: overdueTasks.length, color: '#EF4444', icon: AlertTriangle },
                      { label: 'Due Today', value: todayTasks.length, color: '#F59E0B', icon: Clock },
                      { label: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#00CCEE', icon: Circle },
                      { label: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, color: '#10B981', icon: CheckSquare },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: '#1C1C26',
                        border: '1px solid #2A2A38',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: `${stat.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <stat.icon size={24} color={stat.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>{stat.value}</div>
                          <div style={{ fontSize: '0.85rem', color: '#8888A0' }}>{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Two Column Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
                    {/* Today's Tasks */}
                    <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem', fontWeight: '600' }}>Today's Tasks</h3>
                        <button onClick={() => setActiveTab('tasks')} style={{ background: 'transparent', border: 'none', color: MODULE_COLOR, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          View All <ChevronRight size={16} />
                        </button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {loadingTasks ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>Loading...</div>
                        ) : todayTasks.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No tasks due today</div>
                        ) : (
                          todayTasks.map((task) => (
                            <div key={task.id} style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              margin: '0.25rem 0',
                              background: '#13131A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColors[task.priority] || '#8888A0' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{task.title}</div>
                                <div style={{ color: '#8888A0', fontSize: '0.75rem' }}>{task.dueDate ? formatTime(task.dueDate) : 'No time'}</div>
                              </div>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                background: `${statusColors[task.status] || '#8888A0'}20`,
                                color: statusColors[task.status] || '#8888A0',
                              }}>
                                {task.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Upcoming Events */}
                    <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem', fontWeight: '600' }}>Upcoming Events</h3>
                        <button onClick={() => setActiveTab('calendar')} style={{ background: 'transparent', border: 'none', color: MODULE_COLOR, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          View All <ChevronRight size={16} />
                        </button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                        {loadingEvents ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>Loading...</div>
                        ) : events.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', color: '#8888A0' }}>No upcoming events</div>
                        ) : (
                          events.slice(0, 5).map((event) => (
                            <div key={event.id} style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              margin: '0.25rem 0',
                              background: '#13131A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <Calendar size={16} color={MODULE_COLOR} />
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{event.title}</div>
                                <div style={{ color: '#8888A0', fontSize: '0.75rem' }}>
                                  {formatDate(event.startTime)} at {formatTime(event.startTime)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Chat Input */}
                  <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            setActiveTab('inbox');
                            setTimeout(() => handleSend(), 100);
                          }
                        }}
                        placeholder="Quick ask Pam anything..."
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          border: '1px solid #2A2A38',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          background: '#13131A',
                          color: '#F0F0F5',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => {
                          if (input.trim()) {
                            setActiveTab('inbox');
                            setTimeout(() => handleSend(), 100);
                          }
                        }}
                        style={{
                          padding: '0.75rem 1.25rem',
                          background: MODULE_COLOR,
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Send size={16} /> Ask Pam
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'tasks' ? (
                // Tasks Tab
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  {/* Task Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>All Tasks</h2>
                    <button
                      onClick={() => {
                        setInput('Create a new task for ');
                        setActiveTab('inbox');
                        inputRef.current?.focus();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        background: MODULE_COLOR,
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={18} /> New Task
                    </button>
                  </div>

                  {/* Task List */}
                  <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', flex: 1, overflowY: 'auto' }}>
                    {loadingTasks ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
                        <CheckSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No tasks yet. Ask Pam to create one!</p>
                      </div>
                    ) : (
                      <div style={{ padding: '0.5rem' }}>
                        {tasks.map((task) => (
                          <div key={task.id} style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            margin: '0.5rem',
                            background: '#13131A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '1px solid transparent',
                            transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2A2A38'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          >
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: priorityColors[task.priority] || '#8888A0',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#F0F0F5', fontSize: '1rem', fontWeight: '500' }}>{task.title}</div>
                              {task.description && (
                                <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>{task.description}</div>
                              )}
                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#8888A0' }}>
                                {task.dueDate && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} /> {formatDate(task.dueDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: `${statusColors[task.status] || '#8888A0'}20`,
                              color: statusColors[task.status] || '#8888A0',
                            }}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Calendar Tab
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Calendar Events</h2>
                    <a
                      href="/schedule"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        background: MODULE_COLOR,
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      <Calendar size={18} /> Full Calendar
                    </a>
                  </div>

                  <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', flex: 1, overflowY: 'auto' }}>
                    {loadingEvents ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>Loading events...</div>
                    ) : events.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
                        <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No upcoming events</p>
                      </div>
                    ) : (
                      <div style={{ padding: '0.5rem' }}>
                        {events.map((event) => (
                          <div key={event.id} style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            margin: '0.5rem',
                            background: '#13131A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '1px solid transparent',
                            transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2A2A38'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          >
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '8px',
                              background: `${MODULE_COLOR}15`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <div style={{ fontSize: '0.7rem', color: MODULE_COLOR, fontWeight: '600' }}>
                                {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F0F0F5' }}>
                                {new Date(event.startTime).getDate()}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#F0F0F5', fontSize: '1rem', fontWeight: '500' }}>{event.title}</div>
                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: '#8888A0' }}>
                                <span>{formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''}</span>
                                {event.location && <span>{event.location}</span>}
                              </div>
                            </div>
                            <span style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: '#2A2A38',
                              color: '#8888A0',
                            }}>
                              {event.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% {
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
