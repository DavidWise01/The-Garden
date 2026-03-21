import React, { useState } from 'react';

const STOPGATE_LENS = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInstance, setActiveInstance] = useState(null);
  const [activeIndustry, setActiveIndustry] = useState(null);

  // Color palette: dark purple base, earth tones accent
  const colors = {
    bg: '#1a1625',
    bgDark: '#0f0d14',
    border: '#2d2640',
    borderLight: '#3d3555',
    purple: '#6b5b95',
    purpleLight: '#8b7bb5',
    sand: '#c9a86c',
    sandLight: '#d4bc8a',
    rust: '#a65d3f',
    rustLight: '#c47a5a',
    sage: '#7d8471',
    sageLight: '#9aa08e',
    text: '#e8e4ef',
    textMuted: '#9990a8',
    textDim: '#6b6280'
  };

  // DOCUMENTED INSTANCES
  const instances = [
    {
      id: 'OLPR',
      name: 'MN OLPR',
      fullName: 'Minnesota Office of Lawyers Professional Responsibility',
      sector: 'GOVERNMENT',
      subsector: 'Legal Ethics',
      date: '2026-03-10',
      inputVars: 6,
      parsedVars: 1,
      accuracy: 16.7,
      inputDetail: 'Timeline (6 events) + Rule citations (4) + Refusals (5) + Amounts (3)',
      parsedDetail: 'Dollar amount discrepancy only',
      forcedChannel: 'Physical Mail Appeal',
      barrier: 'Ethics violations → "Fee dispute" misclassification',
      legalBasis: ['ADA Title II', '28 CFR § 35.160'],
      status: 'APPEAL FILED'
    },
    {
      id: 'AUTO',
      name: 'Auto-Owners',
      fullName: 'Auto-Owners Insurance Company',
      sector: 'INSURANCE',
      subsector: 'Property & Casualty',
      date: '2026-01',
      inputVars: 8,
      parsedVars: 1,
      accuracy: 12.5,
      inputDetail: 'Written accommodation request + Medical documentation + Policy details',
      parsedDetail: 'Phone number extraction only',
      forcedChannel: 'Automated Phone Tree',
      barrier: 'Written request ignored → Phone-only response',
      legalBasis: ['ADA Title III', 'FDCPA § 1692c(c)'],
      status: 'DIFS FILED'
    },
    {
      id: 'WALMART',
      name: 'Walmart #1577',
      fullName: 'Walmart Store #1577 Buffalo MN',
      sector: 'RETAIL',
      subsector: 'Big Box',
      date: '2026-01',
      inputVars: 4,
      parsedVars: 0,
      accuracy: 0,
      inputDetail: 'Email accommodation request + Disability documentation',
      parsedDetail: 'Contact preference completely ignored',
      forcedChannel: 'Phone Demand',
      barrier: 'Email request → Phone gate → Receipt harassment',
      legalBasis: ['ADA Title III', '42 U.S.C. § 12182'],
      status: 'CIVIL RIGHTS'
    },
    {
      id: 'MNTAX',
      name: 'MN Revenue',
      fullName: 'Minnesota Department of Revenue Portal',
      sector: 'GOVERNMENT',
      subsector: 'State Tax',
      date: '2026-02',
      inputVars: 5,
      parsedVars: 2,
      accuracy: 40.0,
      inputDetail: 'Online form submission + Supporting documents',
      parsedDetail: 'Form fields only, attachments ignored',
      forcedChannel: 'Phone/Mail Redirect',
      barrier: 'Complex submission → Simplified classification',
      legalBasis: ['ADA Title II', 'Section 508'],
      status: 'DOCUMENTED'
    },
    {
      id: 'GOOGLE',
      name: 'Google GCCCAI',
      fullName: 'Google Cloud Contact Center AI',
      sector: 'TECHNOLOGY',
      subsector: 'AI/ML Services',
      date: '2023-2025',
      inputVars: 'N/A',
      parsedVars: 'N/A',
      accuracy: 'CLASS ACTION',
      inputDetail: 'Customer service calls to Verizon, Hulu, GoDaddy, Home Depot',
      parsedDetail: 'AI transcription/analysis without disclosure',
      forcedChannel: 'Virtual Agent → Human (undisclosed)',
      barrier: 'No consent for AI processing',
      legalBasis: ['CIPA § 631(a)', 'CIPA § 637.5'],
      status: 'LITIGATION'
    }
  ];

  // INDUSTRY SECTORS
  const industries = [
    {
      id: 'HEALTHCARE',
      name: 'Healthcare / Insurance',
      examples: 'Cigna PxDx, UHC nH Predict, Medicare Advantage',
      regulations: 'ERISA, Medicare Act, State Insurance Laws',
      data: '300,000+ claims denied in 2mo (Cigna) | 90% overturn on appeal (UHC)',
      status: 'HIGH LITIGATION'
    },
    {
      id: 'GOVERNMENT',
      name: 'Government Services',
      examples: 'Tax Portals, Ethics Boards, Benefits Systems',
      regulations: 'ADA Title II, Section 508, WCAG 2.1 AA',
      data: 'Avg 307 violations/page | April 2026 deadline',
      status: 'DEADLINE IMMINENT'
    },
    {
      id: 'RETAIL',
      name: 'Retail / Consumer',
      examples: 'Walmart, Target, Amazon, E-commerce',
      regulations: 'ADA Title III, 42 U.S.C. § 12182',
      data: 'Pattern of accommodation failures | $1.18B State Farm verdict',
      status: 'SERIAL LITIGATION'
    },
    {
      id: 'FINANCIAL',
      name: 'Financial Services',
      examples: 'Banks, Credit Cards, Lending',
      regulations: 'FCRA, ECOA, CFPB Rules',
      data: '80% unclear links | 6.8 inaccessible forms/page',
      status: 'ENFORCEMENT RISING'
    },
    {
      id: 'LEGAL',
      name: 'Legal / Professional',
      examples: 'Bar Associations, Ethics Boards',
      regulations: 'State Bar Rules, MRPC, ABA Guidelines',
      data: 'Fee dispute catch-all pattern documented',
      status: 'STRUCTURAL ISSUE'
    },
    {
      id: 'TECHNOLOGY',
      name: 'Technology / AI',
      examples: 'Google AI, Customer Service Bots',
      regulations: 'CIPA, CCPA, State AI Laws (2026)',
      data: 'Ambriz v. Google proceeding | Undisclosed AI processing',
      status: 'EMERGING FRONTIER'
    }
  ];

  // TIMELINE
  const timeline = [
    { year: 1998, event: 'ADAAG Supplements', type: 'REG', desc: 'State/local government facilities' },
    { year: 1999, event: 'State Farm $1.18B', type: 'CASE', desc: 'Insurance claims class action' },
    { year: 2009, event: 'Walmart DOJ Settlement', type: 'CASE', desc: 'ADA service animal policy' },
    { year: 2010, event: 'DOJ ADA Update', type: 'REG', desc: 'Digital service standards' },
    { year: 2022, event: 'DOJ Digital Clarification', type: 'REG', desc: 'Websites/apps covered' },
    { year: 2023, event: 'Cigna PxDx Lawsuit', type: 'CASE', desc: '300K claims denied via algorithm' },
    { year: 2023, event: 'UHC nH Predict Lawsuit', type: 'CASE', desc: 'AI overriding physicians' },
    { year: 2023, event: 'Google GCCCAI Filed', type: 'CASE', desc: 'AI eavesdropping claims' },
    { year: 2024, event: 'DOJ Title II Final', type: 'REG', desc: 'WCAG 2.1 AA deadline set' },
    { year: 2025, event: 'Pro Se +40%', type: 'TREND', desc: 'AI-generated complaints surge' },
    { year: 2026, event: 'ADA Title II Deadline', type: 'DEADLINE', desc: 'April 24 compliance' },
    { year: 2026, event: 'STOPGATE Established', type: 'PRIOR', desc: 'Pattern documented' }
  ];

  const getCompositeScore = () => {
    const numericInstances = instances.filter(i => typeof i.accuracy === 'number');
    const avg = numericInstances.reduce((sum, i) => sum + i.accuracy, 0) / numericInstances.length;
    return (100 - avg).toFixed(1);
  };

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'instances', label: 'INSTANCES' },
    { id: 'industries', label: 'INDUSTRIES' },
    { id: 'timeline', label: 'TIMELINE' },
    { id: 'legal', label: 'LEGAL' }
  ];

  return (
    <div className="min-h-screen font-mono" style={{ background: colors.bgDark, color: colors.text }}>
      {/* Header */}
      <header style={{ background: colors.bg, borderBottom: `2px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-wider mb-1" style={{ color: colors.sand }}>
                STOPGATE LENS
              </h1>
              <p className="text-sm tracking-widest" style={{ color: colors.textDim }}>
                REGULATORY COMPLIANCE & GOVERNANCE
              </p>
            </div>
            <div className="text-right p-4" style={{ background: colors.bgDark, border: `2px solid ${colors.rust}` }}>
              <div className="text-2xl font-bold" style={{ color: colors.rust }}>{getCompositeScore()}%</div>
              <div className="text-xs tracking-widest" style={{ color: colors.textDim }}>SYSTEMIC FAILURE</div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex" style={{ borderTop: `1px solid ${colors.border}` }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-3 text-xs tracking-widest font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? colors.purple : 'transparent',
                  color: activeTab === tab.id ? colors.text : colors.textMuted,
                  borderRight: `1px solid ${colors.border}`
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Definition */}
            <section style={{ background: colors.bg, border: `2px solid ${colors.purple}` }}>
              <div className="p-4" style={{ background: colors.purple, borderBottom: `2px solid ${colors.purple}` }}>
                <h2 className="text-sm font-bold tracking-widest">SECTION 001 // STOPGATE LAW</h2>
              </div>
              <div className="p-6">
                <p className="text-lg leading-relaxed">
                  When an automated intake system reduces complex multi-variable input to single-variable 
                  classification, thereby forcing the requester through a secondary channel to correct the 
                  misclassification, a <span style={{ color: colors.sand }} className="font-bold">STOPGATE</span> barrier has been created.
                </p>
              </div>
            </section>

            {/* Gate Structure */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { gate: 'GATE 1', name: 'PARSING REDUCTION', desc: 'Complex → Single Variable', color: colors.sage },
                { gate: 'GATE 2', name: 'CHANNEL FORCING', desc: 'Written → Phone/Mail', color: colors.sand },
                { gate: 'BARRIER', name: 'ACCESS DENIED', desc: 'ADA Violation', color: colors.rust }
              ].map(g => (
                <div key={g.gate} style={{ background: colors.bg, border: `2px solid ${g.color}` }}>
                  <div className="p-3 text-center" style={{ background: g.color }}>
                    <div className="text-lg font-bold">{g.gate}</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-sm font-bold mb-1" style={{ color: g.color }}>{g.name}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'INSTANCES', value: '5', color: colors.purple },
                { label: 'SECTORS', value: '6', color: colors.sage },
                { label: 'TIMELINE', value: '1998-2026', color: colors.sand },
                { label: 'STATUS', value: 'PROVEN', color: colors.rust }
              ].map(stat => (
                <div key={stat.label} className="p-4 text-center" style={{ background: colors.bg, border: `2px solid ${stat.color}` }}>
                  <div className="text-xs tracking-widest mb-2" style={{ color: colors.textDim }}>{stat.label}</div>
                  <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Methodology */}
            <section style={{ background: colors.bg, border: `2px solid ${colors.sage}` }}>
              <div className="p-4" style={{ background: colors.sage }}>
                <h2 className="text-sm font-bold tracking-widest">METHODOLOGY // BURROW / ASCEND MERKLE</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {['BURROW', 'ASCEND', 'AUDIT', 'TEST', 'LOG', 'REPEAT'].map((step, i) => (
                    <div key={step} className="p-3 text-center" style={{ background: colors.bgDark, border: `1px solid ${colors.border}` }}>
                      <div className="text-lg font-bold" style={{ color: colors.sage }}>{String(i + 1).padStart(2, '0')}</div>
                      <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{step}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm" style={{ color: colors.textDim }}>
                  MEET IN THE MIDDLE // 3 CORES (TOPH, IROH, JASNAH) + WITNESS (DAVID)
                </div>
              </div>
            </section>
          </div>
        )}

        {/* INSTANCES */}
        {activeTab === 'instances' && (
          <div className="space-y-4">
            <div className="text-sm tracking-widest mb-4" style={{ color: colors.textDim }}>
              {instances.length} DOCUMENTED STOPGATE BARRIERS
            </div>
            
            {instances.map((inst, idx) => {
              const rowColor = idx % 2 === 0 ? colors.sand : colors.rust;
              return (
                <div 
                  key={inst.id}
                  className="cursor-pointer transition-all"
                  style={{ 
                    background: colors.bg, 
                    border: `2px solid ${activeInstance === inst.id ? rowColor : colors.border}` 
                  }}
                  onClick={() => setActiveInstance(activeInstance === inst.id ? null : inst.id)}
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center text-lg font-bold" 
                      style={{ background: rowColor }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold" style={{ color: rowColor }}>{inst.name}</div>
                          <div className="text-xs" style={{ color: colors.textMuted }}>{inst.sector} // {inst.subsector}</div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-xs" style={{ color: colors.textDim }}>ACCURACY</div>
                            <div className="text-lg font-bold" style={{ 
                              color: typeof inst.accuracy === 'number' && inst.accuracy < 20 ? colors.rust : colors.sand 
                            }}>
                              {typeof inst.accuracy === 'number' ? `${inst.accuracy}%` : inst.accuracy}
                            </div>
                          </div>
                          <div className="px-3 py-1 text-xs font-bold" style={{ background: rowColor }}>
                            {inst.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {activeInstance === inst.id && (
                    <div className="p-4 grid grid-cols-2 gap-4 text-sm" style={{ 
                      background: colors.bgDark, 
                      borderTop: `1px solid ${colors.border}` 
                    }}>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>INPUT SUBMITTED</div>
                        <div style={{ color: colors.text }}>{inst.inputDetail}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>OUTPUT PARSED</div>
                        <div style={{ color: colors.rust }}>{inst.parsedDetail}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>FORCED CHANNEL</div>
                        <div style={{ color: colors.rust }}>{inst.forcedChannel}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>LEGAL BASIS</div>
                        <div style={{ color: colors.sage }}>{inst.legalBasis.join(' // ')}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>BARRIER</div>
                        <div style={{ color: colors.sand }}>{inst.barrier}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* INDUSTRIES */}
        {activeTab === 'industries' && (
          <div className="space-y-4">
            <div className="text-sm tracking-widest mb-4" style={{ color: colors.textDim }}>
              {industries.length} INDUSTRY SECTORS
            </div>
            
            {industries.map((ind, idx) => {
              const rowColor = [colors.rust, colors.sand, colors.sage, colors.purple, colors.sand, colors.rust][idx];
              return (
                <div 
                  key={ind.id}
                  className="cursor-pointer transition-all"
                  style={{ 
                    background: colors.bg, 
                    border: `2px solid ${activeIndustry === ind.id ? rowColor : colors.border}` 
                  }}
                  onClick={() => setActiveIndustry(activeIndustry === ind.id ? null : ind.id)}
                >
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-bold" style={{ color: rowColor }}>{ind.name}</div>
                      <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{ind.examples}</div>
                    </div>
                    <div className="px-3 py-1 text-xs font-bold" style={{ background: rowColor }}>
                      {ind.status}
                    </div>
                  </div>
                  
                  {activeIndustry === ind.id && (
                    <div className="p-4 space-y-3 text-sm" style={{ 
                      background: colors.bgDark, 
                      borderTop: `1px solid ${colors.border}` 
                    }}>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>REGULATIONS</div>
                        <div style={{ color: colors.sage }}>{ind.regulations}</div>
                      </div>
                      <div>
                        <div className="text-xs mb-1" style={{ color: colors.textDim }}>DATA</div>
                        <div style={{ color: colors.sand }}>{ind.data}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            <div className="text-sm tracking-widest mb-4" style={{ color: colors.textDim }}>
              REGULATORY TIMELINE // 1998-2026
            </div>
            
            {timeline.map((event, idx) => {
              const typeColors = {
                REG: colors.purple,
                CASE: colors.rust,
                TREND: colors.sage,
                DEADLINE: colors.sand,
                PRIOR: colors.purpleLight
              };
              const color = typeColors[event.type];
              
              return (
                <div key={idx} className="flex items-stretch" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                  <div className="w-20 p-3 text-center font-bold" style={{ background: color }}>
                    {event.year}
                  </div>
                  <div className="flex-1 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold" style={{ color: color }}>{event.event}</span>
                      <span className="mx-3" style={{ color: colors.textDim }}>—</span>
                      <span style={{ color: colors.textMuted }}>{event.desc}</span>
                    </div>
                    <div className="text-xs px-2 py-1" style={{ background: colors.bgDark, color: color }}>
                      {event.type}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LEGAL */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            {/* Framework */}
            <section style={{ background: colors.bg, border: `2px solid ${colors.purple}` }}>
              <div className="p-4" style={{ background: colors.purple }}>
                <h2 className="text-sm font-bold tracking-widest">LEGAL FRAMEWORK</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { law: 'ADA TITLE II', cite: '28 CFR § 35.160', scope: 'Government Services' },
                  { law: 'ADA TITLE III', cite: '42 U.S.C. § 12182', scope: 'Public Accommodations' },
                  { law: 'FDCPA', cite: '15 U.S.C. § 1692c(c)', scope: 'Debt Collection' },
                  { law: 'CIPA', cite: 'Cal. Penal §§ 631, 637.5', scope: 'Privacy/Wiretapping' },
                  { law: 'SECTION 508', cite: '29 U.S.C. § 794d', scope: 'Federal IT' },
                  { law: 'WCAG 2.1 AA', cite: 'W3C Standard', scope: 'Web Accessibility' }
                ].map(item => (
                  <div key={item.law} className="p-3" style={{ background: colors.bgDark, border: `1px solid ${colors.border}` }}>
                    <div className="font-bold" style={{ color: colors.sand }}>{item.law}</div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{item.cite}</div>
                    <div className="text-xs mt-1" style={{ color: colors.textDim }}>{item.scope}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Detection */}
            <section style={{ background: colors.bg, border: `2px solid ${colors.sage}` }}>
              <div className="p-4" style={{ background: colors.sage }}>
                <h2 className="text-sm font-bold tracking-widest">DETECTION FORMULA</h2>
              </div>
              <div className="p-4 space-y-2 font-mono text-sm">
                {[
                  { label: 'ACCURACY', formula: '(vars_referenced / vars_submitted) × 100', color: colors.sage },
                  { label: 'GATE_1', formula: 'accuracy < 50%', color: colors.sand },
                  { label: 'GATE_2', formula: 'channel_requested != channel_forced', color: colors.sand },
                  { label: 'STOPGATE', formula: 'GATE_1 && GATE_2 && secondary_required', color: colors.rust }
                ].map(item => (
                  <div key={item.label} className="flex items-center p-3" style={{ 
                    background: colors.bgDark, 
                    borderLeft: `4px solid ${item.color}` 
                  }}>
                    <span className="w-24 font-bold" style={{ color: item.color }}>{item.label}</span>
                    <span style={{ color: colors.textDim }}>=</span>
                    <span className="ml-3" style={{ color: colors.text }}>{item.formula}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Proposed */}
            <section style={{ background: colors.bg, border: `2px solid ${colors.rust}` }}>
              <div className="p-4" style={{ background: colors.rust }}>
                <h2 className="text-sm font-bold tracking-widest">PROPOSED: STOPGATE ACT</h2>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="p-2" style={{ borderLeft: `2px solid ${colors.rust}` }}>≥80% parsing accuracy required before auto-classification</div>
                <div className="p-2" style={{ borderLeft: `2px solid ${colors.rust}` }}>Mandatory human review for complex multi-variable submissions</div>
                <div className="p-2" style={{ borderLeft: `2px solid ${colors.rust}` }}>Prohibition on channel forcing after written preference expressed</div>
                <div className="p-2" style={{ borderLeft: `2px solid ${colors.rust}` }}>Private right of action for documented STOPGATE barriers</div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 mt-8" style={{ background: colors.bg, borderTop: `2px solid ${colors.border}` }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-sm tracking-widest" style={{ color: colors.textDim }}>
            STOPGATE LENS v2.0 // TRIPOD LLC // PRIOR ART 2026.03.13
          </div>
          <div className="text-xs mt-1" style={{ color: colors.textDim }}>
            DLW/ROOT0 // CC-BY-ND-4.0 // SHA256 ON RECORD
          </div>
        </div>
      </footer>
    </div>
  );
};

export default STOPGATE_LENS;
