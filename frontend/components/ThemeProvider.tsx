'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type React from 'react';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const {
    attribute = 'class',
    defaultTheme = 'light',
    enableSystem = false,
    disableTransitionOnChange = true,
    ...restProps
  } = props;

  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...restProps}
    >
      {children}
    </NextThemesProvider>
  );
}
