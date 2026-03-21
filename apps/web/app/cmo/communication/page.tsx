'use client';
import { useState, useEffect } from 'react';
import CMOLayout from '../components/CMOLayout';

interface EmailMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  fromAddress: string;
  toAddress: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
  contact?: { id: string; firstName: string; lastName: string; email: string };
}

interface SmsMessage {
  id: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  body: string;
  status: string;
  sentAt: string;
  contact?: { id: string; firstName: string; lastName: string; phone: string };
}

export default function CMOCommunicationPage() {
  const [messageType, setMessageType] = useState<'email' | 'sms'>('email');
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [messageType]);

  async function fetchMessages() {
    setLoading(true);
    try {
      if (messageType === 'email') {
        const res = await fetch('https://api.zanderos.com/email/messages', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmails(data || []);
        }
      } else {
        const res = await fetch('https://api.zanderos.com/sms/messages', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('zander_token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSmsMessages(data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    background: active ? '#F57C00' : 'transparent',
    color: active ? 'white' : '#8888A0',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  return (
    <CMOLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5', margin: 0 }}>
              Marketing Communication
            </h1>
            <p style={{ color: '#8888A0', marginTop: '0.5rem' }}>
              View and manage your marketing messages
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#1C1C26', padding: '0.5rem', borderRadius: '12px', width: 'fit-content', border: '1px solid #2A2A38' }}>
          <button onClick={() => setMessageType('email')} style={tabStyle(messageType === 'email')}>Email</button>
          <button onClick={() => setMessageType('sms')} style={tabStyle(messageType === 'sms')}>SMS</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>Total {messageType === 'email' ? 'Emails' : 'SMS'}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F0F0F5' }}>
              {messageType === 'email' ? emails.length : smsMessages.length}
            </div>
          </div>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>Sent</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#28a745' }}>
              {messageType === 'email'
                ? emails.filter(e => e.direction === 'outbound').length
                : smsMessages.filter(s => s.direction === 'outbound').length}
            </div>
          </div>
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#8888A0', marginBottom: '0.5rem' }}>Received</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F57C00' }}>
              {messageType === 'email'
                ? emails.filter(e => e.direction === 'inbound').length
                : smsMessages.filter(s => s.direction === 'inbound').length}
            </div>
          </div>
        </div>

        {/* Messages List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#8888A0' }}>Loading messages...</div>
        ) : (messageType === 'email' ? emails : smsMessages).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{messageType === 'email' ? '📧' : '💬'}</div>
            <h3 style={{ color: '#F0F0F5', marginBottom: '0.5rem' }}>No messages yet</h3>
            <p style={{ color: '#8888A0' }}>Messages will appear here when you send or receive them</p>
          </div>
        ) : messageType === 'email' ? (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {/* Email List */}
            <div style={{ flex: '0 0 400px', background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', overflow: 'hidden' }}>
              {emails.map(email => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid #2A2A38',
                    cursor: 'pointer',
                    background: selectedEmail?.id === email.id ? '#13131A' : '#1C1C26'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', color: '#F0F0F5', fontSize: '0.9rem' }}>
                      {email.contact ? `${email.contact.firstName} ${email.contact.lastName}` : email.fromAddress}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8888A0' }}>{formatDate(email.sentAt)}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#F0F0F5', marginBottom: '0.25rem' }}>{email.subject}</div>
                  <div style={{ fontSize: '0.8rem', color: '#8888A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.body.substring(0, 80)}...
                  </div>
                </div>
              ))}
            </div>
            {/* Email Preview */}
            {selectedEmail && (
              <div style={{ flex: 1, background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 1rem', color: '#F0F0F5' }}>{selectedEmail.subject}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #2A2A38' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#F0F0F5' }}>From: {selectedEmail.fromAddress}</div>
                    <div style={{ fontSize: '0.9rem', color: '#8888A0' }}>To: {selectedEmail.toAddress}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8888A0' }}>{formatDate(selectedEmail.sentAt)}</div>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: '#F0F0F5', lineHeight: '1.6' }}>{selectedEmail.body}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: '#1C1C26', borderRadius: '12px', border: '1px solid #2A2A38', overflow: 'hidden' }}>
            {smsMessages.map(sms => (
              <div key={sms.id} style={{ padding: '1rem', borderBottom: '1px solid #2A2A38' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#F0F0F5' }}>
                    {sms.contact ? `${sms.contact.firstName} ${sms.contact.lastName}` : sms.direction === 'outbound' ? sms.toNumber : sms.fromNumber}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>{formatDate(sms.sentAt)}</span>
                </div>
                <div style={{ color: '#8888A0' }}>{sms.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CMOLayout>
  );
}
