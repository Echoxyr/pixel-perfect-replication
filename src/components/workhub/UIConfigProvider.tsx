import { useEffect } from 'react';
import { useUser, SIDEBAR_COLORS } from '@/contexts/UserContext';

// This component applies UI config as CSS custom properties to the document
export function UIConfigProvider({ children }: { children: React.ReactNode }) {
  const { uiConfig, themeColor } = useUser();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply button border radius - use safe value to prevent text overflow
    const safeRadius = uiConfig.buttonBorderRadius === '9999px' ? '2rem' : uiConfig.buttonBorderRadius;
    root.style.setProperty('--ui-button-radius', safeRadius);
    root.style.setProperty('--radius', safeRadius);
    
    // Apply card style
    root.classList.remove('ui-card-flat', 'ui-card-elevated', 'ui-card-glass');
    root.classList.add(`ui-card-${uiConfig.cardStyle}`);
    
    switch (uiConfig.cardStyle) {
      case 'flat':
        root.style.setProperty('--ui-card-shadow', 'none');
        root.style.setProperty('--ui-card-border', '1px solid hsl(var(--border))');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card))');
        root.style.setProperty('--ui-card-backdrop', 'none');
        break;
      case 'elevated':
        root.style.setProperty('--ui-card-shadow', '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.1)');
        root.style.setProperty('--ui-card-border', '1px solid hsl(var(--border) / 0.5)');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card))');
        root.style.setProperty('--ui-card-backdrop', 'none');
        break;
      case 'glass':
        root.style.setProperty('--ui-card-shadow', '0 8px 32px rgba(0,0,0,0.12)');
        root.style.setProperty('--ui-card-border', '1px solid hsl(var(--border) / 0.2)');
        root.style.setProperty('--ui-card-bg', 'hsl(var(--card) / 0.7)');
        root.style.setProperty('--ui-card-backdrop', 'blur(16px) saturate(180%)');
        break;
    }
    
    // Apply button shadow
    root.classList.toggle('ui-button-shadow', uiConfig.buttonShadow);
    if (uiConfig.buttonShadow) {
      root.style.setProperty('--ui-button-shadow', '0 4px 12px -2px hsl(var(--primary) / 0.3)');
    } else {
      root.style.setProperty('--ui-button-shadow', 'none');
    }
    
    // Apply glass effect globally
    root.classList.toggle('ui-glass-enabled', uiConfig.glassEffect);
    if (uiConfig.glassEffect) {
      root.style.setProperty('--ui-glass-blur', 'blur(16px)');
      root.style.setProperty('--ui-glass-opacity', '0.85');
    } else {
      root.style.setProperty('--ui-glass-blur', 'none');
      root.style.setProperty('--ui-glass-opacity', '1');
    }
    
    // Apply animations
    root.classList.toggle('reduce-motion', !uiConfig.animationsEnabled);
    root.classList.toggle('ui-animations-enabled', uiConfig.animationsEnabled);
    
    // Apply hover glow
    root.classList.toggle('ui-hover-glow', uiConfig.hoverGlow);
    if (uiConfig.hoverGlow) {
      root.style.setProperty('--ui-hover-glow', '0 0 25px -5px hsl(var(--primary) / 0.5)');
    } else {
      root.style.setProperty('--ui-hover-glow', 'none');
    }
    
    // Apply sidebar color
    const sidebarColorConfig = SIDEBAR_COLORS.find(c => c.id === uiConfig.sidebarColor);
    if (sidebarColorConfig) {
      root.style.setProperty('--sidebar-background', sidebarColorConfig.background);
      root.style.setProperty('--sidebar-foreground', sidebarColorConfig.foreground);
    }
    
  }, [uiConfig, themeColor]);

  return <>{children}</>;
}
