import { useMemo } from "react";
import { User, Users } from "lucide-react";

function normalizeName(name) {
  return (name || "").trim().replace(/\s+/g, " ");
}

function shortHash(str) {
  // Deterministic, human-friendly-ish; not cryptographic.
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return (h % 10000).toString().padStart(4, "0");
}

export function generateAcf2Id(name) {
  const clean = normalizeName(name);
  if (!clean) return "";
  const parts = clean.split(" ").filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return `${initials}${shortHash(clean)}`.slice(0, 8);
}

function Field({ label, value, onChange, placeholder, icon: Icon }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-slate-700">{label}</div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        {Icon ? <Icon className="h-4 w-4 text-slate-400" /> : null}
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}

export function UserInfoStep({ data, setData }) {
  const userAcf2Auto = useMemo(() => generateAcf2Id(data.userName), [data.userName]);
  const mgrAcf2Auto = useMemo(
    () => generateAcf2Id(data.managerName),
    [data.managerName]
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-enterprise-700" />
          <div className="text-sm font-semibold text-slate-900">User</div>
        </div>

        <div className="grid gap-4">
          <Field
            label="User Name"
            value={data.userName}
            onChange={(v) =>
              setData((d) => ({
                ...d,
                userName: v,
                userAcf2Id: v ? userAcf2Auto : d.userAcf2Id
              }))
            }
            placeholder="Jane Doe"
          />
          <Field
            label="ACF2 ID"
            value={data.userAcf2Id}
            onChange={(v) => setData((d) => ({ ...d, userAcf2Id: v }))}
            placeholder={userAcf2Auto || "JD1234"}
          />
          <div className="text-xs text-slate-500">
            Auto-populated when you type a name (editable).
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-enterprise-700" />
          <div className="text-sm font-semibold text-slate-900">Manager</div>
        </div>

        <div className="grid gap-4">
          <Field
            label="Manager Name"
            value={data.managerName}
            onChange={(v) =>
              setData((d) => ({
                ...d,
                managerName: v,
                managerAcf2Id: v ? mgrAcf2Auto : d.managerAcf2Id
              }))
            }
            placeholder="Mark Lead"
          />
          <Field
            label="Manager ACF2 ID"
            value={data.managerAcf2Id}
            onChange={(v) => setData((d) => ({ ...d, managerAcf2Id: v }))}
            placeholder={mgrAcf2Auto || "ML5678"}
          />
          <div className="text-xs text-slate-500">
            Auto-populated when you type a name (editable).
          </div>
        </div>
      </div>
    </div>
  );
}

