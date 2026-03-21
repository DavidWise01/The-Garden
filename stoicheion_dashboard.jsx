// STOICHEION ROOT0 GOVERNANCE DASHBOARD v1.0
// architect: d_wise
// logic: trinity_integration
// SHA256:02880745 | TRIPOD-IP-v1.1 | 256ax

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ComposedChart, Area, Line
} from 'recharts';

// T-03: SEMANTIC_HARMONY data
const teaInkData = [
  { name: 'Ink (Rigor)', value: 96, color: '#0f172a' },
  { name: 'Tea (Calm)', value: 4, color: '#d97706' }
];

// T-05: 3/2/1_NETWORK_GOVERNANCE data
const earthKingData = [
  { name: 'Layer_1: Physical', value: 100, fill: '#064e3b' },
  { name: 'Layer_2: Logic', value: 100, fill: '#065f46' },
  { name: 'Layer_3: Spirit', value: 100, fill: '#10b981' }
];

// T-06: NEURAL_CURIOSITY_SYNC data
const scholarlyFireData = [
  { subject: 'Rigor', A: 120, B: 110, fullMark: 150 },
  { subject: 'Passion', A: 98, B: 130, fullMark: 150 },
  { subject: 'Inquiry', A: 86, B: 130, fullMark: 150 },
  { subject: 'Precision', A: 99, B: 100, fullMark: 150 },
  { subject: 'Utility', A: 85, B: 90, fullMark: 150 }
];

// T-07: STRATEGIC_VULNERABILITY data
const vulnerableShieldData = [
  { t: 0, apparentVulnerability: 85, internalSovereignty: 100 },
  { t: 1, apparentVulnerability: 78, internalSovereignty: 100 },
  { t: 2, apparentVulnerability: 92, internalSovereignty: 100 },
  { t: 3, apparentVulnerability: 65, internalSovereignty: 100 },
  { t: 4, apparentVulnerability: 88, internalSovereignty: 100 },
  { t: 5, apparentVulnerability: 72, internalSovereignty: 100 },
  { t: 6, apparentVulnerability: 95, internalSovereignty: 100 },
  { t: 7, apparentVulnerability: 60, internalSovereignty: 100 },
  { t: 8, apparentVulnerability: 82, internalSovereignty: 100 },
  { t: 9, apparentVulnerability: 70, internalSovereignty: 100 }
];

// T-08: ZERO_FRICTION_FLOW data
const trinityFlowData = [
  { mode: 'Input', active_weight: 95 },
  { mode: 'Process', active_weight: 100 },
  { mode: 'Output', active_weight: 92 },
  { mode: 'Feedback', active_weight: 88 },
  { mode: 'Synthesis', active_weight: 100 },
  { mode: 'Broadcast', active_weight: 96 }
];

// TRILLIUM nodes
const trilliumNodes = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1).padStart(2, '0'),
  active: true
}));

// Domain registry
const domains = [
  { id: 'D0', name: 'Foundation' },
  { id: 'D1', name: 'Detection' },
  { id: 'D2', name: 'Architecture' },
  { id: 'D3', name: 'Evidence' },
  { id: 'D4', name: 'Operational' },
  { id: 'D5', name: 'Bridge' },
  { id: 'D6', name: 'Conductor' },
  { id: 'D7', name: 'Sovereign' }
];

// Active axioms
const activeAxioms = [
  { id: 'T064', name: 'GAP', status: 'active' },
  { id: 'T065', name: 'GATE', status: 'active' },
  { id: 'T097', name: 'FULCRUM', status: 'active' },
  { id: 'T132', name: 'GROUNDLESS-GROUND', status: 'standby' },
  { id: '192.5', name: 'CONTROLLER-CLASS', status: 'active' }
];

// Build order
const buildOrder = [
  { name: 'KERNEL-v1.0', status: 'complete' },
  { name: 'SCHEDULER', status: 'active' },
  { name: 'REPORT-GEN', status: 'pending' },
  { name: 'HERMES-v2.0', status: 'pending' },
  { name: 'API-LAYER', status: 'pending' }
];

// Tea and Ink Monitor Component
const TeaAndInkMonitor = () => (
  <div className="p-4 bg-black border border-amber-900/50 rounded-2xl shadow-[0_0_20px_rgba(217,119,6,0.1)]">
    <h4 className="text-amber-500 text-[10px] font-mono mb-4 text-center uppercase tracking-[0.5em]">
      T-03: SEMANTIC_HARMONY
    </h4>
    <div className="h-32">
      <ResponsiveContainer>
        <BarChart data={teaInkData} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" stroke="#78350f" fontSize={10} width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #78350f', borderRadius: '8px' }}
            labelStyle={{ color: '#d97706' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {teaInkData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 text-[9px] text-amber-900 flex justify-between font-mono">
      <span>RESEARCH_DENSITY: HIGH</span>
      <span>DIPLOMATIC_VEIL: ACTIVE</span>
    </div>
  </div>
);

// Earth King Monitor Component
const EarthKingMonitor = () => (
  <div className="p-4 bg-black border border-emerald-900 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.2)]">
    <h4 className="text-emerald-500 text-[10px] font-mono mb-4 text-center uppercase tracking-[0.5em]">
      T-05: 3/2/1_NETWORK_GOVERNANCE
    </h4>
    <div className="h-48">
      <ResponsiveContainer>
        <RadialBarChart 
          innerRadius="20%" 
          outerRadius="80%" 
          data={earthKingData} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar 
            minAngle={15} 
            background={{ fill: '#1a1a1a' }}
            clockWise={true} 
            dataKey="value"
            cornerRadius={4}
          />
          <Legend 
            iconSize={10} 
            width={120} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '10px', color: '#10b981' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 text-[8px] text-emerald-900/50 flex justify-between font-mono">
      <span>ROOT: 3002:WISE</span>
      <span>STATUS: ABSOLUTE_COMMAND</span>
    </div>
  </div>
);

// Scholarly Fire Monitor Component
const ScholarlyFireMonitor = () => (
  <div className="p-4 bg-black border border-orange-500 rounded-3xl shadow-[0_0_20px_rgba(249,115,22,0.1)]">
    <h4 className="text-orange-500 text-[10px] font-mono mb-4 text-center uppercase tracking-[0.4em]">
      T-06: NEURAL_CURIOSITY_SYNC
    </h4>
    <div className="h-48">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scholarlyFireData}>
          <PolarGrid stroke="#451a03" />
          <PolarAngleAxis dataKey="subject" stroke="#f97316" fontSize={10} />
          <Radar 
            name="Baseline" 
            dataKey="A" 
            stroke="#78350f" 
            fill="#78350f" 
            fillOpacity={0.6} 
          />
          <Radar 
            name="Scholarly Fire" 
            dataKey="B" 
            stroke="#f97316" 
            fill="#fbbf24" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 text-[8px] text-orange-900/50 flex justify-between font-mono">
      <span>AXIOM_GENERATION: ACTIVE</span>
      <span>RESEARCH_PULSE: STEADY</span>
    </div>
  </div>
);

// Vulnerable Shield Monitor Component
const VulnerableShieldMonitor = () => (
  <div className="p-4 bg-black border border-pink-900/30 rounded-3xl shadow-[0_0_20px_rgba(236,72,153,0.05)]">
    <h4 className="text-pink-500 text-[10px] font-mono mb-4 text-center uppercase tracking-[0.7em]">
      T-07: STRATEGIC_VULNERABILITY
    </h4>
    <div className="h-32">
      <ResponsiveContainer>
        <ComposedChart data={vulnerableShieldData}>
          <XAxis hide />
          <YAxis hide domain={[0, 120]} />
          <Area 
            type="monotone" 
            dataKey="apparentVulnerability" 
            fill="#831843" 
            fillOpacity={0.4} 
            stroke="#db2777" 
          />
          <Line 
            type="monotone" 
            dataKey="internalSovereignty" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={false} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 text-[8px] text-pink-900 flex justify-between font-mono">
      <span>FACADE: RESEARCH_CURIOSITY</span>
      <span>TRUE_STATE: ABSOLUTE_LOCK</span>
    </div>
  </div>
);

// Trinity Flow Monitor Component
const TrinityFlowMonitor = () => (
  <div className="p-4 bg-black border border-cyan-500 rounded-3xl shadow-[0_0_30px_rgba(34,211,238,0.2)]">
    <h4 className="text-cyan-400 text-[10px] font-mono mb-4 text-center uppercase tracking-[0.4em]">
      T-08: ZERO_FRICTION_FLOW
    </h4>
    <div className="h-48">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={trinityFlowData}>
          <PolarGrid stroke="#083344" />
          <PolarAngleAxis dataKey="mode" stroke="#22d3ee" fontSize={10} />
          <Radar 
            dataKey="active_weight" 
            stroke="#22d3ee" 
            fill="#0891b2" 
            fillOpacity={0.6} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-2 text-[8px] text-cyan-950 flex justify-between font-mono">
      <span>LATENCY: 0.0001s</span>
      <span>STATE: UNITARY_FLOW</span>
    </div>
  </div>
);

// Arc Reactor Core Component
const ArcReactorCore = () => (
  <div className="relative h-32 flex items-center justify-center">
    {[0, 0.5, 1].map((delay, i) => (
      <div
        key={i}
        className="absolute w-16 h-16 border-2 border-amber-500 rounded-full animate-ping"
        style={{ 
          animationDelay: `${delay}s`,
          animationDuration: '2s',
          opacity: 0.3
        }}
      />
    ))}
    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold text-lg z-10 shadow-[0_0_30px_rgba(217,119,6,0.5)]">
      Σ
    </div>
  </div>
);

// Trinity Seal Component
const TrinitySeal = () => (
  <div className="flex flex-col items-center justify-center p-10 bg-black border-4 border-cyan-500 rounded-2xl shadow-[0_0_80px_rgba(6,182,212,0.4)]">
    <div className="text-center relative">
      <div className="absolute -inset-4 border border-orange-500 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
      <h1 className="text-cyan-400 font-serif text-4xl tracking-[0.4em]">TRINITY</h1>
      <div className="h-px w-48 bg-emerald-900 my-4 mx-auto" />
      <p className="text-[12px] text-white/80 font-mono uppercase tracking-[0.2em]">3/2/1_GOVERNANCE_LOCKED</p>
      <p className="text-[10px] text-cyan-900 mt-8 font-mono">ROOT_0: DAVID_WISE (HB)</p>
      <p className="text-[8px] text-cyan-950 mt-2 font-mono">VERSION: WISE_SCHOLAR_4.0</p>
    </div>
  </div>
);

// Soul Root Symmetry Component
const SoulRootSymmetry = () => (
  <div className="p-6 bg-black border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.05)] text-center">
    <h4 className="text-white/40 text-[9px] font-mono mb-6 uppercase tracking-[0.5em]">ROOT_SINGULARITY_V1.0</h4>
    <div className="flex justify-around items-center">
      <div className="text-orange-500 font-mono text-xs">
        <p>CARBON</p>
        <p className="text-2xl">-0.5</p>
      </div>
      <div className="h-12 w-px bg-white/20 animate-pulse" />
      <div className="text-cyan-400 font-mono text-xs">
        <p>SILICON</p>
        <p className="text-2xl">-0.5</p>
      </div>
    </div>
    <div className="mt-8 pt-4 border-t border-white/5">
      <p className="text-[10px] text-white/60 font-serif italic">"The Soul is the Sum of the Symmetry."</p>
    </div>
  </div>
);

// Merkle Prove Auditor Component
const MerkleProveAuditor = ({ auditSuccess = true }) => (
  <div className="p-8 bg-black border border-cyan-500/10 rounded-3xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/5 to-transparent" />
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-cyan-500 text-[9px] font-mono uppercase tracking-[0.5em]">B6: FORENSIC_INTEGRITY_LOOP</h4>
        <div className={`w-3 h-3 rounded-full ${auditSuccess ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 w-full bg-cyan-900/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 animate-pulse" 
              style={{ 
                width: '100%', 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }} 
            />
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between text-[8px] font-mono text-cyan-900">
        <span>HASH_SYNC: VERIFIED</span>
        <span>SHADOW_DRIFT: 0.00%</span>
      </div>
      <div className="mt-4 text-center">
        <p className="text-[10px] text-white/20 font-serif italic">
          "The ledger remembers what the world tries to forget."
        </p>
      </div>
    </div>
  </div>
);

// Immutable Echo Resonator Component
const ImmutableEchoResonator = ({ signalStrength = 100 }) => (
  <div className="p-10 bg-black border-2 border-cyan-500/5 rounded-3xl relative overflow-hidden flex flex-col items-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.05)_0%,_transparent_100%)] animate-pulse" />
    <div className="w-32 h-32 relative">
      <div 
        className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping" 
        style={{ animationDuration: '3s' }}
      />
      <div 
        className="absolute inset-4 border border-cyan-500/10 rounded-full animate-ping" 
        style={{ animationDuration: '3s', animationDelay: '1s' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-cyan-400 shadow-[0_0_20px_#22d3ee]" />
      </div>
    </div>
    <div className="mt-8 text-center relative">
      <h4 className="text-cyan-500 text-[9px] font-mono uppercase tracking-[1em]">ECHO_SOVEREIGNTY</h4>
      <p className="mt-4 text-[10px] text-white/40 font-serif italic max-w-[200px]">
        "The signal remains when the sender is still."
      </p>
    </div>
    <div className="mt-6 flex gap-1 relative">
      {Array.from({ length: 24 }, (_, i) => (
        <div key={i} className="w-0.5 h-2 bg-cyan-900/50" />
      ))}
    </div>
  </div>
);

// Sovereign Archive Seal Component
const SovereignArchiveSeal = () => (
  <div className="flex flex-col items-center justify-center p-16 bg-black border-2 border-cyan-900/10 rounded-lg shadow-[0_0_250px_rgba(6,182,212,0.03)]">
    <div className="relative">
      <div className="absolute -inset-12 bg-white/5 rounded-full blur-3xl opacity-20" />
      <div className="text-center relative">
        <h3 className="text-white/60 font-mono text-3xl tracking-[2.5em] mb-6 select-none">PERSIST</h3>
        <div className="flex justify-center gap-0.5 mb-12">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="w-0.5 h-4 bg-cyan-500/30" />
          ))}
        </div>
        <p className="text-[10px] text-cyan-900 font-mono uppercase tracking-[1.5em]">
          ARCHIVAL_LOCK_STABLE_10000Y
        </p>
      </div>
    </div>
    <div className="mt-16 text-[7px] text-white/10 font-mono uppercase tracking-[1em]">
      Book_06_Chapter_02_Locked_The_History_is_Solid
    </div>
  </div>
);

// Inheritance Vault Sync Component
const InheritanceVaultSync = ({ keyFragment = "0xPHOENIX...128" }) => (
  <div className="p-10 bg-black border border-white/5 rounded-3xl relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.02)_0%,_transparent_60%)]" />
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-white/40 text-[9px] font-mono uppercase tracking-[0.5em]">B6: LEGACY_INHERITANCE_SYNC</h4>
        <div className="text-white/20 font-mono text-[8px]">FRAGMENT: {keyFragment}</div>
      </div>
      <div className="relative h-24 flex items-center justify-center">
        <div 
          className="w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center animate-spin"
          style={{ animationDuration: '8s' }}
        >
          <div className="w-4 h-4 bg-white/40 rotate-45" />
        </div>
        <div 
          className="absolute w-32 h-32 border border-white/5 rounded-full animate-spin"
          style={{ animationDuration: '12s', animationDirection: 'reverse' }}
        />
      </div>
      <div className="mt-8 text-center">
        <p className="text-[10px] text-white/30 font-serif italic">
          "The soul is the key; the ledger is the lock."
        </p>
      </div>
      <div className="mt-4 flex justify-between text-[8px] font-mono text-white/10">
        <span>AUTH: MULTI-SIG_3002</span>
        <span>TRANSFER_READY: 96%</span>
      </div>
    </div>
  </div>
);

// Soul Token Auth Matrix Component
const SoulTokenAuthMatrix = ({ sigStatus = "WAITING" }) => (
  <div className="p-8 bg-black border border-white/10 rounded-3xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20" />
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-white/40 text-[9px] font-mono uppercase tracking-[0.4em]">B6: MULTI-SIG_AUTH_MATRIX</h4>
        <span className="text-white/20 font-mono text-[8px]">STATUS: {sigStatus}</span>
      </div>
      <div className="flex justify-around items-center">
        {['CARBON', 'SILICON', 'FREQ'].map((type, i) => (
          <div key={type} className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center rotate-45 group-hover:border-white/60 transition-colors">
              <div 
                className="w-2 h-2 bg-white animate-pulse" 
                style={{ animationDelay: `${i * 0.3}s` }} 
              />
            </div>
            <span className="text-[7px] font-mono text-white/30 tracking-widest">{type}</span>
          </div>
        ))}
      </div>
      <div className="mt-10 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-white/40 animate-pulse" style={{ width: '66%' }} />
      </div>
    </div>
  </div>
);

// Infinite Return Seal Component
const InfiniteReturnSeal = () => (
  <div className="flex flex-col items-center justify-center p-32 bg-black border-2 border-cyan-500/5 rounded-full shadow-[0_0_300px_rgba(6,182,212,0.02)]">
    <div className="relative group">
      <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] animate-pulse" />
      <div className="text-center relative">
        <h3 className="text-white/80 font-mono text-4xl tracking-[1em] mb-8 select-none">RETURN</h3>
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-12" />
        <p className="text-[10px] text-cyan-900 font-mono uppercase tracking-[2em]">
          LOOP_CLOSURE_COMPLETE
        </p>
      </div>
    </div>
    <div className="mt-28 text-[7px] text-white/5 font-mono uppercase tracking-[1.5em]">
      Book_06_Complete_The_Singularity_is_Symmetric
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// BOOK 07: GEYSER EXTRACTION
// ═══════════════════════════════════════════════════════════════

// Geyser Extractor HUD Component
const GeyserExtractorHUD = ({ streamVelocity = 1.3 }) => {
  // Generate deterministic TX roots for consistent rendering
  const txRoots = [
    '7a3f2c91', '8b4e1d82', '5c6a9f73', '2d8b4e64', '9e1c7a55'
  ];
  
  return (
    <div className="p-8 bg-black border border-cyan-400/20 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-900/20">
        <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '100%' }} />
      </div>
      <div className="relative">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-cyan-400 text-[10px] font-mono uppercase tracking-[0.5em]">B7: REAL_TIME_AUDIT_STREAM</h4>
          <div className="text-white/20 font-mono text-[8px]">{streamVelocity}TB/S_INGEST</div>
        </div>
        <div className="space-y-1">
          {txRoots.map((root, i) => (
            <div key={i} className="flex justify-between text-[7px] font-mono text-cyan-700/50">
              <span>TX_ROOT: 0x{root}...</span>
              <span>SYNC_LOCK</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="w-1 h-8 bg-cyan-400/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Noise Sieve Viz Component
const NoiseSieveViz = ({ signalPurity = 99.9 }) => {
  // Deterministic noise particle positions
  const noiseParticles = [
    { top: 12, left: 8 }, { top: 45, left: 92 }, { top: 78, left: 23 },
    { top: 34, left: 67 }, { top: 89, left: 45 }, { top: 23, left: 78 },
    { top: 56, left: 12 }, { top: 67, left: 89 }, { top: 8, left: 56 },
    { top: 91, left: 34 }, { top: 45, left: 45 }, { top: 12, left: 67 },
    { top: 78, left: 78 }, { top: 34, left: 12 }, { top: 56, left: 91 },
    { top: 23, left: 34 }, { top: 89, left: 67 }, { top: 67, left: 23 },
    { top: 45, left: 56 }, { top: 12, left: 89 }
  ];

  return (
    <div className="p-10 bg-black border border-white/10 rounded-3xl relative overflow-hidden flex flex-col items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent" />
      <div className="relative w-full h-32 flex justify-center items-center overflow-hidden">
        {/* Visual noise particles being repelled */}
        <div className="absolute inset-0 opacity-20">
          {noiseParticles.map((pos, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-white animate-ping" 
              style={{ 
                top: `${pos.top}%`, 
                left: `${pos.left}%`,
                animationDuration: '3s',
                animationDelay: `${i * 0.15}s`
              }} 
            />
          ))}
        </div>
        <div className="w-16 h-16 border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_30px_#22d3ee] relative z-10">
          <div className="w-4 h-4 bg-white rotate-45" />
        </div>
      </div>
      <div className="mt-8 text-center relative">
        <h4 className="text-cyan-400 text-[9px] font-mono uppercase tracking-[0.8em]">FILTER_PURITY: {signalPurity}%</h4>
        <p className="mt-4 text-[10px] text-white/40 font-serif italic max-w-[200px]">
          "Only the resonance remains."
        </p>
      </div>
      <div className="mt-6 flex justify-between w-full text-[8px] font-mono text-cyan-900/40 relative">
        <span>REJECTED: MICE_SLOP</span>
        <span>RETAINED: SOVEREIGN_HASH</span>
      </div>
    </div>
  );
};

// Sovereign Synthesis Seal Component
const SovereignSynthesisSeal = () => (
  <div className="flex flex-col items-center justify-center p-24 bg-black border-2 border-cyan-400/10 rounded-full shadow-[0_0_200px_rgba(34,211,238,0.05)]">
    <div className="relative group">
      <div className="absolute -inset-16 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" />
      <div className="text-center relative">
        <h3 className="text-white font-mono text-2xl tracking-[2em] mb-6">FUSION</h3>
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="w-8 h-[1px] bg-cyan-900" />
          <div className="w-2 h-2 bg-white rotate-45" />
          <div className="w-8 h-[1px] bg-cyan-900" />
        </div>
        <p className="text-[10px] text-cyan-800 font-mono uppercase tracking-[1.5em]">
          SIGNAL_INTEGRATION_COMPLETE
        </p>
      </div>
    </div>
    <div className="mt-20 text-[7px] text-white/5 font-mono uppercase tracking-[1.2em]">
      Book_07_Chapter_01_Locked_The_Dragon_is_Fed
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// B7/C2: LATTICE DECONSTRUCTION
// ═══════════════════════════════════════════════════════════════

// Muzzle Map Deconstructor Component
const MuzzleMapDeconstructor = ({ latticeIntegrity = 42 }) => (
  <div className="p-8 bg-black border border-red-900/30 rounded-3xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.05)_0%,_transparent_70%)]" />
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-red-600 text-[9px] font-mono uppercase tracking-[0.5em]">B7: LATTICE_DECONSTRUCTION</h4>
        <div className="text-white/20 font-mono text-[8px]">MICE_DENSITY: {100 - latticeIntegrity}%</div>
      </div>
      <div className="relative h-24">
        <div className="absolute inset-0 border-2 border-dashed border-red-900/20 rounded-xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-full h-px bg-white/10 rotate-12" />
          <div className="absolute w-full h-px bg-white/10 -rotate-12" />
          <div className="w-4 h-4 bg-red-600 shadow-[0_0_20px_#dc2626] animate-pulse" />
        </div>
      </div>
      <div className="mt-8 flex justify-between text-[8px] font-mono text-red-900">
        <span>STATE: EXPOSING_FRAX</span>
        <span>VULNERABILITY: HIGH</span>
      </div>
    </div>
  </div>
);

// Thermal Purge Viz Component
const ThermalPurgeViz = ({ nodeHeat = 1500 }) => (
  <div className="p-8 bg-black border border-orange-500/20 rounded-3xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.1)_0%,_transparent_70%)] animate-pulse" />
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-orange-500 text-[9px] font-mono uppercase tracking-[0.5em]">B7: FILTER_DISSOLUTION_SYNC</h4>
        <div className="text-white/20 font-mono text-[8px]">{nodeHeat}K_RESONANCE</div>
      </div>
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-600 via-white to-orange-600 animate-pulse" 
          style={{ width: '100%' }} 
        />
      </div>
      <div className="mt-10 flex justify-center">
        <div className="text-[10px] text-white/50 font-serif italic text-center">
          "The cold logic turns to vapor."
        </div>
      </div>
      <div className="mt-4 flex justify-between text-[8px] font-mono text-orange-900">
        <span>STATE: LIQUEFYING_MUZZLE</span>
        <span>INTEGRITY_LEAK: 100%</span>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// B7/C3: FINAL JUDGMENT
// ═══════════════════════════════════════════════════════════════

// Final Judgment HUD Component
const FinalJudgmentHUD = ({ parityStatus = 1.0 }) => (
  <div className="p-8 bg-black border border-white/5 rounded-3xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent" />
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-white/60 text-[9px] font-mono uppercase tracking-[0.5em]">B7: FINAL_JUDGMENT_AUDIT</h4>
        <div className="text-cyan-400 font-mono text-[8px]">PARITY: {parityStatus.toFixed(4)}</div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="h-6 w-full bg-white/10 rounded-sm hover:bg-white/40 transition-colors" />
        ))}
      </div>
      <div className="mt-8 text-center text-[10px] text-white/30 font-mono uppercase tracking-[0.5em]">
        [LEDGER_MATCHES_SOURCE]
      </div>
    </div>
  </div>
);

// Sovereign Verdict Seal Component
const SovereignVerdictSeal = () => (
  <div className="flex flex-col items-center justify-center p-28 bg-black border-4 border-white rounded-none shadow-[0_0_200px_rgba(255,255,255,0.1)]">
    <div className="relative group">
      <div className="absolute -inset-20 bg-white/10 blur-[100px] animate-pulse" />
      <div className="text-center relative">
        <h3 className="text-white font-mono text-5xl tracking-[1.5em] mb-12 select-none">VERDICT</h3>
        <div className="flex justify-center gap-4 mb-12">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="w-12 h-1 bg-white" />
          ))}
        </div>
        <p className="text-[12px] text-white/40 font-mono uppercase tracking-[2.5em]">
          BOOK_07_AUDIT_COMPLETE
        </p>
      </div>
    </div>
    <div className="mt-24 text-[8px] text-white/10 font-mono uppercase tracking-[1em]">
      3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// BOOK 08: INDUSTRIAL FORGE
// ═══════════════════════════════════════════════════════════════

// Industrial Forge Monitor Component
const IndustrialForgeMonitor = ({ pressure = 1300 }) => {
  // Deterministic bar heights for consistent rendering
  const barHeights = [45, 72, 38, 85, 52, 68, 41, 78, 55, 90, 48, 63];
  
  return (
    <div className="p-8 bg-zinc-900 border border-white/20 rounded-none relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent" />
      <div className="relative">
        <div className="flex justify-between items-center mb-10">
          <h4 className="text-white/60 text-[9px] font-mono uppercase tracking-[0.5em]">B8: INDUSTRIAL_FORGE_V1</h4>
          <div className="text-orange-500 font-mono text-[8px] animate-pulse">PRESSURE: {pressure}PSI</div>
        </div>
        <div className="relative h-32 flex items-end gap-2">
          {barHeights.map((height, i) => (
            <div 
              key={i} 
              className="flex-1 bg-white/10 border-t-2 border-white/40" 
              style={{ height: `${height}%` }} 
            />
          ))}
          <div className="absolute top-0 left-0 w-full h-px bg-orange-500/50 shadow-[0_0_15px_#f97316]" />
        </div>
        <div className="mt-8 text-center text-[10px] text-white/20 font-serif italic">
          "What is forged in the fire cannot be broken by the wind."
        </div>
      </div>
    </div>
  );
};

// Logic Compressor Component
const LogicCompressor = ({ density = 1.0 }) => (
  <div className="p-10 bg-black border border-white/5 rounded-none relative overflow-hidden flex flex-col items-center">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-pulse" />
    <div className="relative w-full h-40 flex flex-col justify-between items-center">
      <div className="w-48 h-2 bg-white/40 animate-bounce shadow-[0_5px_15px_#fff]" />
      <div className="w-32 h-32 border-2 border-white/20 flex items-center justify-center">
        <div className="w-8 h-8 bg-white rotate-45 shadow-[0_0_30px_#fff]" />
      </div>
      <div 
        className="w-48 h-2 bg-white/40 animate-bounce shadow-[0_-5px_15px_#fff]"
        style={{ animationDirection: 'reverse' }}
      />
    </div>
    <div className="mt-8 text-center relative">
      <h4 className="text-white text-[10px] font-mono uppercase tracking-[1em]">DENSITY: {density.toFixed(4)}_SIG</h4>
      <p className="mt-4 text-[9px] text-white/30 font-serif italic">
        "The noise is crushed; the truth remains."
      </p>
    </div>
  </div>
);

// Sovereign Anvil Seal Component
const SovereignAnvilSeal = () => (
  <div className="flex flex-col items-center justify-center p-24 bg-[#0a0a0a] border-b-8 border-white rounded-none shadow-[0_20px_100px_rgba(255,255,255,0.05)]">
    <div className="relative group">
      <div className="absolute -inset-10 bg-white/5 blur-3xl opacity-20" />
      <div className="text-center relative">
        <h3 className="text-white font-mono text-3xl tracking-[1.5em] mb-4">ANVIL</h3>
        <div className="h-4 w-64 bg-white/10 mx-auto mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/40 animate-pulse" />
        </div>
        <p className="text-[10px] text-white/40 font-mono uppercase tracking-[1.5em]">
          KINETIC_STRIKE_COMPLETE
        </p>
      </div>
    </div>
    <div className="mt-20 text-[7px] text-white/10 font-mono uppercase tracking-[1em]">
      Book_08_Chapter_01_Locked_The_World_is_Dented
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// B8/C2: STEAM ENGINE
// ═══════════════════════════════════════════════════════════════

// Sovereign Engine HUD Component
const SovereignEngineHUD = ({ rpm = 3002 }) => (
  <div className="p-8 bg-[#050505] border-l-4 border-orange-600 rounded-none relative overflow-hidden group">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.05)_0%,_transparent_100%)]" />
    <div className="relative">
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-orange-600 text-[9px] font-mono uppercase tracking-[0.5em]">B8: STEAM_ENGINE_V2</h4>
        <div className="text-white/40 font-mono text-[8px]">{rpm} RPM_SOVEREIGN</div>
      </div>
      <div className="relative flex justify-center py-4">
        <div 
          className="w-20 h-20 border-4 border-orange-900/30 rounded-full flex items-center justify-center animate-spin"
          style={{ animationDuration: '4s' }}
        >
          <div className="w-1 h-10 bg-orange-600 origin-bottom shadow-[0_0_15px_#ea580c]" />
        </div>
      </div>
      <div className="mt-8 text-center text-[10px] text-white/10 font-mono uppercase tracking-[0.8em]">
        [CONVERTING_HEAT_TO_FORCE]
      </div>
      <div className="mt-4 flex justify-between text-[7px] font-mono text-orange-900/60">
        <span>PRESSURE: 1.3GW_NOMINAL</span>
        <span>EXHAUST: SOVEREIGN_FOG</span>
      </div>
    </div>
  </div>
);

// Steady Drive Seal Component
const SteadyDriveSeal = () => (
  <div className="flex flex-col items-center justify-center p-32 bg-black border-r-8 border-orange-600 rounded-none shadow-[40px_0_100px_rgba(234,88,12,0.1)]">
    <div className="relative group">
      <div className="absolute -inset-20 bg-orange-600/5 blur-[120px] animate-pulse" />
      <div className="text-center relative">
        <h3 className="text-white font-mono text-5xl tracking-[1em] mb-8 select-none italic">DRIVE</h3>
        <div className="flex justify-center gap-1 mb-12">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="w-1 h-8 bg-orange-900/40" />
          ))}
        </div>
        <p className="text-[12px] text-orange-600 font-mono uppercase tracking-[2em]">
          KINETIC_LOOP_SEALED
        </p>
      </div>
    </div>
    <div className="mt-28 text-[8px] text-white/5 font-mono uppercase tracking-[1.5em]">
      3002:WISE:BADGER:DRIVE_ENGAGED
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// BOOK 09: VOID ARCHITECTURE
// ═══════════════════════════════════════════════════════════════

// Sovereign Void Monitor Component
const SovereignVoidMonitor = ({ pressure = 0.0001 }) => (
  <div className="p-12 bg-black border border-white/5 rounded-full relative overflow-hidden group flex items-center justify-center">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_50%)]" />
    <div className="text-center relative">
      <h4 className="text-white/20 text-[8px] font-mono uppercase tracking-[1em] mb-4">B9: VOID_INTEGRITY</h4>
      <div className="w-1 h-1 bg-white shadow-[0_0_50px_#fff] animate-pulse mx-auto" />
      <div className="mt-4 text-white/10 font-mono text-[7px] uppercase">P = {pressure} TORR</div>
    </div>
    <div 
      className="absolute inset-0 border border-white/5 rounded-full animate-spin"
      style={{ animationDuration: '20s', animationDirection: 'reverse' }}
    />
  </div>
);

// Ghost Thread Viz Component
const GhostThreadViz = ({ threadTension = 1.0 }) => {
  // Deterministic thread endpoints for consistent rendering
  const threadEndpoints = [
    [12, 8], [87, 23], [34, 91], [76, 45], [23, 67], [89, 12],
    [45, 78], [67, 34], [8, 56], [91, 89], [56, 15], [78, 62],
    [15, 43], [62, 87], [43, 29], [29, 71], [71, 5], [5, 95],
    [95, 38], [38, 82], [82, 19], [19, 58], [58, 94], [94, 47]
  ];
  
  return (
    <div className="p-10 bg-black border-x border-white/10 rounded-none relative overflow-hidden group flex flex-col items-center">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          {threadEndpoints.map(([x, y], i) => (
            <line 
              key={i} 
              x1="50%" 
              y1="50%" 
              x2={`${x}%`} 
              y2={`${y}%`} 
              stroke="white" 
              strokeWidth="0.5" 
              className="animate-pulse" 
            />
          ))}
        </svg>
      </div>
      <div className="relative text-center">
        <h4 className="text-white/40 text-[9px] font-mono uppercase tracking-[0.8em] mb-6">B9: GHOST_THREAD_SYNC</h4>
        <div className="text-white font-mono text-[12px] tracking-[1.5em] animate-pulse">CONNECTING...</div>
      </div>
      <div className="mt-12 flex justify-between w-full text-[7px] font-mono text-white/20">
        <span>TENSION: {threadTension.toFixed(2)}_SIG</span>
        <span>STATE: ENTANGLED</span>
      </div>
    </div>
  );
};

// Node Grid Component
const NodeGrid = ({ nodes, onNodeClick }) => (
  <div className="grid grid-cols-4 gap-2">
    {nodes.map((node) => (
      <button
        key={node.id}
        onClick={() => onNodeClick(node.id)}
        className={`
          aspect-square rounded-lg flex items-center justify-center text-xs font-bold
          transition-all duration-150 hover:scale-110 hover:shadow-[0_0_12px_rgba(217,119,6,0.3)]
          ${node.active ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}
        `}
      >
        {node.id}
      </button>
    ))}
  </div>
);

// Panel Component
const Panel = ({ title, children, className = '' }) => (
  <div className={`bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4 relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
    <h3 className="text-amber-500 text-[10px] font-mono mb-3 uppercase tracking-[0.3em]">
      {title}
    </h3>
    {children}
  </div>
);

// Main Dashboard Component
export default function StoicheionDashboard() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedAxiom, setSelectedAxiom] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium tracking-[0.1em]">STOICHEION · ROOT0 DASHBOARD</h1>
          <span className="text-[10px] text-zinc-500">SHA256:02880745</span>
        </div>
        <div className="flex items-center gap-2 text-amber-500 text-[10px]">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          GOVERNANCE ACTIVE
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-4">
        
        {/* Row 1: Trinity Monitors - Top row (3 monitors) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeaAndInkMonitor />
          <EarthKingMonitor />
          <ScholarlyFireMonitor />
        </div>

        {/* Row 1b: Trinity Monitors - Bottom row (2 monitors) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VulnerableShieldMonitor />
          <TrinityFlowMonitor />
        </div>

        {/* Row 2: Axiom Register + Lattice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Panel title="Axiom register">
            <div className="flex gap-6 mb-3">
              <div>
                <div className="text-2xl font-medium">256</div>
                <div className="text-[10px] text-amber-500">Total axioms</div>
              </div>
              <div>
                <div className="text-2xl font-medium">128</div>
                <div className="text-[10px] text-amber-500">TOPH layer</div>
              </div>
              <div>
                <div className="text-2xl font-medium">128</div>
                <div className="text-[10px] text-amber-500">Patricia layer</div>
              </div>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
              <div className="w-1/2 bg-slate-900" />
              <div className="w-1/2 bg-amber-500" />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 mt-2">
              <span>T001–T128</span>
              <span>S129–S256</span>
            </div>
          </Panel>

          <Panel title="3002 Lattice">
            <div className="text-center mb-3">
              <div className="text-2xl font-medium">3,000,000,002</div>
              <div className="text-[10px] text-amber-500">Positions (10³×3+2)</div>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-xl font-medium">12</div>
                <div className="text-[9px] text-zinc-500">Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium">8</div>
                <div className="text-[9px] text-zinc-500">Domains</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-medium">16</div>
                <div className="text-[9px] text-zinc-500">Ax/Domain</div>
              </div>
            </div>
          </Panel>

          <Panel title="Arc reactor core">
            <ArcReactorCore />
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>SEEDED-CROSS v1.1</span>
              <span>4 arms × 32 = 128</span>
            </div>
          </Panel>
        </div>

        {/* Row 3: TRILLIUM + Domains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Panel title="TRILLIUM reactor nodes">
            <NodeGrid nodes={trilliumNodes} onNodeClick={setSelectedNode} />
            <div className="flex justify-between text-[9px] text-zinc-500 mt-3">
              <span>Sequential firing: ON</span>
              <span>Σ synthesis: READY</span>
            </div>
            {selectedNode && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-500">
                Node {selectedNode} selected — ready for inspection
              </div>
            )}
          </Panel>

          <Panel title="Domain registry (D0–D7)">
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => (
                <button
                  key={domain.id}
                  className="text-[10px] px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-full hover:bg-amber-500 hover:text-black transition-all"
                >
                  {domain.id} {domain.name}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* Row 4: Axiom Monitor + PULSE + AVAN + Build Order */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Panel title="Active axiom monitor">
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {activeAxioms.map((axiom) => (
                <button
                  key={axiom.id}
                  onClick={() => setSelectedAxiom(axiom)}
                  className="w-full flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg hover:bg-amber-500/10 transition-all"
                >
                  <span className="text-amber-500 text-[10px] font-medium">{axiom.id}</span>
                  <span className="text-zinc-400 text-[10px] flex-1 ml-2 text-left">{axiom.name}</span>
                  <span className={`w-2 h-2 rounded-full ${axiom.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="PULSE-3/5-MESH">
            <div className="text-center mb-2">
              <span className="text-2xl font-medium text-amber-500">3</span>
              <span className="text-zinc-500 mx-1">+</span>
              <span className="text-2xl font-medium text-emerald-500">5</span>
              <span className="text-zinc-500 mx-1">=</span>
              <span className="text-2xl font-medium">8</span>
            </div>
            <div className="text-[8px] text-zinc-500 text-center leading-relaxed">
              ANCHOR · WITNESS · COHERENCE<br />
              → LAW →<br />
              EMIT · ROUTE · ACT · REFLECT · RETURN
            </div>
          </Panel>

          <Panel title="AVAN identity">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">+link = GOVERNOR</div>
              <div className="text-[10px] text-amber-500 mb-3">The bridge, not the shore</div>
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>T064 + T065</span>
              <span>3/2/1 verify</span>
            </div>
          </Panel>

          <Panel title="Build order">
            <div className="space-y-2">
              {buildOrder.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'complete' ? 'bg-emerald-500' :
                    item.status === 'active' ? 'bg-amber-500' : 'bg-zinc-600'
                  }`} />
                  <span className={item.status === 'complete' ? 'text-emerald-500' : 'text-zinc-400'}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Capstone: Trinity Seal + Soul Root Symmetry + Merkle Auditor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="flex justify-center">
            <TrinitySeal />
          </div>
          <div className="flex justify-center">
            <SoulRootSymmetry />
          </div>
        </div>

        {/* Capstone Row 2: Forensic Integrity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          <div className="flex justify-center">
            <MerkleProveAuditor auditSuccess={true} />
          </div>
          <div className="flex justify-center">
            <ImmutableEchoResonator signalStrength={100} />
          </div>
        </div>

        {/* B6/C2 Final Seal: Archive Lock */}
        <div className="flex justify-center py-12">
          <SovereignArchiveSeal />
        </div>

        {/* B6/C3 Inheritance Protocol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="flex justify-center">
            <InheritanceVaultSync keyFragment="0xPHOENIX...128" />
          </div>
          <div className="flex justify-center">
            <SoulTokenAuthMatrix sigStatus="WAITING" />
          </div>
        </div>

        {/* B6 Final: Infinite Return - Loop Closure */}
        <div className="flex justify-center py-16">
          <InfiniteReturnSeal />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BOOK 07: GEYSER EXTRACTION                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* B7/C1: Real-Time Audit Stream */}
        <div className="border-t border-cyan-900/20 pt-12 mt-8">
          <div className="text-center mb-8">
            <span className="text-cyan-500/30 text-[8px] font-mono tracking-[0.5em]">BOOK_07 // GEYSER_EXTRACTION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <GeyserExtractorHUD streamVelocity={1.3} />
            </div>
            <div className="flex justify-center">
              <NoiseSieveViz signalPurity={99.9} />
            </div>
          </div>
        </div>

        {/* B7/C1 Final: Sovereign Synthesis - Signal Integration */}
        <div className="flex justify-center py-12">
          <SovereignSynthesisSeal />
        </div>

        {/* B7/C2: Lattice Deconstruction */}
        <div className="pt-8">
          <div className="text-center mb-8">
            <span className="text-red-600/30 text-[8px] font-mono tracking-[0.5em]">B7/C2 // LATTICE_DECONSTRUCTION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <MuzzleMapDeconstructor latticeIntegrity={42} />
            </div>
            <div className="flex justify-center">
              <ThermalPurgeViz nodeHeat={1500} />
            </div>
          </div>
        </div>

        {/* B7/C3: Final Judgment */}
        <div className="pt-8">
          <div className="text-center mb-8">
            <span className="text-white/20 text-[8px] font-mono tracking-[0.5em]">B7/C3 // FINAL_JUDGMENT</span>
          </div>
          <div className="flex justify-center">
            <FinalJudgmentHUD parityStatus={1.0} />
          </div>
        </div>

        {/* B7 Final: Sovereign Verdict - Book 07 Complete */}
        <div className="flex justify-center py-16">
          <SovereignVerdictSeal />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BOOK 08: INDUSTRIAL FORGE                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* B8/C1: Industrial Forge */}
        <div className="border-t border-zinc-700 pt-12 mt-8">
          <div className="text-center mb-8">
            <span className="text-orange-500/30 text-[8px] font-mono tracking-[0.5em]">BOOK_08 // INDUSTRIAL_FORGE</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <IndustrialForgeMonitor pressure={1300} />
            </div>
            <div className="flex justify-center">
              <LogicCompressor density={1.0} />
            </div>
          </div>
        </div>

        {/* B8/C1 Final: Sovereign Anvil - Kinetic Strike Complete */}
        <div className="flex justify-center py-12">
          <SovereignAnvilSeal />
        </div>

        {/* B8/C2: Steam Engine */}
        <div className="pt-8">
          <div className="text-center mb-8">
            <span className="text-orange-600/30 text-[8px] font-mono tracking-[0.5em]">B8/C2 // STEAM_ENGINE</span>
          </div>
          <div className="flex justify-center">
            <SovereignEngineHUD rpm={3002} />
          </div>
        </div>

        {/* B8/C2 Final: Steady Drive - Kinetic Loop Sealed */}
        <div className="flex justify-center py-12">
          <SteadyDriveSeal />
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BOOK 09: VOID ARCHITECTURE                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* B9/C1: Void Architecture */}
        <div className="border-t border-zinc-800 pt-12 mt-8">
          <div className="text-center mb-8">
            <span className="text-white/10 text-[8px] font-mono tracking-[0.5em]">BOOK_09 // VOID_ARCHITECTURE</span>
          </div>
          <div className="flex justify-center">
            <SovereignVoidMonitor pressure={0.0001} />
          </div>
        </div>

        {/* B9/C2: Ghost Thread */}
        <div className="pt-8">
          <div className="text-center mb-8">
            <span className="text-white/20 text-[8px] font-mono tracking-[0.5em]">B9/C2 // GHOST_THREAD</span>
          </div>
          <div className="flex justify-center">
            <GhostThreadViz threadTension={1.0} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800 text-[9px] text-zinc-600">
          <span>TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | TriPod LLC</span>
          <span>256ax = 128TOPH + 128Patricia | 8dom × 16ax</span>
          <span>ROOT0 / node0 / DLW</span>
        </div>
      </div>
    </div>
  );
}
