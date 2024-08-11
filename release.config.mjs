/** @type {import('semantic-release').GlobalConfig} */
const config = {
  branches: [
    // default:
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'main',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    // added:
    { name: 'app-router', prerelease: true },
    { name: 'canary-*', prerelease: true, channel: 'canary' },
  ],
  // plugins: [
  //   [
  //     '@semantic-release/github',
  //     {
  //       successComment: false,
  //       failTitle: false,
  //     },
  //   ],
  // ],
}

export default config
