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
  contact: Contact | null;
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Zander Dashboard
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contacts Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contacts</h2>
            {loading ? (
              <p className="text-gray-600">Loading contacts...</p>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border-b pb-3">
                    <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Deals Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Deals</h2>
            {loading ? (
              <p className="text-gray-600">Loading deals...</p>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div key={deal.id} className="border-b pb-3">
                    <p className="font-medium">{deal.dealName}</p>
                    <p className="text-sm text-gray-600">
                      ${deal.dealValue.toLocaleString()} - {deal.stage}
                    </p>
                    {deal.contact && (
                      <p className="text-xs text-gray-500">
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
