export async function concatenateAudioBlobs(
  segments: { blob: Blob; delayMs: number }[]
): Promise<Blob> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // 1. Decode all blobs into AudioBuffers
  const buffers: { buffer: AudioBuffer; delayMs: number }[] = [];
  for (const seg of segments) {
    const arrayBuffer = await seg.blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    buffers.push({ buffer: audioBuffer, delayMs: seg.delayMs });
  }

  // 2. Calculate total duration in seconds
  let totalDuration = 0;
  for (const item of buffers) {
    totalDuration += item.buffer.duration + (item.delayMs / 1000);
  }
  
  // Fallback if empty
  if (totalDuration === 0) {
    totalDuration = 0.1;
  }

  // Use the highest sample rate among buffers, or default to 44100
  const sampleRate = buffers.length > 0 ? buffers[0].buffer.sampleRate : 44100;
  
  // 3. Create OfflineAudioContext to render the combined audio
  // We use 2 channels (stereo) for safety, though TTS is often mono.
  const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);
  
  let currentTime = 0;
  for (const item of buffers) {
    const source = offlineCtx.createBufferSource();
    source.buffer = item.buffer;
    source.connect(offlineCtx.destination);
    source.start(currentTime);
    currentTime += item.buffer.duration + (item.delayMs / 1000);
  }

  // 4. Render
  const renderedBuffer = await offlineCtx.startRendering();

  // 5. Convert rendered AudioBuffer to WAV Blob
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  return wavBlob;
}

// Helper to convert AudioBuffer to WAV format
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArray], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
