import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Database, Users, LayoutGrid, Table } from "lucide-react";

export default function DashboardNav({ activeSection, onSectionChange, activeEntity, onEntitySelect, entities }) {
  const [search, setSearch] = useState("");
  const [dataExpanded, setDataExpanded] = useState(true);

  const filtered = entities.filter((e) => e.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        <NavItem icon={LayoutGrid} label="Overview" active={activeSection === "overview"} onClick={() => onSectionChange("overview")} />
        <NavItem icon={Users} label="App Users" active={activeSection === "users"} onClick={() => onSectionChange("users")} />

        {/* Data section — expandable */}
        <button
          onClick={() => setDataExpanded(!dataExpanded)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700 transition"
        >
          {dataExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Database className="w-3.5 h-3.5" /> Data
        </button>

        {dataExpanded && (
          <div className="ml-2 space-y-0.5">
            {filtered.map((entity) => (
              <button
                key={entity}
                onClick={() => onEntitySelect(entity)}
                className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  activeEntity === entity
                    ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                    : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-800"
                }`}
              >
                <Table className={`w-3 h-3 shrink-0 ${activeEntity === entity ? "text-[#00d4ff]" : "text-slate-400"}`} />
                <span className="truncate">{entity}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-2.5 py-1.5 text-xs text-slate-400">No tables found</div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-800"
      }`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#00d4ff]" : "text-slate-400"}`} />
      {label}
    </button>
  );
}