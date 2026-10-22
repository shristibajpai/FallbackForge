---
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
2. **Retry Policy Formulation**: Compute optimal retry limits, exponential backoff base factor ($T = B \cdot 2^{n}$), jitter randomization ($\pm 25\%$), and inspect `Retry-After` headers.
3. **Fallback Strategy Selection**: Select appropriate degradation mechanisms:
   - Stale-While-Revalidate cache read
   - Circuit breaker trip with graceful default payload
   - Secondary replica mirror failover
   - Queued asynchronous dead-letter replay
4. **Safeguard Verification**: Evaluate downstream cascade risks, retry storms, thundering herds, and cache stampede vulnerabilities.
5. **Implementation Synthesis**: Emit production-ready Python (`httpx` / `tenacity` / `aiohttp`) resilient wrapper code with telemetry hooks.

## Invariant Rules
- Never retry non-idempotent unsafe requests without request-idempotency tokens.
- Always include randomized jitter to prevent thundering herds on rate-limited endpoints.
- Clamp maximum backoff ceiling to prevent infinite worker thread starvation.
