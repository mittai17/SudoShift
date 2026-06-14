// AI Workflow Architect - Client Service (upgraded: multi-turn, canvas ops)

export interface AiPhase {
  title: string;
  node: string;
  purpose: string;
  instructions: string;
}

export interface CanvasOp {
  op: 'addNode' | 'addEdge' | 'updateNode' | 'deleteNode';
  type?: string;
  title?: string;
  description?: string;
  x?: number;
  y?: number;
  from?: number; // index into newly created nodes
  to?: number;   // index into newly created nodes
  nodeId?: string;
  updates?: Record<string, any>;
}

export interface AiDumpResponse {
  goal: string;
  phases: AiPhase[];
  connections: string[];
  expectedOutcome: string;
}

export interface AiChatResponse {
  reply: string;
  canvasOps?: CanvasOp[];
  workflow?: AiDumpResponse;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  canvasOps?: CanvasOp[];
  workflow?: AiDumpResponse;
}

export async function sendAiMessage(
  message: string,
  history: ChatMessage[],
  canvasContext?: { nodeCount: number; nodeTypes: string[] }
): Promise<AiChatResponse> {
  const res = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      canvasContext,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Failed to get AI response');
  }

  const data = await res.json();
  return data as AiChatResponse;
}

// Legacy function kept for backward compat
export async function fetchAiDumpWorkflow(prompt: string): Promise<AiDumpResponse> {
  const res = await fetch('/api/ai-dump', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Failed to generate workflow');
  }

  const data = await res.json();
  if (data.result?.raw) throw new Error('AI returned unstructured response. Please try again.');
  return data.result as AiDumpResponse;
}
