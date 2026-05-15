import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGetRegistrosPaginated } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/storage';
import type { RegistroCombustible } from '../lib/types';

const PAGE_SIZES = [10, 25, 50, 100];

interface Props {
  dateDesde: Date | null;
  dateHasta: Date | null;
  filtroConductor: string;
}

type SortDir = 'asc' | 'desc';
interface SortState {
  column: string;
  dir: SortDir;
}

export default function DataTable({ dateDesde, dateHasta, filtroConductor }: Props) {
  const [data, setData] = useState<RegistroCombustible[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ column: 'fecha_creacion', dir: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiGetRegistrosPaginated({
        page,
        pageSize,
        search: search.trim() || undefined,
        sortBy: sort.column,
        sortDir: sort.dir,
        desde: dateDesde ? dateDesde.toISOString().split('T')[0] : undefined,
        hasta: dateHasta ? dateHasta.toISOString().split('T')[0] : undefined,
        userId: filtroConductor ? Number(filtroConductor) : undefined,
      });
      setData(result.data);
      setTotal(result.total);
    } catch {
      setError('Error al cargar registros');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sort, dateDesde, dateHasta, filtroConductor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, dateDesde, dateHasta, filtroConductor]);

  const handleSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(value), 400);
  };

  const handleSort = (column: string) => {
    setSort(prev => ({
      column,
      dir: prev.column === column && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
    setPage(1);
  };

  const sortIcon = (column: string) => {
    if (sort.column !== column) return null;
    return (
      <svg className={`w-3 h-3 inline-block ml-1 transition-transform ${sort.dir === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  const visiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-text uppercase tracking-wider">
          Todos los Registros
          {!loading && <span className="text-text-muted font-normal"> ({total})</span>}
        </h2>
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar conductor, vehículo, placa, factura..."
            onChange={e => handleSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 bg-bg border border-border rounded-lg text-text text-sm focus:outline-none focus:border-accent transition-colors"
          />
          {loading && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-accent hover:underline">Reintentar</button>
        </div>
      ) : data.length === 0 && !loading ? (
        <div className="p-8 text-center">
          <svg className="w-12 h-12 text-surface-2 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-text-muted">No se encontraron registros</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th
                  className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap cursor-pointer select-none hover:text-text transition-colors"
                  onClick={() => handleSort('fecha_creacion')}
                >
                  Fecha {sortIcon('fecha_creacion')}
                </th>
                <th className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap">Conductor</th>
                <th
                  className="text-left py-3 px-4 text-text-muted font-medium whitespace-nowrap cursor-pointer select-none hover:text-text transition-colors"
                  onClick={() => handleSort('vehiculo_nombre')}
                >
                  Vehículo {sortIcon('vehiculo_nombre')}
                </th>
                <th
                  className="text-right py-3 px-4 text-text-muted font-medium whitespace-nowrap cursor-pointer select-none hover:text-text transition-colors"
                  onClick={() => handleSort('litros')}
                >
                  Litros {sortIcon('litros')}
                </th>
                <th
                  className="text-right py-3 px-4 text-text-muted font-medium whitespace-nowrap cursor-pointer select-none hover:text-text transition-colors"
                  onClick={() => handleSort('importe_total')}
                >
                  Importe {sortIcon('importe_total')}
                </th>
                <th className="text-center py-3 px-4 text-text-muted font-medium whitespace-nowrap">Sync</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <svg className="w-6 h-6 text-accent animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : (
                data.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-bg/30 transition-colors">
                    <td className="py-3 px-4 text-text whitespace-nowrap">{formatDate(r.fechaCreacion)}</td>
                    <td className="py-3 px-4 text-text">{r.conductorNombre || String(r.userId)}</td>
                    <td className="py-3 px-4 text-text">{r.vehiculoNombre}</td>
                    <td className="py-3 px-4 text-right text-text whitespace-nowrap">{r.litros?.toFixed(1) || '0'} L</td>
                    <td className="py-3 px-4 text-right text-accent font-bold whitespace-nowrap">{formatCurrency(r.importeTotal || 0)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${r.sincronizado ? 'bg-success' : 'bg-accent'}`} />
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/reportes/${r.id}`}
                        className="text-accent hover:underline text-xs font-medium touch-target inline-flex items-center gap-1"
                      >
                        Ver
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <span>{from}–{to} de {total}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-8 px-2 bg-bg border border-border rounded text-text text-sm focus:outline-none focus:border-accent"
            >
              {PAGE_SIZES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {visiblePages().map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-text-muted text-xs">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-8 px-2 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'text-text-muted hover:text-text hover:bg-bg'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-bg disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
