
import React, { useState } from 'react';
import { BusinessLead } from '../types';
import { searchLeads, generatePersonalizedHook } from '../services/geminiService';

interface Props {
  onDraftProposal?: (lead: BusinessLead, services: string[]) => void;
}

const LeadResearch: React.FC<Props> = ({ onDraftProposal }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [generatingHookId, setGeneratingHookId] = useState<string | null>(null);
  const [selectedServicesMap, setSelectedServicesMap] = useState<Record<string, string[]>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !city) return;

    setIsLoading(true);
    try {
      const results = await searchLeads(`${query} in ${city}`);
      setLeads(results);
      // Initialize selected services for new results
      const initialMap: Record<string, string[]> = {};
      results.forEach(lead => {
        initialMap[lead.id] = lead.recommendedServices || [];
      });
      setSelectedServicesMap(initialMap);
    } catch (error) {
      console.error(error);
      alert("Error fetching leads. Check API availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHook = async (leadId: string) => {
    setGeneratingHookId(leadId);
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;
      const hook = await generatePersonalizedHook(lead);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, personalizedHook: hook } : l));
    } catch (error) {
      console.error(error);
    } finally {
      setGeneratingHookId(null);
    }
  };

  const toggleService = (leadId: string, service: string) => {
    setSelectedServicesMap(prev => {
      const current = prev[leadId] || [];
      if (current.includes(service)) {
        return { ...prev, [leadId]: current.filter(s => s !== service) };
      } else {
        return { ...prev, [leadId]: [...current, service] };
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32"></div>
        <h3 className="text-xl font-black text-slate-900 mb-8 relative">Step 1: Discover High-Intent Leads</h3>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="flex flex-col space-y-3">
            <label className="text-sm font-black text-blue-600 uppercase tracking-widest">Industry Keyword</label>
            <input 
              type="text" 
              placeholder="e.g. Roofers, Dentists"
              className="px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300 shadow-inner bg-slate-50/50 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-3">
            <label className="text-sm font-black text-blue-600 uppercase tracking-widest">Target City</label>
            <input 
              type="text" 
              placeholder="e.g. Houston, Chicago"
              className="px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300 shadow-inner bg-slate-50/50 transition-all"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg text-lg uppercase tracking-widest flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 shadow-blue-200'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mapping...
                </>
              ) : 'Start Discovery'}
            </button>
          </div>
        </form>
      </div>

      {leads.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Business Name</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Reputation & Tenure</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Strategy & Services</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 align-top">
                    <div className="font-bold text-slate-900 text-lg leading-tight">{lead.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{lead.industry} • {lead.city}</div>
                    <div className="mt-3">
                      <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg uppercase tracking-wider">Map View ↗</a>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-amber-500 text-sm font-bold">
                        {'★'.repeat(Math.round(lead.rating || 0))}
                        <span className="text-slate-400 ml-2 font-medium">({lead.rating?.toFixed(1)})</span>
                      </div>
                      <div className="text-[11px] font-black text-emerald-600 uppercase tracking-tight mt-1">
                        {lead.yearsInBusiness || 'Market Entry Pending'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Identified Gap:</div>
                        <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-100 shadow-sm">
                          {lead.gap}
                        </span>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                          <span>Service Offerings:</span>
                          <span className="text-[8px] text-blue-500 font-black">SELECT TO BUNDLE</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lead.recommendedServices?.map((service, idx) => {
                            const isSelected = selectedServicesMap[lead.id]?.includes(service);
                            return (
                              <button 
                                key={idx}
                                onClick={() => toggleService(lead.id, service)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all shadow-sm border ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{service}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex flex-col space-y-3">
                      {lead.personalizedHook ? (
                        <div className="bg-slate-900 text-white p-5 rounded-2xl text-[11px] font-medium italic leading-relaxed shadow-xl relative group-hover:-translate-y-1 transition-transform border border-slate-800">
                          <div className="absolute -top-2 -left-2 bg-blue-500 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-md">AI Strategy</div>
                          "{lead.personalizedHook}"
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleGenerateHook(lead.id)}
                          disabled={generatingHookId === lead.id}
                          className="text-[10px] bg-white border-2 border-slate-100 text-slate-900 font-black px-5 py-2.5 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center shadow-md uppercase tracking-widest active:scale-95"
                        >
                          {generatingHookId === lead.id ? 'Drafting...' : '✨ Create Hook'}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => onDraftProposal?.(lead, selectedServicesMap[lead.id] || [])}
                        className="text-[10px] bg-emerald-600 text-white font-black px-5 py-2.5 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-100 uppercase tracking-widest active:scale-95"
                      >
                        📄 Draft Proposal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {leads.length === 0 && !isLoading && (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-inner">
          <div className="text-7xl mb-6">🛰️</div>
          <h4 className="text-2xl font-black text-slate-900">Map Scanner Offline</h4>
          <p className="text-slate-400 max-w-sm mx-auto mt-2">Target a specific industry and region to begin deep-market scanning.</p>
        </div>
      )}
    </div>
  );
};

export default LeadResearch;
