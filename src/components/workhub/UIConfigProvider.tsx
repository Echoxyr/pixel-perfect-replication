import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';

// This component applies UI config as CSS custom properties to the document
export function UIConfigProvider({ children }: { children: React.ReactNode }) {
  const { uiConfig, themeColor } = useUser();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply button border radius
    root.style.setProperty('--ui-button-radius', uiConfig.buttonBorderRadius);
    
    // Apply card style
    switch (uiConfig.cardStyle) {
      case 'flat':
        root.style.setProperty('--ui-card-shadow', 'none');
        root.style.setProperty('--ui-card-border', '1px solid hsl(var(--border))');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card))');
        break;
      case 'elevated':
        root.style.setProperty('--ui-card-shadow', '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)');
        root.style.setProperty('--ui-card-border', 'none');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card))');
        break;
      case 'glass':
        root.style.setProperty('--ui-card-shadow', '0 8px 32px rgba(0,0,0,0.1)');
        root.style.setProperty('--ui-card-border', '1px solid hsl(var(--border) / 0.3)');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card) / 0.8)');
        break;
    }
    
    // Apply button shadow
    if (uiConfig.buttonShadow) {
      root.style.setProperty('--ui-button-shadow', '0 4px 6px -1px rgba(0,0,0,0.1)');
    } else {
      root.style.setProperty('--ui-button-shadow', 'none');
    }
    
    // Apply glass effect
    if (uiConfig.glassEffect) {
      root.style.setProperty('--ui-glass-blur', 'blur(12px)');
      root.style.setProperty('--ui-glass-opacity', '0.8');
    } else {
      root.style.setProperty('--ui-glass-blur', 'none');
      root.style.setProperty('--ui-glass-opacity', '1');
    }
    
    // Apply animations
    if (uiConfig.animationsEnabled) {
      root.classList.remove('reduce-motion');
    } else {
      root.classList.add('reduce-motion');
    }
    
    // Apply hover glow
    if (uiConfig.hoverGlow) {
      root.style.setProperty('--ui-hover-glow', '0 0 20px -5px hsl(var(--primary) / 0.4)');
    } else {
      root.style.setProperty('--ui-hover-glow', 'none');
    }
    
  }, [uiConfig, themeColor]);

  return <>{children}</>;
}
