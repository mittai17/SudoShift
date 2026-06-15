import React, { useRef, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Palette, Eraser, Trash2 } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function WhiteboardNode({ data }: { data: NodeData }) {
  const { task, onChange } = data;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [color, setColor] = useState('#111827');
  const [brushSize, setBrushSize] = useState(3);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (task.description && task.description.startsWith('data:image')) {
            const img = new Image();
            img.src = task.description;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            }
        } else {
             // Fill with white initially to avoid transparent backgrounds
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, []);

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas && onChange) {
      onChange(task.id, canvas.toDataURL());
    }
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    
    if (mode === 'erase') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = brushSize * 8;
    } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
    }
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
        setIsDrawing(false);
        saveDrawing();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              saveDrawing();
          }
      }
  }

  return (
    <NodeWrapper>
      <div className="flex flex-col rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36]  transition-shadow hover:shadow-lg nodrag">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#a855f7] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white justify-between">
        <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full">
            <Palette className="w-4 h-4 opacity-80 pointer-events-none" />
            <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate select-none pointer-events-none">
            Whiteboard
            </h3>
        </div>
      </div>
      
      <div className="p-2 bg-[#1a1b23] flex flex-col items-center space-y-2 select-none">
          <div className="flex w-full items-center justify-between px-1 bg-[#13141c] border border-[#2a2b36] rounded p-1">
              <div className="flex space-x-1">
                 <button onClick={() => setMode('draw')} className={`p-1.5 rounded-md transition-colors ${mode === 'draw' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-400 hover:bg-gray-100'}`} title="Draw">
                     <Palette className="w-4 h-4" />
                 </button>
                 <button onClick={() => setMode('erase')} className={`p-1.5 rounded-md transition-colors ${mode === 'erase' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-400 hover:bg-gray-100'}`} title="Eraser">
                     <Eraser className="w-4 h-4" />
                 </button>
                 <button onClick={clearCanvas} className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Clear Canvas">
                     <Trash2 className="w-4 h-4" />
                 </button>
              </div>
              <div className="flex items-center space-x-3">
                  <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  {mode === 'draw' && (
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0" />
                  )}
              </div>
          </div>
        
        <div className="border border-[#3f3f46] bg-[#13141c] shadow-inner rounded-md  relative" style={{ touchAction: 'none' }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className="touch-none cursor-crosshair bg-[#13141c]"
            />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#a855f7] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
