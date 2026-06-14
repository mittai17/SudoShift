// AI Dump Workflow Architect - Client Service

export interface AiPhase {
  title: string;
  node: string;
  purpose: string;
  instructions: string;
}

export interface AiDumpResponse {
  goal: string;
  phases: AiPhase[];
  connections: string[];
  expectedOutcome: string;
}

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

  // Handle raw text fallback
  if (data.result?.raw) {
    throw new Error('AI returned unstructured response. Please try again.');
  }

  return data.result as AiDumpResponse;
}
