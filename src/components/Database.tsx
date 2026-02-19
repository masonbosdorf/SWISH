import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Download, Package, FileText, Edit, ArrowUpDown, ChevronUp, ChevronDown, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import SearchInput from './SearchInput';
import CreateItemModal from './CreateItemModal';
import { useData } from '../context/DataContext';
// @ts-ignore
import { TableVirtuoso } from 'react-virtuoso';

interface DatabaseProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>; // Kept for compatibility but we use Context for writes
}

interface SizedVariant {
  size: string;
  sku: string; // The specific SKU for this size
  barcode: string; // Representative barcode
}

interface StyleGroup {
  style: string; // The "Style-Colour" (e.g. 0227NZ-010)
  name: string;
  status: 'Active' | 'Inactive' | 'Archived';
  image?: string;
  variants: SizedVariant[];
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

const Database: React.FC<DatabaseProps> = ({ products, setProducts }) => { // Products prop comes from App (Filtered)
  const { refreshData, lastSynced, updateProduct, loading, session, csvStats } = useData(); // Global Context

  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImageStyle, setEditingImageStyle] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Time since last sync
  const [timeSinceSync, setTimeSinceSync] = useState<string>('');

  useEffect(() => {
    if (!lastSynced) return;
    const interval = setInterval(() => {
      const diff = Math.floor((new Date().getTime() - lastSynced.getTime()) / 60000);
      setTimeSinceSync(diff < 1 ? 'Just now' : `${diff} minutes ago`);
    }, 10000); // Update every 10s

    const diff = Math.floor((new Date().getTime() - lastSynced.getTime()) / 60000);
    setTimeSinceSync(diff < 1 ? 'Just now' : `${diff} minutes ago`);

    return () => clearInterval(interval);
  }, [lastSynced]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: 'style' | 'variants' | 'status'; direction: 'asc' | 'desc' } | null>(null);


  // Helper: Extract Style-Colour
  const getStyleColour = (sku: string) => {
    // Assumption: SKU format is Style-Colour-Size (e.g. 0227NZ-010-L)
    // We want the first two parts: 0227NZ-010
    const parts = sku.split('-');
    if (parts.length >= 2) return parts.slice(0, 2).join('-');
    return sku;
  };

  // Helper: Extract Size
  const getSize = (sku: string) => {
    const parts = sku.split('-');
    if (parts.length >= 3) return parts.slice(2).join('-');
    return 'OS'; // One Size / Unknown
  };

  // Helper: Sort Sizes
  const sortVariants = (variants: SizedVariant[]) => {
    return variants.sort((a, b) => {
      const idxA = SIZE_ORDER.indexOf(a.size);
      const idxB = SIZE_ORDER.indexOf(b.size);
      // If both are standard sizes, compare indices
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      // If one is standard, it comes first
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      // Otherwise alphabetic
      return a.size.localeCompare(b.size);
    });
  };

  // Group Products by Style-Colour -> then by Size
  // Note: 'products' prop is used here, so we see the FILTERED list.
  const styleGroups = useMemo(() => {
    const groups = new Map<string, StyleGroup>();

    products.forEach(p => {
      const style = getStyleColour(p.sku);
      const size = getSize(p.sku);

      if (!groups.has(style)) {
        groups.set(style, {
          style,
          name: p.name,
          status: p.status || 'Active',
          image: p.image,
          variants: []
        });
      }

      const group = groups.get(style)!;

      // Find existing variant for this size (should be unique per style-size)
      let variant = group.variants.find(v => v.size === size);

      // If duplicate size exists, we might have data issue, but let's just push unique ones or update?
      // Ideally distinct SKU = distinct size in this logic.
      if (!variant) {
        variant = { size, sku: p.sku, barcode: p.barcode };
        group.variants.push(variant);
      } else {
        // If we found a duplicate size, maybe update barcode if missing?
        if (!variant.barcode && p.barcode) variant.barcode = p.barcode;
      }

      // Determine image (first one found)
      if (!group.image && p.image) group.image = p.image;
    });

    // Finalize groups
    return Array.from(groups.values()).map(g => ({
      ...g,
      variants: sortVariants(g.variants)
    }));
  }, [products]);

  // Filter & Sort Groups
  const filteredGroups = useMemo(() => {
    let result = styleGroups.filter(g => {
      const lowerSearch = search.toLowerCase();
      return (g.style?.toLowerCase() || '').includes(lowerSearch) ||
        (g.name?.toLowerCase() || '').includes(lowerSearch) ||
        g.variants.some(v => (v.sku?.toLowerCase() || '').includes(lowerSearch) || (v.barcode?.toLowerCase() || '').includes(lowerSearch));
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        if (sortConfig.key === 'variants') {
          valA = a.variants.length;
          valB = b.variants.length;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [styleGroups, search, sortConfig]);


  const requestSort = (key: 'style' | 'variants' | 'status') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: 'style' | 'variants' | 'status') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="text-zinc-600" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-blue-400" /> : <ChevronDown size={14} className="text-blue-400" />;
  };


  const handleBarcodeChange = async (sku: string, newBarcode: string) => {
    // Optimistic Update via Context
    updateProduct(sku, { barcode: newBarcode });

    // DB Update (Using item_master or inventory table - assuming item_master for now based on previous code)
    const { error } = await supabase
      .from('item_master')
      .update({ barcode: newBarcode })
      .eq('sku', sku);

    if (error) {
      console.error('Failed to update barcode:', error);
      // alert('Failed to save barcode.'); // Silent fail or toast is better, but alert is fine for internal tool
    }
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingImageStyle) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;

        // 1. Optimistic Update (All products with this style)
        // We find all SKUs from the *filtered* list that match.
        const skusToUpdate = products
          .filter(p => getStyleColour(p.sku) === editingImageStyle)
          .map(p => p.sku);

        // Update each in Context
        skusToUpdate.forEach(sku => {
          updateProduct(sku, { image: dataUrl });
        });

        setEditingImageStyle(null);

        // 2. DB Update
        if (skusToUpdate.length > 0) {
          const { error } = await supabase
            .from('item_master')
            .update({ image: dataUrl })
            .in('sku', skusToUpdate);

          if (error) {
            console.error("Image upload failed", error);
            alert("Failed to save image to database.");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {showCreateModal && (
        <CreateItemModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            alert("Product Created! It will appear shortly.");
            refreshData(); // Refresh to show new item
          }}
        />
      )}
      <div className="flex justify-between items-end">
        <div>
          {/* Header with Refresh Info */}
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Database</h2>
            <button
              onClick={() => refreshData()}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading && session ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <p className="text-zinc-500">Manage product styles, barcodes, and images.</p>
            {lastSynced && (
              <span className="text-xs text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50">
                Last synced: {timeSinceSync}
              </span>
            )}
          </div>

        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 text-sm font-bold bg-zinc-900 border border-zinc-800 rounded-xl hover:text-white transition-colors">
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={18} /> New Product
          </button>
        </div>
      </div>

      {/* Validation Banner */}
      {csvStats && (csvStats.duplicates > 0 || csvStats.missingFields > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-amber-500 text-sm">Data Validation Issues</h4>
            <p className="text-xs text-amber-200/70 mt-1">
              Found {csvStats.duplicates} duplicate items and {csvStats.missingFields} items with missing fields in the loaded dataset.
            </p>
          </div>
        </div>
      )}
      {/* Success Banner */}
      {csvStats && csvStats.duplicates === 0 && csvStats.missingFields === 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-500 shrink-0" size={20} />
          <div>
            <h4 className="font-bold text-emerald-500 text-sm">Data Validation Passed</h4>
            <p className="text-xs text-emerald-200/70 mt-1">
              Successfully loaded {csvStats.total} items with no issues.
            </p>
          </div>
        </div>
      )}

      <div className="bg-[#111112] border border-zinc-800 rounded-3xl overflow-visible shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 flex gap-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search by Style, SKU, or Name..."
              onSearch={setSearch}
            />
          </div>
        </div>

        <div className="overflow-visible">
          <TableVirtuoso
            style={{ height: 'calc(100vh - 300px)' }}
            data={filteredGroups}
            components={{
              Scroller: React.forwardRef<HTMLDivElement, any>((props, ref) => <div {...props} ref={ref} className="custom-scrollbar" />),
              Table: (props: any) => <table {...props} className="w-full text-left border-collapse" />,
              TableHead: React.forwardRef<HTMLTableSectionElement, any>((props, ref) => <thead {...props} ref={ref} className="text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900/20" />),
              TableRow: (props: any) => <tr {...props} className="group hover:bg-zinc-900/40 transition-colors relative" />,
              TableBody: React.forwardRef<HTMLTableSectionElement, any>((props, ref) => <tbody {...props} ref={ref} className="divide-y divide-zinc-800" />),
            }}
            fixedHeaderContent={() => (
              <tr>
                <th className="px-6 py-4 font-semibold w-24 bg-[#111112]">Image</th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-zinc-800/50 transition-colors select-none group bg-[#111112]"
                  onClick={() => requestSort('style')}
                >
                  <div className="flex items-center gap-2">
                    Style Info {getSortIcon('style')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold text-center w-32 cursor-pointer hover:bg-zinc-800/50 transition-colors select-none group bg-[#111112]"
                  onClick={() => requestSort('variants')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Sizes {getSortIcon('variants')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 font-semibold cursor-pointer hover:bg-zinc-800/50 transition-colors select-none group bg-[#111112]"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status {getSortIcon('status')}
                  </div>
                </th>
              </tr>
            )}
            itemContent={(index: number, g: StyleGroup) => (
              <>
                <td className="px-6 py-4">
                  {/* Image with Edit Overlay */}
                  <div className="group/image relative w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    {g.image ? (
                      <img src={g.image} alt={g.style} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-zinc-700" />
                    )}

                    {/* Edit Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        setEditingImageStyle(g.style);
                        fileInputRef.current?.click();
                      }}
                    >
                      <Edit size={16} className="text-white" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    {/* Interactive Style Name triggering Popup */}
                    <div className="group/bubble relative inline-block">
                      <span className="font-bold text-lg text-zinc-200 font-mono group-hover:text-blue-400 transition-colors cursor-help border-b border-dashed border-zinc-700 pb-0.5">
                        {g.style}
                      </span>

                      {/* STYLE VARIANTS POPUP */}
                      <div className="absolute top-full left-0 mt-2 w-96 bg-[#18181b] border border-zinc-700/50 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-hover/bubble:opacity-100 group-hover/bubble:visible transition-all duration-200 z-50 translate-y-2 group-hover/bubble:translate-y-0 before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-4">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Variants (Sizes)</span>
                          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Editable Barcodes</span>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                          {g.variants.map((v: SizedVariant, vIdx: number) => (
                            <div key={vIdx} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold text-zinc-300">Size: {v.size}</p>
                                  <span className="text-[10px] text-zinc-600 font-mono">{v.sku}</span>
                                </div>
                              </div>
                              <div className="w-40">
                                <input
                                  type="text"
                                  value={v.barcode || ''}
                                  onChange={(e) => handleBarcodeChange(v.sku, e.target.value)}
                                  title="Edit Barcode"
                                  placeholder="Barcode..."
                                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 font-medium mt-1">{g.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 border border-zinc-700">
                    {g.variants.length}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${g.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    g.status === 'Inactive' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${g.status === 'Active' ? 'bg-emerald-500' :
                      g.status === 'Inactive' ? 'bg-zinc-500' :
                        'bg-red-500'
                      }`}></span>
                    {g.status}
                  </span>
                </td>
              </>
            )}
          />
        </div>
        {filteredGroups.length === 0 && (
          <div className="py-20 text-center text-zinc-600">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">No results found for "{search}"</p>
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
};
export default Database;
