export type ScreenId = 'overview' | 'planner' | 'simulator' | 'history' | 'skills' | 'settings';

export type FailureType = 
  | '429 Rate Limit (Too Many Requests)'
  | '504 Gateway Timeout'
  | '500 Internal Server Error'
  | '503 Service Unavailable'
  | 'Connection Refused (ECONNREFUSED)';

export type FallbackStrategy = 
  | 'Exponential Backoff + Full Jitter'
  | 'Stale Cache Degradation'
  | 'Circuit Breaker (Half-Open Probe)'
  | 'Secondary Mirror Failover'
  | 'Asynchronous Dead Letter Queue';

export interface RecoveryPlanConfig {
  serviceName: string;
  serviceDescription: string;
  failureType: FailureType;
  maxRetries: number;
  fallbackStrategy: FallbackStrategy;
  respectRetryAfter: boolean;
}

export interface RecoveryPlan {
  id: string;
  createdAt: string;
  serviceName: string;
  failureType: FailureType;
  fallbackStrategy: FallbackStrategy;
  maxRetries: number;
  respectRetryAfter: boolean;
  aiMode: 'Ollama Gemma 2' | 'Deterministic Engine (Demo)';
  diagnosis: {
    rootCause: string;
    impactSeverity: 'CRITICAL' | 'HIGH' | 'MODERATE';
    idempotentSafe: boolean;
    headerInspection: string;
  };
  recommendedStrategy: {
    name: string;
    summary: string;
    expectedRecoveryRate: string;
    tradeoff: string;
  };
  retryPolicy: {
    backoffFormula: string;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterStrategy: string;
    circuitTripThreshold: number;
  };
  fallbackPlan: {
    mode: string;
    cacheTtlSeconds: number;
    degradedResponsePayload: string;
    recoveryTrigger: string;
  };
  risksAndSafeguards: {
    risk: string;
    safeguard: string;
  }[];
  checklist: {
    id: string;
    label: string;
    checked: boolean;
  }[];
  pythonCode: string;
}

export type PipelineStageId = 'REQUEST' | 'FAILURE' | 'RETRY' | 'FALLBACK' | 'RESULT';

export type StageStatus = 'pending' | 'active' | 'completed' | 'degraded';

export interface PipelineStage {
  id: PipelineStageId;
  name: string;
  subtext: string;
  status: StageStatus;
  detail: string;
}

export interface SimulatorLog {
  timestamp: string;
  level: 'REQUEST' | 'FAILURE' | 'RETRY' | 'FALLBACK' | 'RESOLVED';
  message: string;
  code?: number | string;
  latencyMs?: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  serviceName: string;
  failureType: FailureType;
  strategy: FallbackStrategy;
  result: 'RECOVERED' | 'DEGRADED_CACHE' | 'CIRCUIT_OPEN' | 'FAILOVER_SUCCESS';
  retriesUsed: number;
  latencyMs: number;
  planSummary: string;
}

export interface AgentSkillData {
  id: string;
  name: string;
  filePath: string;
  version: string;
  runtime: string;
  status: 'LOADED_VERIFIED' | 'UNLOADED';
  purpose: string;
  workflowSteps: {
    step: number;
    name: string;
    description: string;
  }[];
  rawMarkdown: string;
}

export interface SettingsConfig {
  ollamaConnected: boolean;
  ollamaModel: string;
  ollamaUrl: string;
  demoMode: boolean;
  activeTheme: string;
  theme: 'dark' | 'light';
  lastTestedAt: string | null;
}

