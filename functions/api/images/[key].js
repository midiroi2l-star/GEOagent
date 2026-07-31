import { isAdminRequest } from '../../_utils/auth.js';
import { isMonthAllowed } from '../../_utils/date.js';

export async function onRequestGet({ request, env, params }) {
  const key = params.key;

  const row = await env.DB.prepare(`SELECT event_date, image_name FROM events WHERE image_key = ?`)
    .bind(key)
    .first();
  if (!row) return new Response('Not found', { status: 404 });

  const admin = await isAdminRequest(request, env);
  if (!admin) {
    const [y, m] = row.event_date.split('-').map(Number);
    if (!isMonthAllowed(y, m)) return new Response('Forbidden', { status: 403 });
  }

  const object = await env.IMAGES.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'private, max-age=3600');

  const url = new URL(request.url);
  if (url.searchParams.get('download') === '1') {
    const filename = encodeURIComponent(row.image_name || 'image');
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${filename}`);
  }

  return new Response(object.body, { headers });
}
