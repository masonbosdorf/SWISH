# SWISH — Paste & Parse Feature
## Antigravity Replication Prompt

---

## What This Feature Does

Paste & Parse is the primary daily-use tool in SWISH. Warehouse staff copy raw barcode scan data from a scanning session — a block of plain text alternating between bin location codes and product barcodes — paste it into a text area, and the system parses it into a clean structured table.

The parsed results are matched against a product database (products array with SKU, name, barcode fields). Results are displayed in a sortable table and can be exported in multiple CSV formats depending on the warehouse division.

---

## Layout

Split two-panel layout side by side:

- **Left panel (25% width):** Raw text input area + Parse and Clear buttons
- **Drag handle:** A vertical draggable divider between the two panels allowing the user to resize them
- **Right panel (75% width):** All results stacked vertically:
  1. Results table
  2. Unknown Barcodes section
  3. WMS Export section (Teamwear only)
  4. Positive Adjustment section (Retail only)
  5. Zero-Out section (Retail only)

A toggle button switches between horizontal (side by side) and vertical (stacked) layout.

Three stat cards sit above the layout showing live counts after parsing:
- Items Scanned (total units)
- Unique SKUs
- Unique Bins

---

## Input Format

Raw paste data alternates between bin codes (non-numeric strings) and barcodes (numeric-only strings):

```
1C-05-042
0123456789012
0123456789012
1G-04-018
9876543210987
```

**Parse logic:**
- Lines that are purely numeric = barcode scan
- Lines that are NOT purely numeric = bin location code
- Each barcode is grouped under the most recently seen bin
- Duplicate barcodes in the same bin are summed (quantity counted)

---

## Results Table

Columns: **Bin | SKU | Item Name | Barcode | Quantity**

- Each row = one unique barcode in one bin
- SKU and Name are looked up from the product database by matching barcode
- If no match found: SKU shows as `UNKNOWN`, Name shows as `Product not in database` in red italic
- All columns are sortable (click header to sort ascending/descending, click again to reverse)
- Quantity shown as a pill badge e.g. `3x`
- Table has sticky header and scrolls vertically with max height

---

## Unknown Barcodes Section

Appears below the main results table. Shows only rows where the barcode did not match any product in the database.

- Section header shows count: `⚠️ Unknown Barcodes (4)` in red
- If zero unknowns: header turns green and shows `✅ Unknown Barcodes`
- Each row has an **editable barcode input field** (inline in the table)
- When a user edits a barcode input, the field border turns green to indicate a pending change
- A **Refresh Data** button at the top right of this section re-runs the match with corrected barcodes
- On refresh: corrected barcodes are re-matched against the product database. Successfully matched rows move to the main results table and disappear from the Unknown section
- Corrections are applied to the underlying data (`lastParseResults`) so subsequent exports reflect the fix

---

## Export Sections

### WMS Export (Teamwear division only)
Datapel WMS import format. Columns:
`LOCATION, BIN, ITEM NUMBER, BATCH-SERIAL, LOT, EXPIRY, COUNT, COMMENT, UNIT, UOM`

Fixed values: LOCATION = `PTS-BULK`, BATCH-SERIAL = `~`, LOT = `0`, EXPIRY = `-`, UNIT = `-`, UOM = `1`

Export button downloads as: `WMS-Datapel-[WarehouseName].csv`

### Positive Adjustment (Retail division only)
NetSuite inventory adjustment format. Columns:
`Internal ID, Adjustment Date, Location - Store - Warehouse, ExternalID, Bin, Adjust Qty By`

- Internal ID is blank
- Adjustment Date = today's date
- Location = `Store - Warehouse`
- ExternalID = SKU

Export button downloads as: `Positive-Adjustment-NetSuite-[date].csv`

### Zero-Out (Retail division only)
Separate upload area accepts a NetSuite stock report CSV (columns: `Item, Bin Number, On Hand`). Generates a negative adjustment CSV to zero out existing stock before a recount. Upload via click or drag-and-drop.

---

## Behaviour Rules

- Parse sections (WMS, Positive Adjustment, Zero-Out) show/hide based on active warehouse:
  - Teamwear: show WMS Export only
  - Retail: show Positive Adjustment and Zero-Out only
- Switching warehouse clears all parse data and resets stats to 0
- Clear button resets input, all results, all stats, all export tables
- `lastParseResults` is the single source of truth — all display functions read from it
- `window.barcodeCorrections` stores pending edits as `{ originalBarcode: correctedBarcode }`
- On Refresh: corrections applied to `lastParseResults`, then all sections re-render from updated data, then `barcodeCorrections` is cleared

---

## CSS Notes

- Resizable drag handle between panels: 10px wide, `cursor: col-resize`, blue highlight on hover
- Parse textarea: monospace font, `height: 250px`, `resize: none`
- Editable barcode inputs: monospace, red text by default, green border + green text when edited (`.edited` class)
- Quantity badge (`.upc-count`): pill shape, gradient background mauve→pink
- Results container: `max-height: 650px`, scrollable
- Unknown barcodes section: red border by default, green border when all resolved
- All tables: sticky thead, alternating row styling, sortable headers with ▲▼ indicators
