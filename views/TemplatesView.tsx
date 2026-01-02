
import React, { useState } from 'react';

const EMAIL_STRATEGIES = [
  {
    id: 'video-audit',
    title: 'The "Loom" Video Audit',
    tag: 'Highest Conversion',
    color: 'bg-emerald-100 text-emerald-800',
    subject: 'Question about [Domain]',
    body: `Hi [Name],

I was analyzing search results for [Service] in [City] and recorded a 45-second video showing exactly why [Competitor Name] is outranking you on Google Maps.

There is a specific "digital gap" in your profile that is preventing you from capturing those leads.

Mind if I send the video over?

Best,

[Your Name]`,
    context: "This works because you aren't selling yet. You are asking permission to provide value. It respects their time."
  },
  {
    id: 'broken-link',
    title: 'The "Broken Link" Fix',
    tag: 'High Reciprocity',
    color: 'bg-blue-100 text-blue-800',
    subject: '404 error on your site?',
    body: `Hey [Name] - I live in [City] and was trying to check out your [Service] page, but I kept getting a 404 error on your booking link.

Just thought I'd give you a heads up in case you were wondering why bookings might be a bit quiet this week!

I build these systems for a living, so if you want me to send over a quick fix for that (and maybe tidy up the mobile view while I'm at it), let me know.

Cheers,

[Your Name]`,
    context: "By pointing out a specific error, you prove you've actually looked at their business. It builds immediate trust."
  },
  {
    id: 'local-partner',
    title: 'The Local Partner',
    tag: 'Relationship',
    color: 'bg-purple-100 text-purple-800',
    subject: 'Referral partner in [City]',
    body: `Hi [Name],

I run a digital growth agency here in [City] and I'm looking for a reliable [Industry, e.g. Roofer] to refer clients to when they ask for recommendations.

I've seen your reviews and you seem to be the top operator in town.

Are you taking on new work right now? I'd love to chat briefly to see if our values align for a referral partnership.

Best,

[Your Name]`,
    context: "Flattery combined with the promise of referrals is a powerful door opener. It frames you as a peer, not a vendor."
  },
  {
    id: 'bump-email',
    title: 'The "Any Thoughts?" Bump',
    tag: 'Follow Up',
    color: 'bg-amber-100 text-amber-800',
    subject: 'Re: Question about [Domain]',
    body: `Hey [Name],

I know running a business in [City] gets crazy. 

I didn't want this to get buried. If you aren't interested in fixing that site issue, no worries at all—just let me know and I'll stop following up!

Best,

[Your Name]`,
    context: "The 'break-up' style ending often triggers a psychological response to reply because they don't want to be rude."
  }
];

const TemplatesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hook' | 'proposal'>('hook');
  const [selectedStrategy, setSelectedStrategy] = useState(EMAIL_STRATEGIES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `Subject: ${selectedStrategy.subject}\n\n${selectedStrategy.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedBody = (text: string) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={index} className="bg-amber-100 text-amber-800 px-1 rounded font-bold">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('hook')}
          className={`px-8 py-4 font-black text-xs tracking-widest transition-all ${activeTab === 'hook' ? 'text-black border-b-4 border-black' : 'text-slate-400 hover:text-slate-600'}`}
        >
          OUTREACH LAB
        </button>
        <button 
          onClick={() => setActiveTab('proposal')}
          className={`px-8 py-4 font-black text-xs tracking-widest transition-all ${activeTab === 'proposal' ? 'text-black border-b-4 border-black' : 'text-slate-400 hover:text-slate-600'}`}
        >
          PROPOSAL ARCHITECTURE
        </button>
      </div>

      {activeTab === 'hook' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Strategy Sidebar */}
          <div className="lg:col-span-4 flex flex-col space-y-4 pr-2 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Select Strategy</h3>
            {EMAIL_STRATEGIES.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => { setSelectedStrategy(strategy); setCopied(false); }}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                  selectedStrategy.id === strategy.id 
                    ? 'border-black bg-white shadow-xl' 
                    : 'border-white bg-white hover:border-slate-200 text-slate-500 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${strategy.color}`}>
                    {strategy.tag}
                  </span>
                </div>
                <h4 className={`text-sm font-black relative z-10 ${selectedStrategy.id === strategy.id ? 'text-slate-900' : 'text-slate-600'}`}>
                  {strategy.title}
                </h4>
                {selectedStrategy.id === strategy.id && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
                )}
              </button>
            ))}

            <div className="bg-slate-900 rounded-xl p-6 mt-auto text-white shadow-xl">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">💡</span>
                <span className="font-black text-xs uppercase tracking-widest">Psychology Note</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {selectedStrategy.context}
              </p>
            </div>
          </div>

          {/* Preview Window */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Preview</div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Line</label>
                <div className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                  {renderHighlightedBody(selectedStrategy.subject)}
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Message Body</label>
                <div className="text-sm text-slate-600 leading-7 whitespace-pre-wrap font-medium font-mono">
                  {renderHighlightedBody(selectedStrategy.body)}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div className="text-[10px] text-slate-400 font-bold">
                <span className="text-amber-600">Note:</span> Replace highlighted text before sending.
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  copied 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-black text-white hover:bg-slate-800 shadow-lg shadow-slate-200 hover:-translate-y-1'
                }`}
              >
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY TEMPLATE'}</span>
                {!copied && <span>📋</span>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden doc-body mx-auto w-full max-w-[8.5in] border border-slate-200">
           <style>{`
            .static-doc-header { padding: 50px; background: #0f172a; color: white; position: relative; }
            .static-doc-title { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 10px; }
            .static-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; font-weight: 700; margin-bottom: 5px; }
            .static-p { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
          `}</style>
          
          <div className="static-doc-header">
            <div className="static-label text-blue-400">Standard Framework</div>
            <h1 className="static-doc-title">Formal Service Agreement</h1>
            <p className="text-slate-400 text-sm">Use this structure for the "Draft Proposal" feature.</p>
          </div>

          <div className="p-12">
            <div className="mb-10">
              <div className="static-label">Section 1</div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Executive Summary</h3>
              <p className="static-p bg-slate-50 p-4 rounded-lg border-l-4 border-blue-500">
                <span className="font-bold">Goal:</span> Hook the client immediately by restating their problem better than they understand it themselves. Do not talk about yourself yet. Talk about their current inefficiency.
              </p>
            </div>

            <div className="mb-10">
              <div className="static-label">Section 2</div>
              <h3 className="text-lg font-black text-slate-900 mb-2">The Solution & Deliverables</h3>
              <p className="static-p">
                Break down the project into modular components. Avoid "hourly rates". Use "Fixed Price Deliverables" to increase perceived value.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="font-black text-slate-800 text-sm">Deliverable A</div>
                  <div className="text-xs text-slate-500 mt-1">Outcome based description.</div>
                </div>
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="font-black text-slate-800 text-sm">Deliverable B</div>
                  <div className="text-xs text-slate-500 mt-1">Outcome based description.</div>
                </div>
              </div>
            </div>

            <div>
              <div className="static-label">Section 3</div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Investment & Timeline</h3>
              <p className="static-p">
                Present price as an "Investment". Always include a timeline to create scarcity and urgency.
              </p>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center">
                 <span className="text-sm font-bold text-slate-700">Total Project Value</span>
                 <span className="text-xl font-black text-slate-900">$[High Ticket Amount]</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesView;
