import { useEffect, useCallback, useRef } from 'react';

// Preload audio buffers for immediate playback
let audioContext: AudioContext | null = null;
let clickBuffer: AudioBuffer | null = null;
let notificationBuffer: AudioBuffer | null = null;

// Create a subtle click sound buffer
const createClickBuffer = async (ctx: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = ctx.sampleRate;
  const duration = 0.03; // 30ms - very short
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    // Sharp attack, quick decay - sounds like a mechanical click
    const envelope = Math.exp(-t * 150);
    const frequency = 2000 + Math.random() * 500;
    data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.15;
  }
  
  return buffer;
};

// Create a pleasant notification sound
const createNotificationBuffer = async (ctx: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = ctx.sampleRate;
  const duration = 0.25;
  const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    // Two-tone notification (like a gentle "ding")
    const envelope = Math.exp(-t * 8);
    const freq1 = 880; // A5
    const freq2 = 1320; // E6
    const tone1 = Math.sin(2 * Math.PI * freq1 * t) * (t < 0.1 ? 1 : 0);
    const tone2 = Math.sin(2 * Math.PI * freq2 * t) * (t >= 0.08 ? 1 : 0);
    data[i] = (tone1 + tone2) * envelope * 0.08;
  }
  
  return buffer;
};

// Initialize audio context and buffers
const initAudio = async () => {
  if (audioContext) return;
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    clickBuffer = await createClickBuffer(audioContext);
    notificationBuffer = await createNotificationBuffer(audioContext);
  } catch (e) {
    console.warn('Audio initialization failed:', e);
  }
};

// Play a sound immediately
const playSound = (buffer: AudioBuffer | null) => {
  if (!audioContext || !buffer) return;
  
  // Resume context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
};

// Export play functions for external use
export const playClickSound = () => playSound(clickBuffer);
export const playNotificationSound = () => playSound(notificationBuffer);

export function useClickSound() {
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize on first user interaction
    const handleInteraction = async () => {
      if (!initialized.current) {
        initialized.current = true;
        await initAudio();
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    // Handle click events globally
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is interactive
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[role="option"]') ||
        target.closest('[data-clickable]') ||
        target.closest('.cursor-pointer') ||
        target.classList.contains('cursor-pointer');

      if (isInteractive && initialized.current) {
        playClickSound();
      }
    };

    // Use mousedown for faster response
    document.addEventListener('mousedown', handleClick, true);

    return () => {
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, []);

  const playClick = useCallback(() => {
    playClickSound();
  }, []);

  const playNotification = useCallback(() => {
    playNotificationSound();
  }, []);

  return { playClick, playNotification };
}
