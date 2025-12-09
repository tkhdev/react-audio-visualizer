import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioVisualizer } from '../src/useAudioVisualizer';
import { getRenderer } from '../src/renderers';
import type { RefObject } from 'react';

// Mock the renderer module
vi.mock('../src/renderers', () => ({
  getRenderer: vi.fn().mockResolvedValue(vi.fn()),
}));

describe('useAudioVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks
    (getRenderer as MockedFunction<typeof getRenderer>).mockResolvedValue(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct defaults', () => {
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
      })
    );

    expect(result.current.isRunning).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.canvasRef.current).toBe(null);
  });

  it('should start and stop correctly', async () => {
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
      })
    );

    // Create and attach canvas element with proper attributes
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '200');
    canvas.width = 800;
    canvas.height = 200;
    
    act(() => {
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
    });

    // Wait for layout effects to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.error).toBe(null);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Permission denied');
    (global.navigator.mediaDevices.getUserMedia as MockedFunction<typeof navigator.mediaDevices.getUserMedia>).mockRejectedValueOnce(
      mockError
    );

    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
        onError,
      })
    );

    // Create and attach canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 200;
    act(() => {
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
    });

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isRunning).toBe(false);
    expect(onError).toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
      })
    );

    // Create and attach canvas element with proper attributes
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '200');
    canvas.width = 800;
    canvas.height = 200;
    
    act(() => {
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
    });

    // Wait for layout effects to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.start();
    });

    unmount();

    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('should call onStart callback when starting', async () => {
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
        onStart,
      })
    );

    // Create and attach canvas element with proper attributes
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '200');
    canvas.width = 800;
    canvas.height = 200;
    
    act(() => {
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
    });

    // Wait for layout effects to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.start();
    });

    expect(onStart).toHaveBeenCalled();
  });

  it('should call onStop callback when stopping', async () => {
    const onStop = vi.fn();
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
        onStop,
      })
    );

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.stop();
    });

    expect(onStop).toHaveBeenCalled();
  });

  it('should prevent multiple starts', async () => {
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: 'mic',
        mode: 'spectrum',
      })
    );

    await act(async () => {
      await result.current.start();
    });

    const getUserMediaCallCount = (
      global.navigator.mediaDevices.getUserMedia as MockedFunction<typeof navigator.mediaDevices.getUserMedia>
    ).mock.calls.length;

    // Try to start again
    await act(async () => {
      await result.current.start();
    });

    // getUserMedia should not be called again
    expect(
      (global.navigator.mediaDevices.getUserMedia as MockedFunction<typeof navigator.mediaDevices.getUserMedia>).mock.calls.length
    ).toBe(getUserMediaCallCount);
  });

  it('should handle different modes', async () => {
    const modes = ['waveform', 'spectrum', 'loudness'] as const;

    for (const mode of modes) {
      const { result, unmount } = renderHook(() =>
        useAudioVisualizer({
          source: 'mic',
          mode,
        })
      );

      // Create and attach canvas element with proper attributes
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', '800');
      canvas.setAttribute('height', '200');
      canvas.width = 800;
      canvas.height = 200;
      
      act(() => {
        (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
      });

      // Wait for layout effects to complete
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      await act(async () => {
        await result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
      expect(getRenderer).toHaveBeenCalledWith(mode);

      act(() => {
        result.current.stop();
      });

      unmount();
    }
  });

  it('should handle audio element source', async () => {
    const audioElement = document.createElement('audio');
    audioElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: audioElement,
        mode: 'spectrum',
      })
    );

    // Create and attach canvas element with proper attributes
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '200');
    canvas.width = 800;
    canvas.height = 200;
    
    act(() => {
      (result.current.canvasRef as RefObject<HTMLCanvasElement>).current = canvas;
    });

    // Wait for layout effects to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.stop();
    });
  });

  it('should handle audio element without source error', async () => {
    const audioElement = document.createElement('audio');
    // No src set
    
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useAudioVisualizer({
        source: audioElement,
        mode: 'spectrum',
        onError,
      })
    );

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });
});

