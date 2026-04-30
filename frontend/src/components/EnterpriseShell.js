import { Link, NavLink } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-md px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-enterprise-600 text-white shadow"
            : "text-slate-700 hover:bg-white/70 hover:text-slate-900"
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export function EnterpriseShell({ title, subtitle, children }) {
  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-enterprise-600 text-white shadow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">
                Access Approval Orchestrator
              </div>
              <div className="text-xs text-slate-600">
                Persona-based Engineering Role catalog
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <NavItem to="/">Request Access</NavItem>
            <NavItem to="/admin">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </span>
            </NavItem>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-slate-900">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

