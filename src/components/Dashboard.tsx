
import React from 'react';
import { Product, Task } from '../types';
import { STAT_CARDS } from '../constants';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
// Added Package to the lucide-react imports to fix the "Cannot find name 'Package'" error
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Package } from 'lucide-react';

const PICK_ACTIVITY_DATA = [
  { name: 'Apr 10', units: 850 },
  { name: 'Apr 11', units: 1100 },
  { name: 'Apr 12', units: 980 },
  { name: 'Apr 13', units: 1450 },
  { name: 'Apr 14', units: 1200 },
  { name: 'Apr 15', units: 1320 },
  { name: 'Apr 16', units: 1284 },
];

interface DashboardProps {
  products: Product[];
  tasks?: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, idx) => (
          <div key={idx} className="bg-[#111112] border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <button className="text-zinc-600 hover:text-zinc-400"><MoreHorizontal size={18} /></button>
            </div>
            <p className="text-sm text-zinc-500 mb-1 font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold mb-2 tracking-tight">{stat.value}</h3>
            <div className="flex items-center gap-1.5">
              {stat.trend.includes('+') ? <ArrowUpRight size={14} className="text-emerald-400" /> : stat.trend.includes('-') ? <ArrowDownRight size={14} className="text-pink-400" /> : null}
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${stat.trend.includes('+') ? 'text-emerald-400' : stat.trend.includes('-') ? 'text-pink-400' : 'text-zinc-500'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Mini Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Picking Activity Chart */}
        <div className="lg:col-span-2 bg-[#111112] border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-bold">Picking Activity</h3>
              <p className="text-xs text-zinc-500 mt-1">Number of units picked per day</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Units Picked</div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PICK_ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', color: '#3b82f6' }}
                  formatter={(value) => [`${value} Units`, 'Picked']}
                />
                <Area type="monotone" dataKey="units" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUnits)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Aisles / Priority Areas */}
        <div className="bg-[#111112] border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold">Picking Volume by Aisle</h3>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Aisle 1C (Small Items)', val: 85, color: 'bg-blue-500' },
              { name: 'Aisle 1A (Bulk)', val: 62, color: 'bg-emerald-500' },
              { name: 'Aisle 1G (Retail)', val: 48, color: 'bg-indigo-500' },
              { name: 'Aisle 1B (Sortation)', val: 30, color: 'bg-orange-500' },
            ].map((aisle, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-zinc-300">{aisle.name}</span>
                  <span className="text-zinc-500">{aisle.val}%</span>
                </div>
                <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${aisle.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${aisle.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Selling Products Table */}
      <div className="bg-[#111112] border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-8 flex justify-between items-center border-b border-zinc-800">
          <h3 className="text-lg font-bold">Top Picked Products (Last 24h)</h3>
          <button className="text-sm font-medium text-zinc-500 hover:text-white">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800">
                <th className="px-8 py-4 font-semibold">Product Name</th>
                <th className="px-8 py-4 font-semibold text-right">Picked Qty</th>
                <th className="px-8 py-4 font-semibold">Last Bin</th>
                <th className="px-8 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((p, i) => (
                <tr key={i} className="group hover:bg-zinc-800/30 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 overflow-hidden relative`}>
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.sku}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${p.image ? 'hidden' : ''}`}>
                          <Package size={18} />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{p.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm font-bold text-right text-blue-400">24 units</td>
                  <td className="px-8 py-4 text-sm text-zinc-400 font-mono">{p.bin || 'Unknown'}</td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${(p.quantity || 0) > 20 ? 'bg-emerald-500' : (p.quantity || 0) > 0 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                      <span className="text-xs font-medium text-zinc-300">{(p.quantity || 0) > 20 ? 'In Stock' : (p.quantity || 0) > 0 ? 'Low quantity' : 'Out of Stock'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
