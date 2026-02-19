import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Task, WarehouseDivision } from '../types';
import productsData from '../data/products.json';
import { resolveProductImage } from '../utils/imageMap';
import { supabase } from '../lib/supabase';

interface DataContextType {
    products: Product[];
    tasks: Task[];
    loading: boolean;
    refreshData: () => Promise<void>;
    updateProduct: (sku: string, updates: Partial<Product>) => void;
    session: any;
    lastSynced: Date | null;
    csvStats: { total: number; duplicates: number; missingFields: number } | null;
}

const DataContext = createContext<DataContextType>({
    products: [],
    tasks: [],
    loading: true,
    refreshData: async () => { },
    updateProduct: () => { },
    session: null,
    lastSynced: null,
    csvStats: null,
});

export const useData = () => useContext(DataContext);

declare global {
    interface Window {
        swishProducts: Product[];
    }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [csvStats, setCsvStats] = useState<{ total: number; duplicates: number; missingFields: number } | null>(null);

    // 1. Auth Initialization
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) setLoading(false); // If no session, stop loading (show login)
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            if (!session) {
                setProducts([]);
                setTasks([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Data Fetching Logic
    const loadData = useCallback(async () => {
        if (!session) return;
        setLoading(true);

        try {
            // C. Load from Local JSON (The source of truth for this migration)
            let localProducts: Product[] = [];
            try {
                // @ts-ignore
                if (productsData && productsData.item_master) {
                    // @ts-ignore
                    localProducts = productsData.item_master.map((p: any) => ({
                        ...p,
                        // Ensure defaults
                        warehouse: p.warehouse === 'Retail' ? WarehouseDivision.RETAIL : (p.warehouse || WarehouseDivision.TEAMWEAR),
                        status: p.status || 'Active',
                        quantity: typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity || '0', 10)
                    }));
                }
                console.log(`Loaded ${localProducts.length} items from generated JSON.`);
            } catch (err) {
                console.error("Failed to load local products JSON", err);
            }

            // D. Merge & Store (Prioritize Local JSON)
            const combinedProducts = localProducts;

            setProducts(combinedProducts);
            window.swishProducts = combinedProducts; // CRITICAL: Expose to window

            // D. Fetch Tasks
            const { data: tasksData } = await supabase.from('tasks').select('*');
            if (tasksData) setTasks(tasksData);

            setLastSynced(new Date());

        } catch (error) {
            console.error("Data loading failed:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // 3. Trigger Load on Session
    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session, loadData]);

    // 4. Realtime Subscription (Optional tweak: Update memory on change)
    useEffect(() => {
        // We can keep the subscriptions from App.tsx here if we want auto-updates.
        // For Single File logic: "Supabase Writes Only When Data Changes... Update window.swishProducts"
        // So if WE make a change, we update local state.
        // If OTHER users make a change, we might want to listen.
        // Let's keep it simple for now and rely on manual refresh or write-updates.
        // But re-implementing the subscription is safer for sync.
        if (!session) return;

        const handleUpdate = () => {
            // Debounce or just simple refresh? 
            // "Stop querying Supabase for every read." - Realtime updates are PUSH, so valid.
            // But maybe too heavy to re-fetch ALL on every change. 
            // Ideally we just update the specific item.
            // For this refactor, let's stick to "Refresh" button for big syncs, 
            // or specific granular updates if we implement them.
            // Requirement: "Supabase Writes Only When Data Changes... Update window.swishProducts"
            // This implies the WRITER updates their cache.
        };

        // Leaving subscriptions disabled for now to strictly follow "Stop querying Supabase" 
        // and ensure manual control, unless requested.
    }, [session]);

    // 5. Update Product Helper
    // 5. Update Product Helper
    const updateProduct = useCallback((sku: string, updates: Partial<Product>) => {
        setProducts(prev => prev.map((p: Product) => p.sku === sku ? { ...p, ...updates } : p));
    }, []);

    return (
        <DataContext.Provider value={{ products, tasks, loading, refreshData: loadData, updateProduct, session, lastSynced, csvStats }}>
            {children}
        </DataContext.Provider>
    );
};
