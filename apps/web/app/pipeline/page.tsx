'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import { logout } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
}

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
}

const STAGES = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];

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

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('cro');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [dealForm, setDealForm] = useState({
    dealName: '',
    dealValue: '',
    stage: 'PROSPECT',
    probability: '25',
    contactId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        fetch('https://api.zander.mcfapp.com/deals/pipeline', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
        fetch('https://api.zander.mcfapp.com/contacts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } })
      ]);
      
      if (dealsRes.ok) {
        const pipelineData = await dealsRes.json();
        const allDeals = [
          ...pipelineData.pipeline.PROSPECT,
          ...pipelineData.pipeline.QUALIFIED,
          ...pipelineData.pipeline.PROPOSAL,
          ...pipelineData.pipeline.NEGOTIATION,
          ...pipelineData.pipeline.CLOSED_WON,
          ...(pipelineData.pipeline.CLOSED_LOST || [])
        ];
        setDeals(allDeals);
      }
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDeal(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('https://api.zander.mcfapp.com/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
        body: JSON.stringify({
          dealName: dealForm.dealName,
          dealValue: parseFloat(dealForm.dealValue),
          stage: dealForm.stage,
          probability: parseInt(dealForm.probability),
          contactId: dealForm.contactId || null
        }),
      });
      if (response.ok) {
        setDealForm({ dealName: '', dealValue: '', stage: 'PROSPECT', probability: '25', contactId: '' });
        setShowNewDealModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  }

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      const response = await fetch(`https://api.zander.mcfapp.com/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent, deal: Deal) {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd() {
    setDraggedDeal(null);
    setDragOverStage(null);
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(e: React.DragEvent, newStage: string) {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== newStage) {
      updateDealStage(draggedDeal.id, newStage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  }

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    if (!searchTerm) return true;
    return deal.dealName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDealsByStage = (stage: string) => filteredDeals.filter(d => d.stage === stage);
  
  const getStageValue = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.dealValue, 0);
  };

  const totalPipelineValue = STAGES.reduce((sum, stage) => sum + getStageValue(stage), 0);

  if (loading) {
    return (

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--zander-off-white)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <div style={{ color: 'var(--zander-gray)' }}>Loading Pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>

    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      {/* Top Navigation */}
      <NavBar activeModule="cro" />

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
              { icon: '📊', label: 'Dashboard', href: '/', active: false },
              { icon: '📈', label: 'Pipeline', href: '/pipeline', active: true },
              { icon: '👥', label: 'Contacts', href: '/contacts', active: false },
              { icon: '📉', label: 'Analytics', href: '/analytics', active: false },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: item.active ? 'var(--zander-red)' : 'var(--zander-navy)',
                  background: item.active ? 'rgba(191, 10, 48, 0.1)' : 'transparent',
                  fontWeight: item.active ? '600' : '400'
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
              { icon: '📧', label: 'Email Automation', href: '/automation' },
              { icon: '📋', label: 'Forms', href: '/forms' },
              { icon: '🤖', label: 'AI Assistant', href: '/ai' },
            ].map((item) => (
              <li key={item.label} style={{ marginBottom: '0.25rem' }}>
                <a href={item.href || "#"} style={{
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
              Pipeline
            </h1>
            <div style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.25rem'
            }}>
              {formatCurrency(totalPipelineValue)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/pipeline/import" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '2px solid var(--zander-border-gray)', background: 'white', color: 'var(--zander-navy)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Import</a>
            <button
            onClick={() => setShowNewDealModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--zander-red)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            + New Deal
          </button>
        </div>
          </div>
        <div style={{
          background: 'white',
          border: '2px solid var(--zander-border-gray)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--zander-gray)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid var(--zander-border-gray)',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Stage Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {STAGES.map((stage) => (
            <div key={stage} style={{
              background: 'white',
              border: '2px solid var(--zander-border-gray)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                {formatCurrency(getStageValue(stage))}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.5rem' }}>
                {formatStage(stage)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                {getDealsByStage(stage).length} deals
              </div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '2rem',
          minHeight: '500px'
        }}>
          {STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage);
            const isOver = dragOverStage === stage;
            
            return (

              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                style={{
                  flex: '0 0 320px',
                  background: isOver ? 'rgba(191, 10, 48, 0.05)' : 'var(--zander-off-white)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isOver ? '2px dashed var(--zander-red)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: 'white',
                  borderRadius: '8px',
                  border: '2px solid var(--zander-border-gray)'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--zander-navy)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {formatStage(stage)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--zander-gray)' }}>
                      <span>{formatCurrency(getStageValue(stage))}</span>
                      <span>•</span>
                      <span>{stageDeals.length} deals</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.875rem'
                  }}>
                    {stageDeals.length}
                  </div>
                </div>

                {/* Deal Cards */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stageDeals.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'var(--zander-gray)',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>📭</div>
                      No deals in this stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        style={{
                          background: 'white',
                          border: '2px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                          opacity: draggedDeal?.id === deal.id ? 0.5 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                              {deal.dealName}
                            </div>
                            {deal.contact && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                                {deal.contact.firstName} {deal.contact.lastName}
                              </div>
                            )}
                          </div>
                          <div style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: deal.dealValue > 50000 ? 'rgba(191, 10, 48, 0.1)' : deal.dealValue > 25000 ? 'rgba(240, 179, 35, 0.2)' : 'rgba(108, 117, 125, 0.1)',
                            color: deal.dealValue > 50000 ? 'var(--zander-red)' : deal.dealValue > 25000 ? '#B8860B' : 'var(--zander-gray)'
                          }}>
                            {deal.dealValue > 50000 ? 'High' : deal.dealValue > 25000 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                        
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: 'var(--zander-red)',
                          marginBottom: '0.75rem'
                        }}>
                          {formatCurrency(deal.dealValue)}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--zander-off-white)',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}>📧</button>
                            <button style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--zander-off-white)',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}>📝</button>
                            <button onClick={() => window.location.href = `/deals/${deal.id}`} style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--zander-red)',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              color: 'white'
                            }}>👁</button>
                          </div>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: 'var(--zander-navy)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>JW</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Deal</h2>
            <form onSubmit={handleCreateDeal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Deal Name *</label>
                <input type="text" value={dealForm.dealName} onChange={(e) => setDealForm({...dealForm, dealName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Value *</label>
                  <input type="number" value={dealForm.dealValue} onChange={(e) => setDealForm({...dealForm, dealValue: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Probability %</label>
                  <input type="number" value={dealForm.probability} onChange={(e) => setDealForm({...dealForm, probability: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }} min="0" max="100" />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Stage</label>
                <select value={dealForm.stage} onChange={(e) => setDealForm({...dealForm, stage: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}>
                  {STAGES.map(stage => <option key={stage} value={stage}>{formatStage(stage)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>Contact (Optional)</label>
                <select value={dealForm.contactId} onChange={(e) => setDealForm({...dealForm, contactId: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', fontSize: '1rem' }}>
                  <option value="">Select a contact...</option>
                  {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNewDealModal(false)} style={{ padding: '0.75rem 1.5rem', border: '2px solid var(--zander-border-gray)', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--zander-red)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>

  );
}
