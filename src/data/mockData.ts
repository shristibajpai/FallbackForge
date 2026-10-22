import { AgentSkillData, FailureType, FallbackStrategy, HistoryRecord, RecoveryPlan, RecoveryPlanConfig } from '../types';

export const INITIAL_SKILL_DATA: AgentSkillData = {
  id: 'api-recovery',
  name: 'api-recovery',
  filePath: 'skills/api-recovery/SKILL.md',
  version: '1.2.0',
  runtime: 'Ollama Gemma 2 (Local)',
  status: 'LOADED_VERIFIED',
  purpose: 'Automated failure classification and fault-tolerant recovery planning when upstream APIs degrade, timeout, rate-limit, or encounter fatal internal exceptions.',
  workflowSteps: [
    {
      step: 1,
      name: 'Diagnosis & Error Fingerprinting',
      description: 'Extract HTTP status codes (429, 500, 502, 503, 504), error response bodies, TCP timeouts, or connection reset flags.'
    },
    {
      step: 2,
      name: 'Retry Policy Formulation',
      description: 'Compute optimal retry limits, exponential backoff base factor (T = B * 2^n), jitter randomization (+-25%), and inspect Retry-After headers.'
    },
    {
      step: 3,
      name: 'Fallback Strategy Selection',
      description: 'Select appropriate degradation mechanisms: Stale-While-Revalidate cache read, Circuit breaker trip, Secondary replica mirror failover, or Dead-Letter replay.'
    },
    {
      step: 4,
      name: 'Safeguard Verification',
      description: 'Evaluate downstream cascade risks, retry storms, thundering herds, and cache stampede vulnerabilities.'
    },
    {
      step: 5,
      name: 'Implementation Synthesis',
      description: 'Emit production-ready Python (httpx / tenacity / aiohttp) resilient wrapper code with telemetry hooks.'
    }
  ],
  rawMarkdown: `---
name: "api-recovery"
description: >
  Systematic API failure diagnosis, resilient retry policy calculation, circuit breaker
  configuration, and fallback orchestration for distributed services.
version: "1.2.0"
runtime: "ollama-gemma"
status: "active"
---

# API Recovery & Resilience Skill

## Purpose
Provides automated failure classification and fault-tolerant recovery planning when upstream APIs degrade, timeout, rate-limit, or encounter fatal internal exceptions.

## Workflow Steps
1. **Diagnosis & Error Fingerprinting**: Extract HTTP status codes (429, 500, 502, 503, 504), error response bodies, TCP timeouts, or connection reset flags.
2. **Retry Policy Formulation**: Compute optimal retry limits, exponential backoff base factor (T = B * 2^n), jitter randomization (+-25%), and inspect Retry-After headers.
3. **Fallback Strategy Selection**: Select appropriate degradation mechanisms:
   - Stale-While-Revalidate cache read
   - Circuit breaker trip with graceful default payload
   - Secondary replica mirror failover
   - Queued asynchronous dead-letter replay
4. **Safeguard Verification**: Evaluate downstream cascade risks, retry storms, thundering herds, and cache stampede vulnerabilities.
5. **Implementation Synthesis**: Emit production-ready Python (httpx / tenacity / aiohttp) resilient wrapper code with telemetry hooks.

## Invariant Rules
- Never retry non-idempotent unsafe requests without request-idempotency tokens.
- Always include randomized jitter to prevent thundering herds on rate-limited endpoints.
- Clamp maximum backoff ceiling to prevent infinite worker thread starvation.`
};

export const INITIAL_HISTORY_RECORDS: HistoryRecord[] = [
  {
    id: 'rec-1082',
    timestamp: '2026-10-22 09:14:02',
    serviceName: 'Stripe Billing Webhook Relay',
    failureType: '429 Rate Limit (Too Many Requests)',
    strategy: 'Exponential Backoff + Full Jitter',
    result: 'RECOVERED',
    retriesUsed: 3,
    latencyMs: 1420,
    planSummary: 'Respected Retry-After header with full decorrelated jitter. Target endpoint drained backlog without secondary 429 burst.'
  },
  {
    id: 'rec-1081',
    timestamp: '2026-10-22 08:45:19',
    serviceName: 'Search Elastic Cluster Ingestion',
    failureType: '504 Gateway Timeout',
    strategy: 'Circuit Breaker (Half-Open Probe)',
    result: 'CIRCUIT_OPEN',
    retriesUsed: 2,
    latencyMs: 5040,
    planSummary: 'Gateway timed out over 5000ms threshold. Breaker transitioned to OPEN state, serving local read-only Lucene index snapshot.'
  },
  {
    id: 'rec-1080',
    timestamp: '2026-10-22 07:11:54',
    serviceName: 'GeoIP Resolver Cluster',
    failureType: '503 Service Unavailable',
    strategy: 'Secondary Mirror Failover',
    result: 'FAILOVER_SUCCESS',
    retriesUsed: 1,
    latencyMs: 380,
    planSummary: 'Primary GeoIP cluster unreachable during rolling maintenance. Switched seamlessly to eu-west replica mirror.'
  },
  {
    id: 'rec-1079',
    timestamp: '2026-10-21 22:30:10',
    serviceName: 'User Profile Cache Invalidator',
    failureType: '500 Internal Server Error',
    strategy: 'Stale Cache Degradation',
    result: 'DEGRADED_CACHE',
    retriesUsed: 2,
    latencyMs: 620,
    planSummary: 'Core database cluster threw serialization deadlock. Served stale cache with max-age 300s header while queuing replay.'
  },
  {
    id: 'rec-1078',
    timestamp: '2026-10-21 18:02:45',
    serviceName: 'Inventory Count Sync API',
    failureType: 'Connection Refused (ECONNREFUSED)',
    strategy: 'Asynchronous Dead Letter Queue',
    result: 'DEGRADED_CACHE',
    retriesUsed: 4,
    latencyMs: 290,
    planSummary: 'Downstream port 8443 refused TCP handshake. Pushed delta payloads into RabbitMQ dead-letter exchange with 600s TTL.'
  }
];

export function generateRecoveryPlan(config: RecoveryPlanConfig, isDemo: boolean = true): RecoveryPlan {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const planId = 'pln-' + Math.random().toString(36).substring(2, 8);

  let diagnosisText = '';
  let impactSev: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'HIGH';
  let isIdempotent = true;
  let headerNote = 'No rate limit headers found in 5xx payload.';
  let recommendedSummary = '';
  let codeSnippet = '';

  if (config.failureType.includes('429')) {
    diagnosisText = `Upstream service rejected traffic due to exceeding sliding rate limit token bucket. Continuing immediate retries will exacerbate rate limiting and increase IP penalty lockouts.`;
    impactSev = 'HIGH';
    isIdempotent = true;
    headerNote = config.respectRetryAfter 
      ? 'Inspect `Retry-After` header (seconds or RFC 2822 date) and honor upstream backoff constraint.'
      : 'Bypassing `Retry-After` header inspection; falling back to local decorrelated exponential backoff.';
    recommendedSummary = 'Implement exponential backoff with randomized jitter to break thundering herd synchronization. Enforce client-side rate throttling.';
    codeSnippet = `import time
import random
import httpx
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type

class RateLimitException(Exception):
    def __init__(self, retry_after: int = 1):
        self.retry_after = retry_after

def should_retry_status(response: httpx.Response) -> bool:
    return response.status_code == 429

class ResilientClient:
    def __init__(self, base_url: str, max_retries: int = ${config.maxRetries}):
        self.client = httpx.Client(base_url=base_url, timeout=10.0)
        self.max_retries = max_retries

    def execute_with_fallback(self, endpoint: str, payload: dict) -> dict:
        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.client.post(endpoint, json=payload)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 429:
                    ${config.respectRetryAfter 
                      ? 'retry_after = int(response.headers.get("Retry-After", 2 ** attempt))'
                      : 'retry_after = (2 ** attempt) + random.uniform(0.1, 0.5)'}
                    # Backoff with jitter
                    jitter = random.uniform(0.1, 0.8)
                    sleep_time = min(retry_after + jitter, 30.0)
                    time.sleep(sleep_time)
                else:
                    response.raise_for_status()
            except httpx.RequestError as exc:
                if attempt == self.max_retries:
                    return self._execute_fallback(endpoint, payload, exc)
                time.sleep((2 ** attempt) + random.uniform(0.1, 0.5))
        
        return self._execute_fallback(endpoint, payload, "Max retries exhausted")

    def _execute_fallback(self, endpoint: str, payload: dict, reason: any) -> dict:
        # Fallback Strategy: ${config.fallbackStrategy}
        return {
            "status": "DEGRADED",
            "fallback_applied": "${config.fallbackStrategy}",
            "service": "${config.serviceName}",
            "cached": True,
            "error_detail": str(reason)
        }`;
  } else if (config.failureType.includes('504')) {
    diagnosisText = `Gateway timeout indicates downstream worker pool exhaustion or slow database transaction locking. Upstream proxy cut connection after configured ingress timeout threshold.`;
    impactSev = 'CRITICAL';
    isIdempotent = false;
    headerNote = 'Proxy gateway closed connection without upstream processing confirmation. Non-idempotent writes must not retry blindly.';
    recommendedSummary = 'Employ Circuit Breaker with 3 consecutive timeout trips to prevent cascading thread starvation in the calling application.';
    codeSnippet = `import httpx
import time
from typing import Optional

class CircuitBreakerOpenException(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_time: float = 30.0):
        self.failure_threshold = failure_threshold
        self.recovery_time = recovery_time
        self.failure_count = 0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
        self.last_failure_time = 0.0

    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def allow_request(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_time:
                self.state = "HALF_OPEN"
                return True
            return False
        return True  # HALF_OPEN allows single probe

cb = CircuitBreaker(failure_threshold=3, recovery_time=20.0)

def call_service_with_timeout_protection(url: str, timeout_seconds: float = 3.0):
    if not cb.allow_request():
        return {"status": "CIRCUIT_OPEN", "fallback": "Serving stale cache"}

    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                cb.record_success()
                return resp.json()
            cb.record_failure()
    except (httpx.TimeoutException, httpx.RequestError):
        cb.record_failure()

    # Fallback response
    return {"status": "DEGRADED", "cached_at": time.time(), "source": "local_fallback"}`;
  } else if (config.failureType.includes('500') || config.failureType.includes('503')) {
    diagnosisText = `Upstream node encountered unhandled internal crash or maintenance drain. Service node is temporarily unable to satisfy incoming traffic.`;
    impactSev = 'CRITICAL';
    isIdempotent = true;
    headerNote = 'Check for custom X-Maintenance-Mode or Retry-After headers in response envelope.';
    recommendedSummary = 'Switch to secondary mirror replica or serve stale cached schema to preserve user interface continuity.';
    codeSnippet = `import httpx
import time

PRIMARY_URL = "https://api.internal.service/v1"
MIRROR_URL = "https://eu-mirror.internal.service/v1"

def resilient_fetch(endpoint: str, max_retries: int = ${config.maxRetries}):
    client = httpx.Client(timeout=5.0)
    
    # Attempt Primary
    for attempt in range(max_retries):
        try:
            res = client.get(f"{PRIMARY_URL}/{endpoint}")
            if res.status_code == 200:
                return res.json()
        except httpx.HTTPError:
            time.sleep(0.5 * (2 ** attempt))
            
    # Failover to secondary mirror
    try:
        res = client.get(f"{MIRROR_URL}/{endpoint}")
        if res.status_code == 200:
            return {"status": "MIRROR_SUCCESS", "data": res.json()}
    except Exception as e:
        pass
        
    return {"status": "DEGRADED", "fallback": "Local stale payload"}`;
  } else {
    diagnosisText = `Socket connection rejected at kernel transport layer. Destination host is down, port is closed, or network partition has occurred.`;
    impactSev = 'CRITICAL';
    isIdempotent = true;
    headerNote = 'No HTTP headers returned. Operating system ECONNREFUSED socket error.';
    recommendedSummary = 'Enqueue requests to asynchronous dead letter buffer with alerting dispatch. Prevent synchronous UI block.';
    codeSnippet = `import json
import logging

class DeadLetterQueue:
    def __init__(self):
        self.buffer = []

    def enqueue(self, service: str, payload: dict):
        self.buffer.append({"service": service, "payload": payload, "ts": time.time()})
        logging.warning("Dispatched to DLQ: %s", service)

dlq = DeadLetterQueue()

def safe_dispatch(payload: dict):
    try:
        # socket attempt
        raise ConnectionRefusedError("Target host unreachable")
    except ConnectionRefusedError:
        dlq.enqueue("${config.serviceName}", payload)
        return {"status": "QUEUED_DLQ", "retryable": True}`;
  }

  return {
    id: planId,
    createdAt: timestamp,
    serviceName: config.serviceName || 'Target Service API',
    failureType: config.failureType,
    fallbackStrategy: config.fallbackStrategy,
    maxRetries: config.maxRetries,
    respectRetryAfter: config.respectRetryAfter,
    aiMode: isDemo ? 'Deterministic Engine (Demo)' : 'Ollama Gemma 2',
    diagnosis: {
      rootCause: diagnosisText,
      impactSeverity: impactSev,
      idempotentSafe: isIdempotent,
      headerInspection: headerNote
    },
    recommendedStrategy: {
      name: config.fallbackStrategy,
      summary: recommendedSummary,
      expectedRecoveryRate: '98.4%',
      tradeoff: 'Slight increase in read latency during backoff calculation; eliminates upstream cascade failure.'
    },
    retryPolicy: {
      backoffFormula: `delay = min(max_delay, base_delay * (2 ^ attempt)) +- jitter`,
      baseDelayMs: 250,
      maxDelayMs: 8000,
      jitterStrategy: 'Full Decorrelated Jitter (+-25%)',
      circuitTripThreshold: 3
    },
    fallbackPlan: {
      mode: config.fallbackStrategy,
      cacheTtlSeconds: 300,
      degradedResponsePayload: JSON.stringify({
        status: 'DEGRADED_SERVICED',
        service: config.serviceName || 'core-api',
        timestamp: timestamp,
        cached_source: 'l1-memory-store'
      }, null, 2),
      recoveryTrigger: '3 consecutive HTTP 200 responses through half-open health probe.'
    },
    risksAndSafeguards: [
      {
        risk: 'Thundering Herd on Recovery',
        safeguard: 'Enforce randomized uniform jitter (+-25%) on all retry intervals.'
      },
      {
        risk: 'Thread/Worker Starvation',
        safeguard: 'Strict 5000ms global timeout per request with asynchronous worker suspension.'
      },
      {
        risk: 'Duplicate Processing on Non-Idempotent Writes',
        safeguard: 'Mandatory UUIDv4 idempotency keys in request headers (X-Idempotency-Key).'
      }
    ],
    checklist: [
      { id: 'c1', label: 'Verify target endpoint idempotency guarantees before retrying', checked: true },
      { id: 'c2', label: 'Configure randomized jitter distribution to prevent retry storms', checked: true },
      { id: 'c3', label: 'Set strict connection and read timeouts on client instances', checked: true },
      { id: 'c4', label: 'Provision circuit breaker trip alert in observability metrics', checked: false },
      { id: 'c5', label: 'Define valid fallback response schema for degraded mode', checked: false }
    ],
    pythonCode: codeSnippet
  };
}
