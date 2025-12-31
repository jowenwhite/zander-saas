'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

interface FormField {
  id?: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface TreasuryItem {
  id: string;
  type: string;
  name: string;
  description?: string;
  category?: string;
  executive?: string;
  industry?: string;
  channels?: string[];
  content: any;
  stepCount?: number;
  duration?: string;
  isActive: boolean;
  sortOrder: number;
}

const ITEM_TYPES = ['form', 'sop', 'campaign', 'assembly'];
const CATEGORIES = ['sales', 'operations', 'finance', 'hr', 'marketing'];
const EXECUTIVES = ['CRO', 'COO', 'CFO', 'CMO', 'CPO', 'CIO', 'EA'];
const INDUSTRIES = ['cabinet_millwork', 'home_services', 'professional_services', 'general'];
const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'textarea', 'select', 'date', 'checkbox'];

export default function AdminTreasuryPage() {
  const router = useRouter();
  const [items, setItems] = useState<TreasuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('form');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TreasuryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'form',
    name: '',
    description: '',
    category: 'sales',
    executive: 'CRO',
    industry: 'general',
    channels: [] as string[],
    duration: '',
    stepCount: 0,
    content: { fields: [] as FormField[] }
  });

  useEffect(() => {
    checkAccess();
    fetchItems();
  }, []);

  const checkAccess = () => {
    const userStr = localStorage.getItem('zander_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.isSuperAdmin) {
        setIsSuperAdmin(true);
      } else {
        router.push('/production');
      }
    } else {
      router.push('/login');
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/treasury`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch treasury items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormData({
      type: activeTab,
      name: '',
      description: '',
      category: 'sales',
      executive: 'CRO',
      industry: 'general',
      channels: [],
      duration: '',
      stepCount: 0,
      content: { fields: [] as FormField[] }
    });
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (item: TreasuryItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description || '',
      category: item.category || 'sales',
      executive: item.executive || 'CRO',
      industry: item.industry || 'general',
      channels: item.channels || [],
      duration: item.duration || '',
      stepCount: item.stepCount || 0,
      content: item.content || { fields: [] }
    });
    setShowModal(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('zander_token');
      const url = editingItem 
        ? `${API_URL}/treasury/${editingItem.id}`
        : `${API_URL}/treasury`;
      
      const res = await fetch(url, {
        method: editingItem ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchItems();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save');
      }
    } catch (err) {
      setError('Failed to save treasury item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('zander_token');
      const res = await fetch(`${API_URL}/treasury/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Form field management
  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false
    };
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        fields: [...(formData.content.fields || []), newField]
      }
    });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const fields = [...(formData.content.fields || [])];
    fields[index] = { ...fields[index], ...updates };
    setFormData({
      ...formData,
      content: { ...formData.content, fields }
    });
  };

  const removeField = (index: number) => {
    const fields = [...(formData.content.fields || [])];
    fields.splice(index, 1);
    setFormData({
      ...formData,
      content: { ...formData.content, fields }
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const fields = [...(formData.content.fields || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    [fields[index], fields[newIndex]] = [fields[newIndex], fields[index]];
    setFormData({
      ...formData,
      content: { ...formData.content, fields }
    });
  };

  const filteredItems = items.filter(item => item.type === activeTab);

  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-off-white)' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--zander-red)' }}>Access Denied</h1>
            <p>SuperAdmin access required</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--zander-off-white)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', marginLeft: '240px' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--zander-red) 0%, #a00a28 100%)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', margin: 0, fontSize: '1.75rem' }}>🏛️ Treasury Admin</h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.25rem 0 0' }}>
              Manage global templates • SuperAdmin Only
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            style={{
              background: 'var(--zander-gold)',
              color: 'var(--zander-navy)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            + New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          background: 'white',
          padding: '0.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {ITEM_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                background: activeTab === type ? 'var(--zander-navy)' : 'transparent',
                color: activeTab === type ? 'white' : 'var(--zander-navy)',
                transition: 'all 0.2s ease'
              }}
            >
              {type === 'form' && '📋'} {type === 'sop' && '📝'} {type === 'campaign' && '📧'} {type === 'assembly' && '👥'}
              {' '}{type.charAt(0).toUpperCase() + type.slice(1)}s ({items.filter(i => i.type === type).length})
            </button>
          ))}
        </div>

        {/* Items List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
              No {activeTab}s found. Click "New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}" to create one.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--zander-navy)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Executive</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Industry</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>
                    {activeTab === 'form' ? 'Fields' : activeTab === 'campaign' ? 'Steps' : 'Items'}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--zander-navy)' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: 'rgba(191, 10, 48, 0.1)', 
                        color: 'var(--zander-red)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {item.category || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: 'rgba(12, 35, 64, 0.1)', 
                        color: 'var(--zander-navy)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        {item.executive || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#666' }}>
                      {item.industry || 'general'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        background: 'var(--zander-gold)',
                        color: 'var(--zander-navy)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                      }}>
                        {item.type === 'form' 
                          ? (item.content?.fields?.length || 0)
                          : (item.content?.steps?.length || item.stepCount || 0)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          background: 'var(--zander-navy)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginRight: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: 'transparent',
                          color: 'var(--zander-red)',
                          border: '1px solid var(--zander-red)',
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
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
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              {/* Modal Header */}
              <div style={{
                background: 'var(--zander-navy)',
                color: 'white',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <h2 style={{ margin: 0 }}>
                  {editingItem ? 'Edit' : 'Create'} {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '1.5rem' }}>
                {error && (
                  <div style={{
                    background: 'rgba(191, 10, 48, 0.1)',
                    color: 'var(--zander-red)',
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1rem'
                  }}>
                    {error}
                  </div>
                )}

                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                      placeholder="Template name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    >
                      {ITEM_TYPES.map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    placeholder="Brief description of this template"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Executive
                    </label>
                    <select
                      value={formData.executive}
                      onChange={(e) => setFormData({ ...formData, executive: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    >
                      {EXECUTIVES.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Industry
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                    >
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i}>{i.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Fields Builder */}
                {formData.type === 'form' && (
                  <div style={{ 
                    border: '2px solid var(--zander-navy)', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ margin: 0, color: 'var(--zander-navy)' }}>
                        📋 Form Fields ({formData.content.fields?.length || 0})
                      </h3>
                      <button
                        onClick={addField}
                        style={{
                          background: 'var(--zander-red)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        + Add Field
                      </button>
                    </div>

                    {(!formData.content.fields || formData.content.fields.length === 0) ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem', 
                        color: '#666',
                        background: '#f9f9f9',
                        borderRadius: '6px'
                      }}>
                        No fields yet. Click "Add Field" to start building your form.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.content.fields.map((field: FormField, index: number) => (
                          <div
                            key={field.id || index}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 120px 80px 100px',
                              gap: '0.5rem',
                              alignItems: 'center',
                              padding: '0.75rem',
                              background: '#f9f9f9',
                              borderRadius: '6px',
                              border: '1px solid #eee'
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                onClick={() => moveField(index, 'up')}
                                disabled={index === 0}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: index === 0 ? 'default' : 'pointer',
                                  opacity: index === 0 ? 0.3 : 1,
                                  fontSize: '0.8rem'
                                }}
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveField(index, 'down')}
                                disabled={index === formData.content.fields.length - 1}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: index === formData.content.fields.length - 1 ? 'default' : 'pointer',
                                  opacity: index === formData.content.fields.length - 1 ? 0.3 : 1,
                                  fontSize: '0.8rem'
                                }}
                              >
                                ▼
                              </button>
                            </div>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              placeholder="Field label"
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            />
                            <select
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value })}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                              }}
                            >
                              {FIELD_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                              />
                              Required
                            </label>
                            <button
                              onClick={() => removeField(index)}
                              style={{
                                background: 'none',
                                border: '1px solid var(--zander-red)',
                                color: 'var(--zander-red)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Options for select fields */}
                    {formData.content.fields?.some((f: FormField) => f.type === 'select') && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff8e6', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--zander-navy)', fontSize: '0.9rem' }}>
                          ⚠️ Select Field Options
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                          For select fields, add options in the format below (comma-separated):
                        </p>
                        {formData.content.fields.map((field: FormField, index: number) => 
                          field.type === 'select' && (
                            <div key={index} style={{ marginTop: '0.5rem' }}>
                              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>{field.label || 'Unnamed'}:</label>
                              <input
                                type="text"
                                value={(field.options || []).join(', ')}
                                onChange={(e) => updateField(index, { 
                                  options: e.target.value.split(',').map(o => o.trim()).filter(o => o) 
                                })}
                                placeholder="Option 1, Option 2, Option 3"
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem',
                                  marginTop: '0.25rem'
                                }}
                              />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Duration for campaigns/assemblies */}
                {(formData.type === 'campaign' || formData.type === 'assembly') && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--zander-navy)' }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '1rem'
                      }}
                      placeholder="e.g., 30 minutes, 14 days"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                position: 'sticky',
                bottom: 0,
                background: 'white'
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #ddd',
                    background: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    background: saving ? '#ccc' : 'var(--zander-red)',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: saving ? 'default' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {saving ? 'Saving...' : (editingItem ? 'Save Changes' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
