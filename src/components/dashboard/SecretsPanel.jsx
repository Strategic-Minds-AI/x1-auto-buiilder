import { Lock, CheckCircle, ExternalLink } from "lucide-react";

const SECRETS = [
  { name: "RAILWAY_API_TOKEN", service: "Railway", desc: "Token for Railway sandbox provisioning" },
  { name: "MY_PERSONAL_ACCESS_TOKEN", service: "GitHub", desc: "Personal access token for repository access" },
  { name: "XPS_VERCEL_TOKEN", service: "Vercel (XPS)", desc: "Vercel deploy token for XPS client" },
  { name: "XPS_VERCEL_TEAM_ID", service: "Vercel (XPS)", desc: "Vercel team ID for XPS client deployments" },
  { name: "ENGINE_API_KEY", service: "APEX Engine", desc: "API key for the APEX Universal Build Command engine" },
  { name: "ENGINE_URL", service: "APEX Engine", desc: "Base URL for the APEX engine endpoint" },
  { name: "GOOGLE_SHEET_ID", service: "Google Sheets", desc: "Sheet ID for onboarding data sync" },
  { name: "TWILIO_PHONE_NUMBER", service: "Twilio", desc: "Phone number for SMS communications" },
  { name: "TWILIO_AUTH_TOKEN", service: "Twilio", desc: "Auth token for Twilio API" },
  { name: "TWILIO_ACCOUNT_SID", service: "Twilio", desc: "Account SID for Twilio API" },
  { name: "VERCEL_TEAM_ID", service: "Vercel", desc: "Default Vercel team ID for deployments" },
  { name: "VERCEL_TOKEN", service: "Vercel", desc: "Default Vercel deploy token" },
  { name: "GPT_SYNC_API_KEY", service: "GPT Sync", desc: "API key for bi-directional ChatGPT sync" },
];

export default function SecretsPanel() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Environment Secrets</h2>
          <p className="text-sm text-slate-500">{SECRETS.length} secrets configured for backend functions and server routes. Values are encrypted and never displayed.</p>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start gap-3">
        <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-700 mb-0.5">Secret values are managed securely</p>
          <p className="text-xs text-amber-600">To add or update secret values, use the Secrets page in your app dashboard. Values are encrypted at rest and only accessible to backend functions at runtime via <code className="font-mono">process.env.SECRET_NAME</code>.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SECRETS.map((s) => (
          <div key={s.name} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono font-bold text-slate-700 truncate">{s.name}</div>
              <div className="text-[10px] text-slate-400">{s.service} — {s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}