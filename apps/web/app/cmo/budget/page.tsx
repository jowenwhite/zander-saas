'use client';
import { useState, useEffect } from 'react';
import CMOLayout from '../components/CMOLayout';

interface BudgetLineItem {
  id: string;
  category: string;
  planned: number;
  actual: number;
}

const BUDGET_CATEGORIES = [
  'Strategy and Plan',
  'Branding and Messaging',
  'Content Marketing',
  'Digital Marketing',
  'Social Media Marketing',
  'Advertising and Media Buying',
  'Lead Generation and Nurturing',
  'Sales Enablement',
  'Analytics and Reporting',
  'Event Marketing',
  'Public Relations',
  'Marketing Automation',
  'Partnerships and Affiliates',
  'Product Marketing',
  'Customer Experience and Retention',
];

const FISCAL_YEARS = ['FY2024', 'FY2025', 'FY2026', 'FY2027'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export default function CMOBudgetPage() {
  const [annualBudget, setAnnualBudget] = useState<number>(100000);
  const [fiscalYear, setFiscalYear] = useState<string>('FY2025');
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>(
    BUDGET_CATEGORIES.map((cat, idx) => ({
      id: `item-${idx}`,
      category: cat,
      planned: 0,
      actual: 0,
    }))
  );
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [businessGoals, setBusinessGoals] = useState<string>('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState<string>('100000');

  // Calculate totals
  const totalPlanned = lineItems.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = lineItems.reduce((sum, item) => sum + item.actual, 0);
  const remaining = annualBudget - totalPlanned;
  const percentSpent = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const updateLineItem = (id: string, field: 'planned' | 'actual', value: number) => {
    setLineItems(items =>
      items.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const getPercentOfTotal = (planned: number) => {
    return annualBudget > 0 ? ((planned / annualBudget) * 100).toFixed(1) : '0.0';
  };

  const getProgressPercent = (planned: number, actual: number) => {
    return planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  };

  const getProgressColor = (planned: number, actual: number) => {
    const percent = getProgressPercent(planned, actual);
    if (percent > 100) return '#dc3545';
    if (percent > 80) return '#ffc107';
    return '#28a745';
  };

  const handleAskDon = async () => {
    if (!businessGoals.trim()) return;

    setAiLoading(true);
    setAiSuggestion('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are Don, a marketing AI executive. Based on the following business goals, suggest how to allocate a ${formatCurrency(annualBudget)} annual marketing budget across these 15 categories. Provide percentage allocations that total 100%.

Business Goals:
${businessGoals}

Categories:
${BUDGET_CATEGORIES.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

Please provide:
1. A recommended percentage for each category
2. Brief reasoning for each allocation (1 sentence)
3. Key priorities to focus on given the goals

Format your response clearly with category names and percentages.`
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.content[0].text);
      } else {
        setAiSuggestion('Unable to get suggestions at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error calling Claude API:', error);
      setAiSuggestion('Unable to connect to AI service. Please check your connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    border: '2px solid var(--zander-border-gray)',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    width: '120px',
    textAlign: 'right',
  };

  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
              Marketing Budget
            </h1>
            <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              Plan and track your marketing spend across categories
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '2px solid var(--zander-border-gray)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'white',
                fontWeight: '600',
              }}
            >
              {FISCAL_YEARS.map(fy => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAiModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#F57C00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              🤖 Ask Don for Allocation Help
            </button>
          </div>
        </div>

        {/* Annual Budget Input */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>Annual Budget Target:</label>
            {editingBudget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', color: 'var(--zander-navy)' }}>$</span>
                <input
                  type="text"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ ...inputStyle, width: '150px', fontSize: '1.25rem', fontWeight: '700' }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    setAnnualBudget(parseInt(tempBudget) || 0);
                    setEditingBudget(false);
                  }}
                  style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTempBudget(annualBudget.toString());
                    setEditingBudget(false);
                  }}
                  style={{ padding: '0.5rem 1rem', background: 'var(--zander-light-gray)', color: 'var(--zander-gray)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempBudget(annualBudget.toString());
                  setEditingBudget(true);
                }}
                style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'var(--zander-light-gray)' }}
              >
                {formatCurrency(annualBudget)}
              </div>
            )}
            <span style={{ color: 'var(--zander-gray)', fontSize: '0.9rem' }}>Click to edit</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Total Budget</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{formatCurrency(annualBudget)}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Allocated</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F57C00' }}>{formatCurrency(totalPlanned)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{((totalPlanned / annualBudget) * 100).toFixed(1)}% of budget</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Remaining</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: remaining >= 0 ? '#28a745' : '#dc3545' }}>{formatCurrency(remaining)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{remaining >= 0 ? 'Unallocated' : 'Over budget'}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Spent vs Planned</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{percentSpent.toFixed(1)}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>{formatCurrency(totalActual)} spent</div>
          </div>
        </div>

        {/* Budget Table */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--zander-light-gray)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)', width: '30%' }}>Category</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)', width: '15%' }}>Planned</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)', width: '15%' }}>Actual</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--zander-navy)', width: '10%' }}>% of Total</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)', width: '30%' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--zander-border-gray)', background: index % 2 === 0 ? 'white' : 'var(--zander-off-white)' }}>
                  <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--zander-navy)' }}>{item.category}</td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input
                      type="number"
                      value={item.planned || ''}
                      onChange={(e) => updateLineItem(item.id, 'planned', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <input
                      type="number"
                      value={item.actual || ''}
                      onChange={(e) => updateLineItem(item.id, 'actual', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--zander-gray)' }}>
                    {getPercentOfTotal(item.planned)}%
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--zander-light-gray)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${getProgressPercent(item.planned, item.actual)}%`,
                            height: '100%',
                            background: getProgressColor(item.planned, item.actual),
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--zander-gray)', minWidth: '45px' }}>
                        {item.planned > 0 ? `${getProgressPercent(item.planned, item.actual).toFixed(0)}%` : '—'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--zander-navy)' }}>
                <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>TOTAL</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{formatCurrency(totalPlanned)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{formatCurrency(totalActual)}</td>
                <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: 'white' }}>{((totalPlanned / annualBudget) * 100).toFixed(1)}%</td>
                <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>{percentSpent.toFixed(1)}% spent</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <h2 style={{ margin: 0, color: 'var(--zander-navy)' }}>Ask Don for Budget Allocation</h2>
              </div>
              <button onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--zander-gray)' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                  What are your business and marketing goals for {fiscalYear}?
                </label>
                <textarea
                  value={businessGoals}
                  onChange={(e) => setBusinessGoals(e.target.value)}
                  placeholder="e.g., Increase brand awareness, generate 500 qualified leads, launch new product line, expand into new markets..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid var(--zander-border-gray)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--zander-light-gray)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--zander-gray)' }}>
                  <strong>Current Budget:</strong> {formatCurrency(annualBudget)} for {fiscalYear}
                </div>
              </div>
              <button
                onClick={handleAskDon}
                disabled={!businessGoals.trim() || aiLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  background: businessGoals.trim() && !aiLoading ? '#F57C00' : 'var(--zander-gray)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: businessGoals.trim() && !aiLoading ? 'pointer' : 'not-allowed',
                  marginBottom: '1.5rem',
                }}
              >
                {aiLoading ? 'Don is thinking...' : 'Get Allocation Suggestions'}
              </button>

              {aiSuggestion && (
                <div style={{ padding: '1.5rem', background: '#FFF3E0', borderRadius: '8px', border: '1px solid #F57C00' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🤖</span>
                    <strong style={{ color: 'var(--zander-navy)' }}>Don's Recommendation:</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--zander-navy)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {aiSuggestion}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}
