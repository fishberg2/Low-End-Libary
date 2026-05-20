import React from 'react';
import { Note, InstrumentType } from '../lib/music';
import { cn } from '../lib/utils';

interface FretboardProps {
  rootNote: Note;
  notes: string[]; // e.g., ["C", "D", "E", "F", "G", "A", "B"]
  onSelectRoot?: (note: Note) => void;
  instrument?: InstrumentType;
  playingNoteIndex?: number | null;
  pitchIndices?: number[];
  onSelectPitch?: (pitchIdx: number) => void;
  isComposerMode?: boolean;
}

// All notes starting from E (standard E tuning bottom string)
const CHROMATIC = ['E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb'];

// Normalize flats to sharps for comparison if needed, though we can just check string inclusion
const normalize = (n: string) => {
  if (n === 'Db') return 'C#';
  if (n === 'Gb') return 'F#';
  return n;
};

const BASS_STRING_OFFSETS = [3, 10, 5, 0]; // G, D, A, E
const GUITAR_STRING_OFFSETS = [0, 7, 3, 10, 5, 0]; // E, B, G, D, A, E

const BASS_STRING_LABELS = ['G', 'D', 'A', 'E'];
const GUITAR_STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];

const NUM_FRETS = 12;

interface FretNoteInfo {
  strIdx: number; 
  fret: number;   // 0 to 12
  noteLabel: string;
  isRoot: boolean;
  inScale: boolean;
  displayLabel: string;
  isActive: boolean;
  pitchIdx: number;
}

export function Fretboard({ rootNote, notes, onSelectRoot, instrument = 'bass4', playingNoteIndex = null, pitchIndices = [], onSelectPitch, isComposerMode }: FretboardProps) {
  // Normalize the input notes for matching
  const normalizedNotes = notes.map(normalize);
  const normalizedRoot = normalize(rootNote);

  const dots: FretNoteInfo[] = [];

  const isBass = instrument === 'bass4';
  const stringOffsets = isBass ? BASS_STRING_OFFSETS : GUITAR_STRING_OFFSETS;
  const stringLabels = isBass ? BASS_STRING_LABELS : GUITAR_STRING_LABELS;
  const numStrings = stringOffsets.length;

  let activeStrIdx = -1;
  let activeFret = -1;

  const bassBounds = [{ idx: 15, strIdx: 0 }, { idx: 10, strIdx: 1 }, { idx: 5, strIdx: 2 }, { idx: 0, strIdx: 3 }];
  const guitarBounds = [
    { idx: 36, strIdx: 0 }, 
    { idx: 31, strIdx: 1 }, 
    { idx: 27, strIdx: 2 }, 
    { idx: 22, strIdx: 3 }, 
    { idx: 17, strIdx: 4 }, 
    { idx: 12, strIdx: 5 }
  ];
  const bounds = isBass ? bassBounds : guitarBounds;

  if (playingNoteIndex !== null && playingNoteIndex !== undefined && pitchIndices[playingNoteIndex] !== undefined) {
    const p = pitchIndices[playingNoteIndex];
    for (const bound of bounds) {
      if (p >= bound.idx) {
        activeStrIdx = bound.strIdx;
        activeFret = p - bound.idx;
        break;
      }
    }
  }

  for (let strIdx = 0; strIdx < numStrings; strIdx++) {
    const stringOffset = stringOffsets[strIdx];
    const bound = bounds.find(b => b.strIdx === strIdx);
    for (let fret = 0; fret <= NUM_FRETS; fret++) {
      const chromaticIndex = (stringOffset + fret) % 12;
      const noteHere1 = CHROMATIC[chromaticIndex];
      
      const matchedUserNote = notes.find(n => normalize(n) === normalize(noteHere1));
      const pitchIdx = bound ? bound.idx + fret : 0;

      dots.push({
        strIdx,
        fret,
        noteLabel: noteHere1,
        isRoot: matchedUserNote ? normalize(matchedUserNote) === normalizedRoot : false,
        inScale: !!matchedUserNote,
        displayLabel: matchedUserNote || noteHere1,
        isActive: strIdx === activeStrIdx && fret === activeFret,
        pitchIdx
      });
    }
  }

  // Visual layout parameters
  // Assuming 12 frets. 
  // Fret 0 is at left 0%. 
  const getFretCenterPercent = (fret: number) => {
    if (fret === 0) return -2; // Slightly to the left of the nut
    return ((fret - 0.5) / NUM_FRETS) * 100;
  };

  return (
    <div className="overflow-x-auto custom-scrollbar mt-6 w-full rounded-lg shadow-2xl bg-[#1A1A1D] border border-white/5">
      <div className="flex relative min-w-[800px] max-w-full">
        {/* Nut / Tuning area */}
        <div className="sticky left-0 w-8 bg-[#2A2A2E] shadow-[2px_0_10px_rgba(0,0,0,0.8)] flex flex-col justify-between py-8 px-1 z-40 border-r border-[#161618]">
          {stringLabels.map((lbl, idx) => (
            <div key={idx} className="text-[10px] text-gray-400 font-bold ml-1">{lbl}</div>
          ))}
        </div>

        <div className="flex-1 h-32 relative my-8 mr-6">
        {/* Vertical Frets */}
        <div className="absolute inset-0 flex flex-row">
          {Array.from({ length: NUM_FRETS }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-[#3A3A3F] shadow-[1px_0_1px_rgba(0,0,0,0.5)]" 
            />
          ))}
        </div>

        {/* Fret Markers (Dots) */}
        {/* Frets 3, 5, 7, 9 get single dots. Fret 12 gets double. */}
        {[3, 5, 7, 9].map(fret => (
           <div 
            key={fret} 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 pointer-events-none"
            style={{ left: `${getFretCenterPercent(fret)}%`, marginLeft: '-8px' }}
          />
        ))}
        {/* Fret 12 double dots */}
        <div className="absolute top-1/4 w-4 h-4 rounded-full bg-white/10 pointer-events-none" style={{ left: `${getFretCenterPercent(12)}%`, marginLeft: '-8px' }} />
        <div className="absolute top-3/4 w-4 h-4 rounded-full bg-white/10 pointer-events-none" style={{ left: `${getFretCenterPercent(12)}%`, marginLeft: '-8px' }} />


        {/* Strings */}
        <div className="w-full flex flex-col justify-between relative z-10 py-[1.5px] pointer-events-none">
          {Array.from({ length: numStrings }).map((_, i) => (
            <div key={i} className="h-[1.5px] w-full bg-gray-400 opacity-60 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" style={{ height: `${1 + (i * 0.5)}px` }}></div>
          ))}
        </div>

        {/* Note Overlays */}
        {dots.map((dot, i) => {
          const topPercent = (dot.strIdx / (numStrings - 1)) * 100;
          const leftPercent = getFretCenterPercent(dot.fret);
          
          if (!dot.inScale) {
            return (
              <div
                key={i}
                onClick={() => {
                  if (isComposerMode && onSelectPitch) {
                    onSelectPitch(dot.pitchIdx);
                  } else {
                    onSelectRoot?.(dot.noteLabel as Note);
                  }
                }}
                className={cn("absolute w-5 h-5 md:w-6 md:h-6 -ml-2.5 -mt-2.5 md:-ml-3 md:-mt-3 rounded-full flex items-center justify-center text-[9px] md:text-[10px] z-30 transition-all",
                  isComposerMode ? "opacity-0 hover:opacity-100 hover:bg-amber-500/50 border border-transparent hover:border-amber-500/70 text-amber-50 cursor-pointer" : "opacity-0 hover:opacity-100 hover:bg-white/10 border border-transparent hover:border-white/20 text-white cursor-pointer"
                )}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              >
                {dot.displayLabel}
              </div>
            );
          }

          return (
            <div
              key={i}
              onClick={() => {
                if (isComposerMode && onSelectPitch) {
                  onSelectPitch(dot.pitchIdx);
                } else {
                  onSelectRoot?.(dot.noteLabel as Note);
                }
              }}
              className={cn(
                "absolute w-5 h-5 md:w-6 md:h-6 -ml-2.5 -mt-2.5 md:-ml-3 md:-mt-3 rounded-full flex items-center justify-center text-[9px] md:text-[10px] z-30 transition-transform duration-300 cursor-pointer",
                dot.isActive 
                  ? "bg-red-500 border-2 border-red-300 text-white font-extrabold scale-125 shadow-lg shadow-red-500/50 z-40" 
                  : dot.isRoot 
                    ? "bg-amber-500 border-2 border-black text-black font-extrabold scale-110 shadow-lg shadow-amber-500/20" 
                    : "bg-white/20 border border-white/40 text-white font-medium hover:bg-white/40"
              )}
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
              }}
            >
              {dot.displayLabel}
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
