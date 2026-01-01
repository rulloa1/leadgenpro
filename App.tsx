
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
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">LeadGen Pro</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Automation Suite</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          v1.1.0 • Enhanced CRM
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.id === activeSection)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
