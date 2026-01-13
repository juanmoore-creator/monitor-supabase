import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorScreenProps {
    missingVars: string[];
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ missingVars }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-red-100">
                <div className="flex items-center gap-3 text-red-600 mb-6">
                    <AlertCircle size={32} />
                    <h1 className="text-2xl font-bold">Environment Configuration Error</h1>
                </div>

                <p className="text-slate-600 mb-6">
                    The application is missing some essential environment variables to connect to Supabase.
                </p>

                <div className="bg-red-50 rounded-md p-4 mb-6">
                    <p className="text-sm font-semibold text-red-800 mb-2">Missing Variables:</p>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                        {missingVars.map((v) => (
                            <li key={v} className="font-mono">{v}</li>
                        ))}
                    </ul>
                </div>

                <div className="text-sm text-slate-500 italic">
                    Please check your Vercel Dashboard or your local <code className="bg-slate-100 px-1 rounded">.env</code> file.
                </div>
            </div>
        </div>
    );
};
