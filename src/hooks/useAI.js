import { useCallback, useRef, useState } from "react";
import { AI_STATUS } from "@/lib/ai";

/**
 * Shared UI-state controller for every AI action.
 *
 * Guarantees the states the product standard requires —
 * IDLE → RUNNING → COMPLETE | FAILED | BLOCKED — and blocks duplicate
 * submission, so a double click can never fire two paid AI requests.
 *
 * usage:
 *   const ai = useAI();
 *   ai.run(() => probeAIModel());
 *   ai.status / ai.data / ai.error
 */
export function useAI() {
  const [status, setStatus] = useState(AI_STATUS.IDLE);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const run = useCallback(async (task) => {
    // Duplicate-submission guard: ignore while a request is already running.
    if (inFlight.current) return null;
    inFlight.current = true;
    setStatus(AI_STATUS.RUNNING);
    setError(null);
    setData(null);

    try {
      const result = await task();
      setData(result);
      setStatus(AI_STATUS.COMPLETE);
      return result;
    } catch (err) {
      // A missing key/prompt is a blocked action, not a runtime failure.
      const blocked = err?.code === "MISSING_PROMPT" || err?.status === 401 || err?.status === 403;
      setError({
        message: err?.message || "AI request failed",
        code: err?.code || "AI_REQUEST_FAILED",
        requested_model: err?.requested_model || null,
        attempts: err?.attempts || 0,
        errors: err?.errors || [],
      });
      setStatus(blocked ? AI_STATUS.BLOCKED : AI_STATUS.FAILED);
      return null;
    } finally {
      inFlight.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus(AI_STATUS.IDLE);
    setData(null);
    setError(null);
  }, []);

  return {
    status,
    data,
    error,
    run,
    reset,
    isRunning: status === AI_STATUS.RUNNING,
  };
}