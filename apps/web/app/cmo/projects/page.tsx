'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CMOLayout from '../components/CMOLayout';

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  contact?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const stageLabels: Record<string, string> = {
  'PROSPECT': 'Prospect',
  'QUALIFIED': 'Qualified',
  'PROPOSAL': 'Proposal',
  'NEGOTIATION': 'Negotiation',
  'CLOSED_WON': 'Closed Won',
  'CLOSED_LOST': 'Closed Lost',
  'LEAD': 'Lead'
};

const stageColors: Record<string, string> = {
  'PROSPECT': '#6c757d',
  'LEAD': '#6c757d',
  'QUALIFIED': '#17a2b8',
  'PROPOSAL': '#ffc107',
  'NEGOTIATION': '#fd7e14',
  'CLOSED_WON': '#28a745',
  'CLOSED_LOST': '#dc3545',
};

export default function CMOProjectsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const res = await fetch('https://api.zanderos.com/deals/pipeline', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const allDeals = Object.values(data.pipeline || {}).flat() as Deal[];
        setDeals(allDeals);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.dealName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.contact && `${deal.contact.firstName} ${deal.contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)',
    borderRadius: '8px', fontSize: '1rem', outline: 'none'
  };

  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
              Marketing Projects
            </h1>
            <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              View deals and projects for marketing coordination
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, maxWidth: '300px' }}
          />
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} style={{ ...inputStyle, width: 'auto', background: 'white' }}>
            <option value="all">All Stages</option>
            {Object.entries(stageLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Total Projects</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{deals.length}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Pipeline Value</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
              {formatCurrency(deals.filter(d => d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + d.dealValue, 0))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Won This Month</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>
              {formatCurrency(deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, d) => sum + d.dealValue, 0))}
            </div>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>Loading projects...</div>
        ) : filteredDeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>No projects found</h3>
            <p style={{ color: 'var(--zander-gray)' }}>Projects will appear here when deals are created</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--zander-light-gray)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Project</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Contact</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Value</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--zander-navy)' }}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map(deal => (
                  <tr
                    key={deal.id}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                    style={{ borderBottom: '1px solid var(--zander-border-gray)', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{deal.dealName}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--zander-gray)' }}>
                      {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : '—'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                      {formatCurrency(deal.dealValue)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                        background: `${stageColors[deal.stage] || '#6c757d'}20`,
                        color: stageColors[deal.stage] || '#6c757d'
                      }}>
                        {stageLabels[deal.stage] || deal.stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CMOLayout>
  );
}
