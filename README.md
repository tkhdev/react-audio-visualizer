# React Audio Visualizer Hook

<div align="center">

![npm version](https://img.shields.io/npm/v/@tkhdev/react-audio-visualizer?style=flat-square)
![license](https://img.shields.io/npm/l/@tkhdev/react-audio-visualizer?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-%3E%3D17-61dafb?style=flat-square&logo=react)

**A tiny, high-performance audio visualizer hook for React using Web Audio API + Canvas**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Examples](#-examples) • [Performance](#-performance) • [Live Demo](https://tkhdev-react-audio-visualizer.vercel.app/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Visualization Modes](#-visualization-modes)
- [API Reference](#-api-reference)
- [Usage Examples](#-usage-examples)
- [Advanced Usage](#-advanced-usage)
- [Performance](#-performance)
- [Browser Support](#-browser-support)
- [Troubleshooting](#-troubleshooting)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

`@tkhdev/react-audio-visualizer` is a lightweight, performant React hook that provides real-time audio visualization capabilities. Built on top of the Web Audio API and HTML5 Canvas, it offers 37 unique visualization modes with zero React re-renders per frame, making it perfect for music players, voice analysis tools, and interactive audio experiences.

### Key Highlights

- 🚀 **Zero Re-renders**: Uses `requestAnimationFrame` for smooth 60 FPS animations without triggering React re-renders
- 📦 **Tree-shakeable**: Dynamic imports ensure only used renderers are bundled
- 🎨 **37 Visualization Modes**: From classic waveforms to artistic patterns
- 🔧 **Fully Typed**: Complete TypeScript support with comprehensive type definitions
- 🌐 **SSR Safe**: Works seamlessly with Next.js and other SSR frameworks
- 🎤 **Dual Input Support**: Works with microphone input or HTML audio elements
- 📱 **Mobile Ready**: Optimized for mobile browsers with high-DPI display support

---

## ✨ Features

### Core Capabilities

- **Multiple Audio Sources**
  - 🎤 Microphone input with device selection
  - 🎵 HTML audio/video element support
  - 🔄 Automatic source management and cleanup

- **Rich Visualization Options**
  - 📊 37 built-in visualization modes
  - 🎨 Customizable colors (static or dynamic functions)
  - 🔄 Mirror mode for symmetric visualizations
  - 📐 Configurable FFT sizes (256, 512, 1024, 2048)
  - 🎚️ Adjustable smoothing and decibel ranges

- **Performance Optimizations**
  - ⚡ Zero React re-renders per frame
  - 🖼️ High-DPI canvas scaling
  - 💾 Renderer caching and lazy loading
  - 🧹 Automatic resource cleanup
  - 📦 Code splitting for smaller bundle sizes

- **Developer Experience**
  - 📘 Full TypeScript support
  - 🎯 Comprehensive error handling
  - 🔔 Lifecycle callbacks (onStart, onStop, onError)
  - 📖 Extensive documentation and examples

---

## 📦 Installation

```bash
npm install @tkhdev/react-audio-visualizer
```

or

```bash
yarn add @tkhdev/react-audio-visualizer
```

or

```bash
pnpm add @tkhdev/react-audio-visualizer
```

### Peer Dependencies

- `react >= 17`

---

## 🚀 Quick Start

### Basic Example with Microphone

```tsx
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const { canvasRef, start, stop, isRunning } = useAudioVisualizer({
    source: 'mic',
    mode: 'spectrum',
  });

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={200} />
      <button onClick={start} disabled={isRunning}>
        Start
      </button>
      <button onClick={stop} disabled={!isRunning}>
        Stop
      </button>
    </div>
  );
}
```

### Basic Example with Audio Element

```tsx
import { useRef } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { canvasRef, start, stop } = useAudioVisualizer({
    source: audioRef.current!,
    mode: 'waveform',
  });

  return (
    <div>
      <audio 
        ref={audioRef} 
        controls 
        src="/path/to/audio.mp3"
        onPlay={start} 
        onPause={stop} 
      />
      <canvas ref={canvasRef} width={800} height={200} />
    </div>
  );
}
```

---

## 🎨 Visualization Modes

The library provides 37 visualization modes organized by category:

### Waveform Modes
- `waveform` - Classic time-domain waveform
- `dual-waveform` - Dual mirrored waveforms
- `oscilloscope` - Oscilloscope-style display
- `waveform-bars` - Waveform represented as bars
- `waveform-fill` - Filled waveform area
- `radial-waveform` - Circular waveform pattern
- `waveform-history` - Waveform with history trail
- `energy-waves` - Energy-based wave visualization

### Spectrum Modes
- `spectrum` - Classic frequency spectrum bars
- `line-spectrum` - Frequency spectrum as lines
- `radial-spectrum` - Circular frequency spectrum
- `frequency-bands` - Grouped frequency bands
- `rounded-bars` - Rounded frequency bars
- `frequency-dots` - Frequency data as dots
- `frequency-lines` - Frequency lines visualization
- `frequency-arcs` - Arced frequency display
- `frequency-rings` - Concentric frequency rings

### Artistic Modes
- `circular` - Circular visualization
- `spiral` - Spiral pattern
- `star` - Star-shaped visualization
- `flower` - Flower-like pattern
- `mandala` - Mandala pattern
- `kaleidoscope` - Kaleidoscope effect
- `light-rays` - Light ray effects
- `glow` - Glowing visualization
- `bubbles` - Bubble effects
- `particles` - Particle system
- `particle-trails` - Particles with trails
- `matrix` - Matrix-style visualization
- `pulse` - Pulsing visualization

### Analysis Modes
- `loudness` - Overall loudness meter
- `vu-meter` - VU meter display
- `equalizer` - Equalizer visualization
- `spectrogram` - Spectrogram (frequency over time)
- `sound-waves` - Sound wave patterns
- `lissajous` - Lissajous curves
- `combined` - Combined waveform and spectrum

### Example: Using Different Modes

```tsx
import { useState } from 'react';
import { useAudioVisualizer, type VisualizerMode } from '@tkhdev/react-audio-visualizer';

const modes: VisualizerMode[] = [
  'waveform',
  'spectrum',
  'spiral',
  'circular',
  'particles',
  // ... more modes
];

function App() {
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  
  const { canvasRef, start, stop } = useAudioVisualizer({
    source: 'mic',
    mode,
    barColor: '#00ffcc',
  });

  return (
    <div>
      <select value={mode} onChange={(e) => setMode(e.target.value as VisualizerMode)}>
        {modes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <canvas ref={canvasRef} width={800} height={400} />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

## 📚 API Reference

### `useAudioVisualizer(options)`

The main hook that provides audio visualization capabilities.

#### Parameters

##### `options: UseAudioVisualizerOptions`

| Option | Type | Default | Required | Description |
|--------|------|---------|----------|-------------|
| `source` | `'mic' \| HTMLAudioElement` | - | ✅ | Audio source. Use `'mic'` for microphone input or pass an `HTMLAudioElement` reference. |
| `mode` | `VisualizerMode` | - | ✅ | Visualization mode. See [Visualization Modes](#-visualization-modes) for all available options. |
| `fftSize` | `256 \| 512 \| 1024 \| 2048` | `1024` | ❌ | FFT (Fast Fourier Transform) size. Higher values provide more frequency resolution but use more CPU. |
| `smoothing` | `number` | `0.85` | ❌ | Smoothing time constant (0-1). Higher values create smoother transitions but slower response. |
| `minDecibels` | `number` | `-90` | ❌ | Minimum decibel value for frequency analysis. |
| `maxDecibels` | `number` | `-10` | ❌ | Maximum decibel value for frequency analysis. |
| `barColor` | `string \| (value: number) => string` | `'#00ffcc'` | ❌ | Color for bars/lines. Can be a static color string or a function that returns a color based on the normalized value (0-1). |
| `backgroundColor` | `string` | `'#000'` | ❌ | Canvas background color. Use `'transparent'` for transparent background. |
| `lineWidth` | `number` | `2` | ❌ | Line width for waveform-based visualizations (in pixels). |
| `deviceId` | `string` | `undefined` | ❌ | Specific microphone device ID. Use `navigator.mediaDevices.enumerateDevices()` to get available devices. |
| `mirror` | `boolean` | `false` | ❌ | Enable mirror mode for symmetric visualizations. |
| `onStart` | `() => void` | `undefined` | ❌ | Callback function called when visualization starts. |
| `onStop` | `() => void` | `undefined` | ❌ | Callback function called when visualization stops. |
| `onError` | `(err: Error) => void` | `undefined` | ❌ | Error callback function. Called when an error occurs during initialization or runtime. |

#### Returns

##### `UseAudioVisualizerReturn`

| Property | Type | Description |
|----------|------|-------------|
| `canvasRef` | `RefObject<HTMLCanvasElement \| null>` | React ref to attach to a `<canvas>` element. The hook will automatically handle canvas setup and scaling. |
| `start` | `() => Promise<void>` | Starts the audio visualization. Returns a Promise that resolves when initialization is complete. May throw if initialization fails. |
| `stop` | `() => void` | Stops the audio visualization and cleans up all resources. |
| `isRunning` | `boolean` | Current running state. `true` when visualization is active, `false` otherwise. |
| `error` | `Error \| null` | Current error state. `null` when no error, or an `Error` object if an error occurred. |

### Type Definitions

```typescript
type VisualizerMode = 
  | 'waveform' 
  | 'spectrum' 
  | 'loudness'
  | 'circular'
  | 'frequency-bands'
  | 'rounded-bars'
  | 'particles'
  | 'dual-waveform'
  | 'line-spectrum'
  | 'radial-spectrum'
  | 'oscilloscope'
  | 'vu-meter'
  | 'frequency-dots'
  | 'sound-waves'
  | 'spiral'
  | 'matrix'
  | 'equalizer'
  | 'spectrogram'
  | 'star'
  | 'bubbles'
  | 'lissajous'
  | 'waveform-bars'
  | 'frequency-rings'
  | 'pulse'
  | 'waveform-fill'
  | 'radial-waveform'
  | 'frequency-lines'
  | 'frequency-arcs'
  | 'kaleidoscope'
  | 'mandala'
  | 'flower'
  | 'glow'
  | 'particle-trails'
  | 'light-rays'
  | 'energy-waves'
  | 'waveform-history'
  | 'combined';

type AudioSource = 'mic' | HTMLAudioElement;

type FFTSize = 256 | 512 | 1024 | 2048;

type BarColor = string | ((value: number) => string);
```

---

## 🎮 Live Demo

Try the interactive demo with all 37 visualization modes:

**👉 [View Live Demo](https://tkhdev-react-audio-visualizer.vercel.app/)**

The demo showcases all visualization modes with both microphone input and audio file playback.

---

## 💡 Usage Examples

### Example 1: Dynamic Color Function

```tsx
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const { canvasRef, start, stop } = useAudioVisualizer({
    source: 'mic',
    mode: 'spectrum',
    // Dynamic color based on frequency value
    barColor: (value) => {
      // Create a gradient from blue to red based on intensity
      const hue = value * 240; // 0-240 (blue to red)
      return `hsl(${hue}, 100%, 50%)`;
    },
  });

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={200} />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Example 2: Microphone Device Selection

```tsx
import { useState, useEffect } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    // Get available audio input devices
    navigator.mediaDevices.enumerateDevices().then((deviceList) => {
      const audioInputs = deviceList.filter(
        (device) => device.kind === 'audioinput'
      );
      setDevices(audioInputs);
    });
  }, []);

  const { canvasRef, start, stop } = useAudioVisualizer({
    source: 'mic',
    mode: 'spectrum',
    deviceId: selectedDevice || undefined,
  });

  return (
    <div>
      <select
        value={selectedDevice}
        onChange={(e) => setSelectedDevice(e.target.value)}
      >
        <option value="">Default Microphone</option>
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>
      <canvas ref={canvasRef} width={800} height={200} />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Example 3: Multiple Visualizations

```tsx
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const visualizer1 = useAudioVisualizer({
    source: audioRef.current!,
    mode: 'waveform',
    barColor: '#00ffcc',
  });

  const visualizer2 = useAudioVisualizer({
    source: audioRef.current!,
    mode: 'spectrum',
    barColor: '#ff00cc',
  });

  const handlePlay = () => {
    visualizer1.start();
    visualizer2.start();
  };

  const handlePause = () => {
    visualizer1.stop();
    visualizer2.stop();
  };

  return (
    <div>
      <audio
        ref={audioRef}
        controls
        src="/audio.mp3"
        onPlay={handlePlay}
        onPause={handlePause}
      />
      <div style={{ display: 'flex', gap: '20px' }}>
        <canvas ref={visualizer1.canvasRef} width={400} height={200} />
        <canvas ref={visualizer2.canvasRef} width={400} height={200} />
      </div>
    </div>
  );
}
```

### Example 4: Error Handling

```tsx
import { useState } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { canvasRef, start, stop, error } = useAudioVisualizer({
    source: 'mic',
    mode: 'spectrum',
    onError: (err) => {
      setErrorMessage(err.message);
      console.error('Visualizer error:', err);
    },
    onStart: () => {
      setErrorMessage('');
      console.log('Visualization started');
    },
    onStop: () => {
      console.log('Visualization stopped');
    },
  });

  return (
    <div>
      {error && (
        <div style={{ color: 'red', padding: '10px' }}>
          Error: {errorMessage || error.message}
        </div>
      )}
      <canvas ref={canvasRef} width={800} height={200} />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Example 5: Next.js Integration

```tsx
'use client'; // For Next.js 13+ App Router

import { useRef } from 'react';
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

export default function AudioVisualizer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { canvasRef, start, stop } = useAudioVisualizer({
    source: audioRef.current!,
    mode: 'spectrum',
  });

  return (
    <div>
      <audio
        ref={audioRef}
        controls
        src="/api/audio-stream"
        onPlay={start}
        onPause={stop}
      />
      <canvas ref={canvasRef} width={800} height={200} />
    </div>
  );
}
```

### Example 6: Custom Styling with Transparent Background

```tsx
import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer';

function App() {
  const { canvasRef, start, stop } = useAudioVisualizer({
    source: 'mic',
    mode: 'particles',
    backgroundColor: 'transparent',
    barColor: '#ffffff',
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        style={{ 
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      />
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

---

## 🔧 Advanced Usage

### FFT Size Selection

The FFT size determines the frequency resolution of the analysis:

- **256**: Lower CPU usage, fewer frequency bins (128), faster updates
- **512**: Balanced performance (256 bins)
- **1024**: Default, good balance (512 bins)
- **2048**: Higher resolution (1024 bins), more CPU intensive

```tsx
const { canvasRef, start, stop } = useAudioVisualizer({
  source: 'mic',
  mode: 'spectrum',
  fftSize: 2048, // Higher resolution for detailed analysis
});
```

### Smoothing Configuration

Smoothing controls how quickly the visualization responds to audio changes:

- **0.0**: Instant response, may appear jittery
- **0.85**: Default, smooth transitions
- **1.0**: Very smooth, slower response

```tsx
const { canvasRef, start, stop } = useAudioVisualizer({
  source: 'mic',
  mode: 'spectrum',
  smoothing: 0.5, // More responsive
});
```

### Decibel Range Tuning

Adjust the decibel range to focus on specific audio levels:

```tsx
const { canvasRef, start, stop } = useAudioVisualizer({
  source: 'mic',
  mode: 'spectrum',
  minDecibels: -100, // Capture quieter sounds
  maxDecibels: 0,    // Full range
});
```

### Responsive Canvas

The hook automatically handles high-DPI displays. For responsive sizing, use CSS:

```tsx
<canvas
  ref={canvasRef}
  width={800}
  height={200}
  style={{
    width: '100%',
    height: 'auto',
    maxWidth: '800px',
  }}
/>
```

---

## ⚡ Performance

### Optimization Features

1. **Zero Re-renders**: The animation loop runs entirely outside React's render cycle using `requestAnimationFrame` and refs.

2. **Dynamic Imports**: Renderers are loaded on-demand, reducing initial bundle size.

3. **Renderer Caching**: Once loaded, renderers are cached to avoid redundant imports.

4. **Efficient Canvas Operations**: Uses optimized Canvas 2D API calls and minimizes redraws.

5. **Automatic Cleanup**: All resources (AudioContext, MediaStream, animation frames) are properly cleaned up on unmount.

### Performance Tips

- **Lower FFT Size**: Use `fftSize: 512` or `256` for better performance on lower-end devices.
- **Reduce Smoothing**: Lower smoothing values (e.g., `0.5`) can improve responsiveness.
- **Single Visualization**: Avoid running multiple visualizations simultaneously if performance is a concern.
- **Canvas Size**: Smaller canvas dimensions reduce rendering overhead.

### Benchmarks

On a modern desktop (Chrome):
- **60 FPS** maintained with default settings
- **< 5% CPU usage** for single visualization
- **~50KB** gzipped bundle size (with tree-shaking)

---

## 🌐 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Latest | Full support |
| Firefox | ✅ Latest | Full support |
| Safari | ✅ Latest | Requires user gesture to start AudioContext |
| Mobile Chrome | ✅ Latest | Full support |
| Mobile Safari | ✅ Latest | Requires user gesture |
| Opera | ✅ Latest | Full support |

### Web Audio API Support

The library requires browsers that support:
- `AudioContext` or `webkitAudioContext`
- `getUserMedia` (for microphone input)
- `HTMLCanvasElement` and `CanvasRenderingContext2D`

### Safari Considerations

Safari has stricter autoplay policies. The hook automatically handles AudioContext resumption, but users must interact with the page (click, tap) before audio can start.

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Audio element is not available"

**Problem**: The audio element ref is `null` when the hook is initialized.

**Solution**: Ensure the audio element is rendered and has a valid ref before using it:

```tsx
const audioRef = useRef<HTMLAudioElement>(null);

// Wait for audio element to be ready
useEffect(() => {
  if (audioRef.current) {
    // Audio element is ready
  }
}, []);

const { canvasRef, start, stop } = useAudioVisualizer({
  source: audioRef.current!, // Use non-null assertion only when sure
  mode: 'spectrum',
});
```

#### 2. "Permission denied" for microphone

**Problem**: Browser blocked microphone access.

**Solution**: 
- Ensure the site is served over HTTPS (required for `getUserMedia`)
- Check browser permissions in settings
- Request permission explicitly before calling `start()`

#### 3. No visualization appears

**Problem**: Canvas is not rendering.

**Solution**:
- Verify `canvasRef` is attached to a `<canvas>` element
- Check that `start()` was called successfully
- Ensure audio source is active (playing or microphone is capturing)
- Check browser console for errors

#### 4. Audio plays but no visualization

**Problem**: Audio element is playing but canvas is blank.

**Solution**:
- Ensure `start()` is called when audio starts playing
- Check that the audio element has a valid `src`
- Verify the mode is correct for your use case

#### 5. Performance issues

**Problem**: Low FPS or high CPU usage.

**Solution**:
- Reduce `fftSize` (try `512` or `256`)
- Use a smaller canvas size
- Reduce `smoothing` value
- Close other browser tabs/applications

#### 6. TypeScript errors

**Problem**: Type errors when using the hook.

**Solution**:
- Ensure you're using TypeScript 4.5+
- Check that React types are installed: `npm install -D @types/react`
- Verify you're using the correct import: `import { useAudioVisualizer } from '@tkhdev/react-audio-visualizer'`

### Debug Mode

Enable verbose logging by checking the browser console. The hook logs important events:
- AudioContext creation/resumption
- Renderer loading
- Errors and warnings

---

## 🏗️ Architecture

### Project Structure

```
react-audio-visualizer/
├── src/
│   ├── audio/              # Audio processing utilities
│   │   ├── analyser.ts     # AnalyserNode configuration
│   │   ├── createAudioContext.ts  # AudioContext creation
│   │   └── createSource.ts # Audio source creation (mic/element)
│   ├── renderers/          # Visualization renderers (37 modes)
│   │   ├── waveform.ts
│   │   ├── spectrum.ts
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── clamp.ts
│   │   ├── rms.ts
│   │   ├── scaleCanvas.ts
│   │   └── getCanvasDimensions.ts
│   ├── types.ts            # TypeScript type definitions
│   ├── useAudioVisualizer.ts  # Main hook implementation
│   └── index.ts            # Public API exports
├── examples/               # Example applications
├── test/                   # Test files
└── dist/                   # Built output
```

### How It Works

1. **Initialization**: When `start()` is called, the hook:
   - Creates or reuses an `AudioContext`
   - Creates an `AnalyserNode` with configured FFT size
   - Connects the audio source (mic or element) to the analyser
   - Allocates data buffers for frequency/time domain data

2. **Animation Loop**: 
   - Uses `requestAnimationFrame` for 60 FPS rendering
   - Reads audio data from `AnalyserNode` (frequency or time domain)
   - Dynamically loads the appropriate renderer if not cached
   - Renders the visualization to the canvas

3. **Cleanup**: When `stop()` is called or component unmounts:
   - Cancels animation frames
   - Stops media stream tracks (for mic)
   - Disconnects audio nodes
   - Closes AudioContext (when safe)
   - Clears all refs and buffers

### Renderer System

Renderers are dynamically imported to enable code splitting:

```typescript
// Renderers are loaded on-demand
const renderer = await import('./renderers/spectrum');
renderer.drawSpectrum(canvas, context, data, ...);
```

This ensures only the renderers you use are included in your bundle.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tkhdev/react-audio-visualizer.git
cd react-audio-visualizer

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

### Adding a New Visualization Mode

1. Create a new renderer file in `src/renderers/`:

```typescript
// src/renderers/my-visualization.ts
export function drawMyVisualization(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  data: ArrayLike<number>,
  backgroundColor: string,
  barColor: string | ((value: number) => string),
  mirror: boolean
): void {
  // Your rendering logic here
}
```

2. Register it in `src/renderers/index.ts`:

```typescript
const rendererMap: Record<VisualizerMode, ...> = {
  // ... existing renderers
  'my-visualization': () => import('./my-visualization').then(m => ({ default: m.drawMyVisualization })),
};
```

3. Add the mode to `src/types.ts`:

```typescript
export type VisualizerMode = 
  // ... existing modes
  | 'my-visualization';
```

4. Update the examples and documentation.

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Write tests for new features
- Update documentation

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Inspired by various audio visualization projects
- Thanks to all contributors and users

---

## 📞 Support

- 📖 [Documentation](https://github.com/tkhdev/react-audio-visualizer#readme)
- 🐛 [Issue Tracker](https://github.com/tkhdev/react-audio-visualizer/issues)
- 💬 [Discussions](https://github.com/tkhdev/react-audio-visualizer/discussions)

---

<div align="center">

**Made with ❤️ for the React community**

⭐ Star this repo if you find it useful!

</div>
