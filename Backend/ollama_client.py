import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"), override=True)

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
OLLAMA_URL = os.getenv("OLLAMA_URL", "https://ollama.com/api/chat").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4")
REQUEST_TIMEOUT_SECONDS = 90


class OllamaConfigurationError(RuntimeError):
    """Raised when the Ollama Cloud credentials are not configured."""


class OllamaRequestError(RuntimeError):
    """Raised when Ollama Cloud cannot complete a request."""


def is_ollama_configured() -> bool:
    return bool(OLLAMA_API_KEY and OLLAMA_API_KEY.strip())


def _request_chat(messages: list[dict], *, test_connection: bool = False) -> str:
    if not is_ollama_configured():
        raise OllamaConfigurationError(
            "Ollama Cloud is not configured. Set OLLAMA_API_KEY in Backend/.env."
        )

    payload = {
        "model": OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
    }
    if test_connection:
        payload["options"] = {"num_predict": 8}

    try:
        response = requests.post(
            OLLAMA_URL,
            headers={
                "Authorization": f"Bearer {OLLAMA_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        content = response.json().get("message", {}).get("content", "").strip()
    except requests.Timeout as exc:
        raise OllamaRequestError("Ollama Cloud request timed out.") from exc
    except requests.RequestException as exc:
        status_code = getattr(getattr(exc, "response", None), "status_code", None)
        if status_code in (401, 403):
            raise OllamaRequestError(
                "Ollama Cloud rejected the API key. Check OLLAMA_API_KEY in Backend/.env."
            ) from exc
        if status_code is not None:
            raise OllamaRequestError(
                f"Ollama Cloud returned HTTP {status_code}."
            ) from exc
        raise OllamaRequestError("Could not connect to Ollama Cloud.") from exc
    except (ValueError, AttributeError) as exc:
        raise OllamaRequestError(
            "Ollama Cloud returned an invalid response."
        ) from exc

    if not content:
        raise OllamaRequestError("Ollama Cloud returned an empty response.")
    return content


def generate_recovery_plan(
    service_name: str,
    service_description: str,
    failure_type: str,
    max_retries: int,
    fallback_strategy: str,
    respect_retry_after: bool,
    skill_instructions: str = "",
) -> dict:
    prompt = f"""
Analyze this API failure and recommend a safe recovery plan.

Service: {service_name}
Description: {service_description or "Not provided"}
Failure type: {failure_type}
Maximum retries: {max_retries}
Fallback strategy: {fallback_strategy}
Respect Retry-After: {respect_retry_after}

Recovery skill instructions:
{skill_instructions or "No skill file was found."}

Include:
1. Failure diagnosis
2. Recommended recovery actions
3. Retry guidance
4. Fallback plan
5. Risks and safeguards
6. A recovery checklist
7. Suggested Python implementation

Do not claim that a recovery action was executed.
"""
    recovery_plan = _request_chat(
        [{"role": "user", "content": prompt}],
    )
    return {
        "diagnosis": f"Analyzed {failure_type.replace('_', ' ')} for {service_name}.",
        "recovery_plan": recovery_plan,
        "ai_mode": "ollama_cloud",
    }


def test_ollama_connection() -> None:
    _request_chat(
        [{"role": "user", "content": "Reply with OK."}],
        test_connection=True,
    )
