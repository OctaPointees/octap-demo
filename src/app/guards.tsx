import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../queries/useSession";
import type { PortalRole } from "../types/domain";
import { homeFor } from "../utils/constants";

export function RequireRole({ role }: { role: PortalRole }) {
  const session = useSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (session.user.role !== role) return <Navigate to={homeFor(session.user.role)} replace />;
  return <Outlet />;
}

export function RootRedirect() {
  const session = useSession();
  return <Navigate to={session ? homeFor(session.user.role) : "/login"} replace />;
}
