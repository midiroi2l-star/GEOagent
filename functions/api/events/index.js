import { isAdminRequest } from '../../_utils/auth.js';
import { isMonthAllowed } from '../../_utils/date.js';
import { json, validateEventFields, validateImage } from '../../_utils/events.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get('year'), 10);
  const month = parseInt(url.searchParams.get('month'), 10);
  if (!year || !month || month < 1 || month > 12) {
    return json({ error: 'year, month 파라미터가 필요합니다.' }, 400);
  }

  const admin = await isAdminRequest(request, env);
  if (!admin && !isMonthAllowed(year, month)) {
    return json({ error: '조회할 수 없는 월입니다.' }, 403);
  }

  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const columns = admin
    ? 'id, event_date, start_time, end_time, instructor, title, content, image_key, image_name'
    : "id, event_date, start_time, end_time, instructor, title, CASE WHEN (content IS NOT NULL AND content != '') OR image_key IS NOT NULL THEN 1 ELSE 0 END AS has_detail";

  const { results } = await env.DB.prepare(
    `SELECT ${columns} FROM events WHERE event_date >= ? AND event_date < ? ORDER BY event_date ASC, start_time ASC`
  )
    .bind(start, end)
    .all();

  return json({ events: results });
}

export async function onRequestPost({ request, env }) {
  const admin = await isAdminRequest(request, env);
  if (!admin) return json({ error: '관리자만 등록할 수 있습니다.' }, 403);

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

  const validationError = validateEventFields({ event_date, start_time, end_time, instructor, title });
  if (validationError) return json({ error: validationError }, 400);

  let image_key = null;
  let image_name = null;
  if (image && typeof image === 'object' && image.size > 0) {
    const imageError = validateImage(image);
    if (imageError) return json({ error: imageError }, 400);
    image_key = crypto.randomUUID();
    await env.IMAGES.put(image_key, await image.arrayBuffer(), {
      httpMetadata: { contentType: image.type },
    });
    image_name = image.name;
  }

  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    `INSERT INTO events (event_date, start_time, end_time, instructor, title, content, image_key, image_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(event_date, start_time, end_time, instructor, title, content || null, image_key, image_name, now, now)
    .run();

  return json({ ok: true, id: result.meta.last_row_id }, 201);
}
