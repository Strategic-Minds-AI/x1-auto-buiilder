#!/usr/bin/env node
/**
 * Local Sandbox Agent — runs on YOUR computer and connects it to the Digital Dominance app
 * as a live sandbox. GPT (or the pipeline) sends commands through the app; this agent
 * polls for them, executes them locally, and reports results back.
 *
 * SETUP:
 *   1. npm install node-fetch  (or use Node 18+ which has global fetch)
 *   2. Go to the app → Local Sandbox Bridge page → click "Register New Machine"
 *   3. Copy the session_id and auth_token
 *   4. Run:  node local-sandbox-agent.js <session_id> <auth_token>
 *
 * USAGE:
 *   node local-sandbox-agent.js <session_id> <auth_token> [working_dir]
 *
 * The agent will:
 *   - Send a heartbeat every 15 seconds (keeps the session "online")
 *   - Poll for pending commands every 5 seconds
 *   - Execute shell commands, file operations, npm scripts, git clones
 *   - Report results (stdout, stderr, exit code) back to the app
 *
 * SAFETY: This agent executes commands sent from the app. Only run it on a machine
 * where you're comfortable with that. The app is admin-only, so only you can send commands.
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const os = require('os');

// ── Config ──────────────────────────────────────────────────
const APP_URL = 'https://x1-auto-builder.base44.app';
const BRIDGE_ENDPOINT = `${APP_URL}/functions/localSandboxBridge`;
const POLL_INTERVAL = 5000;      // 5 seconds
const HEARTBEAT_INTERVAL = 15000; // 15 seconds

// ── Args ─────────────────────────────────────────────────────
const [,, sessionId, authToken, workingDirArg] = process.argv;

if (!sessionId || !authToken) {
  console.error('Usage: node local-sandbox-agent.js <session_id> <auth_token> [working_dir]');
  console.error('');
  console.error('Get your session_id and auth_token from the app → Local Sandbox Bridge page.');
  process.exit(1);
}

const WORKING_DIR = workingDirArg || process.cwd();
const MACHINE_NAME = os.hostname();

console.log('═══════════════════════════════════════════════════');
console.log('  LOCAL SANDBOX AGENT — Digital Dominance Factory');
console.log('═══════════════════════════════════════════════════');
console.log(`  Machine:     ${MACHINE_NAME}`);
console.log(`  OS:          ${os.platform()} ${os.arch()}`);
console.log(`  Working Dir: ${WORKING_DIR}`);
console.log(`  Session:     ${sessionId.slice(0, 8)}...`);
console.log(`  App:         ${APP_URL}`);
console.log('───────────────────────────────────────────────────');
console.log('  Agent is ONLINE. Waiting for commands...');
console.log('  Press Ctrl+C to disconnect.');
console.log('═══════════════════════════════════════════════════\n');

// ── API helpers ─────────────────────────────────────────────
async function apiCall(body) {
  const res = await fetch(BRIDGE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({ ...body, sessionId }),
  });
  return res.json();
}

// ── Command executors ────────────────────────────────────────
async function executeCommand(command) {
  const { command_id, command_type, payload, timeout_seconds } = command;
  const startTime = Date.now();
  console.log(`\n▶ [${command_id.slice(0, 8)}] ${command_type} — ${JSON.stringify(payload).slice(0, 100)}`);

  let result;
  try {
    switch (command_type) {
      case 'shell':
        result = await runShell(payload.cmd, timeout_seconds);
        break;
      case 'file_write':
        result = await fileWrite(payload.path, payload.content);
        break;
      case 'file_read':
        result = await fileRead(payload.path);
        break;
      case 'file_list':
        result = await fileList(payload.path || WORKING_DIR);
        break;
      case 'dev_server':
        result = await runDevServer(payload.cmd, payload.port, timeout_seconds);
        break;
      case 'git_clone':
        result = await runShell(`git clone ${payload.url} ${payload.dir || ''}`, timeout_seconds);
        break;
      case 'npm_install':
        result = await runShell(`npm install ${payload.packages || ''}`.trim(), timeout_seconds);
        break;
      case 'npm_run':
        result = await runShell(`npm run ${payload.script}`, timeout_seconds);
        break;
      case 'custom':
        result = await runShell(payload.cmd, timeout_seconds);
        break;
      default:
        result = { exit_code: 1, stderr: `Unknown command type: ${command_type}` };
    }
  } catch (err) {
    result = { exit_code: 1, stderr: err.message, stdout: '' };
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const status = result.exit_code === 0 ? 'completed' : 'failed';
  console.log(`  ${status === 'completed' ? '✓' : '✗'} ${status} in ${elapsed}s`);

  if (result.stdout) console.log(`  stdout: ${result.stdout.slice(0, 200)}`);
  if (result.stderr) console.log(`  stderr: ${result.stderr.slice(0, 200)}`);

  // Report result back
  await apiCall({
    action: 'report',
    commandId: command_id,
    result,
    status,
  });
}

function runShell(cmd, timeoutSec = 120) {
  return new Promise((resolve) => {
    const proc = exec(cmd, {
      cwd: WORKING_DIR,
      timeout: timeoutSec * 1000,
      maxBuffer: 1024 * 1024 * 5,
    }, (err, stdout, stderr) => {
      resolve({
        exit_code: err ? (err.code || 1) : 0,
        stdout: stdout || '',
        stderr: stderr || (err ? err.message : ''),
      });
    });
  });
}

function fileWrite(filePath, content) {
  return new Promise((resolve) => {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(WORKING_DIR, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content || '');
      resolve({ exit_code: 0, stdout: `Written ${content?.length || 0} bytes to ${fullPath}`, stderr: '' });
    } catch (err) {
      resolve({ exit_code: 1, stdout: '', stderr: err.message });
    }
  });
}

function fileRead(filePath) {
  return new Promise((resolve) => {
    try {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(WORKING_DIR, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      resolve({ exit_code: 0, stdout: content, stderr: '', file_path: fullPath });
    } catch (err) {
      resolve({ exit_code: 1, stdout: '', stderr: err.message });
    }
  });
}

function fileList(dirPath) {
  return new Promise((resolve) => {
    try {
      const fullPath = path.isAbsolute(dirPath) ? dirPath : path.join(WORKING_DIR, dirPath);
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      const listing = entries.map(e => ({
        name: e.name,
        type: e.isDirectory() ? 'dir' : 'file',
        size: e.isFile() ? fs.statSync(path.join(fullPath, e.name)).size : 0,
      }));
      resolve({ exit_code: 0, stdout: JSON.stringify(listing, null, 2), stderr: '', files: listing });
    } catch (err) {
      resolve({ exit_code: 1, stdout: '', stderr: err.message });
    }
  });
}

function runDevServer(cmd, port, timeoutSec) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, [], {
      cwd: WORKING_DIR,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let resolved = false;

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    // Give the dev server 10 seconds to start, then report it as running
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({
          exit_code: 0,
          stdout: stdout.slice(0, 2000),
          stderr: stderr.slice(0, 500),
          url: port ? `http://localhost:${port}` : 'http://localhost:3000',
          pid: proc.pid,
          message: 'Dev server started (running in background)',
        });
      }
    }, 10000);

    proc.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        resolve({ exit_code: code, stdout: stdout.slice(0, 2000), stderr: stderr.slice(0, 500) });
      }
    });
  });
}

// ── Main loop ────────────────────────────────────────────────
let running = true;

async function heartbeatLoop() {
  while (running) {
    try {
      await apiCall({ action: 'heartbeat' });
    } catch (err) {
      console.error('Heartbeat failed:', err.message);
    }
    await new Promise(r => setTimeout(r, HEARTBEAT_INTERVAL));
  }
}

async function pollLoop() {
  while (running) {
    try {
      const res = await apiCall({ action: 'poll' });
      if (res.ok && res.command) {
        await executeCommand(res.command);
      }
    } catch (err) {
      console.error('Poll failed:', err.message);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nDisconnecting...');
  running = false;
  setTimeout(() => process.exit(0), 500);
});

// Start
heartbeatLoop();
pollLoop();