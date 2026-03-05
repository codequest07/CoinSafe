import { useEffect, useState } from "react";
import { fetchStats } from "../lib/api";
import type { NotificationStatsResponse } from "../lib/api";
import { toast } from "sonner";

export function DashboardPage() {
  const [stats, setStats] = useState<NotificationStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load statistics";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const successRate =
    stats && stats.totalSent > 0
      ? ((stats.totalSuccess / stats.totalSent) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Overview & Stats
        </h2>
        <p className="text-sm text-slate-400">
          High-level metrics for your notification system.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active subscribers"
          value={stats?.activeSubscribers ?? 0}
          loading={loading}
        />
        <StatCard
          label="Total sent"
          value={stats?.totalSent ?? 0}
          loading={loading}
        />
        <StatCard
          label="Total successful"
          value={stats?.totalSuccess ?? 0}
          loading={loading}
        />
        <StatCard
          label="Success rate"
          value={`${successRate}%`}
          loading={loading}
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  loading?: boolean;
}

function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">
        {loading ? "…" : value}
      </p>
    </div>
  );
}

