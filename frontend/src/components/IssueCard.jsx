import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const severityTone = {
  Critical: "red",
  High: "amber",
  Medium: "blue",
};

const verificationTone = {
  "Verified by Model": "green",
  "Needs Manual Review": "violet",
};

function IssueCard({ issue }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/issue/${issue.id}`)}
      className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge label={issue.category} />
        <StatusBadge
          label={issue.severity}
          tone={severityTone[issue.severity] ?? "slate"}
        />
        <StatusBadge
          label={issue.verificationStatus}
          tone={verificationTone[issue.verificationStatus] ?? "slate"}
        />
      </div>

      <h3 className="text-lg font-bold text-slate-900">{issue.title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {issue.description}
      </p>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <p>{issue.location}</p>
        <p>{issue.time}</p>
        <p>{issue.department}</p>
        <p>{issue.cctvStatus}</p>
      </div>
    </button>
  );
}

export default IssueCard;
