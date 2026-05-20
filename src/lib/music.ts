export type Note = 'C' | 'C#' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export type ScaleType = 
  | 'Major' 
  | 'Natural Minor' 
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Major Pentatonic' 
  | 'Minor Pentatonic' 
  | 'Blues'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Locrian'
  | 'Custom';

export interface ScaleDefinition {
  name: ScaleType;
  intervals: number[];
  intervalNames: string[];
  description: string;
  commonUses: string;
}

export const SCALES: ScaleDefinition[] = [
  { 
    name: 'Major', 
    intervals: [2, 2, 1, 2, 2, 2, 1],
    intervalNames: ['1', '2', '3', '4', '5', '6', '7'],
    description: 'The foundation of Western music harmony, known for its bright, happy, and resolved sound. It corresponds to the Ionian mode.',
    commonUses: 'Pop, Rock, Country, and as a foundation for most classic diatonic basslines.'
  },
  { 
    name: 'Natural Minor', 
    intervals: [2, 1, 2, 2, 1, 2, 2],
    intervalNames: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    description: 'A darker, melancholy sounding scale relative to the major scale (also known as Aeolian).',
    commonUses: 'Hard Rock, Metal, R&B, and melancholic ballads.'
  },
  { 
    name: 'Harmonic Minor', 
    intervals: [2, 1, 2, 2, 1, 3, 1],
    intervalNames: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    description: 'Similar to natural minor but with a major 7th, creating a large, dramatic interval before the octave, often invoking a Middle Eastern or classical sound.',
    commonUses: 'Neo-classical metal, Jazz, Latin, and classical-inspired basslines.'
  },
  { 
    name: 'Melodic Minor', 
    intervals: [2, 1, 2, 2, 2, 2, 1],
    intervalNames: ['1', '2', 'b3', '4', '5', '6', '7'],
    description: 'A minor scale with a raised 6th and 7th (when ascending). Often used in jazz to smooth out the large leap in harmonic minor, giving it a somewhat brighter, floating minor sound.',
    commonUses: 'Jazz fusion solos, advanced Latin lines, and intricate progressive rock sections.'
  },
  { 
    name: 'Major Pentatonic', 
    intervals: [2, 2, 3, 2, 3],
    intervalNames: ['1', '2', '3', '5', '6'],
    description: 'A versatile 5-note scale that removes the tritone intervals (4 and 7) from the major scale, avoiding dissonances.',
    commonUses: 'Motown, Classic Rock, Country, R&B grooves.'
  },
  { 
    name: 'Minor Pentatonic', 
    intervals: [3, 2, 2, 3, 2],
    intervalNames: ['1', 'b3', '4', '5', 'b7'],
    description: 'A 5-note scale that skips the 2nd and 6th of the natural minor. The absolute cornerstone of modern rock and blues.',
    commonUses: 'Rock, Blues, Funk, Pop, Metal (universal rock/blues bassline building block).'
  },
  { 
    name: 'Blues', 
    intervals: [3, 2, 1, 1, 3, 2],
    intervalNames: ['1', 'b3', '4', '#4/b5', '5', 'b7'],
    description: 'Like a minor pentatonic, but adds a "blue note" (the flat 5) that creates tension, dissonance, and grit.',
    commonUses: 'Blues, Rock & Roll walking bass, Funk turnarounds.'
  },
  { 
    name: 'Dorian', 
    intervals: [2, 1, 2, 2, 2, 1, 2],
    intervalNames: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    description: 'A minor-type scale with a natural 6th. It has a slightly brighter, funkier, or more open vibe than the natural minor.',
    commonUses: 'Funk (James Brown, Tower of Power), Jazz, Jam Band styles, Celtic folk.'
  },
  { 
    name: 'Phrygian', 
    intervals: [1, 2, 2, 2, 1, 2, 2],
    intervalNames: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    description: 'A minor-type scale with a flat 2nd, known for its instantly recognizable dark, "Spanish" or Middle-Eastern flavor.',
    commonUses: 'Heavy Metal, Flamenco, progressive rock.'
  },
  { 
    name: 'Lydian', 
    intervals: [2, 2, 2, 1, 2, 2, 1],
    intervalNames: ['1', '2', '3', '#4', '5', '6', '7'],
    description: 'A major-type scale with a raised 4th. It sounds dreamy, floating, and unresolved, often used to create a sense of wonder.',
    commonUses: 'Jazz solos, cinematic themes, progressive rock.'
  },
  { 
    name: 'Mixolydian', 
    intervals: [2, 2, 1, 2, 2, 1, 2],
    intervalNames: ['1', '2', '3', '4', '5', '6', 'b7'],
    description: 'A major-type scale with a flat 7th. Crucial for blues, it forms the foundation of dominant 7th chords.',
    commonUses: 'Blues shuffles, classic rock riffs (e.g. AC/DC), jazz walking basslines.'
  },
  { 
    name: 'Locrian', 
    intervals: [1, 2, 2, 1, 2, 2, 2],
    intervalNames: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    description: 'The darkest, most dissonant mode, characterized by its flat 2nd and flat 5th. It lacks a stable perfect 5th.',
    commonUses: 'Heavy Metal riffs, Jazz applications over minor 7 flat 5 (m7b5) chords.'
  }
];

export const ROOT_NOTES: Note[] = ['E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb'];

export type InstrumentType = 'bass4' | 'guitar6' | 'piano';

function isFlatKey(root: string, type: string): boolean {
  if (root.includes('b')) return true;
  if (root === 'F') return true;
  
  const flatTypesForC = ['Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Minor Pentatonic', 'Blues', 'Dorian', 'Phrygian', 'Locrian'];
  const flatTypesForG = ['Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Minor Pentatonic', 'Blues', 'Locrian', 'Dorian', 'Phrygian'];
  const flatTypesForD = ['Natural Minor', 'Harmonic Minor', 'Minor Pentatonic', 'Blues', 'Locrian', 'Phrygian'];
  const flatTypesForA = ['Locrian', 'Phrygian'];
  const flatTypesForE = ['Locrian'];
  
  if (root === 'C' && flatTypesForC.includes(type)) return true;
  if (root === 'G' && flatTypesForG.includes(type)) return true;
  if (root === 'D' && flatTypesForD.includes(type)) return true;
  if (root === 'A' && flatTypesForA.includes(type)) return true;
  if (root === 'E' && flatTypesForE.includes(type)) return true;
  
  return false;
}

export function getPitchStr(idx: number, useFlats: boolean) {
  const noteIndex = (idx + 4) % 12; // E1 is index 0 -> 4
  const octave = Math.floor((idx + 4) / 12) + 1; // C2 starts at idx 8
  
  let noteStr = '';
  let lilyStr = '';
  switch(noteIndex) {
    case 0: noteStr = 'C'; lilyStr = 'c'; break;
    case 1: noteStr = useFlats ? 'Db' : 'C#'; lilyStr = useFlats ? 'des' : 'cis'; break;
    case 2: noteStr = 'D'; lilyStr = 'd'; break;
    case 3: noteStr = useFlats ? 'Eb' : 'D#'; lilyStr = useFlats ? 'ees' : 'dis'; break;
    case 4: noteStr = 'E'; lilyStr = 'e'; break;
    case 5: noteStr = 'F'; lilyStr = 'f'; break;
    case 6: noteStr = useFlats ? 'Gb' : 'F#'; lilyStr = useFlats ? 'ges' : 'fis'; break;
    case 7: noteStr = 'G'; lilyStr = 'g'; break;
    case 8: noteStr = useFlats ? 'Ab' : 'G#'; lilyStr = useFlats ? 'aes' : 'gis'; break;
    case 9: noteStr = 'A'; lilyStr = 'a'; break;
    case 10: noteStr = useFlats ? 'Bb' : 'A#'; lilyStr = useFlats ? 'bes' : 'ais'; break;
    case 11: noteStr = 'B'; lilyStr = 'b'; break;
  }
  
  let suffix = '';
  if (octave === 1) suffix = ',,';
  else if (octave === 2) suffix = ',';
  else if (octave === 3) suffix = '';
  else if (octave === 4) suffix = '\'';
  else if (octave === 5) suffix = '\'\'';
  else if (octave === 6) suffix = '\'\'\'';
  
  return { note: noteStr, lilypond: lilyStr + suffix };
}

const ROOT_START_INDICES: Record<Note, number> = {
  'E': 0, 'F': 1, 'F#': 2, 'G': 3, 'Ab': 4, 'A': 5, 'Bb': 6, 'B': 7,
  'C': 8, 'C#': 9, 'Db': 9, 'D': 10, 'Eb': 11
};

export interface ScaleResult {
  root: Note;
  type: ScaleType;
  notes: string[];
  lilypondNotes: string[];
  pitchIndices: number[];
  definition: ScaleDefinition;
  instrument: InstrumentType;
}

export function getSpelledNote(root: string, intervalName: string) {
  const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const basePitches = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
  
  const rootLetter = root[0];
  const rootBasePitch = basePitches[rootLetter as keyof typeof basePitches];
  let rootAccidental = 0;
  if (root.includes('#')) rootAccidental = root.length - 1;
  else if (root.includes('b')) rootAccidental = -(root.length - 1);
  const rootActualPitch = rootBasePitch + rootAccidental;
  
  const rootLetterIndex = letters.indexOf(rootLetter);
  
  const match = intervalName.match(/([b#]*)(bb)?(\d+)/);
  if (!match) return root; 
  
  const degree = parseInt(match[3], 10);
  
  const letterStep = degree - 1; 
  const targetLetterIndex = (rootLetterIndex + letterStep) % 7;
  const targetLetter = letters[targetLetterIndex];
  const targetBasePitch = basePitches[targetLetter as keyof typeof basePitches];
  
  const intervalSemitonesMap: Record<string, number> = {
    '1': 0, 'b2': 1, '2': 2, '#2': 3, 
    'b3': 3, '3': 4, 
    '4': 5, '#4': 6, 'b5': 6, 
    '5': 7, '#5': 8, 'b6': 8, 
    '6': 9, 'bb7': 9, 'b7': 10, '7': 11
  };
  
  const expectedSemitonesFromRoot = intervalSemitonesMap[intervalName] ?? 0;
  const targetActualPitch = rootActualPitch + expectedSemitonesFromRoot;
  
  const pitchDiff = targetActualPitch - targetBasePitch;
  const normalizedDiff = ((pitchDiff % 12) + 12) % 12;
  
  let accidental = normalizedDiff;
  if (accidental > 6) accidental -= 12;
  
  let result = targetLetter;
  if (accidental > 0) result += '#'.repeat(accidental);
  if (accidental < 0) result += 'b'.repeat(-accidental);
  
  return result;
}

export function getLilypondPitch(noteStr: string, pitchIndex: number) {
  const letter = noteStr[0].toLowerCase();
  let acc = '';
  if (noteStr.includes('##')) acc = 'isis';
  else if (noteStr.includes('#')) acc = 'is';
  else if (noteStr.includes('bb')) acc = 'eses';
  else if (noteStr.includes('b')) acc = 'es';
  
  const octaveNum = Math.floor((pitchIndex + 4) / 12) + 1; 
  let suffix = '';
  if (octaveNum === 1) suffix = ',,';
  else if (octaveNum === 2) suffix = ',';
  else if (octaveNum === 3) suffix = '';
  else if (octaveNum === 4) suffix = '\'';
  else if (octaveNum === 5) suffix = '\'\'';
  else if (octaveNum === 6) suffix = '\'\'\'';
  
  return letter + acc + suffix;
}

export function generateScale(root: Note, type: ScaleType, instrument: InstrumentType = 'bass4'): ScaleResult {
  const scaleDef = SCALES.find(s => s.name === type);
  if (!scaleDef) throw new Error(`Scale type ${type} not found`);

  // We can still optionally calculate useFlats if we want, but it's not strictly necessary for spelledNote!
  let currentIndex = ROOT_START_INDICES[root];
  if (instrument === 'guitar6') {
    currentIndex += 12; // Start an octave higher (E2 instead of E1)
  } else if (instrument === 'piano') {
    currentIndex += 24; // Start two octaves higher (E3 instead of E1)
  }

  const lilypondNotes: string[] = [];
  const pitchIndices: number[] = [];
  const notes: string[] = [];

  lilypondNotes.push(getLilypondPitch(root, currentIndex));
  pitchIndices.push(currentIndex);
  notes.push(root);

  for (let i = 0; i < scaleDef.intervals.length; i++) {
    const interval = scaleDef.intervals[i];
    currentIndex += interval;
    if (currentIndex <= 64) {
      // Find the interval name for THIS new note. If we ran out of names, it's the octave
      const intervalName = scaleDef.intervalNames[i + 1] || '1'; 
      const spelledNote = getSpelledNote(root, intervalName);
      
      lilypondNotes.push(getLilypondPitch(spelledNote, currentIndex));
      pitchIndices.push(currentIndex);
      notes.push(spelledNote);
    }
  }

  return { root, type, notes, lilypondNotes, pitchIndices, definition: scaleDef, instrument };
}

export function generateLilyPondCode(scale: ScaleResult): string {
  const notesStr = scale.lilypondNotes.map(n => n + '4').join(' ');
  const isBass = scale.instrument === 'bass4';
  const isPiano = scale.instrument === 'piano';
  
  let clef = 'treble_8';
  if (isBass) clef = 'bass';
  if (isPiano) clef = 'treble';

  return `\\version "2.24.0"

\\header {
  title = "${scale.root} ${scale.type} Scale"
  instrument = "${isPiano ? 'Piano' : (isBass ? 'Bass Guitar' : 'Guitar')}"
}

scaleNotes = {
  \\clef ${clef}
  \\time 4/4
  ${notesStr}
  \\bar "|."
}

\\score {
  <<
    \\new Staff {
      \\set Staff.instrumentName = #"${isPiano ? 'Piano' : (isBass ? 'Bass' : 'Guitar')}"
      \\scaleNotes
    }${!isPiano ? `
    \\new TabStaff \\with { 
      stringTunings = #${isBass ? 'bass-tuning' : 'guitar-tuning'}
    } {
      \\scaleNotes
    }` : ''}
  >>
  \\layout { }
  \\midi { }
}`;
}

export function generateCustomSequence(pitches: number[], instrument: InstrumentType = 'bass4'): ScaleResult {
  const notes: string[] = [];
  const lilypondNotes: string[] = [];
  
  for (const p of pitches) {
    const pitch = getPitchStr(p, false); // Just use sharps as default for custom for now
    notes.push(pitch.note);
    lilypondNotes.push(pitch.lilypond);
  }

  return {
    root: 'C', // Dummy root
    type: 'Custom',
    notes: Array.from(new Set(notes)),
    lilypondNotes,
    pitchIndices: pitches,
    definition: {
      name: 'Custom',
      intervals: [],
      intervalNames: [],
      description: 'Custom User Sequence',
      commonUses: ''
    },
    instrument
  };
}
