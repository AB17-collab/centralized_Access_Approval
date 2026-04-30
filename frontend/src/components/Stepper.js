import { Check } from "lucide-react";

function StepDot({ state }) {
  if (state === "done") {
    return (
      <div className="grid h-7 w-7 place-items-center rounded-full bg-enterprise-600 text-white shadow">
        <Check className="h-4 w-4" />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div className="h-7 w-7 rounded-full border-2 border-enterprise-600 bg-white shadow-sm" />
    );
  }
  return (
    <div className="h-7 w-7 rounded-full border border-slate-300 bg-white" />
  );
}

export function Stepper({ steps, currentStepIndex }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-card">
      <div className="flex items-center justify-between gap-4">
        {steps.map((s, idx) => {
          const state =
            idx < currentStepIndex ? "done" : idx === currentStepIndex ? "active" : "todo";
          return (
            <div key={s.key} className="flex flex-1 items-center gap-3">
              <StepDot state={state} />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">
                  Step {idx + 1}
                </div>
                <div className="truncate text-sm font-medium text-slate-900">
                  {s.label}
                </div>
              </div>
              {idx < steps.length - 1 ? (
                <div className="mx-2 hidden h-[2px] flex-1 bg-slate-200 md:block">
                  <div
                    className="h-full bg-enterprise-600 transition-all"
                    style={{ width: idx < currentStepIndex ? "100%" : "0%" }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-enterprise-600 transition-all"
          style={{
            width: `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%`
          }}
        />
      </div>
    </div>
  );
}

