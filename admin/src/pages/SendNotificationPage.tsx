import type { FormEvent } from "react";
import { useState } from "react";
import { sendNotification } from "../lib/api";
import type { SendNotificationPayload } from "../lib/api";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

type Audience = "all" | "specific";

export function SendNotificationPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("admin_broadcast");
  const [audience, setAudience] = useState<Audience>("all");
  const [walletAddresses, setWalletAddresses] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title || !body) {
      const msg = "Title and body are required.";
      toast.error(msg);
      return;
    }

    const payload: SendNotificationPayload = {
      title,
      body,
      type,
      targetAudience: audience,
    };

    if (audience === "specific") {
      const parsed = walletAddresses
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length === 0) {
        const msg = "Provide at least one wallet address.";
        toast.error(msg);
        return;
      }
      payload.walletAddresses = parsed;
      payload.type = type || "admin_targeted";
    }

    try {
      setLoading(true);
      await sendNotification(payload);
      const successMsg = "Notification sent successfully.";
      toast.success(successMsg);
      setTitle("");
      setBody("");
      setWalletAddresses("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send notification.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[#CACACA]">
          Send notification
        </h2>
        <p className="text-sm text-[#F1F1F1] max-w-2xl">
          Broadcast a push notification to everyone or a targeted list of
          wallets. Use this for feature announcements, maintenance alerts, or
          tailored campaigns.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-800/80 bg-[#1D1D1D73] p-6 shadow-xl shadow-black/30 backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-[#CACACA]" htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New feature live!"
              className="border-[#FFFFFF3D] bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-[#79E7BA] focus-visible:border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#CACACA]" htmlFor="type">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full border-[#FFFFFF3D] bg-transparent text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin_broadcast">Admin broadcast</SelectItem>
                <SelectItem value="admin_targeted">Admin targeted</SelectItem>
                <SelectItem value="custom_reminder">Custom reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#CACACA]" htmlFor="body">
            Body
          </Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[96px] border-[#FFFFFF3D] bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-[#79E7BA] focus-visible:border"
            placeholder="Describe the update or reminder…"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#CACACA]" htmlFor="audience">
            Audience
          </Label>
          <RadioGroup
            id="audience"
            value={audience}
            onValueChange={(value) => setAudience(value as Audience)}
            className="mt-1 flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="aud-all" value="all" />
              <Label className="text-[#CACACA]" htmlFor="aud-all">
                All subscribers
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="aud-specific" value="specific" />
              <Label className="text-white" htmlFor="aud-specific">
                Specific wallets
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-[#F1F1F1]">
            Use specific audience for testing or narrow campaigns.
          </p>
        </div>
        {audience === "specific" && (
          <div className="space-y-1.5">
            <Label className="text-[#CACACA]" htmlFor="wallets">
              Wallet addresses
            </Label>
            <Textarea
              id="wallets"
              value={walletAddresses}
              onChange={(e) => setWalletAddresses(e.target.value)}
              className="min-h-[96px] text-xs border-[#FFFFFF3D] bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent focus-visible:border-[#79E7BA] focus-visible:border"
              placeholder={"0xabc...\n0xdef...\n0x123..."}
            />
            <p className="text-xs text-[#F1F1F1]">
              Separate addresses with newlines or commas.
            </p>
          </div>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 cursor-pointer bg-[#FFFFFFE5] text-[#010104] hover:bg-[#FFFFFFE5] rounded-[100px]">
          {loading ? "Sending…" : "Send notification"}
        </Button>
      </form>
    </div>
  );
}
