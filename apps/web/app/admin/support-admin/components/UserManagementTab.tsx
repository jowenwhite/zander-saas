'use client';

import { useState, useMemo } from 'react';
import { useAllUsers, User } from '../hooks/useAllUsers';
import { useTenants, Tenant } from '../hooks/useTenants';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  owner: { bg: 'rgba(139, 92, 246, 0.2)', text: '#a78bfa' },
  admin: { bg: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd' },
  member: { bg: 'rgba(34, 197, 94, 0.2)', text: '#86efac' },
  viewer: { bg: 'rgba(107, 114, 128, 0.2)', text: '#9ca3af' },
};

interface EditUserModalProps {
  user: User;
  tenants: Tenant[];
  onClose: () => void;
  onSubmit: (data: { tenantId?: string; role?: string }) => Promise<boolean>;
}

function EditUserModal({ user, tenants, onClose, onSubmit }: EditUserModalProps) {
  const [tenantId, setTenantId] = useState(user.tenantId);
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const hasChanges = tenantId !== user.tenantId || role !== user.role;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    try {
      const updates: { tenantId?: string; role?: string } = {};
      if (tenantId !== user.tenantId) updates.tenantId = tenantId;
      if (role !== user.role) updates.role = role;

      const success = await onSubmit(updates);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '16px',
          width: '500px',
          maxWidth: '90vw',
          border: '1px solid #2A2A38',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
          }}
        >
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem', fontWeight: '600' }}>
            Edit User
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
            {user.email}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Current Info */}
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ color: '#8888A0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Current Info
            </div>
            <div style={{ color: '#F0F0F5', marginBottom: '0.25rem' }}>
              <strong>{user.name}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8888A0' }}>
              Tenant: {user.tenantName || 'Unknown'} | Role: {user.role}
            </div>
          </div>

          {/* Tenant Selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Tenant
            </label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#13131A',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            >
              {tenants.filter(t => t.status === 'ACTIVE').map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.effectiveTier})
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
              }}
            >
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#13131A',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Warning if changing tenant */}
          {tenantId !== user.tenantId && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                color: '#fcd34d',
                fontSize: '0.85rem',
              }}
            >
              Warning: Moving user to a different tenant will change their access permissions.
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#2A2A38',
                border: 'none',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: loading || !hasChanges ? '#1a4a5a' : '#00CCEE',
                border: 'none',
                borderRadius: '8px',
                color: '#1C1C26',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: loading || !hasChanges ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserManagementTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { users, loading, error, pagination, roleOptions, refresh, loadMore, updateUser } = useAllUsers({
    tenantId: selectedTenant || undefined,
    search: searchQuery || undefined,
    role: selectedRole || undefined,
    limit: 50,
  });

  const { tenants } = useTenants();

  const activeTenants = useMemo(() => {
    return tenants.filter(t => t.status === 'ACTIVE');
  }, [tenants]);

  const handleUpdateUser = async (data: { tenantId?: string; role?: string }) => {
    if (!editingUser) return false;
    return updateUser(editingUser.id, data);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          padding: '1rem 1.5rem',
          background: '#1C1C26',
          borderRadius: '12px',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{
                padding: '0.5rem 1rem 0.5rem 2rem',
                background: '#13131A',
                border: '2px solid #2A2A38',
                borderRadius: '8px',
                color: '#F0F0F5',
                fontSize: '0.9rem',
                outline: 'none',
                width: '250px',
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666680',
                fontSize: '0.85rem',
              }}
            >
              ?
            </span>
          </div>

          {/* Tenant Filter */}
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: '#13131A',
              border: '2px solid #2A2A38',
              borderRadius: '8px',
              color: '#F0F0F5',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          >
            <option value="">All Tenants</option>
            {activeTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              background: '#13131A',
              border: '2px solid #2A2A38',
              borderRadius: '8px',
              color: '#F0F0F5',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          >
            <option value="">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role} ({r.count})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#8888A0', fontSize: '0.85rem' }}>
            {pagination?.total || 0} user{pagination?.total !== 1 ? 's' : ''}
          </span>
          <button
            onClick={refresh}
            style={{
              background: '#2A2A38',
              color: '#F0F0F5',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#fca5a5',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && users.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            color: '#8888A0',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #2A2A38',
                borderTop: '3px solid #00CCEE',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <div>Loading users...</div>
          </div>
        </div>
      )}

      {/* Table */}
      {users.length > 0 && (
        <div
          style={{
            background: '#1C1C26',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '800px',
              }}
            >
              <thead>
                <tr style={{ background: '#13131A' }}>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#8888A0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    User
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#8888A0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    Tenant
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#8888A0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: '#8888A0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                    }}
                  >
                    Created
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'right',
                      color: '#8888A0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      width: '100px',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.viewer;
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderTop: '1px solid #2A2A38',
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <div style={{ color: '#F0F0F5', fontWeight: '500' }}>
                            {user.name}
                            {user.isSuperAdmin && (
                              <span
                                style={{
                                  marginLeft: '0.5rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#fca5a5',
                                  padding: '0.125rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                }}
                              >
                                SUPER
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#8888A0', fontSize: '0.85rem' }}>{user.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: '#F0F0F5' }}>{user.tenantName || 'Unknown'}</div>
                        {user.tenantTier && (
                          <div style={{ color: '#8888A0', fontSize: '0.8rem' }}>{user.tenantTier}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            background: roleStyle.bg,
                            color: roleStyle.text,
                            textTransform: 'capitalize',
                          }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setEditingUser(user)}
                          style={{
                            background: '#2A2A38',
                            color: '#F0F0F5',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {pagination?.hasMore && (
            <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #2A2A38' }}>
              <button
                onClick={loadMore}
                disabled={loading}
                style={{
                  background: '#2A2A38',
                  color: '#F0F0F5',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Loading...' : `Load More (${pagination.total - users.length} remaining)`}
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && (
            <div
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#8888A0',
                borderTop: '1px solid #2A2A38',
              }}
            >
              Showing {users.length} of {pagination.total} users
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div
          style={{
            background: '#1C1C26',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>-</div>
          <div style={{ color: '#F0F0F5', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No users found
          </div>
          <div style={{ color: '#8888A0', fontSize: '0.9rem' }}>
            Try adjusting your filters or search query
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          tenants={tenants}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
