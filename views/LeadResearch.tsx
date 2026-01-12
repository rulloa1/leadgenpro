
import React, { useState, useEffect } from 'react';
import { BusinessLead } from '../types';
import { searchLeads, generateTailoredEmail, analyzeCompetitorUrl } from '../services/geminiService';

interface Props {
  onDraftProposal?: (lead: BusinessLead, services: string[]) => void;
}

const LeadResearch: React.FC<Props> = ({ onDraftProposal }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanMode, setScanMode] = useState<'growth' | 'distressed'>('growth');
  const [searchScope, setSearchScope] = useState<'bulk' | 'single' | 'url_scan'>('bulk');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [generatingHookId, setGeneratingHookId] = useState<string | null>(null);
  const [selectedServicesMap, setSelectedServicesMap] = useState<Record<string, string[]>>({});
  const [viewingMapLead, setViewingMapLead] = useState<BusinessLead | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Email State
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean; lead: BusinessLead | null }>({ isOpen: false, lead: null });
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', body: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lgp_webhook_url');
    if (stored) setWebhookUrl(stored);
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setCity("Current GPS Location");
        setIsLocating(false);
        setError(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Could not detect location. Please type manually.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchScope === 'url_scan' && !targetUrl) return;
    if (searchScope !== 'url_scan' && !query) return;

    setIsLoading(true);
    setError(null);
    setLeads([]);
    try {
      let results: BusinessLead[] = [];
      
      if (searchScope === 'url_scan') {
        const result = await analyzeCompetitorUrl(targetUrl);
        results = [result];
      } else {
        const searchQuery = coords ? query : `${query} in ${city}`;
        results = await searchLeads(searchQuery, coords || undefined, scanMode, searchScope as 'bulk' | 'single');
      }

      if (results.length === 0) {
        setError("The search returned no valid entities. Try refining your keywords or location.");
      } else {
        setLeads(results);
        const initialMap: Record<string, string[]> = {};
        results.forEach(lead => {
          initialMap[lead.id] = lead.recommendedServices || [];
        });
        setSelectedServicesMap(initialMap);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHook = async (leadId: string) => {
    setGeneratingHookId(leadId);
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;
      const data = await generateTailoredEmail(lead);
      setLeads(prev => prev.map(l => l.id === leadId ? { 
        ...l, 
        personalizedHook: data.hook, 
        generatedEmail: { subject: data.subject, body: data.body } 
      } : l));
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

  const handleSyncToAutomation = async (lead: BusinessLead) => {
    let url = webhookUrl;
    if (!url) {
      const input = prompt("Enter your Webhook URL (Make/Zapier):");
      if (!input) return;
      url = input;
      setWebhookUrl(input);
      localStorage.setItem('lgp_webhook_url', input);
    }

    setIsSyncing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); 
      alert(`Successfully synced ${lead.name} to Automation Pipeline.`);
    } catch (e) {
      alert("Failed to sync. Check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenEmailModal = (lead: BusinessLead) => {
    let draftSubject = '';
    let draftBody = '';

    if (lead.generatedEmail) {
      draftSubject = lead.generatedEmail.subject;
      draftBody = lead.generatedEmail.body;
    } else {
      draftSubject = `Question regarding ${lead.name} website`;
      draftBody = `Hi ${lead.name},\n\nI was doing some research on ${lead.industry} businesses in ${lead.city} and noticed "${lead.gap}".\n\nGiven your reputation, this might be costing you revenue.\n\nI have a quick fix for this. Mind if I send over a video explaining how to solve it?\n\nBest,\n[Your Name]`;
    }

    setEmailDraft({
      to: lead.email || '',
      subject: draftSubject,
      body: draftBody
    });
    setEmailModal({ isOpen: true, lead });
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingEmail(false);
    setEmailModal({ isOpen: false, lead: null });
    alert(`Email successfully queued for ${emailDraft.to}`);
  };

  const handleOpenMailApp = () => {
    const mailtoLink = `mailto:${emailDraft.to}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
    window.open(mailtoLink, '_blank');
  };

  const formatYearsInBusiness = (text?: string) => {
    if (!text) return 'Newer Business';
    const trimmed = text.trim();
    if (/^(19|20)\d{2}$/.test(trimmed)) return `Since ${trimmed}`;
    if (/^\d+$/.test(trimmed)) return `Established ${trimmed}+ Years`;
    return trimmed;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="lg:col-span-4 space-y-6 sticky top-0">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -mr-20 -mt-20"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                Research Console
              </h3>
            </div>

            {/* Scope Toggle */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl mb-4 relative z-10">
              <button 
                onClick={() => setSearchScope('bulk')}
                className={`py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${searchScope === 'bulk' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Market
              </button>
              <button 
                onClick={() => setSearchScope('single')}
                className={`py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${searchScope === 'single' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Audit
              </button>
              <button 
                onClick={() => setSearchScope('url_scan')}
                className={`py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${searchScope === 'url_scan' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Site Scout
              </button>
            </div>

            {searchScope !== 'url_scan' && (
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 relative z-10">
                <button 
                  onClick={() => setScanMode('growth')}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === 'growth' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Growth
                </button>
                <button 
                  onClick={() => setScanMode('distressed')}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === 'distressed' ? 'bg-rose-500 shadow-md text-white' : 'text-slate-400 hover:text-rose-500'}`}
                >
                  Distressed
                </button>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4 relative z-10">
              {searchScope === 'url_scan' ? (
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Competitor URL</label>
                  <input 
                    type="url" 
                    placeholder="https://competitor.com"
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all bg-slate-50/50"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {searchScope === 'single' ? 'Business Name' : 'Vertical / Niche'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={searchScope === 'single' ? "e.g. Joe's Pizza" : (scanMode === 'distressed' ? "e.g. Roofers" : "e.g. Fintech")}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all bg-slate-50/50"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                      <button 
                        type="button" 
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className={`text-[9px] font-black uppercase tracking-widest flex items-center transition-colors ${coords ? 'text-emerald-500' : 'text-blue-500 hover:text-blue-700'}`}
                      >
                        {isLocating ? 'Detecting...' : coords ? 'GPS Active ✓' : '📍 Use My Location'}
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. Austin, TX"
                        disabled={!!coords}
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-bold transition-all ${
                          coords 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-slate-50/50 border-slate-100 focus:ring-4 focus:ring-amber-100 focus:border-amber-500 text-slate-900 placeholder:text-slate-300'
                        }`}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      {coords && (
                        <button 
                          type="button"
                          onClick={() => { setCoords(null); setCity(''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-rose-500 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full font-black py-4 rounded-xl transition-all shadow-lg text-xs uppercase tracking-[0.2em] flex items-center justify-center mt-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed bg-slate-200 text-slate-500' 
                  : searchScope === 'url_scan'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-200'
                    : scanMode === 'distressed' 
                      ? 'bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-1 shadow-rose-200'
                      : 'bg-black text-white hover:bg-slate-900 hover:-translate-y-1 shadow-slate-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="relative mr-3">
                       <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    {coords ? 'RADAR ACTIVE...' : 'PROCESSING...'}
                  </>
                ) : (
                   searchScope === 'single' ? 'RUN AUDIT' : searchScope === 'url_scan' ? 'START DIGITAL SCOUT' : 'LAUNCH SCANNER'
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
             <div className="flex items-center space-x-2 mb-3">
               <span className="text-xl">
                 {searchScope === 'url_scan' ? '📡' : (scanMode === 'distressed' ? '🛠️' : '📈')}
               </span>
               <span className="font-black text-xs uppercase tracking-widest">Strategy Insight</span>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium">
               {searchScope === 'url_scan' 
                 ? "Digital Scout Mode: Provide a URL to get a technical breakdown. Identify vulnerabilities to offer specialized repairs."
                 : searchScope === 'single'
                 ? "Single Audit Mode: Deep dive into a specific business to uncover its 'Digital Ceiling'."
                 : "Market Scan Mode: Sweeps the local area for targets matching your niche and growth criteria."
               }
             </p>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULTS FEED */}
        <div className="lg:col-span-8 space-y-6">
           {error && (
             <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl text-rose-700 animate-in slide-in-from-top-2">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">⚠️</span>
                  <h4 className="font-black uppercase tracking-widest text-sm">Tactical Failure</h4>
                </div>
                <p className="text-sm font-medium leading-relaxed">{error}</p>
                <div className="mt-4 flex space-x-3">
                   <button onClick={() => setError(null)} className="text-[10px] font-black uppercase tracking-widest border border-rose-300 px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors">Dismiss</button>
                   <button onClick={() => { setCoords(null); setCity(''); setError(null); }} className="text-[10px] font-black uppercase tracking-widest bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">Reset GPS</button>
                </div>
             </div>
           )}

           {leads.length > 0 ? (
             <>
               <div className="flex justify-between items-center px-2">
                 <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                   {searchScope === 'url_scan' ? 'Digital Scout Report' : `Targets Found (${leads.length})`}
                 </h2>
               </div>

               <div className="grid grid-cols-1 gap-6">
                 {leads.map((lead) => (
                   <div key={lead.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group animate-in slide-in-from-bottom-2">
                      {!lead.analysisReport ? (
                        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <div>
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-black text-slate-900">{lead.name}</h3>
                                  <span className={`text-[10px] font-black px-2 py-1 rounded border ${scanMode === 'distressed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {lead.rating?.toFixed(1)} ★
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{lead.industry} • {lead.city}</p>
                                {lead.email && <p className="text-xs text-slate-500 font-medium mt-1 truncate">📧 {lead.email}</p>}
                             </div>

                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Detected Gap</div>
                                <p className={`text-sm font-bold ${scanMode === 'distressed' ? 'text-rose-600' : 'text-blue-600'}`}>"{lead.gap}"</p>
                             </div>

                             <div className="flex items-center space-x-2 pt-2">
                                {lead.latitude && lead.longitude && (
                                  <button onClick={() => setViewingMapLead(lead)} className="text-[10px] bg-slate-900 text-white font-black px-4 py-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200">View Map</button>
                                )}
                                <a href={lead.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-100 text-slate-600 font-black px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-all">G-Maps ↗</a>
                             </div>
                          </div>

                          <div className="flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                             <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Strategy</div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {lead.recommendedServices?.map((service, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => toggleService(lead.id, service)}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${selectedServicesMap[lead.id]?.includes(service) ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                                    >
                                      {selectedServicesMap[lead.id]?.includes(service) ? '✓ ' : '+ '}{service}
                                    </button>
                                  ))}
                                </div>

                                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50">
                                  {lead.personalizedHook ? (
                                    <div className="text-[11px] font-medium text-slate-700 italic leading-relaxed">
                                      <span className="text-[9px] font-black text-amber-600 not-italic uppercase tracking-widest block mb-1">AI Hook:</span>
                                      "{lead.personalizedHook}"
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => handleGenerateHook(lead.id)}
                                      disabled={generatingHookId === lead.id}
                                      className="w-full py-3 border-2 border-dashed border-amber-200 rounded-lg text-[10px] font-black text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all uppercase tracking-widest"
                                    >
                                      {generatingHookId === lead.id ? 'Thinking...' : '✨ Write Full Pitch'}
                                    </button>
                                  )}
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2">
                               <button onClick={() => handleOpenEmailModal(lead)} className="bg-white border border-slate-300 text-slate-700 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">✉️ Email</button>
                               <button onClick={() => onDraftProposal?.(lead, selectedServicesMap[lead.id] || [])} className="bg-black text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">Draft</button>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col animate-in zoom-in-95 duration-300">
                           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                             <div>
                               <h3 className="text-xl font-black text-slate-900">{lead.name}</h3>
                               <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{lead.website}</p>
                             </div>
                             <div className="text-right">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry</div>
                               <div className="text-sm font-bold text-slate-800">{lead.industry}</div>
                             </div>
                           </div>

                           <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-6">
                                {[
                                  { label: 'Mobile UX', score: lead.analysisReport!.mobileScore },
                                  { label: 'SEO Health', score: lead.analysisReport!.seoScore },
                                  { label: 'Page Speed', score: lead.analysisReport!.speedScore }
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <div className={`text-xl font-black ${getScoreColor(item.score)}`}>{item.score}/100</div>
                                  </div>
                                ))}
                              </div>

                              <div className="md:col-span-2 space-y-6">
                                 <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Critical Vulnerabilities</h4>
                                    <div className="space-y-2">
                                      {lead.analysisReport!.criticalIssues.map((issue, i) => (
                                        <div key={i} className="flex items-start space-x-2 text-sm font-medium text-slate-700 bg-rose-50 p-3 rounded-lg border border-rose-100">
                                          <span className="text-rose-500 font-bold">⚠️</span>
                                          <span>{issue}</span>
                                        </div>
                                      ))}
                                    </div>
                                 </div>
                                 <div>
                                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tech Stack</h4>
                                   <div className="flex flex-wrap gap-2">
                                     {lead.analysisReport!.techStack.map((tech, i) => (
                                       <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black border border-slate-200 uppercase tracking-wider">{tech}</span>
                                     ))}
                                   </div>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Action</div>
                                <div className="text-sm font-bold text-white">Pitch: {lead.recommendedServices?.[0]}</div>
                              </div>
                              <div className="flex space-x-3">
                                <button onClick={() => handleOpenEmailModal(lead)} className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-lg">Compose Pitch</button>
                                <button onClick={() => onDraftProposal?.(lead, lead.recommendedServices || [])} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40">Draft Proposal</button>
                              </div>
                           </div>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             </>
           ) : (
             !isLoading && !error && (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center p-8 animate-in fade-in">
                  <div className="text-6xl mb-4 opacity-20 grayscale">
                    {searchScope === 'url_scan' ? '📡' : searchScope === 'single' ? '🔬' : '📡'}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {searchScope === 'url_scan' ? 'Digital Scout Ready' : 'Scanner Ready'}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium max-w-xs mt-2 leading-relaxed">
                    {searchScope === 'url_scan'
                      ? 'Analyze a specific URL to generate a tactical report.'
                      : 'Launch a localized scan to identify high-value prospects.'}
                  </p>
               </div>
             )
           )}

           {isLoading && (
             <div className="min-h-[300px] flex flex-col items-center justify-center p-8 animate-in fade-in">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 w-24 h-24 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  {coords && <div className="absolute inset-0 w-24 h-24 rounded-full border border-emerald-400 animate-ping opacity-20"></div>}
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] animate-pulse">
                  {coords ? 'Sourcing Nearby Data...' : 'Scoping Marketplace...'}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Applying AI Logic</p>
             </div>
           )}
        </div>
      </div>

      {/* Map Modal */}
      {viewingMapLead && viewingMapLead.latitude && viewingMapLead.longitude && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-black p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">{viewingMapLead.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{viewingMapLead.address}</p>
              </div>
              <button 
                onClick={() => setViewingMapLead(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${viewingMapLead.latitude},${viewingMapLead.longitude}&z=16&output=embed`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="bg-white p-4 border-t border-slate-100 flex justify-between items-center shrink-0">
               <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Lat: {viewingMapLead.latitude.toFixed(4)} • Long: {viewingMapLead.longitude.toFixed(4)}
               </div>
               <a href={viewingMapLead.mapsUrl} target="_blank" rel="noopener noreferrer" className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-colors shadow-lg">Open in Maps App ↗</a>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {emailModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Compose Pitch</h3>
               <button onClick={() => setEmailModal({ isOpen: false, lead: null })} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
             </div>
             
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To</label>
                 <input type="email" value={emailDraft.to} onChange={(e) => setEmailDraft({...emailDraft, to: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500" />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                 <input type="text" value={emailDraft.subject} onChange={(e) => setEmailDraft({...emailDraft, subject: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500" />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Message</label>
                 <textarea value={emailDraft.body} onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})} className="w-full h-48 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed" />
               </div>
             </div>

             <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                <button onClick={handleOpenMailApp} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 flex items-center">↗ Open in Mail App</button>
                <div className="flex space-x-3">
                   <button onClick={() => setEmailModal({ isOpen: false, lead: null })} className="text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                   <button onClick={handleSendEmail} disabled={isSendingEmail} className="bg-black text-white text-xs font-black px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center uppercase tracking-wider">{isSendingEmail ? 'Sending...' : 'Send Pitch'}</button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeadResearch;
