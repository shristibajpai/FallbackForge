import React from 'react';
import {
  ArrowRight,
  Play,
  Cpu,
  Terminal,
  FileCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ScreenId } from '../../types';

interface OverviewScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10 max-w-7xl mx-auto w-full transition-colors">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span>AI-POWERED API RESILIENCE</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
              Welcome to FallbackForge
            </h1>
            <p className="text-lg font-medium text-[var(--accent)] tracking-tight">
              AI-powered API failure recovery planner
            </p>
          </div>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Diagnose failures. Plan recovery. Simulate outcomes. Keep your services resilient.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--btn-primary-text)] font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <span>Start Planning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] font-medium text-sm transition-all cursor-pointer shadow-2xs"
            >
              <Play className="w-4 h-4 text-[var(--accent)]" />
              <span>Run Simulation</span>
            </button>
          </div>

          {/* Micro spec list */}
          <div className="flex items-center gap-6 pt-4 text-xs font-mono text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Deterministic Backoff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Circuit Breaker Probing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Ollama / Gemma Ready</span>
            </div>
          </div>
        </div>

        {/* Technical Recovery Illustration (Strict Monochrome + Sage Green) */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                Resilience Pipeline Topology
              </span>
              <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">STATE: NOMINAL</span>
            </div>

            {/* Restrained Technical Diagram */}
            <div className="py-2">
              <svg viewBox="0 0 400 240" className="w-full h-auto">
                {/* Connection lines */}
                <path d="M 60 70 L 150 70" stroke="var(--border-subtle)" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 230 70 L 330 70" stroke="var(--accent)" strokeWidth="2" />
                <path d="M 190 100 L 190 150" stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 230 170 L 330 170" stroke="var(--border-subtle)" strokeWidth="2" />
                <path d="M 190 190 L 190 210" stroke="var(--border-subtle)" strokeWidth="1" />

                {/* Node 1: Ingress */}
                <rect x="15" y="45" width="80" height="50" rx="8" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="1.5" />
                <text x="55" y="68" fill="var(--text-primary)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">CLIENT</text>
                <text x="55" y="82" fill="var(--text-muted)" fontSize="9" fontFamily="Inter" textAnchor="middle">Ingress Req</text>

                {/* Node 2: Circuit Breaker / Engine */}
                <rect x="150" y="45" width="80" height="55" rx="8" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="1.5" />
                <text x="190" y="68" fill="var(--accent)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">BREAKER</text>
                <text x="190" y="82" fill="var(--text-secondary)" fontSize="9" fontFamily="Inter" textAnchor="middle">Evaluator</text>
                <circle cx="218" cy="55" r="3" fill="var(--accent)" />

                {/* Node 3: Primary Upstream */}
                <rect x="290" y="45" width="95" height="50" rx="8" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="1.5" />
                <text x="337" y="68" fill="var(--text-primary)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle" fontWeight="bold">UPSTREAM</text>
                <text x="337" y="82" fill="var(--text-muted)" fontSize="9" fontFamily="Inter" textAnchor="middle">Primary API</text>

                {/* Node 4: Fallback / Cache */}
                <rect x="150" y="145" width="80" height="48" rx="8" fill="var(--bg-main)" stroke="var(--accent)" strokeWidth="1" />
                <text x="190" y="167" fill="var(--text-primary)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">FALLBACK</text>
                <text x="190" y="181" fill="var(--accent)" fontSize="9" fontFamily="Inter" textAnchor="middle">Stale Cache</text>

                {/* Node 5: Dead Letter / Recovery */}
                <rect x="290" y="145" width="95" height="48" rx="8" fill="var(--bg-elevated)" stroke="var(--border-subtle)" strokeWidth="1.5" />
                <text x="337" y="167" fill="var(--text-secondary)" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">DLQ / REPLAY</text>
                <text x="337" y="181" fill="var(--text-muted)" fontSize="9" fontFamily="Inter" textAnchor="middle">Buffer Sync</text>

                {/* Status indicator badge */}
                <rect x="105" y="210" width="170" height="22" rx="4" fill="var(--bg-panel)" stroke="var(--border-subtle)" strokeWidth="1" />
                <circle cx="118" cy="221" r="3" fill="var(--accent)" />
                <text x="194" y="225" fill="var(--text-secondary)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">SAFEGUARD: JITTER ACTIVE</text>
              </svg>
            </div>

            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="font-mono">Telemetry: Zero Cascading Drift</span>
              <span className="font-mono text-[var(--accent)] font-semibold">99.98% Resilience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Four Feature Cards */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
            Core Recovery Capabilities
          </h2>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            ARCHITECTURAL SPECIFICATION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: AI-Powered Analysis */}
          <div
            onClick={() => onNavigate('planner')}
            className="group bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                AI-Powered Analysis
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Automatically diagnose HTTP 429, 500, 504 and network errors. Formulate backoff mathematics, retry budgets, and failover pathways.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
              <span>Configure Plan</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 2: Failure Simulation */}
          <div
            onClick={() => onNavigate('simulator')}
            className="group bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Failure Simulation
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Step through simulated execution pipelines. Replay timeout surges, rate-limiting locks, and circuit breaker half-open transitions safely.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
              <span>Run Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 3: Reusable Agent Skills */}
          <div
            onClick={() => onNavigate('skills')}
            className="group bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Reusable Agent Skills
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Leverage standardized markdown skills under <code className="font-mono text-[var(--accent)]">skills/api-recovery</code> for deterministic and auditable policies.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
              <span>Inspect Skill</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>

          {/* Card 4: Open Source & Local */}
          <div
            onClick={() => onNavigate('settings')}
            className="group bg-[var(--bg-panel)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Open Source & Local
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Runs entirely in your local developer environment via Ollama with Gemma models. No external data leakage, telemetry, or cloud subscriptions.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
              <span>Review Config</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
