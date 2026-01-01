
import React from 'react';

const WorkflowGuide: React.FC = () => {
  const steps = [
    {
      title: "1. Source Leads (Google Places API)",
      content: "Use the Google Places API to search for businesses in a specific radius. This is the official way to get data (Name, Address, Rating, Website) without getting banned.",
      icon: "📍"
    },
    {
      title: "2. Filter & Enrich (Data Tools)",
      content: "Pass data into a Google Sheet. Use tools like Apollo.io or Hunter.io to find verified email addresses. Crucially, check if they actually need help (e.g. check for 404s).",
      icon: "🧪"
    },
    {
      title: "3. Personalize (AI Generation)",
      content: "Use an AI API (like Gemini) to read the business details and write a unique first line. This ensures your email doesn't look like generic spam.",
      icon: "✨"
    },
    {
      title: "4. Send (Cold Email Software)",
      content: "Connect to platforms like Instantly.ai or Lemlist. These tools 'warm up' your email address to avoid the spam folder. Never use standard Gmail for bulk.",
      icon: "🚀"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Building a "White-Hat" Automation Tool</h2>
        <p className="text-slate-500 leading-relaxed">
          Instead of scraping (which gets blocked) and spamming (which damages your reputation), 
          follow this legitimate workflow using No-Code tools and official APIs.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-6">
            <div className="bg-blue-100 text-blue-600 h-12 w-12 rounded-lg flex items-center justify-center text-2xl shrink-0">
              {step.icon}
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{step.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-8 rounded-xl mt-12">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">⚠️</span>
          <h4 className="text-lg font-bold text-amber-900 uppercase tracking-wide">Crucial Legal Note</h4>
        </div>
        <p className="text-sm text-amber-800 leading-relaxed">
          Do not use standard Gmail/Outlook for bulk sending; your account will be suspended. Always use specialized outreach tools that manage domain reputation and delivery rates. Ensure you comply with CAN-SPAM, GDPR, or local regulations depending on your target location.
        </p>
      </div>
    </div>
  );
};

export default WorkflowGuide;
