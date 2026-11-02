import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Trash2, Cpu, Download } from "lucide-react";
import { toast } from "sonner";
import { Button, Panel, fieldClass } from "@/components/ui";
import {
  cardFromReply,
  clearChat,
  prepareTutorContext,
  saveTutorExchange,
  sendTutorMessage,
} from "@/lib/study/server";
import { errText, useDesk, useRefreshDesk } from "@/lib/study/use-desk";
import {
  isLocalAiReady,
  loadLocalTutor,
  localTutorReply,
} from "@/lib/study/local-ai";

export function TutorView() {
  const query = useDesk();
  const refresh = useRefreshDesk();
  const [subjectId, setSubjectId] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [useLocal, setUseLocal] = useState(true);
  const [modelProgress, setModelProgress] = useState(0);
  const [modelStatus, setModelStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [modelError, setModelError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const subjects = query.data?.subjects ?? [];
  const activeId = subjectId || subjects[0]?.id || "";
  const messages = (query.data?.messages ?? []).filter((message) => message.subjectId === activeId);
  const noteCount = (query.data?.notes ?? []).filter((note) => note.subjectId === activeId).length;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length, busy]);

  // Preload local model when the tutor tab is opened and local mode is on
  useEffect(() => {
    if (!useLocal) return;
    let cancelled = false;
    (async () => {
      try {
        setModelStatus("loading");
        await loadLocalTutor((p, status) => {
          if (cancelled) return;
          setModelProgress(p);
          if (status === "ready") setModelStatus("ready");
        });
        if (!cancelled) {
          setModelStatus("ready");
          setModelProgress(100);
        }
      } catch (err) {
        if (!cancelled) {
          setModelStatus("error");
          setModelError(err instanceof Error ? err.message : String(err));
          toast.error("Local model failed to load — falling back to cloud tutor when available.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [useLocal]);

  if (query.isLoading || !query.data) return <p className="text-mute">Opening the tutor…</p>;

  async function sendLocal() {
    const content = text.trim();
    if (!content || !activeId || busy) return;
    setText("");
    setBusy(true);
    // Let React paint the "Thinking…" state before WASM blocks the thread.
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
    try {
      const ctx = await prepareTutorContext({ data: { subjectId: activeId, content } });
      const reply = await localTutorReply({
        subjectTitle: ctx.subjectTitle,
        description: ctx.description,
        history: ctx.history,
        context: ctx.context,
        question: ctx.question,
      });
      await saveTutorExchange({
        data: { subjectId: activeId, question: content, reply },
      });
      await refresh();
    } catch (error) {
      setText(content);
      toast.error(errText(error));
    } finally {
      setBusy(false);
    }
  }

  async function sendCloud() {
    const content = text.trim();
    if (!content || !activeId || busy) return;
    setText("");
    setBusy(true);
    try {
      await sendTutorMessage({ data: { subjectId: activeId, content } });
      await refresh();
    } catch (error) {
      setText(content);
      toast.error(errText(error));
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (useLocal && (isLocalAiReady() || modelStatus === "ready")) {
      await sendLocal();
    } else if (useLocal && modelStatus === "loading") {
      toast.message("Still downloading the local model… try again in a moment.");
    } else {
      await sendCloud();
    }
  }

  return (
    <div className="flex min-h-[70dvh] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-mute">Tutor</p>
          <h1 className="font-display text-5xl leading-none">Ask the notes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {subjects.length > 0 && (
            <label className="text-sm text-mute">
              Subject
              <select
                className={`${fieldClass} mt-1 min-w-48`}
                value={activeId}
                onChange={(event) => setSubjectId(event.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-mute">
            <input
              type="checkbox"
              checked={useLocal}
              onChange={(e) => setUseLocal(e.target.checked)}
              className="size-4 accent-brass"
            />
            <Cpu className="size-4" />
            Local AI (Transformers.js)
          </label>
        </div>
      </header>

      {useLocal && modelStatus !== "ready" && (
        <Panel className="flex items-center gap-3 p-3 text-sm">
          {modelStatus === "loading" ? (
            <>
              <Download className="size-4 animate-pulse text-brass" />
              <div className="flex-1">
                <p className="text-mute">Downloading local model (Qwen1.5-0.5B)… {modelProgress}%</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink">
                  <div
                    className="h-full rounded-full bg-brass transition-all duration-300"
                    style={{ width: `${modelProgress}%` }}
                  />
                </div>
              </div>
            </>
          ) : modelStatus === "error" ? (
            <p className="text-mute">
              Local model unavailable{modelError ? `: ${modelError}` : ""}. Cloud tutor will be used if the API key is set.
            </p>
          ) : (
            <p className="text-mute">Preparing local model…</p>
          )}
        </Panel>
      )}

      {subjects.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="text-mute">Add a subject first, then come back to chat with the tutor.</p>
          <Link to="/subjects" className="mt-3 inline-block text-brass underline">
            Go to subjects
          </Link>
        </Panel>
      ) : noteCount === 0 && messages.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="text-mute">
            Upload notes on the desk so the tutor can ground answers in your material. You can still ask general questions.
          </p>
        </Panel>
      ) : null}

      {subjects.length > 0 && (
        <Panel className="flex min-h-[50dvh] flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <p className="text-xs text-mute">
              {useLocal && modelStatus === "ready"
                ? "Running locally with Transformers.js · Qwen1.5-0.5B"
                : useLocal
                  ? "Local model loading…"
                  : "Cloud tutor (xAI)"}
            </p>
            {messages.length > 0 && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-mute hover:text-parchment"
                onClick={async () => {
                  try {
                    await clearChat({ data: { subjectId: activeId } });
                    await refresh();
                    toast.success("Chat cleared");
                  } catch (error) {
                    toast.error(errText(error));
                  }
                }}
              >
                <Trash2 className="size-3.5" />
                Clear
              </button>
            )}
          </div>
          <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && !busy && (
              <p className="m-auto max-w-sm text-center text-sm text-mute">
                Ask for an explanation, a worked example, or a check question. Replies can become cards.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === "user" ? "ml-auto max-w-[40rem]" : "max-w-[40rem]"}
              >
                <div
                  className={
                    message.role === "user"
                      ? "rounded-lg bg-brass px-4 py-3 text-on-brass"
                      : "rounded-lg bg-ink px-4 py-3"
                  }
                >
                  {message.role === "assistant" ? (
                    <div className="tutor-md text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "assistant" && (
                  <button
                    type="button"
                    className="mt-1 min-h-11 text-xs text-brass disabled:opacity-50"
                    disabled={savingId === message.id}
                    onClick={async () => {
                      setSavingId(message.id);
                      try {
                        await cardFromReply({ data: { messageId: message.id } });
                        await refresh();
                        toast.success("Saved to your cards");
                      } catch (error) {
                        toast.error(errText(error));
                      } finally {
                        setSavingId(null);
                      }
                    }}
                  >
                    {savingId === message.id ? "Making a card…" : "Save as card"}
                  </button>
                )}
              </div>
            ))}
            {busy && (
              <p className="text-sm text-mute">
                {useLocal && modelStatus === "ready" ? "Thinking locally…" : "Reading the notes…"}
              </p>
            )}
          </div>
          <form
            className="flex items-end gap-2 border-t border-line p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
          >
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Ask about a lecture, a problem, or a term."
              className={`${fieldClass} max-h-40 py-2`}
            />
            <Button type="submit" disabled={busy || !text.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}
