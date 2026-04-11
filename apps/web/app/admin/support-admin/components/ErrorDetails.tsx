'use client';

import { ErrorLog } from '../hooks/useErrors';

interface ErrorDetailsProps {
  error: ErrorLog;
}

export function ErrorDetails({ error }: ErrorDetailsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        background: '#13131A',
        borderTop: '1px solid #2A2A38',
      }}
    >
      {/* Error Message */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
          Error Message
        </div>
        <div
          style={{
            background: '#1C1C26',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            color: '#dc3545',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            wordBreak: 'break-word',
          }}
        >
          {error.message}
        </div>
      </div>

      {/* Request Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Method
          </div>
          <div style={{ color: '#F0F0F5', fontWeight: '500' }}>{error.method || '--'}</div>
        </div>
        <div>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Status Code
          </div>
          <div
            style={{
              color: error.statusCode && error.statusCode >= 500 ? '#dc3545' : error.statusCode && error.statusCode >= 400 ? '#ffc107' : '#F0F0F5',
              fontWeight: '600',
            }}
          >
            {error.statusCode || '--'}
          </div>
        </div>
        <div>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Response Time
          </div>
          <div style={{ color: '#F0F0F5' }}>{error.responseTime ? `${error.responseTime}ms` : '--'}</div>
        </div>
        <div>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Timestamp
          </div>
          <div style={{ color: '#F0F0F5', fontSize: '0.85rem' }}>{formatDate(error.timestamp)}</div>
        </div>
      </div>

      {/* Stack Trace */}
      {error.stack && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Stack Trace
          </div>
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              color: '#8888A0',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error.stack}
          </div>
        </div>
      )}

      {/* Metadata */}
      {error.metadata && Object.keys(error.metadata).length > 0 && (
        <div>
          <div style={{ color: '#8888A0', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
            Additional Metadata
          </div>
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              color: '#8888A0',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              maxHeight: '150px',
              overflowY: 'auto',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(error.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* User and Tenant Info */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #2A2A38' }}>
        <div>
          <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>Tenant: </span>
          <span style={{ color: '#F0F0F5', fontSize: '0.85rem' }}>{error.tenantId || 'System'}</span>
        </div>
        {error.userId && (
          <div>
            <span style={{ color: '#8888A0', fontSize: '0.8rem' }}>User: </span>
            <span style={{ color: '#F0F0F5', fontSize: '0.85rem' }}>{error.userId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
