import React from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedRowKeys: React.Key[];
    onChange: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  };
  actions?: {
    search?: {
      placeholder?: string;
      onSearch: (query: string) => void;
      loading?: boolean;
    };
    filter?: {
      onFilter: () => void;
    };
    export?: {
      onExport: () => void;
      loading?: boolean;
    };
    refresh?: {
      onRefresh: () => void;
      loading?: boolean;
    };
  };
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    className?: string;
  };
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  empty,
  className,
  pagination,
  selection,
  actions,
  onRow,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [selectedRows, setSelectedRows] = React.useState<React.Key[]>(
    selection?.selectedRowKeys || []
  );

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleRowSelect = (rowKey: React.Key, _record: T) => {
    const newSelectedRows = selectedRows.includes(rowKey)
      ? selectedRows.filter(key => key !== rowKey)
      : [...selectedRows, rowKey];

    setSelectedRows(newSelectedRows);
    selection?.onChange(newSelectedRows, data.filter(row => newSelectedRows.includes(row.id)));
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
      selection?.onChange([], []);
    } else {
      const allRowKeys = data.map(row => row.id);
      setSelectedRows(allRowKeys);
      selection?.onChange(allRowKeys, data);
    }
  };

  const renderEmpty = () => {
    if (empty) return empty;

    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No data available</div>
        <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <div className="text-gray-500 text-sm mt-2">Loading...</div>
    </div>
  );

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      {/* Header Actions */}
      {actions && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {actions.search && (
                <div className="max-w-xs flex-1">
                  <Input
                    placeholder={actions.search.placeholder || 'Search...'}
                    leftIcon={<Search />}
                    onChange={(e) => actions.search?.onSearch(e.target.value)}
                  />
                </div>
              )}
              {actions.filter && (
                <Button variant="outline" size="sm" onClick={actions.filter.onFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actions.export && (
                <Button variant="outline" size="sm" onClick={actions.export.onExport} loading={actions.export.loading}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              {actions.refresh && (
                <Button variant="outline" size="sm" onClick={actions.refresh.onRefresh} loading={actions.refresh.loading}>
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-orange-500">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12">
                  {renderLoading()}
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0)} className="px-6 py-12">
                  {renderEmpty()}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const isSelected = selectedRows.includes(record.id);
                const rowProps = onRow?.(record, index);

                return (
                  <tr
                    key={record.id}
                    className={cn(
                      'hover:bg-gray-50',
                      isSelected && 'bg-orange-50',
                      rowProps?.className,
                      rowProps?.onClick && 'cursor-pointer'
                    )}
                    onClick={rowProps?.onClick}
                  >
                    {selection && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          checked={isSelected}
                          onChange={() => handleRowSelect(record.id, record)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          'px-6 py-4 whitespace-nowrap text-sm',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(record[column.key], record, index)
                          : String(record[column.key] || '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.current}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current * pagination.pageSize >= pagination.total}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}