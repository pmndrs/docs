/** @type {import('semantic-release').GlobalConfig} */
const config = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'main',
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
    { name: 'canary-*', prerelease: true },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      // https://github.com/semantic-release/semantic-release/issues/2204#issuecomment-2154938064
      {
        successComment: false,
        failTitle: false,
      },
    ],
  ],
}

export default config
