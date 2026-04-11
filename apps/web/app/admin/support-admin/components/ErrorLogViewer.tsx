'use client';

import { useState, useEffect } from 'react';
import { useErrors, ErrorFilters, ErrorLog } from '../hooks/useErrors';
import { useTenants, Tenant } from '../hooks/useTenants';
import { LevelBadge } from './LevelBadge';
import { ErrorDetails } from './ErrorDetails';

export function ErrorLogViewer() {
  const [filters, setFilters] = useState<ErrorFilters>({
    level: 'ALL',
    tenantId: null,
    statusCode: null,
    timeRange: '24h',
    search: '',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { errors, total, byLevel, availableStatusCodes, loading, error, lastUpdated, refresh } = useErrors(filters, 30000);
  const { tenants } = useTenants();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusCodeColor = (code: number | null) => {
    if (!code) return '#8888A0';
    if (code >= 500) return '#dc3545';
    if (code >= 400) return '#ffc107';
    if (code >= 300) return '#17a2b8';
    return '#28a745';
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return 'System';
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || tenantId.substring(0, 8) + '...';
  };

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #2A2A38',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.1rem' }}>Error Logs</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.8rem' }}>
            {total} errors in last {filters.timeRange === '24h' ? '24 hours' : filters.timeRange === '7d' ? '7 days' : '30 days'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Level Summary */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: '#4a0d0d',
                borderRadius: '4px',
              }}
            >
              <span style={{ color: '#dc3545', fontSize: '0.85rem', fontWeight: '600' }}>{byLevel.ERROR || 0}</span>
              <span style={{ color: '#dc3545', fontSize: '0.7rem' }}>ERR</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: '#4a3d0d',
                borderRadius: '4px',
              }}
            >
              <span style={{ color: '#ffc107', fontSize: '0.85rem', fontWeight: '600' }}>{byLevel.WARN || 0}</span>
              <span style={{ color: '#ffc107', fontSize: '0.7rem' }}>WARN</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                background: '#1a2a4a',
                borderRadius: '4px',
              }}
            >
              <span style={{ color: '#00CCEE', fontSize: '0.85rem', fontWeight: '600' }}>{byLevel.INFO || 0}</span>
              <span style={{ color: '#00CCEE', fontSize: '0.7rem' }}>INFO</span>
            </div>
          </div>
          {lastUpdated && (
            <span style={{ color: '#666680', fontSize: '0.75rem' }}>
              Updated {formatTime(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              background: '#2A2A38',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              color: '#F0F0F5',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #2A2A38',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Level Filter */}
        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value as ErrorFilters['level'] })}
          style={{
            padding: '0.5rem 1rem',
            background: '#13131A',
            border: '2px solid #2A2A38',
            borderRadius: '6px',
            color: '#F0F0F5',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">All Levels</option>
          <option value="ERROR">Error</option>
          <option value="WARN">Warning</option>
          <option value="INFO">Info</option>
        </select>

        {/* Tenant Filter */}
        <select
          value={filters.tenantId || ''}
          onChange={(e) => setFilters({ ...filters, tenantId: e.target.value || null })}
          style={{
            padding: '0.5rem 1rem',
            background: '#13131A',
            border: '2px solid #2A2A38',
            borderRadius: '6px',
            color: '#F0F0F5',
            fontSize: '0.9rem',
            cursor: 'pointer',
            minWidth: '150px',
          }}
        >
          <option value="">All Tenants</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>

        {/* Status Code Filter */}
        <select
          value={filters.statusCode?.toString() || ''}
          onChange={(e) => setFilters({ ...filters, statusCode: e.target.value ? parseInt(e.target.value) : null })}
          style={{
            padding: '0.5rem 1rem',
            background: '#13131A',
            border: '2px solid #2A2A38',
            borderRadius: '6px',
            color: '#F0F0F5',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="">All Status Codes</option>
          {availableStatusCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>

        {/* Time Range Filter */}
        <select
          value={filters.timeRange}
          onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as ErrorFilters['timeRange'] })}
          style={{
            padding: '0.5rem 1rem',
            background: '#13131A',
            border: '2px solid #2A2A38',
            borderRadius: '6px',
            color: '#F0F0F5',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>

        {/* Search */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search error messages..."
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              background: '#13131A',
              border: '2px solid #2A2A38',
              borderRadius: '6px',
              color: '#F0F0F5',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#dc3545',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>!</span>
          <p style={{ marginTop: '0.5rem' }}>{error}</p>
          <button
            onClick={refresh}
            style={{
              marginTop: '1rem',
              background: '#00CCEE',
              color: '#1C1C26',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#13131A' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', width: '30px' }}></th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Level</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Endpoint</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Tenant</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#8888A0', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Message</th>
              </tr>
            </thead>
            <tbody>
              {errors.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#8888A0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>+</div>
                    <div>No errors found matching your filters</div>
                  </td>
                </tr>
              )}
              {errors.map((err) => (
                <tbody key={err.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
                    style={{
                      borderTop: '1px solid #2A2A38',
                      cursor: 'pointer',
                      background: expandedId === err.id ? '#1a1a24' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#666680' }}>
                      <span style={{ fontSize: '0.75rem' }}>{expandedId === err.id ? 'v' : '>'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#8888A0', fontSize: '0.85rem' }}>
                      {formatTime(err.timestamp)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <LevelBadge level={err.level} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#F0F0F5', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {err.endpoint || '--'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#8888A0', fontSize: '0.85rem' }}>
                      {getTenantName(err.tenantId)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          color: getStatusCodeColor(err.statusCode),
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                      >
                        {err.statusCode || '--'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        color: '#F0F0F5',
                        fontSize: '0.85rem',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {err.message}
                    </td>
                  </tr>
                  {expandedId === err.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <ErrorDetails error={err} />
                      </td>
                    </tr>
                  )}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid #2A2A38',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: '#666680',
          fontSize: '0.75rem',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#28a745',
            animation: 'pulse 2s infinite',
          }}
        />
        Auto-refreshing every 30 seconds
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
