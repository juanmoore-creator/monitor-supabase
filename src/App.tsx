import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DataTable } from './components/DataTable';
import { DetailModal } from './components/DetailModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorScreen } from './components/ErrorScreen';
import { supabase, isConfigured, missingEnvVars } from './lib/supabase';
import { RefreshCw, Layers, Search, X } from 'lucide-react';

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

function App() {
  const [selectedTable, setSelectedTable] = useState('sync_catalog');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(100);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const fetchData = async (tableName: string, queryStr: string = '', recordsLimit: number = 100) => {
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase!.from(tableName).select('*');

      // Filtering logic
      if (queryStr) {
        const isQueryUUID = isUUID(queryStr);

        if (tableName === 'logs_integracion') {
          if (isQueryUUID) {
            query = query.eq('id', queryStr);
          } else {
            // Search in relevant columns for logs_integracion
            query = query.or(`detalle_mensaje.ilike.%${queryStr}%,estado.ilike.%${queryStr}%,entidad.ilike.%${queryStr}%`);
          }
        } else if (tableName === 'logs') {
          if (isQueryUUID) {
            query = query.eq('id', queryStr);
          } else {
            query = query.ilike('type', `%${queryStr}%`);
          }
        } else {
          // Generic filtering for other tables (ID only for safety)
          if (isQueryUUID) {
            query = query.eq('id', queryStr);
          }
        }
      }

      // Try ordering by created_at
      const { data: qResult, error: qError } = await query
        .order('created_at', { ascending: false })
        .limit(recordsLimit);

      let finalResult = qResult;
      let finalError = qError;

      // Fallback if created_at does not exist (e.g. table doesn't have it)
      if (qError && qError.code === '42703') {
        let fallbackQuery = supabase!.from(tableName).select('*');
        if (queryStr) {
          const isQueryUUID = isUUID(queryStr);
          if (isQueryUUID) {
            fallbackQuery = fallbackQuery.eq('id', queryStr);
          } else if (tableName === 'logs_integracion') {
            fallbackQuery = fallbackQuery.or(`detalle_mensaje.ilike.%${queryStr}%,estado.ilike.%${queryStr}%,entidad.ilike.%${queryStr}%`);
          } else if (tableName === 'logs') {
            fallbackQuery = fallbackQuery.ilike('type', `%${queryStr}%`);
          }
        }
        const { data: fr, error: fe } = await fallbackQuery.limit(recordsLimit);
        finalResult = fr;
        finalError = fe;
      }

      if (finalError) {
        if (finalError.code === '42501') {
          setError("No se pudieron cargar datos. Verifica las RLS Policies en Supabase.");
        } else {
          setError(finalError.message);
        }
        setData([]);
      } else {
        setData(finalResult || []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isConfigured) {
      fetchData(selectedTable, searchQuery, limit);
    }
  }, [selectedTable]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(selectedTable, searchQuery, limit);
  };

  const resetSearch = () => {
    setSearchQuery('');
    fetchData(selectedTable, '', limit);
  };

  if (!isConfigured) {
    return <ErrorScreen missingVars={missingEnvVars} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentTable={selectedTable}
        onTableChange={(table) => {
          setSelectedTable(table);
          setSearchQuery(''); // Reset search when changing table
          setSelectedRow(null); // Reset detail view when changing table
        }}
      />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Layers size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Dashboard / Explorador</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 capitalize">
                {selectedTable.replace(/_/g, ' ')}
              </h1>
              {!loading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {data.length} registros
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por ID o Tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                fetchData(selectedTable, searchQuery, newLimit);
              }}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            >
              <option value={50}>50 registros</option>
              <option value={100}>100 registros</option>
              <option value={200}>200 registros</option>
              <option value={500}>500 registros</option>
            </select>

            <button
              onClick={() => fetchData(selectedTable, searchQuery, limit)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refrescar
            </button>
          </div>
        </header>

        <section className="relative">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <DataTable
              data={data}
              isLoading={loading}
              error={error}
              onRowSelect={(row) => setSelectedRow(row)}
            />
          )}
        </section>

        <DetailModal
          data={selectedRow}
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
        />

        <footer className="mt-12 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-400">
            &copy; 2026 Supabase Monitor · Solo lectura · Admin Dashboard
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
