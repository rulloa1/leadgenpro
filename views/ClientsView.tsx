
import React, { useState, useEffect } from 'react';
import { Client, RelationshipStatus, AppSection } from '../types';

interface Props {
  onNavigate: (section: AppSection) => void;
  onViewProposals: (clientId: string) => void;
}

const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Main Street Dentistry',
    industry: 'Healthcare',
    email: 'info@mainstreetdentistry.com',
    phone: '555-0102',
    city: 'Austin',
    status: 'Active',
    notes: 'Website redesign client. Interested in SEO next month.',
    proposals: [
      { id: 'prop1', date: '2023-10-15', title: 'Website Redesign', amount: '2,500', status: 'Accepted' }
    ],
    createdAt: '2023-10-01'
  },
  {
    id: '2',
    name: 'Elite Roofers Inc',
    industry: 'Construction',
    email: 'sales@eliteroofers.com',
    phone: '555-0432',
    city: 'Chicago',
    status: 'Lead',
    notes: 'Followed up via cold email. Wants a proposal for GBP management.',
    proposals: [],
    createdAt: '2023-11-12'
  }
];

const ClientsView: React.FC<Props> = ({ onNavigate, onViewProposals }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Load from local storage or set initial
  useEffect(() => {
    const saved = localStorage.getItem('lgp_clients');
    if (saved) {
      setClients(JSON.parse(saved));
    } else {
      setClients(INITIAL_CLIENTS);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('lgp_clients', JSON.stringify(clients));
  }, [clients]);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    industry: '',
    email: '',
    phone: '',
    city: '',
    status: 'Lead',
    notes: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...formData } as Client : c));
      setEditingClient(null);
    } else {
      const newClient: Client = {
        ...formData as any,
        id: Math.random().toString(36).substr(2, 9),
        proposals: [],
        createdAt: new Date().toISOString()
      };
      setClients(prev => [newClient, ...prev]);
    }
    setIsAdding(false);
    setFormData({ name: '', industry: '', email: '', phone: '', city: '', status: 'Lead', notes: '' });
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsAdding(true);
  };

  const deleteClient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingClient(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-md flex items-center"
        >
          <span className="mr-2">+</span> Add New Client
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingClient ? 'Edit Client Record' : 'Create New Client'}
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light">&times;</button>
            </div>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Business / Legal Name</label>
                <input required type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium outline-none transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Industry Type</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium outline-none transition-all shadow-sm" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Office City</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-medium outline-none transition-all shadow-sm" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Main Email</label>
                  <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-medium outline-none transition-all shadow-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-medium outline-none transition-all shadow-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Relationship Status</label>
                <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-base font-medium outline-none transition-all shadow-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as RelationshipStatus})}>
                  <option value="Lead">New Prospect (Lead)</option>
                  <option value="Active">Active Partnership</option>
                  <option value="Past">Past Engagement</option>
                  <option value="Blocked">Do Not Contact (Blocked)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Internal Notes & Context</label>
                <textarea className="w-full px-4 py-3 border border-slate-200 rounded-xl h-28 focus:ring-2 focus:ring-blue-500 text-sm font-medium outline-none transition-all shadow-sm resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-xl hover:bg-black transition-all uppercase tracking-[0.2em] text-xs">
                  {editingClient ? 'Sync Changes' : 'Create Client Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Industry</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Documents</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 text-base">{client.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{client.email} • {client.city}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600 font-semibold">{client.industry}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                    client.status === 'Lead' ? 'bg-blue-100 text-blue-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                  {client.proposals.length} total
                </td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <button onClick={() => onViewProposals(client.id)} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-xs font-black mr-3 transition-colors">📄 View Proposals</button>
                  <button onClick={() => startEdit(client)} className="text-blue-600 hover:text-blue-800 text-xs font-bold mr-4 underline underline-offset-4">Edit</button>
                  <button onClick={() => deleteClient(client.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium italic">No client records match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
