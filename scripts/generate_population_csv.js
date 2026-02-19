
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = () => {
    console.log("Generating Population CSV...");

    const barcodePath = path.join(__dirname, '../barcode2.csv');
    const twListPath = path.join(__dirname, '../TW Item List.csv');
    const outputPath = path.join(__dirname, '../population_import.csv');

    // Read Barcodes
    const barcodeContent = fs.readFileSync(barcodePath, 'utf-8');
    const barcodeRecords = parse(barcodeContent, { columns: true, skip_empty_lines: true, trim: true });
    const barcodeMap = new Map();
    barcodeRecords.forEach(r => {
        if (r.SKU) barcodeMap.set(r.SKU, r.Barcode);
    });

    // Read Names
    const twContent = fs.readFileSync(twListPath, 'utf-8');
    const twRecords = parse(twContent, { columns: true, skip_empty_lines: true, trim: true });
    const nameMap = new Map();
    twRecords.forEach(r => {
        if (r['Item Number']) nameMap.set(r['Item Number'], r['Description']);
    });

    // Combine
    const allSkus = new Set([...barcodeMap.keys(), ...nameMap.keys()]);
    const outputRows = [];
    outputRows.push(['Item Number', 'Name', 'Barcode']); // Header

    for (const sku of allSkus) {
        if (!sku || sku === 'SKU' || sku === 'Item Number') continue;
        const name = nameMap.get(sku) || 'Unknown Product';
        const barcode = barcodeMap.get(sku) || '';

        // Escape quotes to be safe CSV
        const safeName = `"${name.replace(/"/g, '""')}"`;
        outputRows.push([sku, safeName, barcode]);
    }

    const csvContent = outputRows.map(row => row.join(',')).join('\n');
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Generated ${outputPath} with ${outputRows.length - 1} rows.`);
};

run();
