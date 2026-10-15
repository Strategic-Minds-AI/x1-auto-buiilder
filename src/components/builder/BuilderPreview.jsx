import { Monitor, Smartphone, Tablet, Loader2, Globe } from "lucide-react";

export default function BuilderPreview({ project, previewMode, onModeChange, loading }) {
  const content = project?.content || {};
  const businessName = project?.business_name || "Your Business";
  const industry = project?.industry || "";

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const renderHero = () => {
    const hero = content.hero || content.homepage?.hero || {};
    return (
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-700 text-white py-20 px-8 text-center">
        <h1 className="text-4xl font-black mb-3">{hero.headline || hero.title || `${businessName}`}</h1>
        <p className="text-lg text-white/70 mb-6 max-w-xl mx-auto">{hero.subheadline || hero.subtitle || `Professional ${industry} services`}</p>
        <button className="bg-[#00d4ff] text-[#0a0e14] font-bold px-6 py-3 rounded-full">{hero.cta || "Get Started"}</button>
      </div>
    );
  };

  const renderServices = () => {
    const services = content.services || [];
    if (!services.length) return null;
    return (
      <div className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-black text-center mb-10 text-slate-800">Our Services</h2>
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.slice(0, 6).map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#00d4ff]/10 flex items-center justify-center mx-auto mb-3 text-[#00d4ff] font-bold text-lg">{i + 1}</div>
              <h3 className="font-bold text-slate-800 mb-1">{s.title || s.name || `Service ${i + 1}`}</h3>
              <p className="text-sm text-slate-500">{s.description || s.desc || ""}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAbout = () => {
    const about = content.about || {};
    if (!about.title && !about.body) return null;
    return (
      <div className="py-16 px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4 text-slate-800">{about.title || "About Us"}</h2>
          <p className="text-slate-600 leading-relaxed">{about.body || about.content || ""}</p>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    const contact = content.contact || {};
    if (!contact.phone && !contact.email) return null;
    return (
      <div className="py-16 px-8 bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-6">Get In Touch</h2>
          <div className="flex justify-center gap-8 text-sm">
            {contact.phone && <div><div className="text-white/50 text-xs mb-1">Call Us</div><div className="font-bold">{contact.phone}</div></div>}
            {contact.email && <div><div className="text-white/50 text-xs mb-1">Email Us</div><div className="font-bold">{contact.email}</div></div>}
            {contact.address && <div><div className="text-white/50 text-xs mb-1">Visit Us</div><div className="font-bold">{contact.address}</div></div>}
          </div>
          <button className="mt-8 bg-[#00d4ff] text-[#0a0e14] font-bold px-6 py-3 rounded-full">Contact Today</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Preview header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-600 truncate max-w-[200px]">
            {project ? `${businessName}` : "No project selected"}
          </span>
          {project?.deploy_url && (
            <a href={project.deploy_url} target="_blank" className="text-xs text-[#00d4ff] hover:underline truncate max-w-[150px]">{project.deploy_url}</a>
          )}
        </div>
        {/* Device toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { mode: "desktop", icon: Monitor },
            { mode: "tablet", icon: Tablet },
            { mode: "mobile", icon: Smartphone },
          ].map(({ mode, icon: Icon }) => (
            <button key={mode} onClick={() => onModeChange(mode)}
              className={`p-1.5 rounded-md transition ${previewMode === mode ? "bg-white text-[#00d4ff] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto flex justify-center p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : !project ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Monitor className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-400 mb-1">No project selected</p>
            <p className="text-xs text-slate-400">Select a project or ask the AI to generate one</p>
          </div>
        ) : (
          <div className="bg-white shadow-lg transition-all duration-200" style={{ width: deviceWidths[previewMode], maxWidth: "100%" }}>
            {renderHero()}
            {renderServices()}
            {renderAbout()}
            {renderContact()}
            <div className="py-6 px-8 bg-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}