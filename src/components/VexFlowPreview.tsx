import React, { useEffect, useRef } from 'react';
import { Stave, StaveNote, Formatter, Renderer, Accidental, TabStave, TabNote, Voice } from 'vexflow';
import { InstrumentType, ScaleResult, getPitchStr } from '../lib/music';

interface VexFlowPreviewProps {
  pitchIndices: number[];
  scaleResult?: ScaleResult;
  instrument?: InstrumentType;
}

export function VexFlowPreview({ pitchIndices, scaleResult, instrument = 'bass4', playingNoteIndex = null }: VexFlowPreviewProps & { playingNoteIndex?: number | null }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const width = Math.max(300, pitchIndices.length * 50 + 100);
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    renderer.resize(width, 240);
    const context = renderer.getContext();
    context.scale(0.85, 0.85);

    const isBass = instrument === 'bass4';
    const isPiano = instrument === 'piano';

    const stave = new Stave(10, 10, width - 20);
    stave.addClef(isPiano ? "treble" : (isBass ? "bass" : "treble")).addTimeSignature("4/4");
    stave.setContext(context).draw();

    let tabstave: TabStave | null = null;
    if (!isPiano) {
      tabstave = new TabStave(10, 100, width - 20);
      tabstave.addTabGlyph().setContext(context).draw();
      if (!isBass) {
        tabstave.setNumLines(6);
      }
    }

    const notes: StaveNote[] = [];
    const tabNotes: TabNote[] = [];

    const bassBounds = [{ idx: 15, str: 1 }, { idx: 10, str: 2 }, { idx: 5, str: 3 }, { idx: 0, str: 4 }];
    const guitarBounds = [
      { idx: 36, str: 1 }, // E4
      { idx: 31, str: 2 }, // B3
      { idx: 27, str: 3 }, // G3
      { idx: 22, str: 4 }, // D3
      { idx: 17, str: 5 }, // A2
      { idx: 12, str: 6 }  // E2
    ];

    const bounds = isBass ? bassBounds : guitarBounds;

    pitchIndices.forEach((p, idx) => {
      let rawNoteName = '';
      if (scaleResult && scaleResult.notes[idx]) {
        rawNoteName = scaleResult.notes[idx].toLowerCase();
      } else {
        rawNoteName = getPitchStr(p, false).note.toLowerCase();
      }

      const octaveNum = Math.floor((p + 4) / 12) + 2; 
      const pitchStr = `${rawNoteName}/${octaveNum}`;
      
      let str = 1;
      let fret = 0;
      
      if (!isPiano) {
        for (const bound of bounds) {
          if (p >= bound.idx) {
            str = bound.str;
            fret = p - bound.idx;
            break;
          }
        }
      }

      const clef = isPiano ? "treble" : (isBass ? "bass" : "treble");
      const staveNote = new StaveNote({ clef, keys: [pitchStr], duration: "q", autoStem: true });
      if (rawNoteName.length > 1) {
        if (rawNoteName.includes("##")) {
          staveNote.addModifier(new Accidental("##"), 0);
        } else if (rawNoteName.includes("#")) {
          staveNote.addModifier(new Accidental("#"), 0);
        } else if (rawNoteName.includes("bb")) {
          staveNote.addModifier(new Accidental("bb"), 0);
        } else if (rawNoteName.includes("b")) {
          staveNote.addModifier(new Accidental("b"), 0);
        }
      }
      
      let tabNote = null;
      if (!isPiano) {
        tabNote = new TabNote({
          positions: [{ str: str, fret: fret }],
          duration: "q",
        });
      }

      if (playingNoteIndex === idx) {
        staveNote.setStyle({ fillStyle: '#f59e0b', strokeStyle: '#f59e0b' });
        if (tabNote) tabNote.setStyle({ fillStyle: '#f59e0b', strokeStyle: '#f59e0b' });
      }

      notes.push(staveNote);
      if (tabNote) tabNotes.push(tabNote);
    });

    if (notes.length > 0) {
      const voice = new Voice({ numBeats: notes.length, beatValue: 4 });
      voice.setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);
      
      let tabVoice: Voice | null = null;
      if (!isPiano) {
        tabVoice = new Voice({ numBeats: tabNotes.length, beatValue: 4 });
        tabVoice.setMode(Voice.Mode.SOFT);
        tabVoice.addTickables(tabNotes);
        new Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice, tabVoice], width - 80);
      } else {
        new Formatter().joinVoices([voice]).format([voice], width - 80);
      }
      
      voice.draw(context, stave);
      if (tabVoice && tabstave) {
        tabVoice.draw(context, tabstave);
      }
    }
  }, [pitchIndices, instrument, playingNoteIndex, scaleResult]);

  return (
    <div className="overflow-x-auto bg-[#E5E6E8] rounded p-4 flex justify-center">
      <div ref={containerRef} className="opacity-90" />
    </div>
  );
}
