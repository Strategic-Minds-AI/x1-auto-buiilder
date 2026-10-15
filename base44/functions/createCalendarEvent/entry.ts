import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Creates a Google Calendar event via the authorized Calendar connector.
// Required: summary, startDateTime. Optional: description, endDateTime, attendees[], location, timeZone.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { summary, description, startDateTime, endDateTime, attendees, location, timeZone } = body;
    if (!summary || !startDateTime) return Response.json({ error: 'summary and startDateTime are required' }, { status: 400 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');

    const tz = timeZone || 'America/New_York';
    const event = {
      summary,
      description: description || '',
      start: { dateTime: startDateTime, timeZone: tz },
      end: { dateTime: endDateTime || new Date(new Date(startDateTime).getTime() + 30 * 60000).toISOString(), timeZone: tz },
      attendees: (attendees || []).map(email => ({ email })),
    };
    if (location) event.location = location;

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: 'Calendar API error: ' + response.status, details: errText }, { status: 500 });
    }

    const result = await response.json();
    return Response.json({ status: 'created', eventId: result.id, htmlLink: result.htmlLink, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}