
import React, { useState, useEffect } from 'react';
import { ProposalData, Client, ClientProposal, BusinessLead } from '../types';

interface Props {
  initialClientId?: string | null;
  prefillLeadData?: { lead: BusinessLead, services: string[] } | null;
  onClearSelection?: () => void;
}

const ProposalView: React.FC<Props> = ({ initialClientId, prefillLeadData, onClearSelection }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [proposal, setProposal] = useState<ProposalData>({
    title: 'Digital Transformation Project',
    clientName: 'Body Balance Chiropractic & Wellness',
    objective: 'Website Redesign & Patient Acquisition System',
    solution: 'Position your practice as a complete wellness solution through strategic digital marketing and conversion optimization.',
    problem: 'Currently, the digital presence does not reflect the high quality of your services. We identified missing mobile optimization and a lack of 24/7 automated booking as primary friction points.',
    deliverables: [
      { title: 'Base Web Platform', details: '12-page comprehensive wellness website', price: '5000' },
      { title: 'Advanced Scheduler', details: 'Real-time appointment booking system', price: '800' },
      { title: 'Local SEO Package', details: 'Targeting high-intent "near me" local keywords', price: '1200' }
    ],
    timeline: [
      { phase: 'Discovery & Design', duration: 'Week 1-2', cost: '2500' },
      { phase: 'Development & Launch', duration: 'Week 3-6', cost: '4500' }
    ],
    caseStudy: 'Resulted in 40% increase in calls for similar clients in this industry.',
    totalInvestment: '9900',
    voiceAgent: {
      enabled: true,
      name: 'Maya',
      language: 'Bilingual',
      greeting: 'Thank you for calling Body Balance Wellness. This is Maya, your virtual assistant. How can I help you find relief today?',
      cost: 1200
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('lgp_clients');
    let clientList: Client[] = [];
    if (saved) {
      clientList = JSON.parse(saved);
      setClients(clientList);
    }

    if (prefillLeadData) {
      const { lead, services } = prefillLeadData;
      setProposal({
        title: `${lead.name} Strategy`,
        clientName: lead.name,
        objective: `Digital expansion for ${lead.name}`,
        solution: `Implement a high-performance growth stack to address existing ${lead.gap} and capitalize on ${lead.yearsInBusiness} of established reputation.`,
        problem: `Primary operational friction identified: ${lead.gap}. Digital assets currently underperform compared to offline reputation.`,
        deliverables: services.map(s => ({
          title: s,
          details: `Implementation and optimization of ${s} tailored for ${lead.industry} in ${lead.city}.`,
          price: (Math.floor(Math.random() * 20) * 100 + 1000).toString()
        })),
        timeline: [
          { phase: 'Strategy & Setup', duration: 'Week 1', cost: '1500' },
          { phase: 'Live Launch', duration: 'Week 2-4', cost: '2500' }
        ],
        caseStudy: 'Standard optimization results in 25-40% increase in conversion efficiency.',
        totalInvestment: '0', // will recalculate below
        voiceAgent: {
          enabled: services.some(s => s.toLowerCase().includes('agent') || s.toLowerCase().includes('setter')),
          name: 'AI Assist',
          language: 'Bilingual',
          greeting: `Hello, thanks for calling ${lead.name}. How can I help you today?`,
          cost: 1200
        }
      });
      // Trigger total calculation
      setTimeout(() => {
        setProposal(prev => {
          const base = prev.deliverables.reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0);
          const voice = prev.voiceAgent.enabled ? prev.voiceAgent.cost : 0;
          return { ...prev, totalInvestment: (base + voice).toString() };
        });
      }, 0);
    } else if (initialClientId && clientList.length > 0) {
      const client = clientList.find(c => c.id === initialClientId);
      if (client) {
        setProposal(prev => ({
          ...prev,
          clientId: client.id,
          clientName: client.name,
        }));
      }
    }
  }, [initialClientId, prefillLeadData]);

  const updateField = (field: keyof ProposalData, value: any) => {
    setProposal(prev => ({ ...prev, [field]: value }));
  };

  const updateVoiceAgent = (updates: Partial<typeof proposal.voiceAgent>) => {
    const newAgent = { ...proposal.voiceAgent, ...updates };
    setProposal(prev => {
      const baseTotal = prev.deliverables.reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0);
      const agentCost = newAgent.enabled ? newAgent.cost : 0;
      return { 
        ...prev, 
        voiceAgent: newAgent,
        totalInvestment: (baseTotal + agentCost).toString()
      };
    });
  };

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId === 'manual') {
      onClearSelection?.();
      updateField('clientName', 'New Prospect');
      updateField('clientId', undefined);
      return;
    }
    const client = clients.find(c => c.id === selectedId);
    if (client) {
      setProposal(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
      }));
    }
  };

  const handleAddDeliverable = () => {
    updateField('deliverables', [...proposal.deliverables, { title: '', details: '', price: '0' }]);
  };

  const handleRemoveDeliverable = (index: number) => {
    const newList = proposal.deliverables.filter((_, i) => i !== index);
    updateField('deliverables', newList);
    calculateTotal(newList, proposal.voiceAgent.enabled);
  };

  const handleDeliverableChange = (index: number, field: string, value: string) => {
    const newList = proposal.deliverables.map((item, i) => i === index ? { ...item, [field]: value } : item);
    updateField('deliverables', newList);
    calculateTotal(newList, proposal.voiceAgent.enabled);
  };

  const calculateTotal = (deliverables: any[], agentEnabled: boolean) => {
    const base = deliverables.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const total = base + (agentEnabled ? proposal.voiceAgent.cost : 0);
    updateField('totalInvestment', total.toString());
  };

  const handleAddTimeline = () => {
    updateField('timeline', [...proposal.timeline, { phase: '', duration: '', cost: '0' }]);
  };

  const handleRemoveTimeline = (index: number) => {
    updateField('timeline', proposal.timeline.filter((_, i) => i !== index));
  };

  const handleTimelineChange = (index: number, field: string, value: string) => {
    const newList = proposal.timeline.map((item, i) => i === index ? { ...item, [field]: value } : item);
    updateField('timeline', newList);
  };

  const handleSaveProposal = () => {
    if (!proposal.clientId) {
      alert("Please select a client to save this proposal to their history.");
      return;
    }

    const saved = localStorage.getItem('lgp_clients');
    if (saved) {
      const allClients: Client[] = JSON.parse(saved);
      const updatedClients = allClients.map(c => {
        if (c.id === proposal.clientId) {
          const newProp: ClientProposal = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            title: proposal.title,
            amount: proposal.totalInvestment,
            status: 'Draft'
          };
          return { ...c, proposals: [newProp, ...c.proposals] };
        }
        return c;
      });
      localStorage.setItem('lgp_clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
      alert("Proposal successfully saved to " + proposal.clientName + "'s history.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <style>{`
        .doc-body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .doc-header { border-bottom: 3px solid #2563eb; padding: 40px; background: white; }
        .doc-title { font-size: 28px; color: #1e293b; font-weight: 600; text-transform: uppercase; }
        .doc-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; text-align: left; }
        .meta-label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; }
        .meta-value { color: #1e293b; font-size: 14px; }
        .doc-section-h2 { font-size: 18px; color: #1e293b; margin: 25px 0 15px 0; padding: 10px; background: #f1f5f9; border-left: 4px solid #2563eb; font-weight: bold; text-align: left; }
        .doc-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .doc-th { background: #2563eb; color: white; padding: 12px; text-align: left; font-size: 14px; }
        .doc-td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: left; }
        .doc-total-row { font-weight: bold; background: #f1f5f9; font-size: 16px; border-top: 2px solid #2563eb; }
        .doc-signature-block { padding: 15px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-align: left; }
        .doc-signature-field { border-bottom: 2px solid #94a3b8; height: 40px; margin: 15px 0; background: white; position: relative; }
        .doc-marker { position: absolute; top: 10px; left: 10px; color: #2563eb; font-size: 10px; font-weight: bold; opacity: 0.5; }
        .doc-card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0; }
        .doc-val-card { text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
      `}</style>

      {prefillLeadData && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 text-emerald-800">
            <span className="text-xl">✨</span>
            <span className="text-sm font-bold">Drafting strategy for new lead: <span className="underline">{prefillLeadData.lead.name}</span></span>
          </div>
          <button onClick={onClearSelection} className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline">Clear Draft</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-8 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900">Proposal Builder</h3>
              <select 
                className="text-xs font-bold text-blue-600 bg-blue-50 border-none rounded px-3 py-1.5 outline-none max-w-[150px]"
                value={proposal.clientId || 'manual'}
                onChange={handleClientSelect}
              >
                <option value="manual">Manual Selection</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Project Code</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold" value={proposal.title} onChange={e => updateField('title', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total ($)</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-blue-600 bg-blue-50" value={proposal.totalInvestment} readOnly />
                </div>
              </div>

              {/* AI Voice Agent Creator */}
              <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${proposal.voiceAgent.enabled ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/40'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${proposal.voiceAgent.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      🤖
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">AI Voice Agent</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Auto Appointment Setting</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateVoiceAgent({ enabled: !proposal.voiceAgent.enabled })}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all uppercase tracking-widest ${proposal.voiceAgent.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {proposal.voiceAgent.enabled ? 'ATTACHED' : 'ADD AGENT'}
                  </button>
                </div>

                {proposal.voiceAgent.enabled && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Agent Name</label>
                        <input type="text" className="w-full px-3 py-2 border border-emerald-100 rounded-xl bg-white text-xs font-bold" value={proposal.voiceAgent.name} onChange={e => updateVoiceAgent({ name: e.target.value })} placeholder="e.g. Maya" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Capabilities</label>
                        <select className="w-full px-3 py-2 border border-emerald-100 rounded-xl bg-white text-xs font-bold" value={proposal.voiceAgent.language} onChange={e => updateVoiceAgent({ language: e.target.value as any })}>
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="Bilingual">Bilingual</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Live Greeting Script</label>
                      <textarea className="w-full px-3 py-2 border border-emerald-100 rounded-xl bg-white text-xs font-medium h-16 resize-none italic leading-snug" value={proposal.voiceAgent.greeting} onChange={e => updateVoiceAgent({ greeting: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Proposal Headline</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium" value={proposal.objective} onChange={e => updateField('objective', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Executive Summary</label>
                <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none font-medium leading-relaxed" value={proposal.solution} onChange={e => updateField('solution', e.target.value)} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Deliverables</label>
                  <button onClick={handleAddDeliverable} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black hover:bg-blue-100 transition-colors uppercase tracking-widest">+ Item</button>
                </div>
                {proposal.deliverables.map((d, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 relative group">
                    <button onClick={() => handleRemoveDeliverable(i)} className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-lg">×</button>
                    <input placeholder="Title" className="w-full bg-transparent border-b border-slate-200 text-sm font-bold focus:border-blue-400 outline-none" value={d.title} onChange={e => handleDeliverableChange(i, 'title', e.target.value)} />
                    <input placeholder="Description" className="w-full bg-transparent border-b border-slate-200 text-xs font-medium text-slate-500 focus:border-blue-400 outline-none" value={d.details} onChange={e => handleDeliverableChange(i, 'details', e.target.value)} />
                    <div className="flex items-center text-xs text-slate-400 font-black">
                      <span className="mr-1">$</span>
                      <input placeholder="0" className="bg-transparent border-b border-slate-200 focus:border-blue-400 outline-none w-24 text-slate-700" value={d.price} onChange={e => handleDeliverableChange(i, 'price', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button 
                  onClick={handleSaveProposal}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all mb-4"
                >
                  Save Proposal to CRM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* High Fidelity Preview */}
        <div className="lg:col-span-7 bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] rounded-none border border-slate-200 overflow-hidden doc-body mx-auto w-full max-w-[8.5in]">
          <div className="doc-header">
            <div className="flex justify-between items-start mb-12 text-left">
              <div>
                <div className="text-3xl font-black tracking-tighter">
                  <span className="text-slate-900 uppercase">ROYS</span>
                  <span className="text-amber-500 uppercase">COMPANY</span>
                  <span className="text-red-600 uppercase">.COM</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-black mt-2">Scale with Intelligence</div>
              </div>
              <div className="text-right text-[10px] text-slate-500 space-y-2 uppercase font-black tracking-widest">
                <div className="text-slate-900 text-sm">Agreement For Services</div>
                <div>Ref: {proposal.clientId ? proposal.clientId.toUpperCase() : 'NEW-MARKET'}-{new Date().getFullYear()}</div>
                <div>Date: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            
            <div className="text-center py-14 border-y-2 border-slate-900 my-10">
              <h1 className="doc-title mb-6 tracking-tighter !font-black !text-4xl">Service Partnership</h1>
              <div className="text-4xl font-black text-blue-600 mb-4">{proposal.clientName}</div>
              <div className="inline-block bg-slate-900 text-white px-8 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em]">
                {proposal.title}
              </div>
            </div>

            <div className="doc-meta">
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-900 border-b-2 border-slate-100 pb-2 uppercase tracking-widest">Partner Data</h3>
                <div>
                  <div className="meta-label">Client Entity</div>
                  <div className="meta-value font-black text-xl text-slate-900">{proposal.clientName}</div>
                </div>
                <div>
                  <div className="meta-label">Core Objective</div>
                  <div className="meta-value font-bold text-slate-500 leading-tight">{proposal.objective}</div>
                </div>
              </div>
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-900 border-b-2 border-slate-100 pb-2 uppercase tracking-widest">Deal Structure</h3>
                <div>
                  <div className="meta-label">Project Valuation</div>
                  <div className="meta-value text-blue-600 font-black text-4xl">${proposal.totalInvestment}</div>
                </div>
                <div>
                  <div className="meta-label">Deployment Windows</div>
                  <div className="meta-value font-black text-slate-800 uppercase tracking-widest">Est. {proposal.timeline.length > 0 ? proposal.timeline.length * 2 : '8'} Weeks</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-16 py-12 bg-white text-left">
            <div className="bg-slate-900 p-10 rounded-3xl mb-12 text-left relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24"></div>
              <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-6">01. Strategic Summary</h2>
              <p className="text-slate-100 text-lg leading-relaxed font-bold italic">
                "{proposal.solution}"
              </p>
            </div>

            <div className="doc-card-grid mb-12">
              <div className="doc-val-card !border-2 !border-slate-100 !rounded-2xl py-6">
                <div className="text-3xl font-black text-blue-600">15+</div>
                <div className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">Yrs Excellence</div>
              </div>
              <div className="doc-val-card !border-2 !border-slate-100 !rounded-2xl py-6">
                <div className="text-3xl font-black text-emerald-500">99%</div>
                <div className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">Uptime Avg</div>
              </div>
              <div className="doc-val-card !border-2 !border-slate-100 !rounded-2xl py-6">
                <div className="text-3xl font-black text-purple-500">API</div>
                <div className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">First Logic</div>
              </div>
              <div className="doc-val-card !border-2 !border-slate-100 !rounded-2xl py-6 shadow-lg shadow-rose-100">
                <div className="text-3xl font-black text-rose-500">AI</div>
                <div className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">Deep Native</div>
              </div>
            </div>

            <h2 className="doc-section-h2 uppercase tracking-[0.3em] !bg-slate-900 !text-white !border-none !rounded-2xl text-center py-4 text-xs">Technical Scope of Work</h2>
            
            <table className="doc-table mt-8">
              <thead>
                <tr>
                  <th className="doc-th uppercase text-[10px] tracking-widest !bg-slate-100 !text-slate-500 !font-black border-none">Module</th>
                  <th className="doc-th uppercase text-[10px] tracking-widest !bg-slate-100 !text-slate-500 !font-black border-none">Specifications</th>
                  <th className="doc-th text-right uppercase text-[10px] tracking-widest !bg-slate-100 !text-slate-500 !font-black border-none">Investment</th>
                </tr>
              </thead>
              <tbody>
                {proposal.deliverables.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="doc-td font-black text-slate-900 py-6">{d.title || 'Untitled Module'}</td>
                    <td className="doc-td text-slate-500 text-xs font-medium leading-relaxed">{d.details || 'Technical implementation pending review.'}</td>
                    <td className="doc-td text-right font-black text-slate-900 text-lg">${d.price || '0'}</td>
                  </tr>
                ))}
                
                {/* Voice Agent Implementation Block */}
                {proposal.voiceAgent.enabled && (
                  <tr className="bg-emerald-50/30 border-t-2 border-emerald-100">
                    <td className="doc-td font-black text-emerald-700 py-8">
                      <span className="block text-[8px] uppercase tracking-widest mb-1">Advanced AI Module</span>
                      Voice Agent: {proposal.voiceAgent.name}
                    </td>
                    <td className="doc-td text-emerald-900/60 text-xs font-bold leading-relaxed">
                      24/7 Multi-channel Appointment Setting.<br/> 
                      Primary Scripting: {proposal.voiceAgent.greeting.substring(0, 50)}...
                    </td>
                    <td className="doc-td text-right font-black text-emerald-600 text-2xl">${proposal.voiceAgent.cost}</td>
                  </tr>
                )}

                <tr className="doc-total-row !bg-slate-900 !text-white !rounded-b-2xl">
                  <td colSpan={2} className="doc-td uppercase tracking-[0.4em] font-black text-xs py-8 px-6">Combined Project Valuation</td>
                  <td className="doc-td text-right text-3xl font-black py-8 px-6">${proposal.totalInvestment}</td>
                </tr>
              </tbody>
            </table>

            {/* AI Callout Banner */}
            {proposal.voiceAgent.enabled && (
              <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-[2.5rem] p-12 my-14 text-left relative shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10">
                  <h3 className="text-white font-black text-3xl mb-4 flex items-center tracking-tighter">
                    <span className="mr-4 text-4xl">🤖</span> AI CALL CAPTURE ENGINE
                  </h3>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl mb-8 border border-white/20">
                    <div className="text-[10px] font-black text-white/50 uppercase mb-2 tracking-[0.3em]">Proprietary Greeting Protocol:</div>
                    <p className="text-white text-lg font-bold italic leading-relaxed">"{proposal.voiceAgent.greeting}"</p>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl text-center border border-white/10">
                      <span className="block font-black text-white text-3xl mb-1 tracking-tighter">24/7</span>
                      <span className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em]">Response</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl text-center border border-white/10">
                      <span className="block font-black text-white text-3xl mb-1 tracking-tighter">100%</span>
                      <span className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em]">Capture</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl text-center border border-white/10">
                      <span className="block font-black text-white text-3xl mb-1 tracking-tighter">{proposal.voiceAgent.language === 'Bilingual' ? 'EN/ES' : 'NATIVE'}</span>
                      <span className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em]">Fluency</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="doc-section-h2 uppercase tracking-[0.3em] mb-10">Signatures of Authorization</h2>
            <div className="grid grid-cols-2 gap-16 mt-6">
              <div className="doc-signature-block !bg-white border-b-4 border-slate-900 rounded-none !p-0">
                <div className="text-[10px] font-black text-slate-300 mb-8 uppercase tracking-[0.4em] border-b border-slate-50 pb-2">Client Acceptance</div>
                <div className="h-20 relative">
                  <span className="absolute bottom-2 left-0 text-slate-200 text-xs italic">Signature of {proposal.clientName} Representative</span>
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <div>Date of Execution</div>
                  <div>Place of Execution</div>
                </div>
              </div>
              <div className="doc-signature-block !bg-white border-b-4 border-blue-600 rounded-none !p-0">
                <div className="text-[10px] font-black text-slate-300 mb-8 uppercase tracking-[0.4em] border-b border-slate-50 pb-2">Provider Authorization</div>
                <div className="h-20 relative">
                  <span className="absolute bottom-2 left-0 text-blue-600 text-xs font-black uppercase tracking-widest">Authorized by RoysCompany.com</span>
                </div>
                <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <div>Date of Execution</div>
                  <div>Digital Hash: LGP-8832-X</div>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-10 border-t-2 border-slate-100 text-center text-[9px] text-slate-400 uppercase tracking-[0.5em] font-black">
              Verified Immutable Document • LeadGen Pro Automation Suite v1.1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;
