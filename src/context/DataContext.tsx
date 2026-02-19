import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Task, WarehouseDivision } from '../types';
import { resolveProductImage } from '../utils/imageMap';
import { supabase } from '../lib/supabase';

interface DataContextType {
    products: Product[];
    tasks: Task[];
    loading: boolean;
    dataLoaded: boolean; // New flag to distinguish between first load and empty state
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
    dataLoaded: false,
    refreshData: async () => { },
    updateProduct: () => { },
    session: null,
    lastSynced: null,
    csvStats: null,
});

declare global {
    interface Window {
        swishProducts: Product[];
    }
}

export const useData = () => useContext(DataContext);

// Simple global cache to persist data even if the component unmounts (rare in this app but good practice)
let cachedProducts: Product[] = [];
let cachedTasks: Task[] = [];
let isDataFetched = false;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>(cachedProducts);
    const [tasks, setTasks] = useState<Task[]>(cachedTasks);
    const [loading, setLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(isDataFetched);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [csvStats, setCsvStats] = useState<{ total: number; duplicates: number; missingFields: number } | null>(null);

    // 1. Auth Initialization
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                setLoading(false);
                setDataLoaded(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            if (!session) {
                setProducts([]);
                setTasks([]);
                cachedProducts = [];
                cachedTasks = [];
                isDataFetched = false;
                setDataLoaded(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Data Fetching Logic (Asynchronous & Cached)
    const loadData = useCallback(async (force = false) => {
        if (!session) return;

        // If already loaded and not forcing, just use cache
        if (isDataFetched && !force) {
            setLoading(false);
            setDataLoaded(true);
            return;
        }

        setLoading(true);

        try {
            console.log("Fetching primary warehouse data...");

            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const productsData = await response.json();

            let localProducts: Product[] = [];
            if (productsData && productsData.item_master) {
                localProducts = productsData.item_master.map((p: any) => ({
                    ...p,
                    warehouse: p.warehouse === 'Retail' ? WarehouseDivision.RETAIL : (p.warehouse || WarehouseDivision.TEAMWEAR),
                    status: p.status || 'Active',
                    quantity: typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity || '0', 10),
                    image: p.image || resolveProductImage(p.sku)
                }));
            }

            // Update local state and global cache
            setProducts(localProducts);
            cachedProducts = localProducts;
            window.swishProducts = localProducts;

            const { data: tasksData } = await supabase.from('tasks').select('*');
            if (tasksData) {
                setTasks(tasksData);
                cachedTasks = tasksData;
            }

            isDataFetched = true;
            setDataLoaded(true);
            setLastSynced(new Date());

        } catch (error) {
            console.error("Data loading failed:", error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    // 3. Trigger Load IMMEDIATELY on Session Change
    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session, loadData]);

    const updateProduct = useCallback((sku: string, updates: Partial<Product>) => {
        setProducts(prev => {
            const newProducts = prev.map((p: Product) => p.sku === sku ? { ...p, ...updates } : p);
            cachedProducts = newProducts;
            window.swishProducts = newProducts;
            return newProducts;
        });
    }, []);

    return (
        <DataContext.Provider value={{
            products,
            tasks,
            loading,
            dataLoaded,
            refreshData: () => loadData(true), // Refresh forces a reload
            updateProduct,
            session,
            lastSynced,
            csvStats
        }}>
            {children}
        </DataContext.Provider>
    );
};
