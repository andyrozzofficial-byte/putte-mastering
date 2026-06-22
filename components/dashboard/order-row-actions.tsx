"use client";

import { parseApiJsonBody } from "@/lib/api/client-parse";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type OrderRowActionsProps = {
  orderId: string;
  orderLabel: string;
  onDeleted: (orderId: string) => void;
};

export function OrderRowActions({
  orderId,
  orderLabel,
  onDeleted,
}: OrderRowActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const menuId = useId();
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!confirmOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) setConfirmOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen, deleting]);

  function openConfirmDialog() {
    setMenuOpen(false);
    setConfirmOpen(true);
  }

  async function deleteOrder() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/studio/orders/${orderId}`, {
        method: "DELETE",
        credentials: "same-origin",
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
            : "Could not delete order.",
        );
      }

      onDeleted(orderId);
      setConfirmOpen(false);
      showToast("Order deleted.", "success");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not delete order.";
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div ref={rootRef} className="relative inline-flex">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {menuOpen ? (
          <div
            id={menuId}
            role="menu"
            className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-[13px] text-red-700 transition-colors hover:bg-red-50 sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                openConfirmDialog();
              }}
            >
              Delete order
            </button>
          </div>
        ) : null}
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            aria-label="Close dialog"
            disabled={deleting}
            onClick={() => setConfirmOpen(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id={dialogTitleId}
              className="text-[15px] font-semibold tracking-tight text-black sm:text-base"
            >
              Delete order?
            </h3>
            <p
              id={dialogDescId}
              className="mt-2 text-[13px] leading-relaxed text-gray-600 sm:text-sm"
            >
              This permanently removes{" "}
              <span className="font-medium text-black">{orderLabel}</span> from
              your studio. This action cannot be undone.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={deleting}
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteOrder()}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                {deleting ? "Deleting…" : "Delete order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
