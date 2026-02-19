
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Upload, Package } from 'lucide-react';
import { resolveProductImage } from '../utils/imageMap';

interface CreateItemModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateItemModal: React.FC<CreateItemModalProps> = ({ onClose, onSuccess }) => {
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!sku) {
            setError("SKU is required.");
            setLoading(false);
            return;
        }

        try {
            // Check if SKU exists
            const { data: existing } = await supabase
                .from('item_master')
                .select('sku')
                .eq('sku', sku)
                .single();

            if (existing) {
                setError("SKU already exists.");
                setLoading(false);
                return;
            }

            // Insert
            const { error: insertError } = await supabase
                .from('item_master')
                .insert({
                    sku: sku.trim(),
                    name: name || 'New Product',
                    barcode: barcode || null,
                    image: resolveProductImage(sku) // Default placeholder logic
                });

            if (insertError) throw insertError;

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#111112] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="text-blue-500" size={24} /> New Product
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">SKU / Item Number</label>
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. 0227NZ-010-L"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Description</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Product Name"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Barcode (Optional)</label>
                        <input
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            placeholder="Scanned Barcode"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-bold hover:bg-zinc-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating...' : <><Save size={18} /> Create Item</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateItemModal;
