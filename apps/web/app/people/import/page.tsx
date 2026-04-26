'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zanderos.com';

type FileType = 'vcf' | 'csv' | 'xlsx';
type DuplicateStrategy = 'skip' | 'update' | 'import';
type ContactRole = 'CLIENT' | 'VENDOR' | 'TEAM' | 'PARTNER' | 'REFERRAL';

interface SuggestedMapping { sourceField: string; targetField: string }

interface ParseResult {
  fileType: FileType;
  totalRecords: number;
  detectedFields: string[];
  suggestedMapping: SuggestedMapping[];
  preview: MappedContact[];
  rawData: MappedContact[];
  rawRows?: Record<string, string>[];
}

interface MappedContact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  notes?: string;
  source?: string;
  primaryRole?: ContactRole;
  [key: string]: string | undefined;
}

interface DuplicateRecord {
  importRecord: MappedContact;
  existingId: string;
  existingEmail?: string;
  matchReason: string;
}

interface DuplicateCheckResult {
  newContacts: MappedContact[];
  duplicates: DuplicateRecord[];
  partialMatches: DuplicateRecord[];
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: { record: number; reason: string }[];
}

const TARGET_FIELDS = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'company', label: 'Company' },
  { value: 'title', label: 'Job Title' },
  { value: 'notes', label: 'Notes' },
  { value: 'skip', label: '— Skip this field —' },
];

const ROLE_OPTIONS: { value: ContactRole; label: string }[] = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'TEAM', label: 'Team Member' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'REFERRAL', label: 'Referral' },
];

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('zander_token');
  return { Authorization: `Bearer ${token}` };
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ['Upload', 'Map Fields', 'Preview', 'Importing', 'Complete'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem' }}>
      {steps.map((label, idx) => {
        const num = idx + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#27AE60' : active ? '#00CCEE' : '#2A2A38',
                color: done || active ? '#13131A' : '#8888A0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: '0.7rem', color: active ? '#00CCEE' : '#8888A0', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#27AE60' : '#2A2A38', margin: '0 8px', marginBottom: 20 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Upload ───────────────────────────────────────────────────────────
function UploadStep({ onParsed }: { onParsed: (result: ParseResult) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/contacts/import/parse`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Parse failed');
      if (data.totalRecords === 0) throw new Error('No contacts found in this file.');
      onParsed(data);
    } catch (e: any) {
      setError(e.message || 'Failed to parse file. Please try a different file.');
    } finally {
      setLoading(false);
    }
  }, [onParsed]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background: dragOver ? 'rgba(0,204,238,0.05)' : 'white',
          border: `2px dashed ${dragOver ? '#00CCEE' : '#dee2e6'}`,
          borderRadius: 12,
          padding: '3rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          marginBottom: '1.5rem',
        }}
      >
        {loading ? (
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#8888A0', margin: 0 }}>Parsing your file…</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
            <h3 style={{ color: '#13131A', margin: '0 0 0.5rem 0' }}>Drop Your File Here</h3>
            <p style={{ color: '#8888A0', margin: '0 0 1.5rem 0', fontSize: '0.9rem' }}>
              Supports .vcf (vCard), .csv, .xlsx, and .xls — up to 10MB
            </p>
            <input type="file" id="import-file" accept=".csv,.xlsx,.xls,.vcf" onChange={handleSelect} style={{ display: 'none' }} />
            <button
              onClick={() => document.getElementById('import-file')?.click()}
              style={{ padding: '0.75rem 2rem', background: '#00CCEE', color: '#13131A', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
            >
              Browse Files
            </button>
          </>
        )}
      </div>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: '#E74C3C', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Field Mapping ─────────────────────────────────────────────────────
function MappingStep({
  parseResult,
  onConfirm,
  onBack,
}: {
  parseResult: ParseResult;
  onConfirm: (mapping: SuggestedMapping[], contacts: MappedContact[]) => void;
  onBack: () => void;
}) {
  const [mapping, setMapping] = useState<SuggestedMapping[]>(parseResult.suggestedMapping);

  const updateTarget = (sourceField: string, targetField: string) => {
    setMapping(prev => prev.map(m => m.sourceField === sourceField ? { ...m, targetField } : m));
  };

  const isValid = () => {
    const targets = mapping.map(m => m.targetField).filter(t => t !== 'skip');
    return targets.includes('firstName') || targets.includes('email');
  };

  const applyMapping = (): MappedContact[] => {
    const rows = parseResult.rawRows ?? (parseResult.rawData as unknown as Record<string, string>[]);
    return rows.map(row => {
      const contact: MappedContact = { source: `import:${parseResult.fileType}`, primaryRole: 'CLIENT' };
      let fullName: string | undefined;
      for (const m of mapping) {
        if (m.targetField === 'skip') continue;
        const val = (row[m.sourceField] ?? '').trim();
        if (!val) continue;
        if (m.targetField === 'fullName') { fullName = val; continue; }
        contact[m.targetField] = val;
      }
      if (!contact.firstName && fullName) {
        const parts = fullName.trim().split(/\s+/);
        contact.firstName = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(' ');
        if (!contact.lastName) contact.lastName = parts.length > 1 ? parts[parts.length - 1] : '';
      }
      if (!contact.lastName) contact.lastName = '';
      return contact;
    }).filter(c => c.firstName || c.email);
  };

  const preview = parseResult.preview;

  return (
    <div>
      <p style={{ color: '#8888A0', marginBottom: '1.5rem' }}>
        We detected <strong style={{ color: '#13131A' }}>{parseResult.totalRecords}</strong> contacts from your <strong style={{ color: '#13131A' }}>.{parseResult.fileType}</strong> file.
        Confirm how each column maps to Zander contact fields.
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#8888A0', fontWeight: 600 }}>Source Column</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#8888A0', fontWeight: 600 }}>Maps To</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', color: '#8888A0', fontWeight: 600 }}>Sample Data</th>
            </tr>
          </thead>
          <tbody>
            {mapping.map((m, idx) => (
              <tr key={m.sourceField} style={{ borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 500, color: '#13131A' }}>{m.sourceField}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <select
                    value={m.targetField}
                    onChange={e => updateTarget(m.sourceField, e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', border: '2px solid #dee2e6', borderRadius: 6, fontSize: '0.9rem', background: 'white' }}
                  >
                    {TARGET_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#8888A0' }}>
                  {preview.slice(0, 3).map((row, i) => (
                    <span key={i} style={{ display: 'block' }}>{(row as any)[m.sourceField] || row[m.targetField] || '—'}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isValid() && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(240,179,35,0.1)', border: '1px solid rgba(240,179,35,0.4)', borderRadius: 8, color: '#B8860B', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Map at least <strong>First Name</strong> or <strong>Email</strong> to continue.
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ padding: '0.75rem 1.5rem', border: '2px solid #dee2e6', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
          ← Back
        </button>
        <button
          onClick={() => onConfirm(mapping, applyMapping())}
          disabled={!isValid()}
          style={{ padding: '0.75rem 1.5rem', background: isValid() ? '#00CCEE' : '#dee2e6', color: '#13131A', border: 'none', borderRadius: 8, cursor: isValid() ? 'pointer' : 'not-allowed', fontWeight: 700 }}
        >
          Preview Contacts →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Preview & Dedup ──────────────────────────────────────────────────
function PreviewStep({
  contacts,
  fileType,
  onImport,
  onBack,
}: {
  contacts: MappedContact[];
  fileType: FileType;
  onImport: (strategy: DuplicateStrategy, role: ContactRole, dupResult: DuplicateCheckResult) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [dupResult, setDupResult] = useState<DuplicateCheckResult | null>(null);
  const [strategy, setStrategy] = useState<DuplicateStrategy>('skip');
  const [role, setRole] = useState<ContactRole>('CLIENT');
  const [error, setError] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [showDupList, setShowDupList] = useState(false);
  const [showPartialList, setShowPartialList] = useState(false);

  const checkDuplicates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/contacts/import/check-duplicates`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Duplicate check failed');
      setDupResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [contacts]);

  if (!dupResult && !loading && !error) {
    checkDuplicates();
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#8888A0' }}>Checking for duplicates…</div>;
  }

  if (error) {
    return (
      <div>
        <div style={{ padding: '1rem', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: '#E74C3C', marginBottom: '1rem' }}>{error}</div>
        <button onClick={onBack} style={{ padding: '0.75rem 1.5rem', border: '2px solid #dee2e6', borderRadius: 8, background: 'white', cursor: 'pointer' }}>← Back</button>
      </div>
    );
  }

  if (!dupResult) return null;

  const totalToImport = dupResult.newContacts.length + (strategy !== 'skip' ? dupResult.duplicates.length + dupResult.partialMatches.length : 0);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowNewList(v => !v)} style={{ padding: '1.25rem', background: 'rgba(39,174,96,0.08)', border: '2px solid rgba(39,174,96,0.3)', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#27AE60' }}>{dupResult.newContacts.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#27AE60', fontWeight: 600 }}>New Contacts</div>
        </button>
        <button onClick={() => setShowDupList(v => !v)} style={{ padding: '1.25rem', background: 'rgba(240,179,35,0.08)', border: '2px solid rgba(240,179,35,0.3)', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#B8860B' }}>{dupResult.duplicates.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#B8860B', fontWeight: 600 }}>Duplicates (email)</div>
        </button>
        <button onClick={() => setShowPartialList(v => !v)} style={{ padding: '1.25rem', background: 'rgba(231,76,60,0.08)', border: '2px solid rgba(231,76,60,0.3)', borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E74C3C' }}>{dupResult.partialMatches.length}</div>
          <div style={{ fontSize: '0.85rem', color: '#E74C3C', fontWeight: 600 }}>Partial Matches</div>
        </button>
      </div>

      {/* Expandable lists */}
      {showNewList && dupResult.newContacts.length > 0 && (
        <ContactMiniList title="New Contacts" contacts={dupResult.newContacts} color="#27AE60" />
      )}
      {showDupList && dupResult.duplicates.length > 0 && (
        <ContactMiniList title="Duplicates" contacts={dupResult.duplicates.map(d => d.importRecord)} color="#B8860B" note="Matched by email" />
      )}
      {showPartialList && dupResult.partialMatches.length > 0 && (
        <ContactMiniList title="Partial Matches" contacts={dupResult.partialMatches.map(d => d.importRecord)} color="#E74C3C" note="Matched by name + phone" />
      )}

      {/* Duplicate strategy */}
      {(dupResult.duplicates.length > 0 || dupResult.partialMatches.length > 0) && (
        <div style={{ background: 'white', border: '2px solid #dee2e6', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, color: '#13131A', marginBottom: '0.75rem' }}>How should we handle duplicates?</div>
          {([
            { value: 'skip', label: 'Skip duplicates', sub: 'Only import new contacts' },
            { value: 'update', label: 'Update existing', sub: 'Overwrite existing contact fields' },
            { value: 'import', label: 'Import anyway', sub: 'Create new contacts even if duplicates exist' },
          ] as const).map(opt => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="strategy" value={opt.value} checked={strategy === opt.value} onChange={() => setStrategy(opt.value)} style={{ marginTop: 3 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#13131A' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Role assignment */}
      <div style={{ background: 'white', border: '2px solid #dee2e6', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 600, color: '#13131A', marginBottom: '0.5rem' }}>Assign role to all imported contacts</div>
        <select
          value={role}
          onChange={e => setRole(e.target.value as ContactRole)}
          style={{ padding: '0.5rem 0.75rem', border: '2px solid #dee2e6', borderRadius: 6, fontSize: '0.9rem', background: 'white' }}
        >
          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ padding: '0.75rem 1.5rem', border: '2px solid #dee2e6', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
          ← Back
        </button>
        <button
          onClick={() => onImport(strategy, role, dupResult)}
          disabled={totalToImport === 0}
          style={{ padding: '0.75rem 1.5rem', background: totalToImport > 0 ? '#00CCEE' : '#dee2e6', color: '#13131A', border: 'none', borderRadius: 8, cursor: totalToImport > 0 ? 'pointer' : 'not-allowed', fontWeight: 700 }}
        >
          Import {totalToImport} Contact{totalToImport !== 1 ? 's' : ''} →
        </button>
      </div>
    </div>
  );
}

function ContactMiniList({ title, contacts, color, note }: { title: string; contacts: MappedContact[]; color: string; note?: string }) {
  return (
    <div style={{ background: 'white', border: `2px solid ${color}30`, borderRadius: 8, marginBottom: '1rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.5rem 1rem', background: `${color}10`, fontWeight: 600, fontSize: '0.85rem', color, display: 'flex', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {note && <span style={{ fontWeight: 400 }}>{note}</span>}
      </div>
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {contacts.slice(0, 50).map((c, i) => (
          <div key={i} style={{ padding: '0.5rem 1rem', borderTop: '1px solid #f0f0f0', fontSize: '0.85rem', display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#13131A', fontWeight: 500 }}>{c.firstName} {c.lastName}</span>
            <span style={{ color: '#8888A0' }}>{c.email || c.phone || c.company || ''}</span>
          </div>
        ))}
        {contacts.length > 50 && <div style={{ padding: '0.5rem 1rem', color: '#8888A0', fontSize: '0.8rem' }}>+{contacts.length - 50} more</div>}
      </div>
    </div>
  );
}

// ─── Step 4: Importing ────────────────────────────────────────────────────────
function ImportingStep({
  contacts,
  strategy,
  role,
  fileType,
  onComplete,
}: {
  contacts: MappedContact[];
  strategy: DuplicateStrategy;
  role: ContactRole;
  fileType: FileType;
  onComplete: (result: ImportResult) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const runImport = useCallback(async () => {
    if (started) return;
    setStarted(true);
    try {
      const res = await fetch(`${API_URL}/contacts/import/execute`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, duplicateStrategy: strategy, defaultRole: role, fileType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed');
      onComplete(data);
    } catch (e: any) {
      setError(e.message);
    }
  }, [contacts, strategy, role, fileType, onComplete, started]);

  if (!started) runImport();

  if (error) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, color: '#E74C3C' }}>
        Import failed: {error}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
      <h3 style={{ color: '#13131A', marginBottom: '0.5rem' }}>Importing {contacts.length} contacts…</h3>
      <p style={{ color: '#8888A0', margin: 0 }}>This will only take a moment.</p>
      <div style={{ marginTop: '1.5rem', height: 8, background: '#dee2e6', borderRadius: 4, overflow: 'hidden', maxWidth: 400, margin: '1.5rem auto 0' }}>
        <div style={{ height: '100%', background: '#00CCEE', width: '60%', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ─── Step 5: Complete ─────────────────────────────────────────────────────────
function CompleteStep({ result, onReset }: { result: ImportResult; onReset: () => void }) {
  const router = useRouter();
  const [showErrors, setShowErrors] = useState(false);
  const total = result.imported + result.updated + result.skipped;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ color: '#13131A', marginBottom: '0.5rem' }}>Import Complete!</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(39,174,96,0.08)', border: '2px solid rgba(39,174,96,0.3)', borderRadius: 10 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#27AE60' }}>{result.imported}</div>
          <div style={{ fontSize: '0.85rem', color: '#27AE60' }}>Imported</div>
        </div>
        {result.updated > 0 && (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,86,135,0.08)', border: '2px solid rgba(0,86,135,0.3)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#005687' }}>{result.updated}</div>
            <div style={{ fontSize: '0.85rem', color: '#005687' }}>Updated</div>
          </div>
        )}
        {result.skipped > 0 && (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(240,179,35,0.08)', border: '2px solid rgba(240,179,35,0.3)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#B8860B' }}>{result.skipped}</div>
            <div style={{ fontSize: '0.85rem', color: '#B8860B' }}>Skipped</div>
          </div>
        )}
        {result.errors.length > 0 && (
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(231,76,60,0.08)', border: '2px solid rgba(231,76,60,0.3)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#E74C3C' }}>{result.errors.length}</div>
            <div style={{ fontSize: '0.85rem', color: '#E74C3C' }}>Errors</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.push('/people')}
          style={{ padding: '0.75rem 2rem', background: '#00CCEE', color: '#13131A', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
        >
          View Contacts →
        </button>
        <button
          onClick={onReset}
          style={{ padding: '0.75rem 1.5rem', border: '2px solid #dee2e6', borderRadius: 8, background: 'white', cursor: 'pointer' }}
        >
          Import More
        </button>
      </div>
      {result.errors.length > 0 && (
        <div>
          <button
            onClick={() => setShowErrors(v => !v)}
            style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
          >
            {showErrors ? 'Hide' : 'Show'} {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
          </button>
          {showErrors && (
            <div style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 8, overflow: 'hidden' }}>
              {result.errors.map((err, i) => (
                <div key={i} style={{ padding: '0.5rem 1rem', borderTop: i > 0 ? '1px solid rgba(231,76,60,0.1)' : 'none', fontSize: '0.85rem' }}>
                  <strong>Row {err.record}:</strong> <span style={{ color: '#E74C3C' }}>{err.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Export instruction cards ─────────────────────────────────────────────────
const EXPORT_SOURCES = [
  {
    id: 'iphone',
    icon: '📱',
    title: 'iPhone Contacts',
    subtitle: 'Export from iCloud and import here',
    steps: [
      'On your Mac: Open the Contacts app → Select All (Cmd+A) → File → Export vCard',
      'On iPhone/iCloud: Go to icloud.com/contacts → Select All → click the gear icon → Export vCard',
      'Drop the .vcf file in the upload zone above to import',
    ],
  },
  {
    id: 'android',
    icon: '🤖',
    title: 'Android / Google Contacts',
    subtitle: 'Export from Google and import here',
    steps: [
      'Go to contacts.google.com in your browser',
      'Click Export in the left sidebar',
      'Select "vCard (for iOS Contacts)" format and download',
      'Drop the .vcf file in the upload zone above to import',
    ],
    note: 'Already connected Google Contacts? Your contacts sync automatically.',
  },
  {
    id: 'outlook',
    icon: '🔵',
    title: 'Outlook Contacts',
    subtitle: 'Export from Outlook and import here',
    steps: [
      'Open Outlook → click People (the contacts icon)',
      'Click Manage Contacts → Export Contacts',
      'Choose "All Contacts" and CSV format, then save the file',
      'Drop the .csv file in the upload zone above to import',
    ],
  },
];

function ExportGuideSection() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div style={{ background: '#13131A', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ color: '#F0F0F5', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
        How to export from your device
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {EXPORT_SOURCES.map(source => (
          <div key={source.id} style={{ background: '#1C1C26', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setExpanded(expanded === source.id ? null : source.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#2A2A38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                {source.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#F0F0F5', fontSize: '0.95rem' }}>{source.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#8888A0' }}>{source.subtitle}</div>
              </div>
              <div style={{ color: '#8888A0', fontSize: '0.85rem' }}>{expanded === source.id ? '▲' : '▼'}</div>
            </button>
            {expanded === source.id && (
              <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #2A2A38' }}>
                <ol style={{ margin: '1rem 0 0', paddingLeft: '1.25rem', color: '#8888A0', fontSize: '0.875rem', lineHeight: 1.7 }}>
                  {source.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
                {source.note && (
                  <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(0,204,238,0.08)', borderRadius: 6, fontSize: '0.8rem', color: '#00CCEE' }}>
                    💡 {source.note}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ImportContactsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mappedContacts, setMappedContacts] = useState<MappedContact[]>([]);
  const [dupResult, setDupResult] = useState<DuplicateCheckResult | null>(null);
  const [importStrategy, setImportStrategy] = useState<DuplicateStrategy>('skip');
  const [importRole, setImportRole] = useState<ContactRole>('CLIENT');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setStep(1);
    setParseResult(null);
    setMappedContacts([]);
    setDupResult(null);
    setImportResult(null);
  };

  return (
    <AuthGuard>
      <div style={{ minHeight: '100vh', background: '#1C1C26' }}>
        <NavBar activeModule="cro" />
        <main style={{ marginTop: '64px', padding: '2rem', maxWidth: '860px', margin: '64px auto 0' }}>
          <button
            onClick={() => router.push('/people')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#8888A0', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}
          >
            ← Back to Contacts
          </button>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#F0F0F5', margin: '0 0 0.5rem 0' }}>Import Contacts</h1>
            <p style={{ color: '#8888A0', margin: 0 }}>Bring your existing contacts into Zander from any app or file.</p>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            <StepIndicator current={step} />

            {step === 1 && (
              <UploadStep
                onParsed={result => {
                  setParseResult(result);
                  // Skip mapping step for vCard — auto-mapping is always confident
                  if (result.fileType === 'vcf') {
                    setMappedContacts(result.rawData);
                    setStep(3);
                  } else {
                    setStep(2);
                  }
                }}
              />
            )}

            {step === 2 && parseResult && (
              <MappingStep
                parseResult={parseResult}
                onConfirm={(_, contacts) => { setMappedContacts(contacts); setStep(3); }}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <PreviewStep
                contacts={mappedContacts}
                fileType={parseResult?.fileType || 'csv'}
                onImport={(strategy, role, dup) => {
                  setImportStrategy(strategy);
                  setImportRole(role);
                  setDupResult(dup);
                  // Combine all contacts based on strategy for execute call
                  const toImport = [
                    ...dup.newContacts,
                    ...(strategy !== 'skip' ? dup.duplicates.map(d => d.importRecord) : []),
                    ...(strategy !== 'skip' ? dup.partialMatches.map(d => d.importRecord) : []),
                  ];
                  setMappedContacts(toImport);
                  setStep(4);
                }}
                onBack={() => setStep(parseResult?.fileType === 'vcf' ? 1 : 2)}
              />
            )}

            {step === 4 && (
              <ImportingStep
                contacts={mappedContacts}
                strategy={importStrategy}
                role={importRole}
                fileType={parseResult?.fileType || 'csv'}
                onComplete={result => { setImportResult(result); setStep(5); }}
              />
            )}

            {step === 5 && importResult && (
              <CompleteStep result={importResult} onReset={reset} />
            )}
          </div>

          {step === 1 && <ExportGuideSection />}
        </main>
      </div>
    </AuthGuard>
  );
}
