'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../components/ThemeToggle';
import NavBar from '../components/NavBar';
import { logout } from '../utils/auth';
import AuthGuard from '../components/AuthGuard';
import Sidebar from '../components/Sidebar';
import { Users, Building2, Mail, Phone, Landmark, Smartphone } from 'lucide-react';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  createdAt: string;
}

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  personId: string | null;
}

export default function PeoplePage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('cro');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewPersonModal, setShowNewPersonModal] = useState(false);

  const [personForm, setPersonForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [peopleRes, dealsRes] = await Promise.all([
        fetch('https://api.zanderos.com/people', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } }),
        fetch('https://api.zanderos.com/deals/pipeline', { headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` } })
      ]);
      
      if (peopleRes.ok) {
        const peopleData = await peopleRes.json();
        setPeople(peopleData.data || []);
      }
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        const allDeals = [...(dealsData.pipeline.PROSPECT || []), ...(dealsData.pipeline.QUALIFIED || []), ...(dealsData.pipeline.PROPOSAL || []), ...(dealsData.pipeline.NEGOTIATION || []), ...(dealsData.pipeline.CLOSED_WON || []), ...(dealsData.pipeline.CLOSED_LOST || [])]; setDeals(allDeals);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePerson(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('https://api.zanderos.com/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` },
        body: JSON.stringify(personForm),
      });
      if (response.ok) {
        setPersonForm({ firstName: '', lastName: '', email: '', phone: '', company: '', title: '' });
        setShowNewPersonModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating person:', error);
    }
  }

  // Helper functions
  const getPersonDeals = (personId: string) => deals.filter(d => d.personId === personId);
  const hasActiveDeals = (personId: string) => {
    return deals.some(d => d.personId === personId && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
  };
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Filter people
  const filteredPeople = people.filter(person => {
    const matchesSearch = !searchTerm || 
      `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && hasActiveDeals(person.id);
    if (filterStatus === 'inactive') return matchesSearch && !hasActiveDeals(person.id);
    return matchesSearch;
  });

  // Stats
  const totalPeople = people.length;
  const activePeople = people.filter(c => hasActiveDeals(c.id)).length;
  const uniqueCompanies = new Set(people.map(c => c.company).filter(Boolean)).size;

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
          <div style={{ color: '#8888A0' }}>Loading People...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>

    <div style={{ minHeight: '100vh', background: '#09090F' }}>
      <NavBar activeModule="cro" />

      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main style={{ marginLeft: '240px', marginTop: '64px', padding: '2rem' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', margin: 0, marginBottom: '0.5rem' }}>
              People
            </h1>
            <p style={{ color: '#8888A0', margin: 0 }}>
              Manage your people and relationships
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="/people/import" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '2px solid #2A2A38', background: '#1C1C26', color: '#F0F0F5', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Import</a>
            <button
            onClick={() => setShowNewPersonModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: '#00CCEE',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            + New Person
          </button>
        </div>
          </div>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white'
            }}><Users size={24} /></div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem' }}>
              {totalPeople}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>Total People</div>
          </div>

          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              color: 'white'
            }}>✓</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem' }}>
              {activePeople}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>With Active Deals</div>
          </div>

          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'white'
            }}><Building2 size={24} /></div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem' }}>
              {uniqueCompanies}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>Companies</div>
          </div>

          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem',
              color: 'white'
            }}>🆕</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem' }}>
              {people.filter(c => {
                const created = new Date(c.createdAt);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return created > monthAgo;
              }).length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>New This Month</div>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{
          background: '#1C1C26',
          border: '2px solid #2A2A38',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8888A0' }}>🔍</span>
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'active', 'inactive'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: '2px solid #2A2A38',
                  background: filterStatus === filter ? '#00CCEE' : 'white',
                  color: filterStatus === filter ? 'white' : '#8888A0',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#09090F', borderRadius: '8px', padding: '0.25rem' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'grid' ? '#00CCEE' : 'transparent',
                color: viewMode === 'grid' ? 'white' : '#8888A0',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'list' ? '#00CCEE' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#8888A0',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ☰ List
            </button>
          </div>
        </div>

        {/* People Grid/List */}
        {filteredPeople.length === 0 ? (
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            padding: '4rem',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '1rem', opacity: 0.5, color: '#00CCEE' }}><Users size={48} /></div>
            <h3 style={{ color: '#F0F0F5', marginBottom: '0.5rem' }}>No people found</h3>
            <p style={{ color: '#8888A0' }}>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredPeople.map((person) => {
              const personDeals = getPersonDeals(person.id);
              const isActive = hasActiveDeals(person.id);
              
              return (

                <div
                  key={person.id}
                  onClick={() => router.push("/people/" + person.id)}
                  style={{
                    background: '#1C1C26',
                    border: '2px solid #2A2A38',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '1.25rem'
                    }}>
                      {getInitials(person.firstName, person.lastName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#F0F0F5', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                        {person.firstName} {person.lastName}
                      </div>
                      {person.title && (
                        <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.25rem' }}>
                          {person.title}
                        </div>
                      )}
                      {person.company && (
                        <div style={{ fontSize: '0.875rem', color: '#F0F0F5', fontWeight: '500' }}>
                          {person.company}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#8888A0' }}>
                      <Mail size={14} />
                      <span>{person.email}</span>
                    </div>
                    {person.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#8888A0' }}>
                        <Smartphone size={14} />
                        <span>{person.phone}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isActive && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: 'rgba(39, 174, 96, 0.1)',
                          color: '#27AE60',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>Active Deal</span>
                      )}
                      {personDeals.length > 0 && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: 'rgba(191, 10, 48, 0.1)',
                          color: '#00CCEE',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>{personDeals.length} deal{personDeals.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{
                        padding: '0.5rem',
                        background: '#09090F',
                        border: '1px solid #2A2A38',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}><Mail size={14} /></button>
                      <button style={{
                        padding: '0.5rem',
                        background: '#09090F',
                        border: '1px solid #2A2A38',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}><Phone size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div style={{
            background: '#1C1C26',
            border: '2px solid #2A2A38',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#09090F', borderBottom: '2px solid #2A2A38' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Title</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Company</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#F0F0F5' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#F0F0F5' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map((person) => {
                  const isActive = hasActiveDeals(person.id);
                  return (

                    <tr key={person.id} onClick={() => router.push("/people/" + person.id)} style={{ borderBottom: '1px solid #2A2A38', cursor: 'pointer' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="/headquarters" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#13131A', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}><Landmark size={14} /> HQ</a>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00CCEE 0%, #0099BB 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }}>
                            {getInitials(person.firstName, person.lastName)}
                          </div>
                          <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                            {person.firstName} {person.lastName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#8888A0' }}>{person.title || '—'}</td>
                      <td style={{ padding: '1rem', color: '#8888A0' }}>{person.company || '—'}</td>
                      <td style={{ padding: '1rem', color: '#8888A0' }}>{person.email}</td>
                      <td style={{ padding: '1rem', color: '#8888A0' }}>{person.phone || '—'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          background: isActive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                          color: isActive ? '#27AE60' : '#8888A0',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button style={{
                          padding: '0.5rem 1rem',
                          background: 'transparent',
                          border: '1px solid #2A2A38',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#F0F0F5'
                        }}>👁</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* New Person Modal */}
      {showNewPersonModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#F0F0F5' }}>New Person</h2>
            <form onSubmit={handleCreatePerson}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>First Name *</label>
                  <input type="text" value={personForm.firstName} onChange={(e) => setPersonForm({...personForm, firstName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Last Name *</label>
                  <input type="text" value={personForm.lastName} onChange={(e) => setPersonForm({...personForm, lastName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} required />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Email *</label>
                <input type="email" value={personForm.email} onChange={(e) => setPersonForm({...personForm, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Phone</label>
                <input type="tel" value={personForm.phone} onChange={(e) => setPersonForm({...personForm, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Company</label>
                  <input type="text" value={personForm.company} onChange={(e) => setPersonForm({...personForm, company: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#F0F0F5' }}>Title</label>
                  <input type="text" value={personForm.title} onChange={(e) => setPersonForm({...personForm, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '2px solid #2A2A38', borderRadius: '8px', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNewPersonModal(false)} style={{ padding: '0.75rem 1.5rem', border: '2px solid #2A2A38', borderRadius: '8px', background: '#1C1C26', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#00CCEE', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create Person</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>

  );
}
