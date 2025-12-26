'use client';
import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/Sidebar';
import AuthGuard from '../components/AuthGuard';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  type: 'PHYSICAL' | 'SERVICE' | 'SUBSCRIPTION' | 'DIGITAL' | 'ACCESS' | 'BUNDLE';
  status: 'ACTIVE' | 'DRAFT' | 'DISCONTINUED';
  pricingModel: 'SIMPLE' | 'TIERED' | 'TIME_MATERIALS' | 'SUBSCRIPTION' | 'COST_PLUS' | 'CUSTOM';
  basePrice?: number;
  unit: string;
  costOfGoods?: number;
  targetMargin?: number;
  createdAt: string;
  updatedAt: string;
}

const productTypes = [
  { value: 'PHYSICAL', label: 'Physical', icon: '📦' },
  { value: 'SERVICE', label: 'Service', icon: '🔧' },
  { value: 'SUBSCRIPTION', label: 'Subscription', icon: '🔄' },
  { value: 'DIGITAL', label: 'Digital', icon: '💾' },
  { value: 'ACCESS', label: 'Access', icon: '🔑' },
  { value: 'BUNDLE', label: 'Bundle', icon: '📋' },
];

const unitTypes = [
  { value: 'each', label: 'Each' },
  { value: 'linear_ft', label: 'Linear Ft' },
  { value: 'sq_ft', label: 'Sq Ft' },
  { value: 'hour', label: 'Hour' },
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'project', label: 'Project' },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    type: 'SERVICE',
    status: 'ACTIVE',
    pricingModel: 'SIMPLE',
    basePrice: '',
    unit: 'each',
    costOfGoods: '',
    targetMargin: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('https://api.zanderos.com/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingProduct 
        ? `https://api.zanderos.com/products/${editingProduct.id}`
        : 'https://api.zanderos.com/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zander_token')}`
        },
        body: JSON.stringify({
          ...productForm,
          basePrice: productForm.basePrice ? parseFloat(productForm.basePrice) : null,
          costOfGoods: productForm.costOfGoods ? parseFloat(productForm.costOfGoods) : null,
          targetMargin: productForm.targetMargin ? parseFloat(productForm.targetMargin) : null,
        })
      });

      if (res.ok) {
        fetchProducts();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`https://api.zanderos.com/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  }

  function resetForm() {
    setProductForm({
      name: '',
      description: '',
      sku: '',
      category: '',
      type: 'SERVICE',
      status: 'ACTIVE',
      pricingModel: 'SIMPLE',
      basePrice: '',
      unit: 'each',
      costOfGoods: '',
      targetMargin: '',
    });
    setShowNewProductModal(false);
    setEditingProduct(null);
    setShowAdvanced(false);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      category: product.category || '',
      type: product.type,
      status: product.status,
      pricingModel: product.pricingModel,
      basePrice: product.basePrice?.toString() || '',
      unit: product.unit,
      costOfGoods: product.costOfGoods?.toString() || '',
      targetMargin: product.targetMargin?.toString() || '',
    });
    setShowNewProductModal(true);
    setShowAdvanced(!!product.costOfGoods || !!product.targetMargin);
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || product.type === filterType;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    const found = productTypes.find(t => t.value === type);
    return found?.icon || '📦';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#28a745';
      case 'DRAFT': return '#ffc107';
      case 'DISCONTINUED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const calculateMargin = (price: number, cost: number) => {
    if (!price || !cost) return null;
    return ((price - cost) / price * 100).toFixed(1);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: 'var(--zander-light-gray)' }}>
        <NavBar />
        <Sidebar />
        
        <main style={{ marginLeft: '240px', paddingTop: '64px', minHeight: '100vh' }}>
          <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--zander-navy)', margin: 0 }}>
                  Products
                </h1>
                <p style={{ color: 'var(--zander-gray)', margin: '0.5rem 0 0' }}>
                  Manage your products and services catalog
                </p>
              </div>
              <button
                onClick={() => setShowNewProductModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--zander-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>+</span> New Product
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  width: '300px',
                  fontSize: '0.95rem'
                }}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: 'white'
                }}
              >
                <option value="all">All Types</option>
                {productTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--zander-border-gray)',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: 'white'
                }}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--zander-gray)' }}>
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid var(--zander-border-gray)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ color: 'var(--zander-navy)', marginBottom: '0.5rem' }}>No products yet</h3>
                <p style={{ color: 'var(--zander-gray)', marginBottom: '1.5rem' }}>
                  Add your first product to get started
                </p>
                <button
                  onClick={() => setShowNewProductModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--zander-red)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + Add Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid var(--zander-border-gray)',
                      padding: '1.5rem',
                      transition: 'box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => openEditModal(product)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(product.type)}</span>
                        <div>
                          <h3 style={{ margin: 0, color: 'var(--zander-navy)', fontSize: '1.1rem', fontWeight: '600' }}>
                            {product.name}
                          </h3>
                          {product.sku && (
                            <span style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: `${getStatusColor(product.status)}20`,
                        color: getStatusColor(product.status)
                      }}>
                        {product.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
                          {product.basePrice ? formatCurrency(product.basePrice) : '—'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                          per {product.unit.replace('_', ' ')}
                        </div>
                      </div>
                      {product.costOfGoods && product.basePrice && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--zander-gray)' }}>
                            Cost: {formatCurrency(product.costOfGoods)}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#28a745' }}>
                            {calculateMargin(product.basePrice, product.costOfGoods)}% margin
                          </div>
                        </div>
                      )}
                    </div>

                    {product.category && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--zander-border-gray)' }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--zander-light-gray)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: 'var(--zander-gray)'
                        }}>
                          {product.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* New/Edit Product Modal */}
        {showNewProductModal && (
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
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--zander-border-gray)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0, color: 'var(--zander-navy)' }}>
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--zander-gray)'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                {/* Level 1: Basic Info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem', color: 'var(--zander-navy)', fontSize: '1rem' }}>
                    Basic Information
                  </h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--zander-border-gray)',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                      placeholder="e.g., Signature Series Cabinets"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.basePrice}
                        onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Unit
                      </label>
                      <select
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'white'
                        }}
                      >
                        {unitTypes.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Type
                      </label>
                      <select
                        value={productForm.type}
                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          background: 'white'
                        }}
                      >
                        {productTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Category
                      </label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--zander-border-gray)',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                        placeholder="e.g., Kitchen Cabinets"
                      />
                    </div>
                  </div>
                </div>

                {/* Level 2: More Options */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--zander-blue)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {showAdvanced ? '▼' : '▶'} More Options
                  </button>

                  {showAdvanced && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--zander-light-gray)', borderRadius: '8px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                          Description
                        </label>
                        <textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--zander-border-gray)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            resize: 'vertical'
                          }}
                          placeholder="Product description..."
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            SKU
                          </label>
                          <input
                            type="text"
                            value={productForm.sku}
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                            placeholder="e.g., SIG-CAB-001"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Status
                          </label>
                          <select
                            value={productForm.status}
                            onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              background: 'white'
                            }}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DRAFT">Draft</option>
                            <option value="DISCONTINUED">Discontinued</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Cost of Goods
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={productForm.costOfGoods}
                            onChange={(e) => setProductForm({ ...productForm, costOfGoods: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Target Margin %
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={productForm.targetMargin}
                            onChange={(e) => setProductForm({ ...productForm, targetMargin: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              border: '1px solid var(--zander-border-gray)',
                              borderRadius: '8px',
                              fontSize: '1rem'
                            }}
                            placeholder="e.g., 40"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingProduct.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginRight: 'auto'
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'white',
                      color: 'var(--zander-gray)',
                      border: '1px solid var(--zander-border-gray)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
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
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
