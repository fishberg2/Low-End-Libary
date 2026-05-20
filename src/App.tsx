import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Heart, Music, Settings2, Eye, ChevronRight, ChevronDown, LogOut, Guitar, Play, Square, FastForward, Rewind, Trash2, Save, X, Bookmark } from 'lucide-react';
import { Note, ScaleType, SCALES, ROOT_NOTES, generateScale, generateCustomSequence, generateLilyPondCode, ScaleResult } from './lib/music';
import { CodeBlock } from './components/CodeBlock';
import { Fretboard } from './components/Fretboard';
import { VexFlowPreview } from './components/VexFlowPreview';
import { InteractiveTabEditor } from './components/InteractiveTabEditor';
import { LoginScreen } from './components/LoginScreen';
import { signOut } from './lib/firebase';
import { audioPlayer } from './lib/audio';
import { PianoKeyboard } from './components/PianoKeyboard';
import { cn } from './lib/utils';

interface FavoriteScale {
  root: Note;
  type: ScaleType;
}

export default function App() {
  const [instrument, setInstrument] = useState<string | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<Note>('C');
  const [selectedType, setSelectedType] = useState<ScaleType>('Major');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<FavoriteScale[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['C']));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingNoteIndex, setPlayingNoteIndex] = useState<number | null>(null);
  const [bpm, setBpm] = useState(120);
  const [customSequence, setCustomSequence] = useState<number[]>([]);

  useEffect(() => {
    audioPlayer.onStopCallback = () => {
      setIsPlaying(false);
      setPlayingNoteIndex(null);
    };
    audioPlayer.onNotePlayCallback = (idx) => {
      setPlayingNoteIndex(idx);
    };
    return () => {
      audioPlayer.stop();
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else {
      audioPlayer.play(scaleResult.pitchIndices, bpm, (instrument as any) || 'bass4');
      setIsPlaying(true);
    }
  };

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = Number(e.target.value);
    setBpm(newBpm);
    if (isPlaying) {
      audioPlayer.setBpm(newBpm);
    }
  };

  const handlePitchSelect = (pitchIndex: number) => {
    if (selectedType === 'Custom') {
      setCustomSequence(prev => [...prev, pitchIndex]);
    }
  };

  const clearCustomSequence = () => {
    setCustomSequence([]);
  };

  const undoLastCustomNote = () => {
    setCustomSequence(prev => prev.slice(0, -1));
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const [customPresets, setCustomPresets] = useState<{ id: string, name: string, sequence: number[], instrument: string }[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    const storedFavorites = localStorage.getItem('bassFavorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites');
      }
    }
    const storedPresets = localStorage.getItem('customPresets');
    if (storedPresets) {
      try {
        setCustomPresets(JSON.parse(storedPresets));
      } catch (e) {
        console.error('Failed to parse presets');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bassFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
  }, [customPresets]);

  const savePreset = () => {
    if (!presetName.trim() || customSequence.length === 0) return;
    const newPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      sequence: [...customSequence],
      instrument: instrument as string
    };
    setCustomPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setIsSavingPreset(false);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPresets(prev => prev.filter(p => p.id !== id));
  };

  const toggleFavorite = (root: Note, type: ScaleType) => {
    setFavorites(prev => {
      const exists = prev.find(p => p.root === root && p.type === type);
      if (exists) {
        return prev.filter(p => !(p.root === root && p.type === type));
      }
      return [...prev, { root, type }];
    });
  };

  const isFavorite = (root: Note, type: ScaleType) => {
    return favorites.some(p => p.root === root && p.type === type);
  };

  const scaleResult = useMemo(() => {
    if (selectedType === 'Custom') {
      return generateCustomSequence(customSequence, (instrument as any) || 'bass4');
    }
    return generateScale(selectedRoot, selectedType, (instrument as any) || 'bass4');
  }, [selectedRoot, selectedType, instrument, customSequence]);
  const lilyPondCode = useMemo(() => generateLilyPondCode(scaleResult), [scaleResult]);

  useEffect(() => {
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    }
  }, [scaleResult, instrument]); // Stop playing if scale or instrument changes

  const filteredScales = useMemo(() => {
    let result = ROOT_NOTES.flatMap(root => 
      SCALES.map(scale => ({ root, type: scale.name }))
    );

    if (showFavoritesOnly) {
      result = result.filter(r => isFavorite(r.root, r.type));
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        (r.root.toLowerCase() + ' ' + r.type.toLowerCase()).includes(q) ||
        (r.root.toLowerCase() + r.type.toLowerCase()).includes(q)
      );
    }

    return result;
  }, [searchQuery, showFavoritesOnly, favorites]);

  if (!instrument) {
    return <LoginScreen onSelectInstrument={setInstrument} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0F0F11] text-gray-200 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 bg-[#161618] flex flex-col h-auto md:h-screen shrink-0 relative z-10">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-white font-bold text-lg tracking-tight">
              <Music className="w-6 h-6 text-amber-500 shrink-0" />
              <span className="truncate">LowEnd<span className="text-amber-500">Library</span></span>
            </div>
            <button 
              onClick={async () => {
                try {
                  await signOut();
                  setInstrument(null);
                } catch (e) { console.error(e) }
              }}
              className="text-gray-500 hover:text-white transition-colors shrink-0 p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-3">
            <select
              value={instrument as string}
              onChange={(e) => setInstrument(e.target.value)}
              className="appearance-none w-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 transition-colors rounded text-xs font-bold uppercase tracking-widest text-amber-500 py-2.5 pl-3 pr-8 focus:outline-none focus:border-amber-500/50 cursor-pointer shadow-sm custom-scrollbar"
            >
              <option value="bass4" className="bg-[#161618] text-gray-200">🎸 Bass Guitar</option>
              <option value="guitar6" className="bg-[#161618] text-gray-200">🎸 Guitar</option>
              <option value="piano" className="bg-[#161618] text-gray-200">🎹 Piano</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search scales (e.g. C Major)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-full text-sm focus:outline-none focus:border-amber-500/50 text-gray-200 placeholder:text-gray-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors",
                showFavoritesOnly ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
              )}
            >
              <Heart className={cn("w-3 h-3", showFavoritesOnly && "fill-current")} />
              <span>Favorites</span>
            </button>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              {filteredScales.length} found
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          
          <button
            onClick={() => setSelectedType('Custom')}
            className={cn(
              "w-full text-left px-3 py-3 rounded flex items-center justify-between group transition-colors border shadow-sm mb-4",
              selectedType === 'Custom'
                ? "bg-amber-500/20 text-amber-500 border-amber-500/40" 
                : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-widest">Composer Mode</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

          {customPresets.length > 0 && (
            <div className="space-y-1 mb-6">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest px-2 pb-1 font-bold">Your Saved Presets</div>
              {customPresets.map(preset => (
                <button 
                  key={preset.id}
                  onClick={() => {
                    setSelectedType('Custom');
                    setCustomSequence(preset.sequence);
                    if (preset.instrument) setInstrument(preset.instrument);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded flex items-center justify-between group transition-colors border shadow-sm",
                    (selectedType === 'Custom' && customSequence.join(',') === preset.sequence.join(','))
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium text-sm truncate">{preset.name}</span>
                  </div>
                  <div 
                    onClick={(e) => deletePreset(preset.id, e)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {ROOT_NOTES.map(rootKey => {
            const scalesInKey = filteredScales.filter(item => item.root === rootKey);
            if (scalesInKey.length === 0) return null;
            const isExpanded = expandedKeys.has(rootKey);
            
            return (
              <div key={rootKey} className="space-y-1">
                <button 
                  onClick={() => toggleExpanded(rootKey)}
                  className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    <span>Key of {rootKey}</span>
                  </div>
                  <span className="text-gray-600">{scalesInKey.length}</span>
                </button>
                
                {isExpanded && (
                  <div className="pl-2 space-y-1 mt-1">
                    {scalesInKey.map((item) => (
                      <button
                        key={`${item.root}-${item.type}`}
                        onClick={() => { setSelectedRoot(item.root); setSelectedType(item.type); }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded flex items-center justify-between group transition-colors border",
                          (selectedRoot === item.root && selectedType === item.type) 
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-inner" 
                            : "bg-transparent text-gray-300 border-transparent hover:border-white/10 hover:bg-white/5"
                        )}
                      >
                        <span className="font-medium text-sm">
                          {item.type}
                        </span>
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(item.root, item.type); }}
                          className={cn(
                            "p-1 rounded transition-colors",
                            isFavorite(item.root, item.type) 
                              ? "text-amber-500 hover:bg-amber-500/20" 
                              : "text-gray-500 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", isFavorite(item.root, item.type) && "fill-current")} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredScales.length === 0 && (
            <div className="text-center py-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              No scales found.
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0F0F11] overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          
          <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
            <div>
              <span className="text-amber-500 text-sm font-bold uppercase tracking-widest block mb-1">Active Scale</span>
              <h1 className="text-4xl md:text-5xl font-light text-white leading-tight">
                {selectedType === 'Custom' ? 'Custom Sequence' : <>{selectedRoot} <span className="text-gray-500">{selectedType}</span></>}
              </h1>
            </div>
            
            <div className="flex items-center flex-wrap gap-4">
              {/* Playback Controls */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-2 mr-2">
                <button
                  onClick={handlePlay}
                  disabled={selectedType === 'Custom' && customSequence.length === 0}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                    isPlaying ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-amber-500 text-black hover:bg-amber-400",
                    (selectedType === 'Custom' && customSequence.length === 0) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
                <div className="flex flex-col mx-2 w-32">
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                    <span>Tempo</span>
                    <span className="text-amber-500">{bpm} BPM</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="240" 
                    value={bpm}
                    onChange={handleBpmChange}
                    className="w-full accent-amber-500 h-1 bg-white/20 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>

              {selectedType === 'Custom' ? (
                <div className="flex gap-2">
                  {isSavingPreset ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Preset name..."
                        value={presetName}
                        onChange={e => setPresetName(e.target.value)}
                        className="bg-black/50 border border-white/20 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-32"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') savePreset();
                          if (e.key === 'Escape') setIsSavingPreset(false);
                        }}
                      />
                      <button onClick={savePreset} disabled={!presetName.trim()} className="p-1.5 bg-amber-500 text-black rounded hover:bg-amber-400 disabled:opacity-50 transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsSavingPreset(false)} className="p-1.5 bg-white/10 text-white rounded hover:bg-white/20 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSavingPreset(true)} 
                      disabled={customSequence.length === 0} 
                      className="flex items-center space-x-1.5 px-4 py-2 border border-amber-500/30 rounded text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  )}
                  <button onClick={undoLastCustomNote} disabled={customSequence.length === 0} className="px-4 py-2 border border-white/10 rounded text-xs font-bold bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors">Undo</button>
                  <button onClick={clearCustomSequence} disabled={customSequence.length === 0} className="px-4 py-2 border border-red-500/30 rounded text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 transition-colors">Clear</button>
                </div>
              ) : (
                <button
                  onClick={() => toggleFavorite(selectedRoot, selectedType as ScaleType)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded text-xs font-bold transition-colors border h-10",
                    isFavorite(selectedRoot, selectedType as ScaleType)
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                      : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isFavorite(selectedRoot, selectedType as ScaleType) && "fill-current")} />
                  <span>{isFavorite(selectedRoot, selectedType as ScaleType) ? 'Saved' : 'Add to Favorites'}</span>
                </button>
              )}
            </div>
          </header>

          {selectedType === 'Custom' && customSequence.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4 mb-8 text-amber-500 text-sm font-medium">
              Composer Mode active. Click notes on the keyboard or fretboard below to build your custom sequence.
            </div>
          )}

          <div className="space-y-8 max-w-4xl">
            {/* Theory Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded border border-white/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Intervals</span>
                  <div className="text-lg font-mono text-white tracking-tighter">
                    {scaleResult.definition.intervalNames.join(' ')}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded border border-white/10 md:col-span-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Popular Use</span>
                  <div className="text-sm text-gray-300 italic">
                    {scaleResult.definition.commonUses}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded border border-white/10 md:col-span-3">
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Description</span>
                 <div className="text-sm text-gray-200">
                   {scaleResult.definition.description}
                 </div>
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">
                 {instrument === 'piano' ? 'Keyboard & Scale Pattern' : 'Fingerings & Scale Pattern'}
              </h2>
              {instrument === 'piano' ? (
                <PianoKeyboard rootNote={scaleResult.root} notes={scaleResult.notes} playingNoteIndex={playingNoteIndex} pitchIndices={scaleResult.pitchIndices} onSelectPitch={handlePitchSelect} isComposerMode={selectedType === 'Custom'} />
              ) : (
                <Fretboard rootNote={scaleResult.root} notes={scaleResult.notes} onSelectRoot={(note) => { setSelectedRoot(note); toggleExpanded(note); }} instrument={(instrument as any) || 'bass4'} playingNoteIndex={playingNoteIndex} pitchIndices={scaleResult.pitchIndices} onSelectPitch={handlePitchSelect} isComposerMode={selectedType === 'Custom'} />
              )}
            </section>

            <section>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3">
                 {selectedType === 'Custom' ? 'Custom Score & Tab' : 'Sheet Music & Tab Preview'}
              </h2>
              {selectedType === 'Custom' && instrument !== 'piano' && (
                <div className="mb-4">
                  <InteractiveTabEditor 
                    pitchIndices={customSequence} 
                    onChange={setCustomSequence} 
                    instrument={instrument as any} 
                    playingNoteIndex={playingNoteIndex} 
                  />
                </div>
              )}
              <VexFlowPreview scaleResult={scaleResult} pitchIndices={scaleResult.pitchIndices} instrument={(instrument as any) || 'bass4'} playingNoteIndex={playingNoteIndex} />
            </section>

            <section>
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                <Settings2 className="w-3 h-3 mr-2" /> Sequence of Notes (LilyPond format)
              </h2>
              <div className="flex flex-wrap gap-2">
                {scaleResult.lilypondNotes.map((note, idx) => (
                  <div key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded text-center font-mono text-white text-lg tracking-tighter">
                    {note}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">LilyPond Source Code</h2>
                <p className="text-gray-400 text-sm mt-1">Copy or download this snippet to render sheet music{instrument === 'piano' ? '' : ' and tablature'} in LilyPond.</p>
              </div>
              <CodeBlock 
                code={lilyPondCode} 
                filename={`${selectedRoot.replace('#', 'sharp')}_${selectedType.replace(' ', '_')}_${instrument === 'piano' ? 'Piano' : (instrument === 'guitar6' ? 'Guitar' : 'Bass')}.ly`} 
              />
            </section>
            
            <section className="bg-white/5 border border-white/10 rounded p-6">
              <h3 className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-3">How to use this code</h3>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                <li>Download or copy the LilyPond source code above.</li>
                <li>Go to <a href="https://lilybin.com/" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">LilyBin</a> or use your local LilyPond compiler.</li>
                <li>Paste the code and compile to generate the musical notation and standard tablature PDF.</li>
                <li>This template automatically sets the correct bass clef and standard tuning (E, A, D, G).</li>
              </ul>
            </section>

          </div>
        </div>
      </main>

    </div>
  );
}
