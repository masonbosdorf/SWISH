
export enum WarehouseDivision {
  TEAMWEAR = 'Courtside Teamwear',
  RETAIL = 'Courtside Retail'
}

export type Product = {
  sku: string;
  name: string;
  barcode: string;
  bin?: string;
  quantity?: number;
  warehouse: WarehouseDivision;
  // status is now computed based on API or just placeholder
  status: 'Active' | 'Inactive' | 'Archived';
  image?: string;
};

export type ParseResult = {
  bin: string;
  sku: string;
  name: string;
  barcode: string;
  qty: number;
  isUnknown?: boolean;
};

export type TaskStatus = 'Open' | 'In Progress' | 'Complete';

export type Task = {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  due: string;
  status: TaskStatus;
};

export type NavigationItem = 'Overview' | 'Item List' | 'Pick Orders' | 'Paste & Parse' | 'Put Away' | 'Replenishment' | 'Tasks' | 'Database' | 'API' | 'Setup';
