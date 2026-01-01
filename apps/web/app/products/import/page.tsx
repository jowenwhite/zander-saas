'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';

interface ImportSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'accounting' | 'ecommerce' | 'file';
  status: 'available' | 'coming_soon';
}

const importSources: ImportSource[] = [
  // Accounting
  { id: 'quickbooks', name: 'QuickBooks', icon: '📗', description: 'Import products from QuickBooks', category: 'accounting', status: 'coming_soon' },
  { id: 'xero', name: 'Xero', icon: '🔵', description: 'Import from Xero accounting', category: 'accounting', status: 'coming_soon' },
  { id: 'freshbooks', name: 'FreshBooks', icon: '🟢', description: 'Import from FreshBooks', category: 'accounting', status: 'coming_soon' },
  // E-commerce
  { id: 'shopify', name: 'Shopify', icon: '🛍️', description: 'Import Shopify products', category: 'ecommerce', status: 'coming_soon' },
  { id: 'woocommerce', name: 'WooCommerce', icon: '🟣', description: 'Import from WooCommerce', category: 'ecommerce', status: 'coming_soon' },
  { id: 'square', name: 'Square', icon: '⬛', description: 'Import Square catalog', category: 'ecommerce', status: 'coming_soon' },
  // File Upload
  { id: 'csv', name: 'CSV / Excel', icon: '📄', description: 'Upload a spreadsheet file', category: 'file', status: 'available' },
];

export default function ImportProductsPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const categories = [
    { id: 'accounting', label: 'Accounting Software', icon: '📊' },
    { id: 'ecommerce', label: 'E-commerce Platforms', icon: '🛒' },
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
      alert(source.name + ' integration coming soon! We\'re working on making imports as seamless as possible.');
    } else if (source.id === 'csv') {
      document.getElementById('csv-upload')?.click();
    }
  }

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <NavBar activeModule="cro" />
        <main style={{ marginTop: '64px', padding: '2rem', maxWidth: '1000px', margin: '64px auto 0' }}>
          {/* Back Button */}
          <button
            onClick={() => router.push('/products')}
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
            ← Back to Products
          </button>

          {/* Page Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
              Import Products
            </h1>
            <p style={{ color: 'var(--zander-gray)', margin: 0, fontSize: '1rem' }}>
              Bring your existing products and services into Zander from your favorite apps
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
              Drag & Drop Your File
            </h3>
            <p style={{ color: 'var(--zander-gray)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
              Drop a CSV or Excel file here to import products
            </p>
            <input
              type="file"
              id="csv-upload"
              accept=".csv,.xlsx,.xls"
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

          {/* Expected CSV Format */}
          <div style={{
            background: 'white',
            border: '1px solid var(--zander-border-gray)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 1rem 0', fontSize: '1rem' }}>
              📋 Expected CSV Format
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--zander-off-white)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>name*</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>sku</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>basePrice</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>unit</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--zander-border-gray)' }}>description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>Cabinet Installation</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>SVC-001</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>SERVICE</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>150.00</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>hour</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--zander-border-gray)', color: 'var(--zander-gray)' }}>Professional installation</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: 'var(--zander-gray)', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>
              * Required field. Type options: PHYSICAL, SERVICE, SUBSCRIPTION, DIGITAL, ACCESS, BUNDLE
            </p>
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
                  <span>{category.icon}</span> {category.label}
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
                        background: 'white',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        opacity: source.status === 'coming_soon' ? 0.7 : 1
                      }}
                    >
                      {source.status === 'coming_soon' && (
                        <span style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'var(--zander-off-white)',
                          color: 'var(--zander-gray)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          Coming Soon
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{source.icon}</span>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--zander-navy)', marginBottom: '0.25rem' }}>
                            {source.name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                            {source.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </AuthGuard>
  );
}
