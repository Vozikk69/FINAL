import { pipeline, env } from "@huggingface/transformers";

// Prefer browser cache; models download once per origin.
env.allowLocalModels = false;
env.useBrowserCache = true;

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

  loadPromise = (async () => {
    try {
      const modelId = "Xenova/Qwen1.5-0.5B-Chat";
      const pipe = await pipeline("text-generation", modelId, {
        progress_callback: (info: ProgressInfo) => {
          if (typeof info.progress === "number") {
            loadProgress = Math.min(99, Math.round(info.progress));
            onProgress?.(loadProgress, info.status ?? "download");
          }
        },
        dtype: "q4",
      });
      generator = pipe;
      loadProgress = 100;
      loadStatus = "ready";
      onProgress?.(100, "ready");
      return pipe;
    } catch (err) {
      loadStatus = "error";
      lastError = err instanceof Error ? err.message : String(err);
      loadPromise = null;
      throw err;
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
  const notes = input.context.length
    ? input.context.map((c, i) => `[${i + 1}] (${c.source})\n${c.text}`).join("\n\n")
    : "No notes matched this question.";

  const system = `You are Lumen, a calm university study tutor for "${input.subjectTitle}".
${input.description ? `Subject: ${input.description}` : ""}
Rules:
- Be concrete and short. No pep talks or filler.
- When the notes below are relevant, ground the answer in them and cite [1], [2].
- If notes do not cover the question, say so briefly then teach from general knowledge.
- Use Markdown: short paragraphs and bullets. One worked example when helpful.
- End explanatory answers with a single check-your-understanding question.

Student notes:
${notes}`;

  // Qwen chat format
  let prompt = `<|im_start|>system\n${system}<|im_end|>\n`;
  for (const msg of input.history.slice(-6)) {
    const role = msg.role === "assistant" ? "assistant" : "user";
    prompt += `<|im_start|>${role}\n${msg.content.slice(0, 1500)}<|im_end|>\n`;
  }
  prompt += `<|im_start|>user\n${input.question.slice(0, 2000)}<|im_end|>\n<|im_start|>assistant\n`;
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
  const prompt = buildPrompt(input);

  const outputs = await gen(prompt, {
    max_new_tokens: 320,
    temperature: 0.45,
    top_p: 0.9,
    do_sample: true,
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
  return text.slice(0, 8000);
}

export function isLocalAiReady() {
  return loadStatus === "ready" && generator != null;
}
