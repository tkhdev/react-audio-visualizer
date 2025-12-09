import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useAudioVisualizer, type VisualizerMode, type FFTSize } from '../../src';

const VISUALIZATION_MODES: { value: VisualizerMode; label: string; category: string }[] = [
  { value: 'waveform', label: 'Waveform', category: 'Waveforms' },
  { value: 'dual-waveform', label: 'Dual Waveform', category: 'Waveforms' },
  { value: 'radial-waveform', label: 'Radial Waveform', category: 'Waveforms' },
  { value: 'waveform-bars', label: 'Waveform Bars', category: 'Waveforms' },
  { value: 'waveform-fill', label: 'Waveform Fill', category: 'Waveforms' },
  { value: 'waveform-history', label: 'Waveform History', category: 'Waveforms' },
  { value: 'oscilloscope', label: 'Oscilloscope', category: 'Waveforms' },
  { value: 'lissajous', label: 'Lissajous', category: 'Waveforms' },
  
  { value: 'spectrum', label: 'Spectrum', category: 'Frequency' },
  { value: 'line-spectrum', label: 'Line Spectrum', category: 'Frequency' },
  { value: 'radial-spectrum', label: 'Radial Spectrum', category: 'Frequency' },
  { value: 'frequency-bands', label: 'Frequency Bands', category: 'Frequency' },
  { value: 'frequency-dots', label: 'Frequency Dots', category: 'Frequency' },
  { value: 'frequency-lines', label: 'Frequency Lines', category: 'Frequency' },
  { value: 'frequency-arcs', label: 'Frequency Arcs', category: 'Frequency' },
  { value: 'frequency-rings', label: 'Frequency Rings', category: 'Frequency' },
  { value: 'spectrogram', label: 'Spectrogram', category: 'Frequency' },
  
  { value: 'rounded-bars', label: 'Rounded Bars', category: 'Bars' },
  { value: 'equalizer', label: 'Equalizer', category: 'Bars' },
  
  { value: 'circular', label: 'Circular', category: 'Circular' },
  { value: 'spiral', label: 'Spiral', category: 'Circular' },
  { value: 'star', label: 'Star', category: 'Circular' },
  { value: 'flower', label: 'Flower', category: 'Circular' },
  { value: 'mandala', label: 'Mandala', category: 'Circular' },
  { value: 'kaleidoscope', label: 'Kaleidoscope', category: 'Circular' },
  
  { value: 'particles', label: 'Particles', category: 'Effects' },
  { value: 'particle-trails', label: 'Particle Trails', category: 'Effects' },
  { value: 'bubbles', label: 'Bubbles', category: 'Effects' },
  { value: 'matrix', label: 'Matrix', category: 'Effects' },
  { value: 'glow', label: 'Glow', category: 'Effects' },
  { value: 'light-rays', label: 'Light Rays', category: 'Effects' },
  { value: 'energy-waves', label: 'Energy Waves', category: 'Effects' },
  { value: 'sound-waves', label: 'Sound Waves', category: 'Effects' },
  { value: 'pulse', label: 'Pulse', category: 'Effects' },
  
  { value: 'loudness', label: 'Loudness', category: 'Meters' },
  { value: 'vu-meter', label: 'VU Meter', category: 'Meters' },
  
  { value: 'combined', label: 'Combined', category: 'Special' },
];

const CATEGORIES = Array.from(new Set(VISUALIZATION_MODES.map(m => m.category)));

interface AudioControlsProps {
  audioSource: 'mic' | 'file';
  onSourceChange: (source: 'mic' | 'file') => void;
  audioFile: File | null;
  onFileChange: (file: File | null) => void;
  isPlaying: boolean;
  onStart: () => void;
  onStop: () => void;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
  onAudioElementReady: (element: HTMLAudioElement | null) => void;
  audioUrl: string | null;
}

function AudioControls({
  audioSource,
  onSourceChange,
  audioFile,
  onFileChange,
  isPlaying,
  onStart,
  onStop,
  audioElementRef,
  onAudioElementReady,
  audioUrl,
}: AudioControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#fff' }}>Audio Source</h2>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onSourceChange('mic')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: audioSource === 'mic' ? '#667eea' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            🎤 Microphone
          </button>
          <button
            onClick={() => onSourceChange('file')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: audioSource === 'file' ? '#667eea' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
            }}
          >
            📁 Audio File
          </button>
        </div>

        {audioSource === 'file' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              {audioFile ? `📄 ${audioFile.name}` : '📁 Choose File'}
            </button>
            {audioUrl && (
              <audio
                ref={(el) => {
                  (audioElementRef as React.MutableRefObject<HTMLAudioElement | null>).current = el;
                  onAudioElementReady(el);
                }}
                controls
                src={audioUrl}
                style={{ maxWidth: '300px' }}
              />
            )}
          </>
        )}

        {audioSource === 'mic' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onStart}
              disabled={isPlaying}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isPlaying ? '#444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isPlaying ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
              }}
            >
              ▶️ Start
            </button>
            <button
              onClick={onStop}
              disabled={!isPlaying}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: !isPlaying ? '#444' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: !isPlaying ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
              }}
            >
              ⏹️ Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfigPanelProps {
  config: {
    fftSize: FFTSize;
    smoothing: number;
    minDecibels: number;
    maxDecibels: number;
    barColor: string;
    backgroundColor: string;
    lineWidth: number;
    mirror: boolean;
    transparent: boolean;
  };
  onConfigChange: (config: Partial<ConfigPanelProps['config']>) => void;
}

function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '12px',
      padding: '1.5rem',
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto',
    }}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#fff' }}>Configuration</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            FFT Size: {config.fftSize}
          </label>
          <select
            value={config.fftSize}
            onChange={(e) => onConfigChange({ fftSize: Number(e.target.value) as FFTSize })}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#0a0a0a',
              color: '#e0e0e0',
              border: '1px solid #333',
              borderRadius: '6px',
              fontSize: '0.9rem',
            }}
          >
            <option value={256}>256</option>
            <option value={512}>512</option>
            <option value={1024}>1024</option>
            <option value={2048}>2048</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Smoothing: {config.smoothing.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={config.smoothing}
            onChange={(e) => onConfigChange({ smoothing: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Min Decibels: {config.minDecibels}
          </label>
          <input
            type="range"
            min="-100"
            max="0"
            step="1"
            value={config.minDecibels}
            onChange={(e) => onConfigChange({ minDecibels: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Max Decibels: {config.maxDecibels}
          </label>
          <input
            type="range"
            min="-100"
            max="0"
            step="1"
            value={config.maxDecibels}
            onChange={(e) => onConfigChange({ maxDecibels: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Color
          </label>
          <input
            type="color"
            value={config.barColor}
            onChange={(e) => onConfigChange({ barColor: e.target.value })}
            style={{
              width: '100%',
              height: '40px',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Background
          </label>
          <input
            type="color"
            value={config.backgroundColor}
            onChange={(e) => onConfigChange({ backgroundColor: e.target.value })}
            style={{
              width: '100%',
              height: '40px',
              border: '1px solid #333',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
            Line Width: {config.lineWidth}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.lineWidth}
            onChange={(e) => onConfigChange({ lineWidth: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.transparent}
              onChange={(e) => onConfigChange({ transparent: e.target.checked })}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Transparent Background</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.mirror}
              onChange={(e) => onConfigChange({ mirror: e.target.checked })}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mirror</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function UnifiedDemo() {
  // Audio state
  const [audioSource, setAudioSource] = useState<'mic' | 'file'>('mic');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Visualization state
  const [selectedMode, setSelectedMode] = useState<VisualizerMode>('spectrum');
  const [searchQuery, setSearchQuery] = useState('');

  // Configuration
  const [config, setConfig] = useState({
    fftSize: 1024 as FFTSize,
    smoothing: 0.85,
    minDecibels: -90,
    maxDecibels: -10,
    barColor: '#00ffcc',
    backgroundColor: '#000000',
    lineWidth: 2,
    mirror: false,
    transparent: false,
  });

  // Callback ref to track when audio element is ready
  const handleAudioElementRef = useCallback((element: HTMLAudioElement | null) => {
    audioElementRef.current = element;
    setAudioElement(element);
  }, []);

  // Get current audio source for the hook
  const currentAudioSource = useMemo(() => {
    if (audioSource === 'mic') {
      return 'mic';
    }
    return audioElement || null;
  }, [audioSource, audioElement]);

  // Visualization hook - only one instance for performance
  const visualizer = useAudioVisualizer({
    source: currentAudioSource || 'mic',
    mode: selectedMode,
    fftSize: config.fftSize,
    smoothing: config.smoothing,
    minDecibels: config.minDecibels,
    maxDecibels: config.maxDecibels,
    barColor: config.barColor,
    backgroundColor: config.transparent ? 'transparent' : config.backgroundColor,
    lineWidth: config.lineWidth,
    mirror: config.mirror,
  });

  // Handle file selection
  useEffect(() => {
    if (audioFile) {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setIsAudioPlaying(false);
      visualizer.stop();
    } else {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
    }
  }, [audioFile]);

  // Handle audio element play/pause
  useEffect(() => {
    const audio = audioElement;
    if (!audio) return;

    const handlePlay = async () => {
      setIsAudioPlaying(true);
      if (!visualizer.isRunning) {
        try {
          await visualizer.start();
        } catch (err) {
          console.error('Failed to start visualization:', err);
        }
      }
    };

    const handlePause = () => {
      setIsAudioPlaying(false);
      visualizer.stop();
    };

    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioElement, visualizer]);

  // Handle mic start/stop
  const handleMicStart = async () => {
    try {
      await visualizer.start();
      setIsAudioPlaying(true);
    } catch (err) {
      console.error('Failed to start mic:', err);
    }
  };

  const handleMicStop = () => {
    visualizer.stop();
    setIsAudioPlaying(false);
  };

  // Filter visualizations by search
  const filteredVisualizations = useMemo(() => {
    if (!searchQuery) return VISUALIZATION_MODES;
    const query = searchQuery.toLowerCase();
    return VISUALIZATION_MODES.filter(m => 
      m.label.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group by category
  const groupedVisualizations = useMemo(() => {
    const groups: Record<string, typeof VISUALIZATION_MODES> = {};
    filteredVisualizations.forEach(viz => {
      if (!groups[viz.category]) {
        groups[viz.category] = [];
      }
      groups[viz.category].push(viz);
    });
    return groups;
  }, [filteredVisualizations]);

  // Generate code example
  const codeExample = useMemo(() => {
    const sourceCode = audioSource === 'mic'
      ? `const { canvasRef, start, stop } = useAudioVisualizer({
  source: 'mic',`
      : `const audioRef = useRef<HTMLAudioElement>(null);
  const { canvasRef, start, stop } = useAudioVisualizer({
    source: audioRef.current!,`;

    const options: string[] = [];
    options.push(`  mode: '${selectedMode}',`);
    if (config.fftSize !== 1024) options.push(`  fftSize: ${config.fftSize},`);
    if (config.smoothing !== 0.85) options.push(`  smoothing: ${config.smoothing},`);
    if (config.minDecibels !== -90) options.push(`  minDecibels: ${config.minDecibels},`);
    if (config.maxDecibels !== -10) options.push(`  maxDecibels: ${config.maxDecibels},`);
    if (config.barColor !== '#00ffcc') options.push(`  barColor: '${config.barColor}',`);
    if (config.backgroundColor !== '#000000' && !config.transparent) options.push(`  backgroundColor: '${config.backgroundColor}',`);
    if (config.transparent) options.push(`  backgroundColor: 'transparent',`);
    if (config.lineWidth !== 2) options.push(`  lineWidth: ${config.lineWidth},`);
    if (config.mirror) options.push(`  mirror: true,`);

    const optionsStr = options.join('\n');
    const closing = audioSource === 'mic' ? '});' : '  });';

    return audioSource === 'mic'
      ? `import { useRef } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function MyVisualizer() {
  ${sourceCode}
${optionsStr}
${closing}

  return (
    <div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <canvas ref={canvasRef} width={800} height={400} />
    </div>
  );
}`
      : `import { useRef } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function MyVisualizer() {
  ${sourceCode}
${optionsStr}
${closing}

  return (
    <div>
      <audio ref={audioRef} controls src="audio.mp3" onPlaying={start} onPause={stop} />
      <canvas ref={canvasRef} width={800} height={400} />
    </div>
  );
}`;
  }, [selectedMode, audioSource, config]);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#0a0a0f',
      minHeight: '100vh',
      color: '#e0e0e0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem 2rem',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          🎵 React Audio Visualizer
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', opacity: 0.9 }}>
          High-performance audio visualization hook for React
        </p>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: '300px',
          backgroundColor: '#1a1a2e',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
            <input
              type="text"
              placeholder="🔍 Search visualizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0a0a0a',
                color: '#e0e0e0',
                border: '1px solid #333',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {Object.entries(groupedVisualizations).map(([category, vizs]) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.85rem',
                  color: '#888',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  padding: '0 0.5rem',
                }}>
                  {category}
                </h3>
                {vizs.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedMode(value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.25rem',
                      backgroundColor: selectedMode === value ? '#667eea' : 'transparent',
                      color: selectedMode === value ? '#fff' : '#ccc',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMode !== value) {
                        e.currentTarget.style.backgroundColor = '#2a2a3e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMode !== value) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Audio Controls - Fixed at top */}
          <div style={{ padding: '1.5rem 1.5rem 0 1.5rem', flexShrink: 0 }}>
            <AudioControls
              audioSource={audioSource}
              onSourceChange={(source) => {
                setAudioSource(source);
                visualizer.stop();
                setIsAudioPlaying(false);
              }}
              audioFile={audioFile}
              onFileChange={setAudioFile}
              isPlaying={isAudioPlaying}
              onStart={handleMicStart}
              onStop={handleMicStop}
              audioElementRef={audioElementRef}
              onAudioElementReady={handleAudioElementRef}
              audioUrl={audioUrl}
            />
          </div>

          {/* Configuration and Visualization - Scrollable */}
          <div style={{ 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: '300px 1fr', 
            gap: '1.5rem', 
            padding: '1.5rem',
            overflow: 'hidden',
          }}>
            {/* Config Panel - Scrollable */}
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ConfigPanel config={config} onConfigChange={(updates) => setConfig({ ...config, ...updates })} />
            </div>

            {/* Visualization Area - Fixed/Sticky */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              overflowY: 'auto',
              height: '100%',
            }}>
              {/* Visualization Canvas - Always visible at top */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '1.5rem',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>
                    {VISUALIZATION_MODES.find(m => m.value === selectedMode)?.label}
                  </h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(codeExample)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    📋 Copy Code
                  </button>
                </div>
                <div style={{
                  backgroundColor: '#0a0a0a',
                  borderRadius: '8px',
                  padding: '1rem',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                }}>
                  <canvas
                    ref={visualizer.canvasRef}
                    width={1200}
                    height={675}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              {/* Code Example - Scrollable below visualization */}
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '1.5rem',
                flexShrink: 0,
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#fff' }}>Code Example</h3>
                <div style={{
                  backgroundColor: '#0a0a0a',
                  borderRadius: '8px',
                  padding: '1rem',
                  overflow: 'auto',
                  maxHeight: '300px',
                }}>
                  <pre style={{
                    margin: 0,
                    color: '#a0a0a0',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    fontFamily: '"Fira Code", "Consolas", monospace',
                  }}>
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default UnifiedDemo;
