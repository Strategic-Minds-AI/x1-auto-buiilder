import { useState, useMemo } from "react";
import { US_STATES, citiesForState } from "@/data/usLocations";
import { MapPin, CheckSquare, Square, ChevronDown, ChevronRight, Search } from "lucide-react";

export default function LocationPicker({ selected, onChange }) {
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState("");

  const allStateCodes = US_STATES.map((s) => s.code);
  const allSelected = allStateCodes.every((code) =>
    citiesForState(code).every((city) => selected.includes(city))
  );

  const toggleState = (state) => {
    const cities = citiesForState(state.code);
    const allCitiesSelected = cities.every((c) => selected.includes(c));
    if (allCitiesSelected) {
      onChange(selected.filter((c) => !cities.includes(c)));
    } else {
      const merged = Array.from(new Set([...selected, ...cities]));
      onChange(merged);
    }
  };

  const toggleCity = (city) => {
    onChange(selected.includes(city) ? selected.filter((c) => c !== city) : [...selected, city]);
  };

  const selectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      const all = US_STATES.flatMap((s) => citiesForState(s.code));
      onChange(all);
    }
  };

  const toggleExpand = (code) => setExpanded({ ...expanded, [code]: !expanded[code] });

  const filteredStates = useMemo(() => {
    if (!query.trim()) return US_STATES;
    const q = query.toLowerCase();
    return US_STATES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Target Locations
        </div>
        <button
          onClick={selectAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:brightness-110 transition"
        >
          {allSelected ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
          {allSelected ? "Deselect All" : "Select All States"}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search states..."
            className="dd-input pl-10"
          />
        </div>
        <span className="text-sm font-bold text-primary whitespace-nowrap">{selected.length} selected</span>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {filteredStates.map((state) => {
          const cities = citiesForState(state.code);
          const selectedCities = cities.filter((c) => selected.includes(c));
          const allCitySelected = selectedCities.length === cities.length;
          const isExpanded = expanded[state.code];

          return (
            <div key={state.code} className="rounded-lg border border-border">
              <div className="flex items-center gap-2 px-3 py-2">
                <button onClick={() => toggleState(state)} className="shrink-0">
                  {allCitySelected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={() => toggleExpand(state.code)}
                  className="flex-1 flex items-center gap-1.5 text-sm font-semibold text-left text-foreground hover:text-primary transition"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {state.name}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({selectedCities.length}/{cities.length})
                  </span>
                </button>
                {isExpanded && (
                  <button
                    onClick={() => toggleState(state)}
                    className="text-xs text-primary hover:underline"
                  >
                    {allCitySelected ? "Clear" : "All"}
                  </button>
                )}
              </div>
              {isExpanded && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => toggleCity(city)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        selected.includes(city)
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-background/60 text-muted-foreground border border-border hover:text-foreground"
                      }`}
                    >
                      {city.replace(", " + state.code, "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}