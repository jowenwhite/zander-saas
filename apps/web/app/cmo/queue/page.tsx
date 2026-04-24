'use client';
import { useState, useEffect, useCallback } from 'react';
import { CMOLayout, Card, Button, LoadingSpinner, EmptyState } from '../components';
import {
  CheckCircle,
  XCircle,
  Edit3,
  Clock,
  Calendar,
  MessageSquare,
  Image,
  ExternalLink,
} from 'lucide-react';

// Platform config with colors and icons
const platformConfig: Record<string, { color: string; icon: string; label: string }> = {
  facebook: { color: '#1877F2', icon: 'f', label: 'Facebook' },
  instagram: { color: '#E4405F', icon: '', label: 'Instagram' },
  linkedin: { color: '#0A66C2', icon: 'in', label: 'LinkedIn' },
  twitter: { color: '#1DA1F2', icon: '', label: 'Twitter/X' },
  tiktok: { color: '#000000', icon: '', label: 'TikTok' },
  youtube: { color: '#FF0000', icon: '', label: 'YouTube' },
};

// Status config
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)', label: 'Draft' },
  pending_approval: { color: '#F57C00', bg: 'rgba(245, 124, 0, 0.1)', label: 'Pending' },
  scheduled: { color: '#00CCEE', bg: 'rgba(0, 204, 238, 0.1)', label: 'Scheduled' },
  approved: { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)', label: 'Approved' },
  published: { color: '#28a745', bg: 'rgba(40, 167, 69, 0.15)', label: 'Published' },
  failed: { color: '#dc3545', bg: 'rgba(220, 53, 69, 0.1)', label: 'Failed' },
};

interface SocialPost {
  id: string;
  content: string;
  mediaUrls: string[];
  status: string;
  scheduledFor: string | null;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  socialAccount: {
    id: string;
    platform: string;
    accountName: string;
  };
  metadata?: {
    rejectionReason?: string;
  };
}

interface QueueResponse {
  posts: SocialPost[];
  total: number;
  pendingCount: number;
  draftCount: number;
}

export default function ApprovalQueuePage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [scheduleModal, setScheduleModal] = useState<SocialPost | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

  const fetchQueue = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${apiUrl}/cmo/social/posts/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: QueueResponse = await response.json();
        setPosts(data.posts);
        setPendingCount(data.pendingCount);
        setDraftCount(data.draftCount);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleApprove = async (postId: string) => {
    setActionLoading(postId);
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${apiUrl}/cmo/social/posts/${postId}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error approving post:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (postId: string) => {
    const reason = prompt('Rejection reason (optional):');
    setActionLoading(postId);
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${apiUrl}/cmo/social/posts/${postId}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm(`Approve all ${posts.length} posts?`)) return;
    setActionLoading('all');
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${apiUrl}/cmo/social/posts/approve-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      console.error('Error approving all:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    setActionLoading(editingPost.id);
    try {
      const token = localStorage.getItem('zander_token');
      const response = await fetch(`${apiUrl}/cmo/social/posts/${editingPost.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setEditingPost(null);
        fetchQueue();
      }
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSchedule = (post: SocialPost) => {
    setScheduleModal(post);
    if (post.scheduledFor) {
      const date = new Date(post.scheduledFor);
      setScheduleDate(date.toISOString().split('T')[0]);
      setScheduleTime(date.toTimeString().slice(0, 5));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setScheduleDate(tomorrow.toISOString().split('T')[0]);
      setScheduleTime('09:00');
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleModal) return;
    setActionLoading(scheduleModal.id);
    try {
      const token = localStorage.getItem('zander_token');
      const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      const response = await fetch(`${apiUrl}/cmo/social/posts/${scheduleModal.id}/schedule`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledFor }),
      });

      if (response.ok) {
        setScheduleModal(null);
        fetchQueue();
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const truncateContent = (content: string, maxLength = 140) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <CMOLayout>
        <LoadingSpinner message="Loading approval queue..." fullPage />
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#F0F0F5',
              margin: 0,
              marginBottom: '0.25rem',
            }}
          >
            Approval Queue
          </h1>
          <p style={{ color: '#8888A0', margin: 0 }}>
            Review and approve content before publishing
          </p>
        </div>
        {posts.length > 0 && (
          <Button
            variant="primary"
            onClick={handleApproveAll}
            disabled={actionLoading === 'all'}
          >
            <CheckCircle size={18} />
            Approve All ({posts.length})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 124, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={24} style={{ color: '#F57C00' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>Pending Approval</div>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(108, 117, 125, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={24} style={{ color: '#6c757d' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>
                {draftCount}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>Drafts</div>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(0, 204, 238, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MessageSquare size={24} style={{ color: '#00CCEE' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F0F0F5' }}>
                {posts.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#8888A0' }}>Total in Queue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CheckCircle size={48} style={{ color: '#28a745' }} />}
            title="Queue is Empty"
            description="No pending drafts. Ask Don to create content for you."
            action={
              <Button variant="primary" onClick={() => (window.location.href = '/cmo/don')}>
                Talk to Don
              </Button>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => {
            const platform = platformConfig[post.socialAccount?.platform] || {
              color: '#6c757d',
              icon: '?',
              label: 'Unknown',
            };
            const status = statusConfig[post.status] || statusConfig.draft;

            return (
              <Card key={post.id} padding="md">
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Platform Badge */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: platform.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {platform.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontWeight: '600',
                            color: '#F0F0F5',
                            fontSize: '0.9rem',
                          }}
                        >
                          {platform.label}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#8888A0' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p
                      style={{
                        color: '#F0F0F5',
                        margin: 0,
                        marginBottom: '0.75rem',
                        lineHeight: '1.5',
                        fontSize: '0.95rem',
                      }}
                    >
                      {truncateContent(post.content)}
                    </p>

                    {/* Media Thumbnails */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {post.mediaUrls.slice(0, 3).map((url, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              background: '#2A2A38',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={url}
                                alt={`Media ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Image size={24} style={{ color: '#8888A0' }} />
                            )}
                          </div>
                        ))}
                        {post.mediaUrls.length > 3 && (
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '8px',
                              background: '#2A2A38',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              color: '#8888A0',
                            }}
                          >
                            +{post.mediaUrls.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Schedule Info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#8888A0',
                        fontSize: '0.85rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <Calendar size={14} />
                      {formatDate(post.scheduledFor)}
                    </div>

                    {/* Rejection reason if any */}
                    {post.metadata?.rejectionReason && (
                      <div
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: 'rgba(220, 53, 69, 0.1)',
                          borderRadius: '6px',
                          marginBottom: '0.75rem',
                          fontSize: '0.8rem',
                          color: '#dc3545',
                        }}
                      >
                        Rejection reason: {post.metadata.rejectionReason}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(post.id)}
                        disabled={actionLoading === post.id}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(post)}
                        disabled={actionLoading === post.id}
                      >
                        <Edit3 size={16} />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSchedule(post)}
                        disabled={actionLoading === post.id}
                      >
                        <Calendar size={16} />
                        Schedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(post.id)}
                        disabled={actionLoading === post.id}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
          onClick={() => setEditingPost(null)}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Edit Post</h2>
              <button
                onClick={() => setEditingPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8888A0',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #2A2A38',
                  borderRadius: '8px',
                  background: '#09090F',
                  color: '#F0F0F5',
                  fontSize: '1rem',
                  resize: 'vertical',
                  marginBottom: '1rem',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="ghost" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveEdit}
                  disabled={actionLoading === editingPost.id}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
          onClick={() => setScheduleModal(null)}
        >
          <div
            style={{
              background: '#1C1C26',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.5rem',
                borderBottom: '1px solid #2A2A38',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ margin: 0, color: '#F0F0F5', fontSize: '1.25rem' }}>Schedule Post</h2>
              <button
                onClick={() => setScheduleModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8888A0',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: '600',
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    background: '#09090F',
                    color: '#F0F0F5',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#F0F0F5',
                    fontWeight: '600',
                  }}
                >
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #2A2A38',
                    borderRadius: '8px',
                    background: '#09090F',
                    color: '#F0F0F5',
                    fontSize: '1rem',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button variant="ghost" onClick={() => setScheduleModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveSchedule}
                  disabled={actionLoading === scheduleModal.id}
                >
                  Save Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CMOLayout>
  );
}
