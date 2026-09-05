"use client";

import { useState } from "react";
import { askStoryAction } from "@/app/story-actions";
import { formatPublishedAt } from "@/lib/format";
import { Surface } from "@/components/ui/surface";
import type { AskStoryResponse, DisplayLanguage } from "@/types/api";
import { ExternalLink, Sparkles } from "lucide-react";

export function AskThisStory({
  storyId,
  displayLanguage,
}: {
  storyId: string;
  displayLanguage?: DisplayLanguage;
}) {
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<AskStoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateAskStoryQuestion(question);
    if (validation) {
      setError(validation);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await askStoryAction({ storyId, question, displayLanguage });
      if (result.ok) {
        setResponse(result.response);
      } else {
        setError(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Surface variant="bordered" className="p-5 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 text-brand-primary">
        <Sparkles className="size-4" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Grounded Story Q&amp;A
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          Ask This Story
        </h2>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          Answers are generated only from reports linked to this story.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="story-question" className="block text-xs font-bold text-foreground mb-1.5">
            Your question
          </label>
          <textarea
            id="story-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            aria-describedby="story-question-help"
            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-foreground placeholder:text-foreground-secondary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-soft transition-colors"
            placeholder="What key developments were reported across sources?"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="story-question-help" className="text-xs text-foreground-secondary">
            No question or answer history is saved.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
          >
            {pending ? "Analyzing Story Reports…" : "Ask Question"}
          </button>
        </div>
      </form>

      {error && (
        <Surface variant="warning" className="p-4 text-xs text-amber-950" role="alert">
          {error}
        </Surface>
      )}

      {response && <AskStoryAnswer response={response} />}
    </Surface>
  );
}

export function AskStoryAnswer({ response }: { response: AskStoryResponse }) {
  if (!response.answerable) {
    return (
      <Surface variant="warning" className="p-5 space-y-2" role="status">
        <h3 className="text-sm font-bold text-amber-950">Not enough evidence</h3>
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-amber-900">
          {response.answer}
        </p>
      </Surface>
    );
  }

  return (
    <div className="border-t border-border pt-5 space-y-5" aria-live="polite">
      <div className="space-y-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-secondary">
          Grounded Answer
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-serif bg-surface-muted p-4 rounded-xl border border-border">
          {renderAnswerWithCitations(response.answer, response.citations.map((item) => item.number))}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
          Sources used ({response.citations.length})
        </h4>
        <ol className="grid gap-3 sm:grid-cols-2">
          {response.citations.map((citation) => (
            <li
              key={citation.number}
              id={`ask-citation-${citation.number}`}
              className="rounded-xl border border-border bg-surface-card p-4 text-xs space-y-1.5"
            >
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <span className="rounded bg-brand-soft px-1.5 py-0.5 text-brand-primary">
                  [{citation.number}]
                </span>
                <span>{citation.source.name}</span>
              </div>
              <p className="text-foreground-secondary font-medium line-clamp-2">{citation.title}</p>
              <time className="block text-[11px] font-mono text-foreground-secondary" dateTime={citation.publishedAt}>
                {formatPublishedAt(citation.publishedAt)}
              </time>
              <div>
                <a
                  href={citation.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
                >
                  <span>Read Original Report</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function validateAskStoryQuestion(question: string): string | null {
  const normalized = question.normalize("NFC").trim().replace(/\s+/gu, " ");
  const length = Array.from(normalized).length;
  if (length < 3) return "Enter a question with at least 3 characters.";
  if (length > 500) return "Question must not exceed 500 characters.";
  return null;
}

export function renderAnswerWithCitations(answer: string, validNumbers: number[]) {
  const valid = new Set(validNumbers);
  return answer.split(/(\[\d+\])/g).map((part, index) => {
    const match = /^\[(\d+)\]$/.exec(part);
    if (!match || !valid.has(Number(match[1]))) return part;
    const number = Number(match[1]);
    return (
      <a
        key={`${number}-${index}`}
        href={`#ask-citation-${number}`}
        className="font-bold text-brand-primary hover:underline ml-0.5"
      >
        [{number}]
      </a>
    );
  });
}
