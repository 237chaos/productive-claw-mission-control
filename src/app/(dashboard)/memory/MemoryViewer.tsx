"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Search } from "lucide-react";
import type { DailyMemory } from "@/lib/workspace";

interface MemoryWithHtml extends DailyMemory {
  html: string;
}

interface Props {
  dailyMemories: MemoryWithHtml[];
  longTermHtml: string;
}

export default function MemoryViewer({ dailyMemories, longTermHtml }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"daily" | "longterm">("daily");
  const [selected, setSelected] = useState<string>(
    dailyMemories[0]?.date || ""
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(interval);
  }, [router]);

  const filteredMemories = dailyMemories.filter(
    (m) =>
      !search ||
      m.date.includes(search) ||
      m.content.toLowerCase().includes(search.toLowerCase())
  );

  const activeMemory = dailyMemories.find((m) => m.date === selected);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-mc-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-mc-blue" />
          <h1 className="text-lg font-semibold tracking-tight">Memory</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center bg-mc-card border border-mc-border rounded p-0.5">
            <button
              onClick={() => setTab("daily")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                tab === "daily"
                  ? "bg-mc-blue/20 text-mc-blue"
                  : "text-mc-muted hover:text-white"
              }`}
            >
              Daily Log
            </button>
            <button
              onClick={() => setTab("longterm")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                tab === "longterm"
                  ? "bg-mc-blue/20 text-mc-blue"
                  : "text-mc-muted hover:text-white"
              }`}
            >
              Long-term
            </button>
          </div>

          {/* Search */}
          {tab === "daily" && (
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-mc-muted"
              />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-mc-card border border-mc-border rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-mc-muted focus:outline-none focus:border-mc-blue w-40"
              />
            </div>
          )}
        </div>
      </div>

      {tab === "daily" ? (
        <div className="flex flex-1 min-h-0">
          {/* Left panel — date list */}
          <div className="w-[220px] flex-shrink-0 border-r border-mc-border overflow-y-auto">
            {filteredMemories.length === 0 ? (
              <div className="p-6 text-center text-mc-muted text-xs">
                {search ? "No matches" : "No memory files yet"}
              </div>
            ) : (
              filteredMemories.map((m) => (
                <button
                  key={m.date}
                  onClick={() => setSelected(m.date)}
                  className={`w-full text-left px-4 py-3.5 border-b border-mc-border transition-colors ${
                    selected === m.date
                      ? "bg-mc-blue/10 border-l-2 border-l-mc-blue"
                      : "hover:bg-mc-card border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="font-mono text-sm font-semibold text-white">
                    {m.date}
                  </div>
                  <div className="font-mono text-[10px] text-mc-muted mt-0.5">
                    {m.wordCount.toLocaleString()} words
                  </div>
                  <div className="text-[11px] text-mc-muted mt-1 leading-tight line-clamp-2">
                    {m.preview}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right panel — content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {activeMemory ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-mono text-xs text-mc-muted bg-mc-card border border-mc-border px-2 py-1 rounded">
                    {activeMemory.date}
                  </span>
                  <span className="font-mono text-xs text-mc-muted">
                    {activeMemory.wordCount.toLocaleString()} words
                  </span>
                </div>
                <div
                  className="mc-prose"
                  dangerouslySetInnerHTML={{ __html: activeMemory.html }}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-40 text-mc-muted text-sm">
                Select a date to read
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Long-term memory */
        <div className="flex-1 overflow-y-auto px-8 py-6 max-w-3xl">
          <div
            className="mc-prose"
            dangerouslySetInnerHTML={{ __html: longTermHtml }}
          />
        </div>
      )}
    </div>
  );
}
