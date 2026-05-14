import { Calendar, Clock } from "lucide-react";
import { readCronJobs } from "@/lib/workspace";
import type { CronJob } from "@/lib/workspace";

const TYPE_STYLES: Record<
  CronJob["type"],
  { label: string; color: string; border: string; bg: string }
> = {
  daily: {
    label: "DAILY",
    color: "#0080ff",
    border: "#0080ff40",
    bg: "#0080ff10",
  },
  recurring: {
    label: "RECURRING",
    color: "#00ffaa",
    border: "#00ffaa40",
    bg: "#00ffaa10",
  },
  "one-shot": {
    label: "ONE-SHOT",
    color: "#ffb800",
    border: "#ffb80040",
    bg: "#ffb80010",
  },
};

function parseCronHuman(schedule: string): string {
  if (!schedule) return "Unknown schedule";
  if (schedule === "@daily" || schedule === "0 0 * * *") return "Daily at midnight";
  if (schedule === "@hourly") return "Every hour";
  if (schedule === "@weekly") return "Weekly";
  if (schedule === "@once") return "One-time";

  const parts = schedule.split(" ");
  if (parts.length === 5) {
    const [min, hour, dom, month, dow] = parts;
    if (dow !== "*") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[parseInt(dow)] || dow;
      return `Every ${dayName} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }
    if (dom === "*" && month === "*") {
      return `Daily at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
    }
    return schedule;
  }
  return schedule;
}

function CronCard({ cron }: { cron: CronJob }) {
  const style = TYPE_STYLES[cron.type];
  const humanSchedule = parseCronHuman(cron.schedule);
  const shortPrompt =
    cron.prompt.length > 160 ? cron.prompt.slice(0, 160) + "…" : cron.prompt;

  return (
    <div
      className={`rounded border bg-mc-card p-4 mb-3 transition-colors hover:border-mc-border-bright ${
        !cron.enabled ? "opacity-40" : ""
      }`}
      style={{ borderColor: cron.enabled ? style.border : "#1a1a35" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border tracking-wider"
              style={{
                color: style.color,
                borderColor: style.border,
                backgroundColor: style.bg,
              }}
            >
              {style.label}
            </span>
            {!cron.enabled && (
              <span className="font-mono text-[10px] text-mc-muted border border-mc-border px-2 py-0.5 rounded">
                DISABLED
              </span>
            )}
            <span className="font-mono text-xs text-mc-muted ml-auto flex items-center gap-1.5">
              <Clock size={11} />
              {humanSchedule}
            </span>
          </div>
          <code className="font-mono text-[10px] text-mc-subtle block mb-2">
            {cron.schedule}
          </code>
          {cron.channel && (
            <div className="font-mono text-[10px] text-mc-muted mb-2">
              → {cron.channel}
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-mc-muted leading-relaxed font-mono break-words">
        {shortPrompt}
      </p>
    </div>
  );
}

export default function CalendarPage() {
  const crons = readCronJobs();

  const daily = crons.filter((c) => c.type === "daily");
  const recurring = crons.filter((c) => c.type === "recurring");
  const oneShot = crons.filter((c) => c.type === "one-shot");

  return (
    <div className="px-8 pt-7 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Calendar size={20} className="text-mc-blue" />
        <h1 className="text-lg font-semibold tracking-tight">Calendar</h1>

        {/* Filter pills */}
        <div className="flex items-center gap-2 ml-auto">
          <span
            className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
            style={{
              color: "#0080ff",
              borderColor: "#0080ff40",
              backgroundColor: "#0080ff10",
            }}
          >
            ● DAILY ({daily.length})
          </span>
          <span
            className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
            style={{
              color: "#00ffaa",
              borderColor: "#00ffaa40",
              backgroundColor: "#00ffaa10",
            }}
          >
            ● RECURRING ({recurring.length})
          </span>
          <span
            className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
            style={{
              color: "#ffb800",
              borderColor: "#ffb80040",
              backgroundColor: "#ffb80010",
            }}
          >
            ● ONE-SHOT ({oneShot.length})
          </span>
        </div>
      </div>

      {crons.length === 0 ? (
        <div className="rounded border border-mc-border bg-mc-card p-10 text-center">
          <Calendar size={28} className="text-mc-muted mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No scheduled tasks</p>
          <p className="text-mc-muted text-sm mb-4">
            Cron jobs set up in openclaw.json will appear here.
          </p>
          <p className="font-mono text-[11px] text-mc-subtle">
            Ask Maduso to schedule a recurring task, or add a cron entry to{" "}
            <code className="text-mc-blue">~/.openclaw/openclaw.json</code>
          </p>
        </div>
      ) : (
        <div className="max-w-3xl">
          {daily.length > 0 && (
            <section className="mb-7">
              <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-3 uppercase">
                Daily
              </div>
              {daily.map((c) => (
                <CronCard key={c.id} cron={c} />
              ))}
            </section>
          )}
          {recurring.length > 0 && (
            <section className="mb-7">
              <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-3 uppercase">
                Recurring
              </div>
              {recurring.map((c) => (
                <CronCard key={c.id} cron={c} />
              ))}
            </section>
          )}
          {oneShot.length > 0 && (
            <section className="mb-7">
              <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-3 uppercase">
                One-shot
              </div>
              {oneShot.map((c) => (
                <CronCard key={c.id} cron={c} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
