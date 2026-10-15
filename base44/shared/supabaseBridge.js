// Shared Supabase bridge — handles the connection token, project ref discovery,
// service_role key retrieval, and PostgREST/Management API calls to the
// X1 AI Hub autonomous build system backend.
//
// Used by backend functions that need to talk to the user's existing Supabase
// infrastructure. Never import from frontend code.

const X1_PROJECT_REF = "vgsmyhqqtkkluhypxyua"; // X1 AI Hub (production)
const X1_STAGING_REF = "uvdkzsbjackpjvpoxtyk"; // X1 AI Hub Staging
const XPS_PROJECT_REF = "akezkmklygzltvnvisob"; // Xtreme Polishing System (dedicated, isolated)
const API_BASE = "https://api.supabase.com/v1";
const REST_BASE = (ref) => `https://${ref}.supabase.co/rest/v1`;

// Get the OAuth access token for the Supabase connector
export async function getSupabaseConnection(base44) {
  const conn = await base44.asServiceRole.connectors.getConnection("supabase");
  if (!conn || !conn.accessToken) {
    throw new Error("Supabase connector not authorized");
  }
  return conn;
}

// Get the service_role key for PostgREST data access
export async function getServiceRoleKey(base44, projectRef = X1_PROJECT_REF) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/projects/${projectRef}/api-keys`, {
    headers: { Authorization: `Bearer ${conn.accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch API keys: ${res.status}`);
  }
  const keys = await res.json();
  const serviceKey = Array.isArray(keys) ? keys.find((k) => k.name === "service_role") : null;
  if (!serviceKey || !serviceKey.api_key) {
    throw new Error("service_role key not found in project");
  }
  return { accessToken: conn.accessToken, serviceRoleKey: serviceKey.api_key };
}

// Run a read-only SQL query via the Management API
export async function runReadOnlyQuery(base44, query, projectRef = X1_PROJECT_REF) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/projects/${projectRef}/database/query/read-only`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Read-only query failed (${res.status}): ${text}`);
  }
  return await res.json();
}

// Run a write SQL query (INSERT/UPDATE/DELETE/DDL) via the Management API
export async function runWriteQuery(base44, query, projectRef = X1_PROJECT_REF) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Write query failed (${res.status}): ${text}`);
  }
  return await res.json();
}

// Read rows from a table via PostgREST (service_role key)
export async function readTable(base44, table, options = {}, projectRef = X1_PROJECT_REF) {
  const { serviceRoleKey } = await getServiceRoleKey(base44, projectRef);
  const params = new URLSearchParams();
  if (options.select) params.set("select", options.select);
  if (options.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      params.set(key, value);
    }
  }
  if (options.order) params.set("order", options.order);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset || 0));

  const url = `${REST_BASE(projectRef)}/${table}?${params}`;
  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostgREST read failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  const countHeader = res.headers.get("Content-Range");
  return { rows: data, contentRange: countHeader };
}

// Insert rows into a table via PostgREST
export async function insertRows(base44, table, data, projectRef = X1_PROJECT_REF) {
  const { serviceRoleKey } = await getServiceRoleKey(base44, projectRef);
  const res = await fetch(`${REST_BASE(projectRef)}/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostgREST insert failed (${res.status}): ${text}`);
  }
  return await res.json();
}

// Update rows in a table via PostgREST (filter required)
export async function updateRows(base44, table, filter, data, projectRef = X1_PROJECT_REF) {
  const { serviceRoleKey } = await getServiceRoleKey(base44, projectRef);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    params.set(key, value);
  }
  const res = await fetch(`${REST_BASE(projectRef)}/${table}?${params}`, {
    method: "PATCH",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostgREST update failed (${res.status}): ${text}`);
  }
  return await res.json();
}

// Resolve a default tenant_id from x1_tenants if none is provided — the
// work queue requires a non-null tenant_id.
async function resolveTenantId(base44, projectRef) {
  const { rows } = await readTable(
    base44,
    "x1_tenants",
    { select: "tenant_id,slug,name,status", limit: 1 },
    projectRef
  );
  if (!rows || rows.length === 0) {
    throw new Error("No tenants found in x1_tenants — create a tenant first");
  }
  return rows[0].tenant_id;
}

// Valid action_class values per the X1 work queue check constraint
const VALID_ACTION_CLASSES = [
  "READ_ONLY",
  "NON_PRODUCTION_MUTATION",
  "PROTECTED_MUTATION",
  "PRODUCTION_RELEASE",
];

// Generate a 64-char hex idempotency key (SHA-256) as required by the queue
async function generateIdempotencyKey() {
  const data = `${Date.now()}_${Math.random()}_${crypto.randomUUID()}`;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Push a work item to the X1 work queue — the entry point for the autonomous
// build system to pick up jobs from this platform.
export async function pushWorkItem(base44, payload, projectRef = X1_PROJECT_REF) {
  const {
    task_id,
    requested_by,
    action_class,
    required_capabilities = [],
    workPayload = {},
    priority = 100,
    mission_id,
    tenant_id,
  } = payload;

  if (!action_class || !requested_by) {
    throw new Error("action_class and requested_by are required");
  }
  if (!VALID_ACTION_CLASSES.includes(action_class)) {
    throw new Error(
      `Invalid action_class "${action_class}". Valid: ${VALID_ACTION_CLASSES.join(", ")}`
    );
  }

  const resolvedTenantId = tenant_id || (await resolveTenantId(base44, projectRef));
  const idempotencyKey = await generateIdempotencyKey();

  const row = {
    work_packet_id: `wp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    task_id: task_id || `task_${Date.now()}`,
    requested_by,
    action_class,
    required_capabilities: required_capabilities, // PostgREST accepts JSON arrays directly
    payload: workPayload, // PostgREST accepts JSON objects directly
    idempotency_key: idempotencyKey,
    status: "PENDING",
    priority,
    mission_id: mission_id || `mission_${Date.now()}`,
    tenant_id: resolvedTenantId,
  };

  return await insertRows(base44, "x1_work_queue", row, projectRef);
}

// Get the status of work items, factory pipelines, convergence cycles, and
// apex output events — a unified dashboard read for the autonomous system.
export async function getSystemStatus(base44, projectRef = X1_PROJECT_REF) {
  const [queue, pipelines, cycles, events, workers] = await Promise.allSettled([
    readTable(base44, "x1_work_queue", {
      select: "work_id,task_id,action_class,status,priority,attempts,created_at,updated_at",
      order: "created_at.desc",
      limit: 20,
    }, projectRef),
    readTable(base44, "factory_pipelines", {
      select: "id,name,status,domains_discovered,domains_bought,templates_generated,sites_deployed,task_count",
      order: "created_at.desc",
      limit: 10,
    }, projectRef),
    readTable(base44, "convergence_cycles", {
      select: "id,system_id,cycle_number,phase,status,score,categories_passed,categories_failed,hard_gates_passed,hard_gates_total",
      order: "created_at.desc",
      limit: 10,
    }, projectRef),
    readTable(base44, "apex_output_events", {
      select: "id,event_type,project_key,producer,summary,importance,classification,trust_state,status,created_at",
      order: "created_at.desc",
      limit: 20,
    }, projectRef),
    readTable(base44, "worker_fleet", {
      select: "id,name,focus_area,deploy_target,active,last_seen,total_runs,total_actions",
      order: "created_at.desc",
      limit: 10,
    }, projectRef),
  ]);

  return {
    workQueue: queue.status === "fulfilled" ? queue.value.rows : [],
    factoryPipelines: pipelines.status === "fulfilled" ? pipelines.value.rows : [],
    convergenceCycles: cycles.status === "fulfilled" ? cycles.value.rows : [],
    apexEvents: events.status === "fulfilled" ? events.value.rows : [],
    workerFleet: workers.status === "fulfilled" ? workers.value.rows : [],
    errors: {
      workQueue: queue.status === "rejected" ? queue.reason?.message : null,
      factoryPipelines: pipelines.status === "rejected" ? pipelines.reason?.message : null,
      convergenceCycles: cycles.status === "rejected" ? cycles.reason?.message : null,
      apexEvents: events.status === "rejected" ? events.reason?.message : null,
      workerFleet: workers.status === "rejected" ? workers.reason?.message : null,
    },
  };
}

// List all organizations the connected account belongs to
export async function listOrganizations(base44) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/organizations`, {
    headers: { Authorization: `Bearer ${conn.accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Failed to list organizations: ${res.status}`);
  }
  return await res.json();
}

// Create a new Supabase project (requires organization-level access)
export async function createProject(base44, { name, organizationId, region = "us-east-2", dbPassword, plan = "free" }) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${conn.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      organization_id: organizationId,
      region,
      db_pass: dbPassword,
      plan,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create project (${res.status}): ${text}`);
  }
  return await res.json();
}

// List all Supabase projects for the connected account
export async function listProjects(base44) {
  const conn = await getSupabaseConnection(base44);
  const res = await fetch(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${conn.accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new Error(`Failed to list projects: ${res.status}`);
  }
  const projects = await res.json();
  return Array.isArray(projects)
    ? projects.map((p) => ({
        id: p.id,
        name: p.name,
        ref: p.id,
        region: p.region,
        status: p.status,
      }))
    : [];
}

export { X1_PROJECT_REF, X1_STAGING_REF, XPS_PROJECT_REF };