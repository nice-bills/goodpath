"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Target } from "@phosphor-icons/react";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useCreateWeeklyRun, useMyWeeklyRun } from "@/hooks/use-weekly-run";

export function CreateRunForm({ compact = false }: { compact?: boolean }) {
  const { address } = useWalletSession();
  const { run, isLoading, live } = useMyWeeklyRun(address);
  const createRun = useCreateWeeklyRun();
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    if (!address || !title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createRun(address, title, isPublic);
      setTitle("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your run");
    } finally {
      setSubmitting(false);
    }
  }, [address, createRun, isPublic, title]);

  if (!address || !live) return null;

  if (isLoading) {
    return (
      <div className="vibe-run-goal vibe-run-goal-skeleton" aria-busy="true" />
    );
  }

  if (run && !open) {
    return (
      <div className="vibe-run-goal">
        <div className="vibe-run-goal-head">
          <Target className="h-4 w-4 shrink-0 text-accent" weight="duotone" aria-hidden />
          <span className="vibe-run-goal-label">Your weekly run</span>
          {run.isPublic ? (
            <span className="vibe-run-goal-public">Public</span>
          ) : null}
        </div>
        <p className="vibe-run-goal-title">{run.title}</p>
        <button
          type="button"
          className="vibe-run-goal-edit"
          onClick={() => {
            setTitle(run.title);
            setIsPublic(run.isPublic);
            setOpen(true);
          }}
        >
          Edit goal
        </button>
      </div>
    );
  }

  if (!open && !run) {
    return (
      <button
        type="button"
        className={compact ? "vibe-start-run-compact" : "vibe-start-run"}
        onClick={() => setOpen(true)}
      >
        <Target className="h-5 w-5" weight="duotone" aria-hidden />
        What&apos;s your run this week?
        <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
      </button>
    );
  }

  return (
    <form
      className="vibe-run-goal-form"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <label className="vibe-run-goal-form-label" htmlFor="weekly-run-title">
        What&apos;s your run this week?
      </label>
      <input
        id="weekly-run-title"
        type="text"
        maxLength={80}
        placeholder="Hit 7-day claim streak"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="vibe-run-goal-input"
        autoFocus
      />
      <label className="vibe-run-goal-check">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Show on &ldquo;Runs heating up&rdquo; (real wallet, truncated address)
      </label>
      {error ? <p className="vibe-run-goal-error">{error}</p> : null}
      <div className="vibe-run-goal-actions">
        <button
          type="button"
          className="vibe-run-goal-cancel"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="vibe-run-goal-submit"
          disabled={submitting || title.trim().length < 3}
        >
          {submitting ? "Saving…" : run ? "Update run" : "Start run"}
        </button>
      </div>
    </form>
  );
}
