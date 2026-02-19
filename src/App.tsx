import React, { useState, useMemo } from 'react';
import { WarehouseDivision, NavigationItem, Product, Task } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ItemList from './components/ItemList'; // Use default import. Might need check if it was named.
import PickOrders from './components/PickOrders';
import PutAway from './components/PutAway';
import Replenishment from './components/Replenishment';
// Database component might need refactor later, but passing props for now is safe.
import Database from './components/Database';
import Tasks from './components/Tasks';
import ApiSettings from './components/ApiSettings';
import Setup from './components/Setup';
import PasteParse from './components/PasteParse';
import Login from './components/Login';
import { supabase } from './lib/supabase';
import { ChevronDown, Search, Bell, Loader2 } from 'lucide-react';
import { useData } from './context/DataContext';

// Memoize components to prevent unnecessary re-renders on navigation
const MemoizedSidebar = React.memo(Sidebar);
const MemoizedDashboard = React.memo(Dashboard);
const MemoizedItemList = React.memo(ItemList);
const MemoizedPickOrders = React.memo(PickOrders);
const MemoizedPutAway = React.memo(PutAway);
const MemoizedReplenishment = React.memo(Replenishment);
const MemoizedDatabase = React.memo(Database);
const MemoizedTasks = React.memo(Tasks);
const MemoizedApiSettings = React.memo(ApiSettings);
const MemoizedSetup = React.memo(Setup);
const MemoizedPasteParse = React.memo(PasteParse);

const App: React.FC = () => {
  // 1. Get Global Data from Context
  const { products, tasks, loading, session, refreshData } = useData();

  // 2. Local UI State
  const [activeTab, setActiveTab] = useState<NavigationItem>('Overview');
  const [warehouse, setWarehouse] = useState<WarehouseDivision>(WarehouseDivision.TEAMWEAR);
  const [isWarehouseMenuOpen, setIsWarehouseMenuOpen] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<NavigationItem>>(new Set(['Overview']));

  // Local state for tasks if needed for legacy compatibility
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Sync tasks from context when they change
  React.useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Track visited tabs
  React.useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      return new Set(prev).add(activeTab);
    });
  }, [activeTab]);

  // 3. Filtering logic
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: Product) => p.warehouse === warehouse);
  }, [products, warehouse]);

  // 4. Render Layout (Robust version)
  const renderContent = () => {
    // If no products yet but logged in, show a sub-loader for the specific tab
    if (products.length === 0 && activeTab !== 'Setup' && activeTab !== 'API') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p>Preparing {activeTab} data...</p>
        </div>
      );
    }

    return (
      <>
        <div style={{ display: activeTab === 'Overview' ? 'block' : 'none' }}>
          {visitedTabs.has('Overview') && <MemoizedDashboard products={filteredProducts} />}
        </div>
        <div style={{ display: activeTab === 'Item List' ? 'block' : 'none' }}>
          {visitedTabs.has('Item List') && <MemoizedItemList products={products} />}
        </div>
        <div style={{ display: activeTab === 'Pick Orders' ? 'block' : 'none' }}>
          {visitedTabs.has('Pick Orders') && <MemoizedPickOrders />}
        </div>
        <div style={{ display: activeTab === 'Paste & Parse' ? 'block' : 'none' }}>
          {visitedTabs.has('Paste & Parse') && <MemoizedPasteParse products={filteredProducts} activeWarehouse={warehouse} />}
        </div>
        <div style={{ display: activeTab === 'Put Away' ? 'block' : 'none' }}>
          {visitedTabs.has('Put Away') && <MemoizedPutAway products={filteredProducts} />}
        </div>
        <div style={{ display: activeTab === 'Replenishment' ? 'block' : 'none' }}>
          {visitedTabs.has('Replenishment') && <MemoizedReplenishment />}
        </div>
        <div style={{ display: activeTab === 'Tasks' ? 'block' : 'none' }}>
          {visitedTabs.has('Tasks') && <MemoizedTasks tasks={localTasks} setTasks={setLocalTasks} />}
        </div>
        <div style={{ display: activeTab === 'Database' ? 'block' : 'none' }}>
          {visitedTabs.has('Database') && <MemoizedDatabase products={filteredProducts} setProducts={() => console.warn("Direct setProducts deprecated. Use Context.")} />}
        </div>
        <div style={{ display: activeTab === 'API' ? 'block' : 'none' }}>
          {visitedTabs.has('API') && <MemoizedApiSettings />}
        </div>
        <div style={{ display: activeTab === 'Setup' ? 'block' : 'none' }}>
          {visitedTabs.has('Setup') && <MemoizedSetup currentWarehouse={warehouse} onImportComplete={refreshData} />}
        </div>
      </>
    );
  };

  return (
    <div className="h-screen bg-[#0a0a0b] overflow-hidden text-[#e4e4e7] relative">

      {/* 1. Loading Screen Overlay - High Priority */}
      <div
        style={{
          display: loading ? 'flex' : 'none',
          zIndex: 100
        }}
        className="absolute inset-0 bg-[#0a0a0b] flex flex-col gap-6 items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">SWISH</h1>
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </div>

        <div className="flex flex-center gap-3 text-zinc-400 text-sm font-medium bg-zinc-900/50 px-6 py-3 rounded-2xl border border-zinc-800">
          <Loader2 className="animate-spin text-blue-500" size={18} />
          <span>Synchronizing Warehouse OS...</span>
        </div>
      </div>

      {/* 2. Login View */}
      <div
        style={{
          display: !loading && !session ? 'block' : 'none',
          zIndex: 50
        }}
        className="absolute inset-0 bg-[#0a0a0b]"
      >
        <Login />
      </div>

      {/* 3. Main App View */}
      <div
        style={{
          display: !loading && session ? 'flex' : 'none',
          zIndex: 10
        }}
        className="flex h-full w-full"
      >
        <MemoizedSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Top Header */}
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold">{activeTab}</h1>

              {/* Warehouse Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsWarehouseMenuOpen(!isWarehouseMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-sm font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  {warehouse}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isWarehouseMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isWarehouseMenuOpen && (
                  <div className="absolute top-full mt-2 left-0 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                    {Object.values(WarehouseDivision).map(div => (
                      <button
                        key={div}
                        onClick={() => {
                          setWarehouse(div);
                          setIsWarehouseMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${warehouse === div ? 'text-blue-400' : 'text-zinc-400'}`}
                      >
                        {div}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Operational Mode</span>
                <span className="text-xs text-zinc-200 font-medium">{session?.user?.email}</span>
              </div>

              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs font-bold text-red-500 hover:text-white transition-all bg-red-500/5 hover:bg-red-500 px-4 py-2 rounded-xl border border-red-500/20"
              >
                Sign Out
              </button>

              <div className="relative group hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Universal search..."
                  className="bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-48 transition-all"
                />
              </div>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0b]"></span>
              </button>
            </div>
          </header>

          {/* Scrollable Page Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-7xl mx-auto h-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
