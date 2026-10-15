import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Process due follow-up emails for CRM contacts
// Finds contacts with follow_up_at <= now and follow_up_status = 'scheduled', sends emails, updates status
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date().toISOString();

    // Find contacts with due follow-ups
    const { items: dueContacts } = await base44.entities.CrmContact.filter({
      follow_up_status: 'scheduled',
      follow_up_at: { $lte: now },
    }, { limit: 50 });

    if (!dueContacts || dueContacts.length === 0) {
      return Response.json({ success: true, message: 'No due follow-ups found', processed: 0 });
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const contact of dueContacts) {
      try {
        // Update status to 'sending'
        await base44.entities.CrmContact.update(contact.id, { follow_up_status: 'sending' });

        // Send the follow-up email using the LeadFollowUp template
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contact.email,
          template_name: 'LeadFollowUp',
          variables: {
            first_name: contact.name?.split(' ')[0] || 'there',
            business_name: contact.source || 'our team',
            hook: contact.follow_up_body || contact.follow_up_subject || 'Following up on your interest',
            contact_name: contact.name || '',
            contact_email: contact.email || '',
            contact_phone: contact.phone || '',
          },
          subject: contact.follow_up_subject || 'Following up — let\'s connect',
        });

        // Update status to 'sent'
        await base44.entities.CrmContact.update(contact.id, {
          follow_up_status: 'sent',
          last_sent_at: now,
          status: 'contacted',
        });
        sent++;
      } catch (err) {
        // Mark as failed
        await base44.entities.CrmContact.update(contact.id, { follow_up_status: 'failed' });
        errors.push({ contactId: contact.id, email: contact.email, error: err.message });
        failed++;
      }
    }

    return Response.json({
      success: true,
      processed: dueContacts.length,
      sent,
      failed,
      errors: errors.slice(0, 10),
      processedAt: now,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}