import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "@/api/auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
  const { data: session, isLoading, isError } = useAuthSession();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            <div className="absolute inset-0 rounded-xl blur-md bg-indigo-500/20 -z-10" />
          </div>
          <p className="text-xs text-zinc-500 tracking-wide font-mono">Authenticating session...</p>
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
