'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CMOLayout from '../components/CMOLayout';

interface SwotItem {
  id: string;
  text: string;
}

interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

interface MarketingPlan {
  status: 'draft' | 'active' | 'complete';
  mission: string;
  vision: string;
  goals: string[];
  swot: SwotData;
  monthlyThemes: string[];
  kpis: { name: string; target: string }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CMOPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<MarketingPlan>({
    status: 'draft',
    mission: '',
    vision: '',
    goals: ['', '', ''],
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    monthlyThemes: Array(12).fill(''),
    kpis: [
      { name: 'Website Traffic', target: '' },
      { name: 'Lead Generation', target: '' },
      { name: 'Conversion Rate', target: '' },
      { name: 'Customer Acquisition Cost', target: '' },
      { name: 'Marketing ROI', target: '' },
    ],
  });
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSwotItem, setNewSwotItem] = useState<{ [key: string]: string }>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  });

  const updatePlanField = (field: string, value: any) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const addSwotItem = (quadrant: keyof SwotData) => {
    if (!newSwotItem[quadrant].trim()) return;
    setPlan(prev => ({
      ...prev,
      swot: {
        ...prev.swot,
        [quadrant]: [...prev.swot[quadrant], { id: `${quadrant}-${Date.now()}`, text: newSwotItem[quadrant] }],
      },
    }));
    setNewSwotItem(prev => ({ ...prev, [quadrant]: '' }));
  };

  const removeSwotItem = (quadrant: keyof SwotData, id: string) => {
    setPlan(prev => ({
      ...prev,
      swot: {
        ...prev.swot,
        [quadrant]: prev.swot[quadrant].filter(item => item.id !== id),
      },
    }));
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...plan.goals];
    newGoals[index] = value;
    updatePlanField('goals', newGoals);
  };

  const updateMonthlyTheme = (index: number, value: string) => {
    const newThemes = [...plan.monthlyThemes];
    newThemes[index] = value;
    updatePlanField('monthlyThemes', newThemes);
  };

  const updateKpi = (index: number, field: 'name' | 'target', value: string) => {
    const newKpis = [...plan.kpis];
    newKpis[index] = { ...newKpis[index], [field]: value };
    updatePlanField('kpis', newKpis);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#ffc107';
      case 'active': return '#28a745';
      case 'complete': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getSwotColor = (quadrant: string) => {
    switch (quadrant) {
      case 'strengths': return { bg: '#d4edda', border: '#28a745', text: '#155724' };
      case 'weaknesses': return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' };
      case 'opportunities': return { bg: '#cce5ff', border: '#007bff', text: '#004085' };
      case 'threats': return { bg: '#fff3cd', border: '#ffc107', text: '#856404' };
      default: return { bg: '#f8f9fa', border: '#6c757d', text: '#495057' };
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid var(--zander-border-gray)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
              Marketing Plan
            </h1>
            <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              Your strategic marketing roadmap
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select
              value={plan.status}
              onChange={(e) => updatePlanField('status', e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: `2px solid ${getStatusColor(plan.status)}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white',
                fontWeight: '600',
                color: getStatusColor(plan.status),
              }}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: '#F57C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Save Plan
            </button>
          </div>
        </div>

        {/* Plan Overview */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 1rem', color: 'var(--zander-navy)', fontSize: '1.25rem', fontWeight: '600' }}>
            Plan Overview
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--zander-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Status</div>
              <div style={{ fontWeight: '700', color: getStatusColor(plan.status), textTransform: 'capitalize' }}>{plan.status}</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--zander-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Sections Complete</div>
              <div style={{ fontWeight: '700', color: 'var(--zander-navy)' }}>
                {[plan.mission, plan.vision, plan.goals.filter(g => g).length > 0, plan.swot.strengths.length > 0].filter(Boolean).length}/4
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--zander-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>Monthly Themes Set</div>
              <div style={{ fontWeight: '700', color: 'var(--zander-navy)' }}>
                {plan.monthlyThemes.filter(t => t).length}/12
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Section */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 1.5rem', color: 'var(--zander-navy)', fontSize: '1.25rem', fontWeight: '600' }}>
            Strategy
          </h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
              Marketing Mission
            </label>
            <textarea
              value={plan.mission}
              onChange={(e) => updatePlanField('mission', e.target.value)}
              placeholder="What is your marketing team's mission? (e.g., To drive sustainable growth by creating meaningful connections with our target audience...)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
              Marketing Vision
            </label>
            <textarea
              value={plan.vision}
              onChange={(e) => updatePlanField('vision', e.target.value)}
              placeholder="Where do you want your marketing to be in 3-5 years? (e.g., To be recognized as the leading voice in our industry...)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
              Marketing Goals (Top 3)
            </label>
            {plan.goals.map((goal, index) => (
              <input
                key={index}
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`Goal ${index + 1} (e.g., Increase brand awareness by 50%)`}
                style={{ ...inputStyle, marginBottom: '0.75rem' }}
              />
            ))}
          </div>
        </div>

        {/* SWOT Analysis */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 1.5rem', color: 'var(--zander-navy)', fontSize: '1.25rem', fontWeight: '600' }}>
            SWOT Analysis
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((quadrant) => {
              const colors = getSwotColor(quadrant);
              return (
                <div
                  key={quadrant}
                  style={{
                    background: colors.bg,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    minHeight: '200px',
                  }}
                >
                  <h3 style={{ margin: '0 0 1rem', color: colors.text, textTransform: 'capitalize', fontSize: '1rem' }}>
                    {quadrant === 'strengths' && '💪 '}
                    {quadrant === 'weaknesses' && '⚠️ '}
                    {quadrant === 'opportunities' && '🚀 '}
                    {quadrant === 'threats' && '🔥 '}
                    {quadrant}
                  </h3>
                  <div style={{ marginBottom: '0.75rem' }}>
                    {plan.swot[quadrant].map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'white',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ color: colors.text }}>{item.text}</span>
                        <button
                          onClick={() => removeSwotItem(quadrant, item.id)}
                          style={{ background: 'none', border: 'none', color: colors.border, cursor: 'pointer', fontSize: '1.1rem' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newSwotItem[quadrant]}
                      onChange={(e) => setNewSwotItem(prev => ({ ...prev, [quadrant]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addSwotItem(quadrant)}
                      placeholder={`Add ${quadrant.slice(0, -1)}...`}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => addSwotItem(quadrant)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: colors.border,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            onClick={() => router.push('/cmo/personas')}
            style={{
              ...sectionStyle,
              marginBottom: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: '2rem' }}>👥</div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1rem' }}>Target Personas</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>View customer personas</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#F57C00' }}>→</span>
          </div>
          <div
            onClick={() => router.push('/cmo/budget')}
            style={{
              ...sectionStyle,
              marginBottom: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: '2rem' }}>💰</div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1rem' }}>Budget</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>Manage marketing budget</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#F57C00' }}>→</span>
          </div>
          <div
            onClick={() => router.push('/cmo/analytics')}
            style={{
              ...sectionStyle,
              marginBottom: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{ fontSize: '2rem' }}>📊</div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1rem' }}>KPIs & Analytics</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--zander-gray)', fontSize: '0.85rem' }}>Track performance</p>
            </div>
            <span style={{ marginLeft: 'auto', color: '#F57C00' }}>→</span>
          </div>
        </div>

        {/* Annual Calendar Overview */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.25rem', fontWeight: '600' }}>
              Annual Calendar Overview
            </h2>
            <button
              onClick={() => router.push('/cmo/calendar')}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--zander-light-gray)',
                color: '#F57C00',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Open Calendar →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {MONTHS.map((month, index) => (
              <div key={month} style={{ background: 'var(--zander-light-gray)', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  {month}
                </div>
                <input
                  type="text"
                  value={plan.monthlyThemes[index]}
                  onChange={(e) => updateMonthlyTheme(index, e.target.value)}
                  placeholder="Theme..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* KPIs Section */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.25rem', fontWeight: '600' }}>
              Key Performance Indicators
            </h2>
            <button
              onClick={() => router.push('/cmo/analytics')}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--zander-light-gray)',
                color: '#F57C00',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              View Analytics →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {plan.kpis.map((kpi, index) => (
              <div key={index} style={{ background: 'var(--zander-light-gray)', borderRadius: '8px', padding: '1rem' }}>
                <input
                  type="text"
                  value={kpi.name}
                  onChange={(e) => updateKpi(index, 'name', e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontWeight: '600',
                    color: 'var(--zander-navy)',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  value={kpi.target}
                  onChange={(e) => updateKpi(index, 'target', e.target.value)}
                  placeholder="Target..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid var(--zander-border-gray)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'white',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CMOLayout>
  );
}
