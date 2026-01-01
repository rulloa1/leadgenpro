
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

const COLORS = ['#3b82f6', '#1d4ed8', '#2563eb', '#1e40af', '#60a5fa', '#93c5fd'];

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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Leads</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">1,284</p>
          <div className="mt-4 flex items-center text-emerald-600 text-sm font-bold">
            <span className="bg-emerald-50 px-2 py-0.5 rounded">↑ 12%</span>
            <span className="ml-2 font-normal text-slate-400">vs last month</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Active Clients</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">{recentClients.length}+</p>
          <div className="mt-4 flex items-center text-blue-600 text-sm font-bold">
            <span className="bg-blue-50 px-2 py-0.5 rounded">New!</span>
            <span className="ml-2 font-normal text-slate-400">CRM Module Live</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Pending Deals</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">24</p>
          <div className="mt-4 flex items-center text-amber-600 text-sm font-bold">
            <span className="bg-amber-50 px-2 py-0.5 rounded">Action Req</span>
            <span className="ml-2 font-normal text-slate-400">Needs follow-up</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Prospecting Performance</h3>
              <p className="text-sm text-slate-500">Monthly breakdown of newly discovered leads</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Clients</h3>
            <button onClick={() => onNavigate(AppSection.CLIENTS)} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="flex-1 space-y-4">
            {recentClients.length > 0 ? recentClients.map(client => (
              <div key={client.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onNavigate(AppSection.CLIENTS)}>
                <div>
                  <div className="text-sm font-bold text-slate-900">{client.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{client.industry}</div>
                </div>
                <div className={`text-[10px] font-black px-2 py-0.5 rounded ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {client.status}
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-sm italic">
                No clients tracked yet.
              </div>
            )}
          </div>
          <button 
            onClick={() => onNavigate(AppSection.CLIENTS)}
            className="w-full mt-6 bg-slate-900 text-white text-xs font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Manage CRM
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-600 rounded-xl p-8 text-white flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black rotate-12 group-hover:rotate-6 transition-transform">MAPS</div>
          <div>
            <h3 className="text-xl font-bold mb-2">New Lead Search</h3>
            <p className="text-blue-100 mb-6">Use AI to discover businesses with specific digital needs in any city.</p>
          </div>
          <button 
            onClick={() => onNavigate(AppSection.LEAD_RESEARCH)}
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors w-max relative z-10"
          >
            Start Researching
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 text-white flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 text-white/10 text-8xl font-black rotate-12 group-hover:rotate-6 transition-transform">DEAL</div>
          <div>
            <h3 className="text-xl font-bold mb-2">Build Proposal</h3>
            <p className="text-slate-400 mb-6">Convert a warm reply into a formal deal with our professional template.</p>
          </div>
          <button 
            onClick={() => onNavigate(AppSection.PROPOSALS)}
            className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-400 transition-colors w-max shadow-lg shadow-blue-500/20 relative z-10"
          >
            Create Proposal
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
