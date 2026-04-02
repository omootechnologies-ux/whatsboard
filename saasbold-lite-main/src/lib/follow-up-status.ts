import type { FollowUpRecord } from "@/data/whatsboard";

export function statusFromDueDate(dueAt: string): FollowUpRecord["status"] {
  const now = new Date();
  const due = new Date(dueAt);
  const nowStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dueStart = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();

  if (dueStart < nowStart) return "overdue";
  if (dueStart === nowStart) return "today";
  return "upcoming";
}
