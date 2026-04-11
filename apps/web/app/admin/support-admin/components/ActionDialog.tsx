'use client';

import { useState } from 'react';
import { SegmentedTenant } from '../hooks/useEngagement';
import { ActionType } from './QuickActionDropdown';

interface ActionDialogProps {
  tenant: SegmentedTenant;
  actionType: ActionType;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onExtendTrial: (tenantId: string, days: number) => Promise<boolean>;
}

const actionConfig: Record<ActionType, { title: string; description: string; buttonText: string; buttonColor: string }> = {
  reactivation_email: {
    title: 'Send Reactivation Email',
    description: 'Draft a reactivation email to re-engage this tenant.',
    buttonText: 'Draft Email',
    buttonColor: '#ffc107',
  },
  offer_discount: {
    title: 'Offer Discount',
    description: 'Draft a discount offer to encourage continued usage.',
    buttonText: 'Draft Offer',
    buttonColor: '#28a745',
  },
  extend_trial: {
    title: 'Extend Trial',
    description: 'Extend the trial period for this tenant.',
    buttonText: 'Extend Trial',
    buttonColor: '#00CCEE',
  },
  upgrade_offer: {
    title: 'Send Upgrade Offer',
    description: 'Draft an upgrade offer for this power user.',
    buttonText: 'Draft Offer',
    buttonColor: '#00CCEE',
  },
  schedule_demo: {
    title: 'Schedule Demo',
    description: 'Draft an email to schedule a product demo.',
    buttonText: 'Draft Email',
    buttonColor: '#9333ea',
  },
  feedback_survey: {
    title: 'Request Feedback',
    description: 'Draft a feedback request email.',
    buttonText: 'Draft Email',
    buttonColor: '#28a745',
  },
  winback_campaign: {
    title: 'Win-Back Campaign',
    description: 'Draft a win-back email to re-engage this churning tenant.',
    buttonText: 'Draft Campaign',
    buttonColor: '#dc3545',
  },
  exit_survey: {
    title: 'Send Exit Survey',
    description: 'Draft an exit survey to understand why they left.',
    buttonText: 'Draft Survey',
    buttonColor: '#ffc107',
  },
  view_tickets: {
    title: 'Support Tickets',
    description: 'View recent support tickets from this tenant.',
    buttonText: 'View Tickets',
    buttonColor: '#8888A0',
  },
};

export function ActionDialog({ tenant, actionType, onClose, onSuccess, onExtendTrial }: ActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [discountPercent, setDiscountPercent] = useState(20);
  const [tone, setTone] = useState<'supportive' | 'urgent' | 'offer'>('supportive');
  const [emailPreview, setEmailPreview] = useState('');

  const config = actionConfig[actionType];

  // Generate email preview based on action type
  const generatePreview = () => {
    switch (actionType) {
      case 'reactivation_email':
        return `Subject: We miss you at Zander!

Hi ${tenant.name} Team,

We noticed it's been a while since you've logged in to Zander. We wanted to reach out and see if there's anything we can help with.

${tone === 'supportive' ? `Our team is here to help you get the most out of your account. Would you like to schedule a quick call to discuss how we can better support your needs?` : ''}
${tone === 'urgent' ? `Your account has valuable data and workflows that you've set up. Don't let them go to waste - log in today to see what's new!` : ''}
${tone === 'offer' ? `As a thank you for being a customer, we'd like to offer you an exclusive discount to help you get back on track.` : ''}

Best,
The Zander Team`;

      case 'offer_discount':
        return `Subject: Exclusive ${discountPercent}% Discount for ${tenant.name}

Hi ${tenant.name} Team,

We value your business and want to make it easier for you to continue using Zander.

For a limited time, we're offering you ${discountPercent}% off your subscription.

Use code: WINBACK${discountPercent} at checkout.

Best,
The Zander Team`;

      case 'upgrade_offer':
        return `Subject: Unlock More with Zander Pro

Hi ${tenant.name} Team,

We've noticed you're getting great value from Zander! You're in the top tier of our most engaged users.

Ready to take it to the next level? Upgrade to Pro and unlock:
- Advanced AI features
- Priority support
- Unlimited integrations
- Custom workflows

As a power user, you qualify for a special upgrade discount.

Best,
The Zander Team`;

      case 'winback_campaign':
        return `Subject: We'd Love to Have You Back

Hi ${tenant.name} Team,

It's been ${tenant.daysInactive} days since we last saw you, and we miss you!

A lot has changed at Zander:
- New AI features that save hours of work
- Improved performance and reliability
- Better integrations with your favorite tools

Come back and see what's new. We'll make it worth your while.

Best,
The Zander Team`;

      case 'feedback_survey':
        return `Subject: Quick Question - Your Feedback Matters

Hi ${tenant.name} Team,

You're one of our most engaged users, and we'd love to hear your thoughts.

Could you take 2 minutes to share your feedback? Your insights help us build a better product for everyone.

[Survey Link]

Thank you for being an amazing customer!

Best,
The Zander Team`;

      case 'exit_survey':
        return `Subject: We're Sorry to See You Go

Hi ${tenant.name} Team,

We noticed you haven't been using Zander lately. We'd love to understand what happened.

Could you take a moment to share your feedback? It would really help us improve.

[Exit Survey Link]

Best wishes,
The Zander Team`;

      case 'schedule_demo':
        return `Subject: Let's Schedule a Demo

Hi ${tenant.name} Team,

As one of our most active users, we'd love to show you some advanced features you might not have discovered yet.

Would you be interested in a 15-minute demo call?

[Calendly Link]

Best,
The Zander Team`;

      default:
        return '';
    }
  };

  const handleAction = async () => {
    setLoading(true);

    try {
      if (actionType === 'extend_trial') {
        const success = await onExtendTrial(tenant.id, trialDays);
        if (success) {
          onSuccess(`Trial extended by ${trialDays} days for ${tenant.name}`);
          onClose();
        } else {
          alert('Failed to extend trial');
        }
      } else if (actionType === 'view_tickets') {
        // Just close - this would navigate to tickets tab filtered by tenant
        onSuccess(`Viewing tickets for ${tenant.name}`);
        onClose();
      } else {
        // For all draft actions (L3), show success message
        // In production, this would call the Zander API to create a draft
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
        onSuccess(`Draft created for ${tenant.name} - pending approval`);
        onClose();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
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
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #2A2A38',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>{config.title}</h2>
            <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>{config.description}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            x
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Tenant Info */}
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#F0F0F5', fontWeight: '600' }}>{tenant.name}</div>
                <div style={{ color: '#8888A0', fontSize: '0.85rem' }}>
                  {tenant.effectiveTier} • {tenant.userCount} users • Engagement: {tenant.engagementScore || 0}
                </div>
              </div>
              <div
                style={{
                  color: tenant.daysInactive > 30 ? '#dc3545' : tenant.daysInactive > 14 ? '#ffc107' : '#28a745',
                  fontWeight: '600',
                }}
              >
                {tenant.daysInactive}d inactive
              </div>
            </div>
          </div>

          {/* Action-specific options */}
          {actionType === 'extend_trial' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '600' }}>
                Extension Period
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTrialDays(days)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: `2px solid ${trialDays === days ? '#00CCEE' : '#2A2A38'}`,
                      borderRadius: '8px',
                      background: trialDays === days ? '#00CCEE22' : 'transparent',
                      color: trialDays === days ? '#00CCEE' : '#8888A0',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>
          )}

          {actionType === 'offer_discount' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '600' }}>
                Discount Percentage
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[10, 20, 30].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      border: `2px solid ${discountPercent === pct ? '#28a745' : '#2A2A38'}`,
                      borderRadius: '8px',
                      background: discountPercent === pct ? '#28a74522' : 'transparent',
                      color: discountPercent === pct ? '#28a745' : '#8888A0',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {actionType === 'reactivation_email' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '600' }}>
                Email Tone
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['supportive', 'urgent', 'offer'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      padding: '0.75rem 1rem',
                      border: `2px solid ${tone === t ? '#ffc107' : '#2A2A38'}`,
                      borderRadius: '8px',
                      background: tone === t ? '#ffc10722' : 'transparent',
                      color: tone === t ? '#ffc107' : '#8888A0',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email Preview (for draft actions) */}
          {actionType !== 'extend_trial' && actionType !== 'view_tickets' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#F0F0F5', fontWeight: '600' }}>
                Preview
              </label>
              <div
                style={{
                  background: '#13131A',
                  borderRadius: '8px',
                  padding: '1rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: '#8888A0',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                }}
              >
                {generatePreview()}
              </div>
            </div>
          )}

          {/* L3 Warning for drafts */}
          {actionType !== 'extend_trial' && actionType !== 'view_tickets' && (
            <div
              style={{
                background: '#4a3d0d',
                border: '1px solid #ffc107',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>!</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#ffc107', fontWeight: '600', fontSize: '0.9rem' }}>Draft Only (L3)</div>
                <div style={{ color: '#ccaa00', fontSize: '0.8rem' }}>
                  This action creates a draft. It will not be sent automatically.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid #2A2A38',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #2A2A38',
              borderRadius: '8px',
              background: 'transparent',
              color: '#8888A0',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: config.buttonColor,
              color: config.buttonColor === '#ffc107' ? '#13131A' : '#F0F0F5',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing...' : config.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
