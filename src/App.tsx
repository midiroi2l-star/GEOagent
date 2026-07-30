import { Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { IntakePage } from "./pages/IntakePage";
import { SurveyPage } from "./pages/SurveyPage";
import { ReportPage } from "./pages/ReportPage";

const CoachGuidePage = lazy(() => import("./pages/CoachGuidePage").then((m) => ({ default: m.CoachGuidePage })));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() =>
  import("./pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminSubmissionDetailPage = lazy(() =>
  import("./pages/admin/AdminSubmissionDetailPage").then((m) => ({ default: m.AdminSubmissionDetailPage }))
);

function PageFallback() {
  return <div className="p-16 text-center text-sm text-slate-400">불러오는 중...</div>;
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppShell>
                <LandingPage />
              </AppShell>
            }
          />
          <Route
            path="/start"
            element={
              <AppShell>
                <IntakePage />
              </AppShell>
            }
          />
          <Route
            path="/survey"
            element={
              <AppShell>
                <SurveyPage />
              </AppShell>
            }
          />
          <Route
            path="/report"
            element={
              <AppShell>
                <ReportPage />
              </AppShell>
            }
          />
          <Route
            path="/coach-guide"
            element={
              <AppShell>
                <Suspense fallback={<PageFallback />}>
                  <CoachGuidePage />
                </Suspense>
              </AppShell>
            }
          />
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminLoginPage />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/admin/submissions/:id"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSubmissionDetailPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
