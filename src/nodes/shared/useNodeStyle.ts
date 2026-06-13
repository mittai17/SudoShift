import { useCallback } from 'react';
import { useReactFlow, useNodeId } from '@xyflow/react';
import { NodeStyle, TaskData } from '../../types';

export function useNodeStyle(defaultColor: string) {
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();

  const updateStyle = useCallback((updates: Partial<NodeStyle>) => {
    if (!nodeId) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const task = n.data.task as TaskData;
          return {
            ...n,
            data: {
              ...n.data,
              task: {
                ...task,
                nodeStyle: {
                  ...task.nodeStyle,
                  ...updates,
                },
              },
            },
          };
        }
        return n;
      })
    );
  }, [nodeId, setNodes]);

  return { updateStyle };
}
