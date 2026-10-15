// 50 visually distinct desktop app layout renderers.
// Each function takes ctx (brand config) and returns HTML for a unique layout.
import { ctxd, nav, logo, feedItem, ln, lines, kpi, card, bar, pill, chip, btn, avatar, FS } from "./layoutHelpers.js";

const D = {};

// 1. sidebar-workspace
D["sidebar-workspace"] = (ctx) => nav(ctx, "Dashboard") +
  `<div style="flex:1;display:flex;min-height:0"><div class="vg-side"><div class="i on">▦</div><div class="i">▤</div><div class="i">◍</div><div class="i">◷</div><div class="i">⚙</div></div>
  <div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div class="vg-row vg-between" style="margin-bottom:10px"><div><div style="${FS(14)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(9)}">${ctx.subtitle}</div></div>${btn("+ New")}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">${kpi("1,284","Active")}${kpi("$48.2k","Revenue")}${kpi("96%","Uptime")}</div>
  <div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:6px">Recent activity</div><div class="vg-feed">${feedItem(ctx.brandName+" updated","2h ago")}${feedItem("New lead captured","5h ago",60)}</div></div></div></div>`;

// 2. topnav-workspace
D["topnav-workspace"] = (ctx) => {
  const cards = [["Sprint 14","12 tasks · 3 done",40],["Onboarding","8 tasks · 6 done",75],["Q4 Campaign","5 tasks · 1 done",20],[ctx.brandName,"6 tasks · 4 done",66]];
  return nav(ctx, "Overview", ["Overview","Objects","Reports","Settings"]) +
  `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div class="vg-row vg-between" style="margin-bottom:10px"><div><div style="${FS(14)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(9)}">${ctx.subtitle}</div></div>${btn("+ Create")}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${cards.map(c=>`<div class="vg-card"><div style="${FS(10)};font-weight:700">${c[0]}</div><div class="vg-muted" style="${FS(9)};margin-top:3px">${c[1]}</div>${bar(c[2])}</div>`).join("")}</div></div>`;
};

// 3. data-table
D["data-table"] = (ctx) => {
  const rows = [[ctx.brandName,"Sarah K.","Active","$12,400"],["Northwind Co.","Daniel R.","Pending","$3,200"],["Blue Ocean LLC","Maya P.","Active","$8,750"],["Vertex Labs","Sarah K.","Won","$21,000"],["Harbor Group","Daniel R.","Pending","$5,600"]];
  return nav(ctx, "Records", ["Records","People","Settings"]) +
  `<div style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="vg-row vg-gap2" style="padding:8px 12px;border-bottom:1px solid var(--brand-border)">${chip("Filter: Active")}${chip("Type",false)}<div style="flex:1"></div>${btn("Export",false)}</div>
  <div class="vg-table vg-scroll" style="flex:1;overflow:auto"><div class="h"><span>Name</span><span>Owner</span><span>Status</span><span>Value</span></div>${rows.map(r=>`<div class="r"><span>${r[0]}</span><span class="vg-muted">${r[1]}</span><span>${pill(r[2],r[2]==="Won"||r[2]==="Active")}</span><span>${r[3]}</span></div>`).join("")}</div></div>`;
};

// 4. analytics-dashboard
D["analytics-dashboard"] = (ctx) => {
  const bars = [38,52,44,61,55,72,68,80,74,88,82,95].map(h=>`<i style="height:${h}%"></i>`).join("");
  return nav(ctx, "Analytics", ["Overview","Drilldown","Export"]) +
  `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">${kpi("$48.2k","Revenue")}${kpi("1,284","Visitors")}${kpi("3.9%","Convert")}${kpi("62","Leads")}</div>
  <div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:8px">${ctx.heading}</div><div class="vg-chart">${bars}</div></div></div>`;
};

// 5. kanban-board
D["kanban-board"] = (ctx) => {
  const cols = [["Backlog",5,["Design review","API spec","Q4 plan"]],["In Progress",3,["Auth flow","Dashboard"]],["Review",2,["Onboarding"]],["Done",8,["Launch","SEO audit"]]];
  return nav(ctx, "Board", ["Board","List","Reports"]) + `<div style="flex:1;min-height:0"><div class="vg-kanban">${cols.map(c=>`<div class="col"><div class="head"><span>${c[0]}</span><span>${c[1]}</span></div>${c[2].map(t=>`<div class="card"><div class="t">${t}</div><div class="m">Due Fri</div><span class="tag">P1</span></div>`).join("")}</div>`).join("")}</div></div>`;
};

// 6. email-hub
D["email-hub"] = (ctx) => {
  const folders = ["Inbox","Sent","Drafts","Archive","Spam"]; const msgs = [["Sarah K.","Re: Q4 plan","10:24"],["Daniel R.","Invoice #441","9:02"],["Maya P.","Design review","Yest."],["System","Weekly digest","Mon"]];
  return nav(ctx, "Inbox", ["Mail","Calendar","Contacts"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-side" style="width:46px;padding:8px 0;gap:6px">${folders.map((f,i)=>`<div class="i ${i===0?"on":""}" title="${f}">${f[0]}</div>`).join("")}</div>
  <div style="flex:1;min-width:0;border-right:1px solid var(--brand-border)" class="vg-scroll">${msgs.map((m,i)=>`<div style="display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-bottom:1px solid var(--brand-border);${i===0?"background:var(--brand-muted)":""}"><span style="${FS(10)};font-weight:700">${m[0]}</span><span style="${FS(9)}">${m[1]}</span><span class="vg-muted" style="${FS(8)}">${m[2]}</span></div>`).join("")}</div>
  <div style="flex:1.5;min-width:0;padding:12px" class="vg-scroll"><div style="${FS(12)};font-weight:900">Re: Q4 plan</div><div class="vg-muted" style="${FS(9)};margin-top:2px">Sarah K. · 10:24</div><div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">${lines(3)}</div>${btn("Reply")}</div></div>`;
};

// 7. file-manager
D["file-manager"] = (ctx) => {
  const folders = ["All","Images","Docs","Videos","Shared"]; const files = [["Report-Q4.pdf","pdf"],["logo-final.png","img"],["roadmap.docx","doc"],["demo.mp4","vid"],["invoice-441.pdf","pdf"],["team.jpg","img"],["spec.xlsx","xls"],["notes.md","doc"]];
  const ic = k => ({pdf:"▤",img:"◳",doc:"▤",vid:"▶",xls:"▦"}[k]||"▤");
  return nav(ctx, "Files", ["Files","Recent","Shared"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-side" style="width:46px;padding:8px 0;gap:6px">${folders.map((f,i)=>`<div class="i ${i===0?"on":""}" title="${f}">${f[0]}</div>`).join("")}</div>
  <div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div class="vg-row vg-between" style="margin-bottom:10px"><div style="${FS(13)};font-weight:900">${ctx.heading}</div>${btn("Upload")}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${files.map(f=>`<div class="vg-card" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px"><div style="width:34px;height:34px;border-radius:8px;background:rgba(0,89,255,.12);color:var(--brand-gold-deep);display:flex;align-items:center;justify-content:center"><span style="${FS(15)}">${ic(f[1])}</span></div><div style="${FS(9)};font-weight:700;text-align:center;word-break:break-all">${f[0]}</div><div class="vg-muted" style="${FS(8)}">${f[1].toUpperCase()}</div></div>`).join("")}</div></div></div>`;
};

// 8. calendar-week
D["calendar-week"] = (ctx) => {
  const days = ["Mon","Tue","Wed","Thu","Fri"]; const evts = [[0,"Standup"],[1,"Demo"],[2,"1:1"],[3,"Review"],[1,"Launch"],[4,"Sync"]];
  return nav(ctx, "Week", ["Day","Week","Month"]) + `<div style="flex:1;display:flex;min-height:0;flex-direction:column"><div class="vg-row" style="border-bottom:1px solid var(--brand-border);flex:none">${days.map(d=>`<div style="flex:1;padding:7px;text-align:center;${FS(9)};font-weight:700;border-right:1px solid var(--brand-border)">${d}</div>`).join("")}</div>
  <div style="flex:1;display:flex;min-height:0">${days.map((_,di)=>`<div style="flex:1;border-right:1px solid var(--brand-border);position:relative;padding:6px;overflow:hidden">${evts.filter(e=>e[0]===di).map((e,i)=>`<div style="background:${i%2?"var(--brand-gold-deep)":"var(--brand-primary)"};color:#fff;border-radius:6px;padding:4px 6px;margin-bottom:4px;${FS(8)};font-weight:700">${e[1]}</div>`).join("")}<div style="position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(var(--brand-border) 1px,transparent 1px);background-size:100% 22px;opacity:.4"></div></div>`).join("")}</div></div>`;
};

// 9. gantt-timeline
D["gantt-timeline"] = (ctx) => {
  const tasks = [["Discovery",0,2],["Design",1,3],["Backend",2,5],["Frontend",3,4],["QA",5,2],["Launch",6,1]]; const cols = 8;
  return nav(ctx, "Roadmap", ["Board","Timeline","Reports"]) + `<div class="vg-scroll" style="flex:1;overflow:auto;padding:10px"><div class="vg-row" style="margin-bottom:8px;padding-left:76px">${Array.from({length:cols},(_,i)=>`<div style="flex:1;text-align:center;${FS(8)};font-weight:700;color:var(--brand-muted-foreground)">W${i+1}</div>`).join("")}</div>${tasks.map(t=>`<div class="vg-row" style="margin-bottom:6px;align-items:center"><div style="width:70px;${FS(9)};font-weight:700;padding-right:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t[0]}</div><div style="flex:1;position:relative;height:14px;background:var(--brand-muted);border-radius:5px;overflow:hidden"><div style="position:absolute;left:${t[1]/cols*100}%;width:${t[2]/cols*100}%;top:0;bottom:0;background:linear-gradient(90deg,var(--brand-primary),var(--brand-gold-bright));border-radius:5px"></div></div></div>`).join("")}</div>`;
};

// 10. form-builder
D["form-builder"] = (ctx) => {
  const fields = [["Project name","text"],["Description","area"],["Priority","select"],["Due date","date"],["Assignee","text"]];
  return nav(ctx, "Form", ["Build","Preview","Responses"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-side" style="width:46px;padding:8px 0;gap:6px"><div class="i on">▤</div><div class="i">◍</div><div class="i">◷</div><div class="i">⚙</div></div>
  <div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="${FS(13)};font-weight:900;margin-bottom:10px">${ctx.heading}</div>${fields.map((f,i)=>`<div style="margin-bottom:10px"><label style="${FS(9)};font-weight:700">${f[0]}</label>${f[1]==="area"?`<div style="margin-top:4px;height:44px;border:1px solid var(--brand-border);border-radius:8px;background:var(--brand-muted)"></div>`:`<div style="margin-top:4px;height:30px;border:1px solid var(--brand-border);border-radius:8px;background:var(--brand-muted);display:flex;align-items:center;padding:0 10px;${FS(9)};color:var(--brand-muted-foreground)">${i===0?ctx.brandName:f[0]+"…"}</div>`}</div>`).join("")}${btn("Save")}</div></div>`;
};

// 11. team-chat
D["team-chat"] = (ctx) => {
  const chans = ["#general","#design","#eng","#sales","#random"]; const msgs = [["Sarah K.","Shipped the new dashboard 🎉",true],["Daniel R.","Nice — metrics look great",false],["Maya P.","Pushing the style pass now",false],["Sarah K.","Reviewing after lunch",true]];
  return nav(ctx, "Chat", ["Threads","DMs","Calls"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-side" style="width:46px;padding:8px 0;gap:6px">${chans.map((c,i)=>`<div class="i ${i===0?"on":""}" title="${c}">${c[1]}</div>`).join("")}</div>
  <div class="vg-scroll" style="flex:1;overflow:auto;padding:10px"><div style="${FS(11)};font-weight:900;margin-bottom:8px">#general</div>${msgs.map(m=>`<div style="display:flex;gap:7px;margin-bottom:9px"><div class="vg-avatar" style="align-self:flex-end"></div><div><div class="vg-row vg-gap2" style="align-items:baseline"><span style="${FS(9)};font-weight:700">${m[0]}</span><span class="vg-muted" style="${FS(8)}">10:2${m[2]?"4":"7"}</span></div><div style="${FS(10)};background:${m[2]?"var(--brand-primary)":"var(--brand-surface)"};color:${m[2]?"var(--brand-on-primary)":"var(--brand-text)"};border:1px solid var(--brand-border);border-radius:10px;padding:6px 9px;display:inline-block;margin-top:2px">${m[1]}</div></div></div>`).join("")}<div style="margin-top:8px;display:flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid var(--brand-border);border-radius:9999px;background:var(--brand-muted)"><span class="vg-muted" style="${FS(9)}">Message #general</span><div style="flex:1"></div><span style="${FS(11)}">➤</span></div></div></div>`;
};

// 12. funnel-view
D["funnel-view"] = (ctx) => {
  const stages = [["Visitors",12480,100],["Sign-ups",4920,39],["Activated",2100,17],["Paid",620,5]];
  return nav(ctx, "Funnel", ["Overview","Breakdown","Export"]) + `<div class="vg-scroll" style="flex:1;overflow:auto;padding:12px"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">${kpi("$48.2k","Revenue")}${kpi("3.9%","Convert")}${kpi("62","Leads")}</div>
  <div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:8px">Conversion funnel</div>${stages.map((s,i)=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:64px;${FS(9)};font-weight:700">${s[0]}</div><div style="flex:1;height:22px;background:var(--brand-muted);border-radius:6px;overflow:hidden"><div style="height:100%;width:${s[2]}%;background:linear-gradient(90deg,var(--brand-gold-light),var(--brand-primary) ${30+i*20}%,var(--brand-gold-deep))"></div></div><div style="width:50px;text-align:right;${FS(9)};font-weight:700">${s[1].toLocaleString()}</div></div>`).join("")}</div></div>`;
};

// 13. inventory-grid
D["inventory-grid"] = (ctx) => {
  const items = [["Widget A",124,"In stock"],["Widget B",8,"Low"],["Widget C",0,"Out"],["Gadget X",320,"In stock"],["Gadget Y",42,"Low"],["Part 7",210,"In stock"]];
  return nav(ctx, "Inventory", ["Stock","Orders","Suppliers"]) + `<div class="vg-scroll" style="flex:1;overflow:auto"><div class="vg-row vg-gap2" style="padding:8px 12px;border-bottom:1px solid var(--brand-border)">${chip("All locations")}${chip("Low stock",false)}<div style="flex:1"></div>${btn("Export",false)}</div><div class="vg-table"><div class="h"><span>Item</span><span>On hand</span><span>Status</span><span>Reorder</span></div>${items.map(it=>`<div class="r"><span>${it[0]}</span><span class="vg-muted">${it[1]}</span><span>${chip(it[2],it[2]==="In stock")}</span><span>${it[2]==="Out"?btn("Order"):"—"}</span></div>`).join("")}</div></div>`;
};

// 14. helpdesk-queue
D["helpdesk-queue"] = (ctx) => {
  const tickets = [["#441","Login broken","Sarah K.","Urgent"],["#440","Billing question","Daniel R.","Open"],["#439","Feature request","Maya P.","Pending"],["#438","Bug: export","Sarah K.","Resolved"]];
  return nav(ctx, "Tickets", ["Queue","Mine","Closed"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-scroll" style="flex:1;overflow:auto">${tickets.map((t,i)=>`<div style="display:flex;flex-direction:column;gap:3px;padding:9px 12px;border-bottom:1px solid var(--brand-border);${i===0?"background:var(--brand-muted)":""}"><div class="vg-row vg-between"><span style="${FS(10)};font-weight:700">${t[0]} · ${t[1]}</span>${chip(t[3],t[3]==="Urgent")}</div><div class="vg-muted" style="${FS(8)}">${t[2]} · 2h ago</div></div>`).join("")}</div>
  <div style="flex:1.2;min-width:0;border-left:1px solid var(--brand-border);padding:12px" class="vg-scroll"><div style="${FS(12)};font-weight:900">#441 · Login broken</div><div class="vg-muted" style="${FS(9)};margin-top:2px">Sarah K. · Urgent</div><div class="vg-card" style="margin-top:10px">${lines(3)}</div><div class="vg-row vg-gap2" style="margin-top:10px">${btn("Resolve")}${btn("Assign",false)}</div></div></div>`;
};

// 15. pivot-table
D["pivot-table"] = (ctx) => {
  const cols = ["Region","Q1","Q2","Q3","Q4","Total"]; const rows = [["North","12.4","18.2","21.0","24.6","76.2"],["South","9.1","11.4","14.8","17.2","52.5"],["East","15.0","16.6","19.4","22.1","73.1"],["West","7.8","10.2","12.9","15.0","45.9"]];
  return nav(ctx, "Pivot", ["Table","Chart","Export"]) + `<div class="vg-scroll" style="flex:1;overflow:auto;padding:12px"><div class="vg-row vg-gap2" style="margin-bottom:10px">${chip("Rows: Region")}${chip("Cols: Quarter",false)}${chip("Val: Revenue",false)}</div><div class="vg-card" style="padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:1.3fr repeat(4,1fr) 1fr;${FS(9)}">${cols.map(c=>`<div style="padding:7px 9px;font-weight:700;background:var(--brand-muted);border-bottom:1px solid var(--brand-border)">${c}</div>`).join("")}${rows.flatMap(r=>r.map((cell,ci)=>`<div style="padding:7px 9px;border-bottom:1px solid var(--brand-border);${ci===0?"font-weight:700":""};${ci===5?"font-weight:800;color:var(--brand-primary)":""}">${cell}</div>`)).join("")}</div></div></div>`;
};

// 16. onboarding-wizard
D["onboarding-wizard"] = (ctx) => {
  const steps = ["Workspace","Team","Integrations","Review"];
  return nav(ctx, "Setup", ["Setup","Skip"]) + `<div style="flex:1;display:flex;min-height:0"><div style="width:120px;border-right:1px solid var(--brand-border);padding:12px;flex:none"><div class="vg-flow">${steps.map((s,i)=>`<div class="step ${i===1?"on":""}"><div class="n">${i+1}</div><div class="t" style="${FS(10)}">${s}</div></div>`).join("")}</div></div>
  <div class="vg-scroll" style="flex:1;overflow:auto;padding:14px"><div style="${FS(14)};font-weight:900">Invite your team</div><div class="vg-muted" style="${FS(10)};margin-top:2px">Step 2 of 4</div><div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">${["sarah@atlas.co","daniel@atlas.co"].map(e=>`<div style="display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid var(--brand-border);border-radius:8px;background:var(--brand-muted)"><div class="vg-avatar"></div><span style="${FS(10)}">${e}</span><div style="flex:1"></div>${chip("Admin")}</div>`).join("")}<div style="display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px dashed var(--brand-border);border-radius:8px"><span class="vg-muted" style="${FS(10)}">+ Add email…</span></div></div><div class="vg-row vg-gap2" style="margin-top:14px">${btn("Back",false)}${btn("Continue")}</div></div></div>`;
};

// 17. agent-console
D["agent-console"] = (ctx) => {
  const agents = [["Orchestrator","Running","12 runs"],["Lead Scraper","Idle","—"],["Validator","Running","3 checks"],["Provisioner","Paused","—"]];
  const log = ["[10:24:01] orchestrator: dispatched generatePlan","[10:24:03] validator: schema PASS","[10:24:05] provisioner: dry-run queued","[10:24:08] orchestrator: run #441 complete"];
  return nav(ctx, "Agents", ["Agents","Runs","Logs"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-scroll" style="flex:1;overflow:auto;padding:10px">${agents.map(a=>`<div class="vg-card" style="margin-bottom:7px;display:flex;align-items:center;gap:8px"><div style="width:30px;height:30px;border-radius:8px;background:rgba(0,89,255,.12);color:var(--brand-gold-deep);display:flex;align-items:center;justify-content:center"><span style="${FS(12)}">◍</span></div><div style="flex:1;min-width:0"><div style="${FS(10)};font-weight:700">${a[0]}</div><div class="vg-muted" style="${FS(8)}">${a[2]}</div></div>${chip(a[1],a[1]==="Running")}</div>`).join("")}</div>
  <div style="flex:1.1;min-width:0;border-left:1px solid var(--brand-border);padding:10px" class="vg-scroll"><div style="${FS(10)};font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand-muted-foreground);margin-bottom:6px">Live log</div><div style="font-family:var(--font-mono);${FS(9)};line-height:1.6">${log.map(l=>`<div style="color:var(--brand-muted-foreground)">${l.replace(/([a-z]+):/,'<span style="color:var(--brand-primary);font-weight:700">$1:</span>')}</div>`).join("")}</div></div></div>`;
};

// 18. split-editor
D["split-editor"] = (ctx) => {
  return nav(ctx, "Editor", ["Code","Preview","Terminal"]) + `<div style="flex:1;display:flex;min-height:0"><div style="flex:1;border-right:1px solid var(--brand-border);font-family:var(--font-mono);${FS(10)};padding:10px;overflow:auto" class="vg-scroll"><div style="color:var(--brand-muted-foreground)">1  import { ctx.brandName } from "./app"</div><div>2  export default function() {</div><div>3  <span style="color:var(--brand-primary)">const</span> [data, setData] = useState()</div><div>4  <span style="color:var(--brand-primary)">return</span> &lt;div&gt;{data}&lt;/div&gt;</div><div>5  }</div></div>
  <div style="flex:1;padding:12px" class="vg-scroll"><div style="${FS(12)};font-weight:900;margin-bottom:8px">${ctx.heading}</div><div class="vg-card">${lines(4)}</div><div style="margin-top:8px">${btn("Run")}</div></div></div>`;
};

// 19. master-detail
D["master-detail"] = (ctx) => {
  const items = [["Project Alpha","Active","72%"],["Project Beta","On Hold","34%"],["Project Gamma","Active","91%"],["Project Delta","Review","58%"]];
  return nav(ctx, "Projects", ["All","Active","Archive"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-scroll" style="width:200px;border-right:1px solid var(--brand-border);flex:none">${items.map((it,i)=>`<div style="padding:10px 12px;border-bottom:1px solid var(--brand-border);${i===0?"background:var(--brand-muted)":""}"><div style="${FS(10)};font-weight:700">${it[0]}</div><div class="vg-row vg-between" style="margin-top:4px"><span class="vg-muted" style="${FS(8)}">${it[1]}</span><span style="${FS(8)};font-weight:700;color:var(--brand-primary)">${it[2]}</span></div></div>`).join("")}</div>
  <div style="flex:1;padding:14px" class="vg-scroll"><div style="${FS(14)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(10)};margin-top:2px">${ctx.subtitle}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">${kpi("72%","Complete")}${kpi("12d","Remaining")}</div><div class="vg-card" style="margin-top:10px"><div style="${FS(10)};font-weight:700;margin-bottom:6px">Timeline</div>${lines(4)}</div></div></div>`;
};

// 20. widget-grid
D["widget-grid"] = (ctx) => {
  const bars = [40,65,50,80,60,90,70,85].map(h=>`<i style="height:${h}%"></i>`).join("");
  return nav(ctx, "Dashboard", ["Overview","Detail","Export"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;margin-bottom:8px"><div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:8px">${ctx.heading}</div><div class="vg-chart">${bars}</div></div><div style="display:grid;grid-template-rows:1fr 1fr;gap:8px">${kpi("$48.2k","Revenue")}${kpi("62","Leads")}</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${kpi("1,284","Visitors")}${kpi("3.9%","Convert")}${kpi("96%","Uptime")}</div></div>`;
};

// 21. card-masonry
D["card-masonry"] = (ctx) => {
  const cards = [["Revenue","$48.2k this month","+12% vs last",true],["New Users","1,284 signups","+8% growth",false],["Churn","2.1%","-0.3% improved",false],["NPS Score","72","Above target",true],["Active","96% uptime","All systems go",false],["Tasks","42 open","12 due today",false]];
  return nav(ctx, "Overview", ["Cards","Table","Chart"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="columns:2;column-gap:8px">${cards.map(c=>`<div class="vg-card" style="break-inside:avoid;margin-bottom:8px;${c[3]?"border-left:3px solid var(--brand-primary)":""}"><div style="${FS(10)};font-weight:700">${c[0]}</div><div style="${FS(16)};font-weight:900;margin:4px 0">${c[1]}</div><div class="vg-muted" style="${FS(9)}">${c[2]}</div></div>`).join("")}</div></div>`;
};

// 22. timeline-feed
D["timeline-feed"] = (ctx) => {
  const events = [["10:24","Sarah K.","Created project",true],["09:15","Daniel R.","Updated settings",false],["08:42","System","Backup complete",false],["08:01","Maya P.","Approved design",true]];
  return nav(ctx, "Activity", ["Feed","Calendar","Archive"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="position:relative;padding-left:20px"><div style="position:absolute;left:6px;top:0;bottom:0;width:2px;background:var(--brand-border)"></div>${events.map(e=>`<div style="position:relative;margin-bottom:16px"><div style="position:absolute;left:-20px;top:4px;width:10px;height:10px;border-radius:9999px;background:${e[3]?"var(--brand-primary)":"var(--brand-muted)"};border:2px solid var(--brand-surface)"></div><div class="vg-muted" style="${FS(8)}">${e[0]}</div><div style="${FS(10)};font-weight:700">${e[2]}</div><div class="vg-muted" style="${FS(9)}">${e[1]}</div></div>`).join("")}</div></div>`;
};

// 23. gallery-grid
D["gallery-grid"] = (ctx) => {
  const cells = Array.from({length:12},(_,i)=>`<div style="border-radius:8px;background:linear-gradient(${135+i*30}deg,var(--brand-muted),var(--brand-surface));aspect-ratio:${i%3===0?"16/9":"1"};display:flex;align-items:center;justify-content:center"><span class="vg-muted" style="${FS(9)}">${i+1}</span></div>`);
  return nav(ctx, "Gallery", ["Grid","List","Slideshow"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div class="vg-row vg-between" style="margin-bottom:10px"><div style="${FS(13)};font-weight:900">${ctx.heading}</div><div class="vg-row vg-gap2">${chip("All")}${chip("Recent",false)}</div></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${cells.join("")}</div></div>`;
};

// 24. settings-panel
D["settings-panel"] = (ctx) => {
  const sections = [["General",["Workspace name","Default language","Timezone"]],["Security",["Two-factor auth","API keys","Sessions"]],["Billing",["Plan","Payment method","Invoices"]]];
  return nav(ctx, "Settings", ["General","Security","Billing"]) + `<div style="flex:1;display:flex;min-height:0"><div style="width:140px;border-right:1px solid var(--brand-border);padding:10px;flex:none">${sections.map((s,i)=>`<div style="padding:8px 10px;border-radius:8px;${i===0?"background:var(--brand-muted)":""};${FS(10)};font-weight:700;margin-bottom:4px">${s[0]}</div>`).join("")}</div>
  <div class="vg-scroll" style="flex:1;padding:14px;overflow:auto"><div style="${FS(13)};font-weight:900;margin-bottom:12px">${ctx.heading}</div>${sections[0][1].map(f=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--brand-border)"><span style="${FS(10)};font-weight:700">${f}</span><div style="width:32px;height:18px;border-radius:9999px;background:var(--brand-primary);position:relative"><div style="position:absolute;right:2px;top:2px;width:14px;height:14px;border-radius:9999px;background:#fff"></div></div></div>`).join("")}</div></div>`;
};

// 25. map-dashboard
D["map-dashboard"] = (ctx) => {
  const pins = [[30,40],[65,25],[45,70],[75,55]];
  return nav(ctx, "Map", ["Map","List","Analytics"]) + `<div style="flex:1;display:flex;min-height:0"><div style="flex:1;position:relative;background:linear-gradient(135deg,#e6f0ff,#cfe0ff);overflow:hidden"><div style="position:absolute;inset:0;background-image:linear-gradient(var(--brand-border) 1px,transparent 1px),linear-gradient(90deg,var(--brand-border) 1px,transparent 1px);background-size:28px 28px;opacity:.6"></div>${pins.map(p=>`<div style="position:absolute;left:${p[0]}%;top:${p[1]}%;width:12px;height:12px;border-radius:9999px;background:var(--brand-primary);box-shadow:0 0 0 6px rgba(0,89,255,.2)"></div>`).join("")}</div>
  <div style="width:200px;border-left:1px solid var(--brand-border);padding:12px;flex:none" class="vg-scroll"><div style="${FS(10)};font-weight:700;margin-bottom:8px">Locations</div>${["Downtown","Uptown","Westside","Eastside"].map(l=>`<div class="vg-card" style="margin-bottom:6px;padding:8px"><div style="${FS(9)};font-weight:700">${l}</div><div class="vg-muted" style="${FS(8)}">42 visits</div></div>`).join("")}</div></div>`;
};

// 26. chart-fullscreen
D["chart-fullscreen"] = (ctx) => {
  const bars = Array.from({length:24},(_,i)=>`<i style="height:${30+((i*37)%65)}%"></i>`).join("");
  return nav(ctx, "Chart", ["24h","7d","30d"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div class="vg-row vg-between" style="margin-bottom:10px"><div><div style="${FS(14)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(9)}">${ctx.subtitle}</div></div><div class="vg-row vg-gap2">${chip("24h")}${chip("7d",false)}${chip("30d",false)}</div></div><div class="vg-card" style="height:200px"><div class="vg-chart" style="height:100%;align-items:flex-end">${bars}</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:10px">${kpi("$48.2k","Revenue")}${kpi("1,284","Visitors")}${kpi("3.9%","Convert")}${kpi("62","Leads")}</div></div>`;
};

// 27. comparison-table
D["comparison-table"] = (ctx) => {
  const plans = [["Starter","$0"],["Pro","$49"],["Enterprise","Custom"]]; const features = [["Projects","3","Unlimited","Unlimited"],["Members","5","25","Unlimited"],["Storage","1GB","50GB","1TB"],["Support","Email","Priority","Dedicated"]];
  return nav(ctx, "Compare", ["Plans","Features"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="${FS(13)};font-weight:900;margin-bottom:10px">${ctx.heading}</div><div class="vg-card" style="padding:0;overflow:hidden"><div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;${FS(9)}"><div style="padding:8px;font-weight:700;background:var(--brand-muted)">Feature</div>${plans.map((p,i)=>`<div style="padding:8px;font-weight:700;background:${i===1?"var(--brand-primary)":"var(--brand-muted)"};color:${i===1?"var(--brand-on-primary)":""}">${p[0]}<div style="${FS(11)};font-weight:900">${p[1]}</div></div>`).join("")}${features.flatMap(f=>`<div style="padding:8px;border-top:1px solid var(--brand-border);font-weight:700">${f[0]}</div>${f.slice(1).map((v,i)=>`<div style="padding:8px;border-top:1px solid var(--brand-border);text-align:center;${i===1?"background:var(--brand-muted)":""}">${v}</div>`).join("")}`).join("")}</div></div></div>`;
};

// 28. tree-explorer
D["tree-explorer"] = (ctx) => {
  const tree = [["src","folder",true,["components","pages","lib"]],["package.json","file",false,[]],["README.md","file",false,[]]];
  return nav(ctx, "Explorer", ["Tree","Search","Git"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-scroll" style="width:200px;border-right:1px solid var(--brand-border);padding:10px;flex:none"><div style="${FS(10)};font-weight:700;margin-bottom:6px">Project</div><div style="padding-left:12px">${tree.map(n=>`<div style="padding:4px 6px;${FS(9)};font-weight:${n[2]?"700":"400"};cursor:pointer;display:flex;align-items:center;gap:4px"><span>${n[2]?"▸":"▤"}</span>${n[0]}</div>${n[2]?n[3].map(c=>`<div style="padding:4px 6px 4px 24px;${FS(9)};color:var(--brand-muted-foreground)">▤ ${c}</div>`).join(""):""}`).join("")}</div></div>
  <div class="vg-scroll" style="flex:1;padding:14px;overflow:auto"><div style="${FS(13)};font-weight:900">${ctx.heading}</div><div class="vg-card" style="margin-top:10px">${lines(5)}</div></div></div>`;
};

// 29. kanban-swimlanes
D["kanban-swimlanes"] = (ctx) => {
  const lanes = [["Frontend",["Dashboard","Auth flow"]],["Backend",["API spec","Database"]],["Design",["Mockups","Icons"]]];
  const cols = ["Todo","In Progress","Review","Done"];
  return nav(ctx, "Board", ["Swimlanes","List","Timeline"]) + `<div class="vg-scroll" style="flex:1;overflow:auto"><div style="display:grid;grid-template-columns:80px repeat(4,1fr);gap:4px"><div></div>${cols.map(c=>`<div style="${FS(9)};font-weight:700;text-align:center;padding:4px">${c}</div>`).join("")}${lanes.flatMap(l=>[`<div style="${FS(9)};font-weight:700;padding:8px;display:flex;align-items:center">${l[0]}</div>`,...cols.map((_,ci)=>`<div style="padding:4px;min-height:60px;background:var(--brand-muted);border-radius:6px">${ci<l[1].length?`<div class="vg-card" style="padding:6px"><div style="${FS(9)};font-weight:700">${l[1][ci]}</div></div>`:""}</div>`)]).join("")}</div></div>`;
};

// 30. calendar-month
D["calendar-month"] = (ctx) => {
  const days = Array.from({length:35},(_,i)=>i+1); const events = {5:"Demo",12:"Launch",18:"Review",24:"Sync"};
  return nav(ctx, "Month", ["Day","Week","Month"]) + `<div style="flex:1;display:flex;flex-direction:column;min-height:0"><div class="vg-row" style="border-bottom:1px solid var(--brand-border);flex:none">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<div style="flex:1;text-align:center;${FS(8)};font-weight:700;padding:6px;border-right:1px solid var(--brand-border)">${d}</div>`).join("")}</div>
  <div style="flex:1;display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(5,1fr)">${days.map(d=>`<div style="border-right:1px solid var(--brand-border);border-bottom:1px solid var(--brand-border);padding:4px;overflow:hidden"><div style="${FS(8)};font-weight:700">${d}</div>${events[d]?`<div style="background:var(--brand-primary);color:#fff;border-radius:4px;padding:2px 4px;${FS(7)};margin-top:2px">${events[d]}</div>`:""}</div>`).join("")}</div></div>`;
};

// 31. spreadsheet
D["spreadsheet"] = (ctx) => {
  const cols = ["A","B","C","D","E"]; const data = [["Q1","12.4","18.2","21.0","24.6"],["Q2","15.0","16.6","19.4","22.1"],["Q3","17.8","20.1","23.5","26.8"],["Q4","21.2","24.6","28.0","31.5"]];
  return nav(ctx, "Sheet", ["Data","Formulas","Chart"]) + `<div class="vg-scroll" style="flex:1;overflow:auto"><div style="display:grid;grid-template-columns:32px repeat(5,1fr);${FS(9)}"><div style="background:var(--brand-muted);border-bottom:1px solid var(--brand-border);border-right:1px solid var(--brand-border)"></div>${cols.map(c=>`<div style="background:var(--brand-muted);padding:4px;text-align:center;font-weight:700;border-bottom:1px solid var(--brand-border);border-right:1px solid var(--brand-border)">${c}</div>`).join("")}${data.flatMap((r,ri)=>[`<div style="background:var(--brand-muted);padding:4px;text-align:center;font-weight:700;border-bottom:1px solid var(--brand-border);border-right:1px solid var(--brand-border)">${ri+1}</div>`,...r.map(c=>`<div style="padding:4px 8px;border-bottom:1px solid var(--brand-border);border-right:1px solid var(--brand-border)">${c}</div>`)]).join("")}</div></div>`;
};

// 32. dashboard-tiles
D["dashboard-tiles"] = (ctx) => {
  const tiles = [["Revenue","$48.2k","+12%",true],["Users","1,284","+8%",true],["Conversion","3.9%","-0.2%",false],["NPS","72","Above target",true],["Churn","2.1%","-0.3%",true],["MRR","$12.4k","+5%",true]];
  return nav(ctx, "Dashboard", ["Tiles","Chart","Table"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">${tiles.map(t=>`<div class="vg-card" style="padding:14px;${t[3]?"border-top:3px solid var(--brand-primary)":""}"><div class="vg-muted" style="${FS(9)}">${t[0]}</div><div style="${FS(20)};font-weight:900;margin:4px 0">${t[1]}</div><div style="${FS(9)};color:${t[2].startsWith("-")?"#ef4444":"var(--brand-primary)"};font-weight:700">${t[2]}</div></div>`).join("")}</div></div>`;
};

// 33. report-viewer
D["report-viewer"] = (ctx) => {
  return nav(ctx, "Report", ["View","Edit","Share"]) + `<div class="vg-scroll" style="flex:1;padding:16px;overflow:auto"><div style="${FS(16)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(10)};margin-top:2px">${ctx.subtitle} · Q4 2026</div><div style="margin-top:16px;display:flex;flex-direction:column;gap:12px"><div class="vg-card"><div style="${FS(11)};font-weight:700;margin-bottom:6px">Executive Summary</div>${lines(4)}</div><div class="vg-card"><div style="${FS(11)};font-weight:700;margin-bottom:6px">Key Metrics</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${kpi("$48.2k","Revenue")}${kpi("62","Leads")}</div></div><div class="vg-card"><div style="${FS(11)};font-weight:700;margin-bottom:6px">Recommendations</div>${lines(3)}</div></div></div>`;
};

// 34. activity-feed
D["activity-feed"] = (ctx) => {
  const items = [["Sarah K.","created project",true],["Daniel R.","closed deal",false],["Maya P.","updated profile",false],["System","backup complete",true],["Sarah K.","sent invoice",false]];
  return nav(ctx, "Feed", ["All","Mentions","Mine"]) + `<div class="vg-scroll" style="flex:1;overflow:auto">${items.map((it,i)=>`<div style="display:flex;gap:10px;padding:10px 12px;border-bottom:1px solid var(--brand-border)"><div class="vg-avatar" style="flex:none"></div><div style="flex:1"><div style="${FS(10)}"><span style="font-weight:700">${it[0]}</span> <span class="vg-muted">${it[1]}</span></div><div class="vg-muted" style="${FS(8)};margin-top:2px">${i+1}h ago</div></div>${it[2]?`<div style="width:8px;height:8px;border-radius:9999px;background:var(--brand-primary);margin-top:6px"></div>`:""}</div>`).join("")}</div>`;
};

// 35. profile-card
D["profile-card"] = (ctx) => {
  return nav(ctx, "Profile", ["Overview","Activity"]) + `<div class="vg-scroll" style="flex:1;padding:16px;overflow:auto"><div style="text-align:center;margin-bottom:16px"><div style="width:64px;height:64px;border-radius:9999px;background:linear-gradient(135deg,var(--brand-primary),var(--brand-gold-deep));margin:0 auto 10px"></div><div style="${FS(14)};font-weight:900">${ctx.heading}</div><div class="vg-muted" style="${FS(10)}">${ctx.subtitle}</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">${kpi("42","Projects")}${kpi("1.2k","Followers")}${kpi("98%","Rating")}</div><div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:6px">About</div>${lines(3)}</div></div>`;
};

// 36. notification-center
D["notification-center"] = (ctx) => {
  const notifs = [["New message from Sarah","2m ago",true],["Build completed successfully","15m ago",true],["Payment received: $1,200","1h ago",false],["New follower: Daniel R.","3h ago",false],["Weekly report ready","1d ago",false]];
  return nav(ctx, "Notifications", ["All","Unread","Settings"]) + `<div class="vg-scroll" style="flex:1;overflow:auto">${notifs.map((n,i)=>`<div style="display:flex;gap:10px;padding:12px;border-bottom:1px solid var(--brand-border);${n[2]?"background:rgba(0,89,255,.04)":""}"><div style="width:8px;height:8px;border-radius:9999px;background:${n[2]?"var(--brand-primary)":"var(--brand-muted)"};margin-top:4px;flex:none"></div><div style="flex:1"><div style="${FS(10)};font-weight:${n[2]?"700":"400"}">${n[0]}</div><div class="vg-muted" style="${FS(8)};margin-top:2px">${n[1]}</div></div></div>`).join("")}</div>`;
};

// 37. search-results
D["search-results"] = (ctx) => {
  const results = [["Project Alpha","Workspace · 2h ago"],["Sarah Kim","People · 3h ago"],["Q4 Report","Documents · 1d ago"],["Dashboard Design","Tasks · 2d ago"]];
  return nav(ctx, "Search", ["All","People","Docs"]) + `<div class="vg-scroll" style="flex:1;overflow:auto"><div style="padding:12px;border-bottom:1px solid var(--brand-border)"><div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--brand-border);border-radius:9999px;background:var(--brand-muted)"><span style="${FS(11)}">🔍</span><span class="vg-muted" style="${FS(10)}">Search…</span></div></div><div style="padding:8px 12px">${results.map(r=>`<div class="vg-card" style="margin-bottom:6px;display:flex;align-items:center;gap:8px;padding:10px"><div style="width:28px;height:28px;border-radius:8px;background:var(--brand-muted);display:flex;align-items:center;justify-content:center"><span style="${FS(10)}">▤</span></div><div style="flex:1"><div style="${FS(10)};font-weight:700">${r[0]}</div><div class="vg-muted" style="${FS(8)}">${r[1]}</div></div></div>`).join("")}</div></div>`;
};

// 38. data-cards
D["data-cards"] = (ctx) => {
  const items = [["Enterprise Plan","$1,200/mo","Sarah K.","Active"],["Starter Plan","$49/mo","Daniel R.","Active"],["Pro Plan","$199/mo","Maya P.","Pending"],["Custom","$5,000/mo","Vertex","Won"]];
  return nav(ctx, "Subscriptions", ["Cards","Table","Chart"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${items.map(it=>`<div class="vg-card" style="padding:12px"><div class="vg-row vg-between" style="margin-bottom:8px"><div style="${FS(11)};font-weight:700">${it[0]}</div>${chip(it[3],it[3]==="Active")}</div><div style="${FS(16)};font-weight:900;color:var(--brand-primary)">${it[1]}</div><div class="vg-muted" style="${FS(9)};margin-top:4px">${it[2]}</div></div>`).join("")}</div></div>`;
};

// 39. metric-rings
D["metric-rings"] = (ctx) => {
  const ring = (p) => `conic-gradient(var(--brand-primary) ${p*360}deg, var(--brand-muted) 0)`;
  const metrics = [["Revenue",82],["Growth",64],["Retention",91],["NPS",72]];
  return nav(ctx, "Metrics", ["Rings","Chart","Table"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${metrics.map(m=>`<div class="vg-card" style="padding:14px;text-align:center"><div style="width:80px;height:80px;border-radius:9999px;background:${ring(m[1]/100)};margin:0 auto 8px;display:flex;align-items:center;justify-content:center"><div style="width:60px;height:60px;border-radius:9999px;background:var(--brand-surface);display:flex;align-items:center;justify-content:center;${FS(14)};font-weight:900">${m[1]}%</div></div><div style="${FS(10)};font-weight:700">${m[0]}</div></div>`).join("")}</div></div>`;
};

// 40. progress-tracker
D["progress-tracker"] = (ctx) => {
  const steps = [["Discovery","Complete",true],["Design","In Progress",true],["Development","Pending",false],["Testing","Pending",false],["Launch","Pending",false]];
  return nav(ctx, "Progress", ["Timeline","Board"]) + `<div class="vg-scroll" style="flex:1;padding:16px;overflow:auto"><div style="${FS(14)};font-weight:900;margin-bottom:16px">${ctx.heading}</div><div style="display:flex;flex-direction:column;gap:0">${steps.map((s,i)=>`<div style="display:flex;gap:12px;position:relative"><div style="display:flex;flex-direction:column;align-items:center"><div style="width:28px;height:28px;border-radius:9999px;background:${s[2]?"var(--brand-primary)":"var(--brand-muted)"};color:${s[2]?"#fff":"var(--brand-muted-foreground)"};display:flex;align-items:center;justify-content:center;${FS(11)};font-weight:800;flex:none">${s[2]?"✓":i+1}</div>${i<steps.length-1?`<div style="width:2px;flex:1;background:${s[2]?"var(--brand-primary)":"var(--brand-border)"};margin:4px 0;min-height:30px"></div>`:""}</div><div style="padding-bottom:16px"><div style="${FS(11)};font-weight:700">${s[0]}</div><div class="vg-muted" style="${FS(9)}">${s[1]}</div></div></div>`).join("")}</div></div>`;
};

// 41. split-panes
D["split-panes"] = (ctx) => {
  return nav(ctx, "Compare", ["Split","Tabs"]) + `<div style="flex:1;display:flex;min-height:0"><div style="flex:1;border-right:2px solid var(--brand-primary);padding:12px" class="vg-scroll"><div style="${FS(12)};font-weight:900;margin-bottom:8px">Version A</div><div class="vg-card">${lines(4)}</div><div style="margin-top:8px">${kpi("42%","Click rate")}</div></div>
  <div style="flex:1;padding:12px" class="vg-scroll"><div style="${FS(12)};font-weight:900;margin-bottom:8px">Version B</div><div class="vg-card">${lines(4)}</div><div style="margin-top:8px">${kpi("58%","Click rate")}</div></div></div>`;
};

// 42. tabbed-cards
D["tabbed-cards"] = (ctx) => {
  const tabs = ["Overview","Metrics","Activity","Settings"];
  return nav(ctx, "Dashboard", tabs) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">${kpi("$48.2k","Revenue")}${kpi("1,284","Users")}</div><div class="vg-card"><div style="${FS(10)};font-weight:700;margin-bottom:6px">${ctx.heading}</div><div class="vg-feed">${feedItem(ctx.brandName+" updated","2h ago")}${feedItem("New lead","5h ago",60)}</div></div></div>`;
};

// 43. list-detail
D["list-detail"] = (ctx) => {
  const items = [["Sarah Kim","Active","Admin"],["Daniel Reyes","Active","Editor"],["Maya Patel","Pending","Viewer"],["John Vertex","Inactive","Viewer"]];
  return nav(ctx, "People", ["All","Active","Pending"]) + `<div style="flex:1;display:flex;min-height:0"><div class="vg-scroll" style="flex:1;overflow:auto">${items.map((it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--brand-border);${i===0?"background:var(--brand-muted)":""}"><div class="vg-avatar" style="flex:none"></div><div style="flex:1"><div style="${FS(10)};font-weight:700">${it[0]}</div><div class="vg-muted" style="${FS(8)}">${it[2]}</div></div>${chip(it[1],it[1]==="Active")}</div>`).join("")}</div>
  <div style="width:220px;border-left:1px solid var(--brand-border);padding:14px;flex:none" class="vg-scroll"><div style="text-align:center;margin-bottom:12px"><div class="vg-avatar" style="width:48px;height:48px;margin:0 auto 8px"></div><div style="${FS(12)};font-weight:900">Sarah Kim</div><div class="vg-muted" style="${FS(9)}">Admin</div></div>${btn("Edit Profile")}</div></div>`;
};

// 44. command-bar
D["command-bar"] = (ctx) => {
  const cmds = [["Create project","⌘N"],["Search files","⌘F"],["Run command","⌘K"],["Open settings","⌘,"]];
  return nav(ctx, "Command", ["All","Recent"]) + `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px"><div style="width:100%;max-width:320px"><div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--brand-primary);border-radius:12px;background:var(--brand-muted);box-shadow:0 0 20px rgba(0,89,255,.15)"><span style="${FS(12)}">🔍</span><span style="${FS(11)};font-weight:700">Type a command…</span><div style="flex:1"></div><span class="vg-muted" style="${FS(9)}">esc</span></div><div style="margin-top:10px;display:flex;flex-direction:column;gap:4px">${cmds.map(c=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--brand-surface)"><span style="${FS(10)};font-weight:700;flex:1">${c[0]}</span><span class="vg-muted" style="${FS(8)};font-family:var(--font-mono)">${c[1]}</span></div>`).join("")}</div></div></div>`;
};

// 45. workflow-editor
D["workflow-editor"] = (ctx) => {
  const nodes = [["Trigger","var(--brand-primary)"],["Process","var(--brand-gold-deep)"],["Decision","var(--brand-gold-bright)"],["Action","var(--brand-primary)"]];
  return nav(ctx, "Workflow", ["Edit","Run","Logs"]) + `<div style="flex:1;position:relative;overflow:hidden;background:var(--brand-muted)"><div style="position:absolute;inset:0;background-image:radial-gradient(var(--brand-border) 1px,transparent 1px);background-size:20px 20px;opacity:.5"></div>${nodes.map((n,i)=>`<div style="position:absolute;left:${20+i*38}%;top:40%;transform:translateY(-50%);padding:10px 16px;border-radius:10px;background:var(--brand-surface);border:2px solid ${n[1]};box-shadow:0 4px 12px rgba(0,0,0,.15)"><div style="${FS(10)};font-weight:700">${n[0]}</div></div>${i<3?`<svg style="position:absolute;left:${20+i*38+8}%;top:40%;width:30%;height:2px;transform:translateY(-50%)"><line x1="0" y1="0" x2="100%" y2="0" stroke="var(--brand-border)" stroke-width="2" stroke-dasharray="4,3"/></svg>`:""}`).join("")}</div>`;
};

// 46. log-viewer
D["log-viewer"] = (ctx) => {
  const logs = ["[10:24:01] INFO  Server started on port 3000","[10:24:02] DEBUG Database connection established","[10:24:05] INFO  GET /api/users 200 12ms","[10:24:08] WARN  Rate limit approaching threshold","[10:24:10] ERROR Failed to send email: SMTP timeout","[10:24:12] INFO  Retry attempt 1/3","[10:24:14] INFO  Email sent successfully"];
  const color = l => l.includes("ERROR")?"#ef4444":l.includes("WARN")?"#f59e0b":l.includes("DEBUG")?"var(--brand-muted-foreground)":"var(--brand-primary)";
  return nav(ctx, "Logs", ["Stream","Search","Filter"]) + `<div style="flex:1;background:#0d1117;color:#c9d1d9;font-family:var(--font-mono);${FS(9)};overflow:auto;padding:12px" class="vg-scroll">${logs.map(l=>`<div style="margin-bottom:3px"><span style="color:var(--brand-muted-foreground)">${l.split("]")[0]}]</span> <span style="color:${color(l)};font-weight:700">${l.split("]")[1].trim().split(" ")[0]}</span> ${l.split("]")[1].trim().substring(l.split("]")[1].trim().indexOf(" ")+1)}</div>`).join("")}</div>`;
};

// 47. app-launcher
D["app-launcher"] = (ctx) => {
  const apps = [["Mail","✉"],["Calendar","▦"],["Files","▤"],["Chat","💬"],["Analytics","📊"],["Settings","⚙"],["Tasks","✓"],["Notes","📝"]];
  return nav(ctx, "Apps", ["All","Pinned","Recent"]) + `<div class="vg-scroll" style="flex:1;padding:16px;overflow:auto"><div style="${FS(14)};font-weight:900;margin-bottom:14px">${ctx.heading}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${apps.map(a=>`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;border-radius:12px;cursor:pointer;transition:background .15s" onmouseover="this.style.background='var(--brand-muted)'" onmouseout="this.style.background=''"><div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--brand-primary),var(--brand-gold-deep));display:flex;align-items:center;justify-content:center;color:#fff;${FS(18)}">${a[1]}</div><span style="${FS(9)};font-weight:700">${a[0]}</span></div>`).join("")}</div></div>`;
};

// 48. collapsible-sections
D["collapsible-sections"] = (ctx) => {
  const sections = [["Personal Information",true],["Account Settings",false],["Security & Privacy",false],["Notifications",false],["Billing & Payments",false]];
  return nav(ctx, "Settings", ["Sections","Search"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="${FS(13)};font-weight:900;margin-bottom:10px">${ctx.heading}</div>${sections.map((s,i)=>`<div class="vg-card" style="margin-bottom:6px;overflow:hidden"><div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;cursor:pointer"><span style="${FS(10)};font-weight:700">${s[0]}</span><span style="${FS(10)};color:var(--brand-muted-foreground)">${s[1]?"▾":"▸"}</span></div>${s[1]?`<div style="padding:0 12px 10px;border-top:1px solid var(--brand-border)">${lines(3)}</div>`:""}</div>`).join("")}</div>`;
};

// 49. mini-chart-grid
D["mini-chart-grid"] = (ctx) => {
  const charts = Array.from({length:6},(_,i)=>{const bars=Array.from({length:8},(_,j)=>`<i style="height:${30+((i*17+j*23)%65)}%"></i>`).join("");return `<div class="vg-card" style="padding:8px"><div style="${FS(8)};font-weight:700;margin-bottom:4px">Chart ${i+1}</div><div class="vg-chart" style="height:40px;align-items:flex-end">${bars}</div></div>`;});
  return nav(ctx, "Charts", ["Grid","List"]) + `<div class="vg-scroll" style="flex:1;padding:12px;overflow:auto"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${charts.join("")}</div></div>`;
};

// 50. kanban-calendar
D["kanban-calendar"] = (ctx) => {
  const days = ["Mon","Tue","Wed","Thu","Fri"]; const tasks = [["Mon","Design review","P1"],["Mon","API spec","P2"],["Tue","Auth flow","P1"],["Wed","Dashboard","P2"],["Thu","Launch prep","P1"],["Fri","Demo","P2"]];
  return nav(ctx, "Schedule", ["Calendar","Board","List"]) + `<div class="vg-scroll" style="flex:1;overflow:auto"><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:8px">${days.map(d=>`<div><div style="${FS(9)};font-weight:700;text-align:center;padding:6px;border-bottom:2px solid var(--brand-primary)">${d}</div>${tasks.filter(t=>t[0]===d).map(t=>`<div class="vg-card" style="margin-top:4px;padding:6px;border-left:3px solid ${t[2]==="P1"?"var(--brand-primary)":"var(--brand-gold-deep)"}"><div style="${FS(9)};font-weight:700">${t[1]}</div><div class="vg-muted" style="${FS(7)}">${t[2]}</div></div>`).join("")}</div>`).join("")}</div></div>`;
};

export const DESKTOP_LAYOUT_MAP = D;