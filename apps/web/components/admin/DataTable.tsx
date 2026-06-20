import type { ReactNode } from "react";
import { Spinner } from "@/components/Spinner";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage: string;
  pagination?: PaginationConfig;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  emptyMessage,
  pagination,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner label="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-error)" }}>
        {error}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-secondary)" }}>
        {emptyMessage}
      </p>
    );
  }

  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : undefined;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : undefined;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--table-border)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-body text-sm"
                  style={{ color: "var(--table-header-text)", fontWeight: "var(--weight-medium)" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} style={{ borderBottom: "1px solid var(--table-border)" }}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 font-body text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          style={{ borderTop: "1px solid var(--table-border)" }}
        >
          <span className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            Showing {from}–{to} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="h-9 rounded-md px-3 font-body text-sm disabled:opacity-50"
              style={{
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                color: "var(--btn-secondary-text)",
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="h-9 rounded-md px-3 font-body text-sm disabled:opacity-50"
              style={{
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                color: "var(--btn-secondary-text)",
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
