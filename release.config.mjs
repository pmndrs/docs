/** @type {import('semantic-release').GlobalConfig} */
const config = {
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
