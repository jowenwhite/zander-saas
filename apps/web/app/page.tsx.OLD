'use client';

import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Deal {
  id: string;
  dealName: string;
  dealValue: number;
  stage: string;
  probability: number;
  contact: Contact | null;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [contactsRes, dealsRes] = await Promise.all([
        fetch('http://localhost:3001/contacts'),
        fetch('http://localhost:3001/deals'),
      ]);
      
      const contactsData = await contactsRes.json();
      const dealsData = await dealsRes.json();
      
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ firstName: '', lastName: '', email: '' });
        setShowContactForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  }

  const totalPipeline = deals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const avgDealSize = deals.length > 0 ? totalPipeline / deals.length : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '2px solid var(--zander-border-gray)',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--zander-red) 0%, #A00A28 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.5rem'
            }}>
              Z
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
                Zander Dashboard
              </h1>
              <p style={{ color: 'var(--zander-gray)', margin: 0, fontSize: '0.875rem' }}>
                Welcome back, Jonathan
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowContactForm(!showContactForm)}
            style={{
              background: 'var(--zander-red)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            + New Contact
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Total Pipeline */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #27AE60 0%, #1e8449 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                💰
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>
              ${totalPipeline.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
              Total Pipeline Value
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', marginTop: '0.5rem' }}>
              {deals.length} active deals
            </div>
          </div>

          {/* Total Contacts */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3498DB 0%, #2471a3 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                👥
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>
              {contacts.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
              Total Contacts
            </div>
          </div>

          {/* Avg Deal Size */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #9B59B6 0%, #7d3c98 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>
              ${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--zander-gray)' }}>
              Average Deal Size
            </div>
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
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
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--zander-navy)' }}>New Contact</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--zander-navy)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--zander-red)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Create Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Contacts List */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '1.5rem' }}>
              Contacts
            </h2>
            {loading ? (
              <p style={{ color: 'var(--zander-gray)' }}>Loading contacts...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contacts.map((contact) => (
                  <div key={contact.id} style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--zander-border-gray)'
                  }}>
                    <p style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', margin: 0 }}>
                      {contact.email}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deals List */}
          <div style={{
            background: 'white',
            border: '2px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--zander-navy)', marginBottom: '1.5rem' }}>
              Active Deals
            </h2>
            {loading ? (
              <p style={{ color: 'var(--zander-gray)' }}>Loading deals...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {deals.map((deal) => (
                  <div key={deal.id} style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--zander-border-gray)'
                  }}>
                    <p style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                      {deal.dealName}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
                      ${deal.dealValue.toLocaleString()} • {deal.stage} • {deal.probability}%
                    </p>
                    {deal.contact && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--zander-gray)', margin: 0 }}>
                        Contact: {deal.contact.firstName} {deal.contact.lastName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
