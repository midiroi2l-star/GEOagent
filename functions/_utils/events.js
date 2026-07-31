export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function validateEventFields({ event_date, start_time, end_time, instructor, title }) {
  if (!event_date || !/^\d{4}-\d{2}-\d{2}$/.test(event_date)) return '날짜가 올바르지 않습니다.';
  if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) return '시작 시간이 올바르지 않습니다.';
  if (!end_time || !/^\d{2}:\d{2}$/.test(end_time)) return '종료 시간이 올바르지 않습니다.';
  if (end_time <= start_time) return '종료 시간은 시작 시간보다 늦어야 합니다.';
  if (!instructor) return '강사명을 입력해주세요.';
  if (instructor.length > 50) return '강사명은 50자 이내로 입력해주세요.';
  if (!title) return '제목을 입력해주세요.';
  if (title.length > 100) return '제목은 100자 이내로 입력해주세요.';
  return null;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateImage(image) {
  if (image.size > MAX_IMAGE_SIZE) return '이미지 크기는 5MB를 초과할 수 없습니다.';
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) return '지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp)';
  return null;
}
