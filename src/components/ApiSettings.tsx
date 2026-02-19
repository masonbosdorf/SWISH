
import React from 'react';
import { Terminal, Link, Database, Info, Loader2, CheckCircle } from 'lucide-react';

const ApiSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">API Management</h2>
          <p className="text-zinc-500 mt-1">Configure external system integrations and Datapel sync.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Loader2 size={12} className="animate-spin" /> Development Mode
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Link size={20} />
          </div>
          <h3 className="font-bold">Active Connections</h3>
          <p className="text-2xl font-black">0</p>
          <p className="text-xs text-zinc-500">No active external webhooks</p>
        </div>
        <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <h3 className="font-bold">Sync Health</h3>
          <p className="text-2xl font-black">100%</p>
          <p className="text-xs text-zinc-500">Local database connectivity stable</p>
        </div>
        <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Database size={20} />
          </div>
          <h3 className="font-bold">Endpoints</h3>
          <p className="text-2xl font-black">12</p>
          <p className="text-xs text-zinc-500">Available REST endpoints</p>
        </div>
      </div>

      <div className="bg-[#111112] border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-zinc-800 flex items-center gap-3">
          <Terminal size={20} className="text-zinc-500" />
          <h3 className="font-bold">Integration Endpoints</h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {[
            { name: 'Fetch RTP Orders', endpoint: 'GET /v1/orders/rtp', status: 'Ready' },
            { name: 'Update Stock Level', endpoint: 'PATCH /v1/stock/adjust', status: 'Draft' },
            { name: 'Sync Pick List', endpoint: 'POST /v1/picks/sync', status: 'Pending' },
            { name: 'User Authentication', endpoint: 'POST /v1/auth/token', status: 'Secure' },
          ].map((api, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
              <div className="space-y-1">
                <p className="font-bold text-zinc-200">{api.name}</p>
                <code className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-blue-400 border border-zinc-800">{api.endpoint}</code>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border ${api.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  api.status === 'Draft' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}>
                {api.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl flex gap-4 items-start">
        <Info className="text-blue-400 shrink-0 mt-1" />
        <div className="space-y-1">
          <h4 className="font-bold text-blue-200">System Note</h4>
          <p className="text-sm text-blue-200/70 leading-relaxed">
            API endpoints are currently being mapped to the Datapel 2.0 interface. Ensure your Warehouse division keys match the environment variables set in the backend to avoid 401 Unauthorized errors during sync.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
