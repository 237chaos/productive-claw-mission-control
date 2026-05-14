import { readDailyMemories, readLongTermMemory } from "@/lib/workspace";
import { marked } from "marked";
import MemoryViewer from "./MemoryViewer";

export default async function MemoryPage() {
  const rawMemories = readDailyMemories();
  const longTermRaw = readLongTermMemory();

  const dailyMemories = rawMemories.map((m) => ({
    ...m,
    html: marked(m.content, { async: false }) as string,
  }));

  const longTermHtml = marked(longTermRaw, { async: false }) as string;

  return (
    <MemoryViewer
      dailyMemories={dailyMemories}
      longTermHtml={longTermHtml}
    />
  );
}
