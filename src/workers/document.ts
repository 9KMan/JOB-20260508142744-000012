import type { Context } from 'hono';
import type { R2Bucket } from '@cloudflare/workers-types';

interface Env {
  DOCUMENTS: R2Bucket;
  DB: any;
}

export async function handleDocumentUpload(c: Context<{ Bindings: Env }>) {
  try {
    const form = await c.req.formData();
    const file = form.get('file') as File;
    const matterId = form.get('matter_id') as string;

    if (!file || !matterId) {
      return c.json({ error: 'Missing file or matter_id' }, 400);
    }

    const key = `documents-raw/${Date.now()}-${file.name}`;
    await c.env.DOCUMENTS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // TODO: Enqueue to document processing queue
    return c.json({ status: 'uploaded', key, matter_id: matterId });
  } catch (error) {
    console.error('Document upload error:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
}
