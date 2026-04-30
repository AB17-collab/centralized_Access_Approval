import { useEffect, useState } from "react";
import { api } from "../api/client";
import { RefreshCcw, Check, Clock } from "lucide-react";

function StatusPill({ status }) {
  const approved = status === "Approved";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        approved
          ? "bg-green-50 text-green-700 ring-green-200"
          : "bg-amber-50 text-amber-700 ring-amber-200"
      ].join(" ")}
    >
      {approved ? <Check className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

export function AdminDashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await api.listRequests();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id, current) {
    const next = current === "Approved" ? "Pending" : "Approved";
    try {
      await api.updateRequestStatus(id, next);
      await load();
    } catch (e) {
      setError(e?.message || "Failed to update status.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {items.length} request(s)
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-card">
        <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">User</div>
          <div className="col-span-3">Manager</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {items.length ? (
          items.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-12 gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0"
            >
              <div className="col-span-1 font-medium text-slate-900">#{r.id}</div>
              <div className="col-span-2">
                <StatusPill status={r.status} />
              </div>
              <div className="col-span-3">
                <div className="font-medium text-slate-900">{r.user?.name}</div>
                <div className="text-xs text-slate-600">{r.user?.acf2_id}</div>
              </div>
              <div className="col-span-3">
                <div className="font-medium text-slate-900">{r.manager?.name}</div>
                <div className="text-xs text-slate-600">{r.manager?.acf2_id}</div>
              </div>
              <div className="col-span-2">
                <div className="font-medium text-slate-900">{r.role_name}</div>
                <div className="text-xs text-slate-600">{r.request_type}</div>
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => toggle(r.id, r.status)}
                  className="rounded-lg bg-enterprise-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-enterprise-700"
                >
                  Toggle
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-slate-600">
            {loading ? "Loading…" : "No requests yet."}
          </div>
        )}
      </div>
    </div>
  );
}

