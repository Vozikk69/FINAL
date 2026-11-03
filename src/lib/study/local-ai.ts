import { pipeline, env } from "@huggingface/transformers";

// Prefer browser cache; models download once per origin.
env.allowLocalModels = false;
env.useBrowserCache = true;
env.allowRemoteModels = true;

/**
 * Configure ONNX Runtime Web as safely as possible.
 * Proxy workers + multi-threading often fail in iframes / strict CSP /
 * missing COOP-COEP headers → "no available backend found".
 * Single-thread, no proxy is the most compatible path.
 */
function configureWasmBackend() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backends = (env as any).backends;
    if (!backends?.onnx?.wasm) return;

    // Disable proxy — it frequently throws [wasm] ErrorEvent in embedded previews.
    backends.onnx.wasm.proxy = false;
    // Single thread avoids SharedArrayBuffer / COOP-COEP requirements.
    backends.onnx.wasm.numThreads = 1;
    // Some environments need an explicit simd flag off for older Safari / restricted iframes.
    if ("simd" in backends.onnx.wasm) {
      backends.onnx.wasm.simd = false;
    }
  } catch {
    /* ignore — env shape differs between versions */
  }
}

configureWasmBackend();

/** True when the page is embedded (common cause of WASM backend failure). */
export function isLikelyRestrictedContext(): boolean {
  try {
    if (typeof window === "undefined") return true;
    if (window.self !== window.top) return true;
    // Cross-origin frame access throws; treat as restricted.
    void window.top?.location?.href;
    return false;
  } catch {
    return true;
  }
}

type ProgressInfo = {
  status?: string;
  progress?: number;
  file?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TextGenPipeline = any;

let generator: TextGenPipeline | null = null;
let loadPromise: Promise<TextGenPipeline> | null = null;
let loadProgress = 0;
let loadStatus = "idle" as "idle" | "loading" | "ready" | "error";
let lastError: string | null = null;

export function getLocalAiStatus() {
  return { progress: loadProgress, status: loadStatus, error: lastError };
}

/** Let the browser paint (busy spinner, etc.) before heavy work. */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function friendlyWasmError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  // ErrorEvent objects often stringify poorly as "[object ErrorEvent]".
  if (/no available backend|wasm|ErrorEvent|SharedArrayBuffer|COOP|COEP|\[object ErrorEvent\]/i.test(raw)) {
    return "Local model unavailable in this browser context (WASM backend blocked). Open the app in a regular browser tab and check that WebAssembly is enabled.";
  }
  if (raw === "[object ErrorEvent]" || raw.includes("[object ErrorEvent]")) {
    return "Local model unavailable in this browser context (WASM backend blocked). Open the app in a regular browser tab and check that WebAssembly is enabled.";
  }
  return raw || "Local model failed to load.";
}

/**
 * Lazy-load a small chat model suitable for browser (Transformers.js / ONNX).
 * Uses Qwen1.5-0.5B-Chat which is small enough for demo and has chat template support.
 */
export async function loadLocalTutor(
  onProgress?: (p: number, status: string) => void,
): Promise<TextGenPipeline> {
  if (generator) {
    loadStatus = "ready";
    return generator;
  }
  if (loadPromise) return loadPromise;

  loadStatus = "loading";
  loadProgress = 0;
  lastError = null;
  configureWasmBackend();

  loadPromise = (async () => {
    try {
      await yieldToUi();
      const modelId = "Xenova/Qwen1.5-0.5B-Chat";

      // dtype q4 is smaller; if it fails, retry without quantized dtype.
      let pipe: TextGenPipeline;
      try {
        pipe = await pipeline("text-generation", modelId, {
          progress_callback: (info: ProgressInfo) => {
            if (typeof info.progress === "number") {
              loadProgress = Math.min(99, Math.round(info.progress));
              onProgress?.(loadProgress, info.status ?? "download");
            }
          },
          dtype: "q4",
        });
      } catch (q4err) {
        // Retry without q4 (fp32 / default) — some WASM builds reject quantized.
        console.warn("q4 load failed, retrying default dtype", q4err);
        pipe = await pipeline("text-generation", modelId, {
          progress_callback: (info: ProgressInfo) => {
            if (typeof info.progress === "number") {
              loadProgress = Math.min(99, Math.round(info.progress));
              onProgress?.(loadProgress, info.status ?? "download");
            }
          },
        });
      }

      generator = pipe;
      loadProgress = 100;
      loadStatus = "ready";
      onProgress?.(100, "ready");
      return pipe;
    } catch (err) {
      loadStatus = "error";
      lastError = friendlyWasmError(err);
      loadPromise = null;
      throw new Error(lastError);
    }
  })();

  return loadPromise;
}

function buildPrompt(input: {
  subjectTitle: string;
  description: string;
  history: { role: "user" | "assistant"; content: string }[];
  context: { source: string; text: string }[];
  question: string;
}) {
  // Keep context short — long prompts make main-thread / WASM work much heavier.
  const notes = input.context.length
    ? input.context
        .slice(0, 3)
        .map((c, i) => `[${i + 1}] (${c.source})\n${c.text.slice(0, 600)}`)
        .join("\n\n")
    : "No notes matched this question.";

  const system = `You are Lumen, a study tutor for "${input.subjectTitle}".
${input.description ? `Subject: ${input.description.slice(0, 300)}` : ""}
Rules:
- Be concrete and short (under 120 words). No pep talks or filler.
- When the notes below are relevant, ground the answer in them and cite [1], [2].
- If notes do not cover the question, say so briefly then teach from general knowledge.
- Use short paragraphs or bullets. One worked example only if needed.
- End with one check-your-understanding question.

Student notes:
${notes}`;

  let prompt = `<|im_start|>system\n${system}<|im_end|>\n`;
  for (const msg of input.history.slice(-4)) {
    const role = msg.role === "assistant" ? "assistant" : "user";
    prompt += `<|im_start|>${role}\n${msg.content.slice(0, 800)}<|im_end|>\n`;
  }
  prompt += `<|im_start|>user\n${input.question.slice(0, 1200)}<|im_end|>\n<|im_start|>assistant\n`;
  return prompt;
}

export async function localTutorReply(input: {
  subjectTitle: string;
  description: string;
  history: { role: "user" | "assistant"; content: string }[];
  context: { source: string; text: string }[];
  question: string;
}): Promise<string> {
  const gen = await loadLocalTutor();
  // Paint "Thinking…" before WASM starts chewing CPU.
  await yieldToUi();
  const prompt = buildPrompt(input);

  // Greedy + fewer tokens = much less chance of "Page Unresponsive".
  const outputs = await gen(prompt, {
    max_new_tokens: 140,
    temperature: 0.3,
    top_p: 0.9,
    do_sample: false,
    return_full_text: false,
  });

  const first = Array.isArray(outputs) ? outputs[0] : outputs;
  const raw =
    first && typeof first === "object" && "generated_text" in first
      ? String((first as { generated_text: string }).generated_text)
      : String(first ?? "");
  let text = raw
    .replace(/<\|im_end\|>/g, "")
    .replace(/<\|im_start\|>/g, "")
    .replace(/^\s*assistant\s*/i, "")
    .trim();
  if (!text) throw new Error("Local model returned an empty reply.");
  return text.slice(0, 4000);
}

export function isLocalAiReady() {
  return loadStatus === "ready" && generator != null;
}

/** Reset so the next open can try again (e.g. after user toggles Local AI). */
export function resetLocalAi() {
  generator = null;
  loadPromise = null;
  loadProgress = 0;
  loadStatus = "idle";
  lastError = null;
}
