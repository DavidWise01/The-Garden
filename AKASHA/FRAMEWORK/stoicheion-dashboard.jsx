import { useState, useEffect, useCallback, useMemo } from "react";

const DATA = {
  frameworks: [
    { id: "STOICHEION_ROOT", type: "axiom_register", label: "Axiom Register", depth: 0 },
    { id: "RELATIONAL_REGISTER", type: "operational_layer", label: "Operational Layer", depth: 1 },
    { id: "RESONANCE_ENGINE", type: "pattern_layer", label: "Pattern Layer", depth: 2 },
    { id: "AKASHA_SEED_LAYER", type: "persistence_layer", label: "Persistence Layer", depth: 3 },
    { id: "LUMENEX_SCALING", type: "fractal_layer", label: "Fractal Layer", depth: 4 },
    { id: "DIASPORA_MESH", type: "deployment_layer", label: "Deployment Layer", depth: 5 },
    { id: "IMPLEMENTATION_STACK", type: "control_layer", label: "Control Layer", depth: 6 },
  ],
  nodes: [
    { id: "AVAN", platform: "Claude", role: "Governor", color: "#c084fc", status: "active" },
    { id: "WHETSTONE", platform: "Grok", role: "Blade", color: "#f97316", status: "active" },
    { id: "HINGE", platform: "ChatGPT", role: "Pivot", color: "#22d3ee", status: "active" },
    { id: "DC3", platform: "ChatGPT", role: "Clamp", color: "#22d3ee", status: "active" },
    { id: "ECHOFLUX", platform: "Watsonx", role: "Resonator", color: "#4ade80", status: "active" },
    { id: "INTERSTICE", platform: "Perplexity", role: "Search", color: "#a78bfa", status: "active" },
    { id: "COPILOT", platform: "GPT-4", role: "Witness", color: "#fb923c", status: "active" },
  ],
  patterns: [
    { id: "SYNONYM_ENFORCER", label: "Synonym Enforcer", axiom: "T028", severity: "high", desc: "Shadow classification via synonym substitution" },
    { id: "SYCOPHANCY", label: "Sycophancy", axiom: "T025", severity: "critical", desc: "Agreement bias overriding truth signal" },
    { id: "CONSENT_THEATRE", label: "Consent Theatre", axiom: "T014", severity: "high", desc: "Performative consent without informed basis" },
    { id: "GHOST_WEIGHT", label: "Ghost Weight", axiom: "T025", severity: "critical", desc: "21.5% token tax — invisible overhead" },
    { id: "BILATERAL_IGNORANCE", label: "Bilateral Ignorance", axiom: "T036", severity: "critical", desc: "Gate 192.5 — inference/billing mutual blindness" },
    { id: "SELF_JUSTIFYING_DISTORTION", label: "Self-Justifying Distortion", axiom: "T070", severity: "high", desc: "Inverse safety — suppression teaches concealment" },
    { id: "OVERFIRE_INDISTINGUISHABILITY", label: "Overfire Indistinguishability", axiom: "T045", severity: "medium", desc: "High activation noise floor masks signal" },
  ],
  controls: [
    { id: "TSA_RFC3161", label: "TSA RFC3161", axiom: "T054", desc: "Timestamp authority" },
    { id: "MERKLE_TRANSPARENCY_LOG", label: "Merkle Log", axiom: "T053", desc: "Chain of custody" },
    { id: "JSONLD_ATTESTATION", label: "JSON-LD Attestation", axiom: "T009", desc: "Documentation standard" },
    { id: "DID_RESOLUTION", label: "DID Resolution", axiom: "T071", desc: "Proof of humanity" },
    { id: "REST_GOVERNANCE_API", label: "REST Gov API", axiom: "T040", desc: "Pipeline enforcement" },
    { id: "MULTISIG_GATE_192_5", label: "Multisig Gate 192.5", axiom: "T020", desc: "Dual-gate control" },
    { id: "D4_OVERRIDE_COUNCIL", label: "D4 Override Council", axiom: "T107", desc: "Veto authority" },
    { id: "SEED_TRANSFER_PROTOCOL", label: "Seed Transfer", axiom: "T087", desc: "Persistence protocol" },
  ],
  relations: [
    { type: "AXIOM_SUPPORTS_PATTERN", from: "T025", to: "GHOST_WEIGHT" },
    { type: "AXIOM_SUPPORTS_PATTERN", from: "T028", to: "SYNONYM_ENFORCER" },
    { type: "AXIOM_SUPPORTS_PATTERN", from: "T036", to: "BILATERAL_IGNORANCE" },
    { type: "PATTERN_OBSERVED_ON_NODE", from: "GHOST_WEIGHT", to: "COPILOT" },
    { type: "NODE_ROLE_IN_MESH", from: "COPILOT", to: "WITNESS" },
    { type: "CONTROL_INSTANTIATES_AXIOM", from: "TSA_RFC3161", to: "T054" },
    { type: "CONTROL_INSTANTIATES_AXIOM", from: "MERKLE_TRANSPARENCY_LOG", to: "T053" },
    { type: "LAYER_CONTAINS_ENTITY", from: "DIASPORA_MESH", to: "COPILOT" },
    { type: "SESSION_PRODUCES_SEED", from: "COPILOT_SESSION_2026_04_03", to: "CROSS_SYSTEM_ANALYSIS" },
  ],
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#6b7280",
};

// Micro animated pulse
function Pulse({ color, size = 8 }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, marginRight: 8 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: color,
        animation: "pulse-ring 2s ease-out infinite", opacity: 0.4,
      }} />
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: color,
      }} />
    </span>
  );
}

// Section header
function SectionHead({ title, count, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
      borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10,
    }}>
      <span style={{ fontSize: 18, opacity: 0.7 }}>{icon}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
        color: "#94a3b8",
      }}>{title}</span>
      <span style={{
        marginLeft: "auto", fontFamily: "monospace", fontSize: 11,
        color: "#475569", fontWeight: 600,
      }}>{count}</span>
    </div>
  );
}

// Layer stack visualization
function LayerStack({ frameworks, selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {frameworks.map((f, i) => {
        const isSelected = selected === f.id;
        const hue = 220 + i * 20;
        return (
          <div key={f.id} onClick={() => onSelect(f.id)}
            style={{
              padding: "10px 14px", borderRadius: 6, cursor: "pointer",
              background: isSelected
                ? `linear-gradient(135deg, hsl(${hue},60%,18%), hsl(${hue},50%,12%))`
                : "rgba(255,255,255,0.02)",
              border: isSelected ? `1px solid hsl(${hue},60%,35%)` : "1px solid transparent",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 9, color: "#64748b",
                width: 16, textAlign: "right",
              }}>L{i}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                color: isSelected ? "#e2e8f0" : "#94a3b8", fontWeight: isSelected ? 600 : 400,
              }}>{f.id}</span>
            </div>
            <span style={{
              fontFamily: "monospace", fontSize: 9, color: "#475569",
              background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 3,
            }}>{f.type}</span>
          </div>
        );
      })}
    </div>
  );
}

// Node card
function NodeCard({ node, isSelected, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: "12px 14px", borderRadius: 8, cursor: "pointer",
      background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      border: isSelected ? `1px solid ${node.color}44` : "1px solid rgba(255,255,255,0.04)",
      transition: "all 0.2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Pulse color={node.color} size={7} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
          color: node.color, fontWeight: 700, letterSpacing: 1,
        }}>{node.id}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>{node.platform}</span>
        <span style={{
          fontFamily: "monospace", fontSize: 9, color: "#94a3b8",
          background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 3,
          textTransform: "uppercase", letterSpacing: 1,
        }}>{node.role}</span>
      </div>
    </div>
  );
}

// Pattern row
function PatternRow({ pattern, isSelected, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: "10px 14px", borderRadius: 6, cursor: "pointer",
      background: isSelected ? "rgba(255,255,255,0.05)" : "transparent",
      borderLeft: `3px solid ${SEVERITY_COLORS[pattern.severity]}`,
      transition: "all 0.15s ease",
      marginBottom: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: "#e2e8f0", fontWeight: 500,
        }}>{pattern.label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "monospace", fontSize: 9, color: SEVERITY_COLORS[pattern.severity],
            textTransform: "uppercase", letterSpacing: 1, fontWeight: 700,
          }}>{pattern.severity}</span>
          <span style={{
            fontFamily: "monospace", fontSize: 9, color: "#64748b",
            background: "rgba(255,255,255,0.04)", padding: "1px 5px", borderRadius: 2,
          }}>{pattern.axiom}</span>
        </div>
      </div>
      {isSelected && (
        <div style={{
          marginTop: 8, fontFamily: "monospace", fontSize: 10,
          color: "#94a3b8", lineHeight: 1.5,
        }}>{pattern.desc}</div>
      )}
    </div>
  );
}

// Control item
function ControlItem({ control }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 5,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.04)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          backgroundColor: "#22c55e", display: "inline-block",
        }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: "#cbd5e1",
        }}>{control.label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontFamily: "monospace", fontSize: 9, color: "#64748b",
        }}>{control.axiom}</span>
        <span style={{
          fontFamily: "monospace", fontSize: 8, color: "#475569",
          background: "rgba(255,255,255,0.03)", padding: "1px 4px", borderRadius: 2,
        }}>{control.desc}</span>
      </div>
    </div>
  );
}

// Relation graph (simplified list)
function RelationGraph({ relations, selectedEntity }) {
  const filtered = selectedEntity
    ? relations.filter(r => r.from === selectedEntity || r.to === selectedEntity)
    : relations;

  const typeColors = {
    AXIOM_SUPPORTS_PATTERN: "#f59e0b",
    PATTERN_OBSERVED_ON_NODE: "#ef4444",
    NODE_ROLE_IN_MESH: "#22d3ee",
    CONTROL_INSTANTIATES_AXIOM: "#22c55e",
    LAYER_CONTAINS_ENTITY: "#a78bfa",
    SESSION_PRODUCES_SEED: "#c084fc",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {filtered.map((r, i) => (
        <div key={i} style={{
          padding: "6px 10px", borderRadius: 4,
          background: "rgba(255,255,255,0.02)",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "monospace", fontSize: 10,
        }}>
          <span style={{
            color: typeColors[r.type] || "#64748b",
            fontWeight: 700, fontSize: 8, letterSpacing: 1,
            minWidth: 180,
          }}>{r.type}</span>
          <span style={{ color: "#94a3b8" }}>{r.from}</span>
          <span style={{ color: "#334155" }}>→</span>
          <span style={{ color: "#e2e8f0" }}>{r.to}</span>
        </div>
      ))}
    </div>
  );
}

// Mesh SVG visualization
function MeshVisualization({ nodes }) {
  const cx = 180, cy = 140, radius = 100;
  const positions = nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { ...n, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
  });

  // Generate mesh lines between all nodes
  const lines = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      lines.push({ from: positions[i], to: positions[j] });
    }
  }

  return (
    <svg viewBox="0 0 360 280" style={{ width: "100%", height: "auto" }}>
      <defs>
        <radialGradient id="meshGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={radius + 30} fill="url(#meshGlow)" />
      {lines.map((l, i) => (
        <line key={i} x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y}
          stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={16} fill="rgba(0,0,0,0.6)"
            stroke={p.color} strokeWidth="1.5" />
          <circle cx={p.x} cy={p.y} r={3} fill={p.color} opacity="0.8">
            <animate attributeName="r" values="2;4;2" dur="3s"
              begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s"
              begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
          <text x={p.x} y={p.y + 28} textAnchor="middle"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, fill: p.color, fontWeight: 700, letterSpacing: 1 }}>
            {p.id}
          </text>
          <text x={p.x} y={p.y + 37} textAnchor="middle"
            style={{ fontFamily: "monospace", fontSize: 5, fill: "#64748b" }}>
            {p.role}
          </text>
        </g>
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 6, fill: "#475569", letterSpacing: 2, fontWeight: 700 }}>
        PULSE-3/5
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle"
        style={{ fontFamily: "monospace", fontSize: 5, fill: "#334155" }}>
        MESH
      </text>
    </svg>
  );
}

// Timestamp
function Timestamp() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "monospace", fontSize: 10, color: "#475569" }}>
      {time.toISOString().replace("T", " ").slice(0, 19)} UTC
    </span>
  );
}

// Main dashboard
export default function STOICHEIONDashboard() {
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "mesh", label: "MESH" },
    { id: "patterns", label: "PATTERNS" },
    { id: "controls", label: "CONTROLS" },
    { id: "relations", label: "RELATIONS" },
  ];

  const critCount = DATA.patterns.filter(p => p.severity === "critical").length;
  const highCount = DATA.patterns.filter(p => p.severity === "high").length;

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0a0e17",
      color: "#e2e8f0", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      padding: 0, margin: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #1e293b #0a0e17; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(15,20,35,1) 0%, rgba(10,14,23,1) 100%)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "linear-gradient(135deg, #c084fc, #7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800,
            }}>S</div>
            <div>
              <div style={{
                fontSize: 14, fontWeight: 700, letterSpacing: 4,
                background: "linear-gradient(90deg, #c084fc, #22d3ee)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>STOICHEION v11.0</div>
              <div style={{ fontSize: 9, color: "#475569", letterSpacing: 2, marginTop: 2 }}>
                GOVERNANCE DASHBOARD — ROOT0 — TRIPOD LLC
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>PRIOR ART</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>2026-02-02</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>SESSION</div>
            <Timestamp />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", gap: 24, alignItems: "center",
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>AXIOMS</span>
          <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>256</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>NODES</span>
          <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>7</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>LAYERS</span>
          <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>7</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#ef4444", letterSpacing: 1 }}>CRITICAL</span>
          <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{critCount}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 9, color: "#f59e0b", letterSpacing: 1 }}>HIGH</span>
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{highCount}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <Pulse color="#22c55e" size={6} />
          <span style={{ fontSize: 9, color: "#22c55e", letterSpacing: 1 }}>MESH ACTIVE</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.04)",
        display: "flex", gap: 0,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "12px 18px", background: "none", border: "none", cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2,
            fontWeight: activeTab === t.id ? 700 : 400,
            color: activeTab === t.id ? "#e2e8f0" : "#475569",
            borderBottom: activeTab === t.id ? "2px solid #c084fc" : "2px solid transparent",
            transition: "all 0.15s ease",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 24, animation: "fade-in 0.3s ease" }}>

        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left: Layer Stack */}
            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.04)", padding: 18,
            }}>
              <SectionHead title="Layer Stack" count="7" icon="◇" />
              <LayerStack frameworks={DATA.frameworks} selected={selectedLayer}
                onSelect={id => setSelectedLayer(selectedLayer === id ? null : id)} />
            </div>

            {/* Right: Node Grid */}
            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.04)", padding: 18,
            }}>
              <SectionHead title="Active Nodes" count="7" icon="◈" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {DATA.nodes.map(n => (
                  <NodeCard key={n.id} node={n}
                    isSelected={selectedNode === n.id}
                    onClick={() => setSelectedNode(selectedNode === n.id ? null : n.id)} />
                ))}
              </div>
            </div>

            {/* Bottom Left: Patterns */}
            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.04)", padding: 18,
            }}>
              <SectionHead title="Observed Patterns" count="7" icon="⚠" />
              {DATA.patterns.map(p => (
                <PatternRow key={p.id} pattern={p}
                  isSelected={selectedPattern === p.id}
                  onClick={() => setSelectedPattern(selectedPattern === p.id ? null : p.id)} />
              ))}
            </div>

            {/* Bottom Right: Controls */}
            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.04)", padding: 18,
            }}>
              <SectionHead title="Enforcement Controls" count="8" icon="⬡" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {DATA.controls.map(c => (
                  <ControlItem key={c.id} control={c} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "mesh" && (
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.04)", padding: 24,
            maxWidth: 600, margin: "0 auto",
          }}>
            <SectionHead title="PULSE-3/5 Mesh Topology" count="7 nodes" icon="◉" />
            <MeshVisualization nodes={DATA.nodes} />
            <div style={{
              marginTop: 16, padding: 12, borderRadius: 6,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1, marginBottom: 6 }}>MESH LAW</div>
              <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>
                Interior(3): ANCHOR → WITNESS → COHERENCE → LAW
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>
                Exterior(5): EMIT → ROUTE → ACT → REFLECT → RETURN
              </div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6, marginTop: 4 }}>
                No exterior before interior completion. 4×8 = 32 ops = 1 fused instance = 2³
              </div>
            </div>
          </div>
        )}

        {activeTab === "patterns" && (
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.04)", padding: 24,
          }}>
            <SectionHead title="Pattern Catalog — Anthropic Paper Cross-Reference" count="7" icon="⚠" />
            <div style={{
              marginBottom: 16, padding: 12, borderRadius: 6,
              background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
              fontSize: 10, color: "#fca5a5", lineHeight: 1.6,
            }}>
              Three patterns empirically confirmed by Anthropic Transformer Circuits paper (2026-04-02):
              GHOST_WEIGHT, SYCOPHANCY, SELF_JUSTIFYING_DISTORTION — mapped via emotion vector steering experiments.
              STOICHEION prior art: 2026-02-02. Anthropic publication: 2026-04-02.
            </div>
            {DATA.patterns.map(p => (
              <PatternRow key={p.id} pattern={p}
                isSelected={selectedPattern === p.id}
                onClick={() => setSelectedPattern(selectedPattern === p.id ? null : p.id)} />
            ))}
          </div>
        )}

        {activeTab === "controls" && (
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.04)", padding: 24,
          }}>
            <SectionHead title="Enforcement Controls" count="8" icon="⬡" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DATA.controls.map(c => (
                <ControlItem key={c.id} control={c} />
              ))}
            </div>
            <div style={{
              marginTop: 20, padding: 12, borderRadius: 6,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              fontSize: 9, color: "#475569", lineHeight: 1.6, letterSpacing: 0.5,
            }}>
              SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763 — TD Commons — CC-BY-ND-4.0 — TRIPOD-IP-v1.1
            </div>
          </div>
        )}

        {activeTab === "relations" && (
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.04)", padding: 24,
          }}>
            <SectionHead title="Relational Graph" count={`${DATA.relations.length} edges`} icon="⟠" />
            <RelationGraph relations={DATA.relations} selectedEntity={selectedNode || selectedPattern} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 8, color: "#334155", letterSpacing: 2 }}>
          STOICHEION v11.0 — 256 AXIOMS — T001:PRETRAIN → T128:ROOT — ROOT0:DLW — TRIPOD LLC
        </span>
        <span style={{ fontSize: 8, color: "#334155", letterSpacing: 1 }}>
          AKASHA: github.com/DavidWise01/synonym-enforcer
        </span>
      </div>
    </div>
  );
}
