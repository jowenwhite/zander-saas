'use client';
import { ReactNode, CSSProperties } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
  onPageChange?: (page: number) => void;
  keyField?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  pagination,
  onPageChange,
  keyField = 'id'
}: DataTableProps<T>) {
  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const headerCellStyle = (align: string = 'left'): CSSProperties => ({
    padding: '1rem',
    textAlign: align as 'left' | 'center' | 'right',
    fontWeight: '600',
    color: 'var(--zander-navy)',
    background: 'var(--zander-off-white)',
    borderBottom: '2px solid var(--zander-border-gray)',
  });

  const cellStyle = (align: string = 'left'): CSSProperties => ({
    padding: '1rem',
    textAlign: align as 'left' | 'center' | 'right',
    borderBottom: '1px solid var(--zander-border-gray)',
    color: 'var(--zander-navy)',
  });

  const rowStyle: CSSProperties = {
    transition: 'background 0.2s ease',
    cursor: onRowClick ? 'pointer' : 'default',
  };

  if (loading) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--zander-gray)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
            ⏳
          </span>
        </div>
        <div>Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--zander-gray)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
        <div>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    ...headerCellStyle(column.align),
                    width: column.width,
                  }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={String(item[keyField]) || index}
                style={rowStyle}
                onClick={() => onRowClick?.(item)}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.background = 'rgba(245, 124, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {columns.map((column) => (
                  <td key={column.key} style={cellStyle(column.align)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderTop: '1px solid var(--zander-border-gray)',
        }}>
          <div style={{ color: 'var(--zander-gray)', fontSize: '0.875rem' }}>
            Showing {data.length} of {pagination.total} results
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--zander-border-gray)',
                borderRadius: '6px',
                background: 'white',
                cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.page <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{
              padding: '0.5rem 1rem',
              color: 'var(--zander-navy)',
              fontWeight: '600',
            }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--zander-border-gray)',
                borderRadius: '6px',
                background: 'white',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
