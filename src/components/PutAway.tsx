
import React, { useState } from 'react';
import { Product } from '../types';
import { Package, QrCode, Search, CheckCircle, AlertCircle } from 'lucide-react';
import SearchInput from './SearchInput';

interface PutAwayProps {
  products: Product[];
}

const PutAway: React.FC<PutAwayProps> = ({ products }) => {
  const [query, setQuery] = useState('');

  const filtered = products.filter(p =>
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    (p.barcode && p.barcode.includes(query))
  );

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Search size={40} />
        </div>
        <h2 className="text-4xl font-black tracking-tight">Product Lookup</h2>
        <p className="text-zinc-500">Scan or search for a product to verify details and status.</p>
      </div>

      <div className="relative">
        <SearchInput
          autoFocus
          placeholder="Scan barcode or type SKU (Press Enter)..."
          onSearch={setQuery}
        />
      </div>

      <div className="space-y-4">
        {query === '' ? (
          <div className="p-12 text-center text-zinc-700 border-2 border-dashed border-zinc-800 rounded-3xl">
            <QrCode size={48} className="mx-auto mb-4 opacity-5" />
            <p>Awaiting scan input...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-red-500/5 border border-red-500/10 rounded-3xl">
            <p className="font-bold text-red-400">No Product Found</p>
            <p className="text-sm mt-1">This SKU might not be in the database yet. Notify manager.</p>
          </div>
        ) : (
          filtered.slice(0, 5).map((p, idx) => (
            <div key={idx} className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg hover:border-blue-600/50 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 overflow-hidden relative border border-zinc-800">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.sku}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={32} />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{p.name}</h4>
                  <p className="text-zinc-500 font-mono mt-1 text-sm">{p.sku}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                      {p.barcode || 'No Barcode'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {p.status === 'Active' ? <CheckCircle size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-zinc-500" />}
                  <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Status</span>
                </div>
                <div className={`text-2xl font-black tracking-tighter ${p.status === 'Active' ? 'text-emerald-400' :
                    p.status === 'Inactive' ? 'text-zinc-500' : 'text-red-400'
                  }`}>
                  {p.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PutAway;
