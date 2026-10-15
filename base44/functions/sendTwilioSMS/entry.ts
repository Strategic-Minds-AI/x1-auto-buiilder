import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Send SMS via Twilio/Xtreme Comms API
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { to, message, mediaUrl } = body;

    if (!to || !message) {
      return Response.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
    const authToken = secrets.get('TWILIO_AUTH_TOKEN');
    const fromNumber = secrets.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: 'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.' }, { status: 500 });
    }

    // Clean phone numbers (strip non-digits, ensure country code)
    const cleanTo = to.replace(/[^0-9]/g, '');
    const cleanFrom = fromNumber.replace(/[^0-9]/g, '');

    // Build form data for Twilio API
    const params = new URLSearchParams();
    params.append('To', `+${cleanTo}`);
    params.append('From', `+${cleanFrom}`);
    params.append('Body', message);
    if (mediaUrl) params.append('MediaUrl', mediaUrl);

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
        status: twilioRes.status,
        details: twilioData,
      }, { status: twilioRes.status });
    }

    return Response.json({
      success: true,
      messageId: twilioData.sid,
      status: twilioData.status,
      to: twilioData.to,
      from: twilioData.from,
      body: twilioData.body,
      errorCode: twilioData.error_code,
      errorMessage: twilioData.error_message,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}