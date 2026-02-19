import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Task, WarehouseDivision } from '../types';
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
        // Step A: Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            // If no session, we can stop loading early to show the login screen
            if (!session) setLoading(false);
        });

        // Step B: Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setSession(session);
            if (!session) {
                // Clear state on sign out
                setProducts([]);
                setTasks([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Data Fetching Logic (Asynchronous)
    const loadData = useCallback(async () => {
        // Safety: Don't fetch data if not logged in
        if (!session) return;
        
        // Show loading state while fetching large JSON
        setLoading(true);

        try {
            console.log("Fetching primary warehouse data...");
            
            // C. Load from Public JSON (Asynchronously to avoid blocking the UI bundle)
            const response = await fetch('/data/products.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const productsData = await response.json();
            
            let localProducts: Product[] = [];
            if (productsData && productsData.item_master) {
                localProducts = productsData.item_master.map((p: any) => ({
                    ...p,
                    // Ensure defaults and normalization
                    warehouse: p.warehouse === 'Retail' ? WarehouseDivision.RETAIL : (p.warehouse || WarehouseDivision.TEAMWEAR),
                    status: p.status || 'Active',
                    quantity: typeof p.quantity === 'number' ? p.quantity : parseInt(p.quantity || '0', 10),
                    // Ensure resolveProductImage is used if image URL is missing
                    image: p.image || resolveProductImage(p.sku)
                }));
            }

            console.log(`Loaded ${localProducts.length} items from products.json.`);

            // D. Push to State & Window (for legacy component access if any)
            setProducts(localProducts);
            window.swishProducts = localProducts; 

            // E. Fetch Realtime Tasks from Supabase
            const { data: tasksData, error: taskError } = await supabase.from('tasks').select('*');
            if (taskError) console.error("Error fetching tasks:", taskError);
            if (tasksData) setTasks(tasksData);

            setLastSynced(new Date());

        } catch (error) {
            console.error("Data loading failed (Critical Performance Error):", error);
            // Even if it fails, we should stop the loading state so the user isn't stuck
        } finally {
            setLoading(false);
        }
    }, [session]);

    // 3. Trigger Load on Session Change
    useEffect(() => {
        if (session) {
            loadData();
        }
    }, [session, loadData]);

    // 4. Update Product Helper (Granular State Updates)
    const updateProduct = useCallback((sku: string, updates: Partial<Product>) => {
        setProducts(prev => {
            const newProducts = prev.map((p: Product) => p.sku === sku ? { ...p, ...updates } : p);
            window.swishProducts = newProducts;
            return newProducts;
        });
    }, []);

    return (
        <DataContext.Provider value={{ products, tasks, loading, refreshData: loadData, updateProduct, session, lastSynced, csvStats }}>
            {children}
        </DataContext.Provider>
    );
};
