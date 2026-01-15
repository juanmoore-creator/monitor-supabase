import { formatDate, truncateUUID, isBoolean, isDateColumn, isIDColumn } from '../utils/formatters';
import { DatabaseIcon, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface DataTableProps {
    data: any[];
    isLoading: boolean;
    error: string | null;
    onRowSelect?: (row: any) => void;
    sortColumn?: string;
    sortAscending?: boolean;
    onSort?: (column: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
    data,
    isLoading,
    error,
    onRowSelect,
    sortColumn,
    sortAscending,
    onSort
}) => {
    if (error) {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
                <ShieldAlert className="mx-auto text-orange-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-orange-800 mb-2">Access Error</h3>
                <p className="text-orange-700">{error}</p>
                <p className="text-sm text-orange-600 mt-4">
                    Verify if the table exists or if Row Level Security (RLS) is blocking access.
                </p>
            </div>
        );
    }

    if (data.length === 0 && !isLoading) {
        return (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center">
                <DatabaseIcon className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-500">No records found</h3>
                <p className="text-slate-400">This table is currently empty.</p>
            </div>
        );
    }

    // Generate headers from the first record keys
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const renderCell = (val: any, col: string) => {
        if (val === null || val === undefined) return <span className="text-slate-300">null</span>;

        if (isDateColumn(col)) {
            return <span className="text-slate-600 font-medium whitespace-nowrap">{formatDate(val)}</span>;
        }

        if (isBoolean(val)) {
            return (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${val ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {val ? 'Activo' : 'Inactivo'}
                </span>
            );
        }

        if (typeof val === 'object') {
            return (
                <div
                    className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[200px]"
                    title={JSON.stringify(val, null, 2)}
                >
                    {JSON.stringify(val)}
                </div>
            );
        }

        if (typeof val === 'string' && val.trim().toUpperCase() === 'PRODUCTO SIN SINCRONIZAR') {
            return (
                <span className="bg-red-500 text-white font-bold px-2 py-1 rounded-md text-[11px] shadow-sm animate-pulse whitespace-nowrap">
                    {val}
                </span>
            );
        }

        if (isIDColumn(col) || (typeof val === 'string' && val.length > 20)) {
            return (
                <span
                    className="font-mono text-slate-500 truncate inline-block max-w-[150px] cursor-help"
                    title={val.toString()}
                >
                    {truncateUUID(val.toString())}
                </span>
            );
        }

        return <span className="text-slate-700">{val.toString()}</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    onClick={() => onSort?.(col)}
                                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors select-none ${onSort ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-700' : 'text-slate-500'
                                        } ${sortColumn === col ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.replace(/_/g, ' ')}
                                        {sortColumn === col ? (
                                            sortAscending ? <ChevronUp size={14} className="text-indigo-600" /> : <ChevronDown size={14} className="text-indigo-600" />
                                        ) : (
                                            onSort && <ChevronDown size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onRowSelect?.(row)}
                                className={`transition-colors group ${onRowSelect ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                            >
                                {columns.map((col) => (
                                    <td key={col} className={`px-4 py-3 text-sm ${sortColumn === col ? 'bg-indigo-50/5' : ''}`}>
                                        {renderCell(row[col], col)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
