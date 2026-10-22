import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  AlertCircle,
  RotateCw,
  Layers,
  CheckCircle2,
  Play,
  RotateCcw,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { PipelineStage, PipelineStageId, SimulatorLog } from '../../types';

interface SimulatorScreenProps {
  onPlanGeneratedNotice?: (serviceName: string) => void;
}

type ScenarioType = 'RATE_LIMIT' | 'TIMEOUT' | 'SERVER_ERROR';

const DEFAULT_STAGES: PipelineStage[] = [
  {
    id: 'REQUEST',
    name: 'REQUEST',
    subtext: 'Client Ingress',
    status: 'pending',
    detail: 'POST /v1/checkout/charge'
  },
  {
    id: 'FAILURE',
    name: 'FAILURE',
    subtext: 'Upstream Rejection',
    status: 'pending',
    detail: 'Awaiting dispatch...'
  },
  {
    id: 'RETRY',
    name: 'RETRY',
    subtext: 'Backoff Engine',
    status: 'pending',
    detail: 'Jitter calculation'
  },
  {
    id: 'FALLBACK',
    name: 'FALLBACK',
    subtext: 'Degraded Route',
    status: 'pending',
    detail: 'Cache / Circuit / DLQ'
  },
  {
    id: 'RESULT',
    name: 'RESULT',
    subtext: 'Final Outcome',
    status: 'pending',
    detail: 'Resilience verified'
  }
];

export const SimulatorScreen: React.FC<SimulatorScreenProps> = () => {
  const [scenario, setScenario] = useState<ScenarioType>('RATE_LIMIT');
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);
  const [logs, setLogs] = useState<SimulatorLog[]>([
    {
      timestamp: '00:00:00.000',
      level: 'REQUEST',
      message: 'Simulator ready. Select a scenario preset and click "Run Simulation".'
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (level: SimulatorLog['level'], message: string, code?: number | string, latencyMs?: number) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [...prev, { timestamp: timeStr, level, message, code, latencyMs }]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStages(DEFAULT_STAGES);
    setLogs([
      {
        timestamp: new Date().toTimeString().split(' ')[0] + '.000',
        level: 'REQUEST',
        message: 'Pipeline reset to idle state. Simulated network sandbox initialized.'
      }
    ]);
  };

  const loadScenario = (type: ScenarioType) => {
    if (isRunning) return;
    setScenario(type);
    handleReset();
    let label = '';
    if (type === 'TIMEOUT') label = 'HTTP 504 Gateway Timeout scenario loaded.';
    else if (type === 'RATE_LIMIT') label = 'HTTP 429 Rate Limit (Too Many Requests) scenario loaded.';
    else label = 'HTTP 500 Internal Server Error scenario loaded.';

    setLogs([
      {
        timestamp: new Date().toTimeString().split(' ')[0] + '.000',
        level: 'REQUEST',
        message: `Preset loaded: ${label} Configured for non-intrusive local test.`
      }
    ]);
  };

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStages(DEFAULT_STAGES);
    
    // Step 1: REQUEST
    setStages(prev => prev.map(s => s.id === 'REQUEST' ? { ...s, status: 'active', detail: 'Transmitting payload...' } : s));
    addLog('REQUEST', 'Client initiated HTTPS POST request to upstream service endpoint.', 'POST', 12);
    await new Promise(r => setTimeout(r, 600));

    setStages(prev => prev.map(s => s.id === 'REQUEST' ? { ...s, status: 'completed', detail: 'Dispatched (246 bytes)' } : s));

    // Step 2: FAILURE
    setStages(prev => prev.map(s => s.id === 'FAILURE' ? { ...s, status: 'active', detail: 'Evaluating response...' } : s));
    await new Promise(r => setTimeout(r, 700));

    if (scenario === 'RATE_LIMIT') {
      addLog('FAILURE', 'Upstream returned HTTP 429 Too Many Requests. Header Retry-After: 2s detected.', 429, 84);
      setStages(prev => prev.map(s => s.id === 'FAILURE' ? { ...s, status: 'degraded', detail: 'HTTP 429 Rate Exceeded' } : s));
    } else if (scenario === 'TIMEOUT') {
      addLog('FAILURE', 'Socket read timeout after 5000ms. Ingress proxy closed connection.', 504, 5012);
      setStages(prev => prev.map(s => s.id === 'FAILURE' ? { ...s, status: 'degraded', detail: 'HTTP 504 Gateway Timeout' } : s));
    } else {
      addLog('FAILURE', 'Upstream worker crashed. Returned HTTP 500 Internal Server Error.', 500, 142);
      setStages(prev => prev.map(s => s.id === 'FAILURE' ? { ...s, status: 'degraded', detail: 'HTTP 500 Internal Error' } : s));
    }

    // Step 3: RETRY
    setStages(prev => prev.map(s => s.id === 'RETRY' ? { ...s, status: 'active', detail: 'Computing backoff...' } : s));
    await new Promise(r => setTimeout(r, 700));

    if (scenario === 'RATE_LIMIT') {
      addLog('RETRY', 'Attempt 1/3: Sleeping 2.14s (Retry-After header + 140ms jitter decorrelation).', 'BACKOFF');
      await new Promise(r => setTimeout(r, 600));
      addLog('RETRY', 'Attempt 2/3: Upstream drained burst queue. Next probe prepared.', 'POLL');
    } else if (scenario === 'TIMEOUT') {
      addLog('RETRY', 'Attempt 1/2: Exponential backoff factor (250ms * 2^1) = 500ms + jitter.', 'BACKOFF');
      await new Promise(r => setTimeout(r, 500));
      addLog('RETRY', 'Attempt 2/2: Second attempt timed out. Threshold reached (2 failures).', 'STOP');
    } else {
      addLog('RETRY', 'Attempt 1/3: Backoff 500ms. Server state still invalid. Engaging Circuit Breaker.', 'CIRCUIT');
    }

    setStages(prev => prev.map(s => s.id === 'RETRY' ? { ...s, status: 'completed', detail: 'Backoff evaluated' } : s));

    // Step 4: FALLBACK
    setStages(prev => prev.map(s => s.id === 'FALLBACK' ? { ...s, status: 'active', detail: 'Orchestrating fallback...' } : s));
    await new Promise(r => setTimeout(r, 700));

    if (scenario === 'RATE_LIMIT') {
      addLog('FALLBACK', 'Retry succeeded on attempt 2. Secondary fallback cache not required.', 'BYPASS');
      setStages(prev => prev.map(s => s.id === 'FALLBACK' ? { ...s, status: 'completed', detail: 'Direct Recovery' } : s));
    } else if (scenario === 'TIMEOUT') {
      addLog('FALLBACK', 'Circuit Breaker tripped to OPEN. Serving stale cached snapshot (TTL 300s).', 'CACHE_HIT');
      setStages(prev => prev.map(s => s.id === 'FALLBACK' ? { ...s, status: 'completed', detail: 'Stale Cache Served' } : s));
    } else {
      addLog('FALLBACK', 'Pushed payload into Asynchronous Dead-Letter Exchange (DLQ). Replay scheduled.', 'DLQ_ACK');
      setStages(prev => prev.map(s => s.id === 'FALLBACK' ? { ...s, status: 'completed', detail: 'Queued to DLQ' } : s));
    }

    // Step 5: RESULT
    setStages(prev => prev.map(s => s.id === 'RESULT' ? { ...s, status: 'active', detail: 'Finalizing metric...' } : s));
    await new Promise(r => setTimeout(r, 500));

    if (scenario === 'RATE_LIMIT') {
      addLog('RESOLVED', 'SUCCESS: Upstream acknowledged request. HTTP 200 OK after backoff.', 200, 2224);
      setStages(prev => prev.map(s => s.id === 'RESULT' ? { ...s, status: 'completed', detail: 'HTTP 200 Recovered' } : s));
    } else if (scenario === 'TIMEOUT') {
      addLog('RESOLVED', 'DEGRADED: Client served valid cached schema. Zero user-facing error disruption.', 'DEGRADED', 5620);
      setStages(prev => prev.map(s => s.id === 'RESULT' ? { ...s, status: 'completed', detail: 'Degraded Graceful' } : s));
    } else {
      addLog('RESOLVED', 'ACCEPTED: Async DLQ accepted task. Client returned HTTP 202 Accepted.', 202, 1150);
      setStages(prev => prev.map(s => s.id === 'RESULT' ? { ...s, status: 'completed', detail: 'Asynchronous ACK' } : s));
    }

    setIsRunning(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full transition-colors">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          API Failure Simulator
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Simulate distributed execution pipelines and verify fallback policies deterministically.
        </p>
      </div>

      {/* Simulator Notice Strip */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-[var(--text-primary)] font-medium">SIMULATION ENVIRONMENT</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-[var(--text-secondary)]">Zero external network calls emitted. Completely hermetic local test bench.</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">LOCAL RUNTIME</span>
      </div>

      {/* Execution Pipeline (Horizontal Bar) */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Execution Pipeline
          </span>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {isRunning ? 'STATUS: EXECUTING' : 'STATUS: IDLE'}
          </span>
        </div>

        {/* 5 Horizontal Stages: REQUEST → FAILURE → RETRY → FALLBACK → RESULT */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isActive = stage.status === 'active';
            const isDegraded = stage.status === 'degraded';

            const stageIcons: Record<PipelineStageId, React.ReactNode> = {
              REQUEST: <Send className="w-4 h-4" />,
              FAILURE: <AlertCircle className="w-4 h-4" />,
              RETRY: <RotateCw className="w-4 h-4" />,
              FALLBACK: <Layers className="w-4 h-4" />,
              RESULT: <CheckCircle2 className="w-4 h-4" />
            };

            return (
              <div
                key={stage.id}
                className={`relative p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[var(--bg-elevated)] border-[var(--accent)] shadow-xs'
                    : isCompleted
                    ? 'bg-[var(--bg-panel)] border-[var(--accent)]/50'
                    : isDegraded
                    ? 'bg-[var(--bg-elevated)] border-[var(--text-muted)]'
                    : 'bg-[var(--bg-main)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-md ${
                      isActive || isCompleted
                        ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--accent)]/30'
                        : isDegraded
                        ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                        : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {stageIcons[stage.id]}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                      {stage.name}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {stage.subtext}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] pt-1 truncate">
                    {stage.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        {/* Preset Loaders */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-[var(--text-muted)] mr-1">Load Preset:</span>
          
          <button
            onClick={() => loadScenario('TIMEOUT')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all border cursor-pointer ${
              scenario === 'TIMEOUT'
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Load: Timeout (504)
          </button>

          <button
            onClick={() => loadScenario('RATE_LIMIT')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all border cursor-pointer ${
              scenario === 'RATE_LIMIT'
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Load: Rate Limit (429)
          </button>

          <button
            onClick={() => loadScenario('SERVER_ERROR')}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all border cursor-pointer ${
              scenario === 'SERVER_ERROR'
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--text-primary)]'
                : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            Load: Server Error (500)
          </button>
        </div>

        {/* Action Buttons: Reset & Run */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-[var(--btn-primary-text)] font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal-Style Event Log (Strict Monochrome + Sage Green) */}
      <div className="bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        {/* Terminal Header */}
        <div className="bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-mono font-medium text-[var(--text-primary)]">
              Terminal Event Log
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)]">
            <span>STDOUT / BUFFER</span>
            <span className="text-[var(--accent)] font-semibold">{logs.length} events</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 font-mono text-xs space-y-2 max-h-80 overflow-y-auto leading-relaxed">
          {logs.map((log, index) => {
            return (
              <div
                key={index}
                className="flex items-start gap-3 py-0.5 border-b border-[var(--border-subtle)]/40 last:border-0"
              >
                {/* Timestamp */}
                <span className="text-[var(--text-muted)] shrink-0 select-none text-[11px]">
                  {log.timestamp}
                </span>

                {/* Level Tag (Strict Monochrome + Sage, NO red/yellow/blue!) */}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'RESOLVED'
                      ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--accent)]/40'
                      : log.level === 'FAILURE'
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                      : log.level === 'RETRY'
                      ? 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                      : log.level === 'FALLBACK'
                      ? 'bg-[var(--bg-elevated)] text-[var(--accent)] border border-[var(--border-subtle)]'
                      : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                  }`}
                >
                  [{log.level}]
                </span>

                {/* Message */}
                <span className="text-[var(--text-primary)] flex-1">
                  {log.message}
                </span>

                {/* Optional latency or code indicator */}
                {log.latencyMs !== undefined && (
                  <span className="text-[var(--text-muted)] text-[10px] shrink-0 font-mono">
                    {log.latencyMs}ms
                  </span>
                )}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
