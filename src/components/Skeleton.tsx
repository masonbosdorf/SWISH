import React from 'react';

export const CardSkeleton: React.FC = () => (
    <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-2xl"></div>
            <div className="flex-1 space-y-2">
                <div className="h-6 bg-zinc-900 rounded-md w-3/4"></div>
                <div className="h-4 bg-zinc-900 rounded-md w-1/2"></div>
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
            <div className="h-8 bg-zinc-900 rounded-xl w-24"></div>
        </div>
    </div>
);

export const DashboardSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-[#111112] border border-zinc-800 rounded-3xl"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-[#111112] border border-zinc-800 rounded-3xl"></div>
            <div className="h-[400px] bg-[#111112] border border-zinc-800 rounded-3xl"></div>
        </div>
    </div>
);

export const ListSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-12 bg-zinc-900 rounded-xl w-full"></div>
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-900">
                <div className="w-12 h-12 bg-zinc-900 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-900 rounded-md w-1/3"></div>
                    <div className="h-3 bg-zinc-900 rounded-md w-1/4"></div>
                </div>
                <div className="w-20 h-8 bg-zinc-900 rounded-xl"></div>
            </div>
        ))}
    </div>
);
