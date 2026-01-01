
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
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/5 rounded-full -ml-20 -mb-20"></div>
        <h3 className="text-xl font-black text-slate-900 mb-8 relative uppercase tracking-tighter">Market Penetration Search</h3>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vertical</label>
            <input 
              type="text" 
              placeholder="e.g. Fintech, Medical"
              className="px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300 shadow-sm bg-slate-50/30 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Geo Target</label>
            <input 
              type="text" 
              placeholder="e.g. NYC, London"
              className="px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-xl font-bold text-slate-900 placeholder:text-slate-300 shadow-sm bg-slate-50/30 transition-all"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white font-black py-5 rounded-2xl transition-all shadow-xl text-xs uppercase tracking-[0.3em] flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900 hover:-translate-y-1 active:translate-y-0 shadow-slate-200'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  QUERYING...
                </>
              ) : 'EXECUTE SCAN'}
            </button>
          </div>
        </form>
      </div>

      {leads.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left">
            <thead className="bg-black border-b border-slate-800">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lead Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Market Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Analysis</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Drafting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-8 align-top">
                    <div className="font-black text-slate-900 text-lg leading-tight group-hover:text-amber-600 transition-colors">{lead.name}</div>
                    <div className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">{lead.industry} • {lead.city}</div>
                    <div className="mt-4">
                      <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-3 py-2 rounded-xl uppercase tracking-widest border border-amber-100 shadow-sm">View Radar ↗</a>
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-amber-500 text-sm font-black">
                        {'★'.repeat(Math.round(lead.rating || 0))}
                        <span className="text-slate-400 ml-2 font-bold">({lead.rating?.toFixed(1)})</span>
                      </div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 bg-emerald-50 w-max px-2 py-1 rounded-md border border-emerald-100">
                        {lead.yearsInBusiness || 'Market Entry'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 align-top">
                    <div className="space-y-6">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">CRITICAL GAP:</div>
                        <span className="inline-block px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm">
                          {lead.gap}
                        </span>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                          <span>STRATEGIC BUNDLING:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lead.recommendedServices?.map((service, idx) => {
                            const isSelected = selectedServicesMap[lead.id]?.includes(service);
                            return (
                              <button 
                                key={idx}
                                onClick={() => toggleService(lead.id, service)}
                                className={`px-3 py-2 rounded-xl text-[9px] font-black transition-all shadow-sm border ${
                                  isSelected 
                                    ? 'bg-amber-500 text-white border-amber-600 shadow-amber-900/20' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600'
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
                  <td className="px-8 py-8 align-top text-right">
                    <div className="flex flex-col space-y-4 items-end">
                      {lead.personalizedHook ? (
                        <div className="bg-black text-white p-6 rounded-3xl text-[11px] font-bold italic leading-relaxed shadow-2xl relative max-w-[240px] border-t-4 border-amber-500 text-left">
                          <div className="absolute -top-3 right-4 bg-red-600 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-[0.2em] shadow-lg">AI Payload</div>
                          "{lead.personalizedHook}"
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleGenerateHook(lead.id)}
                          disabled={generatingHookId === lead.id}
                          className="text-[10px] bg-white border-2 border-slate-200 text-slate-900 font-black px-6 py-3 rounded-2xl hover:border-amber-500 hover:text-amber-600 transition-all shadow-md uppercase tracking-[0.2em]"
                        >
                          {generatingHookId === lead.id ? 'ENCRYPTING...' : '✨ GENERATE HOOK'}
                        </button>
                      )}
                      
                      <button 
                        onClick={() => onDraftProposal?.(lead, selectedServicesMap[lead.id] || [])}
                        className="text-[10px] bg-black text-white font-black px-8 py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center shadow-xl shadow-slate-200 uppercase tracking-[0.3em] active:scale-95 border border-slate-800"
                      >
                        📄 DRAFT AGREEMENT
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
        <div className="text-center py-28 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
          <div className="text-8xl mb-6 select-none opacity-20">📡</div>
          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Global Scanner Offline</h4>
          <p className="text-slate-400 max-w-sm mx-auto mt-4 text-xs font-bold uppercase tracking-widest">Awaiting horizontal and vertical parameters for regional deep-scan.</p>
        </div>
      )}
    </div>
  );
};

export default LeadResearch;
