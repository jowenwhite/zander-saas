'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CMOLayout from '../components/CMOLayout';

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

export default function CMOPeoplePage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [personForm, setPersonForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '', title: ''
  });

  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      const res = await fetch('https://api.zanderos.com/people', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPeople(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('https://api.zanderos.com/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zander_token')}`
        },
        body: JSON.stringify(personForm)
      });
      if (res.ok) {
        setPersonForm({ firstName: '', lastName: '', email: '', phone: '', company: '', title: '' });
        setShowModal(false);
        fetchPeople();
      }
    } catch (error) {
      console.error('Error creating person:', error);
    }
  }

  const filteredPeople = people.filter(person => {
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || person.email.toLowerCase().includes(search) ||
      (person.company && person.company.toLowerCase().includes(search));
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
              Marketing Contacts
            </h1>
            <p style={{ color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              Manage contacts for your marketing campaigns
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
            }}
          >
            + Add Contact
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, maxWidth: '400px' }}
          />
        </div>

        {/* People Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>Loading contacts...</div>
        ) : filteredPeople.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <h3 style={{ color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>No contacts yet</h3>
            <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem' }}>Add your first contact to get started</p>
            <button onClick={() => setShowModal(true)} style={{ padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              + Add Contact
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {filteredPeople.map(person => (
              <div
                key={person.id}
                onClick={() => router.push(`/people/${person.id}`)}
                style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--zander-border-gray)', padding: '1.5rem', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', background: '#F57C00',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '600', fontSize: '1.1rem'
                  }}>
                    {getInitials(person.firstName, person.lastName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem', fontWeight: '600' }}>
                      {person.firstName} {person.lastName}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--zander-gray)', fontSize: '0.9rem' }}>
                      {person.email}
                    </p>
                  </div>
                </div>
                {(person.company || person.title) && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                    {person.title && <span style={{ fontSize: '0.85rem', color: 'var(--zander-navy)' }}>{person.title}</span>}
                    {person.title && person.company && <span style={{ color: 'var(--zander-gray)' }}> at </span>}
                    {person.company && <span style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>{person.company}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--zander-border-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--zander-navy)' }}>Add Contact</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--zander-gray)' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>First Name *</label>
                  <input type="text" required value={personForm.firstName} onChange={(e) => setPersonForm({ ...personForm, firstName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Last Name *</label>
                  <input type="text" required value={personForm.lastName} onChange={(e) => setPersonForm({ ...personForm, lastName: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                <input type="email" required value={personForm.email} onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone</label>
                <input type="tel" value={personForm.phone} onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company</label>
                  <input type="text" value={personForm.company} onChange={(e) => setPersonForm({ ...personForm, company: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                  <input type="text" value={personForm.title} onChange={(e) => setPersonForm({ ...personForm, title: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', color: 'var(--zander-gray)', border: '1px solid var(--zander-border-gray)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#F57C00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}
