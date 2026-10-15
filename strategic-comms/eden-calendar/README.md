# Eden Skye: development-only voice-to-calendar adapter

Mission: STRATEGIC COMMS Milestone 1, 2026-10-15.
Scope: design/isolated development only. This branch DOES NOT replace or deploy the Base44 voice webhook.

## Audited existing components
- Base44 app `6a9b71a5d35335afb9198950`: `base44/functions/twilioVoiceWebhook/entry.ts` verifies Twilio signatures, identifies a tenant, speaks via TwiML and calls the AI Gateway; it currently sends only the last SpeechResult to the model.
- `base44/functions/googleCalendarAgent/entry.ts` offers `view_schedule`, `find_free_slots`, `check_availability`, and `block_time`, but it uses service-role access without a verified caller authorization/tenant binding.
- `base44/functions/googleWorkspaceSync/entry.ts` has a `sync_googlecalendar` path that may create events from action items; it lacks the required approval/idempotency gate.
- Calendar account `jeremy@strategicmindsai.com` is accessible to connected ChatGPT Calendar with primary owner role. That does not prove the Base44 OAuth connector is bound to the same account.
- X1/AUTO_BUILDER_2 Eden runtime status: `planned`, readiness `partial`.

## Deployment protections
1. Do not copy this code into Base44's main branch without explicit production approval: writing there auto-deploys.
2. Existing webhook signature verification must remain intact; validate exact Twilio URL and account.
3. Use deterministic `callSid:turnSequence` for speech-turn idempotency; unique constraint/atomic upsert must be implemented in durable storage.
4. Persist sanitized conversation turns with a retention limit. Never pass raw tokens or calendar event details to an unverified caller.
5. Escape all generated text inserted into TwiML.
6. Server-side calendar adapter must authorize a verified Strategic Minds tenant and specific Google Calendar identity; no broad service-role public endpoint.
7. Availability is a suggestion, not a hold. Re-check freeBusy immediately before any confirmed booking.
8. Any actual event creation or invite requires an unexpired scoped approval receipt, then provider-side event ID readback. A synthetic test never writes an event.
9. Do not connect multiple X1 supervisors or new heartbeat loops. Use the existing X1 queue.

## Synthetic acceptance scenarios
- Missing/invalid webhook signature -> HTTP 403.
- Input containing `R&D <Consultation>` -> escaped TwiML.
- Existing blocked slot -> unavailable.
- Free slot -> candidate proposal only.
- Missing approval -> booking blocked, no provider write.
- Valid approved request + matching calendar -> one idempotent booking action and readback receipt.
- Replayed call turn -> same receipt, zero extra events.
- Multiple turns -> earlier caller context preserved within tenant.
- Calendar unavailable -> capture callback task; do not claim booking.

## Live controlled test plan (approval required)
1. Independent reviewer checks dev tests, OAuth account mapping, RLS, and rollback.
2. After approval, deploy scoped voice handler canary and place one authorized test call to +1 866 571 1174.
3. Caller requests a meeting; Eden offers a provider-verified free slot without booking it.
4. Operator approves one test booking with exact recipient, time, and calendar.
5. Verify Google Calendar event ID, time zone, attendee policy, CommsEvent call correlation, deduplication and rollback.
6. Never send SMS, email or calendar invitations without the separate action authorization.
