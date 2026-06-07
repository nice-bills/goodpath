"use client";

import { useCallback, useState } from "react";
import { ChatCircle, X } from "@phosphor-icons/react";

const STORAGE_KEY = "goodpath-tester-feedback-dismissed";

const VALIDATION_QUESTIONS = [
  "After claiming, what did you think G$ was for?",
  "What did you choose to do with your G$?",
  "Did anything make you want to come back tomorrow?",
  "What would you screenshot or send to a friend?",
  "Did your receipt/rank/streak feel real or fake?",
] as const;

function feedbackMailto(): string {
  const subject = encodeURIComponent("GoodPath tester feedback");
  const body = encodeURIComponent(
    VALIDATION_QUESTIONS.map((q, i) => `${i + 1}. ${q}\n\n`).join("\n"),
  );
  return `mailto:hello@goodpath.app?subject=${subject}&body=${body}`;
}

export function TesterFeedbackBanner({ surface }: { surface: "home" | "celebrate" }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(`${STORAGE_KEY}-${surface}`) === "1";
  });
  const [expanded, setExpanded] = useState(false);

  const dismiss = useCallback(() => {
    setDismissed(true);
    window.localStorage.setItem(`${STORAGE_KEY}-${surface}`, "1");
  }, [surface]);

  if (dismissed) return null;

  return (
    <aside className="tester-feedback" aria-label="Tester feedback">
      <div className="tester-feedback-head">
        <ChatCircle className="h-4 w-4 shrink-0" weight="duotone" aria-hidden />
        <p className="tester-feedback-title">Quick tester check-in</p>
        <button
          type="button"
          className="tester-feedback-dismiss"
          onClick={dismiss}
          aria-label="Dismiss feedback prompt"
        >
          <X className="h-4 w-4" weight="bold" />
        </button>
      </div>
      <p className="tester-feedback-lead">
        Help us learn if the daily G$ run makes sense.
      </p>
      {expanded ? (
        <ol className="tester-feedback-questions">
          {VALIDATION_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      ) : (
        <button
          type="button"
          className="tester-feedback-toggle"
          onClick={() => setExpanded(true)}
        >
          Show 5 validation questions
        </button>
      )}
      <a href={feedbackMailto()} className="tester-feedback-send">
        Send feedback
      </a>
    </aside>
  );
}
