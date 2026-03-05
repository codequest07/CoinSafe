import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "coinsafe-admin-auth";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [secret, setSecret] = useState("");

  const expectedSecret = import.meta.env.VITE_ADMIN_SECRET;

  useEffect(() => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!expectedSecret) {
      toast.error("Admin secret is not configured on this deployment.");
      return;
    }

    if (secret === expectedSecret) {
      setUnlocked(true);
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } else {
      toast.error("Invalid admin secret.");
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
        <div className="mb-4">
          <h1 className="text-lg font-semibold tracking-tight">
            CoinSafe Admin
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Enter the admin secret to access the notification console.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="admin-secret"
              className="text-xs font-medium text-slate-300"
            >
              Admin Secret
            </label>
            <input
              id="admin-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Unlock Admin
          </button>
        </form>
      </div>
    </div>
  );
}

