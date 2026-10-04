"use client";

import { useState } from "react";

interface VenueBlock {
  id: string;
  event_date: string;
  shift: "morning" | "evening" | "full_day";
  reason: string | null;
  created_at: string;
}

interface AvailabilityManagerProps {
  initialBlocks: VenueBlock[];
}

export function AvailabilityManager({ initialBlocks }: AvailabilityManagerProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("morning");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitBlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/dashboard/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, shift, reason }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string; blocks?: VenueBlock[] } | null;

    if (!response.ok) {
      setError(payload?.message ?? "Unable to block this date.");
      setLoading(false);
      return;
    }

    const nextResponse = await fetch("/api/dashboard/availability");
    const refreshed = (await nextResponse.json().catch(() => null)) as { blocks?: VenueBlock[] } | null;

    setBlocks(refreshed?.blocks ?? blocks);
    setDate("");
    setShift("morning");
    setReason("");
    setSuccess(payload?.message ?? "Availability blocked.");
    setLoading(false);
  }

  async function removeBlock(block: VenueBlock) {
    setLoading(true);
    setError("");
    setSuccess("");

    const response = await fetch(
      `/api/dashboard/availability?date=${encodeURIComponent(block.event_date)}&shift=${encodeURIComponent(block.shift)}`,
      { method: "DELETE" }
    );

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(payload?.message ?? "Unable to remove the block.");
      setLoading(false);
      return;
    }

    setBlocks((current) => current.filter((item) => item.id !== block.id));
    setSuccess(payload?.message ?? "Availability block removed.");
    setLoading(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={submitBlock} className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Block availability</p>
          <h2 className="mt-2 text-2xl font-medium text-[#171614]">Manual venue control</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="block-date" className="mb-2 block text-sm font-medium text-[#183d34]">Date</label>
            <input
              id="block-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-[#d8d0c1] bg-[#f9f7f3] px-4 py-3 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfe9e0]"
            />
          </div>

          <div>
            <label htmlFor="block-shift" className="mb-2 block text-sm font-medium text-[#183d34]">Shift</label>
            <select
              id="block-shift"
              value={shift}
              onChange={(event) => setShift(event.target.value)}
              className="w-full rounded-xl border border-[#d8d0c1] bg-[#f9f7f3] px-4 py-3 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfe9e0]"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="full_day">Entire day</option>
            </select>
          </div>

          <div>
            <label htmlFor="block-reason" className="mb-2 block text-sm font-medium text-[#183d34]">Reason</label>
            <textarea
              id="block-reason"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Venue maintenance"
              className="w-full rounded-xl border border-[#d8d0c1] bg-[#f9f7f3] px-4 py-3 text-sm text-[#171614] outline-none transition focus:border-[#183d34] focus:ring-2 focus:ring-[#dfe9e0]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#183d34] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#122d2a] disabled:cursor-not-allowed disabled:opacity-75"
          >
            {loading ? "Updating..." : "Block Availability"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#ded7cc] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8d7650]">Upcoming blocks</p>
            <h2 className="mt-2 text-xl font-medium text-[#171614]">Availability schedule</h2>
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#ded7cc] bg-[#faf7f3] p-6 text-sm text-[#5f5853]">No manual availability blocks.</div>
        ) : (
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="rounded-xl border border-[#efeae3] bg-[#faf8f4] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#171614]">
                      {new Date(`${block.event_date}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#8d7650]">{block.shift.replace("_", " ")}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBlock(block)}
                    className="rounded-lg border border-[#d8d0c1] px-2.5 py-1.5 text-xs font-medium text-[#183d34] transition hover:border-[#183d34] hover:bg-[#edf3f1]"
                  >
                    Remove block
                  </button>
                </div>

                {block.reason && <p className="mt-3 text-sm text-[#5f5853]">{block.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
