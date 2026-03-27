import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

const severityTone = {
  Critical: "red",
  High: "amber",
  Medium: "blue",
};

function Reports() {
  const navigate = useNavigate();
  const { issues } = usePortal();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
            Reports Log
          </p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Citizen reports and verification outcomes
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            This queue shows how each mobile-app complaint moved through model verification, department assignment, and CCTV evidence review.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => navigate(`/issue/${issue.id}`)}
              className="grid w-full gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg lg:grid-cols-[1.2fr_0.8fr]"
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={issue.category} />
                  <StatusBadge
                    label={issue.severity}
                    tone={severityTone[issue.severity] ?? "slate"}
                  />
                  <StatusBadge label={issue.workflowStatus} tone="violet" />
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {issue.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {issue.description}
                </p>
              </div>

              <div className="grid gap-3 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Report source
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{issue.reportedBy}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Verification
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {issue.verificationStatus} ({issue.verificationConfidence}%)
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Department
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{issue.department}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    CCTV review
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{issue.cctvStatus}</p>
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Reports;
