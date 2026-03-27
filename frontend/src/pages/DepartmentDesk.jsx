import { useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import IssueCard from "../components/IssueCard";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

function DepartmentDesk() {
  const { departmentId } = useParams();
  const { departments, issues } = usePortal();

  const department = useMemo(
    () => departments.find((item) => item.id === departmentId) ?? departments[0],
    [departmentId, departments]
  );

  const departmentIssues = useMemo(
    () => issues.filter((issue) => issue.departmentId === department?.id),
    [department?.id, issues]
  );

  const pendingReview = departmentIssues.filter(
    (issue) =>
      issue.cctvStatus === "Frames Pending" || issue.cctvStatus === "Clip Uploaded"
  );

  if (!department) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="rounded-[2rem] bg-slate-900 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">
            Department Desk
          </p>
          <h1 className="mt-4 text-3xl font-bold">{department.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Current review queue, verification activity, and open workload for this department.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <StatusBadge label={`${departmentIssues.length} assigned issues`} tone="blue" />
            <StatusBadge label={`${pendingReview.length} CCTV reviews pending`} tone="amber" />
            <StatusBadge label={department.zone} tone="violet" />
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Critical cases</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {departmentIssues.filter((issue) => issue.severity === "Critical").length}
            </h2>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Awaiting CCTV review</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {pendingReview.length}
            </h2>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Manual verification</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {
                departmentIssues.filter(
                  (issue) => issue.verificationStatus === "Needs Manual Review"
                ).length
              }
            </h2>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">Assigned issues</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {departmentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DepartmentDesk;
