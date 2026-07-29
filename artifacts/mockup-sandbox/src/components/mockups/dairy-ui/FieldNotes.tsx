import React from 'react';
import { 
  LayoutDashboard, 
  HeartPulse, 
  Wallet, 
  Bell, 
  Search, 
  Plus, 
  MoreHorizontal,
  ArrowUpRight,
  Droplet,
  IndianRupee,
  Calendar,
  Settings,
  LogOut,
  Tractor
} from 'lucide-react';

// Using standard Tailwind classes for maximum reliability and 0 dependencies
export function FieldNotes() {
  const stats = [
    {
      title: "Total Cattle",
      value: "142",
      change: "+2 this month",
      trend: "up",
      icon: <Tractor className="w-5 h-5 text-indigo-600" />
    },
    {
      title: "Today's Milk",
      value: "924 L",
      change: "+18 L vs yesterday",
      trend: "up",
      icon: <Droplet className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Revenue (MTD)",
      value: "₹ 3,42,500",
      change: "+12% vs last month",
      trend: "up",
      icon: <IndianRupee className="w-5 h-5 text-emerald-600" />
    },
    {
      title: "Health Alerts",
      value: "3 Due",
      change: "2 Vaccinations, 1 Checkup",
      trend: "neutral",
      icon: <HeartPulse className="w-5 h-5 text-rose-500" />
    }
  ];

  const cattle = [
    { tag: "IND-4821", name: "Lakshmi", breed: "HF Cross", status: "Milking", yield: "18.5 L", fat: "3.8%", lastCheck: "2 days ago" },
    { tag: "IND-4822", name: "Ganga", breed: "Sahiwal", status: "Milking", yield: "12.0 L", fat: "4.5%", lastCheck: "1 week ago" },
    { tag: "IND-4825", name: "Gauri", breed: "Gir", status: "Dry", yield: "-", fat: "-", lastCheck: "3 days ago" },
    { tag: "IND-4829", name: "Nandini", breed: "HF Cross", status: "Milking", yield: "19.2 L", fat: "3.9%", lastCheck: "Today" },
    { tag: "IND-4830", name: "Kapila", breed: "Jersey Cross", status: "Pregnant", yield: "-", fat: "-", lastCheck: "2 weeks ago" },
    { tag: "IND-4833", name: "Bhavani", breed: "Sahiwal", status: "Milking", yield: "11.5 L", fat: "4.6%", lastCheck: "Yesterday" },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Milking': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Dry': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pregnant': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}} />

      {/* Sidebar */}
      <div className="w-64 bg-[#0a0e17] text-slate-400 flex flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Logo area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
                <Droplet className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">OurDairy</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 space-y-1">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 mt-4 px-3">Farm Management</div>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-white/10 text-white rounded-md transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span className="font-medium text-sm">Dashboard</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <Tractor className="w-4 h-4" />
              <span className="font-medium text-sm">Cattle Registry</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <Droplet className="w-4 h-4" />
              <span className="font-medium text-sm">Milk Logs</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <HeartPulse className="w-4 h-4" />
              <span className="font-medium text-sm">Health & Vet</span>
            </a>
            
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 hover:text-white rounded-md transition-colors">
              <IndianRupee className="w-4 h-4" />
              <span className="font-medium text-sm">Finances</span>
            </a>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium shadow-sm">
              RK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Rajesh Kumar</div>
              <div className="text-xs text-slate-500 truncate">Farm Manager</div>
            </div>
            <Settings className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Farm Overview</h1>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search cattle, tags..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
              />
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              Add Reading
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-slate-900 tracking-tight mb-1">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-500">{stat.title}</div>
                  </div>
                  <div className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Cattle Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Active Cattle Registry</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Manage and monitor your livestock</p>
                </div>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors">
                  View All Cattle
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tag Number</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name & Breed</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Yield (Daily)</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fat %</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Health Check</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cattle.map((cow, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm font-medium text-slate-900">{cow.tag}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                              {cow.name.charAt(0) !== '-' ? cow.name.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{cow.name !== '-' ? cow.name : 'Unnamed'}</div>
                              <div className="text-xs text-slate-500">{cow.breed}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(cow.status)}`}>
                            {cow.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {cow.yield}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {cow.fat}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {cow.lastCheck}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
