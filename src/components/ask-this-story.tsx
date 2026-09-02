"use client";

import { useState } from "react";
import { askStoryAction } from "@/app/story-actions";
import { formatPublishedAt } from "@/lib/format";
import type {
  AskStoryResponse,
  DisplayLanguage,
} from "@/types/api";

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
    <section
      aria-labelledby="ask-this-story-title"
      className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <p className="eyebrow">Grounded answers</p>
      <h2
        id="ask-this-story-title"
        className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl"
      >
        Ask This Story
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Answers are generated only from reports linked to this story.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label htmlFor="story-question" className="block text-sm font-bold text-slate-800">
          Your question
        </label>
        <textarea
          id="story-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          aria-describedby="story-question-help"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          placeholder="What changed between the reports?"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p id="story-question-help" className="text-xs text-slate-500">
            3–500 characters. No question or answer history is saved.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Asking…" : "Ask"}
          </button>
        </div>
      </form>
      {error ? (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      {response ? <AskStoryAnswer response={response} /> : null}
    </section>
  );
}

export function AskStoryAnswer({ response }: { response: AskStoryResponse }) {
  if (!response.answerable) {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5" role="status">
        <h3 className="font-bold text-amber-950">Not enough evidence</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">
          {response.answer}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-6 border-t border-slate-200 pt-6" aria-live="polite">
      <h3 className="text-lg font-bold text-slate-950">Answer</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {renderAnswerWithCitations(response.answer, response.citations.map((item) => item.number))}
      </p>
      <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">
        Sources used
      </h4>
      <ol className="mt-3 grid gap-3">
        {response.citations.map((citation) => (
          <li
            key={citation.number}
            id={`ask-citation-${citation.number}`}
            className="rounded-xl border border-slate-200 p-4 text-sm"
          >
            <p className="font-bold text-slate-950">
              [{citation.number}] {citation.source.name}
            </p>
            <p className="mt-1 text-slate-600">{citation.title}</p>
            <time className="mt-1 block text-xs text-slate-500" dateTime={citation.publishedAt}>
              {formatPublishedAt(citation.publishedAt)}
            </time>
            <a
              href={citation.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-teal-700 hover:underline"
            >
              Read original report ↗
            </a>
          </li>
        ))}
      </ol>
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
      <a key={`${number}-${index}`} href={`#ask-citation-${number}`} className="font-bold text-teal-700 hover:underline">
        [{number}]
      </a>
    );
  });
}
