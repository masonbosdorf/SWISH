# SWISH - Capture Antigravity Setup

## Quick Start on New Machine

This project has been cleaned for transfer. Follow these steps to get running:

### 1. Restore Dependencies
Open a terminal in this folder and run:
```bash
npm install
```
This will download all necessary packages (recreating the `node_modules` folder we deleted).

### 2. Run Locally
To start the development server:
```bash
npm run dev
```

### 3. Build for Production
If you need to deploy:
```bash
npm run build
```

---

## File Structure Changes
- **`data/`**: Creates `data/` folder containing all CSV files (`TW Item List.csv`, `ns products.csv`, etc.).
- **`docs/`**: Creates `docs/` folder containing documentation and prototypes.
- **`src/`**: Source code remains unchanged.

## Required Environment
- Node.js (v18+ recommended)
- Supabase credentials in `.env` (ensure this file is present, or recreate it from your saved credentials).
