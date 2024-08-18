const themes = {
  development: {
    bg: '#66bf3b',
    txt: 'white',
  },
  production: {
    bg: '#f10055',
    txt: 'white',
  },
}

const w = 100
const h = 100

type Options = {
  env: keyof typeof themes
  /** number between 0-100 */
  shift?: number
}

export const svg = (emoji: string, { env, shift }: Options = { env: 'production', shift: 0 }) => {
  const { bg, txt } = themes[env]

  return `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="${w}" height="${h}">
    
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <text x="${w / 2}" y="${
        h / 2
      }" font-size="100" dominant-baseline="central" baseline-shift="-${shift}%" text-anchor="middle">${emoji}</text>
    </svg>
    
    <style>
    :root {
      --bg: ${bg};
      --txt: ${txt};
    }
    .badge {fill: var(--bg);}
    .shape {fill: var(--txt);}
    </style>
  </svg>
  `
}
