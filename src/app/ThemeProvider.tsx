'use client'

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider(props: ThemeProviderProps) {
  return <NextThemesProvider {...props} />
}
