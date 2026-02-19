import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import {
  Search,
  Package,
  Filter,
  ArrowUpRight,
  ChevronDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowDownAZ,
  ArrowUpAZ,
  Box
} from 'lucide-react';
// @ts-ignore
import { TableVirtuoso } from 'react-virtuoso';

interface ItemListProps {
  products: Product[];
}

interface AggregatedProduct {
  sku: string;
  name: string;
  totalQty: number;
  status: 'In Stock' | 'Low quantity' | 'Out of Stock' | 'Zero Stock';
  image?: string;
  bins: Array<{ bin: string; qty: number }>;
}

import SearchInput from './SearchInput';

const ItemList: React.FC<ItemListProps> = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [binSortBy, setBinSortBy] = useState<'qty' | 'bin'>('qty');
  const [binSortOrder, setBinSortOrder] = useState<'asc' | 'desc'>('desc');

  const [sortConfig, setSortConfig] = useState<{ key: 'sku' | 'totalQty', direction: 'asc' | 'desc' } | null>(null);

  // Aggregate Data by SKU
  const aggregatedProducts = useMemo(() => {
    const map = new Map<string, AggregatedProduct>();

    products.forEach(p => {
      if (!map.has(p.sku)) {
        map.set(p.sku, {
          sku: p.sku,
          name: p.name,
          totalQty: 0,
          status: 'Zero Stock', // Will recalculate
          image: p.image,
          bins: []
        });
      }
      const item = map.get(p.sku)!;
      item.totalQty += (p.quantity || 0);

      // Aggregate bins
      const binName = p.bin || 'Unknown';
      const qty = p.quantity || 0;

      const existingBin = item.bins.find(b => b.bin === binName);
      if (existingBin) {
        existingBin.qty += qty;
      } else {
        item.bins.push({ bin: binName, qty: qty });
      }
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      status: (item.totalQty === 0 ? 'Zero Stock' : item.totalQty < 20 ? 'Low quantity' : 'In Stock') as AggregatedProduct['status']
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    // 1. Filter
    let result = aggregatedProducts.filter(p =>
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.name.toLowerCase().includes(lowerQuery) ||
      p.bins.some(b => b.bin.toLowerCase().includes(lowerQuery))
    );

    // 2. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [aggregatedProducts, searchQuery, sortConfig]);

  const requestSort = (key: 'sku' | 'totalQty') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: 'sku' | 'totalQty') => {
    if (!sortConfig || sortConfig.key !== key) return <ChevronDown size={14} className="text-zinc-600 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUpAZ size={14} className="text-blue-400" /> : <ArrowDownAZ size={14} className="text-blue-400" />;
  };

  const getSortedBins = (bins: Array<{ bin: string; qty: number }>) => {
    return [...bins].sort((a, b) => {
      if (binSortBy === 'qty') {
        return binSortOrder === 'desc' ? b.qty - a.qty : a.qty - b.qty;
      } else {
        return binSortOrder === 'asc'
          ? a.bin.localeCompare(b.bin)
          : b.bin.localeCompare(a.bin);
      }
    });
  };

  const toggleSort = (by: 'qty' | 'bin') => {
    if (binSortBy === by) {
      setBinSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setBinSortBy(by);
      setBinSortOrder(by === 'qty' ? 'desc' : 'asc'); // Default desc for qty, asc for bin
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Item List</h2>
          <p className="text-zinc-500 mt-2">Global inventory overview.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by SKU, Description, or Bin (Press Enter)..."
            onSearch={setSearchQuery}
          />
        </div>
        <button className="px-6 rounded-2xl bg-[#111112] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all flex items-center gap-2">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-[#111112] border border-zinc-800 rounded-3xl overflow-visible shadow-sm">
        <div className="h-[calc(100vh-250px)]">
          {filteredProducts.length > 0 ? (
            <TableVirtuoso<AggregatedProduct>
              style={{ height: '100%' }}
              data={filteredProducts}
              components={{
                Scroller: React.forwardRef<HTMLDivElement, any>((props, ref) => <div {...props} ref={ref} className="custom-scrollbar" />),
                Table: (props: any) => <table {...props} className="w-full text-left border-collapse" />,
                TableHead: React.forwardRef<HTMLTableSectionElement, any>((props, ref) => <thead {...props} ref={ref} className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900/20" />),
                TableRow: (props: any) => <tr {...props} className="group hover:bg-zinc-900/40 transition-colors relative" />,
                TableBody: React.forwardRef<HTMLTableSectionElement, any>((props, ref) => <tbody {...props} ref={ref} className="divide-y divide-zinc-800" />),
              }}
              fixedHeaderContent={() => (
                <tr>
                  <th className="px-6 py-4 font-semibold w-20 bg-[#111112]">Image</th>
                  <th
                    className="px-6 py-4 font-semibold cursor-pointer hover:bg-zinc-800/50 transition-colors select-none group bg-[#111112]"
                    onClick={() => requestSort('sku')}
                  >
                    <div className="flex items-center gap-2">
                      SKU / Description {getSortIcon('sku')}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 font-semibold w-48 cursor-pointer hover:bg-zinc-800/50 transition-colors select-none group bg-[#111112]"
                    onClick={() => requestSort('totalQty')}
                  >
                    <div className="flex items-center gap-2">
                      Total Quantity {getSortIcon('totalQty')}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold bg-[#111112]">Status</th>
                  <th className="px-6 py-4 font-semibold text-right bg-[#111112]">Actions</th>
                </tr>
              )}
              itemContent={(index: number, p: AggregatedProduct) => (
                <>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 overflow-hidden relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.sku}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center ${p.image ? 'hidden' : ''}`}>
                        <Package size={20} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="font-bold text-lg text-zinc-200 group-hover:text-blue-400 transition-colors font-mono tracking-tight">{p.sku}</p>
                      <p className="text-sm text-zinc-500 line-clamp-1">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 relative">
                    {/* Interactive Quantity Cell */}
                    <div className="group/bubble inline-block relative">
                      <div className="flex items-baseline gap-1 cursor-help">
                        <span className="text-2xl font-black text-zinc-200 tracking-tight">{p.totalQty}</span>
                        <span className="text-xs font-semibold text-zinc-500">units</span>
                        <ChevronDown size={12} className="text-zinc-600 opacity-0 group-hover/bubble:opacity-100 transition-opacity" />
                      </div>

                      {/* THE BIN BUBBLE */}
                      <div className="absolute top-full left-0 mt-2 w-64 bg-[#18181b] border border-zinc-700/50 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover/bubble:opacity-100 group-hover/bubble:visible transition-all duration-200 z-50 translate-y-2 group-hover/bubble:translate-y-0 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-4">

                        {/* Header / Sort Controls */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bin Locations</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => toggleSort('bin')}
                              title="Sort by Bin Name"
                              className={`p-1 rounded hover:bg-zinc-800 ${binSortBy === 'bin' ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-600'}`}
                            >
                              {binSortOrder === 'asc' ? <ArrowDownAZ size={14} /> : <ArrowUpAZ size={14} />}
                            </button>
                            <button
                              onClick={() => toggleSort('qty')}
                              title="Sort by Quantity"
                              className={`p-1 rounded hover:bg-zinc-800 ${binSortBy === 'qty' ? 'text-blue-400 bg-blue-400/10' : 'text-zinc-600'}`}
                            >
                              {binSortOrder === 'desc' ? <ArrowDownWideNarrow size={14} /> : <ArrowUpNarrowWide size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Bin List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {getSortedBins(p.bins).map((bin, idx) => (
                            <div key={idx} className="flex items-center justify-between group/bin p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Box size={12} className="text-zinc-600 group-hover/bin:text-blue-500 transition-colors" />
                                <span className="text-sm font-mono font-medium text-zinc-300 group-hover/bin:text-white transition-colors">{bin.bin}</span>
                              </div>
                              <span className="text-xs font-bold text-zinc-500 group-hover/bin:text-emerald-400 transition-colors bg-zinc-900 px-2 py-1 rounded border border-zinc-800 group-hover/bin:border-emerald-500/20 group-hover/bin:bg-emerald-500/10">
                                {bin.qty} units
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${p.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'Low quantity' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'In Stock' ? 'bg-emerald-500' :
                        p.status === 'Low quantity' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></span>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </>
              )}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-zinc-500">
              <Search size={32} className="text-zinc-700" />
              <p>No items found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemList;
