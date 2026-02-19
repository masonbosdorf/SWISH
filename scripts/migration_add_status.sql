ALTER TABLE item_master ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
