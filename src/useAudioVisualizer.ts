import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { createAudioContext } from './audio/createAudioContext';
import { createMicSource, createAudioElementSource } from './audio/createSource';
import { createAnalyser } from './audio/analyser';
import { getRenderer } from './renderers';
import { scaleCanvas } from './utils/scaleCanvas';
import type {
  UseAudioVisualizerOptions,
  UseAudioVisualizerReturn,
  VisualizerMode,
} from './types';

type RendererFunctionWithLine = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  lineColor: string,
  lineWidth: number,
  mirror: boolean
) => void;

type RendererFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
) => void;

type CombinedRendererFunction = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  timeData: ArrayLike<number>,
  freqData: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
) => void;

const DEFAULTS = {
  fftSize: 1024 as const,
  smoothing: 0.85,
  minDecibels: -90,
  maxDecibels: -10,
  backgroundColor: '#000',
  barColor: '#00ffcc',
  lineWidth: 2,
  mirror: false,
};

export function useAudioVisualizer(
  options: UseAudioVisualizerOptions
): UseAudioVisualizerReturn {
  const {
    source,
    mode,
    fftSize = DEFAULTS.fftSize,
    smoothing = DEFAULTS.smoothing,
    minDecibels = DEFAULTS.minDecibels,
    maxDecibels = DEFAULTS.maxDecibels,
    barColor = DEFAULTS.barColor,
    backgroundColor = DEFAULTS.backgroundColor,
    lineWidth = DEFAULTS.lineWidth,
    deviceId,
    mirror = DEFAULTS.mirror,
    onStart,
    onStop,
    onError,
  } = options;

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<
    MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null
  >(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufferRef = useRef<Uint8Array | null>(null);
  const timeBufferRef = useRef<Uint8Array | null>(null);
  const modeRef = useRef<VisualizerMode>(mode);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rendererRef = useRef<RendererFunction | RendererFunctionWithLine | CombinedRendererFunction | null>(null);
  const isRunningRef = useRef(false);

  // State
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Update mode ref when mode changes and load renderer
  useEffect(() => {
    modeRef.current = mode;
    // Preload renderer for the current mode
    getRenderer(mode)
      .then((renderer) => {
        rendererRef.current = renderer;
      })
      .catch((err) => {
        console.error(`Failed to load renderer for mode ${mode}:`, err);
      });
  }, [mode]);

  // Canvas scaling - rescale on resize
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        scaleCanvas(canvas, context);
      }
    });

    resizeObserver.observe(canvas);
    scaleCanvas(canvas, context);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Animation loop
  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const buffer = bufferRef.current;

    if (!canvas || !analyser || !buffer) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    try {
      const currentMode = modeRef.current;

      // Get renderer (use cached if available, otherwise load)
      let renderer = rendererRef.current;
      if (!renderer) {
        try {
          renderer = await getRenderer(currentMode);
          rendererRef.current = renderer;
        } catch (err) {
          console.error(`Failed to load renderer for mode ${currentMode}:`, err);
          return;
        }
      }

      // Determine data type and get data
      const needsTimeDomain = [
        'waveform',
        'dual-waveform',
        'oscilloscope',
        'loudness',
        'vu-meter',
        'lissajous',
        'waveform-bars',
        'waveform-fill',
        'radial-waveform',
        'waveform-history',
        'energy-waves',
      ].includes(currentMode);

      if (currentMode === 'combined') {
        // Combined needs both
        if (timeBufferRef.current) {
          // Type assertions to satisfy strict ArrayBuffer typing requirements
          analyser.getByteTimeDomainData(timeBufferRef.current as unknown as Uint8Array<ArrayBuffer>);
          analyser.getByteFrequencyData(buffer as unknown as Uint8Array<ArrayBuffer>);
          (renderer as CombinedRendererFunction)(
            canvas,
            context,
            timeBufferRef.current,
            buffer,
            backgroundColor,
            barColor,
            mirror
          );
        }
      } else if (needsTimeDomain) {
        analyser.getByteTimeDomainData(buffer as unknown as Uint8Array<ArrayBuffer>);
        // Renderers that need lineWidth/lineColor
        if (['waveform', 'dual-waveform', 'oscilloscope', 'lissajous', 'radial-waveform', 'waveform-history'].includes(currentMode)) {
          (renderer as RendererFunctionWithLine)(
            canvas,
            context,
            buffer,
            backgroundColor,
            typeof barColor === 'string' ? barColor : barColor(0.5),
            lineWidth,
            mirror
          );
        } else {
          // Other time domain renderers
          (renderer as RendererFunction)(
            canvas,
            context,
            buffer,
            backgroundColor,
            barColor,
            mirror
          );
        }
      } else {
        analyser.getByteFrequencyData(buffer as unknown as Uint8Array<ArrayBuffer>);
        (renderer as RendererFunction)(
          canvas,
          context,
          buffer,
          backgroundColor,
          barColor,
          mirror
        );
      }
    } catch (err) {
      // Log error but continue animation loop
      console.error('Error in draw loop:', err);
    }

    // Always schedule next frame if still running
    if (isRunningRef.current) {
      rafRef.current = requestAnimationFrame(draw);
    }
  }, [backgroundColor, barColor, lineWidth, mirror]);

  // Stop function
  const stop = useCallback(() => {
    isRunningRef.current = false;
    
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Disconnect source but keep the reference for audio elements
    // (we can't disconnect and reconnect audio elements)
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      // Only clear sourceRef if it's a mic source (stream source)
      // For audio elements, we keep the source node reference
      if (sourceRef.current instanceof MediaStreamAudioSourceNode) {
        sourceRef.current = null;
      }
    }

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      analyserRef.current = null;
    }

    // Don't close AudioContext if we have an audio element source
    // (we need to reuse it since audio elements can only have one source)
    // Only close if it's a mic source or no source at all
    if (audioCtxRef.current) {
      if (!audioSourceNodeRef.current || sourceRef.current instanceof MediaStreamAudioSourceNode) {
        // Close context if no audio element source exists
        try {
          audioCtxRef.current.close();
        } catch (e) {
          // Ignore close errors
        }
        audioCtxRef.current = null;
      }
    }

      bufferRef.current = null;
      timeBufferRef.current = null;
      isRunningRef.current = false;
      setIsRunning(false);
      onStop?.();
  }, [onStop]);

  // Start function
  const start = useCallback(async () => {
    // Prevent multiple starts
    if (isRunning) return;

    try {
      setError(null);

      // Reuse existing AudioContext if we have an audio element source
      // (audio elements can only have one source node per context)
      let context = audioCtxRef.current;
      if (!context || context.state === 'closed') {
        context = await createAudioContext();
        audioCtxRef.current = context;
      } else if (context.state === 'suspended') {
        await context.resume();
      }

      // Create analyser
      const analyser = createAnalyser(
        context,
        fftSize,
        smoothing,
        minDecibels,
        maxDecibels
      );
      analyserRef.current = analyser;

      // Create source
      if (source === 'mic') {
        // Clear audio element references when using mic
        audioElementRef.current = null;
        audioSourceNodeRef.current = null;
        
        const { source: micSource, stream } = await createMicSource(
          context,
          deviceId
        );
        sourceRef.current = micSource;
        streamRef.current = stream;
      } else {
        if (!source || !(source instanceof HTMLMediaElement)) {
          throw new Error('Audio element is not available. Please ensure the audio element is rendered and has a valid source.');
        }
        
        // Ensure audio element has a source
        if (!source.src || source.src === '') {
          throw new Error('Audio element does not have a source. Please set the src attribute or load an audio file.');
        }
        
        // createAudioElementSource will automatically reuse existing source
        // if the audio element already has one (via WeakMap)
        // We just need to get or create it
        const audioSource = createAudioElementSource(context, source);
        sourceRef.current = audioSource;
        audioSourceNodeRef.current = audioSource;
        audioElementRef.current = source;
      }

      // Disconnect old connections first to avoid conflicts
      // Only disconnect from specific nodes, not everything, to avoid breaking other visualizations
      if (sourceRef.current) {
        try {
          // Disconnect from all current connections
          sourceRef.current.disconnect();
        } catch (e) {
          // Ignore if not connected
        }
      }
      if (analyserRef.current) {
        try {
          // Disconnect analyser from all current connections
          analyserRef.current.disconnect();
        } catch (e) {
          // Ignore if not connected
        }
      }

      // Connect source -> analyser -> destination
      // This routes audio through the analyser for visualization
      // and then to the speakers for playback
      // Note: For audio elements, multiple source nodes can exist (one per AudioContext)
      // and they all share the same audio element, so this is safe
      sourceRef.current.connect(analyser);
      analyser.connect(context.destination);
      
      // Ensure AudioContext is running (required for audio playback)
      if (context.state !== 'running') {
        try {
          await context.resume();
        } catch (err) {
          console.warn('Failed to resume AudioContext:', err);
        }
      }

      // For audio elements, ensure the element is playing
      if (source !== 'mic' && source instanceof HTMLMediaElement) {
        // Don't force play - let user control playback
        // But ensure context is ready
        if (context.state === 'suspended') {
          try {
            await context.resume();
          } catch (err) {
            console.warn('Failed to resume AudioContext for audio element:', err);
          }
        }
      }

      // Allocate buffers
      // Create buffers with explicit ArrayBuffer to satisfy strict typing
      bufferRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
      timeBufferRef.current = new Uint8Array(new ArrayBuffer(analyser.fftSize));

      // Ensure canvas is ready and scaled
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Scale canvas to ensure proper dimensions
          scaleCanvas(canvas, ctx);
        }
      }

      // Start animation loop
      isRunningRef.current = true;
      setIsRunning(true);
      onStart?.();
      
      // Use requestAnimationFrame to start the loop
      // This ensures we're in the right frame context
      // Add a small delay to ensure audio connection is established
      requestAnimationFrame(() => {
        if (isRunningRef.current) {
          rafRef.current = requestAnimationFrame(draw);
        }
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      stop();
    }
  }, [
    isRunning,
    source,
    deviceId,
    fftSize,
    smoothing,
    minDecibels,
    maxDecibels,
    onStart,
    onError,
    draw,
    stop,
  ]);

  // Watch for source changes and restart if needed
  useEffect(() => {
    // Check if source actually changed
    const currentSource = sourceRef.current;
    const isMicSource = source === 'mic';
    const isCurrentMicSource = currentSource instanceof MediaStreamAudioSourceNode;
    
    // If source type changed (mic <-> audio element), restart if running
    if (isRunningRef.current && isRunning) {
      if (isMicSource !== isCurrentMicSource) {
        // Source type changed, restart with new source
        stop();
        // Use a small delay to ensure cleanup completes
        const timeoutId = setTimeout(() => {
          start().catch((err) => {
            console.error('Failed to restart with new source:', err);
          });
        }, 50);
        return () => clearTimeout(timeoutId);
      } else if (!isMicSource && source instanceof HTMLMediaElement) {
        // For audio elements, check if the element changed
        if (audioElementRef.current !== source) {
          stop();
          const timeoutId = setTimeout(() => {
            start().catch((err) => {
              console.error('Failed to restart with new audio element:', err);
            });
          }, 50);
          return () => clearTimeout(timeoutId);
        }
      }
    } else if (!isMicSource && source instanceof HTMLMediaElement && audioElementRef.current !== source) {
      // Source changed from mic/null to audio element, but we're not running
      // Clear any stale references
      audioElementRef.current = source;
    }
  }, [source, start, stop, isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    canvasRef,
    start,
    stop,
    isRunning,
    error,
  };
}

