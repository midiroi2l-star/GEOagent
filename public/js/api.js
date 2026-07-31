const API_BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw data.error ? data : { error: '요청이 실패했습니다.' };
  }
  return res.json();
}

export function fetchMeta() {
  return fetch(`${API_BASE}/meta`).then(handle);
}

export function fetchEvents(year, month) {
  return fetch(`${API_BASE}/events?year=${year}&month=${month}`, { credentials: 'same-origin' }).then(handle);
}

export function fetchEvent(id) {
  return fetch(`${API_BASE}/events/${id}`, { credentials: 'same-origin' }).then(handle);
}
