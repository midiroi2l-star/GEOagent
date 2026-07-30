export function Footer() {
  return (
    <footer className="no-print border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
      <p>© {new Date().getFullYear()} 강점나침반 StrengthCompass. 강점 기반 커리어·라이프 컨설팅.</p>
      <p className="mt-1">본 서비스는 VIA 성격강점 분류체계(공개 학술 프레임워크)를 기반으로 한 자기이해 도구이며, 임상적 진단을 대체하지 않습니다.</p>
    </footer>
  );
}
