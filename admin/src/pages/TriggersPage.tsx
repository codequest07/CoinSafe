import { useState } from "react";
import {
  triggerEvening,
  triggerMorning,
  triggerWeekly,
} from "../lib/api";
import { toast } from "sonner";

type TriggerType = "morning" | "evening" | "weekly";

export function TriggersPage() {
  const [loading, setLoading] = useState<TriggerType | null>(null);

  const runTrigger = async (type: TriggerType) => {
    setLoading(type);
    try {
      if (type === "morning") {
        await triggerMorning();
      } else if (type === "evening") {
        await triggerEvening();
      } else {
        await triggerWeekly();
      }
      toast.success(`Triggered ${type} notifications.`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Failed to trigger ${type} notifications.`;
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Manual Triggers
        </h2>
        <p className="text-sm text-slate-400">
          Fire the scheduled notification jobs on demand.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TriggerCard
          title="Morning reminders"
          description="Send the 8:00 AM reminder to all opted-in users."
          label="Trigger morning"
          loading={loading === "morning"}
          onClick={() => runTrigger("morning")}
        />
        <TriggerCard
          title="Evening reminders"
          description="Send the 8:00 PM check-in to all opted-in users."
          label="Trigger evening"
          loading={loading === "evening"}
          onClick={() => runTrigger("evening")}
        />
        <TriggerCard
          title="Weekly summary"
          description="Send the Monday 9:00 AM summary."
          label="Trigger weekly"
          loading={loading === "weekly"}
          onClick={() => runTrigger("weekly")}
        />
      </div>
      <p className="text-xs text-slate-500">
        These calls invoke the same logic as the cron jobs on the backend. Use
        them for testing or manual retries.
      </p>
    </div>
  );
}

interface TriggerCardProps {
  title: string;
  description: string;
  label: string;
  loading?: boolean;
  onClick: () => void;
}

function TriggerCard({
  title,
  description,
  label,
  loading,
  onClick,
}: TriggerCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-950 hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Triggering…" : label}
      </button>
    </div>
  );
}

