# SWISH Deployment & Development Guide

## 1. How to Host (The "Single File" Magic)

Your application is configured to build into **one single file**: `dist/index.html`.

This means you **do not** need a complex server like Node.js, Vercel, or Netlify (though you can use them). You can host this file almost anywhere.

### Option A: The Simplest Way (Drag & Drop)
1.  **Run Build**: Run `npm run build` in Antigravity terminal.
2.  **Locate File**: Go to `e:\SWISH\capture-antigravity\dist\`.
3.  **Upload**: Drag `index.html` to any static hosting:
    *   **Google Drive / Dropbox**: (If configured for web hosting)
    *   **Internal Network Drive**: Just place it in a shared folder. Users can double-click it to open.
    *   **Netlify Drop**: Drag the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop).
    *   **S3 / Azure Blob Storage**: Upload as a static website.

### Option B: Local Network (No Internet)
Since you mentioned offline backup requirements previously:
1.  Copy `dist/index.html` to any USB drive or shared network folder.
2.  Anyone can double-click it. It will run in their browser without internet (standard data will work if CSV is embedded; Supabase sync will fail gracefully if offline).

## 2. How to Host 24/7 (Professional Web Hosting)

To make the app accessible to anyone with a link (and valid login), use **Netlify** or **Vercel**. These are free and professional standard.

### Recommended: Netlify Drop
1.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2.  Drag your `dist` folder (located in `e:\SWISH\capture-antigravity\dist`) onto the page.
3.  **Done!** Netlify will give you a URL (e.g., `https://swish-app-123.netlify.app`).
4.  Share this URL. Users will see the Login screen.
    *   **Security**: Only users with an approved email/password in your Supabase project can log in.
    *   **Updates**: To update, just run `npm run build` and drag the new `dist` folder to Netlify again.

---

## 3. How to Make Revisions in Antigravity

You can continue to use Antigravity to edit the site. Here is the workflow:

### Step 1: Start Development Mode
When you want to make changes, tell Antigravity:
> "Run npm run dev"

This opens the "Hot Reload" version (usually `localhost:5173`). Changes you make happen instantly here.

### Step 2: Make Changes
Ask Antigravity to change things normally:
> "Change the button color to blue"
> "Add a new column to the table"

### Step 3: Publish Changes (Build)
When you are happy with your changes, you must **re-build** the single file.
> "Run npm run build"

This updates the `dist/index.html` file. You then simply replace your old hosted `index.html` with this new one.

---

## Summary of Commands

| Goal | Command | Output |
| :--- | :--- | :--- |
| **Test/Edit** | `npm run dev` | Runs locally at `http://localhost:5173` |
| **Deploy** | `npm run build` | Creates `dist/index.html` (The final app) |
