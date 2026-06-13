import React from 'react';
import { NodeDefinition } from './types';

// ── Goal ─────────────────────────────────────────────────────────────────────
import GoalNode from '../goal/GoalNode';
import GoalProjectNode from '../goal/GoalProjectNode';
import GoalEventNode from '../goal/GoalEventNode';
import GoalHabitNode from '../goal/GoalHabitNode';
import GoalMilestoneNode from '../goal/GoalMilestoneNode';
import GoalNoteNode from '../goal/GoalNoteNode';

// ── Project ───────────────────────────────────────────────────────────────────
import ProjectNode from '../project/ProjectNode';
import ProjectTaskNode from '../project/ProjectTaskNode';
import ProjectResourceNode from '../project/ProjectResourceNode';
import ProjectMilestoneNode from '../project/ProjectMilestoneNode';
import ProjectNoteNode from '../project/ProjectNoteNode';
import ProjectChecklistNode from '../project/ProjectChecklistNode';
import ProjectTableNode from '../project/ProjectTableNode';

// ── Task ──────────────────────────────────────────────────────────────────────
import TaskNode from '../task/TaskNode';
import TaskChecklistNode from '../task/TaskChecklistNode';
import TaskLinkNode from '../task/TaskLinkNode';
import TaskVideoNode from '../task/TaskVideoNode';
import TaskTimerNode from '../task/TaskTimerNode';
import TaskCodeNode from '../task/TaskCodeNode';
import TaskNoteNode from '../task/TaskNoteNode';

// ── Event ─────────────────────────────────────────────────────────────────────
import EventNode from '../event/EventNode';
import EventNoteNode from '../event/EventNoteNode';
import EventChecklistNode from '../event/EventChecklistNode';
import EventTableNode from '../event/EventTableNode';
import EventVideoNode from '../event/EventVideoNode';
import EventLinkNode from '../event/EventLinkNode';

// ── Milestone ─────────────────────────────────────────────────────────────────
import MilestoneNode from '../milestone/MilestoneNode';
import MilestoneEvidenceNode from '../milestone/MilestoneEvidenceNode';
import MilestoneNoteNode from '../milestone/MilestoneNoteNode';
import MilestoneAttachmentNode from '../milestone/MilestoneAttachmentNode';

// ── Habit ─────────────────────────────────────────────────────────────────────
import HabitNode from '../habit/HabitNode';
import HabitTimerNode from '../habit/HabitTimerNode';
import HabitTableNode from '../habit/HabitTableNode';
import HabitCalendarNode from '../habit/HabitCalendarNode';
import HabitNoteNode from '../habit/HabitNoteNode';

// ── Resource ──────────────────────────────────────────────────────────────────
import ResourceNode from '../resource/ResourceNode';
import ResourceVideoNode from '../resource/ResourceVideoNode';
import ResourceLinkNode from '../resource/ResourceLinkNode';
import ResourceNoteNode from '../resource/ResourceNoteNode';
import ResourceImageNode from '../resource/ResourceImageNode';
import ResourcePdfNode from '../resource/ResourcePdfNode';
import YoutubeTranscribeNode from '../resource/YoutubeTranscribeNode';
import OutputNode from '../resource/OutputNode';

import RoadmapMakerNode from '../resource/RoadmapMakerNode';
import CanvasNode from '../resource/CanvasNode';
import YoutubeApiNode from '../resource/YoutubeApiNode';

// ── Note ──────────────────────────────────────────────────────────────────────
import NoteNode from '../note/NoteNode';
import NoteImageNode from '../note/NoteImageNode';
import NoteCodeNode from '../note/NoteCodeNode';
import NoteMermaidNode from '../note/NoteMermaidNode';
import NoteFormulaNode from '../note/NoteFormulaNode';
import NoteTableNode from '../note/NoteTableNode';
import NoteLinkNode from '../note/NoteLinkNode';

export const NODE_REGISTRY: NodeDefinition[] = [
  // ── Goal ───────────────────────────────────────────────────────────────────
  { id: 'goal-node', label: 'Goal', category: 'goal', icon: '🎯', component: GoalNode, color: '#06b6d4', defaultData: { title: 'My Goal', description: '', matrix: 'GOAL', deadline: null } },
  { id: 'goal-project-node', label: 'Goal Project', category: 'goal', icon: '📦', component: GoalProjectNode, color: '#06b6d4', defaultData: { title: 'Goal Project', description: '', matrix: 'GOAL_PROJECT', deadline: null } },
  { id: 'goal-event-node', label: 'Goal Event', category: 'goal', icon: '📅', component: GoalEventNode, color: '#06b6d4', defaultData: { title: 'Goal Event', description: '', matrix: 'GOAL_EVENT', deadline: null } },
  { id: 'goal-habit-node', label: 'Goal Habit', category: 'goal', icon: '🔥', component: GoalHabitNode, color: '#06b6d4', defaultData: { title: 'Goal Habit', description: '', matrix: 'GOAL_HABIT', deadline: null } },
  { id: 'goal-milestone-node', label: 'Goal Milestone', category: 'goal', icon: '🚩', component: GoalMilestoneNode, color: '#06b6d4', defaultData: { title: 'Goal Milestone', description: '', matrix: 'GOAL_MILESTONE', deadline: null } },
  { id: 'goal-note-node', label: 'Goal Note', category: 'goal', icon: '📝', component: GoalNoteNode, color: '#06b6d4', defaultData: { title: 'Goal Note', description: '', matrix: 'GOAL_NOTE', deadline: null } },

  // ── Project ─────────────────────────────────────────────────────────────────
  { id: 'project-node', label: 'Project', category: 'project', icon: '📦', component: ProjectNode, color: '#3b82f6', defaultData: { title: 'New Project', description: '', matrix: 'PROJECT', deadline: null } },
  { id: 'project-task-node', label: 'Project Task', category: 'project', icon: '✅', component: ProjectTaskNode, color: '#3b82f6', defaultData: { title: 'Project Task', description: '', matrix: 'PROJECT_TASK', deadline: null } },
  { id: 'project-resource-node', label: 'Project Resource', category: 'project', icon: '📚', component: ProjectResourceNode, color: '#3b82f6', defaultData: { title: 'Project Resource', description: '', matrix: 'PROJECT_RESOURCE', deadline: null } },
  { id: 'project-milestone-node', label: 'Project Milestone', category: 'project', icon: '🚩', component: ProjectMilestoneNode, color: '#3b82f6', defaultData: { title: 'Project Milestone', description: '', matrix: 'PROJECT_MILESTONE', deadline: null } },
  { id: 'project-note-node', label: 'Project Note', category: 'project', icon: '📝', component: ProjectNoteNode, color: '#3b82f6', defaultData: { title: 'Project Note', description: '', matrix: 'PROJECT_NOTE', deadline: null } },
  { id: 'project-checklist-node', label: 'Project Checklist', category: 'project', icon: '☑️', component: ProjectChecklistNode, color: '#3b82f6', defaultData: { title: 'Project Checklist', description: '[{"id":"1","text":"First item","checked":false}]', matrix: 'PROJECT_CHECKLIST', deadline: null } },
  { id: 'project-table-node', label: 'Project Table', category: 'project', icon: '📊', component: ProjectTableNode, color: '#3b82f6', defaultData: { title: 'Project Table', description: '', matrix: 'PROJECT_TABLE', deadline: null } },

  // ── Task ────────────────────────────────────────────────────────────────────
  { id: 'task-node', label: 'Task', category: 'task', icon: '✅', component: TaskNode, color: '#10b981', defaultData: { title: 'New Task', description: '', matrix: 'TASK', deadline: null } },
  { id: 'task-checklist-node', label: 'Task Checklist', category: 'task', icon: '☑️', component: TaskChecklistNode, color: '#10b981', defaultData: { title: 'Task Checklist', description: '[{"id":"1","text":"Step 1","checked":false}]', matrix: 'TASK_CHECKLIST', deadline: null } },
  { id: 'task-link-node', label: 'Task Link', category: 'task', icon: '🔗', component: TaskLinkNode, color: '#10b981', defaultData: { title: 'Task Link', description: '', matrix: 'TASK_LINK', deadline: null } },
  { id: 'task-video-node', label: 'Task Video', category: 'task', icon: '🎬', component: TaskVideoNode, color: '#10b981', defaultData: { title: 'Task Video', description: '', matrix: 'TASK_VIDEO', deadline: null } },
  { id: 'task-timer-node', label: 'Task Timer', category: 'task', icon: '⏱️', component: TaskTimerNode, color: '#10b981', defaultData: { title: 'Task Timer', description: '25', matrix: 'TASK_TIMER', deadline: null } },
  { id: 'task-code-node', label: 'Task Code', category: 'task', icon: '💻', component: TaskCodeNode, color: '#10b981', defaultData: { title: 'Task Code', description: '', matrix: 'TASK_CODE', deadline: null } },
  { id: 'task-note-node', label: 'Task Note', category: 'task', icon: '📝', component: TaskNoteNode, color: '#10b981', defaultData: { title: 'Task Note', description: '', matrix: 'TASK_NOTE', deadline: null } },

  // ── Event ───────────────────────────────────────────────────────────────────
  { id: 'event-node', label: 'Event', category: 'event', icon: '📅', component: EventNode, color: '#f59e0b', defaultData: { title: 'New Event', description: '', matrix: 'EVENT', deadline: null } },
  { id: 'event-note-node', label: 'Event Note', category: 'event', icon: '📝', component: EventNoteNode, color: '#f59e0b', defaultData: { title: 'Event Note', description: '', matrix: 'EVENT_NOTE', deadline: null } },
  { id: 'event-checklist-node', label: 'Event Checklist', category: 'event', icon: '☑️', component: EventChecklistNode, color: '#f59e0b', defaultData: { title: 'Event Checklist', description: '[{"id":"1","text":"Agenda item","checked":false}]', matrix: 'EVENT_CHECKLIST', deadline: null } },
  { id: 'event-table-node', label: 'Event Agenda Table', category: 'event', icon: '📊', component: EventTableNode, color: '#f59e0b', defaultData: { title: 'Event Agenda', description: '', matrix: 'EVENT_TABLE', deadline: null } },
  { id: 'event-video-node', label: 'Event Meeting Video', category: 'event', icon: '🎬', component: EventVideoNode, color: '#f59e0b', defaultData: { title: 'Event Video', description: '', matrix: 'EVENT_VIDEO', deadline: null } },
  { id: 'event-link-node', label: 'Event Link', category: 'event', icon: '🔗', component: EventLinkNode, color: '#f59e0b', defaultData: { title: 'Event Link', description: '', matrix: 'EVENT_LINK', deadline: null } },

  // ── Milestone ────────────────────────────────────────────────────────────────
  { id: 'milestone-node', label: 'Milestone', category: 'milestone', icon: '🚩', component: MilestoneNode, color: '#ef4444', defaultData: { title: 'New Milestone', description: '', matrix: 'MILESTONE', deadline: null } },
  { id: 'milestone-evidence-node', label: 'Milestone Evidence', category: 'milestone', icon: '📋', component: MilestoneEvidenceNode, color: '#ef4444', defaultData: { title: 'Evidence', description: '', matrix: 'MILESTONE_EVIDENCE', deadline: null } },
  { id: 'milestone-note-node', label: 'Milestone Note', category: 'milestone', icon: '📝', component: MilestoneNoteNode, color: '#ef4444', defaultData: { title: 'Milestone Note', description: '', matrix: 'MILESTONE_NOTE', deadline: null } },
  { id: 'milestone-attachment-node', label: 'Milestone Attachment', category: 'milestone', icon: '📎', component: MilestoneAttachmentNode, color: '#ef4444', defaultData: { title: 'Attachment', description: '', matrix: 'MILESTONE_ATTACHMENT', deadline: null } },

  // ── Habit ────────────────────────────────────────────────────────────────────
  { id: 'habit-node', label: 'Habit', category: 'habit', icon: '🔥', component: HabitNode, color: '#ec4899', defaultData: { title: 'New Habit', description: '', matrix: 'HABIT', deadline: null } },
  { id: 'habit-timer-node', label: 'Habit Timer', category: 'habit', icon: '⏱️', component: HabitTimerNode, color: '#ec4899', defaultData: { title: 'Habit Timer', description: '25', matrix: 'HABIT_TIMER', deadline: null } },
  { id: 'habit-table-node', label: 'Habit Tracking Table', category: 'habit', icon: '📊', component: HabitTableNode, color: '#ec4899', defaultData: { title: 'Tracking Table', description: '', matrix: 'HABIT_TABLE', deadline: null } },
  { id: 'habit-calendar-node', label: 'Habit Schedule Calendar', category: 'habit', icon: '📅', component: HabitCalendarNode, color: '#ec4899', defaultData: { title: 'Habit Calendar', description: '', matrix: 'HABIT_CALENDAR', deadline: null } },
  { id: 'habit-note-node', label: 'Habit Note', category: 'habit', icon: '📝', component: HabitNoteNode, color: '#ec4899', defaultData: { title: 'Habit Note', description: '', matrix: 'HABIT_NOTE', deadline: null } },

  // ── Resource ─────────────────────────────────────────────────────────────────
  { id: 'resource-node', label: 'Resource', category: 'resource', icon: '📚', component: ResourceNode, color: '#06b6d4', defaultData: { title: 'New Resource', description: '', matrix: 'RESOURCE', deadline: null } },
  { id: 'resource-video-node', label: 'Resource Video', category: 'resource', icon: '🎬', component: ResourceVideoNode, color: '#06b6d4', defaultData: { title: 'Resource Video', description: '', matrix: 'RESOURCE_VIDEO', deadline: null } },
  { id: 'resource-link-node', label: 'Resource Link', category: 'resource', icon: '🔗', component: ResourceLinkNode, color: '#06b6d4', defaultData: { title: 'Resource Link', description: '', matrix: 'RESOURCE_LINK', deadline: null } },
  { id: 'resource-note-node', label: 'Resource Note', category: 'resource', icon: '📝', component: ResourceNoteNode, color: '#06b6d4', defaultData: { title: 'Resource Note', description: '', matrix: 'RESOURCE_NOTE', deadline: null } },
  { id: 'resource-image-node', label: 'Resource Image', category: 'resource', icon: '🖼️', component: ResourceImageNode, color: '#06b6d4', defaultData: { title: 'Resource Image', description: '', matrix: 'RESOURCE_IMAGE', deadline: null } },
  { id: 'resource-pdf-node', label: 'Resource PDF', category: 'resource', icon: '📄', component: ResourcePdfNode, color: '#06b6d4', defaultData: { title: 'Resource PDF', description: '', matrix: 'RESOURCE_PDF', deadline: null } },

  { id: 'resource-youtube-transcribe-node', label: 'YouTube Transcribe', category: 'resource', icon: '📝', component: YoutubeTranscribeNode, color: '#06b6d4', defaultData: { title: 'YouTube Transcript', description: '', matrix: 'RESOURCE_YOUTUBE_TRANSCRIBE', deadline: null } },
  { id: 'resource-output-node', label: 'Output Viewer', category: 'resource', icon: '🖥️', component: OutputNode, color: '#d946ef', defaultData: { title: 'Output Viewer', description: '', matrix: 'RESOURCE_OUTPUT', deadline: null } },
  { id: 'resource-roadmap-maker-node', label: 'Roadmap Maker', category: 'resource', icon: '🛤️', component: RoadmapMakerNode, color: '#8b5cf6', defaultData: { title: 'Roadmap Maker', description: '', matrix: 'RESOURCE_ROADMAP_MAKER', deadline: null } },
  { id: 'resource-canvas-node', label: 'Nested Canvas', category: 'resource', icon: '🎨', component: CanvasNode, color: '#f59e0b', defaultData: { title: 'Nested Canvas', description: '', matrix: 'RESOURCE_CANVAS', deadline: null } },
  { id: 'resource-youtube-api-node', label: 'YouTube API (Pro)', category: 'resource', icon: '📺', component: YoutubeApiNode, color: '#f43f5e', defaultData: { title: 'YouTube Pro', description: '', matrix: 'RESOURCE_YOUTUBE_API', deadline: null } },

  // ── Note ─────────────────────────────────────────────────────────────────────
  { id: 'note-node', label: 'Note', category: 'note', icon: '📝', component: NoteNode, color: '#64748b', defaultData: { title: 'Note', description: '', matrix: 'NOTE_NODE', deadline: null } },
  { id: 'note-image-node', label: 'Note Image', category: 'note', icon: '🖼️', component: NoteImageNode, color: '#64748b', defaultData: { title: 'Note Image', description: '', matrix: 'NOTE_IMAGE', deadline: null } },
  { id: 'note-code-node', label: 'Note Code', category: 'note', icon: '💻', component: NoteCodeNode, color: '#64748b', defaultData: { title: 'Note Code', description: '', matrix: 'NOTE_CODE', deadline: null } },
  { id: 'note-mermaid-node', label: 'Note Mermaid', category: 'note', icon: '🕸️', component: NoteMermaidNode, color: '#06b6d4', defaultData: { title: 'Note Mermaid', description: 'graph TD\n  A-->B;', matrix: 'NOTE_MERMAID', deadline: null } },
  { id: 'note-formula-node', label: 'Note Formula', category: 'note', icon: '∑', component: NoteFormulaNode, color: '#3b82f6', defaultData: { title: 'Note Formula', description: 'Budget = 5000\nSpend = 1200\nBudget - Spend', matrix: 'NOTE_FORMULA', deadline: null } },
  { id: 'note-table-node', label: 'Note Table', category: 'note', icon: '📊', component: NoteTableNode, color: '#10b981', defaultData: { title: 'Note Table', description: '', matrix: 'NOTE_TABLE', deadline: null } },
  { id: 'note-link-node', label: 'Note Link', category: 'note', icon: '🔗', component: NoteLinkNode, color: '#3b82f6', defaultData: { title: 'Note Link', description: '', matrix: 'NOTE_LINK', deadline: null } },
];
