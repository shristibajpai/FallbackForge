from typing import Literal


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


def simulate_recovery(
    failure_type: FailureType,
    max_retries: int = 3,
    fallback_strategy: FallbackStrategy = "cached_response",
    respect_retry_after: bool = True,
) -> dict:
    """Simulate recovery deterministically without calling a real API."""
    max_retries = max(0, min(max_retries, 5))
    events = [
        {
            "stage": "request",
            "status": "succeeded",
            "message": "Simulated request started.",
        },
        {
            "stage": "failure",
            "status": "failed",
            "message": f"Simulated {failure_type.replace('_', ' ')} failure.",
            "failure_type": failure_type,
        },
    ]

    for attempt in range(1, max_retries + 1):
        message = f"Retry attempt {attempt}/{max_retries} failed."
        if failure_type == "rate_limit" and respect_retry_after:
            message += " Respect Retry-After before the next real retry."
        events.append(
            {
                "stage": "retry",
                "status": "failed",
                "attempt": attempt,
                "message": message,
                "delay_seconds": min(2 ** (attempt - 1), 30),
            }
        )

    if fallback_strategy == "cached_response":
        fallback_message = "Returned a simulated cached response."
        outcome = "recovered"
    elif fallback_strategy == "secondary_provider":
        fallback_message = "Simulated switching to a secondary provider."
        outcome = "recovered"
    elif fallback_strategy == "graceful_degradation":
        fallback_message = "Returned a reduced-functionality response."
        outcome = "degraded"
    else:
        fallback_message = "Stopped safely without returning fabricated data."
        outcome = "failed_safely"

    events.extend(
        [
            {
                "stage": "fallback",
                "status": "succeeded" if outcome != "failed_safely" else "skipped",
                "strategy": fallback_strategy,
                "message": fallback_message,
            },
            {
                "stage": "result",
                "status": outcome,
                "message": "Simulation completed. No real API was called.",
            },
        ]
    )

    return {
        "simulated": True,
        "failure_type": failure_type,
        "max_retries": max_retries,
        "attempts": max_retries,
        "fallback_strategy": fallback_strategy,
        "outcome": outcome,
        "events": events,
    }
