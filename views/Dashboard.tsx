
import React, { useState, useEffect } from 'react';
import { AppSection, Client } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const chartData = [
  { name: 'Jan', leads: 40 },
  { name: 'Feb', leads: 65 },
  { name: 'Mar', leads: 50 },
  { name: 'Apr', leads: 80 },
  { name: 'May', leads: 110 },
  { name: 'Jun', leads: 95 },
];

const COLORS = ['#000000', '#f59e0b', '#dc2626', '#1e293b', '#fbbf24', '#ef4444'];

interface Props {
  onNavigate: (section: AppSection) => void;
}

const Dashboard: React.FC<Props> = ({ onNavigate }) => {
  const [recentClients, setRecentClients] = useState<Client[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('lgp_clients');
    if (saved) {
      const all = JSON.parse(saved) as Client[];
      setRecentClients(all.slice(0, 3));
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Leads</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">1,284</p>
          <div className="mt-4 flex items-center text-emerald-600 text-[10px] font-black uppercase">
            <span className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">↑ 12% Growth</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Clients</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">{recentClients.length}+</p>
          <div className="mt-4 flex items-center text-amber-600 text-[10px] font-black uppercase">
            <span className="bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Enterprise CRM</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Revenue Forecast</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">$24.5k</p>
          <div className="mt-4 flex items-center text-red-600 text-[10px] font-black uppercase">
            <span className="bg-red-50 px-2 py-1 rounded-lg border border-red-100">Action Required</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Market Discovery Analytics</h3>
              <p className="text-xs text-slate-400 font-medium">Global sourcing throughput per period</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="leads" radius={[8, 8, 8, 8]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Portfolio</h3>
            <button onClick={() => onNavigate(AppSection.CLIENTS)} className="text-[10px] font-black text-amber-600 hover:underline uppercase">View All</button>
          </div>
          <div className="flex-1 space-y-3">
            {recentClients.length > 0 ? recentClients.map(client => (
              <div key={client.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white hover:border-amber-200 transition-all shadow-sm" onClick={() => onNavigate(AppSection.CLIENTS)}>
                <div>
                  <div className="text-sm font-black text-slate-900">{client.name}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">{client.industry}</div>
                </div>
                <div className={`text-[9px] font-black px-2 py-1 rounded-md border ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {client.status}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic border-2 border-dashed border-slate-100 rounded-2xl">
                Repository Empty
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate(AppSection.CLIENTS)}
            className="w-full mt-6 bg-black text-white text-[10px] font-black py-4 rounded-xl hover:bg-slate-900 transition-all uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
          >
            Open Client Manager
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-10 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl">
          <div className="absolute -right-8 -bottom-8 text-white/5 text-[12rem] font-black rotate-12 group-hover:rotate-6 transition-transform select-none">SCAN</div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Lead Research Engine</h3>
            <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed max-w-xs">Scan the global marketplace for businesses with critical technology gaps.</p>
          </div>
          <button 
            onClick={() => onNavigate(AppSection.LEAD_RESEARCH)}
            className="bg-amber-500 text-black font-black px-8 py-4 rounded-xl hover:bg-amber-400 transition-all w-max relative z-10 uppercase text-xs tracking-widest shadow-xl shadow-amber-900/20"
          >
            Initialize Scanner
          </button>
        </div>

        <div className="bg-white rounded-2xl p-10 text-slate-900 border-2 border-slate-100 flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute -right-8 -bottom-8 text-slate-50 text-[12rem] font-black rotate-12 group-hover:rotate-6 transition-transform select-none">DRAFT</div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Proposal Architect</h3>
            <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed max-w-xs">Generate enterprise-grade service agreements with one-click AI logic.</p>
          </div>
          <button 
            onClick={() => onNavigate(AppSection.PROPOSALS)}
            className="bg-black text-white font-black px-8 py-4 rounded-xl hover:bg-slate-800 transition-all w-max shadow-xl shadow-slate-200 relative z-10 uppercase text-xs tracking-widest"
          >
            Launch Architect
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
