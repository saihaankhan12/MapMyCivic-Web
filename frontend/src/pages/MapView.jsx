import { useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { usePortal } from "../context/usePortal";

const markerColors = {
  Critical: "#dc2626",
  High: "#d97706",
  Medium: "#2563eb",
};

function MapView() {
  const navigate = useNavigate();
  const { issues } = usePortal();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a,#164e63)] p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200">
            Live Issue Map
          </p>
          <h1 className="mt-4 text-3xl font-bold">Citywide issue visibility by department</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
            Use this map to locate citizen-reported issues, see which department owns the case, and jump into CCTV or manual review.
          </p>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm">
          <MapContainer
            center={[19.076, 72.8777]}
            zoom={13}
            style={{ height: "560px", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {issues.map((issue) => (
              <CircleMarker
                key={issue.id}
                center={[issue.lat, issue.lng]}
                radius={9}
                pathOptions={{
                  color: markerColors[issue.severity] ?? "#475569",
                  fillColor: markerColors[issue.severity] ?? "#475569",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-slate-600">{issue.location}</p>
                    <p className="text-xs text-slate-500">{issue.department}</p>
                    <p className="text-xs text-slate-500">{issue.verificationStatus}</p>
                    <button
                      onClick={() => navigate(`/issue/${issue.id}`)}
                      className="text-sm font-semibold text-blue-600"
                    >
                      Open review desk
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          <div className="mt-6 flex flex-wrap gap-3">
            <StatusBadge label="Critical issue" tone="red" />
            <StatusBadge label="High severity" tone="amber" />
            <StatusBadge label="Medium severity" tone="blue" />
            <StatusBadge label="Click marker to open CCTV review" tone="violet" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default MapView;
