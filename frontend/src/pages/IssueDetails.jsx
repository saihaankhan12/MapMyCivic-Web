import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdAccessTime } from "react-icons/md";
import CCTVUploadPanel from "../components/CCTVUploadPanel";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

const severityTone = {
  Critical: "red",
  High: "amber",
  Medium: "blue",
};

const verificationTone = {
  "Verified by Model": "green",
  "Needs Manual Review": "violet",
};

function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { issues, saveIssueNotes, saveIssueStatus, uploadCctvClip } = usePortal();
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clipName, setClipName] = useState("");

  const issue = useMemo(
    () => issues.find((item) => item.id === Number.parseInt(id, 10)),
    [id, issues]
  );

  useEffect(() => {
    setNotes(issue?.notes ?? "");
  }, [issue?.notes]);

  if (!issue) {
    return <div>Issue not found</div>;
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true);

    try {
      await saveIssueNotes(issue.id, notes);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleUploadClip = async (file) => {
    setUploading(true);
    setClipName(file.name);

    try {
      await uploadCctvClip(issue.id, file);
    } finally {
      setUploading(false);
    }
  };

  const handleMarkResolved = async () => {
    setSavingStatus(true);

    try {
      await saveIssueStatus(issue.id, {
        workflowStatus: "Resolved",
        cctvStatus:
          issue.cctvStatus === "No Clip Yet" ? "Frames Reviewed" : issue.cctvStatus,
      });
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <FaArrowLeft />
          Back
        </button>

        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge label={issue.category} />
                <StatusBadge
                  label={issue.severity}
                  tone={severityTone[issue.severity] ?? "slate"}
                />
                <StatusBadge
                  label={issue.verificationStatus}
                  tone={verificationTone[issue.verificationStatus] ?? "slate"}
                />
                <StatusBadge label={issue.workflowStatus} tone="blue" />
              </div>

              <h1 className="mt-5 text-3xl font-bold text-slate-900">
                {issue.title}
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                {issue.description}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900 px-6 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Assigned department
              </p>
              <p className="mt-2 text-lg font-semibold">{issue.department}</p>
              <p className="mt-2 text-sm text-slate-300">
                CCTV status: {issue.cctvStatus}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <IoLocationOutline />
                <span>{issue.location}</span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                Ward
              </p>
              <p className="mt-1 font-semibold text-slate-900">{issue.ward}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-600">
                <MdAccessTime />
                <span>{issue.time}</span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                Report source
              </p>
              <p className="mt-1 font-semibold text-slate-900">{issue.reportedBy}</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Model confidence
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {issue.verificationConfidence}%
              </p>
              <p className="mt-2 text-sm text-slate-500">Verification score</p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Citizen evidence
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {issue.evidenceCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">Uploaded files</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Case summary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Review status
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Source</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Submitted through the citizen mobile app and assigned to {issue.department}.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Verification</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {issue.verificationStatus} with a confidence score of {issue.verificationConfidence}%.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Workflow</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Current status: {issue.workflowStatus}.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Source upload
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Uploaded evidence
              </h2>

              <div className="mt-5 space-y-3">
                {(issue.sourceUploads ?? []).length > 0 ? (
                  issue.sourceUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {upload.originalFilename}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {upload.filePath}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No source upload details available.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Model detections
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Detection log
              </h2>

              <div className="mt-5 space-y-4">
                {(issue.detections ?? []).length > 0 ? (
                  issue.detections.map((detection) => (
                    <div
                      key={detection.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge label={detection.issueType} tone="blue" />
                        <StatusBadge label={detection.model} />
                        <StatusBadge
                          label={`${Math.round(Number(detection.confidence))}%`}
                          tone="green"
                        />
                      </div>

                      <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-900">Label:</span>{" "}
                          {detection.label}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Category:</span>{" "}
                          {detection.category}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">Department:</span>{" "}
                          {detection.departmentId}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">BBox:</span>{" "}
                          {Array.isArray(detection.bbox)
                            ? detection.bbox.map((value) => Math.round(Number(value))).join(", ")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No detection log available.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Officer notes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Department review notes
              </h2>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                placeholder="Add internal review notes"
                className="mt-5 w-full rounded-3xl border border-slate-200 px-4 py-4 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="mt-4 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingNotes ? "Saving notes..." : "Save notes"}
              </button>

              <button
                onClick={handleMarkResolved}
                disabled={savingStatus}
                className="mt-3 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingStatus ? "Updating status..." : "Mark issue resolved"}
              </button>
            </section>
          </div>

          <div className="space-y-6">
            <CCTVUploadPanel
              cameraId={issue.cctvCameraId}
              frames={issue.cctvFrames}
              onUpload={handleUploadClip}
              uploading={uploading}
              clipName={clipName}
            />

            <section className="rounded-[2rem] bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                CCTV review
              </p>
              <h2 className="mt-2 text-2xl font-bold">Reference points</h2>
              <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
                <p>Confirm location and camera coverage.</p>
                <p>Validate visibility across the extracted frames.</p>
                <p>Record any mismatch before closure or escalation.</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

export default IssueDetail;
