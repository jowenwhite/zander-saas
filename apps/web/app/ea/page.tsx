'use client';
import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { ClipboardList, Calendar, Inbox, LayoutDashboard, CheckSquare, Clock, AlertTriangle, Send, Plus, ChevronRight, Circle, Mail, MessageSquare, Phone, Video, MailOpen, ArrowLeft, ArrowRight } from 'lucide-react';

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
  eventType: string;
  location?: string;
  meetingUrl?: string;
  contact?: { firstName: string; lastName: string };
};

type EmailMessage = {
  id: string;
  direction: 'inbound' | 'outbound';
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
  isRead: boolean;
  contact?: { firstName: string; lastName: string };
};

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const PAM_STORAGE_KEY = 'pam_chat_history';
const MODULE_COLOR = '#C2185B';
const API_URL = 'https://api.zanderos.com';

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
  book_meeting: { label: 'Meeting Booked', icon: '🗓️', link: '/schedule' },
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
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Book Meeting Modal State
  const [showBookMeetingModal, setShowBookMeetingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [bookingMeeting, setBookingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    contactId: '',
    location: '',
    description: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('zander_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
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

  // Fetch tasks
  useEffect(() => {
    if (activeTab === 'tasks' || activeTab === 'dashboard') {
      fetchTasks();
    }
  }, [activeTab]);

  // Fetch calendar events
  useEffect(() => {
    if (activeTab === 'calendar' || activeTab === 'dashboard') {
      fetchEvents();
      fetchContacts();
    }
  }, [activeTab]);

  // Fetch emails for inbox
  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchEmails();
    }
  }, [activeTab]);

  // Listen for PEP tool executions to refresh data
  useEffect(() => {
    const handlePEPToolExecuted = (event: CustomEvent) => {
      const { executive, tools } = event.detail;
      if (executive !== 'pam') return;

      const taskTools = ['create_task', 'update_task_status', 'get_open_tasks'];
      const calendarTools = ['book_meeting', 'get_calendar_events', 'create_calendar_event'];
      const emailTools = ['send_email', 'get_emails'];

      if (tools.some((t: { tool: string }) => taskTools.includes(t.tool))) {
        fetchTasks();
      }
      if (tools.some((t: { tool: string }) => calendarTools.includes(t.tool))) {
        fetchEvents();
        fetchContacts();
      }
      if (tools.some((t: { tool: string }) => emailTools.includes(t.tool))) {
        fetchEmails();
      }
    };

    window.addEventListener('pep:tool-executed', handlePEPToolExecuted as EventListener);
    return () => {
      window.removeEventListener('pep:tool-executed', handlePEPToolExecuted as EventListener);
    };
  }, []);

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await fetch(API_URL + '/tasks', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and paginated response formats
        const tasksArray = Array.isArray(data) ? data : (data.data || []);
        setTasks(tasksArray);
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
      const response = await fetch(API_URL + '/calendar-events', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and paginated response formats
        const eventsArray = Array.isArray(data) ? data : (data.data || []);
        setEvents(eventsArray);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchEmails = async () => {
    setLoadingEmails(true);
    try {
      const response = await fetch(API_URL + '/email-messages', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and paginated response formats
        const emailsArray = Array.isArray(data) ? data : (data.data || []);
        setEmails(emailsArray);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(API_URL + '/contacts', { headers: getAuthHeaders() });
      if (response.ok) {
        const data = await response.json();
        // Handle both array and paginated response formats
        const contactsArray = Array.isArray(data) ? data : (data.data || []);
        setContacts(contactsArray);
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
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
      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ea/pam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage.content, conversationHistory })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        toolsExecuted: data.toolsExecuted
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Refresh data if tools were executed
      if (data.toolsExecuted?.some((t: ToolExecution) => ['create_task', 'update_task_status'].includes(t.tool))) {
        fetchTasks();
      }
      if (data.toolsExecuted?.some((t: ToolExecution) => t.tool === 'book_meeting')) {
        fetchEvents();
      }
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting right now. Please try again in a moment.`,
        timestamp: new Date()
      }]);
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

  // Book Meeting with Pam (two-step flow)
  const handleBookMeeting = async () => {
    if (bookingStep === 1) {
      // Validate step 1
      if (!meetingForm.title || !meetingForm.startTime) {
        alert('Please fill in meeting title and start time');
        return;
      }
      setBookingStep(2);
      return;
    }

    // Step 2: Confirm and book via Pam
    setBookingMeeting(true);
    try {
      const token = localStorage.getItem('zander_token');
      const contactName = contacts.find(c => c.id === meetingForm.contactId);
      const attendeeName = contactName ? `${contactName.firstName} ${contactName.lastName}` : 'No attendee';

      // Send booking request to Pam
      const bookingMessage = `Book a meeting titled "${meetingForm.title}" on ${new Date(meetingForm.startTime).toLocaleString()}${meetingForm.contactId ? ` with ${attendeeName}` : ''}${meetingForm.location ? ` at ${meetingForm.location}` : ''}${meetingForm.description ? `. Notes: ${meetingForm.description}` : ''}`;

      const response = await fetch('/api/ea/pam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: bookingMessage, conversationHistory: [] })
      });

      if (response.ok) {
        const data = await response.json();
        // Add to chat history
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), role: 'user', content: bookingMessage, timestamp: new Date() },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: data.content, timestamp: new Date(), toolsExecuted: data.toolsExecuted }
        ]);
        // Close modal and refresh
        setShowBookMeetingModal(false);
        setBookingStep(1);
        setMeetingForm({ title: '', startTime: '', endTime: '', contactId: '', location: '', description: '' });
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to book meeting:', error);
      alert('Failed to book meeting. Please try again.');
    } finally {
      setBookingMeeting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const priorityColors: Record<string, string> = {
    HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981', URGENT: '#DC2626',
  };

  const statusColors: Record<string, string> = {
    PENDING: '#8888A0', IN_PROGRESS: '#00CCEE', COMPLETED: '#10B981', CANCELLED: '#EF4444',
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ] as const;

  const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date());
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'COMPLETED') return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  });

  const unreadEmails = emails.filter(e => !e.isRead && e.direction === 'inbound');

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
                  width: '48px', height: '48px', borderRadius: '50%', background: MODULE_COLOR,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${MODULE_COLOR}40`
                }}>
                  <ClipboardList size={24} color="white" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5', margin: 0 }}>Ask Pam</h1>
                  <p style={{ color: '#8888A0', margin: 0, fontSize: '0.9rem' }}>Your AI Executive Assistant</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#13131A',
              padding: '0.25rem', borderRadius: '10px', border: '1px solid #2A2A38', width: 'fit-content'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                    border: 'none', borderRadius: '8px',
                    background: activeTab === tab.id ? MODULE_COLOR : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#8888A0',
                    fontWeight: activeTab === tab.id ? '600' : '400', fontSize: '0.9rem', cursor: 'pointer'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                  {tab.id === 'inbox' && unreadEmails.length > 0 && (
                    <span style={{
                      background: '#EF4444', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem',
                      borderRadius: '10px', fontWeight: '600'
                    }}>{unreadEmails.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>

              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                  {/* Quick Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                      { label: 'Overdue', value: overdueTasks.length, color: '#EF4444', icon: AlertTriangle },
                      { label: 'Due Today', value: todayTasks.length, color: '#F59E0B', icon: Clock },
                      { label: 'Unread Emails', value: unreadEmails.length, color: '#00CCEE', icon: Mail },
                      { label: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, color: '#10B981', icon: CheckSquare },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px',
                        padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem'
                      }}>
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '10px', background: `${stat.color}15`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                            <div key={task.id} style={{ padding: '0.75rem 1rem', borderRadius: '8px', margin: '0.25rem 0', background: '#13131A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: priorityColors[task.priority] || '#8888A0' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{task.title}</div>
                              </div>
                              <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', background: `${statusColors[task.status] || '#8888A0'}20`, color: statusColors[task.status] || '#8888A0' }}>
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
                            <div key={event.id} style={{ padding: '0.75rem 1rem', borderRadius: '8px', margin: '0.25rem 0', background: '#13131A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <Calendar size={16} color={MODULE_COLOR} />
                              <div style={{ flex: 1 }}>
                                <div style={{ color: '#F0F0F5', fontSize: '0.9rem' }}>{event.title}</div>
                                <div style={{ color: '#8888A0', fontSize: '0.75rem' }}>{formatDateTime(event.startTime)}</div>
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
                          if (e.key === 'Enter' && input.trim()) {
                            handleSend();
                          }
                        }}
                        placeholder="Quick ask Pam anything..."
                        style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid #2A2A38', borderRadius: '8px', fontSize: '0.9rem', background: '#13131A', color: '#F0F0F5', outline: 'none' }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        style={{ padding: '0.75rem 1.25rem', background: MODULE_COLOR, border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Send size={16} /> Ask Pam
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INBOX TAB - Real Communication Inbox */}
              {activeTab === 'inbox' && (
                <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                  {/* Email List */}
                  <div style={{ width: selectedEmail ? '40%' : '100%', background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1rem', fontWeight: '600' }}>
                        <Mail size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Email Inbox
                        {unreadEmails.length > 0 && (
                          <span style={{ marginLeft: '0.5rem', background: '#EF4444', color: 'white', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                            {unreadEmails.length} new
                          </span>
                        )}
                      </h3>
                      <a href="/communication" style={{ color: MODULE_COLOR, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Full Inbox <ChevronRight size={16} />
                      </a>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {loadingEmails ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>Loading emails...</div>
                      ) : emails.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
                          <Mail size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                          <p>No emails yet</p>
                        </div>
                      ) : (
                        emails.slice(0, 20).map((email) => (
                          <div
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            style={{
                              padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A38', cursor: 'pointer',
                              background: selectedEmail?.id === email.id ? `${MODULE_COLOR}15` : !email.isRead && email.direction === 'inbound' ? '#1a1a24' : 'transparent',
                              transition: 'background 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                              {email.direction === 'inbound' ? (
                                <MailOpen size={14} color={email.isRead ? '#8888A0' : '#00CCEE'} />
                              ) : (
                                <Send size={14} color="#8888A0" />
                              )}
                              <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: email.isRead ? '400' : '600', color: '#F0F0F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {email.direction === 'inbound' ? email.fromAddress : email.toAddress}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>{formatDate(email.sentAt)}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: email.isRead ? '#8888A0' : '#F0F0F5', fontWeight: email.isRead ? '400' : '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {email.subject || '(No Subject)'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {email.body?.substring(0, 80)}...
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Email Detail */}
                  {selectedEmail && (
                    <div style={{ flex: 1, background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button onClick={() => setSelectedEmail(null)} style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ArrowLeft size={16} /> Back
                        </button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                        <h2 style={{ color: '#F0F0F5', fontSize: '1.25rem', margin: '0 0 1rem' }}>{selectedEmail.subject || '(No Subject)'}</h2>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#8888A0' }}>
                          <span><strong>From:</strong> {selectedEmail.fromAddress}</span>
                          <span><strong>To:</strong> {selectedEmail.toAddress}</span>
                          <span><strong>Date:</strong> {formatDateTime(selectedEmail.sentAt)}</span>
                        </div>
                        <div style={{ background: '#13131A', padding: '1.5rem', borderRadius: '8px', color: '#F0F0F5', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                          {selectedEmail.body}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CALENDAR TAB */}
              {activeTab === 'calendar' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Calendar Events</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => setShowBookMeetingModal(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem',
                          background: MODULE_COLOR, border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        <Video size={18} /> Book a Meeting
                      </button>
                      <a href="/schedule" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem',
                        background: '#2A2A38', border: 'none', borderRadius: '8px', color: '#F0F0F5', fontWeight: '600', textDecoration: 'none'
                      }}>
                        <Calendar size={18} /> Full Calendar
                      </a>
                    </div>
                  </div>

                  <div style={{ background: '#1C1C26', border: '1px solid #2A2A38', borderRadius: '12px', flex: 1, overflowY: 'auto' }}>
                    {loadingEvents ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>Loading events...</div>
                    ) : events.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
                        <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                        <p>No upcoming events</p>
                        <button onClick={() => setShowBookMeetingModal(true)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: MODULE_COLOR, border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                          Book Your First Meeting
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '0.5rem' }}>
                        {events.map((event) => (
                          <div key={event.id} style={{
                            padding: '1rem 1.25rem', borderRadius: '8px', margin: '0.5rem', background: '#13131A',
                            display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid transparent', transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2A2A38'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          >
                            <div style={{
                              width: '48px', height: '48px', borderRadius: '8px', background: `${MODULE_COLOR}15`,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
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
                                {event.contact && <span>with {event.contact.firstName} {event.contact.lastName}</span>}
                              </div>
                            </div>
                            {event.meetingUrl && (
                              <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" style={{
                                padding: '0.5rem 0.75rem', background: '#00CCEE', color: '#09090F', borderRadius: '6px',
                                fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem'
                              }}>
                                <Video size={14} /> Join
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>All Tasks</h2>
                    <button
                      onClick={() => { setInput('Create a new task for '); setActiveTab('dashboard'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem',
                        background: MODULE_COLOR, border: 'none', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer'
                      }}
                    >
                      <Plus size={18} /> New Task
                    </button>
                  </div>

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
                            padding: '1rem 1.25rem', borderRadius: '8px', margin: '0.5rem', background: '#13131A',
                            display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid transparent', transition: 'border-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2A2A38'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          >
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: priorityColors[task.priority] || '#8888A0', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#F0F0F5', fontSize: '1rem', fontWeight: '500' }}>{task.title}</div>
                              {task.description && <div style={{ color: '#8888A0', fontSize: '0.85rem', marginTop: '0.25rem' }}>{task.description}</div>}
                              {task.dueDate && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#8888A0' }}>
                                  <Clock size={12} /> {formatDate(task.dueDate)}
                                </div>
                              )}
                            </div>
                            <span style={{
                              padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600',
                              background: `${statusColors[task.status] || '#8888A0'}20`, color: statusColors[task.status] || '#8888A0'
                            }}>
                              {task.status.replace('_', ' ')}
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

        {/* Book a Meeting Modal - Two Step */}
        {showBookMeetingModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: '#1C1C26', borderRadius: '16px', width: '500px', maxHeight: '90vh',
              overflow: 'auto', border: '1px solid #2A2A38', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
              {/* Modal Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #2A2A38', background: '#13131A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: MODULE_COLOR,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Video size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Book a Meeting</h2>
                    <p style={{ margin: 0, color: '#8888A0', fontSize: '0.85rem' }}>
                      Step {bookingStep} of 2: {bookingStep === 1 ? 'Enter details' : 'Confirm with Pam'}
                    </p>
                  </div>
                </div>
                {/* Progress indicator */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: MODULE_COLOR }} />
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: bookingStep === 2 ? MODULE_COLOR : '#2A2A38' }} />
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem' }}>
                {bookingStep === 1 ? (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>Meeting Title *</label>
                      <input
                        type="text"
                        value={meetingForm.title}
                        onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                        placeholder="e.g., Client Discovery Call"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>Start Time *</label>
                        <input
                          type="datetime-local"
                          value={meetingForm.startTime}
                          onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>End Time</label>
                        <input
                          type="datetime-local"
                          value={meetingForm.endTime}
                          onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>Attendee</label>
                      <select
                        value={meetingForm.contactId}
                        onChange={(e) => setMeetingForm({ ...meetingForm, contactId: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem' }}
                      >
                        <option value="">No attendee</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>Location</label>
                      <input
                        type="text"
                        value={meetingForm.location}
                        onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                        placeholder="e.g., Zoom, Office, etc."
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '500' }}>Notes</label>
                      <textarea
                        value={meetingForm.description}
                        onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                        placeholder="Any additional notes..."
                        rows={3}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', fontSize: '1rem', resize: 'vertical' }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%', background: MODULE_COLOR,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                      <ClipboardList size={32} color="white" />
                    </div>
                    <h3 style={{ color: '#F0F0F5', margin: '0 0 1rem' }}>Confirm with Pam</h3>
                    <div style={{ background: '#13131A', padding: '1rem', borderRadius: '8px', textAlign: 'left', marginBottom: '1rem' }}>
                      <p style={{ color: '#8888A0', margin: '0 0 0.5rem', fontSize: '0.85rem' }}>Meeting details:</p>
                      <p style={{ color: '#F0F0F5', margin: '0 0 0.25rem' }}><strong>Title:</strong> {meetingForm.title}</p>
                      <p style={{ color: '#F0F0F5', margin: '0 0 0.25rem' }}><strong>When:</strong> {meetingForm.startTime ? new Date(meetingForm.startTime).toLocaleString() : 'Not set'}</p>
                      {meetingForm.contactId && (
                        <p style={{ color: '#F0F0F5', margin: '0 0 0.25rem' }}>
                          <strong>With:</strong> {contacts.find(c => c.id === meetingForm.contactId)?.firstName} {contacts.find(c => c.id === meetingForm.contactId)?.lastName}
                        </p>
                      )}
                      {meetingForm.location && <p style={{ color: '#F0F0F5', margin: '0 0 0.25rem' }}><strong>Location:</strong> {meetingForm.location}</p>}
                    </div>
                    <p style={{ color: '#8888A0', fontSize: '0.9rem' }}>
                      Pam will book this meeting and add it to your calendar.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #2A2A38', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => {
                    if (bookingStep === 2) {
                      setBookingStep(1);
                    } else {
                      setShowBookMeetingModal(false);
                      setBookingStep(1);
                      setMeetingForm({ title: '', startTime: '', endTime: '', contactId: '', location: '', description: '' });
                    }
                  }}
                  style={{ padding: '0.75rem 1.5rem', border: '1px solid #2A2A38', borderRadius: '8px', background: 'transparent', color: '#8888A0', cursor: 'pointer' }}
                >
                  {bookingStep === 2 ? 'Back' : 'Cancel'}
                </button>
                <button
                  onClick={handleBookMeeting}
                  disabled={bookingMeeting}
                  style={{
                    padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px',
                    background: MODULE_COLOR, color: 'white', fontWeight: '600', cursor: 'pointer',
                    opacity: bookingMeeting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  {bookingStep === 1 ? (
                    <>Continue <ArrowRight size={16} /></>
                  ) : bookingMeeting ? (
                    'Booking...'
                  ) : (
                    <>Confirm & Book</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </AuthGuard>
  );
}
