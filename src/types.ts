export type EisenhowerMatrix = "DO" | "DECIDE" | "DELEGATE" | "DELETE" | "NOTE" | "MERMAID";

export interface TaskData {
  id: string; // The generated ID
  title: string;
  description?: string;
  matrix: EisenhowerMatrix;
  deadline: string | null; // ISO string 
  estimatedMinutes?: number;
  isConflicting?: boolean;
}

export interface NodeData extends Record<string, unknown> {
  task: TaskData;
  onChange?: (id: string, text: string) => void;
}

