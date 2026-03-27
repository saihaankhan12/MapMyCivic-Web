import { useNavigate } from "react-router-dom";
import DepartmentCard from "../components/DepartmentCard";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

function AdminPanel() {
  const navigate = useNavigate();
  const { departments, issues } = usePortal();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="rounded-[2rem] bg-slate-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">
            Department Directory
          </p>
          <h1 className="mt-4 text-3xl font-bold">Department workspaces</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Access issue queues and review activity by department.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              issues={issues.filter((issue) => issue.departmentId === department.id)}
            />
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Escalations
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Critical issues
              </h2>
            </div>
            <button
              onClick={() => navigate("/reports")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Open reports
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {issues
              .filter((issue) => issue.severity === "Critical")
              .map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-3xl border border-red-200 bg-red-50 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {issue.location} | {issue.department}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={issue.workflowStatus} tone="red" />
                      <StatusBadge label={issue.cctvStatus} tone="amber" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPanel;
