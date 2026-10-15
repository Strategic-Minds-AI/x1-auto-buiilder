import {createServer} from 'node:http';
import {proposeFreeSlots,authorizeBooking,escapeTwiml,normalizeTurn} from './booking-guards.mjs';
const respond=(res,code,value)=>{res.writeHead(code,{'content-type':'application/json'});res.end(JSON.stringify(value));};
export function makeBookingServer({calendar,tenantId='6aa1c18cfa28df9c2816913b',calendarId='jeremy@strategicmindsai.com'}={}){
  if(!calendar||typeof calendar.freeBusy!=='function')throw Error('CALENDAR_ADAPTER_REQUIRED');
  return createServer(async(req,res)=>{
    if(req.method!=='POST'||req.url!=='/v1/eden/synthetic-booking')return respond(res,404,{error:'NOT_FOUND'});
    let body;try{const chunks=[];for await(const c of req){chunks.push(c);if(Buffer.concat(chunks).length>8192)return respond(res,413,{error:'TOO_LARGE'});}body=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return respond(res,400,{error:'INVALID_JSON'});}
    if(body.mode!=='synthetic'||body.tenant_id!==tenantId||body.calendar_id!==calendarId)return respond(res,403,{error:'ISOLATED_SCOPE_ONLY'});
    try{
      const turn=normalizeTurn({callSid:body.call_sid,turnIndex:body.turn_index,speech:body.speech,tenantId});
      const busy=await calendar.freeBusy({calendarId,start:body.start,end:body.end});
      if(!Array.isArray(busy))throw Error('CALENDAR_PROVIDER_UNAVAILABLE');
      const slots=proposeFreeSlots({busy,requestedStart:body.start,requestedEnd:body.end,durationMinutes:body.duration_minutes||30});
      const request={requestId:turn.idempotency_key,tenantId,calendarId,start:slots[0]?.start,end:slots[0]?.end};
      const auth=authorizeBooking(request,null);
      return respond(res,200,{status:slots.length?'AWAITING_APPROVAL':'NO_AVAILABILITY',call_sid:body.call_sid,turn_id:turn.idempotency_key,spoken_summary:escapeTwiml('I can suggest an available time, but no booking has been made.'),candidates:slots.slice(0,3),approval:auth,calendar_write:false,provider_mode:'mock'});
    }catch(error){return respond(res,422,{error:String(error.message||error)});}
  });
}
// Intentionally no listener on import and no production connector.
