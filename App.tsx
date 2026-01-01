
import React, { useState } from 'react';
import { AppSection, BusinessLead } from './types';
import Dashboard from './views/Dashboard';
import LeadResearch from './views/LeadResearch';
import TemplatesView from './views/TemplatesView';
import ProposalView from './views/ProposalView';
import WorkflowGuide from './views/WorkflowGuide';
import ClientsView from './views/ClientsView';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [prefillLead, setPrefillLead] = useState<{ lead: BusinessLead, services: string[] } | null>(null);

  const handleNavigateToProposals = (clientId: string | null) => {
    setPrefillLead(null);
    setSelectedClientId(clientId);
    setActiveSection(AppSection.PROPOSALS);
  };

  const handleDraftFromLead = (lead: BusinessLead, services: string[]) => {
    setSelectedClientId(null);
    setPrefillLead({ lead, services });
    setActiveSection(AppSection.PROPOSALS);
  };

  const renderContent = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD: return <Dashboard onNavigate={setActiveSection} />;
      case AppSection.CLIENTS: return (
        <ClientsView 
          onNavigate={setActiveSection} 
          onViewProposals={handleNavigateToProposals} 
        />
      );
      case AppSection.LEAD_RESEARCH: return <LeadResearch onDraftProposal={handleDraftFromLead} />;
      case AppSection.TEMPLATES: return <TemplatesView />;
      case AppSection.PROPOSALS: return (
        <ProposalView 
          initialClientId={selectedClientId} 
          prefillLeadData={prefillLead}
          onClearSelection={() => {
            setSelectedClientId(null);
            setPrefillLead(null);
          }} 
        />
      );
      case AppSection.WORKFLOW: return <WorkflowGuide />;
      default: return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  const navItems = [
    { id: AppSection.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: AppSection.CLIENTS, label: 'Clients', icon: '👥' },
    { id: AppSection.LEAD_RESEARCH, label: 'Lead Research', icon: '🔍' },
    { id: AppSection.TEMPLATES, label: 'Email Templates', icon: '📧' },
    { id: AppSection.PROPOSALS, label: 'Proposals', icon: '📄' },
    { id: AppSection.WORKFLOW, label: 'Workflow Guide', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-tighter leading-none flex items-baseline">
              <span className="text-white">Roys</span>
              <span className="text-amber-500 italic">Company</span>
              <span className="text-red-600 text-lg">.com</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.3em] font-bold">Automation Cloud</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== AppSection.PROPOSALS) {
                  setSelectedClientId(null);
                  setPrefillLead(null);
                }
                setActiveSection(item.id);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.id 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-900/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent hover:border-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800 text-[9px] text-slate-500 text-center font-black uppercase tracking-widest">
          Enterprise v1.2.0 • Build 882
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
            {navItems.find(i => i.id === activeSection)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-[10px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
