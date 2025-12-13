'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import AuthGuard from '../components/AuthGuard';
import { logout } from '../utils/auth';

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

const formatStage = (stage: string) => {
  const stageLabels: Record<string, string> = {
    'PROSPECT': 'Prospect',
    'QUALIFIED': 'Qualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'CLOSED_WON': 'Closed Won',
    'CLOSED_LOST': 'Closed Lost'
  };
  return stageLabels[stage] || stage;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('cro');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('http://localhost:3001/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate metrics
  const activeDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON');
  const lostDeals = deals.filter(d => d.stage === 'CLOSED_LOST');
  
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const wonValue = wonDeals.reduce((sum, d) => sum + d.dealValue, 0);
  const lostValue = lostDeals.reduce((sum, d) => sum + d.dealValue, 0);
  
  const winRate = wonDeals.length + lostDeals.length > 0 
    ? (wonDeals.length / (wonDeals.length + lostDeals.length) * 100).toFixed(1)
    : '0';
  
  const avgDealSize = activeDeals.length > 0 
    ? totalPipelineValue / activeDeals.length 
    : 0;

  const weightedPipeline = activeDeals.reduce((sum, d) => sum + (d.dealValue * d.probability / 100), 0);

  // Stage distribution for funnel
  const stageData = STAGES.filter(s => s !== 'CLOSED_LOST').map(stage => ({
    stage: formatStage(stage),
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.dealValue, 0)
  }));

  // Get max value for bar scaling
  const maxStageValue = Math.max(...stageData.map(s => s.value), 1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--zander-off-white)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <div style={{ color: 'var(--zander-gray)' }}>Loading Analytics...</div>
        </div>
      </div>
    );
  }

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

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: '64px',
        bottom: 0,
        width: '240px',
        background: 'white',
        borderRight: '2px solid var(--zander-border-gray)',
        padding: '1.5rem 0',
        overflow: 'hidden',
        zIndex: 900
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Sales & Revenue
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📊', label: 'Dashboard', href: '/', id: 'dashboard' },
              { icon: '📈', label: 'Pipeline', href: '/pipeline', id: 'pipeline' },
              { icon: '👥', label: 'Contacts', href: '/contacts', id: 'contacts' },
              { icon: '📉', label: 'Analytics', href: '/analytics', id: 'analytics' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: item.id === 'analytics' ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: item.id === 'analytics' ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: item.id === 'analytics' ? '600' : '400'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '0 1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--zander-gray)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Tools
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { icon: '📧', label: 'Email Automation' },
              { icon: '📄', label: 'Proposals' },
              { icon: '🤖', label: 'AI Assistant' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href="#" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'var(--zander-navy)'
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0, marginBottom: '0.5rem' }}>
              Analytics
            </h1>
            <p style={{ color: 'var(--zander-gray)', margin: 0 }}>
              Track your sales performance and pipeline health
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '2px solid var(--zander-border-gray)',
                  background: timeRange === days ? 'var(--zander-red)' : 'white',
                  color: timeRange === days ? 'white' : 'var(--zander-gray)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>💰</div>
              <span style={{ color: '#27AE60', fontSize: '0.875rem', fontWeight: '600' }}>↑ 12%</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {formatCurrency(totalPipelineValue)}
            </div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Total Pipeline</div>
          </div>

          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>🎯</div>
              <span style={{ color: '#27AE60', fontSize: '0.875rem', fontWeight: '600' }}>↑ 5%</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {formatCurrency(weightedPipeline)}
            </div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Weighted Pipeline</div>
          </div>

          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>📊</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {winRate}%
            </div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Win Rate</div>
          </div>

          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>📈</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
              {formatCurrency(avgDealSize)}
            </div>
            <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Avg Deal Size</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Pipeline Funnel */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Pipeline Funnel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stageData.map((stage, index) => (
                <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '100px', fontSize: '0.875rem', color: 'var(--zander-navy)', fontWeight: '500' }}>
                    {stage.stage}
                  </div>
                  <div style={{ flex: 1, height: '32px', background: 'var(--zander-off-white)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(stage.value / maxStageValue) * 100}%`,
                      height: '100%',
                      background: stage.stage === 'Closed Won' 
                        ? 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)'
                        : `linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)`,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.75rem',
                      minWidth: stage.value > 0 ? '60px' : '0'
                    }}>
                      {stage.value > 0 && (
                        <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>
                          {formatCurrency(stage.value)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ width: '50px', textAlign: 'right', fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
                    {stage.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Win/Loss Summary */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Win/Loss Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Won</span>
                  <span style={{ color: '#27AE60', fontWeight: '600' }}>{wonDeals.length} deals</span>
                </div>
                <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: wonDeals.length + lostDeals.length > 0 ? `${(wonDeals.length / (wonDeals.length + lostDeals.length)) * 100}%` : '0%',
                    height: '100%',
                    background: '#27AE60',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#27AE60' }}>
                  {formatCurrency(wonValue)}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>Lost</span>
                  <span style={{ color: 'var(--zander-red)', fontWeight: '600' }}>{lostDeals.length} deals</span>
                </div>
                <div style={{ height: '8px', background: 'var(--zander-off-white)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: wonDeals.length + lostDeals.length > 0 ? `${(lostDeals.length / (wonDeals.length + lostDeals.length)) * 100}%` : '0%',
                    height: '100%',
                    background: 'var(--zander-red)',
                    borderRadius: '4px'
                  }}></div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-red)' }}>
                  {formatCurrency(lostValue)}
                </div>
              </div>

              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'var(--zander-off-white)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
                  Conversion Rate
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                  {winRate}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Breakdown Table */}
        <div style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--zander-border-gray)' }}>
            <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.25rem' }}>Stage Breakdown</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--zander-off-white)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Stage</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Deals</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Value</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>Avg Deal</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>% of Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {stageData.map((stage) => (
                <tr key={stage.stage} style={{ borderBottom: '1px solid var(--zander-border-gray)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: stage.stage === 'Closed Won' ? '#27AE60' : 'var(--zander-red)'
                      }}></div>
                      <span style={{ fontWeight: '500', color: 'var(--zander-navy)' }}>{stage.stage}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>{stage.count}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--zander-navy)' }}>{formatCurrency(stage.value)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>
                    {stage.count > 0 ? formatCurrency(stage.value / stage.count) : '$0'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--zander-gray)' }}>
                    {totalPipelineValue > 0 ? ((stage.value / totalPipelineValue) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--zander-navy)' }}>
                <td style={{ padding: '1rem', fontWeight: '700', color: 'white' }}>Total</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{deals.length}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>{formatCurrency(totalPipelineValue + wonValue)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>
                  {deals.length > 0 ? formatCurrency((totalPipelineValue + wonValue) / deals.length) : '$0'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: 'white' }}>100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
