import { vi } from 'vitest';

// Create mock analyser node
const createMockAnalyser = () => ({
  fftSize: 1024,
  smoothingTimeConstant: 0.85,
  minDecibels: -90,
  maxDecibels: -10,
  frequencyBinCount: 512,
  getByteTimeDomainData: vi.fn(),
  getByteFrequencyData: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
});

// Create mock source node classes
class MockMediaStreamAudioSourceNode {
  connect = vi.fn();
  disconnect = vi.fn();
  context: AudioContext;

  constructor(public stream: MediaStream, context: AudioContext) {
    this.context = context;
  }
}

class MockMediaElementAudioSourceNode {
  connect = vi.fn();
  disconnect = vi.fn();
  context: AudioContext;

  constructor(public mediaElement: HTMLMediaElement, context: AudioContext) {
    this.context = context;
  }
}

// Create mock source nodes
const createMockMediaStreamSource = (context: AudioContext) => {
  return new MockMediaStreamAudioSourceNode({} as MediaStream, context);
};

const createMockMediaElementSource = (context: AudioContext) => {
  return new MockMediaElementAudioSourceNode(
    document.createElement('audio'),
    context
  );
};

// Mock AudioContext constructor
class MockAudioContext {
  state = 'running';
  destination = {};

  createAnalyser() {
    return createMockAnalyser();
  }

  createMediaStreamSource(stream: MediaStream) {
    return createMockMediaStreamSource(this);
  }

  createMediaElementSource(element: HTMLMediaElement) {
    return createMockMediaElementSource(this);
  }

  resume() {
    return Promise.resolve();
  }

  close() {
    vi.fn();
  }
}

// Set up AudioContext and related classes on window/global
// Using type assertions for test mocks is acceptable
global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
(global as typeof globalThis & {
  MediaStreamAudioSourceNode: typeof MockMediaStreamAudioSourceNode;
  MediaElementAudioSourceNode: typeof MockMediaElementAudioSourceNode;
}).MediaStreamAudioSourceNode = MockMediaStreamAudioSourceNode;
(global as typeof globalThis & {
  MediaElementAudioSourceNode: typeof MockMediaElementAudioSourceNode;
}).MediaElementAudioSourceNode = MockMediaElementAudioSourceNode;
(global as typeof globalThis & {
  window: typeof globalThis & { AudioContext: typeof MockAudioContext; webkitAudioContext: typeof MockAudioContext };
}).window = global as typeof globalThis & { AudioContext: typeof MockAudioContext; webkitAudioContext: typeof MockAudioContext };
(global as typeof globalThis & {
  window: typeof globalThis & { AudioContext: typeof MockAudioContext; webkitAudioContext: typeof MockAudioContext };
}).window.AudioContext = MockAudioContext;
(global as typeof globalThis & {
  window: typeof globalThis & { webkitAudioContext: typeof MockAudioContext };
}).window.webkitAudioContext = MockAudioContext;

// Mock getUserMedia
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [
      {
        stop: vi.fn(),
      },
    ],
  } as MediaStream),
} as MediaDevices;

// Mock requestAnimationFrame
let rafId = 0;
global.requestAnimationFrame = vi.fn((cb) => {
  rafId++;
  // Use setImmediate or setTimeout to trigger callback asynchronously
  setImmediate(() => {
    if (typeof cb === 'function') {
      cb(rafId);
    }
  });
  return rafId;
});

global.cancelAnimationFrame = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock devicePixelRatio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  configurable: true,
  value: 1,
});

// Mock canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    scale: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
});

// Mock canvas getBoundingClientRect
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 800,
  height: 200,
  top: 0,
  left: 0,
  bottom: 200,
  right: 800,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
});

// Mock renderer module
vi.mock('../src/renderers', () => ({
  getRenderer: vi.fn().mockResolvedValue(vi.fn()),
}));

