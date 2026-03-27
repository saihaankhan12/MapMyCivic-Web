import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function DepartmentCard({ department, issues }) {
  const navigate = useNavigate();

  const openCases = issues.filter(
    (issue) => issue.workflowStatus !== "Resolved"
  ).length;
  const pendingCctv = issues.filter(
    (issue) => issue.cctvStatus === "Frames Pending" || issue.cctvStatus === "Clip Uploaded"
  ).length;
  const criticalCases = issues.filter(
    (issue) => issue.severity === "Critical"
  ).length;

  return (
    <button
      onClick={() => navigate(`/departments/${department.id}`)}
      className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            {department.zone}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {department.name}
          </h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${department.color}`}>
          {department.shortName}
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <StatusBadge label={`${openCases} open cases`} tone="blue" />
        <StatusBadge label={`${pendingCctv} CCTV pending`} tone="amber" />
        <StatusBadge label={`${criticalCases} critical`} tone="red" />
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Open the department queue and current review workload.
      </p>
    </button>
  );
}

export default DepartmentCard;
