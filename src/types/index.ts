export type NodeCategory =
  | 'goal'
  | 'project'
  | 'task'
  | 'event'
  | 'milestone'
  | 'habit'
  | 'resource'
  | 'note';

export type EisenhowerMatrix =
  | 'DO' | 'DECIDE' | 'DELEGATE' | 'DELETE'
  // Legacy flat node types (backward compat)
  | 'NOTE' | 'MERMAID' | 'TABLE' | 'IMAGE' | 'LINK' | 'CHECKLIST'
  | 'CODE' | 'VIDEO' | 'WHITEBOARD' | 'TIMER' | 'CALCULATOR' | 'CALENDAR' | 'FORMULA'
  // New hierarchical node matrix values
  | 'GOAL' | 'GOAL_PROJECT' | 'GOAL_EVENT' | 'GOAL_HABIT' | 'GOAL_MILESTONE' | 'GOAL_NOTE'
  | 'PROJECT' | 'PROJECT_TASK' | 'PROJECT_RESOURCE' | 'PROJECT_MILESTONE' | 'PROJECT_NOTE'
  | 'PROJECT_CHECKLIST' | 'PROJECT_TABLE'
  | 'TASK' | 'TASK_CHECKLIST' | 'TASK_LINK' | 'TASK_VIDEO' | 'TASK_TIMER' | 'TASK_CODE' | 'TASK_NOTE'
  | 'EVENT' | 'EVENT_NOTE' | 'EVENT_CHECKLIST' | 'EVENT_TABLE' | 'EVENT_VIDEO' | 'EVENT_LINK'
  | 'MILESTONE' | 'MILESTONE_EVIDENCE' | 'MILESTONE_NOTE' | 'MILESTONE_ATTACHMENT'
  | 'HABIT' | 'HABIT_TIMER' | 'HABIT_TABLE' | 'HABIT_CALENDAR' | 'HABIT_NOTE'
  | 'RESOURCE' | 'RESOURCE_VIDEO' | 'RESOURCE_LINK' | 'RESOURCE_NOTE' | 'RESOURCE_IMAGE' | 'RESOURCE_PDF'
  | 'NOTE_NODE' | 'NOTE_IMAGE' | 'NOTE_CODE' | 'NOTE_MERMAID' | 'NOTE_FORMULA' | 'NOTE_TABLE' | 'NOTE_LINK';

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  matrix: EisenhowerMatrix;
  deadline: string | null;
  estimatedMinutes?: number;
  isConflicting?: boolean;
  tags?: string[];
  [key: string]: unknown;
}

export interface NodeData extends Record<string, unknown> {
  task: TaskData;
  onChange?: (id: string, text: string) => void;
}
