'use client';
import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { CMOLayout, Button, EmptyState, LoadingSpinner } from '../components';
import StorageIndicator from './components/StorageIndicator';
import UploadModal from './components/UploadModal';
import AssetCard from './components/AssetCard';
import AssetPreviewModal from './components/AssetPreviewModal';
import FolderFilter from './components/FolderFilter';
import SearchBar from './components/SearchBar';
import { Asset, StorageInfo, FoldersResponse } from './types';

export default function CMOAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [foldersData, setFoldersData] = useState<FoldersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Filters
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAssets = useCallback(async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const params = new URLSearchParams();
      if (activeFolder) params.append('folder', activeFolder);
      if (activeType) params.append('assetType', activeType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${apiUrl}/cmo/assets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }, [activeFolder, activeType, searchQuery]);

  const fetchStorageInfo = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/assets/storage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      }
    } catch (error) {
      console.error('Error fetching storage info:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/assets/folders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFoldersData(data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchAssets(), fetchStorageInfo(), fetchFolders()]).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Sort assets
  const sortedAssets = [...assets].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return (b.fileSize || 0) - (a.fileSize || 0);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleUpload = async (file: File, folder: string, description: string, tags: string[]) => {
    setIsUploading(true);
    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (description) formData.append('description', description);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

      const response = await fetch(`${apiUrl}/cmo/assets/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        showToast('Asset uploaded successfully!');
        setShowUploadModal(false);
        fetchAssets();
        fetchStorageInfo();
        fetchFolders();
      } else {
        const error = await response.json();
        showToast(error.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Error uploading asset:', error);
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL copied to clipboard!');
  };

  const handleDownload = (asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      const token = localStorage.getItem('zander_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

      const response = await fetch(`${apiUrl}/cmo/assets/${asset.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast('Asset deleted successfully!');
        setSelectedAsset(null);
        fetchAssets();
        fetchStorageInfo();
        fetchFolders();
      } else {
        showToast('Failed to delete asset', 'error');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      showToast('Failed to delete asset', 'error');
    }
  };

  if (loading) {
    return (
      <CMOLayout>
        <div style={loadingContainerStyle}>
          <LoadingSpinner />
        </div>
      </CMOLayout>
    );
  }

  return (
    <CMOLayout>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          ...toastStyle,
          backgroundColor: toast.type === 'success' ? '#10B981' : '#EF4444',
        }}>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Brand Assets</h1>
          <p style={subtitleStyle}>
            Manage your brand library and media
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUploadModal(true)}
          disabled={!storageInfo?.canUpload}
        >
          + Upload Asset
        </Button>
      </div>

      {/* Storage Indicator */}
      <div style={{ marginBottom: '1.5rem' }}>
        <StorageIndicator storageInfo={storageInfo} />
      </div>

      {/* Filters Row */}
      <div style={filtersRowStyle}>
        <FolderFilter
          folders={foldersData?.folders || []}
          total={foldersData?.total || 0}
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
        />
      </div>

      {/* Search and Sort */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          onSearchChange={setSearchQuery}
          onTypeChange={setActiveType}
          onSortChange={setSortBy}
          activeType={activeType}
          activeSort={sortBy}
        />
      </div>

      {/* Assets Grid */}
      {sortedAssets.length === 0 ? (
        <div style={emptyContainerStyle}>
          <EmptyState
            icon="🎨"
            title={searchQuery || activeFolder || activeType ? "No assets found" : "No assets yet"}
            description={
              searchQuery || activeFolder || activeType
                ? "Try adjusting your filters or search query"
                : "Upload your first asset to get started with your brand library"
            }
            action={
              !searchQuery && !activeFolder && !activeType && (
                <Button variant="primary" onClick={() => setShowUploadModal(true)}>
                  + Upload Asset
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div style={gridStyle}>
          {sortedAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onCopyUrl={handleCopyUrl}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onClick={setSelectedAsset}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onCopyUrl={handleCopyUrl}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </CMOLayout>
  );
}

const loadingContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

const titleStyle: CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  color: 'var(--zander-navy)',
  margin: 0,
  marginBottom: '0.25rem',
};

const subtitleStyle: CSSProperties = {
  color: 'var(--zander-gray)',
  margin: 0,
};

const filtersRowStyle: CSSProperties = {
  marginBottom: '1rem',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '1.5rem',
};

const emptyContainerStyle: CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid var(--zander-border-gray)',
  padding: '3rem',
};

const toastStyle: CSSProperties = {
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  padding: '1rem 1.5rem',
  borderRadius: '8px',
  color: 'white',
  fontWeight: '500',
  zIndex: 1200,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
