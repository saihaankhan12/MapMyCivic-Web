import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePortal } from "../context/usePortal";

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { departments, signIn } = usePortal();
  const [email, setEmail] = useState("pwd@mapmycivic.gov");
  const [password, setPassword] = useState("pwd123");
  const [departmentId, setDepartmentId] = useState("pwd");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!departments.length) {
      return;
    }

    if (!departments.some((department) => department.id === departmentId)) {
      setDepartmentId(departments[0].id);
    }
  }, [departmentId, departments]);

  const demoAccounts = useMemo(
    () => ["pwd@mapmycivic.gov", "sanitation@mapmycivic.gov", "electricity@mapmycivic.gov"],
    []
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signIn({ email, password, departmentId });
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#0f172a,#111827_45%,#172554)] px-6 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.35)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.32),_transparent_42%),linear-gradient(160deg,#0f172a,#111827_45%,#1d4ed8)] p-10 text-white md:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-200">
            MapMyCivic
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight md:text-5xl">
            Department operations portal
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-200">
            Review reported issues, manage department queues, and process CCTV-based verification.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold">Issue intake</p>
              <p className="mt-2 text-sm text-slate-200">Department-level review of citizen reports.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold">Verification</p>
              <p className="mt-2 text-sm text-slate-200">Model confidence and CCTV-backed validation.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold">Action routing</p>
              <p className="mt-2 text-sm text-slate-200">Escalation and resolution by department desk.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Department sign in
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to access your department workspace.
          </p>

          <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">
              Work email
            </label>
            <input
              type="email"
              placeholder="officer@city.gov"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <label className="text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-2xl bg-slate-900 p-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Open portal"}
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Demo access
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sample accounts are seeded for local review, including {demoAccounts.join(", ")}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
