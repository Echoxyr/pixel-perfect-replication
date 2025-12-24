/**
 * E-GEST Security Wrapper Component
 * Copyright © 2024 E-GEST S.r.l. - All Rights Reserved
 */

import { useEffect, ReactNode } from 'react';
import { initSecurityProtection } from '@/utils/securityProtection';

interface SecurityWrapperProps {
  children: ReactNode;
}

export function SecurityWrapper({ children }: SecurityWrapperProps) {
  useEffect(() => {
    // Initialize security protection
    initSecurityProtection();

    // Add CSS to prevent selection on protected elements
    const style = document.createElement('style');
    style.textContent = `
      [data-protected="true"] {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      
      /* Prevent image dragging */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none;
      }
      
      /* Make images clickable again for interactive elements */
      button img, a img, [role="button"] img {
        pointer-events: auto;
      }

      /* Prevent text selection highlight color giving away content */
      ::selection {
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
      }

      /* Print protection */
      @media print {
        body * {
          visibility: hidden !important;
        }
        body::after {
          content: "© E-GEST S.r.l. - Stampa non autorizzata";
          visibility: visible !important;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          color: red;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div data-protected="true" className="security-wrapper">
      {children}
    </div>
  );
}
