import { getAllowedMonths } from '../_utils/date.js';
import { json } from '../_utils/events.js';

// 일반 사용자가 조회 가능한 두 달(해당월/전월)을 서버 기준(KST)으로 알려준다.
export async function onRequestGet() {
  const [current, previous] = getAllowedMonths();
  return json({ current, previous });
}
