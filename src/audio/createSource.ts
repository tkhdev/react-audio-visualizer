// Global WeakMap to track audio elements and their source nodes per AudioContext
// This allows multiple AudioContexts to use the same audio element
// Key: audioElement, Value: Map<AudioContext, MediaElementAudioSourceNode>
const audioElementSourceMap = new WeakMap<HTMLAudioElement, Map<AudioContext, MediaElementAudioSourceNode>>();

export async function createMicSource(
  context: AudioContext,
  deviceId?: string
): Promise<{ source: MediaStreamAudioSourceNode; stream: MediaStream }> {
  const constraints: MediaStreamConstraints = {
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const source = context.createMediaStreamSource(stream);

  return { source, stream };
}

export function createAudioElementSource(
  context: AudioContext,
  audioElement: HTMLAudioElement
): MediaElementAudioSourceNode {
  if (!audioElement || !(audioElement instanceof HTMLMediaElement)) {
    throw new Error('Audio element is not available or not a valid HTMLMediaElement');
  }
  
  // Get or create the context map for this audio element
  let contextMap = audioElementSourceMap.get(audioElement);
  if (!contextMap) {
    contextMap = new Map<AudioContext, MediaElementAudioSourceNode>();
    audioElementSourceMap.set(audioElement, contextMap);
  }
  
  // Check if this context already has a source node for this audio element
  const existingSource = contextMap.get(context);
  if (existingSource) {
    return existingSource;
  }
  
  // Create new source node and store it for this context
  const source = context.createMediaElementSource(audioElement);
  contextMap.set(context, source);
  return source;
}

