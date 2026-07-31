import { renderCalendar } from './calendar.js';

const loginSection = document.getElementById('login-section');
const calendarSection = document.getElementById('calendar-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const calendarEl = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const modalTitle = document.getElementById('event-modal-title');
const deleteBtn = document.getElementById('delete-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formError = document.getElementById('form-error');
const existingImageWrap = document.getElementById('existing-image-wrap');
const existingImageImg = document.getElementById('existing-image-img');
const removeImageCheckbox = document.getElementById('remove-image');

let current = null;
let editingId = null;

async function checkSession() {
  const res = await fetch('/api/session', { credentials: 'same-origin' });
  const data = await res.json();
  return data.authenticated;
}

async function boot() {
  const authed = await checkSession();
  if (authed) {
    showCalendar();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginSection.hidden = false;
  calendarSection.hidden = true;
}

function showCalendar() {
  loginSection.hidden = true;
  calendarSection.hidden = false;
  const now = new Date();
  current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  render();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const formData = new FormData(loginForm);
  const res = await fetch('/api/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: formData.get('username'),
      password: formData.get('password'),
    }),
  });
  if (res.ok) {
    loginForm.reset();
    showCalendar();
  } else {
    const data = await res.json().catch(() => ({}));
    loginError.textContent = data.error || '로그인에 실패했습니다.';
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
  showLogin();
});

function shiftMonth(delta) {
  let { year, month } = current;
  month += delta;
  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }
  current = { year, month };
  render();
}

prevBtn.addEventListener('click', () => shiftMonth(-1));
nextBtn.addEventListener('click', () => shiftMonth(1));

async function render() {
  monthLabel.textContent = `${current.year}년 ${current.month}월`;
  calendarEl.innerHTML = '<p class="loading">불러오는 중...</p>';

  const res = await fetch(`/api/events?year=${current.year}&month=${current.month}`, {
    credentials: 'same-origin',
  });
  if (res.status === 401 || res.status === 403) {
    showLogin();
    return;
  }
  const { events } = await res.json();
  const eventsByDate = {};
  events.forEach((ev) => {
    (eventsByDate[ev.event_date] ??= []).push(ev);
  });
  renderCalendar({
    container: calendarEl,
    year: current.year,
    month: current.month,
    eventsByDate,
    isAdmin: true,
    onDayAdd: openCreateModal,
    onEventClick: openEditModal,
  });
}

function resetForm() {
  eventForm.reset();
  formError.textContent = '';
  existingImageWrap.hidden = true;
  removeImageCheckbox.checked = false;
  deleteBtn.hidden = true;
  editingId = null;
}

function openCreateModal(dateKey) {
  resetForm();
  modalTitle.textContent = '일정 등록';
  eventForm.event_date.value = dateKey;
  eventModal.classList.add('open');
}

async function openEditModal(id) {
  resetForm();
  modalTitle.textContent = '일정 수정';
  editingId = id;

  const res = await fetch(`/api/events/${id}`, { credentials: 'same-origin' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    alert(data.error || '일정을 불러오지 못했습니다.');
    return;
  }
  const { event: ev } = await res.json();
  eventForm.event_date.value = ev.event_date;
  eventForm.start_time.value = ev.start_time;
  eventForm.end_time.value = ev.end_time;
  eventForm.instructor.value = ev.instructor;
  eventForm.title.value = ev.title;
  eventForm.content.value = ev.content || '';
  if (ev.image_key) {
    existingImageWrap.hidden = false;
    existingImageImg.src = `/api/images/${ev.image_key}`;
  }
  deleteBtn.hidden = false;
  eventModal.classList.add('open');
}

function closeEventModal() {
  eventModal.classList.remove('open');
}

cancelBtn.addEventListener('click', closeEventModal);
eventModal.addEventListener('click', (e) => {
  if (e.target === eventModal) closeEventModal();
});

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';
  const formData = new FormData(eventForm);
  if (removeImageCheckbox.checked) formData.set('remove_image', '1');

  const url = editingId ? `/api/events/${editingId}` : '/api/events';
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, { method, credentials: 'same-origin', body: formData });
  if (res.ok) {
    closeEventModal();
    render();
  } else {
    const data = await res.json().catch(() => ({}));
    formError.textContent = data.error || '저장에 실패했습니다.';
  }
});

deleteBtn.addEventListener('click', async () => {
  if (!editingId) return;
  if (!confirm('이 일정을 삭제하시겠습니까?')) return;

  const res = await fetch(`/api/events/${editingId}`, { method: 'DELETE', credentials: 'same-origin' });
  if (res.ok) {
    closeEventModal();
    render();
  } else {
    const data = await res.json().catch(() => ({}));
    formError.textContent = data.error || '삭제에 실패했습니다.';
  }
});

boot();
