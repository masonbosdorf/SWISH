
import React, { useState } from 'react';
import { resolveProductImage } from '../utils/imageMap';
import { Upload, FileUp, ListOrdered, CheckCircle2, ChevronRight, Loader2, Package } from 'lucide-react';

const PickOrders: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickList, setPickList] = useState<any[]>([]);

  const handleUpload = () => {
    setIsProcessing(true);
    // Simulate parsing logic
    setTimeout(() => {
      setPickList([
        { sku: 'SOCKS-WHT-L', qty: 12, name: 'Crew Socks White', image: resolveProductImage('SOCKS-WHT-L') },
        { sku: 'TEE-BLK-M', qty: 5, name: 'Standard Tee Black', image: resolveProductImage('TEE-BLK-M') },
        { sku: 'HOOD-NVY-XL', qty: 2, name: 'Essential Hoodie Navy', image: resolveProductImage('HOOD-NVY-XL') },
        { sku: 'JACK-BOM-L', qty: 1, name: 'Bomber Jacket', image: resolveProductImage('JACK-BOM-L') },
      ]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
      <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-10 text-center space-y-6">
        <div className="w-24 h-24 bg-indigo-600/20 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-2">
          <Upload size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black">Organize Pick Path</h2>
          <p className="text-zinc-500 mt-2 max-w-md mx-auto">Upload a Datapel pick list PDF. Capture will organize it by SKU.</p>
        </div>

        <div className="flex justify-center">
          <label className="cursor-pointer group">
            <input type="file" className="hidden" onChange={handleUpload} accept="application/pdf" />
            <div className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-indigo-600/20 group-hover:-translate-y-1">
              <FileUp size={24} />
              Upload Pick List PDF
            </div>
          </label>
        </div>
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-zinc-400 font-medium">Analyzing pick path...</p>
        </div>
      )}

      {pickList.length > 0 && !isProcessing && (
        <div className="bg-[#111112] border border-zinc-800 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-indigo-600/5">
            <div className="flex items-center gap-3">
              <ListOrdered className="text-indigo-500" />
              <h3 className="font-bold">Pick List</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-bold">{pickList.length} Items</span>
              <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1">Print List <ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {pickList.map((item, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 font-bold text-xs overflow-hidden relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.sku}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] mb-1">#{idx + 1}</span>
                        <Package size={16} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-zinc-200 tracking-tight">{item.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{item.sku}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pick Qty</p>
                    <p className="text-2xl font-black">{item.qty}</p>
                  </div>
                  <button className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 transition-all">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PickOrders;
