import React from 'react';

export const SkeletonLoader: React.FC = () => {
    return (
        <div className="w-full animate-pulse space-y-4">
            <div className="flex space-x-4">
                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
            </div>
            {[...Array(10)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                    <div className="h-12 bg-slate-100 rounded w-full"></div>
                </div>
            ))}
        </div>
    );
};
