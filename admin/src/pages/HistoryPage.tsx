import { useEffect, useState } from "react";
import { fetchHistory } from "../lib/api";
import type {
  NotificationHistoryResponse,
  NotificationRecord,
} from "../lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NotificationHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchHistory(page, 20);
        setData(res);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load history";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const notifications = data?.notifications ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Notification History
        </h2>
        <p className="text-sm text-slate-400">
          Recent notifications sent from the system.
        </p>
      </div>
      <div className="rounded-2xl border border-[#FFFFFF21] bg-[#1D1D1D73]">
        <Table>
          <TableHeader className=" bg-[#1D1D1D73] text-[#CACACA]">
            <TableRow>
              <TableHead className="px-3 py-2 text-[#CACACA]">Title</TableHead>
              <TableHead className="px-3 py-2 text-[#CACACA]">Type</TableHead>
              <TableHead className="px-3 py-2 text-[#CACACA]">Audience</TableHead>
              <TableHead className="px-3 py-2 text-right text-[#CACACA]">
                Recipients
              </TableHead>
              <TableHead className="px-3 py-2 text-right text-[#CACACA]">Success</TableHead>
              <TableHead className="px-3 py-2 text-right text-[#CACACA]">Failed</TableHead>
              <TableHead className="px-3 py-2 text-[#CACACA]">Status</TableHead>
              <TableHead className="px-3 py-2 text-[#CACACA]">Sent at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-3 py-4 text-center text-[#F1F1F1]"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && notifications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No notifications found.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              notifications.map((n: NotificationRecord) => (
                <TableRow key={n._id} className="border-t border-slate-800">
                  <TableCell className="px-3 py-2 align-top">
                    <div className="font-medium text-slate-50">{n.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-2">
                      {n.body}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-slate-300">
                    {n.type}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-slate-300">
                    {n.targetAudience}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-right text-slate-300">
                    {n.totalRecipients ?? 0}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-right text-emerald-300">
                    {n.successCount ?? 0}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-right text-red-300">
                    {n.failureCount ?? 0}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-slate-300">
                    {n.status}
                  </TableCell>
                  <TableCell className="px-3 py-2 align-top text-slate-300">
                    {n.sentAt
                      ? new Date(n.sentAt).toLocaleString()
                      : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span>
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() =>
              setPage((p) =>
                data ? Math.min(data.totalPages, p + 1) : p + 1,
              )
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

