import { Handle, Position } from '@xyflow/react';
import { format, isPast, parseISO, isValid } from 'date-fns';
import { Briefcase, AlertCircle, Play, Mail, Trash2 } from 'lucide-react';
import { NodeData } from '../types';

const getMatrixStyles = (matrix: string) => {
  switch (matrix) {
    case 'DO':
      return { main: 'bg-[#12b886]', icon: <Play className="w-4 h-4" /> };
    case 'DECIDE':
      return { main: 'bg-[#228be6]', icon: <AlertCircle className="w-4 h-4" /> };
    case 'DELEGATE':
      return { main: 'bg-[#fab005]', icon: <Mail className="w-4 h-4" /> };
    case 'DELETE':
      return { main: 'bg-[#fa5252]', icon: <Trash2 className="w-4 h-4" /> };
    default:
      return { main: 'bg-[#868e96]', icon: <Briefcase className="w-4 h-4" /> };
  }
};

export default function TaskNode({ data }: { data: NodeData }) {
  const { task } = data;
  
  // Safe date parsing to prevent app crash if AI gives invalid dates
  const parsedDate = task.deadline ? parseISO(task.deadline) : null;
  const hasValidDate = parsedDate && isValid(parsedDate);
  const isOverdue = hasValidDate && isPast(parsedDate);

  const style = getMatrixStyles(task.matrix);

  return (
    <div
      className={`flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg ${task.isConflicting ? 'ring-4 ring-red-500 ring-opacity-40 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400 border-2 border-white -ml-0.5" />
      
      {/* N8N Style Header */}
      <div className={`${style.main} px-3 py-2 flex items-center space-x-2 text-white`}>
        <div className="opacity-90">{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight tracking-tight truncate">
            {task.title}
          </h3>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 leading-none mt-0.5">
            {task.matrix}
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-white">
        {task.description && (
          <p className="text-xs text-gray-700 mb-3 line-clamp-3 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100 pt-2 mt-auto">
          {hasValidDate ? (
            <span className={`${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              {format(parsedDate, 'MMM d, yy')}
            </span>
          ) : task.deadline ? (
            <span>{task.deadline}</span>
          ) : (
            <span className="opacity-50">No deadline</span>
          )}
          
          {task.estimatedMinutes && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">{task.estimatedMinutes}m</span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className={`w-3 h-3 ${style.main} border-2 border-white -mr-0.5`} />
    </div>
  );
}
