import React, { useState, useEffect, useRef } from 'react';
import { InstrumentType } from '../lib/music';
import { cn } from '../lib/utils';
import { Plus } from 'lucide-react';

interface InteractiveTabEditorProps {
  pitchIndices: number[];
  onChange: (pitches: number[]) => void;
  instrument: InstrumentType;
  playingNoteIndex?: number | null;
}

export function InteractiveTabEditor({ pitchIndices, onChange, instrument, playingNoteIndex }: InteractiveTabEditorProps) {
  const [editing, setEditing] = useState<{ col: number, str: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (instrument === 'piano') return null;

  const isBass = instrument === 'bass4';
  const numStrings = isBass ? 4 : 6;
  const stringNames = isBass ? ['G', 'D', 'A', 'E'] : ['e', 'B', 'G', 'D', 'A', 'E'];

  const bassBounds = [{ idx: 15, str: 0 }, { idx: 10, str: 1 }, { idx: 5, str: 2 }, { idx: 0, str: 3 }];
  const guitarBounds = [
    { idx: 36, str: 0 }, 
    { idx: 31, str: 1 }, 
    { idx: 27, str: 2 }, 
    { idx: 22, str: 3 }, 
    { idx: 17, str: 4 }, 
    { idx: 12, str: 5 }  
  ];
  const bounds = isBass ? bassBounds : guitarBounds;

  const sequenceData = pitchIndices.map(p => {
    let s = numStrings - 1;
    let f = 0;
    for (const bound of bounds) {
      if (p >= bound.idx) {
        s = bound.str;
        f = p - bound.idx;
        break;
      }
    }
    return { str: s, fret: f, pitch: p };
  });

  const handleUpdate = (fretStr: string) => {
    if (!editing) return;
    const fret = parseInt(fretStr, 10);
    if (!isNaN(fret) && fret >= 0 && fret <= 24) {
      const newPitch = bounds.find(b => b.str === editing.str)!.idx + fret;
      const newPitches = [...pitchIndices];
      if (editing.col === newPitches.length) {
        newPitches.push(newPitch);
      } else {
        newPitches[editing.col] = newPitch;
      }
      onChange(newPitches);
    } else if (fretStr.trim() === '') {
      if (editing.col < pitchIndices.length) {
        const newPitches = [...pitchIndices];
        newPitches.splice(editing.col, 1);
        onChange(newPitches);
      }
    }
    setEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdate(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  const cols = pitchIndices.length + 1; // Include one empty column to add

  return (
    <div className="bg-[#1C1C1F] rounded-lg p-4 overflow-x-auto border border-white/5">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Interactive Tablature</h3>
      <div className="flex font-mono text-sm min-w-max">
        {/* String Labels */}
        <div className="flex flex-col border-r border-gray-700 pr-2 mr-2">
          {stringNames.map((name, i) => (
            <div key={i} className="h-8 flex items-center justify-center text-gray-400 font-bold w-4">
              {name}
            </div>
          ))}
        </div>

        {/* Tab Grid */}
        <div className="flex space-x-1">
          {Array.from({ length: cols }).map((_, col) => {
            const isAddNew = col === pitchIndices.length;
            const data = isAddNew ? null : sequenceData[col];
            const isPlaying = playingNoteIndex === col;

            return (
              <div key={col} className={cn("flex flex-col relative", isPlaying && "bg-amber-500/10 rounded")}>
                {Array.from({ length: numStrings }).map((_, str) => {
                  const hasNote = data && data.str === str;
                  const isEditing = editing?.col === col && editing?.str === str;

                  return (
                    <div 
                      key={str}
                      className="h-8 w-8 relative flex items-center justify-center group cursor-pointer"
                      onClick={() => setEditing({ col, str })}
                    >
                      {/* Tab Line */}
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-600 -translate-y-1/2 -z-10" />
                      
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="number"
                          min="0"
                          max="24"
                          defaultValue={hasNote ? data!.fret : ''}
                          className="w-full text-center bg-gray-800 text-amber-500 font-bold border border-amber-500 rounded outline-none h-6 appearance-none m-0"
                          onBlur={(e) => handleUpdate(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        hasNote ? (
                          <div className={cn("bg-[#1C1C1F] px-1 font-bold", isPlaying ? "text-amber-500" : "text-white")}>
                            {data.fret}
                          </div>
                        ) : (
                          <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white/5 transition-opacity">
                            <Plus className="w-3 h-3 text-gray-500" />
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
