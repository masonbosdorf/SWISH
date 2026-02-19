import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { resolveProductImage } from '../utils/imageMap';
import { Upload, CheckCircle, FileText, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { WarehouseDivision } from '../types';

interface SetupProps {
    currentWarehouse: WarehouseDivision;
    onImportComplete: () => void;
}

const Setup: React.FC<SetupProps> = ({ currentWarehouse, onImportComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [log, setLog] = useState<string[]>([]);

    const REQUIRED_HEADERS = ['Item Number', 'Description', 'Barcode'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Handle different newline formats
            const rows = text.split(/\r\n|\n/).map(row => row.split(','));

            // Clean headers: trim whitespace, remove quotes
            const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, ''));

            // Validate headers
            const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
            if (missing.length > 0) {
                alert(`Missing required headers: ${missing.join(', ')}\n\nFound: ${headers.join(', ')}`);
                setFile(null);
                return;
            }

            // Map data
            const data = rows.slice(1)
                .filter(r => r.length > 1) // basic empty row check
                .map(row => {
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        // Handle CSV quotes if simple split was used (Note: for robust parsing, a library is better, 
                        // but strictly following user format "Item Number,Description,Barcode" usually implies simple CSV)
                        // formatting the value
                        let val = row[i]?.trim() || '';
                        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                        obj[h] = val;
                    });
                    return obj;
                })
                .filter(r => r['Item Number']); // Ensure SKU exists

            setPreviewData(data);
            setLog(prev => [`Loaded ${data.length} items from ${file.name}`]);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setIsProcessing(true);
        setProgress(0);
        setLog([]);

        const total = previewData.length;
        const BATCH_SIZE = 100;
        let processed = 0;
        let errors = 0;

        try {
            // Prepare payload
            // Deduplicate items based on SKU
            const uniqueItemsMap = new Map();
            previewData.forEach(row => {
                const sku = row['Item Number'];
                if (sku) {
                    uniqueItemsMap.set(sku, {
                        sku: sku,
                        name: row['Description'] || 'Unknown',
                        barcode: row['Barcode'] || null,
                        image: resolveProductImage(sku),
                        warehouse: currentWarehouse // Use the prop!
                    });
                }
            });

            const itemsToUpsert = Array.from(uniqueItemsMap.values());

            // Batch Upsert
            for (let i = 0; i < itemsToUpsert.length; i += BATCH_SIZE) {
                const batch = itemsToUpsert.slice(i, i + BATCH_SIZE);

                const { error } = await supabase
                    .from('item_master')
                    .upsert(batch, { onConflict: 'sku' });

                if (error) {
                    console.error('Batch error:', error);
                    setLog(prev => [...prev, `Error batch ${i}: ${error.message}`]);
                    errors += batch.length;
                } else {
                    processed += batch.length;
                }

                setProgress(Math.round(((processed + errors) / total) * 100));
            }

            setLog(prev => [...prev, `Completed! Processed: ${processed}, Errors: ${errors}`]);
            if (errors === 0) {
                alert(`Successfully imported ${processed} items into ${currentWarehouse}.`);
                // Reset
                setFile(null);
                setPreviewData([]);

                // Refresh data in parent instead of reload
                if (onImportComplete) onImportComplete();
            } else {
                alert(`Import completed with ${errors} errors. Check console.`);
            }

        } catch (err: any) {
            console.error(err);
            alert(`Critical Import Error: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black tracking-tight">System Configuration</h2>
                <p className="text-zinc-500 max-w-lg mx-auto">
                    Upload your master item list to populate the database.
                    <br />
                    <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded mt-2 inline-block text-zinc-400">
                        Target Warehouse: <span className="text-blue-400">{currentWarehouse}</span>
                    </span>
                </p>
            </div>

            <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                <div className="space-y-6">
                    {/* File Drop / Input */}
                    {!file ? (
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-48 opacity-0 cursor-pointer z-10"
                            />
                            <div className="h-48 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-blue-500/30 group-hover:scale-110 transition-all">
                                    <FileText size={32} className="text-zinc-500 group-hover:text-blue-500" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-lg text-zinc-300">Upload Item Setup CSV</p>
                                    <p className="text-sm text-zinc-500">Drag & drop or click to browse</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between animate-in zoom-in-95">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-200">{file.name}</p>
                                    <p className="text-xs text-zinc-500">{previewData.length} items detected</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setPreviewData([]); setLog([]); }}
                                disabled={isProcessing}
                                className="px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Progress & Logs */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                <span>Processing Database</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    {previewData.length > 0 && !isProcessing && (
                        <button
                            onClick={handleImport}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-zinc-200 transition-all shadow-lg shadow-white/10 active:scale-[0.99] flex items-center justify-center gap-3"
                        >
                            <RefreshCw size={24} />
                            Import {previewData.length} Items to {currentWarehouse}
                        </button>
                    )}

                    {log.length > 0 && (
                        <div className="mt-4 p-4 bg-black/50 rounded-xl border border-zinc-900 max-h-32 overflow-y-auto font-mono text-xs text-zinc-500">
                            {log.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-orange-200/60 text-sm">
                <AlertTriangle size={20} className="shrink-0 mt-0.5 text-orange-400" />
                <p>
                    Ensure your CSV has exactly these headers:
                    <strong className="text-orange-200 ml-1">Item Number, Description, Barcode</strong>.
                    <br />
                    Existing SKUs will be updated. New SKUs will be created. Images are matched automatically by SKU.
                </p>
            </div>
        </div>
    );
};

export default Setup;
