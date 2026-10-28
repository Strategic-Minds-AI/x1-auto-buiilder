import { Cpu, Loader2, PlayCircle, CheckCircle2, AlertCircle, Ban, RefreshCw } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { probeAIModel, AI_SOL_MODEL, AI_STATUS } from "@/lib/ai";

const STATE_STYLES = {
  [AI_STATUS.IDLE]: "bg-slate-100 text-slate-600",
  [AI_STATUS.RUNNING]: "bg-sky-100 text-sky-700",
  [AI_STATUS.COMPLETE]: "bg-emerald-100 text-emerald-700",
  [AI_STATUS.FAILED]: "bg-red-100 text-red-700",
  [AI_STATUS.BLOCKED]: "bg-amber-100 text-amber-700",
};

/**
 * Live proof surface for the central AI gateway.
 * Makes one real InvokeLLM round-trip and reports the model that actually
 * served it — never assumes the requested model succeeded.
 */
export default function AIGatewayPanel() {
  const ai = useAI();

  const runProbe = () => ai.run(() => probeAIModel({ model: AI_SOL_MODEL }));

  const outcome = ai.data;
  const servedByRequested = outcome?.actual_model === outcome?.requested_model;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#00d4ff]" />
          <div>
            <h3 className="text-sm font-black text-slate-900">AI Gateway</h3>
            <p className="text-xs text-slate-500">
              Native Base44 InvokeLLM — preferred model{" "}
              <span className="font-mono font-semibold text-slate-700">{AI_SOL_MODEL}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide ${STATE_STYLES[ai.status]}`}>
            {ai.status}
          </span>
          <button
            onClick={runProbe}
            disabled={ai.isRunning}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {ai.isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
            {ai.isRunning ? "Calling model..." : outcome ? "Run again" : "Run live test"}
          </button>
        </div>
      </div>

      {ai.status === AI_STATUS.IDLE && (
        <p className="text-sm text-slate-400">
          No request has been made in this session. Run the test to send one real prompt through the gateway.
        </p>
      )}

      {ai.status === AI_STATUS.RUNNING && (
        <div className="flex items-center gap-3 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
          <span className="text-sm font-semibold text-sky-800">
            Request in flight — waiting for the model to respond…
          </span>
        </div>
      )}

      {ai.status === AI_STATUS.COMPLETE && outcome && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Requested" value={outcome.requested_model} mono />
            <Field label="Served by" value={outcome.actual_model} mono />
            <Field label="Attempts" value={String(outcome.attempts)} />
            <Field label="Elapsed" value={`${outcome.elapsed_ms} ms`} />
          </div>

          <div
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 ${
              servedByRequested ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            {servedByRequested ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            <span className={`text-sm font-semibold ${servedByRequested ? "text-emerald-800" : "text-amber-800"}`}>
              {servedByRequested
                ? `${outcome.requested_model} answered on the first attempt (status ${outcome.status}).`
                : `Fallback in use: requested ${outcome.requested_model}, served by ${outcome.actual_model} (status ${outcome.status}).`}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Structured response
            </div>
            <pre className="text-xs text-emerald-300 font-mono overflow-x-auto">
              {JSON.stringify(outcome.result, null, 2)}
            </pre>
          </div>

          {outcome.errors?.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                Failed attempts before success
              </div>
              {outcome.errors.map((e, i) => (
                <div key={i} className="text-xs text-amber-800 font-mono">
                  {e.model} → {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(ai.status === AI_STATUS.FAILED || ai.status === AI_STATUS.BLOCKED) && ai.error && (
        <div
          className={`rounded-xl border p-4 ${
            ai.status === AI_STATUS.BLOCKED ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {ai.status === AI_STATUS.BLOCKED ? (
              <Ban className="w-4 h-4 text-amber-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span
              className={`text-sm font-bold ${ai.status === AI_STATUS.BLOCKED ? "text-amber-800" : "text-red-700"}`}
            >
              {ai.status === AI_STATUS.BLOCKED ? "Blocked before the model was called" : "Request failed"}
            </span>
          </div>
          <p className="text-xs text-slate-700 break-words">{ai.error.message}</p>
          {ai.error.requested_model && (
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              requested: {ai.error.requested_model} · attempts: {ai.error.attempts}
            </p>
          )}
          {ai.error.errors?.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {ai.error.errors.map((e, i) => (
                <div key={i} className="text-[11px] text-slate-600 font-mono break-words">
                  {e.model} → {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`text-xs font-bold text-slate-800 truncate ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}