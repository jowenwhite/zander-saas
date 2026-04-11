'use client';

import { useState, useMemo } from 'react';
import { useTenants, Tenant } from '../hooks/useTenants';
import { TierBadge } from './TierBadge';
import { EngagementBar } from './EngagementBar';
import { ChurnRiskBadge } from './ChurnRiskBadge';
import { StatusBadge } from './StatusBadge';
import { ActionsDropdown } from './ActionsDropdown';
import { BatchActionsBar } from './BatchActionsBar';
import { TenantDetailModal } from './TenantDetailModal';
import { TenantRenameDialog } from './TenantRenameDialog';
import { TenantTierDialog } from './TenantTierDialog';
import { TenantTrialExtendDialog } from './TenantTrialExtendDialog';
import { ArchiveConfirmDialog } from './ArchiveConfirmDialog';
import { RestoreConfirmDialog } from './RestoreConfirmDialog';

type FilterStatus = 'all' | 'active' | 'archived';
type SortField = 'name' | 'tier' | 'users' | 'engagement' | 'churnRisk' | 'lastActivity';
type SortDirection = 'asc' | 'desc';

interface ModalState {
  type: 'detail' | 'rename' | 'tier' | 'trial' | 'archive' | 'restore' | 'bulkTier' | 'bulkTrial' | 'bulkArchive' | null;
  tenant: Tenant | null;
}

export function TenantsTab() {
  const {
    tenants,
    loading,
    error,
    refresh,
    renameTenant,
    setTierOverride,
    removeTierOverride,
    extendTrial,
    archiveTenant,
    restoreTenant,
    bulkSetTierOverride,
    bulkExtendTrial,
    bulkArchive,
  } = useTenants();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [modal, setModal] = useState<ModalState>({ type: null, tenant: null });

  // Filtered and sorted tenants
  const filteredTenants = useMemo(() => {
    let result = [...tenants];

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter((t) => t.status === 'ACTIVE');
    } else if (filterStatus === 'archived') {
      result = result.filter((t) => t.status === 'ARCHIVED');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.effectiveTier.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'tier':
          comparison = a.effectiveTier.localeCompare(b.effectiveTier);
          break;
        case 'users':
          comparison = a.userCount - b.userCount;
          break;
        case 'engagement':
          comparison = (a.engagementScore || 0) - (b.engagementScore || 0);
          break;
        case 'churnRisk':
          const riskOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
          const aRisk = riskOrder[a.churnRiskLevel as keyof typeof riskOrder] || 0;
          const bRisk = riskOrder[b.churnRiskLevel as keyof typeof riskOrder] || 0;
          comparison = aRisk - bRisk;
          break;
        case 'lastActivity':
          const aDate = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
          const bDate = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tenants, filterStatus, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTenants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTenants.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getSelectedTenants = () => {
    return tenants.filter((t) => selectedIds.has(t.id));
  };

  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const closeModal = () => {
    setModal({ type: null, tenant: null });
  };

  const handleRename = async (newName: string) => {
    if (!modal.tenant) return false;
    const success = await renameTenant(modal.tenant.id, newName);
    if (success) closeModal();
    return success;
  };

  const handleTierOverride = async (tier: string, note?: string) => {
    if (modal.type === 'bulkTier') {
      const success = await bulkSetTierOverride(Array.from(selectedIds), tier, note);
      if (success) {
        closeModal();
        setSelectedIds(new Set());
      }
      return success;
    }
    if (!modal.tenant) return false;
    const success = await setTierOverride(modal.tenant.id, tier, note);
    if (success) closeModal();
    return success;
  };

  const handleRemoveOverride = async () => {
    if (!modal.tenant) return false;
    const success = await removeTierOverride(modal.tenant.id);
    if (success) closeModal();
    return success;
  };

  const handleTrialExtend = async (days: number) => {
    if (modal.type === 'bulkTrial') {
      const success = await bulkExtendTrial(Array.from(selectedIds), days);
      if (success) {
        closeModal();
        setSelectedIds(new Set());
      }
      return success;
    }
    if (!modal.tenant) return false;
    const success = await extendTrial(modal.tenant.id, days);
    if (success) closeModal();
    return success;
  };

  const handleArchive = async () => {
    if (modal.type === 'bulkArchive') {
      const success = await bulkArchive(Array.from(selectedIds));
      if (success) {
        closeModal();
        setSelectedIds(new Set());
      }
      return success;
    }
    if (!modal.tenant) return false;
    const success = await archiveTenant(modal.tenant.id);
    if (success) closeModal();
    return success;
  };

  const handleRestore = async () => {
    if (!modal.tenant) return false;
    const success = await restoreTenant(modal.tenant.id);
    if (success) closeModal();
    return success;
  };

  if (loading && tenants.length === 0) {
    return (
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
          <div>Loading tenants...</div>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && tenants.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div
          style={{
            background: '#4a0d0d',
            border: '1px solid #dc3545',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <span style={{ fontSize: '2rem' }}>!</span>
          <h3 style={{ margin: '1rem 0 0.5rem', color: '#F0F0F5' }}>Failed to Load Tenants</h3>
          <p style={{ color: '#8888A0', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={refresh}
            style={{
              background: '#00CCEE',
              color: '#1C1C26',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '0.25rem', background: '#13131A', borderRadius: '8px', padding: '0.25rem' }}>
            {(['all', 'active', 'archived'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: filterStatus === status ? '#2A2A38' : 'transparent',
                  color: filterStatus === status ? '#F0F0F5' : '#8888A0',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: filterStatus === status ? '600' : '400',
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenants..."
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#8888A0', fontSize: '0.85rem' }}>
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? 's' : ''}
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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
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
              minWidth: '900px',
            }}
          >
            <thead>
              <tr style={{ background: '#13131A' }}>
                <th style={{ padding: '1rem', textAlign: 'left', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTenants.length && filteredTenants.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: '#00CCEE' }}
                  />
                </th>
                <th
                  onClick={() => handleSort('name')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Company Name {sortField === 'name' && (sortDirection === 'asc' ? '>' : '<')}
                </th>
                <th
                  onClick={() => handleSort('tier')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Tier {sortField === 'tier' && (sortDirection === 'asc' ? '>' : '<')}
                </th>
                <th
                  onClick={() => handleSort('users')}
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Users {sortField === 'users' && (sortDirection === 'asc' ? '>' : '<')}
                </th>
                <th
                  onClick={() => handleSort('lastActivity')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Last Active {sortField === 'lastActivity' && (sortDirection === 'asc' ? '>' : '<')}
                </th>
                <th
                  onClick={() => handleSort('engagement')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                    minWidth: '140px',
                  }}
                >
                  Engagement {sortField === 'engagement' && (sortDirection === 'asc' ? '>' : '<')}
                </th>
                <th
                  onClick={() => handleSort('churnRisk')}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Churn Risk {sortField === 'churnRisk' && (sortDirection === 'asc' ? '>' : '<')}
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
                  Status
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
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  style={{
                    borderTop: '1px solid #2A2A38',
                    background: selectedIds.has(tenant.id) ? '#1a2a3a' : 'transparent',
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tenant.id)}
                      onChange={() => toggleSelect(tenant.id)}
                      style={{ accentColor: '#00CCEE' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#F0F0F5', fontWeight: '500' }}>{tenant.name}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <TierBadge
                      tier={tenant.effectiveTier}
                      isOverride={!!tenant.tierOverride}
                      isTrial={tenant.trialActive}
                    />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ color: '#F0F0F5', fontWeight: '500' }}>{tenant.userCount}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: '#8888A0', fontSize: '0.9rem' }}>
                      {formatRelativeTime(tenant.lastActivityAt)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <EngagementBar score={tenant.engagementScore} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <ChurnRiskBadge level={tenant.churnRiskLevel} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <ActionsDropdown
                      tenant={tenant}
                      onView={() => setModal({ type: 'detail', tenant })}
                      onRename={() => setModal({ type: 'rename', tenant })}
                      onTierChange={() => setModal({ type: 'tier', tenant })}
                      onTrialExtend={() => setModal({ type: 'trial', tenant })}
                      onArchive={() => setModal({ type: 'archive', tenant })}
                      onRestore={() => setModal({ type: 'restore', tenant })}
                    />
                  </td>
                </tr>
              ))}
              {filteredTenants.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: '3rem',
                      textAlign: 'center',
                      color: '#8888A0',
                    }}
                  >
                    No tenants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkTierOverride={() => setModal({ type: 'bulkTier', tenant: null })}
        onBulkTrialExtend={() => setModal({ type: 'bulkTrial', tenant: null })}
        onBulkArchive={() => setModal({ type: 'bulkArchive', tenant: null })}
      />

      {/* Modals */}
      {modal.type === 'detail' && modal.tenant && (
        <TenantDetailModal
          tenant={modal.tenant}
          onClose={closeModal}
          onRename={() => setModal({ type: 'rename', tenant: modal.tenant })}
          onTierChange={() => setModal({ type: 'tier', tenant: modal.tenant })}
          onTrialExtend={() => setModal({ type: 'trial', tenant: modal.tenant })}
          onArchive={() => setModal({ type: 'archive', tenant: modal.tenant })}
          onRestore={() => setModal({ type: 'restore', tenant: modal.tenant })}
        />
      )}

      {modal.type === 'rename' && modal.tenant && (
        <TenantRenameDialog
          currentName={modal.tenant.name}
          onConfirm={handleRename}
          onCancel={closeModal}
        />
      )}

      {(modal.type === 'tier' || modal.type === 'bulkTier') && (
        <TenantTierDialog
          tenantName={modal.tenant?.name || ''}
          currentTier={modal.tenant?.subscriptionTier || 'FREE'}
          currentOverride={modal.tenant?.tierOverride || null}
          isBulk={modal.type === 'bulkTier'}
          bulkCount={selectedIds.size}
          onConfirm={handleTierOverride}
          onRemoveOverride={modal.type === 'tier' && modal.tenant?.tierOverride ? handleRemoveOverride : undefined}
          onCancel={closeModal}
        />
      )}

      {(modal.type === 'trial' || modal.type === 'bulkTrial') && (
        <TenantTrialExtendDialog
          tenantName={modal.tenant?.name || ''}
          currentEndDate={modal.tenant?.trialEndDate || null}
          isBulk={modal.type === 'bulkTrial'}
          bulkCount={selectedIds.size}
          onConfirm={handleTrialExtend}
          onCancel={closeModal}
        />
      )}

      {(modal.type === 'archive' || modal.type === 'bulkArchive') && (
        <ArchiveConfirmDialog
          tenantName={modal.tenant?.name || ''}
          isBulk={modal.type === 'bulkArchive'}
          bulkCount={selectedIds.size}
          onConfirm={handleArchive}
          onCancel={closeModal}
        />
      )}

      {modal.type === 'restore' && modal.tenant && (
        <RestoreConfirmDialog
          tenantName={modal.tenant.name}
          onConfirm={handleRestore}
          onCancel={closeModal}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
