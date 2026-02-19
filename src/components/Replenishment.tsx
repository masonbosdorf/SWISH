import React from 'react';
import { RefreshCw } from 'lucide-react';

const Replenishment: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-zinc-500 space-y-4 animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <RefreshCw size={40} className="text-zinc-600" />
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-300">Replenishment</h2>
                <p className="text-sm">This feature is coming soon.</p>
            </div>
        </div>
    );
};

export default Replenishment;
