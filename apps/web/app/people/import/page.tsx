'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';
import { logout } from '../../utils/auth';

interface ImportSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'mobile' | 'email' | 'productivity' | 'file';
  status: 'available' | 'coming_soon';
}

const importSources: ImportSource[] = [
  // Mobile
  { id: 'iphone', name: 'iPhone Contacts', icon: '📱', description: 'Import from iCloud or vCard export', category: 'mobile', status: 'coming_soon' },
  { id: 'android', name: 'Android Contacts', icon: '🤖', description: 'Import via Google Contacts sync', category: 'mobile', status: 'coming_soon' },
  
  // Email Providers
  { id: 'google', name: 'Google Contacts', icon: '🔴', description: 'Connect your Google account', category: 'email', status: 'coming_soon' },
  { id: 'outlook', name: 'Microsoft Outlook', icon: '🔵', description: 'Import from Outlook/Office 365', category: 'email', status: 'coming_soon' },
  { id: 'yahoo', name: 'Yahoo Mail', icon: '🟣', description: 'Import Yahoo contacts', category: 'email', status: 'coming_soon' },
  
  // Productivity Apps
  { id: 'monday', name: 'Monday.com', icon: '📊', description: 'Import from Monday boards', category: 'productivity', status: 'coming_soon' },
  { id: 'slack', name: 'Slack', icon: '💬', description: 'Import workspace members', category: 'productivity', status: 'coming_soon' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', description: 'Migrate from HubSpot CRM', category: 'productivity', status: 'coming_soon' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', description: 'Migrate from Salesforce', category: 'productivity', status: 'coming_soon' },
  { id: 'mailchimp', name: 'Mailchimp', icon: '🐵', description: 'Import audience lists', category: 'productivity', status: 'coming_soon' },
  
  // File Upload
  { id: 'csv', name: 'CSV / Excel', icon: '📄', description: 'Upload a spreadsheet file', category: 'file', status: 'available' },
  { id: 'vcard', name: 'vCard (.vcf)', icon: '👤', description: 'Upload vCard contact files', category: 'file', status: 'coming_soon' },
];

export default function ImportContactsPage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState('cro');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const categories = [
    { id: 'mobile', label: 'Mobile Contacts', icon: '📱' },
    { id: 'email', label: 'Email Providers', icon: '✉️' },
    { id: 'productivity', label: 'Productivity Apps', icon: '⚡' },
    { id: 'file', label: 'File Upload', icon: '📁' },
  ];

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }

  function handleImportClick(source: ImportSource) {
    if (source.status === 'coming_soon') {
      alert(`${source.name} integration coming soon! We're working on making onboarding as seamless as possible.`);
    } else if (source.id === 'csv') {
      document.getElementById('csv-upload')?.click();
    }
  }

  return (
    <AuthGuard>
    <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      {/* Top Navigation */}
      <NavBar activeModule="cro" />

      {/* Main Content */}
      <main style={{ marginTop: '64px', padding: '2rem', maxWidth: '1000px', margin: '64px auto 0' }}>
        {/* Back Button */}
        <button 
          onClick={() => router.push('/contacts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--zander-gray)',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          ← Back to Contacts
        </button>

        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
            Import Contacts
          </h1>
          <p style={{ color: 'var(--zander-gray)', margin: 0, fontSize: '1rem' }}>
            Bring your existing contacts into Zander from your favorite apps and services
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            background: dragOver ? 'rgba(191, 10, 48, 0.05)' : 'white',
            border: dragOver ? '2px dashed var(--zander-red)' : '2px dashed var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            marginBottom: '2rem',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
          <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
            Drag & Drop Your File
          </h3>
          <p style={{ color: 'var(--zander-gray)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
            Drop a CSV, Excel, or vCard file here to import contacts
          </p>
          <input
            type="file"
            id="csv-upload"
            accept=".csv,.xlsx,.xls,.vcf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('csv-upload')?.click()}
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
            Browse Files
          </button>
          {selectedFile && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(39, 174, 96, 0.1)',
              borderRadius: '8px',
              color: '#27AE60',
              fontWeight: '500'
            }}>
              ✓ Selected: {selectedFile.name}
              <button
                onClick={() => alert('CSV import processing coming soon!')}
                style={{
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#27AE60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                Import Now
              </button>
            </div>
          )}
        </div>

        {/* Import Sources by Category */}
        {categories.map((category) => {
          const sources = importSources.filter(s => s.category === category.id);
          return (
            <div key={category.id} style={{ marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--zander-navy)',
                margin: '0 0 1rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>{category.icon}</span>
                {category.label}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleImportClick(source)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      background: 'white',
                      border: '2px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '10px',
                      background: 'var(--zander-off-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      {source.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--zander-navy)',
                        marginBottom: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {source.name}
                        {source.status === 'coming_soon' && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            background: 'rgba(240, 179, 35, 0.2)',
                            color: '#B8860B',
                            borderRadius: '4px',
                            fontSize: '0.6rem',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                          }}>Soon</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--zander-gray)' }}>
                        {source.description}
                      </div>
                    </div>
                    <div style={{ color: 'var(--zander-gray)', fontSize: '1.25rem' }}>→</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Help Section */}
        <div style={{
          background: 'var(--zander-navy)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          marginTop: '2rem'
        }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem' }}>Need Help Importing?</h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem', lineHeight: 1.6 }}>
            Our team can help you migrate contacts from any system. We offer white-glove onboarding 
            to ensure your transition to Zander is seamless.
          </p>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--zander-gold)',
            color: 'var(--zander-navy)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700'
          }}>
            Contact Support
          </button>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
