// 성경 66권: [약어, 이름]. 배열 인덱스 + 1 = 책 번호(창세기 1 … 요한계시록 66)
export const BOOKS: ReadonlyArray<readonly [string, string]> = [
  ['창', '창세기'], ['출', '출애굽기'], ['레', '레위기'], ['민', '민수기'], ['신', '신명기'],
  ['수', '여호수아'], ['삿', '사사기'], ['룻', '룻기'], ['삼상', '사무엘상'], ['삼하', '사무엘하'],
  ['왕상', '열왕기상'], ['왕하', '열왕기하'], ['대상', '역대상'], ['대하', '역대하'], ['스', '에스라'],
  ['느', '느헤미야'], ['에', '에스더'], ['욥', '욥기'], ['시', '시편'], ['잠', '잠언'],
  ['전', '전도서'], ['아', '아가'], ['사', '이사야'], ['렘', '예레미야'], ['애', '예레미야애가'],
  ['겔', '에스겔'], ['단', '다니엘'], ['호', '호세아'], ['욜', '요엘'], ['암', '아모스'],
  ['옵', '오바댜'], ['욘', '요나'], ['미', '미가'], ['나', '나훔'], ['합', '하박국'],
  ['습', '스바냐'], ['학', '학개'], ['슥', '스가랴'], ['말', '말라기'],
  ['마', '마태복음'], ['막', '마가복음'], ['눅', '누가복음'], ['요', '요한복음'], ['행', '사도행전'],
  ['롬', '로마서'], ['고전', '고린도전서'], ['고후', '고린도후서'], ['갈', '갈라디아서'], ['엡', '에베소서'],
  ['빌', '빌립보서'], ['골', '골로새서'], ['살전', '데살로니가전서'], ['살후', '데살로니가후서'], ['딤전', '디모데전서'],
  ['딤후', '디모데후서'], ['딛', '디도서'], ['몬', '빌레몬서'], ['히', '히브리서'], ['약', '야고보서'],
  ['벧전', '베드로전서'], ['벧후', '베드로후서'], ['요일', '요한일서'], ['요이', '요한이서'], ['요삼', '요한삼서'],
  ['유', '유다서'], ['계', '요한계시록'],
]

export interface PassageRef {
  book: number // 1-66
  chapter: number
  from: number
  to: number
}

const ABBR_TO_BOOK = new Map(BOOKS.map(([abbr], i) => [abbr, i + 1]))

/** "창1:1-13" 같은 약식 표기를 파싱합니다. */
export function parseRef(s: string): PassageRef {
  const m = /^([가-힣]+)(\d+):(\d+)-(\d+)$/.exec(s)
  const book = m && ABBR_TO_BOOK.get(m[1])
  if (!m || !book) throw new Error(`잘못된 본문 표기: ${s}`)
  return { book, chapter: Number(m[2]), from: Number(m[3]), to: Number(m[4]) }
}

export function bookName(book: number): string {
  return BOOKS[book - 1][1]
}

/** 시편은 '편', 나머지는 '장'을 쓰지 않고 관례대로 "창세기 1:1-13" 형식으로 표기 */
export function formatRef(r: PassageRef): string {
  return `${bookName(r.book)} ${r.chapter}:${r.from}-${r.to}`
}

export function formatRefShort(r: PassageRef): string {
  return `${BOOKS[r.book - 1][0]}${r.chapter}:${r.from}-${r.to}`
}
