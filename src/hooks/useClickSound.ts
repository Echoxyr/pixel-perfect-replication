import { useEffect, useCallback, useRef } from 'react';

// Create a simple click sound using Web Audio API
const createClickSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };
};

export function useClickSound() {
  const playClickRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize the audio context on first user interaction
    const initAudio = () => {
      if (!playClickRef.current) {
        playClickRef.current = createClickSound();
      }
    };

    // Handle click events globally
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the clicked element is interactive
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[role="option"]') ||
        target.closest('[data-clickable]') ||
        target.closest('.cursor-pointer') ||
        target.classList.contains('cursor-pointer');

      if (isInteractive) {
        initAudio();
        playClickRef.current?.();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  const playClick = useCallback(() => {
    if (!playClickRef.current) {
      playClickRef.current = createClickSound();
    }
    playClickRef.current();
  }, []);

  return { playClick };
}
