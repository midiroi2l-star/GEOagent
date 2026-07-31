import { isAdminRequest } from '../../_utils/auth.js';
import { isMonthAllowed } from '../../_utils/date.js';
import { json, validateEventFields, validateImage } from '../../_utils/events.js';

export async function onRequestGet({ request, env, params }) {
  const row = await env.DB.prepare(
    `SELECT id, event_date, start_time, end_time, instructor, title, content, image_key, image_name FROM events WHERE id = ?`
  )
    .bind(params.id)
    .first();

  if (!row) return json({ error: '일정을 찾을 수 없습니다.' }, 404);

  const admin = await isAdminRequest(request, env);
  if (!admin) {
    const [y, m] = row.event_date.split('-').map(Number);
    if (!isMonthAllowed(y, m)) return json({ error: '조회할 수 없습니다.' }, 403);
  }

  return json({ event: row });
}

export async function onRequestPut({ request, env, params }) {
  const admin = await isAdminRequest(request, env);
  if (!admin) return json({ error: '관리자만 수정할 수 있습니다.' }, 403);

  const existing = await env.DB.prepare(`SELECT image_key, image_name FROM events WHERE id = ?`)
    .bind(params.id)
    .first();
  if (!existing) return json({ error: '일정을 찾을 수 없습니다.' }, 404);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: '잘못된 요청입니다.' }, 400);
  }

  const event_date = form.get('event_date');
  const start_time = form.get('start_time');
  const end_time = form.get('end_time');
  const instructor = (form.get('instructor') || '').toString().trim();
  const title = (form.get('title') || '').toString().trim();
  const content = (form.get('content') || '').toString().trim();
  const image = form.get('image');
  const removeImage = form.get('remove_image') === '1';

  const validationError = validateEventFields({ event_date, start_time, end_time, instructor, title });
  if (validationError) return json({ error: validationError }, 400);

  let image_key = existing.image_key;
  let image_name = existing.image_name;

  if (removeImage && image_key) {
    await env.IMAGES.delete(image_key);
    image_key = null;
    image_name = null;
  }

  if (image && typeof image === 'object' && image.size > 0) {
    const imageError = validateImage(image);
    if (imageError) return json({ error: imageError }, 400);
    if (image_key) await env.IMAGES.delete(image_key);
    image_key = crypto.randomUUID();
    await env.IMAGES.put(image_key, await image.arrayBuffer(), {
      httpMetadata: { contentType: image.type },
    });
    image_name = image.name;
  }

  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE events SET event_date=?, start_time=?, end_time=?, instructor=?, title=?, content=?, image_key=?, image_name=?, updated_at=? WHERE id=?`
  )
    .bind(event_date, start_time, end_time, instructor, title, content || null, image_key, image_name, now, params.id)
    .run();

  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  const admin = await isAdminRequest(request, env);
  if (!admin) return json({ error: '관리자만 삭제할 수 있습니다.' }, 403);

  const existing = await env.DB.prepare(`SELECT image_key FROM events WHERE id = ?`).bind(params.id).first();
  if (!existing) return json({ error: '일정을 찾을 수 없습니다.' }, 404);

  if (existing.image_key) await env.IMAGES.delete(existing.image_key);
  await env.DB.prepare(`DELETE FROM events WHERE id = ?`).bind(params.id).run();

  return json({ ok: true });
}
