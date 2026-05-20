import React from 'react';
import { cn } from '../lib/utils';
import { InstrumentType, Note } from '../lib/music';

interface PianoKeyboardProps {
  rootNote: string;
  notes: string[];
  playingNoteIndex?: number | null;
  pitchIndices?: number[];
  onSelectPitch?: (pitchIdx: number) => void;
  isComposerMode?: boolean;
}

const KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

const normalize = (n: string) => {
  if (n === 'Db') return 'C#';
  if (n === 'Eb') return 'D#';
  if (n === 'Gb') return 'F#';
  if (n === 'Ab') return 'G#';
  if (n === 'Bb') return 'A#';
  return n;
};

export function PianoKeyboard({ rootNote, notes, playingNoteIndex, pitchIndices, onSelectPitch, isComposerMode }: PianoKeyboardProps) {
  const normalizedNotes = notes.map(normalize);
  const normalizedRoot = normalize(rootNote);

  // We have 2 octaves mostly. Lilypond pitches 20 is C3.
  const startOctave = 3;
  const numOctaves = 2; // C3 to B4

  let activePitchIndex = -1;
  if (playingNoteIndex !== null && playingNoteIndex !== undefined && pitchIndices && pitchIndices[playingNoteIndex] !== undefined) {
    activePitchIndex = pitchIndices[playingNoteIndex];
  }

  const whiteKeys = [0, 2, 4, 5, 7, 9, 11];
  
  const keys = [];
  for (let oct = 0; oct < numOctaves; oct++) {
    const startPitchIdx = 20 + oct * 12; // C3 is 20
    for (let i = 0; i < 12; i++) {
      const isWhite = whiteKeys.includes(i);
      const noteName = KEYS[i];
      const pitchIdx = startPitchIdx + i;
      
      const isRoot = normalize(noteName) === normalizedRoot;
      const inScale = normalizedNotes.includes(normalize(noteName));
      const isActive = pitchIdx === activePitchIndex;

      keys.push({
        isWhite,
        noteName,
        pitchIdx,
        isRoot,
        inScale,
        isActive
      });
    }
  }

  return (
    <div className="overflow-x-auto custom-scrollbar mt-6 w-full rounded-lg shadow-2xl bg-[#0F0F11] border border-white/5 py-4">
      <div className="relative flex min-w-max h-48 select-none mx-auto overflow-hidden bg-black rounded-lg border-2 border-white/5 mx-4">
        {keys.filter(k => k.isWhite).map((key, i) => (
          <div
            key={`white-${i}`}
            onClick={() => {
              if (isComposerMode && onSelectPitch) {
                onSelectPitch(key.pitchIdx);
              }
            }}
            className={cn(
               "relative border border-gray-400 bg-white rounded-b-md flex flex-col justify-end pb-2 items-center text-xs font-medium z-10 transition-colors",
               isComposerMode ? "cursor-pointer hover:bg-amber-50" : "cursor-default",
               "w-12 h-full",
               key.isActive ? "!bg-red-500 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.3)]" : 
                 (key.isRoot ? "bg-amber-100 shadow-[inset_0_-5px_10px_rgba(245,158,11,0.2)]" : 
                   (key.inScale ? "bg-white shadow-[inset_0_-5px_5px_rgba(0,0,0,0.1)]" : "bg-gray-100 opacity-90"))
            )}
          >
             {key.isActive && <div className="absolute top-1/2 w-4 h-4 bg-red-600 rounded-full blur-sm" />}
             {key.isRoot && <div className="w-2 h-2 mb-1 rounded-full bg-amber-500" />}
             {key.inScale ? <span className={key.isActive ? 'text-white font-bold' : (key.isRoot ? 'text-amber-700 font-bold' : 'text-gray-800')}>{key.noteName}</span> : null}
          </div>
        ))}
        {keys.map((key, i) => {
          if (key.isWhite) return null;
          
          // Calculate arbitrary left offset based on white keys before it
          const whiteCount = keys.slice(0, i).filter(k => k.isWhite).length;
          
          return (
            <div
              key={`black-${i}`}
              onClick={() => {
                if (isComposerMode && onSelectPitch) {
                  onSelectPitch(key.pitchIdx);
                }
              }}
              className={cn(
                 "absolute border border-black rounded-b-md flex flex-col justify-end pb-2 items-center text-[10px] font-medium z-20 transition-colors",
                 isComposerMode ? "cursor-pointer hover:opacity-80" : "cursor-default",
                 "w-8 h-32",
                 key.isActive ? "bg-red-500 shadow-[inset_0_-5px_15px_rgba(0,0,0,0.4)]" :
                   (key.isRoot ? "bg-amber-600 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.5)]" :
                     (key.inScale ? "bg-gray-800 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.5)]" : "bg-black opacity-90"))
              )}
              style={{
                left: `calc(${whiteCount * 3}rem - 1rem)` // 3rem is w-12, 1rem is offset
              }}
            >
               {key.isActive && <div className="absolute top-1/2 w-3 h-3 bg-red-400 rounded-full blur-sm" />}
               {key.isRoot && <div className="w-1.5 h-1.5 mb-1 rounded-full bg-amber-400" />}
               {key.inScale ? <span className={key.isActive ? 'text-white font-bold' : (key.isRoot ? 'text-amber-100 font-bold' : 'text-gray-300')}>{key.noteName}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
