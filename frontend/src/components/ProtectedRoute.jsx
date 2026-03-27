import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePortal } from "../context/usePortal";

function ProtectedRoute() {
  const location = useLocation();
  const { currentUser, loading } = usePortal();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-500">
        Loading admin session...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
