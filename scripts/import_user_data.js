import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths (Corrected for location in /scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SWISH_ROOT = path.resolve(PROJECT_ROOT, '..'); // Folder containing retail_items.csv etc.

const RETAIL_CSV = path.join(SWISH_ROOT, 'retail_items.csv');
const TEAMWEAR_CSV = path.join(SWISH_ROOT, 'teamwear_items.csv');
const RETAIL_IMAGES_DIR = path.join(SWISH_ROOT, 'retail_images');
const TEAMWEAR_IMAGES_DIR = path.join(SWISH_ROOT, 'teamwear_images');

const OUTPUT_JSON = path.join(PROJECT_ROOT, 'src', 'data', 'products.json');
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'product-images');

// Ensure public images dir exists
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
}

// Helper: Scan directory for images
function getImageMap(dir) {
    const map = new Map();
    if (!fs.existsSync(dir)) return map;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            const baseName = path.parse(file).name.toUpperCase();
            map.set(baseName, {
                filename: file,
                fullPath: path.join(dir, file)
            });
        }
    });
    return map;
}

// Helper: Find image for SKU (Prefix Match)
function findImage(sku, imageMap) {
    if (!sku) return null;
    const normalizedSku = sku.toUpperCase();

    // 1. Exact Match
    if (imageMap.has(normalizedSku)) return imageMap.get(normalizedSku);

    // 2. Prefix Match (e.g. SKU "CT8532-111-7" matches Image "CT8532-111")
    // We iterate keys. Optimization: Could Sort valid keys, but Map iteration is OK for <10k.
    for (const [key, value] of imageMap.entries()) {
        if (normalizedSku.startsWith(key + '-') || normalizedSku === key) {
            return value;
        }
    }
    return null;
}

function processCsv(filePath, division, imageMap) {
    if (!fs.existsSync(filePath)) {
        console.warn(`WARNING: File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return records.map(record => {
        const sku = record.SKU || record.sku;
        const name = record.Description || record.description || record.Name || record.name || 'Unknown Product';
        const barcode = record.Barcode || record.barcode || '';
        const bin = record.Bin || record.bin || '';
        const qty = parseInt(record.Quantity || record.quantity || '0', 10);

        // Find Image
        let imagePath = null;
        const imageInfo = findImage(sku, imageMap);

        if (imageInfo) {
            // Copy image to public folder if not already there (or overwrite to ensure latest)
            const destPath = path.join(PUBLIC_IMAGES_DIR, imageInfo.filename);
            try {
                fs.copyFileSync(imageInfo.fullPath, destPath);
                imagePath = `/product-images/${imageInfo.filename}`;
            } catch (err) {
                console.error(`Error copying image for ${sku}:`, err);
            }
        }

        return {
            sku: sku,
            name: name,
            barcode: barcode,
            image: imagePath,
            warehouse: division === 'Retail' ? 'Courtside Retail' : 'Courtside Teamwear',
            status: 'Active',
            bin: bin,
            quantity: isNaN(qty) ? 0 : qty
        };
    });
}

// Main execution
console.log("Starting Import...");

// 1. Scan Images
console.log("Scanning Retail Images...");
const retailImages = getImageMap(RETAIL_IMAGES_DIR);
console.log(`Found ${retailImages.size} retail images.`);

console.log("Scanning Teamwear Images...");
const teamwearImages = getImageMap(TEAMWEAR_IMAGES_DIR);
console.log(`Found ${teamwearImages.size} teamwear images.`);

// 2. Process CSVs
console.log("Processing Retail CSV...");
const retailProducts = processCsv(RETAIL_CSV, 'Retail', retailImages);
console.log(`Parsed ${retailProducts.length} retail items.`);

console.log("Processing Teamwear CSV...");
const teamwearProducts = processCsv(TEAMWEAR_CSV, 'Teamwear', teamwearImages);
console.log(`Parsed ${teamwearProducts.length} teamwear items.`);

// 3. Merge & Save
const allProducts = [...teamwearProducts, ...retailProducts];

const outputData = {
    item_master: allProducts
};

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputData, null, 2));
console.log(`\nSUCCESS! Exported ${allProducts.length} products to ${OUTPUT_JSON}`);
