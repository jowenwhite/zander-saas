'use client';
import { useState, useEffect, useRef, CSSProperties } from 'react';
import { CMOLayout, Card, Button, LoadingSpinner } from '../components';

interface BrandProfile {
  id: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  logoUrl: string | null;
  logoIconUrl: string | null;
  voiceTone: string | null;
  voiceGuidelines: string | null;
  tagline: string | null;
  mission: string | null;
}

interface ContentAsset {
  id: string;
  name: string;
  assetType: string;
  description: string | null;
  url: string;
  thumbnailUrl: string | null;
  mimeType: string | null;
  fileSize: number | null;
  folder: string | null;
  tags: string[];
  createdAt: string;
}

type TabType = 'profile' | 'assets' | 'guidelines';

export default function CMOBrandPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const [brandRes, assetsRes] = await Promise.all([
        fetch(`${apiUrl}/cmo/assets/brand`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/cmo/assets?folder=Brand`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (brandRes.ok) {
        const brand = await brandRes.json();
        setBrandProfile(brand);
      } else {
        // Create default brand profile structure if none exists
        // Using Zander brand defaults
        setBrandProfile({
          id: '',
          primaryColor: '#00CCEE',
          secondaryColor: '#F57C00',
          accentColor: '#09090F',
          fontPrimary: 'Sora',
          fontSecondary: 'Inter',
          logoUrl: '/images/zander-logo.svg',
          logoIconUrl: '/images/zander-icon.svg',
          voiceTone: 'Bold and confident',
          voiceGuidelines: 'We speak with clarity and purpose.\n\nGuidelines:\n- Use active voice\n- Be direct and concise\n- Inspire action and confidence\n- Avoid jargon unless industry-specific\n- Address customers professionally',
          tagline: 'AI-Powered Growth Platform',
          mission: 'Empowering businesses to grow smarter with AI-driven marketing, sales, and operations automation.',
        });
      }

      if (assetsRes.ok) {
        const assetData = await assetsRes.json();
        setAssets(assetData);
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
      showToast('Failed to load brand data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBrandProfile = async () => {
    if (!brandProfile) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/assets/brand`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(brandProfile),
      });

      if (response.ok) {
        const updated = await response.json();
        setBrandProfile(updated);
        showToast('Brand profile saved!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving brand profile:', error);
      showToast('Failed to save brand profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Brand');

      const response = await fetch(`${apiUrl}/cmo/assets/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newAsset = await response.json();
        setAssets((prev) => [newAsset, ...prev]);
        showToast('File uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/assets/${assetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== assetId));
        showToast('Asset deleted');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      showToast('Failed to delete asset', 'error');
    }
  };

  const updateBrandField = (field: keyof BrandProfile, value: string) => {
    if (!brandProfile) return;
    setBrandProfile({ ...brandProfile, [field]: value });
  };

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Toast */}
      {toast && (
        <div style={{ ...toastStyle, backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444' }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Brand Library</h1>
          <p style={subtitleStyle}>Manage your brand identity, assets, and guidelines</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={tabsContainerStyle}>
        {(['profile', 'assets', 'guidelines'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabStyle,
              borderBottom: activeTab === tab ? '3px solid #F57C00' : '3px solid transparent',
              color: activeTab === tab ? '#F57C00' : '#8888A0',
            }}
          >
            {tab === 'profile' && '🎨 Brand Profile'}
            {tab === 'assets' && '📁 Brand Assets'}
            {tab === 'guidelines' && '📝 Voice & Guidelines'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && brandProfile && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Colors */}
          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Brand Colors</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <ColorInput
                  label="Primary Color"
                  value={brandProfile.primaryColor || '#00CCEE'}
                  onChange={(v) => updateBrandField('primaryColor', v)}
                />
                <ColorInput
                  label="Secondary Color"
                  value={brandProfile.secondaryColor || '#F57C00'}
                  onChange={(v) => updateBrandField('secondaryColor', v)}
                />
                <ColorInput
                  label="Accent Color"
                  value={brandProfile.accentColor || '#09090F'}
                  onChange={(v) => updateBrandField('accentColor', v)}
                />
              </div>

              {/* Color Preview */}
              <div style={{ marginTop: '1.5rem' }}>
                <label style={labelStyle}>Preview</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ ...colorSwatchStyle, background: brandProfile.primaryColor || '#00CCEE' }} />
                  <div style={{ ...colorSwatchStyle, background: brandProfile.secondaryColor || '#F57C00' }} />
                  <div style={{ ...colorSwatchStyle, background: brandProfile.accentColor || '#09090F' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Typography */}
          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Typography</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Primary Font</label>
                <select
                  value={brandProfile.fontPrimary || 'Sora'}
                  onChange={(e) => updateBrandField('fontPrimary', e.target.value)}
                  style={selectStyle}
                >
                  <option value="Sora">Sora</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Secondary Font</label>
                <select
                  value={brandProfile.fontSecondary || 'Inter'}
                  onChange={(e) => updateBrandField('fontSecondary', e.target.value)}
                  style={selectStyle}
                >
                  <option value="Inter">Inter</option>
                  <option value="Sora">Sora</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              {/* Typography Preview */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#13131A', borderRadius: '8px' }}>
                <div style={{ fontFamily: brandProfile.fontPrimary || 'Sora', fontSize: '1.5rem', fontWeight: '700', color: '#F0F0F5', marginBottom: '0.5rem' }}>
                  Heading Text
                </div>
                <div style={{ fontFamily: brandProfile.fontSecondary || 'Inter', fontSize: '1rem', color: '#8888A0' }}>
                  Body text example showing your secondary font in action.
                </div>
              </div>
            </div>
          </Card>

          {/* Logos */}
          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Logos</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Primary Logo URL</label>
                <input
                  type="url"
                  value={brandProfile.logoUrl || ''}
                  onChange={(e) => updateBrandField('logoUrl', e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
                {brandProfile.logoUrl && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#1C1C26', borderRadius: '8px', textAlign: 'center' }}>
                    <img src={brandProfile.logoUrl} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%' }} />
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Icon / Favicon URL</label>
                <input
                  type="url"
                  value={brandProfile.logoIconUrl || ''}
                  onChange={(e) => updateBrandField('logoIconUrl', e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
                {brandProfile.logoIconUrl && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#1C1C26', borderRadius: '8px', textAlign: 'center' }}>
                    <img src={brandProfile.logoIconUrl} alt="Icon" style={{ maxHeight: '40px' }} />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Tagline & Mission */}
          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Tagline & Mission</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Tagline</label>
                <input
                  type="text"
                  value={brandProfile.tagline || ''}
                  onChange={(e) => updateBrandField('tagline', e.target.value)}
                  placeholder="Your brand tagline..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Mission Statement</label>
                <textarea
                  value={brandProfile.mission || ''}
                  onChange={(e) => updateBrandField('mission', e.target.value)}
                  placeholder="Your company mission..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSaveBrandProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Brand Profile'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <Card>
          <div style={{ ...cardHeaderStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={cardTitleStyle}>Brand Assets</h3>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.svg"
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '+ Upload Asset'}
              </Button>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {assets.length === 0 ? (
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#F0F0F5' }}>No brand assets yet</h3>
                <p style={{ color: '#8888A0', margin: 0 }}>
                  Upload logos, images, and brand files to your library
                </p>
              </div>
            ) : (
              <div style={assetsGridStyle}>
                {assets.map((asset) => (
                  <div key={asset.id} style={assetCardStyle}>
                    <div style={assetPreviewStyle}>
                      {asset.mimeType?.startsWith('image/') ? (
                        <img src={asset.url} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '2rem' }}>
                          {asset.mimeType?.includes('pdf') ? '📄' : '📁'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#F0F0F5', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8888A0' }}>
                        {asset.fileSize ? formatFileSize(asset.fileSize) : 'External'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', borderTop: '1px solid #2A2A38' }}>
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={assetActionStyle}
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        style={{ ...assetActionStyle, color: '#00CCEE', borderLeft: '1px solid #2A2A38' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'guidelines' && brandProfile && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Brand Voice</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Voice & Tone</label>
                <select
                  value={brandProfile.voiceTone || ''}
                  onChange={(e) => updateBrandField('voiceTone', e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select a tone...</option>
                  <option value="Professional yet approachable">Professional yet approachable</option>
                  <option value="Friendly and casual">Friendly and casual</option>
                  <option value="Authoritative and expert">Authoritative and expert</option>
                  <option value="Warm and empathetic">Warm and empathetic</option>
                  <option value="Bold and confident">Bold and confident</option>
                  <option value="Simple and clear">Simple and clear</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Voice Guidelines</label>
                <textarea
                  value={brandProfile.voiceGuidelines || ''}
                  onChange={(e) => updateBrandField('voiceGuidelines', e.target.value)}
                  placeholder="Describe how your brand should communicate...

Examples:
- We always address customers by first name
- We avoid jargon and technical terms
- We use active voice
- We're helpful but not pushy"
                  rows={8}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <div style={cardHeaderStyle}>
              <h3 style={cardTitleStyle}>Quick Reference</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Primary Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: brandProfile.primaryColor || '#00CCEE' }} />
                    <code style={{ fontSize: '0.875rem' }}>{brandProfile.primaryColor || '#00CCEE'}</code>
                  </div>
                </div>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Secondary Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: brandProfile.secondaryColor || '#F57C00' }} />
                    <code style={{ fontSize: '0.875rem' }}>{brandProfile.secondaryColor || '#F57C00'}</code>
                  </div>
                </div>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Accent Color</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: brandProfile.accentColor || '#09090F' }} />
                    <code style={{ fontSize: '0.875rem' }}>{brandProfile.accentColor || '#09090F'}</code>
                  </div>
                </div>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Primary Font</div>
                  <code style={{ fontSize: '0.875rem' }}>{brandProfile.fontPrimary || 'Sora'}</code>
                </div>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Secondary Font</div>
                  <code style={{ fontSize: '0.875rem' }}>{brandProfile.fontSecondary || 'Inter'}</code>
                </div>
                <div style={quickRefCardStyle}>
                  <div style={{ fontSize: '0.75rem', color: '#8888A0', marginBottom: '0.25rem' }}>Voice</div>
                  <code style={{ fontSize: '0.875rem' }}>{brandProfile.voiceTone || 'Not set'}</code>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={handleSaveBrandProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Guidelines'}
            </Button>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}

// Color Input Component
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '50px', height: '42px', border: '2px solid #2A2A38', borderRadius: '8px', cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
}

// Utility
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Styles
const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  marginBottom: '1.5rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: '#F0F0F5',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: '#8888A0',
  margin: 0,
};

const tabsContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1.5rem',
  borderBottom: '1px solid #2A2A38',
};

const tabStyle: CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'none',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const cardHeaderStyle: CSSProperties = {
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #2A2A38',
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: '600',
  color: '#F0F0F5',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#F0F0F5',
  marginBottom: '0.5rem',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid #2A2A38',
  borderRadius: '8px',
  fontSize: '0.9rem',
  outline: 'none',
  background: '#1C1C26',
  color: '#F0F0F5',
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  background: '#1C1C26',
};

const colorSwatchStyle: CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '8px',
  border: '2px solid #2A2A38',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
};

const assetsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '1rem',
};

const assetCardStyle: CSSProperties = {
  background: '#1C1C26',
  border: '1px solid #2A2A38',
  borderRadius: '8px',
  overflow: 'hidden',
};

const assetPreviewStyle: CSSProperties = {
  height: '120px',
  background: '#1C1C26',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

const assetActionStyle: CSSProperties = {
  flex: 1,
  padding: '0.5rem',
  background: 'none',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--zander-blue)',
  cursor: 'pointer',
  textAlign: 'center',
  textDecoration: 'none',
};

const quickRefCardStyle: CSSProperties = {
  padding: '0.75rem',
  background: '#1C1C26',
  borderRadius: '6px',
};

const toastStyle: CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  color: 'white',
  fontWeight: '500',
  zIndex: 1200,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
