// Pure development-only Eden booking guards. No network calls, calendar mutations, or secrets.
export function escapeTwiml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;"
  })[ch]);
}
export function normalizeTurn({callSid, turnIndex, speech, tenantId}) {
  if (!/^CA[a-zA-Z0-9_-]{6,}$/.test(callSid ?? "")) throw Error("INVALID_CALL_SID");
  if (!Number.isInteger(turnIndex) || turnIndex < 0) throw Error("INVALID_TURN");
  if (!tenantId) throw Error("MISSING_TENANT");
  return {idempotency_key:`${callSid}:${turnIndex}`,call_sid:callSid,tenant_id:tenantId,
    speech:String(speech ?? "").slice(0,2000)};
}
export function proposeFreeSlots({busy=[], requestedStart, requestedEnd, durationMinutes=30}) {
  const start=Date.parse(requestedStart),end=Date.parse(requestedEnd);
  const duration=durationMinutes*60000;
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||
     !Number.isInteger(durationMinutes)||durationMinutes<15||durationMinutes>120) {
       throw Error("INVALID_WINDOW");
  }
  const occupied=busy.map(x=>[Date.parse(x.start),Date.parse(x.end)])
    .filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a)
    .sort((a,b)=>a[0]-b[0]);
  const slots=[];let cursor=start;
  for(const [a,b] of occupied) {
    if(b<=cursor||a>=end)continue;
    while(cursor+duration<=Math.min(a,end)) {
      slots.push({start:new Date(cursor).toISOString(),end:new Date(cursor+duration).toISOString()});
      cursor+=duration;
    }
    cursor=Math.max(cursor,b);
  }
  while(cursor+duration<=end) {
    slots.push({start:new Date(cursor).toISOString(),end:new Date(cursor+duration).toISOString()});
    cursor+=duration;
  }
  return slots;
}
export function authorizeBooking(request, approval, now=Date.now()) {
  if(!request?.tenantId||!request?.calendarId||!request?.start||!request?.end||!request?.requestId)
    return {allowed:false,reason:"MISSING_FIELDS"};
  if(!approval||approval.status!=="approved"||approval.action!=="calendar.create"||
     approval.tenantId!==request.tenantId||approval.calendarId!==request.calendarId||
     approval.requestId!==request.requestId||!approval.receiptId||
     !Number.isFinite(Date.parse(approval.expiresAt))||Date.parse(approval.expiresAt)<=now)
    return {allowed:false,reason:"APPROVAL_REQUIRED"};
  return {allowed:true,idempotency_key:`calendar:${request.tenantId}:${request.requestId}`,
    approval_ref:approval.receiptId,mode:"AUTHORIZED_BUT_NOT_EXECUTED"};
}
