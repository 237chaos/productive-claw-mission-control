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

function parseCronHuman(schedule: string, tz?: string): string {
  if (!schedule) return "One-time";
  if (schedule === "@daily") return "Daily at midnight";
  if (schedule === "@hourly") return "Every hour";
  if (schedule === "@weekly") return "Weekly";
  if (schedule === "@once") return "One-time";

  const tzLabel = tz
    ? " " + (tz.split("/")[1] || tz).replace("_", " ")
    : "";

  const parts = schedule.split(" ");
  if (parts.length === 5) {
    const [min, hour, dom, month, dow] = parts;
    const timeStr = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}${tzLabel}`;
    if (dow !== "*") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dowParts = dow.split("-");
      if (dowParts.length === 2) {
        const from = days[parseInt(dowParts[0])] || dowParts[0];
        const to = days[parseInt(dowParts[1])] || dowParts[1];
        return `${from}–${to} at ${timeStr}`;
      }
      const dayName = days[parseInt(dow)] || dow;
      return `Every ${dayName} at ${timeStr}`;
    }
    if (dom === "*" && month === "*") {
      return `Daily at ${timeStr}`;
    }
    if (dom !== "*" && month !== "*") {
      return `${month}/${dom} at ${timeStr}`;
    }
    return schedule;
  }
  return schedule;
}

function CronCard({ cron }: { cron: CronJob }) {
  const style = TYPE_STYLES[cron.type];
  const humanSchedule = parseCronHuman(cron.schedule, cron.tz);
  const shortPrompt =
    cron.prompt.length > 200 ? cron.prompt.slice(0, 200) + "…" : cron.prompt;

  return (
    <div
      className={`rounded border bg-mc-card p-4 mb-3 transition-colors hover:border-mc-border-bright ${
        !cron.enabled ? "opacity-40" : ""
      }`}
      style={{ borderColor: cron.enabled ? style.border : "#1a1a35" }}
    >
      {/* Header row */}
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

      {/* Name */}
      {cron.name && (
        <div className="text-white text-sm font-semibold mb-0.5">{cron.name}</div>
      )}

      {/* Description */}
      {cron.description && (
        <p className="text-mc-muted text-xs leading-relaxed mb-2">
          {cron.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-2 mb-3">
        <code className="font-mono text-[10px] text-mc-subtle">
          {cron.schedule}
        </code>
        {cron.agentId && (
          <span className="font-mono text-[10px] text-mc-muted border border-mc-border px-1.5 py-0.5 rounded ml-auto">
            agent: {cron.agentId}
          </span>
        )}
      </div>

      {/* Prompt preview */}
      {shortPrompt && (
        <p className="text-[11px] text-mc-muted/70 leading-relaxed font-mono break-words border-t border-mc-border pt-3">
          {shortPrompt}
        </p>
      )}
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
            Scheduled agent tasks will appear here.
          </p>
          <p className="font-mono text-[11px] text-mc-subtle">
            Ask Maduso on Telegram to schedule something, or use{" "}
            <code className="text-mc-blue">openclaw cron add</code> in the
            terminal. Jobs are stored in{" "}
            <code className="text-mc-blue">~/.openclaw/cron/jobs.json</code>
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
