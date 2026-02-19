-- Migration Script: Remove Bin and Quantity Columns
-- Run this in the Supabase SQL Editor

-- 1. Remove columns from 'inventory' table (or wherever they are stored)
-- Based on previous context, 'inventory' seemed to be the main table for bins.
-- If 'item_master' also had them, remove them there too.

ALTER TABLE public.inventory DROP COLUMN IF EXISTS bin;
ALTER TABLE public.inventory DROP COLUMN IF EXISTS quantity;

-- If you have a separate 'products' table that mirrored this:
-- ALTER TABLE public.products DROP COLUMN IF EXISTS bin;
-- ALTER TABLE public.products DROP COLUMN IF EXISTS quantity;

-- 2. Ensure 'item_master' or 'inventory' (whichever is now the main product table) 
-- has the necessary fields: sku, name, barcode, image.
-- (Assuming 'item_master' is the reference table)

-- Example:
-- ALTER TABLE public.item_master ADD COLUMN IF NOT EXISTS image text;
