import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Generates a secure API key, stores only the hash, returns the full key once.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { name, scopes, expiresInDays } = body;

    if (!name || name.trim().length === 0) {
      return Response.json({ error: 'Key name is required' }, { status: 400 });
    }

    // Generate a random 64-char hex token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const prefix = 'smk_' + token.slice(0, 8);

    // Hash the token with SHA-256 — we never store the raw key
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 365));

    // Create the key record
    const key = await base44.entities.AppApiKey.create({
      name: name.trim(),
      key_prefix: prefix,
      key_hash: tokenHash,
      scopes: scopes || ['read', 'invoke'],
      status: 'active',
      expires_at: expiresAt.toISOString(),
    });

    // Return the full token — this is the ONLY time it's visible
    return Response.json({
      success: true,
      key: token,
      keyId: key.id,
      prefix,
      name: key.name,
      scopes: key.scopes,
      expiresAt: key.expires_at,
      message: 'Save this key now — it cannot be retrieved again.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}