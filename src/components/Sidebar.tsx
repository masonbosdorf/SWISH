
import { NavigationItem } from '../types';
import { NAV_ITEMS, PREFERENCES } from '../constants';
import { MoreHorizontal } from 'lucide-react';
import courtsideMonoLogo from '../assets/CourtSide_CS_Monogram_Negative.png';
import swooshLogo from '../assets/002_nike-logos-swoosh-white.png';
import jordanLogo from '../assets/006_nike-logos-jordan-white.png';

interface SidebarProps {
  activeTab: NavigationItem;
  setActiveTab: (tab: NavigationItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col bg-[#0f0f10] h-full shadow-2xl z-30">
      {/* Primary Branding Block */}
      <div className="p-6 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            {/* Using the CourtSide Monogram as the main app icon */}
            <img
              src={courtsideMonoLogo}
              alt="C"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">SWISH</span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-1">Warehouse OS</span>
          </div>
        </div>

        {/* Highlighted Branding Area (Logo Container) */}
        <div className="pt-2">
          <div className="w-full bg-zinc-900/40 rounded-2xl border border-zinc-800/60 p-4 flex flex-row items-center justify-between gap-2 transition-all hover:bg-zinc-800/60 hover:border-zinc-700/60">
            {/* First Logo: Courtside Basketball (White PNG) */}
            <div className="flex-1 h-20 flex items-center justify-center">
              <img
                src={swooshLogo}
                alt="Courtside Logo"
                className="max-h-full max-w-full object-contain"
                loading="eager"
              />
            </div>

            <div className="w-px h-12 bg-zinc-800"></div>

            {/* Second Logo: Pacific Team Sports (White PNG) */}
            <div className="flex-1 h-16 flex items-center justify-center">
              <img
                src={jordanLogo}
                alt="Pacific Team Sports Logo"
                className="max-h-full max-w-full object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold px-3 mb-3">Warehouse Management</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name as NavigationItem)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${activeTab === item.name
              ? 'bg-blue-600/10 text-white border border-blue-500/20'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
              }`}
          >
            {activeTab === item.name && (
              <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full"></div>
            )}
            <span className={`transition-colors duration-200 ${activeTab === item.name ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
              {item.icon}
            </span>
            <span className="text-sm font-semibold">{item.name}</span>
          </button>
        ))}

        <div className="pt-8 mb-3 text-[10px] uppercase tracking-wider text-zinc-600 font-bold px-3">System</div>
        {PREFERENCES.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name as NavigationItem)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${activeTab === item.name
              ? 'bg-blue-600/10 text-white border border-blue-500/20'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
              }`}
          >
            <span className={`transition-colors duration-200 ${activeTab === item.name ? 'text-blue-400' : 'group-hover:text-zinc-400'}`}>{item.icon}</span>
            <span className="text-sm font-semibold">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Profile / Context Footer */}
      <div className="p-4 border-t border-zinc-800/60 mt-auto bg-gradient-to-t from-zinc-950 to-transparent">
        <div className="bg-zinc-900/30 rounded-2xl p-3 border border-zinc-800/50 flex items-center gap-3 hover:bg-zinc-800/30 transition-colors cursor-pointer group">
          <div className="relative">
            <img
              src="https://picsum.photos/seed/courtside/40/40"
              alt="User"
              className="w-9 h-9 rounded-lg object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-200 truncate leading-tight">Floor Supervisor</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-tighter mt-0.5 font-semibold font-mono">ID: CS-9921</p>
          </div>
          <MoreHorizontal size={16} className="text-zinc-600 group-hover:text-zinc-400" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
