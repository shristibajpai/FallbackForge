from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .ollama_client import (
    OLLAMA_MODEL,
    OLLAMA_URL,
    OllamaConfigurationError,
    OllamaRequestError,
    generate_recovery_plan,
    is_ollama_configured,
    test_ollama_connection,
)
from .recovery import simulate_recovery


BASE_DIR = Path(__file__).resolve().parent.parent
SKILL_PATH = BASE_DIR / "skills" / "api-recovery" / "SKILL.md"

app = FastAPI(
    title="FallbackForge API",
    description="AI-powered API failure recovery planner",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


FailureType = Literal[
    "timeout",
    "rate_limit",
    "server_error",
    "invalid_response",
]

FallbackStrategy = Literal[
    "cached_response",
    "secondary_provider",
    "graceful_degradation",
    "fail_safely",
]


class RecoveryRequest(BaseModel):
    service_name: str = Field(min_length=1, max_length=100)
    service_description: str = Field(default="", max_length=1000)
    failure_type: FailureType
    max_retries: int = Field(default=3, ge=0, le=5)
    fallback_strategy: FallbackStrategy = "cached_response"
    respect_retry_after: bool = True


class RecoveryResponse(BaseModel):
    service_name: str
    failure_type: str
    diagnosis: str
    recovery_plan: str
    skill_loaded: bool
    ai_mode: str
    simulation: dict


def load_skill() -> str:
    """Load the reusable API recovery instructions."""
    if not SKILL_PATH.exists():
        return ""
    return SKILL_PATH.read_text(encoding="utf-8")


@app.get("/")
def root():
    return {
        "name": "FallbackForge API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "skill_available": SKILL_PATH.exists(),
    }


@app.get("/api/ollama/status")
def ollama_status():
    return {
        "provider": "Ollama Cloud",
        "model": OLLAMA_MODEL,
        "url": OLLAMA_URL,
        "api_key_configured": is_ollama_configured(),
    }


@app.post("/api/ollama/test")
def ollama_test():
    try:
        test_ollama_connection()
    except OllamaConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except OllamaRequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "connected": True,
        "provider": "Ollama Cloud",
        "model": OLLAMA_MODEL,
    }


@app.post("/api/recovery-plan", response_model=RecoveryResponse)
def create_recovery_plan(request: RecoveryRequest):
    skill_text = load_skill()

    try:
        plan_result = generate_recovery_plan(
            service_name=request.service_name,
            service_description=request.service_description,
            failure_type=request.failure_type,
            max_retries=request.max_retries,
            fallback_strategy=request.fallback_strategy,
            respect_retry_after=request.respect_retry_after,
            skill_instructions=skill_text,
        )

        if isinstance(plan_result, dict):
            diagnosis = str(
                plan_result.get("diagnosis", "Failure analysis completed.")
            )
            recovery_plan = str(
                plan_result.get("recovery_plan")
                or plan_result.get("plan")
                or plan_result
            )
            ai_mode = str(plan_result.get("ai_mode", "ollama_cloud"))
        else:
            diagnosis = f"Detected failure type: {request.failure_type}."
            recovery_plan = str(plan_result)
            ai_mode = "ollama_cloud"

    except (OllamaConfigurationError, OllamaRequestError) as exc:
        diagnosis = (
            f"Ollama Cloud plan generation failed: {exc} "
            f"The service encountered a {request.failure_type.replace('_', ' ')} "
            "failure."
        )
        recovery_plan = (
            f"Use {request.max_retries} maximum retries with exponential "
            f"backoff, then apply the '{request.fallback_strategy}' fallback. "
            "Review service logs before changing production retry behavior."
        )
        ai_mode = "demo_mode"
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Recovery plan generation failed unexpectedly.",
        ) from exc

    try:
        simulation = simulate_recovery(
            failure_type=request.failure_type,
            max_retries=request.max_retries,
            fallback_strategy=request.fallback_strategy,
            respect_retry_after=request.respect_retry_after,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Recovery simulation failed: {exc}",
        ) from exc

    return RecoveryResponse(
        service_name=request.service_name,
        failure_type=request.failure_type,
        diagnosis=diagnosis,
        recovery_plan=recovery_plan,
        skill_loaded=bool(skill_text),
        ai_mode=ai_mode,
        simulation=simulation,
    )
