#!/usr/bin/env node

// $ node bin/build.mjs ~/code/pmndrs/react-three-fiber/docs

import { spawn } from 'node:child_process'
import minimist from 'minimist'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

var argv = minimist(process.argv.slice(2))
console.log('argv=', argv)

const mdx = argv._[0]
if (!mdx) {
  console.error('Please provide the mdx folder as the first argument.')
  process.exit(1)
}

// const __filename = fileURLToPath(import.meta.url); // Converts the URL to a file path
// const __dirname = dirname(__filename); // Gets the directory name
// const viteConfigPath = resolve(__dirname, "../src/vite.config.build.ts");
// // console.log("viteConfigPath=", viteConfigPath);

const cmd = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  env: {
    MDX: mdx,
    NEXT_PUBLIC_LIBNAME: argv.libname,
    ...process.env,
  },
})

cmd.on('exit', (code) => {
  if (code !== 0) {
    console.error('Build failed with error')
    process.exit(1)
  }

  console.log('Build completed successfully.')
})
