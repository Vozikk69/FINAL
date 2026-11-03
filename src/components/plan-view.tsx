import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PomoPanel } from "@/components/app-shell";
import { Button, EmptyLine, Field, Panel, fieldClass } from "@/components/ui";
import { todayKey, type PlanTask } from "@/lib/study/domain";
import { addTask, deleteTask, generatePlan, toggleTask } from "@/lib/study/server";
import { errText, useDesk, useRefreshDesk } from "@/lib/study/use-desk";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayLabel(value: string, today: string) {
  if (value < today) return "Overdue";
  if (value === today) return "Today";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return `${WEEKDAYS[date.getDay()]} ${d} ${MONTHS[date.getMonth()]}`;
}

export function PlanView() {
  const query = useDesk();
  const refresh = useRefreshDesk();
  const [subjectId, setSubjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  if (query.isLoading || !query.data) return <p className="text-mute">Loading plan…</p>;
  const data = query.data;
  const subjects = data.subjects;
  const activeId = subjectId || subjects[0]?.id || "";
  const subject = subjects.find((item) => item.id === activeId);
  const tasks = data.tasks.filter((task) => task.subjectId === activeId);
  const today = todayKey();
  const groups = new Map<string, PlanTask[]>();
  for (const task of tasks) {
    const list = groups.get(task.dueDate) ?? [];
    list.push(task);
    groups.set(task.dueDate, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-mute">Plan</p>
        <h1 className="font-display text-3xl leading-none">Exam plan</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <div className="flex flex-col gap-4">
          <PomoPanel subjects={subjects} />
          <Panel className="p-5">
            {subjects.length === 0 ? (
              <p className="text-sm text-mute">Add a subject before building a plan.</p>
            ) : (
              <form
                key={activeId}
                className="flex flex-col gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  setBusy(true);
                  setNote("");
                  try {
                    const result = await generatePlan({
                      data: {
                        subjectId: String(form.get("subjectId") ?? activeId),
                        topics: String(form.get("topics") ?? ""),
                        examDate: String(form.get("examDate") ?? ""),
                        today,
                        hoursPerDay: Number(form.get("hours") ?? 2),
                      },
                    });
                    setNote(
                      result.source === "tutor"
                        ? "The tutor laid out the days. Tick them off as you go."
                        : "Drafted from your topics without the tutor. You can still edit the list.",
                    );
                    await refresh();
                  } catch (error) {
                    toast.error(errText(error));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Field label="Subject">
                  <select
                    name="subjectId"
                    className={fieldClass}
                    value={activeId}
                    onChange={(event) => setSubjectId(event.target.value)}
                  >
                    {subjects.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Exam date">
                  <input name="examDate" type="date" required defaultValue={subject?.targetDate ?? ""} min={today} className={fieldClass} />
                </Field>
                <Field label="Hours a day">
                  <input name="hours" type="number" min={0.5} max={8} step={0.5} defaultValue={2} className={fieldClass} />
                </Field>
                <Field label="Topics, one per line">
                  <textarea name="topics" rows={5} className={`${fieldClass} py-2`} placeholder={"Membrane transport\nCellular respiration\nMitosis"} />
                </Field>
                <Button type="submit" disabled={busy}>
                  {busy ? "Building the plan…" : "Build plan"}
                </Button>
                {note && <p className="text-sm text-mute">{note}</p>}
              </form>
            )}
          </Panel>
        </div>

        <Panel className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl">{subject ? subject.title : "Tasks"}</h2>
              <p className="text-sm text-mute">
                {tasks.filter((task) => task.isCompleted).length}/{tasks.length} done
              </p>
            </div>
          </div>

          {subjects.length > 0 && (
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const data = new FormData(form);
                try {
                  await addTask({
                    data: {
                      subjectId: activeId,
                      title: String(data.get("title") ?? ""),
                      dueDate: String(data.get("dueDate") ?? today),
                    },
                  });
                  form.reset();
                  await refresh();
                } catch (error) {
                  toast.error(errText(error));
                }
              }}
            >
              <input name="title" required placeholder="Add a task" className={fieldClass} />
              <input name="dueDate" type="date" required defaultValue={today} className={`${fieldClass} sm:max-w-44`} />
              <Button type="submit" variant="line">
                Add
              </Button>
            </form>
          )}

          {tasks.length === 0 ? (
            <EmptyLine>No tasks for this subject yet.</EmptyLine>
          ) : (
            <div className="mt-4 flex flex-col gap-5">
              {Array.from(groups.entries()).map(([date, items]) => (
                <section key={date}>
                  <h3 className="text-xs tracking-wide text-mute uppercase">{dayLabel(date, today)}</h3>
                  <ul className="mt-2 flex flex-col">
                    {items.map((task) => (
                      <li key={task.id} className="flex items-center gap-3 border-b border-line py-1">
                        <label className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            className="size-5 accent-brass"
                            checked={task.isCompleted}
                            onChange={async () => {
                              try {
                                await toggleTask({ data: { id: task.id } });
                                await refresh();
                              } catch (error) {
                                toast.error(errText(error));
                              }
                            }}
                          />
                          <span className={task.isCompleted ? "text-mute line-through" : ""}>{task.title}</span>
                        </label>
                        <button
                          type="button"
                          aria-label="Delete task"
                          className="grid h-11 w-11 place-items-center text-mute hover:text-coral"
                          onClick={async () => {
                            try {
                              await deleteTask({ data: { id: task.id } });
                              await refresh();
                            } catch (error) {
                              toast.error(errText(error));
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
