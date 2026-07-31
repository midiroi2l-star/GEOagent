import { fetchMeta, fetchEvents, fetchEvent } from './api.js';
import { renderCalendar, escapeHtml } from './calendar.js';

const calendarEl = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const modal = document.getElementById('event-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');

let allowedMonths = []; // [현재월, 전월]
let current = null;

async function init() {
  try {
    const meta = await fetchMeta();
    allowedMonths = [meta.current, meta.previous];
    current = { ...meta.current };
    render();
  } catch {
    calendarEl.innerHTML = '<p class="error">일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>';
  }
}

function isViewingCurrent() {
  return current.year === allowedMonths[0].year && current.month === allowedMonths[0].month;
}

async function render() {
  monthLabel.textContent = `${current.year}년 ${current.month}월`;
  prevBtn.disabled = !isViewingCurrent(); // 해당월을 볼 때만 전월로 이동 가능
  nextBtn.disabled = isViewingCurrent(); // 전월을 볼 때만 해당월로 이동 가능

  calendarEl.innerHTML = '<p class="loading">불러오는 중...</p>';
  try {
    const { events } = await fetchEvents(current.year, current.month);
    const eventsByDate = {};
    events.forEach((ev) => {
      (eventsByDate[ev.event_date] ??= []).push(ev);
    });
    renderCalendar({
      container: calendarEl,
      year: current.year,
      month: current.month,
      eventsByDate,
      isAdmin: false,
      onEventClick: openDetail,
    });
  } catch (e) {
    calendarEl.innerHTML = `<p class="error">${escapeHtml(e.error || '일정을 불러오지 못했습니다.')}</p>`;
  }
}

async function openDetail(id) {
  try {
    const { event: ev } = await fetchEvent(id);
    modalBody.innerHTML = `
      <h2>${escapeHtml(ev.title)}</h2>
      <p class="modal-meta">${escapeHtml(ev.event_date)} · ${escapeHtml(ev.start_time)}~${escapeHtml(ev.end_time)} · ${escapeHtml(ev.instructor)}</p>
      ${ev.content ? `<p class="modal-content">${escapeHtml(ev.content)}</p>` : ''}
      ${
        ev.image_key
          ? `<div class="modal-image">
              <img src="/api/images/${ev.image_key}" alt="첨부 이미지" />
              <a class="btn btn-primary" href="/api/images/${ev.image_key}?download=1" download>이미지 다운로드</a>
            </div>`
          : ''
      }
    `;
    modal.classList.add('open');
  } catch (e) {
    alert(e.error || '상세 정보를 불러오지 못했습니다.');
  }
}

function closeModal() {
  modal.classList.remove('open');
  modalBody.innerHTML = '';
}

prevBtn.addEventListener('click', () => {
  current = { ...allowedMonths[1] };
  render();
});

nextBtn.addEventListener('click', () => {
  current = { ...allowedMonths[0] };
  render();
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

init();
