import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateUseCases } from '../../shared/industryLibrary.ts';

// Seeds the IndustryUseCase entity with all 4,000 use cases from the X1 Industry Library.
// Idempotent: checks if data already exists before seeding.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const db = base44.asServiceRole;

    // Check if already seeded
    const existing = await db.entities.IndustryUseCase.list({ limit: 1 });
    if (existing.items && existing.items.length > 0) {
      const count = await db.entities.IndustryUseCase.count();
      return Response.json({
        ok: true,
        message: 'Industry library already seeded',
        existing_count: count,
      });
    }

    // Generate all 4,000 use cases
    const useCases = generateUseCases();

    // Bulk create in batches of 500
    let created = 0;
    const batchSize = 500;
    for (let i = 0; i < useCases.length; i += batchSize) {
      const batch = useCases.slice(i, i + batchSize);
      try {
        await db.entities.IndustryUseCase.bulkCreate(batch);
        created += batch.length;
      } catch (e) {
        // Continue with next batch
      }
    }

    return Response.json({
      ok: true,
      message: 'Industry library seeded successfully',
      total_created: created,
      total_expected: useCases.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}