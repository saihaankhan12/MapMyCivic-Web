import { useState } from "react";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

const noticeTone = {
  alert: "red",
  warning: "amber",
  info: "blue",
};

function PublicNotices() {
  const { notices, createNotice, currentUser } = usePortal();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState(currentUser?.departmentName ?? "");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createNotice({
        title,
        departmentId: currentUser?.departmentId,
        description,
        type,
      });
      setTitle("");
      setDepartment(currentUser?.departmentName ?? "");
      setDescription("");
      setType("info");
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
                Notices
              </p>
              <h1 className="mt-4 text-3xl font-bold text-slate-900">
                Department notices
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                Publish operational updates and internal announcements.
              </p>
            </div>

            <button
              onClick={() => setShowForm((value) => !value)}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {showForm ? "Close form" : "Create notice"}
            </button>
          </div>
        </section>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900">New notice</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Notice title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3"
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3"
                required
              />
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="info">Information</option>
                <option value="warning">Warning</option>
                <option value="alert">Critical</option>
              </select>
              <textarea
                placeholder="Notice details"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish notice"}
            </button>
          </form>
        ) : null}

        <section className="mt-8 space-y-4">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={notice.type.toUpperCase()}
                      tone={noticeTone[notice.type] ?? "slate"}
                    />
                    <StatusBadge label={notice.department} />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {notice.title}
                  </h2>
                </div>
                <p className="text-sm text-slate-500">{notice.date}</p>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {notice.description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default PublicNotices;
