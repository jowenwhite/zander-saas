'use client';
import { useState, useCallback, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';

interface ProductImportRow {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  type?: string;
  status?: string;
  basePrice?: string | number;
  unit?: string;
  costOfGoods?: string | number;
  pricingModel?: string;
}

interface ValidationResult {
  row: number;
  data: ProductImportRow;
  errors: string[];
  warnings: string[];
  isDuplicate: boolean;
  existingProductId?: string;
}

interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  hasWarnings: number;
}

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  details: Array<{
    row: number;
    name: string;
    status: 'imported' | 'updated' | 'skipped' | 'error';
    message?: string;
  }>;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

// Styles
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'var(--zander-off-white)',
  },
  main: {
    marginTop: '64px',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '64px auto 0',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    color: 'var(--zander-gray)',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--zander-navy)',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: 'var(--zander-gray)',
    margin: 0,
    fontSize: '1rem',
  },
  card: {
    background: 'white',
    border: '1px solid var(--zander-border-gray)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  dropzone: {
    border: '2px dashed var(--zander-border-gray)',
    borderRadius: '12px',
    padding: '3rem',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  dropzoneActive: {
    border: '2px dashed var(--zander-red)',
    background: 'rgba(191, 10, 48, 0.05)',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    background: 'var(--zander-red)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    color: 'var(--zander-navy)',
    border: '1px solid var(--zander-border-gray)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  successButton: {
    padding: '0.75rem 1.5rem',
    background: '#27AE60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.85rem',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left' as const,
    borderBottom: '2px solid var(--zander-border-gray)',
    background: 'var(--zander-off-white)',
    fontWeight: '600',
    color: 'var(--zander-navy)',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid var(--zander-border-gray)',
    color: 'var(--zander-gray)',
  },
  errorRow: {
    background: 'rgba(231, 76, 60, 0.05)',
  },
  warningRow: {
    background: 'rgba(241, 196, 15, 0.05)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  errorBadge: {
    background: 'rgba(231, 76, 60, 0.1)',
    color: '#E74C3C',
  },
  warningBadge: {
    background: 'rgba(241, 196, 15, 0.2)',
    color: '#B7950B',
  },
  duplicateBadge: {
    background: 'rgba(52, 152, 219, 0.1)',
    color: '#3498DB',
  },
  validBadge: {
    background: 'rgba(39, 174, 96, 0.1)',
    color: '#27AE60',
  },
  progressContainer: {
    background: 'var(--zander-off-white)',
    borderRadius: '8px',
    height: '8px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressBar: {
    height: '100%',
    background: 'var(--zander-red)',
    transition: 'width 0.3s ease',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  summaryCard: {
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  summaryNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: 'var(--zander-gray)',
  },
};

function parseCSV(text: string): ProductImportRow[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Map common header variations
  const headerMap: Record<string, string> = {
    'name': 'name',
    'product name': 'name',
    'productname': 'name',
    'title': 'name',
    'description': 'description',
    'desc': 'description',
    'sku': 'sku',
    'product sku': 'sku',
    'code': 'sku',
    'category': 'category',
    'type': 'type',
    'product type': 'type',
    'producttype': 'type',
    'status': 'status',
    'price': 'basePrice',
    'baseprice': 'basePrice',
    'base price': 'basePrice',
    'unit price': 'basePrice',
    'unitprice': 'basePrice',
    'unit': 'unit',
    'uom': 'unit',
    'cost': 'costOfGoods',
    'costofgoods': 'costOfGoods',
    'cost of goods': 'costOfGoods',
    'cogs': 'costOfGoods',
    'pricingmodel': 'pricingModel',
    'pricing model': 'pricingModel',
    'pricing': 'pricingModel',
  };

  const normalizedHeaders = headers.map(h => headerMap[h] || h);

  // Parse rows
  const rows: ProductImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: ProductImportRow = { name: '' };
    for (let j = 0; j < normalizedHeaders.length && j < values.length; j++) {
      const header = normalizedHeaders[j];
      const value = values[j]?.trim();
      if (header && value !== undefined) {
        (row as any)[header] = value;
      }
    }

    // Only include rows with a name
    if (row.name && row.name.trim() !== '') {
      rows.push(row);
    }
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

export default function ImportProductsPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ProductImportRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update'>('skip');
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    setError(null);

    // Read and parse CSV
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      setError('No valid data found in the file. Please check the CSV format.');
      return;
    }

    setParsedRows(rows);
    setIsValidating(true);

    // Validate with backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/import/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rows }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate import data');
      }

      const result = await response.json();
      setValidationResults(result.data);
      setValidationSummary(result.summary);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate import data');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setStep('importing');
    setImportProgress(0);

    try {
      const token = localStorage.getItem('token');

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rows: parsedRows, duplicateAction }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Failed to import products');
      }

      const result = await response.json();
      setImportResult(result.data);
      setImportProgress(100);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import products');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setParsedRows([]);
    setValidationResults([]);
    setValidationSummary(null);
    setImportProgress(0);
    setImportResult(null);
    setError(null);
  };

  const downloadTemplate = () => {
    const template = 'name,sku,type,basePrice,unit,category,status,description\n"Sample Product","SKU-001","SERVICE","99.99","hour","Services","ACTIVE","Product description here"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard>
      <div style={styles.container}>
        <NavBar activeModule="cro" />
        <main style={styles.main}>
          {/* Back Button */}
          <button onClick={() => router.push('/products')} style={styles.backButton}>
            ← Back to Products
          </button>

          {/* Page Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Import Products</h1>
            <p style={styles.subtitle}>
              {step === 'upload' && 'Upload a CSV file to import products in bulk'}
              {step === 'preview' && 'Review your data before importing'}
              {step === 'importing' && 'Importing your products...'}
              {step === 'complete' && 'Import complete!'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              ...styles.card,
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid #E74C3C',
              color: '#E74C3C',
            }}>
              <strong>Error:</strong> {error}
              <button
                onClick={() => setError(null)}
                style={{ marginLeft: '1rem', cursor: 'pointer', background: 'none', border: 'none', color: '#E74C3C' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Step: Upload */}
          {step === 'upload' && (
            <>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csv-upload')?.click()}
                style={{
                  ...styles.dropzone,
                  ...(dragOver ? styles.dropzoneActive : {}),
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 0.5rem 0' }}>
                  {isValidating ? 'Processing...' : 'Drag & Drop Your CSV File'}
                </h3>
                <p style={{ color: 'var(--zander-gray)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                  or click to browse files
                </p>
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {!isValidating && (
                  <button style={styles.primaryButton} onClick={(e) => e.stopPropagation()}>
                    Browse Files
                  </button>
                )}
                {isValidating && (
                  <div style={{ color: 'var(--zander-navy)' }}>Validating data...</div>
                )}
              </div>

              {/* Expected Format */}
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--zander-navy)', margin: 0, fontSize: '1rem' }}>
                    Expected CSV Format
                  </h3>
                  <button onClick={downloadTemplate} style={styles.secondaryButton}>
                    Download Template
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>name*</th>
                        <th style={styles.th}>sku</th>
                        <th style={styles.th}>type</th>
                        <th style={styles.th}>basePrice</th>
                        <th style={styles.th}>unit</th>
                        <th style={styles.th}>category</th>
                        <th style={styles.th}>status</th>
                        <th style={styles.th}>description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={styles.td}>Cabinet Installation</td>
                        <td style={styles.td}>SVC-001</td>
                        <td style={styles.td}>SERVICE</td>
                        <td style={styles.td}>150.00</td>
                        <td style={styles.td}>hour</td>
                        <td style={styles.td}>Services</td>
                        <td style={styles.td}>ACTIVE</td>
                        <td style={styles.td}>Professional installation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p style={{ color: 'var(--zander-gray)', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: 0 }}>
                  * Required field. Type: PHYSICAL, SERVICE, SUBSCRIPTION, DIGITAL, ACCESS, BUNDLE. Status: ACTIVE, DRAFT, DISCONTINUED.
                </p>
              </div>
            </>
          )}

          {/* Step: Preview */}
          {step === 'preview' && validationSummary && (
            <>
              {/* Summary Cards */}
              <div style={styles.summaryGrid}>
                <div style={{ ...styles.summaryCard, background: 'rgba(52, 152, 219, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#3498DB' }}>{validationSummary.total}</div>
                  <div style={styles.summaryLabel}>Total Rows</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(39, 174, 96, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#27AE60' }}>{validationSummary.valid}</div>
                  <div style={styles.summaryLabel}>Valid</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(231, 76, 60, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#E74C3C' }}>{validationSummary.invalid}</div>
                  <div style={styles.summaryLabel}>Errors</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(241, 196, 15, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#B7950B' }}>{validationSummary.duplicates}</div>
                  <div style={styles.summaryLabel}>Duplicates</div>
                </div>
              </div>

              {/* Duplicate Action */}
              {validationSummary.duplicates > 0 && (
                <div style={styles.card}>
                  <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 1rem 0', fontSize: '1rem' }}>
                    Duplicate Handling
                  </h3>
                  <p style={{ color: 'var(--zander-gray)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {validationSummary.duplicates} product(s) have SKUs that already exist. How should we handle them?
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="skip"
                        checked={duplicateAction === 'skip'}
                        onChange={() => setDuplicateAction('skip')}
                      />
                      <span>Skip duplicates</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="duplicateAction"
                        value="update"
                        checked={duplicateAction === 'update'}
                        onChange={() => setDuplicateAction('update')}
                      />
                      <span>Update existing products</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              <div style={styles.card}>
                <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 1rem 0', fontSize: '1rem' }}>
                  Data Preview
                </h3>
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={styles.table}>
                    <thead style={{ position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={styles.th}>Row</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>SKU</th>
                        <th style={styles.th}>Type</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResults.map((result) => (
                        <tr
                          key={result.row}
                          style={
                            result.errors.length > 0
                              ? styles.errorRow
                              : result.warnings.length > 0
                              ? styles.warningRow
                              : {}
                          }
                        >
                          <td style={styles.td}>{result.row}</td>
                          <td style={styles.td}>
                            {result.errors.length > 0 ? (
                              <span style={{ ...styles.badge, ...styles.errorBadge }}>Error</span>
                            ) : result.isDuplicate ? (
                              <span style={{ ...styles.badge, ...styles.duplicateBadge }}>Duplicate</span>
                            ) : result.warnings.length > 0 ? (
                              <span style={{ ...styles.badge, ...styles.warningBadge }}>Warning</span>
                            ) : (
                              <span style={{ ...styles.badge, ...styles.validBadge }}>Valid</span>
                            )}
                          </td>
                          <td style={styles.td}>{result.data.name}</td>
                          <td style={styles.td}>{result.data.sku || '-'}</td>
                          <td style={styles.td}>{result.data.type || 'SERVICE'}</td>
                          <td style={styles.td}>
                            {result.data.basePrice ? `$${result.data.basePrice}` : '-'}
                          </td>
                          <td style={styles.td}>{result.data.category || '-'}</td>
                          <td style={styles.td}>
                            {[...result.errors, ...result.warnings].map((msg, i) => (
                              <div key={i} style={{ fontSize: '0.8rem' }}>
                                {result.errors.includes(msg) ? '❌' : '⚠️'} {msg}
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={handleReset} style={styles.secondaryButton}>
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  style={{
                    ...styles.successButton,
                    opacity: validationSummary.valid === 0 ? 0.5 : 1,
                    cursor: validationSummary.valid === 0 ? 'not-allowed' : 'pointer',
                  }}
                  disabled={validationSummary.valid === 0}
                >
                  Import {validationSummary.valid} Product{validationSummary.valid !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ color: 'var(--zander-navy)', marginBottom: '1rem' }}>
                  Importing Products...
                </h3>
                <div style={styles.progressContainer}>
                  <div style={{ ...styles.progressBar, width: `${importProgress}%` }} />
                </div>
                <p style={{ color: 'var(--zander-gray)' }}>{importProgress}% complete</p>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && importResult && (
            <>
              {/* Result Summary */}
              <div style={styles.summaryGrid}>
                <div style={{ ...styles.summaryCard, background: 'rgba(39, 174, 96, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#27AE60' }}>{importResult.imported}</div>
                  <div style={styles.summaryLabel}>Imported</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(52, 152, 219, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#3498DB' }}>{importResult.updated}</div>
                  <div style={styles.summaryLabel}>Updated</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(241, 196, 15, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#B7950B' }}>{importResult.skipped}</div>
                  <div style={styles.summaryLabel}>Skipped</div>
                </div>
                <div style={{ ...styles.summaryCard, background: 'rgba(231, 76, 60, 0.1)' }}>
                  <div style={{ ...styles.summaryNumber, color: '#E74C3C' }}>{importResult.errors}</div>
                  <div style={styles.summaryLabel}>Errors</div>
                </div>
              </div>

              {/* Import Details */}
              <div style={styles.card}>
                <h3 style={{ color: 'var(--zander-navy)', margin: '0 0 1rem 0', fontSize: '1rem' }}>
                  Import Details
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Row</th>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.details.map((detail, i) => (
                        <tr key={i}>
                          <td style={styles.td}>{detail.row}</td>
                          <td style={styles.td}>{detail.name}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.badge,
                                ...(detail.status === 'imported'
                                  ? styles.validBadge
                                  : detail.status === 'updated'
                                  ? styles.duplicateBadge
                                  : detail.status === 'skipped'
                                  ? styles.warningBadge
                                  : styles.errorBadge),
                              }}
                            >
                              {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                            </span>
                          </td>
                          <td style={styles.td}>{detail.message || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={handleReset} style={styles.secondaryButton}>
                  Import More
                </button>
                <button onClick={() => router.push('/products')} style={styles.primaryButton}>
                  View Products
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
