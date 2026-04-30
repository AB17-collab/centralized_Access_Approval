import { useMemo, useState } from "react";
import { api } from "../../api/client";
import { CheckCircle2, Loader2 } from "lucide-react";

function SummaryRow({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 md:grid-cols-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="md:col-span-2">
        <div className="text-sm text-slate-900">{value || "—"}</div>
      </div>
    </div>
  );
}

export function ReviewSubmitStep({ data, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const payload = useMemo(() => {
    return {
      user: { name: data.userName, acf2_id: data.userAcf2Id },
      manager: { name: data.managerName, acf2_id: data.managerAcf2Id },
      request_type: data.requestType,
      selected_role_id: data.requestType === "update" ? data.selectedRoleId : null,
      role_name: data.roleName,
      role_description: data.roleDescription,
      primary_owner: data.primaryOwner,
      key_technology: data.keyTechnology,
      permissions: data.permissions || []
    };
  }, [data]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await api.requestAccess(payload);
      setResult(res);
      onSuccess?.(res);
    } catch (e) {
      setError(e?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-card">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Request submitted
            </div>
            <div className="text-sm text-slate-600">
              Request #{result.id} is currently <b>{result.status}</b>.
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Next
          </div>
          <div className="mt-2 text-sm text-slate-700">
            An admin can toggle this request to <b>Approved</b> in the Admin dashboard.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
        <div className="mb-3 text-sm font-semibold text-slate-900">
          Review summary
        </div>

        <SummaryRow label="User Name" value={data.userName} />
        <SummaryRow label="User ACF2 ID" value={data.userAcf2Id} />
        <SummaryRow label="Manager Name" value={data.managerName} />
        <SummaryRow label="Manager ACF2 ID" value={data.managerAcf2Id} />
        <SummaryRow label="Request Type" value={data.requestType} />
        <SummaryRow
          label="Selected Role ID"
          value={data.requestType === "update" ? String(data.selectedRoleId || "") : ""}
        />
        <SummaryRow label="Role Name" value={data.roleName} />
        <SummaryRow label="Role Description" value={data.roleDescription} />
        <SummaryRow label="Primary Owner" value={data.primaryOwner} />
        <SummaryRow label="Key Technology" value={data.keyTechnology} />

        <div className="py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Permissions
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(data.permissions || []).length ? (
              data.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-enterprise-50 px-3 py-1 text-xs font-medium text-enterprise-800 ring-1 ring-enterprise-200"
                >
                  {p}
                </span>
              ))
            ) : (
              <div className="text-sm text-slate-500">—</div>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-enterprise-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-enterprise-700 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Submit Request
        </button>
      </div>
    </div>
  );
}

