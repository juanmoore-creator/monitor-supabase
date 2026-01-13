import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DataTable } from './components/DataTable';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorScreen } from './components/ErrorScreen';
import { supabase, isConfigured, missingEnvVars } from './lib/supabase';
import { RefreshCw, Layers } from 'lucide-react';

function App() {
  const [selectedTable, setSelectedTable] = useState('sync_catalog');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (tableName: string) => {
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      // Intento de fetch con límite de 50 y orden descendente si existe created_at
      const query = supabase!
        .from(tableName)
        .select('*')
        .limit(50);

      // Solo ordenamos si la tabla es conocida por tener created_at o similar
      // Para ser agnósticos, intentamos order y si falla el SDK maneja el error
      let result, fetchError;

      const { data: qResult, error: qError } = await query.order('created_at', { ascending: false });

      if (qError && qError.message.toLowerCase().includes('created_at') && qError.message.toLowerCase().includes('not exist')) {
        const { data: qResultFallback, error: qErrorFallback } = await supabase!.from(tableName).select('*').limit(50);
        result = qResultFallback;
        fetchError = qErrorFallback;
      } else {
        result = qResult;
        fetchError = qError;
      }

      if (fetchError) {
        // Manejo específico de RLS
        if (fetchError.code === '42501') {
          setError("No se pudieron cargar datos. Verifica las RLS Policies en Supabase.");
        } else {
          setError(fetchError.message);
        }
        setData([]);
      } else {
        setData(result || []);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConfigured) {
      fetchData(selectedTable);
    }
  }, [selectedTable]);

  if (!isConfigured) {
    return <ErrorScreen missingVars={missingEnvVars} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentTable={selectedTable}
        onTableChange={(table) => setSelectedTable(table)}
      />

      <main className="flex-1 ml-64 p-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
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

          <button
            onClick={() => fetchData(selectedTable)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refrescar
          </button>
        </header>

        <section className="relative">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <DataTable data={data} isLoading={loading} error={error} />
          )}
        </section>

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
