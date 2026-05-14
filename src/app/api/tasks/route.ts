import { NextResponse } from "next/server";
import { readTasks, writeTasksFile, appendActivity } from "@/lib/workspace";
import type { Task } from "@/lib/workspace";

export async function GET() {
  return NextResponse.json(readTasks());
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const tasks = readTasks();
  const now = new Date().toISOString();

  const newTask: Task = {
    id: `task_${Date.now()}`,
    title: body.title.trim(),
    description: body.description?.trim() || undefined,
    status: body.status || "todo",
    priority: body.priority || "medium",
    agent: body.agent || undefined,
    project: body.project || undefined,
    created: now,
    updated: now,
  };

  tasks.push(newTask);
  writeTasksFile(tasks);

  appendActivity({
    agentId: body.agent || "user",
    action: "created",
    taskId: newTask.id,
    taskTitle: newTask.title,
    timestamp: now,
  });

  return NextResponse.json(newTask, { status: 201 });
}
