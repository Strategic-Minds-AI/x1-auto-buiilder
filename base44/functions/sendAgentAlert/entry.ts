import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// ─── Send Agent Alert (SMS to Admin) ────────────────────────────────
// Allows agents and the system to send instant SMS alerts to the admin
// phone for major wins or decision-needed situations.
// Uses Twilio credentials configured in app secrets.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { alert_type, message, context } = body;

    if (!alert_type || !message) {
      return Response.json({ error: 'Missing required fields: alert_type, message' }, { status: 400 });
    }

    // Get admin phone from secrets
    const adminPhone = secrets.get('WHATSAPP_ADMIN_PHONE');
    const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
    const authToken = secrets.get('TWILIO_AUTH_TOKEN');
    const fromNumber = secrets.get('TWILIO_PHONE_NUMBER');

    if (!adminPhone || !accountSid || !authToken || !fromNumber) {
      return Response.json({
        error: 'Missing required secrets. Ensure WHATSAPP_ADMIN_PHONE, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set.',
      }, { status: 500 });
    }

    // Build alert message with emoji prefix based on type
    const prefix = alert_type === 'win' ? '🏆 WIN' : alert_type === 'decision' ? '🔔 DECISION NEEDED' : '🔔 ALERT';
    const contextStr = context ? `\n\nContext: ${context}` : '';
    const fullMessage = `${prefix}\n${message}${contextStr}\n\n— Digital Dominance Factory`;

    // Normalize phone numbers
    const normalize = (num) => {
      const digits = num.replace(/[^0-9]/g, '');
      return digits.length === 10 ? `1${digits}` : digits;
    };
    const cleanTo = normalize(adminPhone);
    const cleanFrom = normalize(fromNumber);

    // Send via Twilio
    const params = new URLSearchParams();
    params.append('To', `+${cleanTo}`);
    params.append('From', `+${cleanFrom}`);
    params.append('Body', fullMessage);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15000),
    });

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      return Response.json({
        error: 'Twilio API error: ' + (twilioData.message || twilioRes.status),
        details: twilioData,
      }, { status: twilioRes.status });
    }

    return Response.json({
      ok: true,
      alert_type,
      messageId: twilioData.sid,
      status: twilioData.status,
      sent_to: twilioData.to,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}