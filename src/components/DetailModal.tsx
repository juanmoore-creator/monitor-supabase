import React, { useEffect } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import { useState } from 'react';

interface DetailModalProps {
    data: any;
    isOpen: boolean;
    onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ data, isOpen, onClose }) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !data) return null;

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const renderValue = (value: any) => {
        if (value === null || value === undefined) return <span className="text-slate-400 italic">null</span>;
        if (typeof value === 'object') {
            return (
                <pre className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto font-mono text-slate-700 leading-relaxed">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }
        if (typeof value === 'boolean') {
            return (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {value ? 'true' : 'false'}
                </span>
            );
        }
        return <span className="text-slate-700 break-words">{value.toString()}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Terminal size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Detalles del Registro</h3>
                            <p className="text-xs text-slate-500 font-medium">Inspección completa de campos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="group flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        {key.replace(/_/g, ' ')}
                                    </label>
                                    <button
                                        onClick={() => copyToClipboard(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value), key)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-50 rounded transition-all text-slate-400 hover:text-indigo-600"
                                        title="Copiar valor"
                                    >
                                        {copiedKey === key ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                                <div className="pl-0">
                                    {renderValue(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};
