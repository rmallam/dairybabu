import React, { useState } from 'react';
import { 
  Droplets, 
  IndianRupee, 
  AlertCircle, 
  LayoutDashboard, 
  List, 
  FileText, 
  HeartPulse, 
  Wallet, 
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Activity,
  Plus,
  ThermometerSun,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function Pastoral() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FCFAF6] font-outfit text-[#3A4135] flex overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .font-fraunces { font-family: 'Fraunces', serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        /* Custom scrollbar for a polished feel */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #E1E7D7;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #7F936C;
        }
      `}} />

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#2E3A24]/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#F1F4EB] border-r border-[#E1E7D7] 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7F936C] flex items-center justify-center text-white shadow-sm">
            <Droplets className="w-6 h-6" />
          </div>
          <span className="font-fraunces font-semibold text-2xl tracking-tight text-[#2E3A24]">
            OurDairy
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, active: true },
            { name: 'Cattle Directory', icon: List },
            { name: 'Milk Logs', icon: FileText },
            { name: 'Health & Vitals', icon: HeartPulse },
            { name: 'Finances', icon: Wallet },
            { name: 'Settings', icon: Settings },
          ].map((item) => (
            <a 
              key={item.name} 
              href="#"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${item.active 
                  ? 'bg-[#7F936C] text-white shadow-sm shadow-[#7F936C]/20' 
                  : 'text-[#687161] hover:bg-[#E1E7D7]/50 hover:text-[#3A4135]'}
              `}
            >
              <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
              <span className="font-medium">{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E1E7D7]">
          <div className="flex items-center gap-3 bg-[#E1E7D7]/30 p-3 rounded-xl">
            <Avatar className="h-10 w-10 border border-[#E1E7D7]">
              <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Ram" />
              <AvatarFallback className="bg-[#D26D54] text-white">R</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#2E3A24] truncate">Ram Prakash</p>
              <p className="text-xs text-[#687161] truncate">Farm Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[#FCFAF6]/80 backdrop-blur-md border-b border-[#E1E7D7] flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-[#687161] hover:bg-[#E1E7D7] rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-fraunces text-2xl text-[#2E3A24] font-medium hidden sm:block">
                Good morning, Ram!
              </h1>
              <p className="text-sm text-[#687161] hidden sm:block">Here is what's happening at the farm today.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687161]" />
              <Input 
                placeholder="Search cattle, logs..." 
                className="pl-9 bg-white border-[#E1E7D7] text-sm focus-visible:ring-[#7F936C] rounded-full h-10 w-64 shadow-sm"
              />
            </div>
            
            <button className="relative p-2 text-[#687161] hover:bg-[#E1E7D7]/50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D26D54] rounded-full border-2 border-[#FCFAF6]"></span>
            </button>
            
            <Button className="bg-[#D26D54] hover:bg-[#B85B43] text-white rounded-full shadow-sm shadow-[#D26D54]/20 hidden sm:flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Log Milk</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Scroll Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Total Cattle" 
              value="142" 
              subtitle="2 calved this week"
              icon={Activity}
              color="bg-[#F1F4EB]"
              iconColor="text-[#7F936C]"
              trend="+2%"
            />
            <StatCard 
              title="Today's Yield" 
              value="284 L" 
              subtitle="Morning session: 145 L"
              icon={Droplets}
              color="bg-[#FDF4E5]"
              iconColor="text-[#DFA842]"
              trend="+5%"
            />
            <StatCard 
              title="Est. Revenue" 
              value="₹12,450" 
              subtitle="Based on ₹43.8/L avg"
              icon={IndianRupee}
              color="bg-[#F8EBE8]"
              iconColor="text-[#D26D54]"
              trend="+1.2%"
            />
            <StatCard 
              title="Health Alerts" 
              value="3" 
              subtitle="2 overdue vaccinations"
              icon={AlertCircle}
              color="bg-[#FBEBEB]"
              iconColor="text-[#CD5D5D]"
              trend="-1"
              trendDown
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Col: Cattle Status */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-fraunces text-xl text-[#2E3A24]">Cattle Watchlist</h2>
                <Button variant="ghost" className="text-[#7F936C] hover:text-[#506141] hover:bg-[#F1F4EB]">
                  View all
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CattleCard 
                  id="TAG-042" name="Lakshmi" breed="HF Cross" 
                  status="Milking" yield="14L" statusColor="bg-[#E1E7D7] text-[#506141]"
                  avatar="bg-[#7F936C]/10 text-[#7F936C]"
                />
                <CattleCard 
                  id="TAG-018" name="Ganga" breed="Sahiwal" 
                  status="Pregnant (7m)" statusColor="bg-[#FDF4E5] text-[#B87D17]"
                  avatar="bg-[#DFA842]/10 text-[#DFA842]"
                />
                <CattleCard 
                  id="TAG-089" name="Gauri" breed="Gir" 
                  status="Dry" statusColor="bg-[#F1F4EB] text-[#687161]"
                  avatar="bg-[#687161]/10 text-[#687161]"
                />
                <CattleCard 
                  id="TAG-105" name="Nandi" breed="HF Cross" 
                  status="Health Alert" statusColor="bg-[#FBEBEB] text-[#CD5D5D]" alert
                  avatar="bg-[#CD5D5D]/10 text-[#CD5D5D]"
                />
              </div>

              {/* Weekly Yield Chart Placeholder (Stylized) */}
              <Card className="border-[#E1E7D7] shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="border-b border-[#F1F4EB] bg-white pb-4">
                  <CardTitle className="font-fraunces text-lg text-[#2E3A24]">Weekly Yield Trend</CardTitle>
                  <CardDescription className="text-[#687161]">Past 7 days across all milking cattle</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-48 flex items-end gap-2 sm:gap-4 justify-between pt-4">
                    {[120, 145, 130, 155, 148, 160, 150].map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full relative flex items-end justify-center h-full">
                          <div 
                            className="w-full sm:w-8 bg-[#E1E7D7] rounded-t-lg group-hover:bg-[#7F936C] transition-colors duration-300 relative"
                            style={{ height: `${(val / 160) * 100}%` }}
                          >
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#2E3A24] text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {val}L
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-[#687161]">
                          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Col: Recent Logs */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-fraunces text-xl text-[#2E3A24]">Recent Logs</h2>
                <Button variant="ghost" size="icon" className="text-[#687161] hover:bg-[#E1E7D7]/50 rounded-full">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Card className="border-[#E1E7D7] shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[#F1F4EB] bg-[#FCFAF6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#506141] font-medium">
                    <ThermometerSun className="w-4 h-4 text-[#DFA842]" />
                    Morning Session
                  </div>
                  <span className="text-xs text-[#687161]">Today, 6:00 AM</span>
                </div>
                <div className="p-0">
                  <Table>
                    <TableHeader className="bg-[#FCFAF6]/50">
                      <TableRow className="border-[#F1F4EB] hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-[#687161]">Cattle</TableHead>
                        <TableHead className="text-xs font-medium text-[#687161] text-right">Yield</TableHead>
                        <TableHead className="text-xs font-medium text-[#687161] text-right">Fat%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <MilkRow name="Lakshmi" tag="042" yield="14.5" fat="4.2" />
                      <MilkRow name="Rani" tag="012" yield="12.0" fat="4.5" />
                      <MilkRow name="Belli" tag="088" yield="16.2" fat="3.9" />
                      <MilkRow name="Sundari" tag="034" yield="11.5" fat="4.8" />
                    </TableBody>
                  </Table>
                </div>
                <div className="p-3 bg-[#FCFAF6] border-t border-[#F1F4EB] text-center">
                  <button className="text-sm text-[#7F936C] hover:text-[#506141] font-medium">
                    View full morning log
                  </button>
                </div>
              </Card>

              <Card className="border-[#E1E7D7] shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col opacity-75">
                <div className="p-4 border-b border-[#F1F4EB] bg-[#FCFAF6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#506141] font-medium">
                    <Moon className="w-4 h-4 text-[#687161]" />
                    Evening Session
                  </div>
                  <span className="text-xs text-[#687161]">Yesterday, 5:30 PM</span>
                </div>
                <div className="p-4 text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F1F4EB] text-[#7F936C] mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#3A4135] font-medium">Session Completed</p>
                  <p className="text-xs text-[#687161] mt-1">138L total logged</p>
                </div>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, iconColor, trend, trendDown = false }: any) {
  return (
    <Card className="border-[#E1E7D7] shadow-sm rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge variant="outline" className={`
            font-normal text-xs border-0
            ${trendDown ? 'bg-[#FBEBEB] text-[#CD5D5D]' : 'bg-[#E1E7D7]/50 text-[#506141]'}
          `}>
            {trend}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-[#687161] mb-1">{title}</p>
          <h3 className="font-fraunces text-3xl font-semibold text-[#2E3A24]">{value}</h3>
          <p className="text-xs text-[#687161] mt-2">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CattleCard({ id, name, breed, status, yield: milkYield, statusColor, alert = false, avatar }: any) {
  return (
    <div className="bg-white border border-[#E1E7D7] rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm hover:border-[#7F936C] transition-colors cursor-pointer relative overflow-hidden group">
      {alert && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#CD5D5D]/10 to-transparent -mr-8 -mt-8 rounded-full pointer-events-none" />
      )}
      
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-xl font-fraunces ${avatar}`}>
        {name.charAt(0)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-fraunces font-medium text-[#2E3A24] truncate text-lg group-hover:text-[#7F936C] transition-colors">
            {name}
          </h4>
          <span className="text-xs font-medium text-[#687161] bg-[#F1F4EB] px-2 py-0.5 rounded">
            {id}
          </span>
        </div>
        
        <p className="text-xs text-[#687161] mb-3">{breed}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`font-normal text-xs hover:bg-opacity-80 border-0 ${statusColor}`}>
            {status}
          </Badge>
          {milkYield && (
            <Badge variant="outline" className="font-normal text-xs border-[#E1E7D7] text-[#687161] flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              {milkYield}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function MilkRow({ name, tag, yield: milkYield, fat }: any) {
  return (
    <TableRow className="border-[#F1F4EB] hover:bg-[#FCFAF6]">
      <TableCell className="py-3">
        <p className="text-sm font-medium text-[#2E3A24]">{name}</p>
        <p className="text-[10px] text-[#687161] uppercase tracking-wider">#{tag}</p>
      </TableCell>
      <TableCell className="text-right py-3">
        <span className="font-medium text-[#3A4135]">{milkYield}L</span>
      </TableCell>
      <TableCell className="text-right py-3">
        <span className="text-[#687161]">{fat}%</span>
      </TableCell>
    </TableRow>
  );
}
