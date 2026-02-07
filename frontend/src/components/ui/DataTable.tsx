import { useState, useMemo, ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => ReactNode;
  sortValue?: (item: T) => string | number | Date;
  filterValue?: (item: T) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Quando definido, a linha inteira fica clicável (evite cliques em botões com stopPropagation). */
  onRowClick?: (item: T) => void;
  /** No mobile, colunas cujas keys estão aqui aparecem em destaque no topo do card (identidade do item). Ex: ['codigo', 'descricao'] */
  mobileTitleColumnKeys?: string[];
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  mobileTitleColumnKeys,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  // Função para obter valor de ordenação
  const getSortValue = (item: T, column: Column<T>): string | number | Date => {
    if (column.sortValue) {
      return column.sortValue(item);
    }
    // Tentar acessar propriedade diretamente
    const value = (item as any)[column.key];
    if (value === null || value === undefined) return '';
    return value;
  };

  // Função para obter valor de filtro
  const getFilterValue = (item: T, column: Column<T>): string => {
    if (column.filterValue) {
      return column.filterValue(item);
    }
    const value = (item as any)[column.key];
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // Filtrar dados
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filtro global
      if (globalSearch) {
        const searchLower = globalSearch.toLowerCase();
        const matchesGlobal = columns.some((col) => {
          const value = getFilterValue(item, col);
          return value.includes(searchLower);
        });
        if (!matchesGlobal) return false;
      }

      // Filtros por coluna
      for (const column of columns) {
        if (column.filterable && filters[column.key]) {
          const filterValue = filters[column.key].toLowerCase();
          const itemValue = getFilterValue(item, column);
          if (!itemValue.includes(filterValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, filters, globalSearch, columns]);

  // Ordenar dados
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return filteredData;
    }

    const column = columns.find((col) => col.key === sortColumn);
    if (!column || !column.sortable) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = getSortValue(a, column);
      const bValue = getSortValue(b, column);

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      else if (aValue > bValue) comparison = 1;

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Handler para ordenação
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || !column.sortable) return;

    if (sortColumn === columnKey) {
      // Ciclar: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Ícone de ordenação
  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return (
        <span className="ml-1 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      );
    }
    if (sortDirection === 'asc') {
      return (
        <span className="ml-1 text-blue-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
      );
    }
    return (
      <span className="ml-1 text-blue-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de busca global e filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-3">
          {/* Busca global */}
          <div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full min-h-[44px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-base touch-manipulation"
            />
          </div>

          {/* Filtros por coluna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {columns
              .filter((col) => col.filterable)
              .map((column) => (
                <div key={column.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {column.label}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filtrar ${column.label.toLowerCase()}...`}
                    value={filters[column.key] || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [column.key]: e.target.value,
                      }))
                    }
                    className="w-full min-h-[44px] px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold touch-manipulation"
                  />
                </div>
              ))}
          </div>

          {/* Botão para limpar filtros */}
          {(globalSearch || Object.values(filters).some((f) => f)) && (
            <div>
              <button
                type="button"
                onClick={() => {
                  setGlobalSearch('');
                  setFilters({});
                }}
                className="min-h-[44px] px-3 text-sm text-brand-gold hover:text-brand-gold-dark touch-manipulation"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: lista em cards (touch-friendly) */}
      <div className="md:hidden space-y-3">
        {sortedData.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-12 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          sortedData.map((item, index) => {
            const titleCols = mobileTitleColumnKeys
              ? columns.filter((c) => c.key !== 'actions' && mobileTitleColumnKeys.includes(c.key))
              : [];
            const restCols = columns.filter(
              (c) => c.key !== 'actions' && (!mobileTitleColumnKeys || !mobileTitleColumnKeys.includes(c.key))
            );
            return (
              <div
                key={(item as any).id || `row-${index}`}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item); } } : undefined}
                className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
              >
                <div className="p-4 space-y-3">
                  {titleCols.length > 0 && (
                    <div className="pb-2 border-b border-gray-100">
                      <div className="flex flex-col gap-0.5">
                        {titleCols.map((column) => (
                          <div key={column.key}>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-0.5">
                              {column.label}
                            </span>
                            <span className="text-base font-semibold text-gray-900 break-words">
                              {column.render ? column.render(item) : String((item as any)[column.key] ?? '-')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {restCols.map((column) => (
                    <div key={column.key} className="flex justify-between gap-2 text-sm items-start">
                      <span className="text-gray-500 font-medium shrink-0 pt-0.5">{column.label}</span>
                      <span className="text-gray-900 text-right break-all min-w-0">
                        {column.render ? column.render(item) : String((item as any)[column.key] ?? '-')}
                      </span>
                    </div>
                  ))}
                  {columns.find((c) => c.key === 'actions') && (
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                      {columns.find((c) => c.key === 'actions')?.render?.(item)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {sortedData.length > 0 && (
          <p className="text-sm text-gray-500 text-center">
            {sortedData.length} de {data.length} registro(s)
            {(globalSearch || Object.values(filters).some((f) => f)) && ' (filtrado)'}
          </p>
        )}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr
                    key={(item as any).id || `row-${index}`}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    role={onRowClick ? 'button' : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(item); } } : undefined}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(item) : String((item as any)[column.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sortedData.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
            Mostrando {sortedData.length} de {data.length} registro(s)
            {(globalSearch || Object.values(filters).some((f) => f)) && ' (filtrado)'}
          </div>
        )}
      </div>
    </div>
  );
}
