const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function formatDateKey(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

// 클럽 기준 시간대(KST)로 "오늘"을 계산해 오늘 셀을 강조 표시한다.
export function getTodayKeyKST() {
  const now = new Date();
  const kst = new Date(now.getTime() + (9 * 60 - now.getTimezoneOffset()) * 60000);
  return formatDateKey(kst.getFullYear(), kst.getMonth() + 1, kst.getDate());
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export function renderCalendar({ container, year, month, eventsByDate, isAdmin, onDayAdd, onEventClick }) {
  container.innerHTML = '';

  const weekdaysRow = document.createElement('div');
  weekdaysRow.className = 'cal-weekdays';
  WEEKDAYS.forEach((w, i) => {
    const el = document.createElement('div');
    el.className = 'cal-weekday' + (i === 0 ? ' sun' : i === 6 ? ' sat' : '');
    el.textContent = w;
    weekdaysRow.appendChild(el);
  });
  container.appendChild(weekdaysRow);

  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();
  const todayKey = getTodayKeyKST();

  for (let i = 0; i < startWeekday; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-cell empty';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(year, month, day);
    const weekday = new Date(year, month - 1, day).getDay();

    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    if (dateKey === todayKey) cell.classList.add('today');

    const dayNum = document.createElement('div');
    dayNum.className = 'cal-daynum' + (weekday === 0 ? ' sun' : weekday === 6 ? ' sat' : '');
    dayNum.textContent = String(day);
    cell.appendChild(dayNum);

    if (isAdmin && onDayAdd) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'cal-add-btn';
      addBtn.textContent = '+';
      addBtn.title = '일정 등록';
      addBtn.setAttribute('aria-label', `${dateKey} 일정 등록`);
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onDayAdd(dateKey);
      });
      cell.appendChild(addBtn);
    }

    const list = document.createElement('div');
    list.className = 'cal-events';
    const dayEvents = eventsByDate[dateKey] || [];
    dayEvents.forEach((ev) => {
      const clickable = isAdmin || !!ev.has_detail;
      const item = document.createElement('div');
      item.className = 'cal-event' + (clickable ? ' clickable' : '');
      item.innerHTML = `
        <span class="cal-event-time">${escapeHtml(ev.start_time)}</span>
        <span class="cal-event-instructor">${escapeHtml(ev.instructor)}</span>
        <span class="cal-event-title">${escapeHtml(ev.title)}</span>
      `;
      if (clickable && onEventClick) {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          onEventClick(ev.id);
        });
      }
      list.appendChild(item);
    });
    cell.appendChild(list);

    grid.appendChild(cell);
  }

  container.appendChild(grid);
}
