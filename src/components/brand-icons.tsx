import { createLucideIcon } from 'lucide-react'

//
// Brand marks, which lucide does not ship: its v1 dropped the few brand logos it had.
//
// Built with `createLucideIcon`, so they take the same props as any lucide icon (`size`,
// `strokeWidth`, `className`…). The paths are Tabler's `brand-github` and `brand-discord` (MIT,
// https://tabler.io/icons), drawn on the same 24px grid with the same 2px round stroke.
//

export const GitHubIcon = createLucideIcon('github', [
  [
    'path',
    {
      d: 'M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5',
      key: 'github-mark',
    },
  ],
])

export const DiscordIcon = createLucideIcon('discord', [
  ['path', { d: 'M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0', key: 'discord-left-eye' }],
  ['path', { d: 'M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0', key: 'discord-right-eye' }],
  [
    'path',
    {
      d: 'M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3',
      key: 'discord-head',
    },
  ],
  ['path', { d: 'M7 16.5c3.5 1 6.5 1 10 0', key: 'discord-mouth' }],
])

// Lucide's own `codesandbox` mark, as it shipped up to v0 (ISC, https://lucide.dev), before v1
// dropped it with the other brand logos.
export const CodesandboxIcon = createLucideIcon('codesandbox', [
  [
    'path',
    {
      d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      key: 'codesandbox-box',
    },
  ],
  ['polyline', { points: '7.5 4.21 12 6.81 16.5 4.21', key: 'codesandbox-top' }],
  ['polyline', { points: '7.5 19.79 7.5 14.6 3 12', key: 'codesandbox-left' }],
  ['polyline', { points: '21 12 16.5 14.6 16.5 19.79', key: 'codesandbox-right' }],
  ['polyline', { points: '3.27 6.96 12 12.01 20.73 6.96', key: 'codesandbox-middle' }],
  ['line', { x1: '12', x2: '12', y1: '22.08', y2: '12', key: 'codesandbox-axis' }],
])
