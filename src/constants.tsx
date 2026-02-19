import {
  LayoutDashboard,
  ArrowDownToLine,
  Database,
  CheckSquare,
  Settings,
  HelpCircle,
  Package,
  ShoppingCart,
  Zap,
  Truck,
  Code,
  List,
  ClipboardList,
  RefreshCw,
  ScanLine
} from 'lucide-react';
import { Product, Task } from './types';

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_TASKS: Task[] = [];

export const NAV_ITEMS = [
  { name: 'Overview', icon: <LayoutDashboard size={20} /> },
  { name: 'Item List', icon: <List size={20} /> },
  { name: 'Pick Orders', icon: <ClipboardList size={20} /> },
  { name: 'Paste & Parse', icon: <ScanLine size={20} /> },
  { name: 'Put Away', icon: <ArrowDownToLine size={20} /> },
  { name: 'Replenishment', icon: <RefreshCw size={20} /> },
  { name: 'Tasks', icon: <CheckSquare size={20} /> },
  { name: 'Database', icon: <Database size={20} /> },
  { name: 'API', icon: <Code size={20} /> },
];

export const PREFERENCES = [
  { name: 'Help & Support', icon: <HelpCircle size={20} /> },
  { name: 'Settings', icon: <Settings size={20} /> },
  { name: 'Setup', icon: <Database size={20} /> },
];

export const STAT_CARDS = [
  { label: 'RTP Orders Total', value: '42', trend: 'Ready to Pick', icon: <ShoppingCart size={20} />, color: 'bg-blue-500/20 text-blue-400' },
  { label: 'Units Picked (24h)', value: '1,284', trend: '+12% vs yesterday', icon: <Zap size={20} />, color: 'bg-emerald-500/20 text-emerald-400' },
  { label: 'Orders Dispatched (24h)', value: '156', trend: '+8% vs yesterday', icon: <Truck size={20} />, color: 'bg-indigo-500/20 text-indigo-400' },
  { label: 'Total Units in WH', value: '48,784', trend: 'Current Stock Level', icon: <Package size={20} />, color: 'bg-orange-500/20 text-orange-400' },
];
