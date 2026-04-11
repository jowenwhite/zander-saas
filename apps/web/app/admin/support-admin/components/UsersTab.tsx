'use client';

import { useState } from 'react';
import { useEngagement, SegmentedTenant } from '../hooks/useEngagement';
import { SegmentCard } from './SegmentCard';
import { SegmentPanel } from './SegmentPanel';
import { ActionDialog } from './ActionDialog';
import { Toast } from './Toast';
import { ActionType } from './QuickActionDropdown';

interface DialogState {
  isOpen: boolean;
  tenant: SegmentedTenant | null;
  actionType: ActionType | null;
}

interface ToastState {
  isVisible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function UsersTab() {
  const { segments, loading, error, refetch, extendTrial } = useEngagement();
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({
    at_risk: true,
    power_users: true,
    churning: true,
  });
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, tenant: null, actionType: null });
  const [toast, setToast] = useState<ToastState>({ isVisible: false, message: '', type: 'success' });

  const handleAction = (tenant: SegmentedTenant, actionType: ActionType) => {
    setDialog({ isOpen: true, tenant, actionType });
  };

  const handleDialogClose = () => {
    setDialog({ isOpen: false, tenant: null, actionType: null });
  };

  const handleActionSuccess = (message: string) => {
    setToast({ isVisible: true, message, type: 'success' });
    refetch(); // Refresh data after action
  };

  const handleExtendTrial = async (tenantId: string, days: number): Promise<boolean> => {
    return extendTrial(tenantId, days);
  };

  const toggleSegment = (segment: string) => {
    setExpandedSegments((prev) => ({ ...prev, [segment]: !prev[segment] }));
  };

  if (loading && segments.at_risk.count === 0) {
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
          <div>Loading engagement data...</div>
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && segments.at_risk.count === 0) {
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
          <h3 style={{ margin: '1rem 0 0.5rem', color: '#F0F0F5' }}>Failed to Load Data</h3>
          <p style={{ color: '#8888A0', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={refetch}
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

  const totalIssues = segments.at_risk.count + segments.churning.count;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Header */}
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>User Engagement Dashboard</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
            Monitor tenant health and take proactive action to reduce churn
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {totalIssues > 0 && (
            <div
              style={{
                background: '#4a0d0d',
                border: '1px solid #dc3545',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '1.1rem' }}>{totalIssues}</span>
              <span style={{ color: '#dc3545', fontSize: '0.85rem' }}>tenants need attention</span>
            </div>
          )}
          <button
            onClick={refetch}
            style={{
              background: '#2A2A38',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              color: '#F0F0F5',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Segment Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
        }}
      >
        <SegmentCard
          title="At-Risk Tenants"
          count={segments.at_risk.count}
          icon="!"
          color="orange"
          description="Declining engagement (14-30 days inactive)"
          onClick={() => toggleSegment('at_risk')}
        />
        <SegmentCard
          title="Power Users"
          count={segments.power_users.count}
          icon="*"
          color="blue"
          description="High engagement, active within 7 days"
          onClick={() => toggleSegment('power_users')}
        />
        <SegmentCard
          title="Churning"
          count={segments.churning.count}
          icon="<"
          color="red"
          description="Critical risk, 30+ days inactive"
          onClick={() => toggleSegment('churning')}
        />
      </div>

      {/* At-Risk Segment Panel */}
      <SegmentPanel
        title="At-Risk Tenants"
        icon="!"
        segment="at_risk"
        tenants={segments.at_risk.tenants}
        onAction={handleAction}
        expanded={expandedSegments.at_risk}
        onToggleExpand={() => toggleSegment('at_risk')}
      />

      {/* Power Users Segment Panel */}
      <SegmentPanel
        title="Power Users"
        icon="*"
        segment="power_users"
        tenants={segments.power_users.tenants}
        onAction={handleAction}
        expanded={expandedSegments.power_users}
        onToggleExpand={() => toggleSegment('power_users')}
      />

      {/* Churning Segment Panel */}
      <SegmentPanel
        title="Churning Tenants"
        icon="<"
        segment="churning"
        tenants={segments.churning.tenants}
        onAction={handleAction}
        expanded={expandedSegments.churning}
        onToggleExpand={() => toggleSegment('churning')}
      />

      {/* Quick Stats Footer */}
      <div
        style={{
          background: '#1C1C26',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8888A0', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Total Segments</div>
          <div style={{ color: '#F0F0F5', fontWeight: '600', fontSize: '1.1rem' }}>
            {segments.at_risk.count + segments.power_users.count + segments.churning.count}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8888A0', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Healthy Rate</div>
          <div style={{ color: '#28a745', fontWeight: '600', fontSize: '1.1rem' }}>
            {segments.power_users.count > 0
              ? Math.round(
                  (segments.power_users.count /
                    (segments.at_risk.count + segments.power_users.count + segments.churning.count || 1)) *
                    100
                )
              : 0}
            %
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#8888A0', fontSize: '0.8rem', marginBottom: '0.25rem' }}>At Risk Rate</div>
          <div style={{ color: '#ffc107', fontWeight: '600', fontSize: '1.1rem' }}>
            {segments.at_risk.count + segments.churning.count > 0
              ? Math.round(
                  ((segments.at_risk.count + segments.churning.count) /
                    (segments.at_risk.count + segments.power_users.count + segments.churning.count || 1)) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      {dialog.isOpen && dialog.tenant && dialog.actionType && (
        <ActionDialog
          tenant={dialog.tenant}
          actionType={dialog.actionType}
          onClose={handleDialogClose}
          onSuccess={handleActionSuccess}
          onExtendTrial={handleExtendTrial}
        />
      )}

      {/* Toast Notification */}
      {toast.isVisible && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))} />
      )}
    </div>
  );
}
