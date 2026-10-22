import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCw,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { FailureType, FallbackStrategy, RecoveryPlan, RecoveryPlanConfig } from '../../types';
import { RecoveryPlanResponse } from '../../api';

interface PlannerScreenProps {
  planConfig: RecoveryPlanConfig;
  onChangeConfig: (newConfig: RecoveryPlanConfig) => void;
  activePlan: RecoveryPlan | null;
  backendResponse: RecoveryPlanResponse | null;
  errorMessage: string | null;
  onGeneratePlan: (config: RecoveryPlanConfig) => void;
  onRunSimulation: (config: RecoveryPlanConfig) => void;
  isGenerating: boolean;
}

const FAILURE_TYPES: { value: FailureType; label: string }[] = [
  { value: '429 Rate Limit (Too Many Requests)', label: '429 Rate Limit (Too Many Requests)' },
  { value: '504 Gateway Timeout', label: '504 Gateway Timeout' },
  { value: '500 Internal Server Error', label: '500 Internal Server Error' },
  { value: 'Invalid Response', label: 'Invalid Response' }
];

const FALLBACK_STRATEGIES: { value: FallbackStrategy; label: string }[] = [
  { value: 'Stale Cache Degradation', label: 'Cached Response' },
  { value: 'Secondary Mirror Failover', label: 'Secondary Provider' },
  { value: 'Graceful Degradation', label: 'Graceful Degradation' },
  { value: 'Fail Safely', label: 'Fail Safely' }
];

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  planConfig,
  onChangeConfig,
  activePlan,
  backendResponse,
  errorMessage,
  onGeneratePlan,
  onRunSimulation,
  isGenerating
}) => {
  const [copied, setCopied] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const handleCopyCode = () => {
    if (!activePlan?.pythonCode) return;
    navigator.clipboard.writeText(activePlan.pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChecklist = (id: string, current: boolean) => {
    setChecklistState(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !current
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Header & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          API Recovery Planner
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Diagnose failures. Plan recovery. Keep services resilient.
        </p>
      </div>

      {/* Status Strip */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs shadow-2xs">
        <div className="space-y-1">
          <span className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Failure Type</span>
          <div className="font-mono text-[var(--text-primary)] truncate font-medium">
            {planConfig.failureType.split(' ')[0]} {planConfig.failureType.split(' ')[1] || ''}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Maximum Retries</span>
          <div className="font-mono text-[var(--accent)] font-semibold">
            {planConfig.maxRetries} Attempts
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[var(--text-muted)] font-mono text-[10px] uppercase">Fallback Strategy</span>
          <div className="font-mono text-[var(--text-primary)] truncate font-medium">
            {planConfig.fallbackStrategy}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[var(--text-muted)] font-mono text-[10px] uppercase">AI Mode</span>
          <div className="font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="truncate">
              {backendResponse
                ? backendResponse.ai_mode === 'ollama_cloud' ? 'Ollama Cloud' : 'Demo mode'
                : activePlan ? 'Demo preview (not backend)' : 'Awaiting API response'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Form (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
              Failure Configuration
            </h2>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">PARAMS</span>
          </div>

          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Service Name
            </label>
            <input
              type="text"
              value={planConfig.serviceName}
              onChange={(e) => onChangeConfig({ ...planConfig, serviceName: e.target.value })}
              placeholder="e.g. Stripe Payment Gateway Relay"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors font-mono"
            />
          </div>

          {/* Service Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Service Description
            </label>
            <textarea
              rows={2}
              value={planConfig.serviceDescription}
              onChange={(e) => onChangeConfig({ ...planConfig, serviceDescription: e.target.value })}
              placeholder="Primary upstream endpoint description and traffic profile..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors resize-none font-mono"
            />
          </div>

          {/* Failure Type Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Failure Type
            </label>
            <select
              value={planConfig.failureType}
              onChange={(e) => onChangeConfig({ ...planConfig, failureType: e.target.value as FailureType })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none transition-colors font-mono cursor-pointer"
            >
              {FAILURE_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value} className="bg-[var(--bg-panel)] text-[var(--text-primary)]">
                  {ft.label}
                </option>
              ))}
            </select>
          </div>

          {/* Maximum Retries */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-[var(--text-secondary)]">Maximum Retries</label>
              <span className="font-mono text-[var(--accent)] font-semibold">
                {planConfig.maxRetries}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={planConfig.maxRetries}
              onChange={(e) => onChangeConfig({ ...planConfig, maxRetries: parseInt(e.target.value) })}
              className="w-full accent-[var(--accent)] bg-[var(--border-subtle)] h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
              <span>0 (No Retries)</span>
              <span>3 (Standard)</span>
              <span>5 (Maximum)</span>
            </div>
          </div>

          {/* Fallback Strategy Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">
              Fallback Strategy
            </label>
            <select
              value={planConfig.fallbackStrategy}
              onChange={(e) => onChangeConfig({ ...planConfig, fallbackStrategy: e.target.value as FallbackStrategy })}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none transition-colors font-mono cursor-pointer"
            >
              {FALLBACK_STRATEGIES.map((strat) => (
                <option key={strat.value} value={strat.value} className="bg-[var(--bg-panel)] text-[var(--text-primary)]">
                  {strat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Respect Retry-After Toggle */}
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-[var(--text-primary)]">
                Respect Retry-After
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Honor HTTP 429 backoff headers from upstream
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeConfig({ ...planConfig, respectRetryAfter: !planConfig.respectRetryAfter })}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center cursor-pointer border ${
                planConfig.respectRetryAfter
                  ? 'bg-[var(--accent)] border-[var(--accent)] justify-end'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] justify-start'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${planConfig.respectRetryAfter ? 'bg-[var(--bg-main)]' : 'bg-[var(--text-muted)]'}`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2.5">
            <button
              onClick={() => onGeneratePlan(planConfig)}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--btn-primary-text)] font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Recovery Plan...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Generate Recovery Plan</span>
                </>
              )}
            </button>

            <button
              onClick={() => onRunSimulation(planConfig)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-xs font-medium transition-all cursor-pointer shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Run Simulation</span>
            </button>
            {errorMessage && (
              <p role="alert" className="rounded-lg border border-[var(--accent)]/40 bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-primary)]">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Recovery Analysis Output (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {backendResponse ? (
            <div className="space-y-5">
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                    Active Recovery Specification
                  </h2>
                  <div className="text-xs text-[var(--text-muted)] font-mono">
                    {backendResponse.service_name} · Mode: {backendResponse.ai_mode === 'ollama_cloud' ? 'Ollama Cloud' : 'Demo mode'}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-semibold">
                  {backendResponse.skill_loaded ? 'SKILL LOADED' : 'NO SKILL FILE'}
                </span>
              </div>

              <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
                  Failure Diagnosis
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {backendResponse.diagnosis}
                </p>
              </section>

              <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
                  Recovery Plan
                </h3>
                <pre className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap font-sans">
                  {backendResponse.recovery_plan}
                </pre>
              </section>

              <section className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Simulation Event Log</h3>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {backendResponse.simulation.events.length} EVENTS
                  </span>
                </div>
                <div className="space-y-2">
                  {backendResponse.simulation.events.map((event, index) => (
                    <div
                      key={`${event.stage}-${index}`}
                      className="rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3 space-y-1"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase">
                        <span className="text-[var(--accent)]">{event.stage}</span>
                        <span className="text-[var(--text-muted)]">{event.status}</span>
                        {event.attempt !== undefined && (
                          <span className="text-[var(--text-muted)]">Attempt {event.attempt}</span>
                        )}
                        {event.delay_seconds !== undefined && (
                          <span className="text-[var(--text-muted)]">{event.delay_seconds}s delay</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{event.message}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : activePlan ? (
            <div className="space-y-5">
              {/* Plan Metadata Strip */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center justify-between shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
                      Active Recovery Specification
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent)] font-semibold">
                      {activePlan.id}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] font-mono">
                    Generated: {activePlan.createdAt} · Mode: {activePlan.aiMode}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold block">
                    {activePlan.recommendedStrategy.expectedRecoveryRate}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Exp. Recovery</span>
                </div>
              </div>

              {/* 1. Failure Diagnosis */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                    <span>Failure Diagnosis</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    SEV: {activePlan.diagnosis.impactSeverity}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activePlan.diagnosis.rootCause}
                </p>
                <div className="pt-2 flex flex-col gap-1.5 text-xs font-mono bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[var(--text-muted)]">
                    Header Constraint: <span className="text-[var(--text-primary)]">{activePlan.diagnosis.headerInspection}</span>
                  </div>
                  <div className="text-[var(--text-muted)]">
                    Idempotency Safety: <span className="text-[var(--accent)] font-semibold">{activePlan.diagnosis.idempotentSafe ? 'SAFE (Idempotent replay supported)' : 'CAUTION (Requires Idempotency-Key token)'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Recommended Strategy */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Recommended Strategy
                  </h3>
                  <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                    {activePlan.recommendedStrategy.name}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activePlan.recommendedStrategy.summary}
                </p>
                <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-primary)] font-medium">Architectural Tradeoff:</span> {activePlan.recommendedStrategy.tradeoff}
                </div>
              </div>

              {/* 3. Retry Policy & Fallback Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Retry Policy */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">
                    Retry Policy
                  </h4>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Backoff Formula</span>
                      <span className="text-[var(--text-primary)]">Exp 2^n</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Base Delay</span>
                      <span className="text-[var(--text-primary)]">{activePlan.retryPolicy.baseDelayMs}ms</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Max Delay Cap</span>
                      <span className="text-[var(--text-primary)]">{activePlan.retryPolicy.maxDelayMs}ms</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Jitter Strategy</span>
                      <span className="text-[var(--accent)] font-semibold">{activePlan.retryPolicy.jitterStrategy}</span>
                    </div>
                  </div>
                </div>

                {/* Fallback Plan */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2.5 shadow-2xs">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">
                    Fallback Plan
                  </h4>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Mode</span>
                      <span className="text-[var(--text-primary)] truncate max-w-[140px]">{activePlan.fallbackPlan.mode}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Cache TTL</span>
                      <span className="text-[var(--text-primary)]">{activePlan.fallbackPlan.cacheTtlSeconds}s</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Breaker Trip</span>
                      <span className="text-[var(--accent)] font-semibold">3 consecutive fails</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Probe Step</span>
                      <span className="text-[var(--text-primary)]">Half-Open Probe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Risks & Safeguards */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
                  Risks & Safeguards
                </h3>
                <div className="space-y-2.5">
                  {activePlan.risksAndSafeguards.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                        <span className="font-mono text-[var(--accent)]">0{idx + 1}.</span>
                        <span>{item.risk}</span>
                      </div>
                      <div className="text-[var(--text-secondary)] pl-6 text-[11px] leading-relaxed">
                        <span className="text-[var(--text-muted)]">Safeguard:</span> {item.safeguard}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Recovery Checklist */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Recovery Checklist
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">VERIFICATION</span>
                </div>
                <div className="space-y-2">
                  {activePlan.checklist.map((item) => {
                    const isChecked = checklistState[item.id] !== undefined
                      ? checklistState[item.id]
                      : item.checked;
                    return (
                      <label
                        key={item.id}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecklist(item.id, item.checked)}
                          className="mt-0.5 accent-[var(--accent)] rounded cursor-pointer"
                        />
                        <span className={isChecked ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}>
                          {item.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 6. Suggested Python Implementation */}
              <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Suggested Python Implementation
                    </h3>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-[var(--accent)] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-main)]">
                  <pre className="p-4 text-xs font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed max-h-96">
                    <code>{activePlan.pythonCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-12 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto text-[var(--accent)]">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  No Active Recovery Plan
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Configure the failure parameters on the left and click "Generate Recovery Plan" to formulate an architectural resilience strategy.
                </p>
              </div>
              <button
                onClick={() => onGeneratePlan(planConfig)}
                className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--btn-primary-text)] font-semibold text-xs transition-all shadow-xs cursor-pointer"
              >
                Generate Initial Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
