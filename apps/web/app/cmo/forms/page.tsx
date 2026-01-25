'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CMOLayout from '../components/CMOLayout';

interface Form {
  id: string;
  name: string;
  description: string;
  fields: any[];
  settings: any;
  status: 'active' | 'draft';
  category?: string;
  formType?: 'form' | 'sop';
  createdAt: string;
  updatedAt: string;
  _count: { submissions: number };
}

export default function CMOFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      const res = await fetch('https://api.zanderos.com/forms', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setForms(data || []);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesStatus;
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
              Marketing Forms
            </h1>
            <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              Lead capture forms and marketing surveys
            </p>
          </div>
          <button
            onClick={() => router.push('/forms')}
            style={{
              padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Manage Forms
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, maxWidth: '300px' }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', background: 'white' }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Total Forms</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)' }}>{forms.length}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Active Forms</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>{forms.filter(f => f.status === 'active').length}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>Total Submissions</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F57C00' }}>{forms.reduce((sum, f) => sum + (f._count?.submissions || 0), 0)}</div>
          </div>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>Loading forms...</div>
        ) : filteredForms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>No forms yet</h3>
            <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem' }}>Create forms to capture leads and gather feedback</p>
            <button onClick={() => router.push('/forms')} style={{ padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Create Form
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
            {filteredForms.map(form => (
              <div
                key={form.id}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem', fontWeight: '600' }}>{form.name}</h3>
                    {form.description && (
                      <p style={{ margin: '0.5rem 0 0', color: 'var(--zander-gray)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {form.description.substring(0, 100)}{form.description.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                    background: form.status === 'active' ? '#28a74520' : '#ffc10720',
                    color: form.status === 'active' ? '#28a745' : '#ffc107'
                  }}>
                    {form.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Fields</div>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{form.fields?.length || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>Submissions</div>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{form._count?.submissions || 0}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forms/${form.id}/submit`)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--zander-light-gray)', color: 'var(--zander-navy)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CMOLayout>
  );
}
