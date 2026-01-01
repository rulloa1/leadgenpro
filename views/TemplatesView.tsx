
import React, { useState } from 'react';

const TemplatesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hook' | 'proposal'>('hook');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('hook')}
          className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'hook' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          THE "HOOK" EMAIL
        </button>
        <button 
          onClick={() => setActiveTab('proposal')}
          className={`px-8 py-4 font-bold text-sm transition-all ${activeTab === 'proposal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          PROPOSAL STRUCTURE
        </button>
      </div>

      {activeTab === 'hook' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <span className="mr-2">📧</span> Main Template Body
              </h4>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
{`Hi [Name of Owner or "Team"],

I was searching for [Industry, e.g., roofers/dentists] in [City] on Google Maps today and came across your listing.

I noticed that your [mention specific gap, e.g., website link is broken / recent photos are missing / website isn't mobile-friendly], which might be causing you to miss out on new customers searching nearby.

I help local businesses fix these exact digital issues so they can rank higher and get more calls. I recently did this for [Competitor/Similar Business] and they saw a [X]% increase in leads.

Are you open to a brief chat later this week to see if I can help you do the same?

Best,

[Your Name]
[Your Portfolio/Website Link]
[Your Phone Number]`}
              </div>
              <button className="mt-4 text-blue-600 font-bold text-sm hover:underline">Copy to Clipboard</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Subject Line Options</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                  <span className="font-bold mr-2">A (Direct):</span> Question about [Business Name]’s website
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">
                  <span className="font-bold mr-2">B (Value-led):</span> Idea for [Business Name] on Google Maps
                </div>
                <div className="p-3 bg-purple-50 text-purple-700 rounded-lg text-sm border border-purple-100">
                  <span className="font-bold mr-2">C (Local):</span> Hello from a neighbor in [City]
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl">
              <h4 className="text-sm font-bold mb-3 flex items-center">
                <span className="mr-2">💡</span> Strategy Tip
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Since you are reaching out cold, you should <span className="text-white font-bold">not</span> send a full proposal immediately. Your goal is to get a reply or a meeting.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-8">
          <div className="border-b-4 border-slate-900 pb-4">
            <h3 className="text-2xl font-black text-slate-900">FORMAL SERVICE PROPOSAL</h3>
          </div>

          <section>
            <h4 className="text-lg font-bold text-slate-800 mb-2">1. Executive Summary</h4>
            <div className="p-4 bg-slate-50 border-l-4 border-blue-500 text-sm text-slate-600 italic">
              Objective: Briefly state what the client needs (e.g., "Improve local visibility and website conversion").
              <br/>
              Solution: Summarize your digital service (e.g., "Website redesign and Google Business Profile optimization").
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold text-slate-800 mb-2">2. The Problem</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              "Currently, [Business Name] has a digital presence that does not reflect the quality of its real-world services. Specifically, we identified [X, Y, and Z issues] that are creating friction for potential customers."
            </p>
          </section>

          <section>
            <h4 className="text-lg font-bold text-slate-800 mb-2">3. The Proposed Solution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Deliverable 1: Website Overhaul</div>
                <div className="text-xs text-slate-500">Mobile responsive design, SEO optimization, speed improvements.</div>
              </div>
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Deliverable 2: GBP Optimization</div>
                <div className="text-xs text-slate-500">Profile verification, photo upload, review management strategy.</div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-lg font-bold text-slate-800 mb-2">4. Timeline & Investment</h4>
            <table className="w-full text-sm">
              <thead className="text-left border-b border-slate-200">
                <tr>
                  <th className="py-2 font-bold">Phase</th>
                  <th className="py-2 font-bold">Timeline</th>
                  <th className="py-2 font-bold text-right">Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">Research & Design</td>
                  <td className="py-3">Week 1-2</td>
                  <td className="py-3 text-right">$[Amount]</td>
                </tr>
                <tr>
                  <td className="py-3">Implementation & Launch</td>
                  <td className="py-3">Week 3-4</td>
                  <td className="py-3 text-right">$[Amount]</td>
                </tr>
                <tr className="font-bold text-lg">
                  <td colSpan={2} className="py-4">Total Investment</td>
                  <td className="py-4 text-right text-blue-600">$[Total]</td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <div className="flex justify-end pt-8">
            <button className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesView;
