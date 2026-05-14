import { NextResponse } from "next/server";
import { readTasks, writeTasksFile, appendActivity } from "@/lib/workspace";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const prev = tasks[idx];
  const now = new Date().toISOString();
  tasks[idx] = { ...prev, ...body, id: prev.id, updated: now };
  writeTasksFile(tasks);

  if (body.status && body.status !== prev.status) {
    appendActivity({
      agentId: "user",
      action: body.status === "done" ? "completed" : "moved",
      taskId: prev.id,
      taskTitle: prev.title,
      from: prev.status,
      to: body.status,
      timestamp: now,
    });
  }

  return NextResponse.json(tasks[idx]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tasks = readTasks();
  const idx = tasks.findIndex((t) => t.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const deleted = tasks[idx];
  const now = new Date().toISOString();
  tasks.splice(idx, 1);
  writeTasksFile(tasks);

  appendActivity({
    agentId: "user",
    action: "deleted",
    taskId: deleted.id,
    taskTitle: deleted.title,
    timestamp: now,
  });

  return NextResponse.json({ ok: true });
}
