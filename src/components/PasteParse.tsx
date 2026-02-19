import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { RefreshCw, Download, AlertTriangle, FileText, ScanLine, ArrowRight, Trash2 } from 'lucide-react';
import { WarehouseDivision } from '../types';

interface PasteParseProps {
  products: Product[];
  activeWarehouse?: WarehouseDivision;
}

interface ParseResult {
  [bin: string]: {
    [barcode: string]: number;
  };
}

interface TableRow {
  bin: string;
  sku: string;
  name: string;
  barcode: string;
  quantity: number;
  matched: boolean;
}

const PasteParse: React.FC<PasteParseProps> = ({ products, activeWarehouse }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<ParseResult | null>(null);
  const [corrections, setCorrections] = useState<{ [original: string]: string }>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow | 'quantity'; direction: 'asc' | 'desc' }>({ key: 'bin', direction: 'asc' });

  // --- Parsing Logic ---
  const handleParse = () => {
    if (!input.trim()) return;

    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    const newResults: ParseResult = {};
    let currentBin: string | null = null;

    lines.forEach(line => {
      if (!/^\d+$/.test(line)) {
        // Bin Code (Non-numeric)
        currentBin = line;
        if (!newResults[currentBin]) newResults[currentBin] = {};
      } else if (currentBin) {
        // Barcode (Numeric)
        newResults[currentBin][line] = (newResults[currentBin][line] || 0) + 1;
      }
    });

    setResults(newResults);
    setCorrections({});
  };

  const handleClear = () => {
    setInput('');
    setResults(null);
    setCorrections({});
  };

  // --- Matching Logic & Memoization ---
  const { tableData, unknownRows, stats } = useMemo(() => {
    if (!results) return { tableData: [], unknownRows: [], stats: { items: 0, skus: 0, bins: 0 } };

    const data: TableRow[] = [];
    const unknowns: { bin: string; barcode: string; count: number }[] = [];
    const uniqueBarcodes = new Set<string>();
    let totalItems = 0;

    Object.entries(results).forEach(([bin, barcodes]) => {
      Object.entries(barcodes).forEach(([barcode, count]) => {
        const product = products.find(p => p.barcode === barcode);
        uniqueBarcodes.add(barcode);
        totalItems += count;

        const row: TableRow = {
          bin,
          barcode,
          quantity: count,
          sku: product ? product.sku : 'UNKNOWN',
          name: product ? product.name : 'Product not in database',
          matched: !!product
        };

        data.push(row);
        if (!product) unknowns.push({ bin, barcode, count });
      });
    });

    return {
      tableData: data,
      unknownRows: unknowns,
      stats: {
        items: totalItems,
        skus: uniqueBarcodes.size,
        bins: Object.keys(results).length
      }
    };
  }, [results, products]);

  // --- Sorting ---
  const sortedData = useMemo(() => {
    const sorted = [...tableData];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [tableData, sortConfig]);

  const handleSort = (key: keyof TableRow) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Exports ---
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMain = () => {
    let csv = 'Bin,SKU,Product Name,Quantity,Barcode\n';
    sortedData.forEach(row => {
      csv += `"${row.bin}","${row.sku}","${row.name}",${row.quantity},"${row.barcode}"\n`;
    });
    downloadCSV(csv, `parsed-inventory.csv`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-zinc-950 text-zinc-300">
      {/* 1. Header Section (Fixed) */}
      <div className="flex-none p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <ScanLine size={24} />
            </div>
            Paste & Parse
          </h2>
          <p className="text-zinc-500 text-sm mt-1 ml-11">Input raw scanner data to verify barcodes and analyze contents.</p>
        </div>

        <div className="flex gap-4">
          <StatCard label="Items" value={stats.items} />
          <StatCard label="Unique SKUs" value={stats.skus} />
          <StatCard label="Bins" value={stats.bins} />
        </div>
      </div>

      {/* 2. Main Content (Grow to fill remaining space) */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">

        {/* Left Panel: Input Data (Fixed Width - Narrower) */}
        <div className="w-[300px] flex flex-col bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shrink-0">
          {/* Panel Header */}
          <div className="flex-none p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-zinc-500" /> Input
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                title="Clear Input"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={handleParse}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <RefreshCw size={16} /> Parse
              </button>
            </div>
          </div>

          {/* Panel Body (Scrollable) */}
          <div className="flex-1 p-0 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'Paste scanner data here...'}
              className="absolute inset-0 w-full h-full bg-transparent border-none focus:ring-0 p-4 font-mono text-sm text-zinc-300 resize-none selection:bg-blue-500/30 outline-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Arrow (Visual Separator) */}
        <div className="flex-none flex items-center justify-center text-zinc-700">
          <ArrowRight size={32} />
        </div>

        {/* Right Panel: Parsed Results */}
        <div className="flex-1 flex flex-col bg-[#111112] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Panel Header */}
          <div className="flex-none p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
            <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wider flex items-center gap-2">
              <RefreshCw size={16} className="text-zinc-500" /> Results
            </h3>
            <button
              onClick={exportMain}
              disabled={!results}
              className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Panel Body (Scrollable Table) */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/80 text-zinc-500 font-bold uppercase text-xs sticky top-0 backdrop-blur-sm z-10 shadow-sm">
                <tr>
                  {['bin', 'sku', 'name', 'barcode', 'quantity'].map((k) => (
                    <th key={k} onClick={() => handleSort(k as keyof TableRow)} className={`px-6 py-4 cursor-pointer hover:text-zinc-300 select-none ${k === 'bin' ? 'w-48' : ''}`}>
                      <div className="flex items-center gap-1">
                        {k} {sortConfig.key === k && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-zinc-600">
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={48} className="opacity-20" />
                        <p>No data parsed yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, i) => (
                    <tr key={i} className={`group transition-colors border-l-2 ${row.matched ? 'border-emerald-500 bg-transparent hover:bg-zinc-800/30' : 'border-red-500 bg-red-500/5 hover:bg-red-500/10'}`}>
                      <td className="px-6 py-4 font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">{row.bin}</td>
                      <td className={`px-6 py-4 font-bold ${row.matched ? 'text-zinc-200' : 'text-red-400'}`}>{row.sku}</td>
                      <td className="px-6 py-4 text-zinc-400 truncate max-w-[300px]">{row.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-600">{row.barcode}</td>
                      <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${row.quantity > 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-400'}`}>{row.quantity}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

// Stateless Components
const StatCard = ({ label, value }: { label: string, value: number }) => (
  <div className="flex flex-col items-end">
    <span className="text-2xl font-black text-white leading-none">{value}</span>
    <span className="text-xs font-bold text-zinc-500 uppercase">{label}</span>
  </div>
);

export default PasteParse;
