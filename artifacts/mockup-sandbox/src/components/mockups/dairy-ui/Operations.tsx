import { Milk, Droplet, Activity, TrendingUp, AlertTriangle, Syringe, DollarSign, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function Operations() {
  const cattleData = [
    { tag: 'DH-001', name: 'Lakshmi', breed: 'HF Cross', milk: 18.5, status: 'milking', fat: 4.2 },
    { tag: 'DH-002', name: 'Ganga', breed: 'Sahiwal', milk: 12.0, status: 'milking', fat: 4.8 },
    { tag: 'DH-003', name: 'Nandi', breed: 'Gir', milk: 15.2, status: 'milking', fat: 4.5 },
    { tag: 'DH-004', name: 'Parvati', breed: 'HF Cross', milk: 0, status: 'pregnant', fat: 0 },
    { tag: 'DH-005', name: 'Radha', breed: 'Jersey Cross', milk: 14.8, status: 'milking', fat: 5.1 },
    { tag: 'DH-006', name: 'Saraswati', breed: 'Sahiwal', milk: 11.5, status: 'milking', fat: 4.6 },
    { tag: 'DH-007', name: 'Durga', breed: 'Gir', milk: 0, status: 'dry', fat: 0 },
    { tag: 'DH-008', name: 'Kamadhenu', breed: 'HF Cross', milk: 19.2, status: 'milking', fat: 4.0 },
  ];

  const activities = [
    { type: 'milk', time: '06:45', detail: 'DH-001 Lakshmi • Morning: 9.5L (4.2% fat)', tag: 'DH-001' },
    { type: 'milk', time: '06:52', detail: 'DH-002 Ganga • Morning: 6.0L (4.8% fat)', tag: 'DH-002' },
    { type: 'health', time: '07:15', detail: 'DH-004 Parvati • Pregnancy check scheduled', tag: 'DH-004', alert: true },
    { type: 'milk', time: '07:20', detail: 'DH-003 Nandi • Morning: 7.8L (4.5% fat)', tag: 'DH-003' },
    { type: 'transaction', time: '08:00', detail: '₹18,450 • Milk Sales - Morning Collection', amount: 18450 },
    { type: 'health', time: '09:30', detail: 'DH-007 Durga • Vaccination completed (FMD)', tag: 'DH-007' },
    { type: 'milk', time: '10:05', detail: 'DH-005 Radha • Morning: 7.5L (5.1% fat)', tag: 'DH-005' },
    { type: 'transaction', time: '11:20', detail: '₹8,200 • Feed Purchase - Concentrate 50kg', amount: -8200 },
    { type: 'milk', time: '17:30', detail: 'DH-008 Kamadhenu • Evening: 9.7L (4.0% fat)', tag: 'DH-008' },
    { type: 'health', time: '18:00', detail: 'DH-006 Saraswati • Heat detected - AI scheduled', tag: 'DH-006', alert: true },
  ];

  const milkTrend = [52, 54, 51, 58, 62, 59, 64, 61, 67, 69, 72, 68, 74, 71];
  const maxMilk = Math.max(...milkTrend);

  return (
    <div className="min-h-screen bg-[#0a0e12] text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .font-display { font-family: 'Inter', sans-serif; }
        .font-mono-num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
        
        .glow-amber { box-shadow: 0 0 20px rgba(251, 191, 36, 0.15), 0 0 40px rgba(251, 191, 36, 0.08); }
        .border-glow { border: 1px solid rgba(251, 191, 36, 0.3); }
        
        .sparkline-bar {
          transition: all 0.3s ease;
        }
        .sparkline-bar:hover {
          opacity: 1 !important;
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-[#0d1117] backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center glow-amber">
                  <Milk className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-white">Dhanalakshmi Dairy</h1>
                  <p className="font-mono-num text-xs text-slate-500">Khammam, Telangana</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 pl-6 border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span className="font-mono-num text-sm font-semibold text-slate-300">8 head</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-400" />
                  <span className="font-mono-num text-sm font-semibold text-slate-300">146.2L today</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono-num text-sm font-semibold text-slate-300">+8.4% vs yesterday</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="font-mono-num text-sm font-semibold text-amber-400">2 alerts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-mono-num text-xs text-slate-500">Today's Revenue</p>
                <p className="font-mono-num text-lg font-bold text-emerald-400">₹18,450</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Grid */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Cattle Status Grid */}
          <div className="col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Cattle Status</h2>
              <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500">
                <span>Live at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {cattleData.map((cow) => (
                <Card key={cow.tag} className="bg-[#151b23] border-slate-800 hover:border-slate-700 transition-all p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono-num text-sm font-bold text-amber-400">{cow.tag}</span>
                        {cow.status === 'milking' ? (
                          <Badge className="bg-emerald-950 text-emerald-400 border-emerald-900 text-[10px] px-1.5 py-0">MILKING</Badge>
                        ) : cow.status === 'pregnant' ? (
                          <Badge className="bg-purple-950 text-purple-400 border-purple-900 text-[10px] px-1.5 py-0">PREGNANT</Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] px-1.5 py-0">DRY</Badge>
                        )}
                      </div>
                      <p className="font-display text-base font-semibold text-white">{cow.name}</p>
                      <p className="font-display text-xs text-slate-500">{cow.breed}</p>
                    </div>
                    <Tag className="w-5 h-5 text-slate-700" />
                  </div>
                  
                  {cow.milk > 0 ? (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="font-display text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Today Total</p>
                          <p className="font-mono-num text-2xl font-bold text-white">{cow.milk.toFixed(1)}<span className="text-sm text-slate-500 ml-1">L</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-[10px] text-slate-500 uppercase tracking-wide mb-0.5">Fat %</p>
                          <p className="font-mono-num text-sm font-semibold text-amber-400">{cow.fat.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="font-display text-xs text-slate-600">No milk production</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Activity Feed */}
          <div className="col-span-5">
            <div className="mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Live Activity Feed</h2>
            </div>
            
            <Card className="bg-[#151b23] border-slate-800 p-0 max-h-[640px] overflow-hidden">
              <div className="overflow-y-auto max-h-[640px] custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 #1e293b' }}>
                <div className="divide-y divide-slate-800">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-900/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'milk' ? 'bg-blue-950 text-blue-400' :
                          activity.type === 'health' ? 'bg-red-950 text-red-400' :
                          'bg-emerald-950 text-emerald-400'
                        }`}>
                          {activity.type === 'milk' && <Droplet className="w-4 h-4" />}
                          {activity.type === 'health' && <Syringe className="w-4 h-4" />}
                          {activity.type === 'transaction' && <DollarSign className="w-4 h-4" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono-num text-xs text-slate-500">{activity.time}</span>
                            {activity.alert && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                          </div>
                          <p className="font-display text-sm text-slate-200 leading-relaxed">{activity.detail}</p>
                          {activity.amount && (
                            <p className={`font-mono-num text-sm font-semibold mt-1 ${
                              activity.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom: Metrics Bar with Sparklines */}
        <div className="mt-6">
          <Card className="bg-[#151b23] border-slate-800 p-6">
            <div className="grid grid-cols-4 gap-8">
              {/* Milk Production Trend */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xs uppercase tracking-wide text-slate-500">14-Day Milk Trend</h3>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-end gap-1 h-16 mb-2">
                  {milkTrend.map((value, idx) => (
                    <div
                      key={idx}
                      className="sparkline-bar flex-1 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t transition-all"
                      style={{
                        height: `${(value / maxMilk) * 100}%`,
                        opacity: idx === milkTrend.length - 1 ? 1 : 0.4 + (idx / milkTrend.length) * 0.4
                      }}
                    />
                  ))}
                </div>
                <p className="font-mono-num text-2xl font-bold text-white">{milkTrend[milkTrend.length - 1]}<span className="text-sm text-slate-500 ml-1">L</span></p>
                <p className="font-display text-xs text-emerald-400 mt-1">+12.3% vs last week</p>
              </div>

              {/* Average Fat % */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xs uppercase tracking-wide text-slate-500">Avg Fat Content</h3>
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="h-16 mb-2 flex items-end">
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 glow-amber" style={{ width: '84%' }} />
                  </div>
                </div>
                <p className="font-mono-num text-2xl font-bold text-white">4.5<span className="text-sm text-slate-500 ml-1">%</span></p>
                <p className="font-display text-xs text-slate-400 mt-1">Target: 4.2% • Exceeded</p>
              </div>

              {/* Health Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xs uppercase tracking-wide text-slate-500">Health Compliance</h3>
                  <Syringe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="h-16 mb-2 flex items-center justify-center gap-2">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-600 flex items-center justify-center mb-1">
                      <span className="font-mono-num text-sm font-bold text-emerald-400">6</span>
                    </div>
                    <p className="font-display text-[10px] text-slate-500">On Track</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-amber-600 flex items-center justify-center mb-1">
                      <span className="font-mono-num text-sm font-bold text-amber-400">2</span>
                    </div>
                    <p className="font-display text-[10px] text-slate-500">Pending</p>
                  </div>
                </div>
                <p className="font-mono-num text-2xl font-bold text-white">75<span className="text-sm text-slate-500 ml-1">%</span></p>
                <p className="font-display text-xs text-amber-400 mt-1">2 schedules due today</p>
              </div>

              {/* Revenue */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xs uppercase tracking-wide text-slate-500">Monthly Revenue</h3>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="h-16 mb-2 flex items-end gap-1">
                  {[65, 72, 68, 78, 82, 75, 88, 85, 92, 89, 95, 91, 98, 94].map((value, idx) => (
                    <div
                      key={idx}
                      className="sparkline-bar flex-1 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t transition-all"
                      style={{
                        height: `${value}%`,
                        opacity: idx === 13 ? 1 : 0.3 + (idx / 13) * 0.5
                      }}
                    />
                  ))}
                </div>
                <p className="font-mono-num text-2xl font-bold text-white">₹5.2<span className="text-sm text-slate-500 ml-1">L</span></p>
                <p className="font-display text-xs text-emerald-400 mt-1">+18.7% vs last month</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
