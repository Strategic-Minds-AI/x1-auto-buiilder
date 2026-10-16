/**
 * CloudBrowser Engine — Bi-directional JSON Sync Server
 * 
 * Deploy this to Railway (cloudbrowser-engine-production.up.railway.app).
 * It implements the 3-endpoint sync protocol that gptAutonomousSync calls:
 * 
 *   POST /              → receives { type: 'snapshot', data } from the app
 *   GET  /?action=pending → returns { commands: [...] } for the app to execute
 *   POST /              → receives { type: 'ack', command_ids, results }
 * 
 * Auth: Bearer token matching ENGINE_API_KEY secret in the Base44 app.
 * 
 * Storage: in-memory (resets on redeploy). For persistence, swap the Maps
 * for a database (Supabase, Redis, etc).
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ENGINE_API_KEY = process.env.ENGINE_API_KEY || '';
const PORT = process.env.PORT || 3000;

// ── In-memory storage ──────────────────────────────────────────
const snapshots = [];        // { timestamp, data }
const pendingCommands = [];  // { id, action, entity, payload, created_at }
const completedCommands = []; // { id, result, completed_at }

// ── Auth middleware ─────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!ENGINE_API_KEY || token !== ENGINE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ── Health check (no auth) ─────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    snapshots: snapshots.length,
    pending_commands: pendingCommands.length,
    completed_commands: completedCommands.length,
    uptime: process.uptime(),
  });
});

// ── Main sync endpoint ─────────────────────────────────────────
app.all('/', async (req, res) => {
  const { type } = req.body || {};

  // GET ?action=pending → return pending commands for the app to execute
  if (req.method === 'GET') {
    return res.json({
      commands: pendingCommands.slice(0, 20),
      pending_count: pendingCommands.length,
    });
  }

  // POST → handle snapshot push or ack
  if (req.method === 'POST') {
    if (type === 'snapshot') {
      snapshots.push({
        timestamp: req.body.timestamp || new Date().toISOString(),
        data: req.body.data || {},
      });
      // Keep only the last 10 snapshots
      if (snapshots.length > 10) snapshots.shift();
      return res.json({ ok: true, received: true, snapshot_count: snapshots.length });
    }

    if (type === 'ack') {
      const { command_ids = [], results = [] } = req.body;
      for (const id of command_ids) {
        const idx = pendingCommands.findIndex(c => c.id === id);
        if (idx !== -1) {
          const cmd = pendingCommands.splice(idx, 1)[0];
          const result = results.find(r => r.id === id) || {};
          completedCommands.push({
            ...cmd,
            result: result.result || '',
            ok: result.ok,
            completed_at: new Date().toISOString(),
          });
        }
      }
      return res.json({ ok: true, acked: command_ids.length });
    }

    // Default: treat as a new command to queue for the app
    if (req.body.action || req.body.entity || req.body.function) {
      const cmd = {
        id: req.body.id || crypto.randomUUID(),
        action: req.body.action || 'read',
        entity: req.body.entity || req.body.function || '',
        payload: req.body.payload || req.body.data || {},
        created_at: new Date().toISOString(),
      };
      pendingCommands.push(cmd);
      return res.json({ ok: true, queued: true, command_id: cmd.id });
    }
  }

  return res.status(400).json({ error: 'Unknown request format' });
});

// ── Convenience: add a command via API ──────────────────────────
app.post('/commands', (req, res) => {
  const cmd = {
    id: req.body.id || crypto.randomUUID(),
    action: req.body.action || 'read',
    entity: req.body.entity || '',
    payload: req.body.payload || {},
    created_at: new Date().toISOString(),
  };
  pendingCommands.push(cmd);
  res.json({ ok: true, command_id: cmd.id });
});

// ── View latest snapshot ───────────────────────────────────────
app.get('/snapshot', (req, res) => {
  if (snapshots.length === 0) return res.json({ error: 'No snapshots yet' });
  res.json(snapshots[snapshots.length - 1]);
});

app.listen(PORT, () => {
  console.log(`CloudBrowser Engine listening on port ${PORT}`);
});