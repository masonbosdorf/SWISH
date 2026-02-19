
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or SERVICE_ROLE if RLS issues, but ANON usually fine for this if policies allow
// Ideally use SERVICE_ROLE for admin tasks
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log("Starting Data Population...");

    // 1. Read files
    const barcodePath = path.join(__dirname, '../barcode2.csv');
    const twListPath = path.join(__dirname, '../TW Item List.csv');
    const productsDir = path.join(__dirname, '../public/product-images');

    // 2. Parse Barcodes
    console.log("Reading Barcodes...");
    const barcodeContent = fs.readFileSync(barcodePath, 'utf-8');
    const barcodeRecords = parse(barcodeContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
    // Map: SKU -> Barcode
    const barcodeMap = new Map();
    barcodeRecords.forEach(r => {
        if (r.SKU) barcodeMap.set(r.SKU, r.Barcode);
    });

    // 3. Parse Names
    console.log("Reading Names...");
    const twContent = fs.readFileSync(twListPath, 'utf-8');
    const twRecords = parse(twContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
    // Map: SKU -> Description
    const nameMap = new Map();
    twRecords.forEach(r => {
        if (r['Item Number']) nameMap.set(r['Item Number'], r['Description']);
    });

    // 4. Map Images
    console.log("Mapping Images...");
    const imageFiles = fs.readdirSync(productsDir);
    // Map: BaseName (Style-Colour) -> FileName
    // Logic from imageMap.ts: "0227NZ-010-L" starts with "0227NZ-010"
    // We will just store all files and do a find like the app does, or pre-optimize.
    // For script speed, let's just use the same find logic per item.

    const resolveImage = (sku) => {
        if (!sku) return null;
        const normalizedSku = sku.toUpperCase();

        const matched = imageFiles.find(filename => {
            const baseName = filename.substring(0, filename.lastIndexOf('.')).toUpperCase();
            // Check prefix (Style-Colour match)
            if (normalizedSku === baseName || normalizedSku.startsWith(baseName + '-')) {
                return true;
            }
            return false;
        });

        return matched ? `/product-images/${matched}` : null;
    };


    // 5. Combine Data
    console.log("combining Data...");
    const allSkus = new Set([...barcodeMap.keys(), ...nameMap.keys()]);
    const upsertPayload = [];

    for (const sku of allSkus) {
        if (!sku || sku === 'SKU' || sku === 'Item Number') continue; // header guard

        const name = nameMap.get(sku) || 'Unknown Product'; // Default name if only in barcode file
        const barcode = barcodeMap.get(sku) || null;
        const image = resolveImage(sku);

        upsertPayload.push({
            sku,
            name,
            barcode,
            image
            // status: 'Active' // Column missing in DB, defaulting in UI
        });
    }

    console.log(`Prepared ${upsertPayload.length} items for upsert.`);

    // 6. Upsert to Supabase
    // Batching
    const batchSize = 100;
    for (let i = 0; i < upsertPayload.length; i += batchSize) {
        const batch = upsertPayload.slice(i, i + batchSize);
        const { error } = await supabase.from('item_master').upsert(batch, { onConflict: 'sku' });

        if (error) {
            console.error(`Error upserting batch ${i}:`, error.message);
        } else {
            console.log(`Upserted batch ${i} - ${i + batch.length}`);
        }
    }

    console.log("Population Complete!");
}

main().catch(err => console.error(err));
