
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

  // Email State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ to: '', subject: '', body: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lgp_clients');
    let clientList: Client[] = [];
    if (saved) {
      clientList = JSON.parse(saved);
      setClients(clientList);
    }

    if (prefillLeadData) {
      const { lead, services } = prefillLeadData;
      
      const getServiceDetails = (serviceName: string) => {
        const lower = serviceName.toLowerCase();
        if (lower.includes('website')) {
          return {
            detail: `Custom high-conversion design for ${lead.name}. Includes mobile-first architecture, speed optimization, and ${lead.industry}-specific landing pages.`,
            price: '3500'
          };
        }
        if (lower.includes('seo')) {
          return {
            detail: `Dominate "${lead.industry} in ${lead.city}" search results. Includes on-page optimization, citation building, and competitor backlink analysis.`,
            price: '1500'
          };
        }
        if (lower.includes('business profile') || lower.includes('gbp')) {
          return {
            detail: `Complete Google Business Profile optimization. We fix the "${lead.gap}" issue, manage reviews, and post weekly updates to drive local traffic.`,
            price: '850'
          };
        }
        return {
          detail: `Implementation and optimization of ${serviceName} tailored for ${lead.industry} in ${lead.city}.`,
          price: (Math.floor(Math.random() * 20) * 100 + 1000).toString()
        };
      };

      setProposal({
        title: `${lead.name} Growth Strategy`,
        clientName: lead.name,
        objective: `Digital expansion for ${lead.name}`,
        solution: `Implement a high-performance growth stack to address existing ${lead.gap} and capitalize on ${lead.yearsInBusiness} of established reputation.`,
        problem: `Primary operational friction identified: ${lead.gap}. Digital assets currently underperform compared to offline reputation.`,
        deliverables: services.map(s => {
          const { detail, price } = getServiceDetails(s);
          return {
            title: s,
            details: detail,
            price: price
          };
        }),
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
            status: 'Draft',
            voiceAgent: proposal.voiceAgent.enabled ? proposal.voiceAgent : undefined
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

  const handlePrepareEmail = () => {
    const client = clients.find(c => c.id === proposal.clientId);
    const emailTo = client?.email || '';
    
    setEmailDraft({
      to: emailTo,
      subject: `Proposal: ${proposal.title} for ${proposal.clientName}`,
      body: `Hi ${proposal.clientName.split(' ')[0]},\n\nPlease find attached the proposal for the ${proposal.title} we discussed.\n\nWe've outlined a strategy to address the ${proposal.problem.substring(0, 50)}... and achieve the growth targets identified.\n\nTotal Investment: $${proposal.totalInvestment}\n\nLet me know if you have any questions.\n\nBest,\n[Your Name]`
    });
    setEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingEmail(false);
    setEmailModalOpen(false);
    alert(`Proposal sent to ${emailDraft.to}`);
  };

  const handleOpenMailApp = () => {
    const mailtoLink = `mailto:${emailDraft.to}?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <style>{`
        .doc-body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #334155; background: white; }
        .doc-header { padding: 60px 50px; background: #0f172a; color: white; position: relative; overflow: hidden; }
        .doc-header::after { content: ''; position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%); transform: translate(50%, -50%); }
        .doc-brand { font-size: 14px; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: #94a3b8; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
        .doc-title { font-size: 42px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 20px; background: linear-gradient(to right, #ffffff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .doc-subtitle { font-size: 16px; color: #94a3b8; font-weight: 500; margin-bottom: 40px; max-width: 600px; }
        
        .doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 1px solid #1e293b; padding-top: 40px; }
        .doc-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; font-weight: 700; margin-bottom: 8px; }
        .doc-value { font-size: 16px; font-weight: 600; color: #f8fafc; }
        
        .doc-content { padding: 60px 50px; }
        
        .doc-section { margin-bottom: 50px; }
        .doc-h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 900; color: #0f172a; margin-bottom: 20px; display: flex; align-items: center; }
        .doc-h2::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; margin-left: 20px; }
        
        .doc-p { font-size: 15px; color: #475569; margin-bottom: 20px; text-align: justify; }
        
        .doc-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
        .doc-th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700; padding: 0 15px 10px 15px; }
        .doc-row { background: #f8fafc; transition: transform 0.2s; page-break-inside: avoid; }
        .doc-td { padding: 20px 15px; font-size: 14px; border: 1px solid #f1f5f9; border-width: 1px 0; }
        .doc-td:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; border-left: 1px solid #f1f5f9; font-weight: 700; color: #0f172a; }
        .doc-td:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; border-right: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a; }
        
        .doc-total { margin-top: 30px; text-align: right; padding: 30px; background: #0f172a; color: white; border-radius: 12px; }
        .doc-total-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 5px; }
        .doc-total-value { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; color: #3b82f6; }
        
        .agent-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 16px; padding: 30px; margin: 30px 0; position: relative; overflow: hidden; }
        .agent-card::before { content: 'AI ACTIVE'; position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.1em; }
        
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; }
        .sig-line { border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 50px; display: flex; justify-content: space-between; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }
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
                    <div className="grid grid-cols-3 gap-3">
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
                      <div>
                        <label className="block text-[9px] font-black text-emerald-600 uppercase mb-1">Monthly Cost ($)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-emerald-100 rounded-xl bg-white text-xs font-bold" 
                          value={proposal.voiceAgent.cost} 
                          onChange={e => updateVoiceAgent({ cost: parseInt(e.target.value) || 0 })} 
                        />
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

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePrepareEmail}
                  className="bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all mb-4"
                >
                  Send Proposal ✉️
                </button>
                <button 
                  onClick={handleSaveProposal}
                  className="bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all mb-4"
                >
                  Save to CRM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* High Fidelity Preview */}
        <div className="lg:col-span-7 bg-white shadow-2xl rounded-sm overflow-hidden doc-body mx-auto w-full max-w-[8.5in] min-h-[11in]">
          <div className="doc-header">
             <div className="doc-brand">
               <span>RoysCompany.com</span>
               <span className="opacity-50">#PRO-{proposal.clientId ? proposal.clientId.toUpperCase() : 'DRAFT'}</span>
             </div>
             <h1 className="doc-title">{proposal.title}</h1>
             <p className="doc-subtitle">Prepared exclusively for {proposal.clientName}</p>
             
             <div className="doc-grid">
               <div>
                 <div className="doc-label">Client Partner</div>
                 <div className="doc-value">{proposal.clientName}</div>
                 <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Authorized: {new Date().toLocaleDateString()}</div>
               </div>
               <div>
                 <div className="doc-label">Project Scope</div>
                 <div className="doc-value">{proposal.timeline.length} Phases</div>
                 <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Est. Completion: 6 Weeks</div>
               </div>
             </div>
          </div>
          
          <div className="doc-content">
            <div className="doc-section">
              <div className="doc-h2">Executive Summary</div>
              <p className="doc-p">{proposal.solution}</p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex gap-6 mt-6">
                <div className="flex-1">
                  <div className="doc-label">Current State</div>
                  <p className="text-sm text-slate-600 mt-2">{proposal.problem}</p>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex-1">
                  <div className="doc-label">Target State</div>
                  <p className="text-sm text-slate-600 mt-2">{proposal.objective}</p>
                </div>
              </div>
            </div>

            <div className="doc-section">
              <div className="doc-h2">Deliverables & Investment</div>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th className="doc-th">Item Description</th>
                    <th className="doc-th">Details</th>
                    <th className="doc-th" style={{textAlign: 'right'}}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.deliverables.map((d, i) => (
                     <tr key={i} className="doc-row">
                       <td className="doc-td">{d.title}</td>
                       <td className="doc-td" style={{color: '#64748b', fontWeight: 400}}>{d.details}</td>
                       <td className="doc-td">${d.price}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {proposal.voiceAgent.enabled && (
              <div className="agent-card">
                <div style={{fontSize: '24px', fontWeight: 900, marginBottom: '10px'}}>Voice AI Integration</div>
                <p style={{opacity: 0.9, fontSize: '14px', marginBottom: '20px', maxWidth: '80%'}}>
                  Includes setup and deployment of <strong>{proposal.voiceAgent.name}</strong>, a {proposal.voiceAgent.language} autonomous agent for 24/7 lead capture.
                </p>
                <div style={{background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', fontSize: '13px', fontStyle: 'italic'}}>
                  "{proposal.voiceAgent.greeting}"
                </div>
                <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px'}}>
                  <span style={{fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700}}>Monthly Infrastructure</span>
                  <span style={{fontSize: '18px', fontWeight: 900}}>${proposal.voiceAgent.cost}/mo</span>
                </div>
              </div>
            )}

            <div className="doc-total">
              <div className="doc-total-label">Total Project Value</div>
              <div className="doc-total-value">${proposal.totalInvestment}</div>
              <div style={{fontSize: '11px', color: '#64748b', marginTop: '5px'}}>* Includes all setup fees and first month of AI infrastructure.</div>
            </div>
            
            <div className="sig-grid">
              <div>
                <div style={{fontSize: '14px', fontWeight: 700, color: '#0f172a'}}>{proposal.clientName}</div>
                <div className="sig-line">
                  <span>Signature</span>
                  <span>Date</span>
                </div>
              </div>
               <div>
                <div style={{fontSize: '14px', fontWeight: 700, color: '#0f172a'}}>RoysCompany.com</div>
                <div className="sig-line">
                  <span>Signature</span>
                  <span>Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Email Composer Modal */}
       {emailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Send Proposal</h3>
               <button onClick={() => setEmailModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
             </div>
             
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To</label>
                 <input 
                   type="email" 
                   value={emailDraft.to} 
                   onChange={(e) => setEmailDraft({...emailDraft, to: e.target.value})}
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                   placeholder="client@company.com"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                 <input 
                   type="text" 
                   value={emailDraft.subject} 
                   onChange={(e) => setEmailDraft({...emailDraft, subject: e.target.value})}
                   className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Message</label>
                 <textarea 
                   value={emailDraft.body} 
                   onChange={(e) => setEmailDraft({...emailDraft, body: e.target.value})}
                   className="w-full h-48 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none resize-none leading-relaxed"
                 />
               </div>
             </div>

             <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                <button 
                  onClick={handleOpenMailApp}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 flex items-center"
                >
                  ↗ Open in Mail App
                </button>
                <div className="flex space-x-3">
                   <button 
                     onClick={() => setEmailModalOpen(false)}
                     className="text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-100 rounded-lg"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSendEmail}
                     disabled={isSendingEmail}
                     className="bg-emerald-600 text-white text-xs font-black px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg flex items-center uppercase tracking-wider"
                   >
                     {isSendingEmail ? 'Sending...' : 'Send Proposal'}
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProposalView;
