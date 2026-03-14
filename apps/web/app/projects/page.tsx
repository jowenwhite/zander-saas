'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import { logout } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';

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
  isArchived?: boolean;
  isLost?: boolean;
  lossReason?: string;
  archiveReason?: string;
  probability: number;
  expectedCloseDate?: string;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

const formatStage = (stage: string) => {
  const stageLabels: Record<string, string> = {
    'PROSPECT': 'Prospect',
    'QUALIFIED': 'Qualified',
    'PROPOSAL': 'Proposal',
    'NEGOTIATION': 'Negotiation',
    'CLOSED_WON': 'Closed Won',
    'CLOSED_LOST': 'Closed Lost',
    'LEAD': 'Lead'
  };
  return stageLabels[stage] || stage;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

export default function ProjectsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState('cro');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState<'active' | 'lost' | 'archived'>('active');
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [dealForm, setDealForm] = useState({
    dealName: '',
    dealValue: '',
    stage: 'LEAD',
    probability: '25',
    contactId: ''
  });

  useEffect(() => {
    fetchData();
  }, [viewFilter]);

  async function fetchData() {
    try {
      const [dealsRes, stagesRes, contactsRes] = await Promise.all([
        fetch(`https://api.zanderos.com/deals/pipeline?includeArchived=true&includeLost=true`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
        fetch('https://api.zanderos.com/pipeline-stages', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
        fetch('https://api.zanderos.com/contacts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } })
      ]);
      
      if (dealsRes.ok) {
        const pipelineData = await dealsRes.json();
        // Fetch and set stages
        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          const sortedStages = (stagesData || []).sort((a: PipelineStage, b: PipelineStage) => a.order - b.order);
          setStages(sortedStages);
        }
        const allDeals = Object.values(pipelineData.pipeline || {}).flat() as Deal[];
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
      const response = await fetch('https://api.zanderos.com/deals', {
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
        setDealForm({ dealName: '', dealValue: '', stage: 'LEAD', probability: '25', contactId: '' });
        setShowNewDealModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  }

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      const response = await fetch(`https://api.zanderos.com/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
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
    // Status filter
    if (viewFilter === 'active' && (deal.isArchived || deal.isLost)) return false;
    if (viewFilter === 'lost' && !deal.isLost) return false;
    if (viewFilter === 'archived' && !deal.isArchived) return false;
    // Search filter
    if (!searchTerm) return true;
    return deal.dealName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDealsByStage = (stageName: string) => {
    return filteredDeals.filter(d => d.stage === stageName);
  };
  
  const getStageValue = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.dealValue, 0);
  };

  const totalProjectsValue = stages.reduce((sum, stage) => sum + getStageValue(stage.name), 0);

  if (loading) {
    return (

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090F' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Image
              src="/images/zander-icon.svg"
              alt="Zander"
              width={48}
              height={48}
              priority
            />
          </div>
          <div style={{ color: '#8888A0' }}>Loading Projects...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>

    <div style={{ minHeight: '100vh', background: '#09090F' }}>
      {/* Top Navigation */}
      <NavBar activeModule="cro" />

      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', margin: 0 }}>
              Projects
            </h1>
            <div style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #00CCEE 0%, #00B0CC 100%)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.25rem'
            }}>
              {formatCurrency(totalProjectsValue)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/projects/import" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '2px solid #2A2A38', background: '#1C1C26', color: '#F0F0F5', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Import</a>
            <button
            onClick={() => setShowNewDealModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#00CCEE',
              color: '#000000',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            + New Project
          </button>
        </div>
          </div>
        <div style={{
          background: '#1C1C26',
          border: '2px solid #2A2A38',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8888A0' }}>🔍</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                background: '#13131A',
                color: '#F0F0F5'
              }}
            />
          </div>
          {/* View Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setViewFilter('active')}
              style={{
                padding: '0.5rem 1rem',
                background: viewFilter === 'active' ? '#00CCEE' : '#1C1C26',
                color: viewFilter === 'active' ? '#000000' : '#F0F0F5',
                border: '2px solid #00CCEE',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              Active
            </button>
            <button
              onClick={() => setViewFilter('lost')}
              style={{
                padding: '0.5rem 1rem',
                background: viewFilter === 'lost' ? '#BF0A30' : '#1C1C26',
                color: viewFilter === 'lost' ? 'white' : '#BF0A30',
                border: '2px solid #BF0A30',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              Lost
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              style={{
                padding: '0.5rem 1rem',
                background: viewFilter === 'archived' ? '#55556A' : '#1C1C26',
                color: viewFilter === 'archived' ? '#F0F0F5' : '#8888A0',
                border: '2px solid #55556A',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Stage Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {stages.map((stage) => (
            <div key={stage.name} style={{
              background: '#1C1C26',
              border: '2px solid #2A2A38',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                {formatCurrency(getStageValue(stage.name))}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>
                {stage.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                {getDealsByStage(stage.name).length} deals
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
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.name);
            const isOver = dragOverStage === stage.name;
            
            return (

              <div
                key={stage.name}
                onDragOver={(e) => handleDragOver(e, stage.name)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.name)}
                style={{
                  flex: '0 0 320px',
                  background: isOver ? 'rgba(0, 204, 238, 0.1)' : '#13131A',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isOver ? '2px dashed #00CCEE' : '2px solid #2A2A38',
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
                  background: '#1C1C26',
                  borderRadius: '8px',
                  border: '2px solid #2A2A38'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#F0F0F5', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {stage.name}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#8888A0' }}>
                      <span>{formatCurrency(getStageValue(stage.name))}</span>
                      <span>•</span>
                      <span>{stageDeals.length} deals</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    background: '#00CCEE',
                    color: '#000000',
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
                      color: '#8888A0',
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
                          background: '#1C1C26',
                          border: '2px solid #2A2A38',
                          borderRadius: '8px',
                          padding: '1rem',
                          cursor: 'grab',
                          transition: 'all 0.2s ease',
                          opacity: draggedDeal?.id === deal.id ? 0.5 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#F0F0F5', marginBottom: '0.25rem' }}>
                              {deal.dealName}
                            </div>
                            {deal.contact && (
                              <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                                {deal.contact.firstName} {deal.contact.lastName}
                              </div>
                            )}
                          </div>
                          <div style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: deal.dealValue > 50000 ? 'rgba(0, 204, 238, 0.2)' : deal.dealValue > 25000 ? 'rgba(240, 179, 35, 0.2)' : 'rgba(136, 136, 160, 0.2)',
                            color: deal.dealValue > 50000 ? '#00CCEE' : deal.dealValue > 25000 ? '#F0B323' : '#8888A0'
                          }}>
                            {deal.dealValue > 50000 ? 'High' : deal.dealValue > 25000 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                        
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#00CCEE',
                          marginBottom: '0.75rem'
                        }}>
                          {formatCurrency(deal.dealValue)}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                            <button onClick={() => deal.contact?.email && (window.location.href = '/communications?compose=true&to=' + encodeURIComponent(deal.contact.email) + '&subject=' + encodeURIComponent('Re: ' + deal.dealName))} title="Send Email" style={{
                              padding: '0.4rem 0.6rem',
                              background: '#2A2A38',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: deal.contact?.email ? 'pointer' : 'not-allowed',
                              fontSize: '1rem',
                              opacity: deal.contact?.email ? 1 : 0.5
                            }}>📧</button>
                            <button onClick={() => window.location.href = '/deals/' + deal.id + '?tab=notes'} title="View Notes" style={{
                              padding: '0.4rem 0.6rem',
                              background: '#F0B323',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '1rem'
                            }}>📝</button>
                            <button onClick={() => window.location.href = '/deals/' + deal.id} title="View Deal" style={{
                              padding: '0.4rem 0.6rem',
                              background: '#00CCEE',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '1rem',
                              color: '#000000'
                            }}>👁</button>
                          </div>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#2A2A38',
                            color: '#F0F0F5',
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

      {/* New Project Modal */}
      {showNewDealModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%', border: '2px solid #2A2A38' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#F0F0F5' }}>New Project</h2>
            <form onSubmit={handleCreateDeal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Deal Name *</label>
                <input type="text" value={dealForm.dealName} onChange={(e) => setDealForm({...dealForm, dealName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Value *</label>
                  <input type="number" value={dealForm.dealValue} onChange={(e) => setDealForm({...dealForm, dealValue: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Probability %</label>
                  <input type="number" value={dealForm.probability} onChange={(e) => setDealForm({...dealForm, probability: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }} min="0" max="100" />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Stage</label>
                <select value={dealForm.stage} onChange={(e) => setDealForm({...dealForm, stage: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }}>
                  {stages.map(stage => <option key={stage.name} value={stage.name}>{stage.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Contact (Optional)</label>
                <select value={dealForm.contactId} onChange={(e) => setDealForm({...dealForm, contactId: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem', background: '#13131A', color: '#F0F0F5' }}>
                  <option value="">Select a contact...</option>
                  {contacts.map(contact => <option key={contact.id} value={contact.id}>{contact.firstName} {contact.lastName}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNewDealModal(false)} style={{ padding: '0.75rem 1.5rem', border: '2px solid #2A2A38', borderRadius: '8px', background: '#13131A', color: '#F0F0F5', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#00CCEE', color: '#000000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>

  );
}
