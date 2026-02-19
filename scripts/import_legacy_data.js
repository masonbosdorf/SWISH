import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const RAW_DIR = path.resolve('.'); // Root directory where files are dropped

// File Names
const FILES = {
    QTY: 'TW QTY LIST.csv',        // SKU, Bin, Quantity
    ITEMS: 'TW Item List.csv',     // Item Number, Description
    BARCODE1: 'barcode2.csv',      // Barcode, SKU
    BARCODE2: 'barcodes tw.csv'    // Item Number, Barcode
};

async function importData() {
    console.log('Starting Legacy Data Processing...');

    // 1. Read and Parse Files
    const qtyData = parseCsv(FILES.QTY);
    const itemData = parseCsv(FILES.ITEMS);
    const barcode1Data = parseCsv(FILES.BARCODE1);
    const barcode2Data = parseCsv(FILES.BARCODE2);

    console.log(`Loaded:
  - ${qtyData.length} qty records
  - ${itemData.length} item records
  - ${barcode1Data.length} barcode1 records
  - ${barcode2Data.length} barcode2 records`);

    // 2. Build Master Map: SKU -> Product Data
    const products = new Map();

    // Helper to get/init product
    const getProduct = (sku) => {
        if (!sku) return null;
        const cleanSku = sku.trim();
        if (!products.has(cleanSku)) {
            products.set(cleanSku, {
                sku: cleanSku,
                name: null,
                barcode: null,
                inventory: []
            });
        }
        return products.get(cleanSku);
    };

    // A. Process Items (Names)
    itemData.forEach(row => {
        const sku = row['Item Number'] || row['Item Number '];
        const name = row['Description']?.trim();
        if (sku) {
            const p = getProduct(sku);
            if (p) p.name = name;
        }
    });

    // B. Process Barcodes
    // File 1: Barcode, SKU
    barcode1Data.forEach(row => {
        const sku = row['SKU'];
        const barcode = row['Barcode'];
        if (sku && barcode) {
            const p = getProduct(sku);
            if (p && !p.barcode) p.barcode = barcode.toString().trim();
        }
    });

    // File 2: Item Number, Barcode
    barcode2Data.forEach(row => {
        const sku = row['Item Number'];
        const barcode = row['Barcode'];
        if (sku && barcode) {
            const p = getProduct(sku);
            if (p && !p.barcode) p.barcode = barcode.toString().trim();
        }
    });

    // C. Process Inventory
    qtyData.forEach(row => {
        const sku = row['SKU'];
        let bin = row['Bin']?.trim();
        const qty = parseInt(row['Quantity'] || '0', 10);

        if (sku) {
            const p = getProduct(sku);
            if (p) {
                if (bin === '*') bin = 'Unassigned';
                p.inventory.push({ bin, quantity: qty });
            }
        }
    });

    console.log(`Consolidated ${products.size} unique products.`);

    // 3. Prepare Output Arrays
    const masterRecords = [];
    const inventoryRecords = [];

    for (const p of products.values()) {
        // Fill missing name
        const name = p.name || `Product ${p.sku}`;

        masterRecords.push({
            sku: p.sku,
            name: name,
            barcode: p.barcode || '',
            image: null
        });

        // Inventory
        if (p.inventory.length > 0) {
            p.inventory.forEach(inv => {
                inventoryRecords.push({
                    sku: p.sku,
                    bin: inv.bin,
                    quantity: inv.quantity,
                    warehouse: 'Courtside Teamwear', // Matching enum value from types.ts
                });
            });
        }
    }

    // 4. Write to JSON
    const output = {
        item_master: masterRecords,
        inventory: inventoryRecords
    };

    const outputPath = path.join(path.resolve('src/data'), 'legacy_seed.json');

    // Ensure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Successfully wrote seed data to ${outputPath}`);
    console.log(`Stats: ${masterRecords.length} Items, ${inventoryRecords.length} Inventory records.`);
}

function parseCsv(filename) {
    try {
        const filePath = path.join(RAW_DIR, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filename}`);
            return [];
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const cleanContent = content.replace(/^\uFEFF/, '');
        return parse(cleanContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
    } catch (e) {
        console.error(`Error parsing ${filename}:`, e);
        return [];
    }
}

importData().catch(console.error);
