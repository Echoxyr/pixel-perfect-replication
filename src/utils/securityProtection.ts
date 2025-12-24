/**
 * E-GEST Security Protection Module
 * Copyright © 2024 E-GEST S.r.l. - All Rights Reserved
 * Unauthorized copying, modification, distribution, or use of this software,
 * via any medium, is strictly prohibited without express written permission.
 * 
 * This software is proprietary and confidential.
 * Patent Pending - Trade Secret Protected
 */

// Obfuscated fingerprint for tracking
const _0x4f8b = ['w', 'a', 'r', 'n', 'i', 'n', 'g'];
const _0x2c1a = (s: string) => btoa(s).split('').reverse().join('');

// Security initialization flag
let securityInitialized = false;

// DevTools detection
let devtoolsOpen = false;

const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      onDevToolsOpen();
    }
  } else {
    devtoolsOpen = false;
  }
};

const onDevToolsOpen = () => {
  console.clear();
  console.log(
    '%c⚠️ ATTENZIONE - WARNING ⚠️',
    'color: red; font-size: 40px; font-weight: bold; text-shadow: 2px 2px 4px #000;'
  );
  console.log(
    '%cQuesto software è protetto da copyright.',
    'color: red; font-size: 16px;'
  );
  console.log(
    '%c© 2024 E-GEST S.r.l. - Tutti i diritti riservati.',
    'color: red; font-size: 14px;'
  );
  console.log(
    '%cLa copia, modifica o distribuzione non autorizzata è illegale e perseguibile legalmente.',
    'color: red; font-size: 14px;'
  );
  console.log(
    '%cUnauthorized copying, modification, or distribution is illegal and subject to prosecution.',
    'color: red; font-size: 12px; font-style: italic;'
  );
  
  // Log security event (would send to backend in production)
  logSecurityEvent('devtools_opened');
};

const logSecurityEvent = (event: string) => {
  const fingerprint = generateFingerprint();
  const timestamp = new Date().toISOString();
  
  // In production, this would send to a secure endpoint
  const securityLog = {
    event,
    timestamp,
    fingerprint,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  // Store locally for now
  try {
    const logs = JSON.parse(localStorage.getItem('_sec_log') || '[]');
    logs.push(securityLog);
    localStorage.setItem('_sec_log', JSON.stringify(logs.slice(-50)));
  } catch {
    // Silently fail
  }
};

const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('E-GEST-FP', 2, 2);
  }
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');
  
  return _0x2c1a(data).slice(0, 32);
};

// Disable common copy methods
const disableCopyMethods = () => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    logSecurityEvent('right_click_blocked');
    return false;
  });

  // Disable keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      logSecurityEvent('view_source_blocked');
      return false;
    }
    // Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      logSecurityEvent('save_blocked');
      return false;
    }
    // Ctrl+Shift+I or F12 (Dev Tools)
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
      e.preventDefault();
      logSecurityEvent('devtools_shortcut_blocked');
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      logSecurityEvent('console_shortcut_blocked');
      return false;
    }
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      logSecurityEvent('inspect_blocked');
      return false;
    }
    // Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      logSecurityEvent('print_blocked');
      return false;
    }
  });

  // Disable text selection on sensitive elements
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-protected="true"]')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable drag
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable copy
  document.addEventListener('copy', (e) => {
    const selection = window.getSelection()?.toString() || '';
    if (selection.length > 50) {
      e.preventDefault();
      logSecurityEvent('copy_blocked');
      
      // Replace with copyright notice
      e.clipboardData?.setData('text/plain', 
        '© E-GEST S.r.l. - Contenuto protetto da copyright. La copia non è autorizzata.'
      );
      return false;
    }
  });
};

// Add watermark to page
const addWatermark = () => {
  const watermark = document.createElement('div');
  watermark.id = 'egest-watermark';
  watermark.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: rgba(128, 128, 128, 0.3);
    pointer-events: none;
    z-index: 9999;
    user-select: none;
    font-family: monospace;
  `;
  watermark.textContent = '© E-GEST S.r.l. - Proprietary Software';
  document.body.appendChild(watermark);
};

// Protect against iframe embedding
const preventIframeEmbed = () => {
  if (window.top !== window.self) {
    // We're in an iframe
    logSecurityEvent('iframe_embed_detected');
    
    // Try to break out
    try {
      window.top!.location.href = window.self.location.href;
    } catch {
      // Can't break out, hide content
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a2e;color:white;font-family:system-ui;">
          <div style="text-align:center;">
            <h1>⚠️ Accesso Non Autorizzato</h1>
            <p>Questo contenuto non può essere visualizzato in un iframe.</p>
            <p style="font-size:12px;color:#888;">© E-GEST S.r.l. - Software Protetto</p>
          </div>
        </div>
      `;
    }
  }
};

// Console protection
const protectConsole = () => {
  // Clear console periodically
  setInterval(() => {
    if (devtoolsOpen) {
      console.clear();
      console.log(
        '%c🔒 E-GEST Security Active',
        'color: #22c55e; font-size: 14px; font-weight: bold;'
      );
    }
  }, 2000);

  // Override console methods in production
  if (import.meta.env.PROD) {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn'].forEach((method) => {
      (console as any)[method] = noop;
    });
  }
};

// Main initialization
export const initSecurityProtection = () => {
  if (securityInitialized) return;
  securityInitialized = true;

  // Only enable in production or when explicitly requested
  const enableProtection = import.meta.env.PROD || localStorage.getItem('_security_enabled') === 'true';
  
  if (!enableProtection) {
    console.log('🔓 Security protection disabled in development mode');
    return;
  }

  // Initialize all protections
  disableCopyMethods();
  addWatermark();
  preventIframeEmbed();
  protectConsole();

  // Start DevTools detection
  setInterval(detectDevTools, 1000);

  // Add security meta tags
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow, noarchive, nosnippet, noimageindex';
  document.head.appendChild(meta);

  // Log initialization
  logSecurityEvent('security_initialized');

  console.log(
    '%c🔒 E-GEST Security Protection Active',
    'color: #22c55e; font-size: 16px; font-weight: bold;'
  );
  console.log(
    '%c© 2024 E-GEST S.r.l. - All Rights Reserved',
    'color: #888; font-size: 12px;'
  );
};

// Export for testing
export const getSecurityStatus = () => ({
  initialized: securityInitialized,
  devtoolsOpen,
  fingerprint: generateFingerprint(),
});
