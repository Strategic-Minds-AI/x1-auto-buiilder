import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Sends an email via the authorized Gmail connector.
// Required: to, subject. Optional: html, text, cc, bcc.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { to, subject, html, text, cc, bcc } = body;
    if (!to || !subject) return Response.json({ error: 'to and subject are required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Build RFC 2822 MIME message
    const boundary = 'boundary_' + Math.random().toString(36).slice(2);
    const headers = [
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="' + boundary + '"',
      'To: ' + to,
      'Subject: ' + subject,
    ];
    if (cc) headers.push('Cc: ' + cc);
    if (bcc) headers.push('Bcc: ' + bcc);

    const mimeParts = [
      ...headers,
      '',
      '--' + boundary,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      (text || subject),
      '--' + boundary,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      (html || text || subject),
      '--' + boundary + '--',
    ];

    const mimeMessage = mimeParts.join('\r\n');
    // Base64 URL-safe encode (handles UTF-8)
    const encoded = btoa(unescape(encodeURIComponent(mimeMessage)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encoded }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: 'Gmail API error: ' + response.status, details: errText }, { status: 500 });
    }

    const result = await response.json();
    return Response.json({ status: 'sent', messageId: result.id, to, subject });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}