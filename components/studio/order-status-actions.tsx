"use client";

import { parseApiJsonBody } from "@/lib/api/client-parse";
import { useMemo, useState } from "react";

import type { OrderStatus } from "@/components/dashboard/order-status-badge";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

type TargetStatus = "new" | "in_progress" | "waiting_revision" | "completed";

function statusLabel(status: TargetStatus): string {
  if (status === "new") return "New";
  if (status === "in_progress") return "In progress";
  if (status === "waiting_revision") return "Waiting revision";
  return "Completed";
}

export function OrderStatusActions({ orderId, currentStatus }: Props) {
  const [busy, setBusy] = useState<TargetStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = useMemo(() => {
    const out: { label: string; to: TargetStatus; variant?: "primary" | "ghost" }[] =
      [];
    if (currentStatus !== "in_progress")
      out.push({ label: "Start mastering", to: "in_progress", variant: "primary" });
    if (currentStatus !== "waiting_revision")
      out.push({
        label: "Request revision",
        to: "waiting_revision",
        variant: "ghost",
      });
    if (currentStatus !== "completed")
      out.push({ label: "Mark as completed", to: "completed", variant: "ghost" });
    return out;
  }, [currentStatus]);

  async function setStatus(to: TargetStatus) {
    setError(null);
    setBusy(to);
    try {
      const res = await fetch(`/api/studio/orders/${orderId}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: to }),
      });
      const raw = await res.text();
      const json = parseApiJsonBody(raw, res) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || json.success === false) {
        throw new Error(
          typeof json.error === "string" && json.error.length > 0
            ? json.error
            : "Could not update status.",
        );
      }
      window.location.reload();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not update status.";
      setError(msg);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
        Workflow
      </h2>
      <p className="mt-2 text-[13px] text-gray-500 sm:text-sm">
        Current status:{" "}
        <span className="font-medium text-black">{statusLabel(currentStatus)}</span>
      </p>

      {error ? (
        <p className="mt-4 text-[13px] text-red-700 sm:text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {actions.map((a) => (
          <Button
            key={a.to}
            type="button"
            variant={a.variant ?? "ghost"}
            disabled={busy !== null}
            onClick={() => void setStatus(a.to)}
          >
            {busy === a.to ? "Updating…" : a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

