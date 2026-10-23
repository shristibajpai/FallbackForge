const API_URL = "https://fallbackforge1.onrender.com";

export type ApiFailureType =
  | "timeout"
  | "rate_limit"
  | "server_error"
  | "invalid_response";

export type ApiFallbackStrategy =
  | "cached_response"
  | "secondary_provider"
  | "graceful_degradation"
  | "fail_safely";

export interface RecoveryPlanRequest {
  service_name: string;
  service_description: string;
  failure_type: ApiFailureType;
  max_retries: number;
  fallback_strategy: ApiFallbackStrategy;
  respect_retry_after: boolean;
}

export interface RecoverySimulationEvent {
  stage: string;
  status: string;
  message: string;
  attempt?: number;
  delay_seconds?: number;
}

export interface RecoveryPlanResponse {
  service_name: string;
  failure_type: ApiFailureType;
  diagnosis: string;
  recovery_plan: string;
  skill_loaded: boolean;
  ai_mode: "ollama_cloud" | "demo_mode";
  simulation: {
    simulated: boolean;
    outcome: "recovered" | "degraded" | "failed_safely";
    attempts: number;
    events: RecoverySimulationEvent[];
  };
}

export interface OllamaStatus {
  provider: string;
  model: string;
  url: string;
  api_key_configured: boolean;
}

export interface OllamaTestResult {
  connected: boolean;
  provider: string;
  model: string;
}

async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach FastAPI at ${API_URL}. Check that the backend is running.`,
        { cause: error },
      );
    }
    throw error;
  }
}

function isRecoveryPlanResponse(value: unknown): value is RecoveryPlanResponse {
  if (typeof value !== "object" || value === null) return false;

  const result = value as Record<string, unknown>;
  const simulation = result.simulation;
  const validFailureTypes: ApiFailureType[] = [
    "timeout",
    "rate_limit",
    "server_error",
    "invalid_response",
  ];
  if (
    typeof result.service_name !== "string" ||
    typeof result.failure_type !== "string" ||
    !validFailureTypes.includes(result.failure_type as ApiFailureType) ||
    typeof result.diagnosis !== "string" ||
    typeof result.recovery_plan !== "string" ||
    typeof result.skill_loaded !== "boolean" ||
    (result.ai_mode !== "ollama_cloud" && result.ai_mode !== "demo_mode") ||
    typeof simulation !== "object" ||
    simulation === null
  ) {
    return false;
  }

  const simulationResult = simulation as Record<string, unknown>;
  return (
    typeof simulationResult.simulated === "boolean" &&
    (simulationResult.outcome === "recovered" ||
      simulationResult.outcome === "degraded" ||
      simulationResult.outcome === "failed_safely") &&
    typeof simulationResult.attempts === "number" &&
    Array.isArray(simulationResult.events) &&
    simulationResult.events.every(
      (event: unknown) => {
        if (typeof event !== "object" || event === null) return false;
        const eventRecord = event as Record<string, unknown>;
        return (
          typeof eventRecord.stage === "string" &&
          typeof eventRecord.status === "string" &&
          typeof eventRecord.message === "string" &&
          (eventRecord.attempt === undefined ||
            typeof eventRecord.attempt === "number") &&
          (eventRecord.delay_seconds === undefined ||
            typeof eventRecord.delay_seconds === "number")
        );
      }
    )
  );
}

async function readApiError(response: Response): Promise<string> {
  const responseText = await response.text();
  if (!responseText) return `Request failed (HTTP ${response.status}).`;
  try {
    const body: unknown = JSON.parse(responseText);
    if (
      typeof body === "object" &&
      body !== null &&
      typeof (body as Record<string, unknown>).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    // Return the response text when the server does not return JSON.
  }
  return `Request failed (HTTP ${response.status}): ${responseText}`;
}

export async function getOllamaStatus(): Promise<OllamaStatus> {
  const response = await fetchBackend("/api/ollama/status");
  if (!response.ok) throw new Error(await readApiError(response));
  return response.json() as Promise<OllamaStatus>;
}

export async function testOllamaConnection(): Promise<OllamaTestResult> {
  const response = await fetchBackend("/api/ollama/test", {
    method: "POST",
  });
  if (!response.ok) throw new Error(await readApiError(response));
  return response.json() as Promise<OllamaTestResult>;
}

export async function generateRecoveryPlan(
  input: RecoveryPlanRequest,
): Promise<RecoveryPlanResponse> {
  const response = await fetchBackend("/api/recovery-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  const result: unknown = await response.json();
  if (!isRecoveryPlanResponse(result)) {
    throw new Error("The FastAPI server returned an unexpected recovery plan response.");
  }
  return result;
}
