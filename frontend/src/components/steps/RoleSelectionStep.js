import { useEffect, useMemo, useState } from "react";
import { Wand2, Database, ChevronDown, BadgeCheck } from "lucide-react";
import { api } from "../../api/client";

const KEY_TECH_OPTIONS = [
  "AWS",
  "Azure",
  "GCP",
  "Kafka",
  "Splunk",
  "OpenShift",
  "Databases",
  "GitHub",
  "Other"
];

function RadioCard({ checked, onChange, title, description }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        "w-full rounded-xl border p-4 text-left transition",
        checked
          ? "border-enterprise-600 bg-enterprise-50 shadow-sm"
          : "border-slate-200 bg-white/80 hover:bg-white"
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-600">{description}</div>
        </div>
        <div
          className={[
            "mt-1 h-4 w-4 rounded-full border",
            checked ? "border-enterprise-600 bg-enterprise-600" : "border-slate-300 bg-white"
          ].join(" ")}
        />
      </div>
    </button>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-enterprise-400 focus:ring-2 focus:ring-enterprise-100"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-enterprise-400 focus:ring-2 focus:ring-enterprise-100"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm shadow-sm outline-none focus:border-enterprise-400 focus:ring-2 focus:ring-enterprise-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function isValidRoleName(roleName) {
  // Format: BU_Squad_Role_Location (4 underscore-separated tokens).
  return /^[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+_[A-Za-z0-9]+$/.test(
    (roleName || "").trim()
  );
}

export function RoleSelectionStep({ data, setData }) {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingRoles(true);
      try {
        const res = await api.listRoles();
        if (!cancelled) setRoles(res || []);
      } catch (_) {
        if (!cancelled) setRoles([]);
      } finally {
        if (!cancelled) setLoadingRoles(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRole = useMemo(() => {
    if (!data.selectedRoleId) return null;
    return roles.find((r) => r.id === data.selectedRoleId) || null;
  }, [roles, data.selectedRoleId]);

  async function runSuggest() {
    setAiError("");
    setAiLoading(true);
    try {
      const res = await api.suggestRole(data.jobDescription || "");
      setData((d) => ({
        ...d,
        roleName: res.suggested_role_name || d.roleName,
        permissions: Array.isArray(res.permissions) ? res.permissions : d.permissions,
        aiRationale: res.rationale || ""
      }));
    } catch (e) {
      setAiError(e?.message || "Suggestion failed.");
    } finally {
      setAiLoading(false);
    }
  }

  const roleNameOk = data.requestType !== "update" ? isValidRoleName(data.roleName) : true;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <RadioCard
          checked={data.requestType === "create"}
          onChange={() => setData((d) => ({ ...d, requestType: "create", selectedRoleId: null }))}
          title="Create New Role"
          description="Provision access via a new persona-based role."
        />
        <RadioCard
          checked={data.requestType === "update"}
          onChange={() => setData((d) => ({ ...d, requestType: "update" }))}
          title="Update Existing"
          description="Request changes to an existing role’s access."
        />
        <RadioCard
          checked={data.requestType === "copy"}
          onChange={() => setData((d) => ({ ...d, requestType: "copy", selectedRoleId: null }))}
          title="Copy Role"
          description="Clone an existing role and tweak it for your team."
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-enterprise-700" />
            <div className="text-sm font-semibold text-slate-900">
              AI Suggestion (mock)
            </div>
          </div>
          <button
            type="button"
            onClick={runSuggest}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-enterprise-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-enterprise-700 disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" />
            {aiLoading ? "Suggesting…" : "Suggest Role"}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Describe your job">
            <Textarea
              value={data.jobDescription}
              onChange={(v) => setData((d) => ({ ...d, jobDescription: v }))}
              placeholder="Example: I am a backend dev needing database access and OpenShift."
              rows={4}
            />
          </Field>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested permissions
            </div>
            <div className="flex flex-wrap gap-2">
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
                <div className="text-sm text-slate-500">
                  Run “Suggest Role” to prefill.
                </div>
              )}
            </div>
            {data.aiRationale ? (
              <div className="mt-3 text-xs text-slate-600">{data.aiRationale}</div>
            ) : null}
            {aiError ? (
              <div className="mt-3 text-xs font-medium text-red-600">{aiError}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-enterprise-700" />
            <div className="text-sm font-semibold text-slate-900">Role Details</div>
          </div>

          {data.requestType === "update" ? (
            <Field
              label="Choose Existing Role"
              hint={loadingRoles ? "Loading roles…" : "Select a role from the catalog."}
            >
              <div className="relative">
                <select
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm shadow-sm outline-none focus:border-enterprise-400 focus:ring-2 focus:ring-enterprise-100"
                  value={data.selectedRoleId || ""}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      selectedRoleId: e.target.value ? Number(e.target.value) : null
                    }))
                  }
                >
                  <option value="">Select…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {selectedRole ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-sm font-medium text-slate-900">
                    {selectedRole.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {selectedRole.description}
                  </div>
                </div>
              ) : null}
            </Field>
          ) : (
            <>
              <Field
                label="Role Name"
                hint="Format: BU_Squad_Role_Location"
              >
                <Input
                  value={data.roleName}
                  onChange={(v) => setData((d) => ({ ...d, roleName: v }))}
                  placeholder="GB_Health_AWS_Lead_NY"
                />
                {!roleNameOk ? (
                  <div className="mt-2 text-xs font-medium text-red-600">
                    Role Name must have 4 underscore-separated parts.
                  </div>
                ) : null}
              </Field>

              <Field label="Role Description">
                <Textarea
                  value={data.roleDescription}
                  onChange={(v) => setData((d) => ({ ...d, roleDescription: v }))}
                  placeholder="Describe what this role enables and why."
                  rows={4}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Primary Owner">
                  <Input
                    value={data.primaryOwner}
                    onChange={(v) => setData((d) => ({ ...d, primaryOwner: v }))}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Key Technology">
                  <Select
                    value={data.keyTechnology}
                    onChange={(v) => setData((d) => ({ ...d, keyTechnology: v }))}
                    options={KEY_TECH_OPTIONS}
                  />
                </Field>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-enterprise-700" />
            <div className="text-sm font-semibold text-slate-900">
              Permissions (snapshot)
            </div>
          </div>

          <div className="text-sm text-slate-700">
            The request will capture a permissions snapshot for auditability.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(data.permissions || []).length ? (
              data.permissions.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200"
                >
                  {p}
                </span>
              ))
            ) : (
              <div className="text-sm text-slate-500">
                No permissions selected yet. Use “Suggest Role” above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

