'use client';

import { Toaster } from 'sonner';

/**
 * Toast Provider - Wraps app with Sonner toaster
 */

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={true}
      duration={4000}
    />
  );
}
