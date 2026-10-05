import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "@/api/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { data: session, isLoading, isError } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-base)] bg-card border border-border shadow-none">
            <Loader2 className="h-5 w-5 animate-spin text-category-chat" />
          </div>
          <p className="text-xs text-muted-foreground tracking-wide font-mono">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (isError || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const { data: session, isLoading } = useAuthSession();

  if (isLoading) {
    return null;
  }

  if (session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
