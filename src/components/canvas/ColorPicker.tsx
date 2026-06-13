import React, { useState, useRef, useEffect } from 'react';
import { Pipette } from 'lucide-react';

const PALETTE = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', 
  '#EF4444', '#EC4899', '#06B6D4', '#64748B',
  '#18181B', '#EAB308', '#84CC16', '#A855F7'
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [hex, setHex] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHex(newHex);
    if (/^#[0-9A-Fa-f]{6}$/i.test(newHex)) {
      onChange(newHex);
    }
  };

  return (
    <div ref={popoverRef} className="absolute z-50 mt-2 p-3 bg-[#13141c] border border-[#2a2b36] rounded-xl shadow-2xl flex flex-col space-y-3 w-48 nodrag cursor-default" onClick={e => e.stopPropagation()}>
      <div className="grid grid-cols-4 gap-2">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => { setHex(c); onChange(c); }}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
            style={{ 
              backgroundColor: c, 
              borderColor: color.toLowerCase() === c.toLowerCase() ? '#ffffff' : 'transparent',
              boxShadow: color.toLowerCase() === c.toLowerCase() ? `0 0 0 1px ${c}, 0 4px 12px ${c}60` : 'none'
            }}
          />
        ))}
      </div>
      
      <div className="h-px w-full bg-[#2a2b36]" />
      
      <div className="flex items-center space-x-2 bg-[#1a1b23] border border-[#2a2b36] rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition-colors">
        <Pipette className="w-3.5 h-3.5 text-gray-500" />
        <input 
          type="text" 
          value={hex} 
          onChange={handleHexChange}
          placeholder="#HEX"
          className="bg-transparent w-full text-xs text-gray-300 focus:outline-none uppercase"
        />
        <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/i.test(hex) ? hex : 'transparent' }} />
      </div>
    </div>
  );
}
