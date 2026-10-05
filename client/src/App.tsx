import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig, AnimatePresence, motion, LazyMotion, domMax } from "motion/react";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { ProtectedRoute, PublicRoute } from "@/components/layout/ProtectedRoute";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { defaultTransition } from "@/lib/motion";

const LandingPage = lazy(() =>
  import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const WorkspacePage = lazy(() =>
  import("@/pages/WorkspacePage").then((m) => ({ default: m.WorkspacePage }))
);
const MemoriesPage = lazy(() =>
  import("@/pages/MemoriesPage").then((m) => ({ default: m.MemoriesPage }))
);

function PageSkeletonFallback() {
  return (
    <div className="flex-1 min-h-[calc(100dvh-3.5rem)] bg-background flex flex-col p-6 sm:p-10 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 rounded-[100px] bg-muted" />
        <div className="h-8 w-24 rounded-[100px] bg-muted" />
      </div>
      <div className="h-10 w-80 max-w-full rounded-[var(--radius-base)] bg-muted" />
      <div className="h-4 w-96 max-w-full rounded-[var(--radius-base)] bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        <div className="h-48 rounded-[var(--radius-base)] bg-card border border-border" />
        <div className="h-48 rounded-[var(--radius-base)] bg-card border border-border" />
        <div className="h-48 rounded-[var(--radius-base)] bg-card border border-border" />
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache to avoid redundant network refetches
      retry: (failureCount, error: any) => {
        // Don't retry 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location}>
          {/* Public / Auth routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/workspace/:workspaceId"
              element={<WorkspacePage />}
            />
            <Route path="/memories" element={<MemoriesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user" transition={defaultTransition}>
        <LazyMotion features={domMax} strict={false}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system">
              <BrowserRouter>
                <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-150">
                  <Navbar />
                  <Suspense fallback={<PageSkeletonFallback />}>
                    <AnimatedRoutes />
                  </Suspense>
                </div>
              </BrowserRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </LazyMotion>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
