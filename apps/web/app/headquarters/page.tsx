'use client';

import { useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { logout } from '../utils/auth';

export default function HeadquartersPage() {
  const [activeModule, setActiveModule] = useState('cro');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // ============ DATA ============

  const keystoneMetrics = [
    { id: 'cro', icon: '💼', label: 'Pipeline Value', value: '$139,000', trend: 'up', trendValue: '12%', module: 'CRO', color: '#BF0A30' },
    { id: 'cfo', icon: '📊', label: 'Cash on Hand', value: '$47,500', trend: 'down', trendValue: '3%', module: 'CFO', color: '#2E7D32' },
    { id: 'coo', icon: '⚙️', label: 'On-Time Delivery', value: '94%', trend: 'flat', trendValue: '', module: 'COO', color: '#5E35B1' },
    { id: 'cmo', icon: '🎨', label: 'Leads This Month', value: '12', trend: 'up', trendValue: '8%', module: 'CMO', color: '#F57C00' },
    { id: 'cpo', icon: '🤝', label: 'Team Satisfaction', value: '4.2/5', trend: 'up', trendValue: '0.3', module: 'CPO', color: '#0288D1' },
    { id: 'cio', icon: '🖥️', label: 'System Uptime', value: '99.9%', trend: 'flat', trendValue: '', module: 'CIO', color: '#455A64' },
    { id: 'ea', icon: '📋', label: 'Tasks Completed', value: '23/28', trend: 'up', trendValue: '82%', module: 'EA', color: '#C2185B' },
  ];

  const quickNavButtons = [
    { id: 'assembly', icon: '🏛️', label: 'Assembly', description: 'Meetings & Agendas' },
    { id: 'campaigns', icon: '⚔️', label: 'Campaigns', description: 'Goals & Priorities' },
    { id: 'headwinds', icon: '🌀', label: 'Headwinds', description: 'Challenges & Issues' },
    { id: 'founding', icon: '📜', label: 'Founding Principles', description: 'Vision & Values' },
    { id: 'legacy', icon: '🏆', label: 'The Legacy', description: '3-5 Year Vision' },
    { id: 'ledger', icon: '📒', label: 'The Ledger', description: 'Metrics & Scores' },
  ];

  const todayAssembly = {
    title: 'Weekly Assembly',
    time: '9:00 AM',
    agenda: ['Review Keystones', 'Headwinds Update', 'Campaign Progress', 'Victories', 'Action Items'],
    attendees: 5
  };

  const activeHeadwinds = [
    { id: 1, title: 'Supply chain delays affecting delivery times', priority: 'high', days: 4, owner: 'Jonathan W.', category: 'Operations' },
    { id: 2, title: 'Need to hire additional sales rep', priority: 'medium', days: 6, owner: 'David S.', category: 'People' },
    { id: 3, title: 'Website conversion rate dropped 15%', priority: 'high', days: 9, owner: 'Marketing Team', category: 'Marketing' },
  ];

  const horizonItems = [
    { id: 1, title: 'Explore new CRM integrations', addedDate: 'Nov 15', category: 'Technology' },
    { id: 2, title: 'Consider expanding to Alabama market', addedDate: 'Nov 20', category: 'Growth' },
    { id: 3, title: 'Evaluate equipment upgrade options', addedDate: 'Dec 1', category: 'Operations' },
  ];

  const victories = [
    { id: 1, title: 'Completed CRM training ahead of schedule', date: 'Dec 10', resolvedBy: 'Team', daysToResolve: 5 },
    { id: 2, title: 'Closed Johnson kitchen remodel - $45K', date: 'Dec 8', resolvedBy: 'Jonathan W.', daysToResolve: 12 },
    { id: 3, title: 'Resolved shipping delay issue with vendor', date: 'Dec 5', resolvedBy: 'Operations', daysToResolve: 8 },
    { id: 4, title: 'Fixed website loading speed issues', date: 'Dec 2', resolvedBy: 'CIO', daysToResolve: 3 },
    { id: 5, title: 'Onboarded 2 new team members successfully', date: 'Nov 28', resolvedBy: 'HR', daysToResolve: 14 },
  ];

  const myCampaignItems = [
    { id: 1, title: 'Close 3 deals this quarter', progress: 66, target: '3 deals', current: '2 deals', dueDate: 'Dec 31' },
    { id: 2, title: 'Launch email automation sequence', progress: 80, target: 'Complete', current: '4/5 sequences', dueDate: 'Dec 20' },
    { id: 3, title: 'Complete team training on new CRM', progress: 100, target: '100%', current: 'Done', dueDate: 'Dec 15' },
  ];

  const quarterlyCampaigns = [
    { id: 1, title: 'Increase pipeline value by 25%', progress: 72, owner: 'Sales Team', status: 'on-track' },
    { id: 2, title: 'Reduce delivery time to under 4 weeks', progress: 85, owner: 'Operations', status: 'ahead' },
    { id: 3, title: 'Launch new website redesign', progress: 45, owner: 'Marketing', status: 'at-risk' },
    { id: 4, title: 'Hire and onboard 2 new team members', progress: 100, owner: 'HR', status: 'complete' },
  ];

  const annualCampaigns = [
    { id: 1, title: 'Reach $3M in annual revenue', progress: 78, target: '$3,000,000', current: '$2,340,000' },
    { id: 2, title: 'Expand team to 30 employees', progress: 80, target: '30', current: '24' },
    { id: 3, title: 'Achieve 95% customer satisfaction', progress: 88, target: '95%', current: '94%' },
    { id: 4, title: 'Launch Zander V1.0', progress: 65, target: 'April 1', current: 'In Development' },
  ];

  const upcomingMeetings = [
    { id: 1, title: 'Weekly Assembly', date: 'Today', time: '9:00 AM', type: 'weekly', attendees: 5 },
    { id: 2, title: 'Sales Pipeline Review', date: 'Tomorrow', time: '2:00 PM', type: 'review', attendees: 3 },
    { id: 3, title: 'Q4 Planning Session', date: 'Dec 18', time: '10:00 AM', type: 'quarterly', attendees: 8 },
    { id: 4, title: '1:1 with David', date: 'Dec 19', time: '3:00 PM', type: '1on1', attendees: 2 },
  ];

  const pastMeetings = [
    { id: 1, title: 'Weekly Assembly', date: 'Dec 9', duration: '45 min', actionItems: 3, notes: true },
    { id: 2, title: 'Client Review - Anderson Project', date: 'Dec 8', duration: '30 min', actionItems: 2, notes: true },
    { id: 3, title: 'Weekly Assembly', date: 'Dec 2', duration: '50 min', actionItems: 5, notes: true },
  ];

  const meetingTemplates = [
    { id: 'weekly', name: 'Weekly Assembly', duration: '60 min', icon: '📅', description: 'Standard weekly team alignment' },
    { id: 'quarterly', name: 'Quarterly Briefing', duration: '2 hours', icon: '📊', description: 'Quarterly planning and review' },
    { id: 'annual', name: 'Annual Congress', duration: '4 hours', icon: '🏛️', description: 'Annual strategy and goal setting' },
    { id: '1on1', name: '1:1 Meeting', duration: '30 min', icon: '👥', description: 'Individual check-in template' },
  ];

  const foundingPrinciples = {
    vision: 'To empower every small business owner to reclaim their passion by providing AI-powered tools that handle the complexity of running a business.',
    mission: 'We build simple, robust software that gives small business owners the executive team they deserve - without the executive price tag.',
    values: [
      { id: 1, title: 'Simplicity Over Complexity', description: 'We choose the straightforward path. If it\'s complicated, we haven\'t found the right solution yet.' },
      { id: 2, title: 'Execution Beats Perfection', description: 'Done is better than perfect. We ship, learn, and iterate.' },
      { id: 3, title: 'Empowerment Through Ownership', description: 'Everyone owns their number. Clear accountability drives results.' },
      { id: 4, title: 'Relentless Resourcefulness', description: 'We find a way or make one. Obstacles are just problems waiting to be solved.' },
    ],
    story: 'In 1772, a devastating hurricane struck St. Croix at 64° West longitude. A young Alexander Hamilton wrote about the destruction with such clarity that his community funded his passage to the American colonies. That moment of crisis became the catalyst for a legacy that shaped a nation. At 64 West, we believe every business owner has their own hurricane moment - that overwhelming complexity that threatens to destroy their passion. We\'re here to help them not just survive, but transform that chaos into clarity.'
  };

  const legacyMilestones = [
    { id: 1, year: '2025', title: 'Foundation', goals: ['Launch Zander CRO Module', 'Reach 100 customers', 'Build core team to 10'], progress: 45 },
    { id: 2, year: '2026', title: 'Growth', goals: ['Launch all 7 AI Executives', 'Reach 500 customers', 'Expand to 25 employees'], progress: 0 },
    { id: 3, year: '2027', title: 'Scale', goals: ['Reach 2,000 customers', '$5M ARR', 'National recognition'], progress: 0 },
    { id: 4, year: '2028', title: 'Market Leader', goals: ['10,000+ customers', 'Industry standard for SMB AI', 'IPO readiness'], progress: 0 },
  ];

  const legacyVision = 'By 2028, Zander will be the default operating system for small businesses across America. Every entrepreneur will have access to the same strategic capabilities as Fortune 500 companies - AI-powered executives that work 24/7 to help them succeed. We\'re not just building software; we\'re democratizing business excellence.';

  const ledgerMetrics = {
    company: [
      { id: 1, name: 'Revenue (YTD)', value: '$2,340,000', target: '$3,000,000', progress: 78, trend: 'up' },
      { id: 2, name: 'Gross Margin', value: '42%', target: '45%', progress: 93, trend: 'flat' },
      { id: 3, name: 'Customer Count', value: '127', target: '150', progress: 85, trend: 'up' },
      { id: 4, name: 'Employee Count', value: '24', target: '30', progress: 80, trend: 'up' },
      { id: 5, name: 'NPS Score', value: '72', target: '75', progress: 96, trend: 'up' },
    ],
    team: [
      { id: 1, name: 'Sales', keystone: 'Pipeline Value', value: '$139,000', owner: 'Jonathan W.', status: 'green' },
      { id: 2, name: 'Finance', keystone: 'Cash on Hand', value: '$47,500', owner: 'CFO', status: 'yellow' },
      { id: 3, name: 'Operations', keystone: 'On-Time Delivery', value: '94%', owner: 'Operations Mgr', status: 'green' },
      { id: 4, name: 'Marketing', keystone: 'Leads/Month', value: '12', owner: 'Marketing Lead', status: 'green' },
      { id: 5, name: 'HR', keystone: 'Team Satisfaction', value: '4.2/5', owner: 'HR Lead', status: 'green' },
    ]
  };

  // ============ HELPER FUNCTIONS ============

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return '#28A745';
    if (trend === 'down') return '#DC3545';
    return 'var(--zander-gray)';
  };

  const getPriorityStyle = (priority: string) => {
    if (priority === 'high') return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', label: 'HIGH' };
    if (priority === 'medium') return { bg: 'rgba(240, 179, 35, 0.1)', color: '#B8860B', label: 'MEDIUM' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: 'LOW' };
  };

  const getStatusStyle = (status: string) => {
    if (status === 'complete') return { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745', label: 'COMPLETE' };
    if (status === 'ahead') return { bg: 'rgba(40, 167, 69, 0.1)', color: '#28A745', label: 'AHEAD' };
    if (status === 'on-track') return { bg: 'rgba(0, 123, 255, 0.1)', color: '#007BFF', label: 'ON TRACK' };
    if (status === 'at-risk') return { bg: 'rgba(220, 53, 69, 0.1)', color: '#DC3545', label: 'AT RISK' };
    return { bg: 'rgba(108, 117, 125, 0.1)', color: '#6C757D', label: status.toUpperCase() };
  };

  const getStatusDot = (status: string) => {
    if (status === 'green') return '#28A745';
    if (status === 'yellow') return '#F0B323';
    if (status === 'red') return '#DC3545';
    return '#6C757D';
  };

  // ============ MODAL CONTENT RENDERERS ============

  const renderAssemblyContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)', paddingBottom: '1rem' }}>
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
          { id: 'past', label: 'Past Meetings', count: pastMeetings.length },
          { id: 'templates', label: 'Templates', count: meetingTemplates.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'var(--zander-red)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--zander-gray)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--zander-off-white)',
              padding: '0.15rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Upcoming Meetings */}
      {activeTab === 'upcoming' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Upcoming Assemblies</h3>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Schedule New</button>
          </div>
          {upcomingMeetings.map((meeting) => (
            <div key={meeting.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--zander-border-gray)' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--zander-gray)', textTransform: 'uppercase' }}>{meeting.date === 'Today' ? 'Today' : meeting.date === 'Tomorrow' ? 'Tom' : meeting.date.split(' ')[0]}</span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{meeting.date === 'Today' || meeting.date === 'Tomorrow' ? '•' : meeting.date.split(' ')[1]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{meeting.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{meeting.time} • {meeting.attendees} attendees</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Join</button>
                <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Agenda</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Meetings */}
      {activeTab === 'past' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>Meeting History</h3>
          {pastMeetings.map((meeting) => (
            <div key={meeting.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--zander-border-gray)' }}>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{meeting.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{meeting.date} • {meeting.duration} • {meeting.actionItems} action items</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={{ padding: '0.5rem 1rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>View Notes</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>Meeting Templates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {meetingTemplates.map((template) => (
              <div key={template.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', border: '2px solid var(--zander-border-gray)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{template.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{template.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>{template.duration}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--zander-gray)', margin: '0 0 1rem 0' }}>{template.description}</p>
                <button style={{ width: '100%', padding: '0.5rem', background: 'var(--zander-navy)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>Use Template</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCampaignsContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)', paddingBottom: '1rem' }}>
        {[
          { id: 'my', label: 'My Campaign' },
          { id: 'quarterly', label: 'Quarterly' },
          { id: 'annual', label: 'Annual' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'var(--zander-red)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--zander-gray)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* My Campaign */}
      {activeTab === 'my' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>My Campaign</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--zander-gray)' }}>Your personal priorities for this quarter</p>
            </div>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Priority</button>
          </div>
          {myCampaignItems.map((item) => (
            <div key={item.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: `4px solid ${item.progress === 100 ? '#28A745' : 'var(--zander-red)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Target: {item.target} • Current: {item.current} • Due: {item.dueDate}</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : 'var(--zander-navy)' }}>{item.progress}%</span>
              </div>
              <div style={{ height: '10px', background: 'white', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : 'var(--zander-red)', borderRadius: '5px', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quarterly Campaigns */}
      {activeTab === 'quarterly' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Q4 2024 Campaigns</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--zander-gray)' }}>Team-wide quarterly priorities</p>
            </div>
          </div>
          {quarterlyCampaigns.map((item) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <div key={item.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Owner: {item.owner}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '10px', background: 'white', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress + '%', height: '100%', background: item.status === 'complete' || item.status === 'ahead' ? '#28A745' : item.status === 'at-risk' ? '#DC3545' : 'var(--zander-navy)', borderRadius: '5px' }} />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--zander-navy)', minWidth: '45px' }}>{item.progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Annual Campaigns */}
      {activeTab === 'annual' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>2024 Annual Campaign</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--zander-gray)' }}>Company-wide annual objectives</p>
            </div>
          </div>
          {annualCampaigns.map((item) => (
            <div key={item.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Target: {item.target} • Current: {item.current}</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{item.progress}%</span>
              </div>
              <div style={{ height: '10px', background: 'white', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: item.progress + '%', height: '100%', background: item.progress >= 75 ? '#28A745' : item.progress >= 50 ? '#F0B323' : '#DC3545', borderRadius: '5px' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHeadwindsContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)', paddingBottom: '1rem' }}>
        {[
          { id: 'active', label: 'Active Headwinds', count: activeHeadwinds.length },
          { id: 'victories', label: 'Victories', count: victories.length },
          { id: 'horizon', label: 'The Horizon', count: horizonItems.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'var(--zander-red)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--zander-gray)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--zander-off-white)',
              padding: '0.15rem 0.5rem',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Active Headwinds */}
      {activeTab === 'active' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Active Headwinds</h3>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add Headwind</button>
          </div>
          {activeHeadwinds.map((item) => {
            const priorityStyle = getPriorityStyle(item.priority);
            return (
              <div key={item.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: `4px solid ${priorityStyle.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.35rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Owner: {item.owner} • Category: {item.category} • {item.days} days old</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '12px', background: priorityStyle.bg, color: priorityStyle.color }}>{priorityStyle.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button style={{ padding: '0.4rem 0.75rem', background: '#28A745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>✓ Mark Resolved</button>
                  <button style={{ padding: '0.4rem 0.75rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Discuss in Assembly</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Victories */}
      {activeTab === 'victories' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>🏆 Victories - Resolved Headwinds</h3>
          {victories.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'rgba(40, 167, 69, 0.05)', borderRadius: '10px', marginBottom: '0.75rem', borderLeft: '4px solid #28A745' }}>
              <span style={{ color: '#28A745', fontSize: '1.25rem' }}>✓</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Resolved: {item.date} • By: {item.resolvedBy} • Took {item.daysToResolve} days</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* The Horizon */}
      {activeTab === 'horizon' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>The Horizon</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--zander-gray)' }}>Future considerations and parking lot items</p>
            </div>
            <button style={{ padding: '0.5rem 1rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>+ Add to Horizon</button>
          </div>
          {horizonItems.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem', opacity: 0.5 }}>🔮</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Added: {item.addedDate} • Category: {item.category}</div>
              </div>
              <button style={{ padding: '0.4rem 0.75rem', background: 'white', color: 'var(--zander-navy)', border: '1px solid var(--zander-border-gray)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>Promote to Headwind</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFoundingContent = () => (
    <div>
      {/* Vision */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Vision</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-off-white) 0%, #f8f6f3 100%)', borderRadius: '10px', borderLeft: '4px solid var(--zander-red)' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zander-navy)', lineHeight: '1.6', fontStyle: 'italic' }}>"{foundingPrinciples.vision}"</p>
        </div>
      </div>

      {/* Mission */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚀</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Mission</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-off-white) 0%, #f8f6f3 100%)', borderRadius: '10px', borderLeft: '4px solid var(--zander-navy)' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--zander-navy)', lineHeight: '1.6', fontStyle: 'italic' }}>"{foundingPrinciples.mission}"</p>
        </div>
      </div>

      {/* Core Values */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚖️</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Core Values</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {foundingPrinciples.values.map((value) => (
            <div key={value.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', borderTop: '3px solid var(--zander-gold)' }}>
              <div style={{ fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.5rem', fontSize: '1rem' }}>{value.title}</div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--zander-gray)', lineHeight: '1.5' }}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>📖</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>Our Story</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '10px', color: 'white' }}>
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.8' }}>{foundingPrinciples.story}</p>
        </div>
      </div>
    </div>
  );

  const renderLegacyContent = () => (
    <div>
      {/* Legacy Vision */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🌟</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>The Legacy We're Building</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '10px', color: 'white' }}>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.7' }}>{legacyVision}</p>
        </div>
      </div>

      {/* 3-5 Year Roadmap */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🗺️</span>
          <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>3-5 Year Roadmap</h3>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '24px', top: '40px', bottom: '40px', width: '2px', background: 'var(--zander-border-gray)' }} />
          
          {legacyMilestones.map((milestone, index) => (
            <div key={milestone.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
              {/* Year circle */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: milestone.progress > 0 ? 'var(--zander-red)' : 'var(--zander-border-gray)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.85rem',
                flexShrink: 0,
                zIndex: 1
              }}>
                {milestone.year}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, padding: '1rem 1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', borderLeft: `4px solid ${milestone.progress > 0 ? 'var(--zander-red)' : 'var(--zander-border-gray)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--zander-navy)', fontSize: '1.1rem' }}>{milestone.title}</div>
                  {milestone.progress > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--zander-red)' }}>{milestone.progress}% Complete</span>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {milestone.goals.map((goal, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>{goal}</li>
                  ))}
                </ul>
                {milestone.progress > 0 && (
                  <div style={{ marginTop: '0.75rem', height: '6px', background: 'white', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: milestone.progress + '%', height: '100%', background: 'var(--zander-red)', borderRadius: '3px' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLedgerContent = () => (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)', paddingBottom: '1rem' }}>
        {[
          { id: 'company', label: 'Company Ledger' },
          { id: 'team', label: 'Team Ledger' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === tab.id ? 'var(--zander-red)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--zander-gray)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Ledger */}
      {activeTab === 'company' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>Company Performance</h3>
          {ledgerMetrics.company.map((metric) => (
            <div key={metric.id} style={{ padding: '1.25rem', background: 'var(--zander-off-white)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>{metric.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>Target: {metric.target}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{metric.value}</div>
                  <div style={{ fontSize: '0.8rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>
                    {getTrendIcon(metric.trend)} {metric.progress}% of goal
                  </div>
                </div>
              </div>
              <div style={{ height: '8px', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: Math.min(metric.progress, 100) + '%', height: '100%', background: metric.progress >= 90 ? '#28A745' : metric.progress >= 70 ? '#F0B323' : '#DC3545', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Ledger */}
      {activeTab === 'team' && (
        <div>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--zander-navy)' }}>Team Keystones</h3>
          <div style={{ background: 'var(--zander-off-white)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '0.75rem 1rem', background: 'var(--zander-navy)', color: 'white', fontWeight: '600', fontSize: '0.8rem' }}>
              <div>Team</div>
              <div>Keystone</div>
              <div>Current</div>
              <div>Owner</div>
              <div style={{ textAlign: 'center' }}>Status</div>
            </div>
            {ledgerMetrics.team.map((team) => (
              <div key={team.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '1rem', borderBottom: '1px solid var(--zander-border-gray)', alignItems: 'center' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{team.name}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>{team.keystone}</div>
                <div style={{ fontWeight: '700', color: 'var(--zander-navy)' }}>{team.value}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>{team.owner}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusDot(team.status)
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Reset tab when modal changes
  const handleModalOpen = (modalId: string) => {
    setActiveModal(modalId);
    if (modalId === 'assembly') setActiveTab('upcoming');
    else if (modalId === 'campaigns') setActiveTab('my');
    else if (modalId === 'headwinds') setActiveTab('active');
    else if (modalId === 'ledger') setActiveTab('company');
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cro" />


        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Main Content */}
        <main style={{ marginLeft: sidebarCollapsed ? '64px' : '240px', marginTop: '64px', padding: '2rem', transition: 'margin-left 0.3s ease' }}>
          {/* Page Header */}
          <div style={{ background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>🏛️</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>Headquarters</h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Your command center for alignment, accountability, and action</p>
              </div>
            </div>
          </div>

          {/* Keystones Row */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Keystones
              <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--zander-gray)' }}>Your vital signs at a glance</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
              {keystoneMetrics.map((metric) => (
                <a key={metric.id} href={metric.module === 'CRO' ? '/' : '/' + metric.module.toLowerCase()} style={{ background: 'var(--zander-off-white)', borderRadius: '10px', padding: '1rem', textDecoration: 'none', borderLeft: '4px solid ' + metric.color, transition: 'all 0.2s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1rem' }}>{metric.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: metric.color }}>{metric.module}</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.15rem' }}>{metric.value}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--zander-gray)' }}>{metric.label}</span>
                    {metric.trendValue && <span style={{ fontSize: '0.7rem', color: getTrendColor(metric.trend), fontWeight: '600' }}>{getTrendIcon(metric.trend)} {metric.trendValue}</span>}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {quickNavButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleModalOpen(btn.id)}
                style={{
                  background: 'white',
                  border: '2px solid var(--zander-border-gray)',
                  borderRadius: '12px',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--zander-red)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--zander-border-gray)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{btn.icon}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--zander-navy)', display: 'block' }}>{btn.label}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--zander-gray)' }}>{btn.description}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Cards - 2x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Today's Assembly */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📅 Today's Assembly
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>@ {todayAssembly.time}</span>
              </div>
              <div style={{ background: 'var(--zander-off-white)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>{todayAssembly.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)', marginBottom: '0.75rem' }}>👥 {todayAssembly.attendees} attendees</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                  <strong>Agenda:</strong>
                  <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    {todayAssembly.agenda.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, padding: '0.75rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Join Meeting</button>
                <button onClick={() => handleModalOpen('assembly')} style={{ flex: 1, padding: '0.75rem', background: 'white', color: 'var(--zander-navy)', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>View Agenda</button>
              </div>
            </div>

            {/* Active Headwinds */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🌀 Active Headwinds
                  <span style={{ background: 'var(--zander-red)', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: '700' }}>{activeHeadwinds.length}</span>
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {activeHeadwinds.map((item) => {
                const priorityStyle = getPriorityStyle(item.priority);
                return (
                  <div key={item.id} style={{ padding: '0.75rem', background: 'var(--zander-off-white)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid ' + priorityStyle.color }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--zander-navy)', flex: 1 }}>{item.title}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: priorityStyle.bg, color: priorityStyle.color }}>{priorityStyle.label}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.35rem' }}>{item.days} days old</div>
                  </div>
                );
              })}
            </div>

            {/* My Campaign Progress */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎯 My Campaign Progress
                </h3>
                <button onClick={() => handleModalOpen('campaigns')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {myCampaignItems.map((item) => (
                <div key={item.id} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: item.progress === 100 ? '#28A745' : 'var(--zander-navy)' }}>{item.progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress + '%', height: '100%', background: item.progress === 100 ? '#28A745' : 'var(--zander-red)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Victories */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '2px solid var(--zander-border-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--zander-navy)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Recent Victories
                </h3>
                <button onClick={() => handleModalOpen('headwinds')} style={{ fontSize: '0.75rem', color: 'var(--zander-red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View All →</button>
              </div>
              {victories.slice(0, 3).map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(40, 167, 69, 0.05)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid #28A745' }}>
                  <span style={{ color: '#28A745', fontSize: '1rem' }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginTop: '0.25rem' }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Modal Overlay */}
        {activeModal && (
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
            zIndex: 2000
          }} onClick={() => setActiveModal(null)}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--zander-navy) 0%, #1a3a5c 100%)',
                padding: '1.5rem 2rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>
                    {activeModal === 'assembly' && '🏛️'}
                    {activeModal === 'campaigns' && '⚔️'}
                    {activeModal === 'headwinds' && '🌀'}
                    {activeModal === 'founding' && '📜'}
                    {activeModal === 'legacy' && '🏆'}
                    {activeModal === 'ledger' && '📒'}
                  </span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                      {activeModal === 'assembly' && 'Assembly'}
                      {activeModal === 'campaigns' && 'Campaigns'}
                      {activeModal === 'headwinds' && 'Headwinds'}
                      {activeModal === 'founding' && 'Founding Principles'}
                      {activeModal === 'legacy' && 'The Legacy'}
                      {activeModal === 'ledger' && 'The Ledger'}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
                      {activeModal === 'assembly' && 'Meetings, agendas, and team alignment'}
                      {activeModal === 'campaigns' && 'Goals, priorities, and progress tracking'}
                      {activeModal === 'headwinds' && 'Challenges, issues, and victories'}
                      {activeModal === 'founding' && 'Vision, mission, and core values'}
                      {activeModal === 'legacy' && 'Your 3-5 year vision and goals'}
                      {activeModal === 'ledger' && 'Metrics, scores, and performance'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '2rem', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                {activeModal === 'assembly' && renderAssemblyContent()}
                {activeModal === 'campaigns' && renderCampaignsContent()}
                {activeModal === 'headwinds' && renderHeadwindsContent()}
                {activeModal === 'founding' && renderFoundingContent()}
                {activeModal === 'legacy' && renderLegacyContent()}
                {activeModal === 'ledger' && renderLedgerContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
