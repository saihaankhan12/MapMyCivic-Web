import { useNavigate, useLocation } from "react-router-dom";
import logo from "../images/logo.png";
import { usePortal } from "../context/usePortal";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signOut } = usePortal();

  const navItem = (name, path) => (
    <button
      onClick={() => navigate(path)}
      className={`rounded-full px-4 py-2.5 text-sm transition ${
        location.pathname === path
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur md:px-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="MapMyCivic"
            className="h-11 w-11 rounded-2xl object-cover"
          />

          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              MapMyCivic Admin
            </h1>
            <p className="text-sm text-slate-500">
              Department operations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-full bg-slate-50 p-1.5 font-medium">
          {navItem("Dashboard", "/dashboard")}
          {navItem("Map View", "/map")}
          {navItem("Reports", "/reports")}
          {navItem("Departments", "/admin")}
          {navItem("Notices", "/notices")}
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser.departmentName}
              </p>
            </div>
          ) : null}

          {currentUser ? (
            <button
              onClick={() => {
                signOut();
                navigate("/signin");
              }}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
