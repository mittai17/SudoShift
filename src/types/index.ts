export type EisenhowerMatrix = "DO" | "DECIDE" | "DELEGATE" | "DELETE" | "NOTE" | "MERMAID" | "TABLE" | "IMAGE" | "LINK" | "CHECKLIST" | "CODE" | "VIDEO" | "WHITEBOARD" | "TIMER" | "CALCULATOR" | "CALENDAR" | "FORMULA";

export interface TaskData {
  id: string; // The generated ID
  title: string;
  description?: string;
  matrix: EisenhowerMatrix;
  deadline: string | null; // ISO string 
  estimatedMinutes?: number;
  isConflicting?: boolean;
  tags?: string[];
}

export interface NodeData extends Record<string, unknown> {
  task: TaskData;
  onChange?: (id: string, text: string) => void;
}

