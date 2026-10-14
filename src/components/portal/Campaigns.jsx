import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Rocket, ChevronDown, MapPin, RefreshCw, ExternalLink } from "lucide-react";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [sitesByCampaign, setSitesByCampaign] = useState({});
  const [loadingSites, setLoadingSites] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.LaunchCampaign.filter({}, { sort: "-created_date", limit: 50 });
      setCampaigns(res.items || []);
    } catch (e) {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (c) => {
    if (openId === c.id) {
      setOpenId(null);
      return;
    }
    setOpenId(c.id);
    if (!sitesByCampaign[c.id]) {
      setLoadingSites({ ...loadingSites, [c.id]: true });
      try {
        const res = await base44.entities.WebsiteProject.filter({ campaign_id: c.id }, { limit: 100 });
        setSitesByCampaign({ ...sitesByCampaign, [c.id]: res.items || [] });
      } catch (e) {
        setSitesByCampaign({ ...sitesByCampaign, [c.id]: [] });
      } finally {
        setLoadingSites({ ...loadingSites, [c.id]: false });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" /> Campaigns
          </h2>
          <p className="text-muted-foreground mt-1">Mass-launch campaigns and their generated location-tailored websites.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Rocket className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No campaigns yet. Launch one from the Mass Launch tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <button onClick={() => toggle(c)} className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition">
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${c.status === "complete" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {c.sites_generated || 0}
                  </span>
                  <div>
                    <div className="font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.industry} · {c.locations?.length || 0} markets</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full text-xs font-semibold px-3 py-1 ${c.status === "complete" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {c.status}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition ${openId === c.id ? "rotate-180" : ""}`} />
                </div>
              </button>

              {openId === c.id && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.locations?.map((loc) => (
                      <span key={loc} className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">{loc}</span>
                    ))}
                  </div>
                  {loadingSites[c.id] ? (
                    <div className="flex justify-center py-6">
                      <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : (sitesByCampaign[c.id] || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sites found for this campaign.</p>
                  ) : (
                    <div className="space-y-2">
                      {(sitesByCampaign[c.id] || []).map((p) => (
                        <div key={p.id} className="rounded-xl border border-border p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-semibold text-foreground">{p.location}</span>
                          </div>
                          <div className="text-sm font-display font-bold text-foreground">{p.content?.hero?.headline}</div>
                          <div className="text-xs text-muted-foreground">{p.content?.hero?.subheadline}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}