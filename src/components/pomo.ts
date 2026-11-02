import { useSyncExternalStore } from "react";

export type PomoState = {
  mode: "focus" | "break";
  remaining: number;
  total: number;
  running: boolean;
  subjectId: string | null;
};

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

const INITIAL: PomoState = {
  mode: "focus",
  remaining: FOCUS,
  total: FOCUS,
  running: false,
  subjectId: null,
};

let state: PomoState = INITIAL;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

type Logger = (info: { minutes: number; subjectId: string | null }) => void;
let logger: Logger | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function startTimer() {
  if (timer != null || typeof window === "undefined") return;
  timer = setInterval(() => {
    if (!state.running) return;
    if (state.remaining <= 1) {
      const finished = state;
      if (finished.mode === "focus") {
        logger?.({ minutes: Math.max(1, Math.round(finished.total / 60)), subjectId: finished.subjectId });
        state = {
          mode: "break",
          remaining: BREAK,
          total: BREAK,
          running: true,
          subjectId: finished.subjectId,
        };
      } else {
        state = {
          mode: "focus",
          remaining: FOCUS,
          total: FOCUS,
          running: false,
          subjectId: finished.subjectId,
        };
      }
      emit();
      return;
    }
    state = { ...state, remaining: state.remaining - 1 };
    emit();
  }, 1000);
}

export function setPomoLogger(next: Logger | null) {
  logger = next;
}

export function pomoToggle() {
  state = { ...state, running: !state.running };
  if (state.running) startTimer();
  emit();
}

export function pomoReset() {
  const total = state.mode === "focus" ? FOCUS : BREAK;
  state = { ...state, remaining: total, total, running: false };
  emit();
}

export function pomoEndEarly() {
  const subjectId = state.subjectId;
  const minutes = state.mode === "focus" ? Math.round((state.total - state.remaining) / 60) : 0;
  state = { mode: "focus", remaining: FOCUS, total: FOCUS, running: false, subjectId };
  emit();
  if (minutes >= 1) logger?.({ minutes, subjectId });
}

export function pomoSetSubject(subjectId: string | null) {
  state = { ...state, subjectId };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePomo() {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

export function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
