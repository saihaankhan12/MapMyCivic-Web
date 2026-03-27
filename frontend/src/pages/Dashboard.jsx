import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DepartmentCard from "../components/DepartmentCard";
import IssueCard from "../components/IssueCard";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

const markerColors = {
  Critical: "#dc2626",
  High: "#d97706",
  Medium: "#2563eb",
};

function Dashboard() {
  const navigate = useNavigate();
  const { departments, issues, loading, error } = usePortal();
  const [query, setQuery] = useState("");

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const text = query.toLowerCase();
        return (
          issue.title.toLowerCase().includes(text) ||
          issue.location.toLowerCase().includes(text) ||
          issue.department.toLowerCase().includes(text)
        );
      }),
    [issues, query]
  );

  const stats = {
    total: issues.length,
    verified: issues.filter((issue) => issue.verificationStatus === "Verified by Model").length,
    manualReview: issues.filter(
      (issue) => issue.verificationStatus === "Needs Manual Review"
    ).length,
    pendingCctv: issues.filter(
      (issue) => issue.cctvStatus === "Frames Pending" || issue.cctvStatus === "Clip Uploaded"
    ).length,
  };

  const priorityQueue = [...issues]
    .filter((issue) => issue.workflowStatus !== "Resolved")
    .sort((left, right) => right.verificationConfidence - left.verificationConfidence)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="overflow-hidden rounded-[2.25rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_32%),linear-gradient(135deg,#0f172a,#1e293b_48%,#0f766e)] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Operations Overview
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Department review and response dashboard
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-200">
            Live issue visibility across departments, verification status, and CCTV review queues.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <StatusBadge label={`${stats.total} active reports`} tone="blue" />
            <StatusBadge label={`${stats.verified} verified`} tone="green" />
            <StatusBadge label={`${stats.manualReview} manual review`} tone="violet" />
            <StatusBadge label={`${stats.pendingCctv} CCTV pending`} tone="amber" />
          </div>
        </section>

        {error ? (
          <p className="mt-6 rounded-3xl bg-red-50 px-5 py-4 text-sm text-red-700">
            Backend connection issue: {error}
          </p>
        ) : null}

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-slate-500">Issues received</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats.total}</h2>
          </div>
          <div className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-slate-500">Verified</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats.verified}</h2>
          </div>
          <div className="rounded-[1.75rem] border border-violet-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-slate-500">Manual review</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats.manualReview}</h2>
          </div>
          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-slate-500">CCTV pending</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{stats.pendingCctv}</h2>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  City Coverage
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Issue map
                </h2>
              </div>
              <button
                onClick={() => navigate("/map")}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Open full map
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl">
              <MapContainer
                center={[19.076, 72.8777]}
                zoom={13}
                style={{ height: "360px", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {issues.map((issue) => (
                  <CircleMarker
                    key={issue.id}
                    center={[issue.lat, issue.lng]}
                    radius={8}
                    pathOptions={{
                      color: markerColors[issue.severity] ?? "#475569",
                      fillColor: markerColors[issue.severity] ?? "#475569",
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup>
                      <div className="space-y-1">
                        <h3 className="font-semibold">{issue.title}</h3>
                        <p className="text-sm text-slate-600">{issue.location}</p>
                        <p className="text-xs text-slate-500">{issue.department}</p>
                        <button
                          onClick={() => navigate(`/issue/${issue.id}`)}
                          className="text-sm font-semibold text-blue-600"
                        >
                          Review issue
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Department desks</h2>
              <p className="text-sm text-slate-500">
                Active queues across all departments.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              View all desks
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {departments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                issues={issues.filter((issue) => issue.departmentId === department.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Priority queue
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Highest-confidence reports
            </h2>
            <div className="mt-5 space-y-4">
              {priorityQueue.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => navigate(`/issue/${issue.id}`)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50/90 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                    <StatusBadge label={`${issue.verificationConfidence}% confidence`} tone="green" />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {issue.department} | {issue.workflowStatus}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Search
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Issue search
              </h2>
            </div>

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, location, or department"
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {loading ? (
              <p className="mt-5 text-sm text-slate-500">Loading issue queue...</p>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {filteredIssues.slice(0, 4).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
