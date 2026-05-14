import { readTasks, readActivity } from "@/lib/workspace";
import TasksClient from "./TasksClient";

export default function TasksPage() {
  const tasks = readTasks();
  const activity = readActivity();
  return <TasksClient tasks={tasks} activity={activity} />;
}
