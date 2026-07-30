import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="text-xl">🧭</span>
          <span className="text-lg font-semibold tracking-tight">강점나침반</span>
          <span className="hidden text-xs font-medium text-brand-gold sm:inline">STRENGTH COMPASS</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-slate-200">
          {!isHome && (
            <Link to="/" className="hover:text-white">
              홈
            </Link>
          )}
          <Link to="/start" className="hover:text-white">
            강점 진단 시작
          </Link>
          <Link to="/coach-guide" className="hover:text-white">
            코치 가이드
          </Link>
        </nav>
      </div>
    </header>
  );
}
