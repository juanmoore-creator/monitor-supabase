import React from 'react';
import {
    Database,
    Users,
    Package,
    ShoppingCart,
    FileText,
    ClipboardList
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    currentTable: string;
    onTableChange: (table: string) => void;
}

const FIXED_TABLES = [
    { id: 'sync_catalog', name: 'Sync Catalog', icon: Database },
    { id: 'processed_orders', name: 'Processed Orders', icon: ShoppingCart },
    { id: 'logs_integracion', name: 'Logs Integración', icon: ClipboardList },
    { id: 'usuarios', name: 'Usuarios', icon: Users },
    { id: 'productos', name: 'Productos', icon: Package },
    { id: 'ordenes', name: 'Órdenes', icon: ShoppingCart },
    { id: 'logs', name: 'Logs', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTable, onTableChange }) => {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 flex flex-col items-stretch border-r border-slate-800 z-30">
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 text-white">
                    <Database size={24} className="text-emerald-500" />
                    <h2 className="text-xl font-bold tracking-tight">DB Monitor</h2>
                </div>
                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-semibold">Supabase Internal</p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {FIXED_TABLES.map((table) => {
                    const Icon = table.icon;
                    const isActive = currentTable === table.id;

                    return (
                        <button
                            key={table.id}
                            onClick={() => onTableChange(table.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon size={18} className={cn(
                                "transition-colors",
                                isActive ? "text-white" : "text-slate-500 group-hover:text-indigo-400"
                            )} />
                            {table.name}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected to Production
                </div>
            </div>
        </aside>
    );
};
