import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Stepper } from "../components/Stepper";
import { UserInfoStep } from "../components/steps/UserInfoStep";
import { RoleSelectionStep } from "../components/steps/RoleSelectionStep";
import { ReviewSubmitStep } from "../components/steps/ReviewSubmitStep";
import { ArrowLeft, ArrowRight } from "lucide-react";

const steps = [
  { key: "user", label: "User & Manager" },
  { key: "role", label: "Role" },
  { key: "review", label: "Review" }
];

function canGoNext(stepIdx, data) {
  if (stepIdx === 0) {
    return (
      (data.userName || "").trim() &&
      (data.userAcf2Id || "").trim() &&
      (data.managerName || "").trim() &&
      (data.managerAcf2Id || "").trim()
    );
  }
  if (stepIdx === 1) {
    if (data.requestType === "update") {
      return !!data.selectedRoleId;
    }
    return (data.roleName || "").trim().split("_").length === 4;
  }
  return true;
}

export function RequestWizardPage() {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState({
    userName: "",
    userAcf2Id: "",
    managerName: "",
    managerAcf2Id: "",
    requestType: "create",
    selectedRoleId: null,
    roleName: "",
    roleDescription: "",
    primaryOwner: "",
    keyTechnology: "",
    permissions: [],
    jobDescription: "",
    aiRationale: ""
  });

  const nextEnabled = useMemo(() => canGoNext(stepIdx, data), [stepIdx, data]);

  function next() {
    if (!nextEnabled) return;
    setStepIdx((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStepIdx((s) => Math.max(s - 1, 0));
  }

  return (
    <div className="grid gap-6">
      <Stepper steps={steps} currentStepIndex={stepIdx} />

      <div className="rounded-xl border border-slate-200 bg-white/70 p-2 shadow-card">
        <div className="relative overflow-hidden rounded-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[stepIdx].key}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="p-4 md:p-5"
            >
              {stepIdx === 0 ? (
                <UserInfoStep data={data} setData={setData} />
              ) : null}
              {stepIdx === 1 ? (
                <RoleSelectionStep data={data} setData={setData} />
              ) : null}
              {stepIdx === 2 ? (
                <ReviewSubmitStep data={data} onSuccess={() => {}} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={stepIdx === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {stepIdx < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!nextEnabled}
            className="inline-flex items-center gap-2 rounded-lg bg-enterprise-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-enterprise-700 disabled:opacity-60"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="text-sm text-slate-600">
            Review and submit your request.
          </div>
        )}
      </div>
    </div>
  );
}

