import { FiFilm, FiUploadCloud } from "react-icons/fi";

function CCTVUploadPanel({
  cameraId,
  frames = [],
  onUpload,
  uploading = false,
  clipName = "",
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
            CCTV Review
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Upload 10-second CCTV clip
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload a clip for case review.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Camera
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {cameraId}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
        <FiUploadCloud size={28} className="text-slate-600" />
        <p className="mt-4 text-base font-semibold text-slate-900">
          Choose CCTV clip
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Recommended: MP4, 10 seconds
        </p>
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file && onUpload) {
              onUpload(file);
            }
          }}
        />
      </label>

      {clipName || frames.length > 0 ? (
        <div className="mt-6">
          <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
              Uploaded clip
            </p>
            <p className="mt-2 text-sm font-medium">
              {uploading ? "Uploading clip..." : clipName || "Latest CCTV review clip"}
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {frames.map((frame) => (
              <div
                key={frame.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex h-24 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
                  <FiFilm size={24} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Frame checkpoint
                </p>
                <p className="text-xs text-slate-500">{frame.time}</p>
                <p className="mt-1 text-xs text-slate-500">{frame.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CCTVUploadPanel;
