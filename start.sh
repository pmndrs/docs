#!/bin/sh

trap 'kill -9 0' SIGINT

rm -rf out

export PORT=${PORT:-3000}
export _PORT=$(node -e 'const s = require("net").createServer().listen(0, () => { console.log(String(s.address().port)); s.close() })')

export MDX=docs
export NEXT_PUBLIC_LIBNAME="docs"
export NEXT_PUBLIC_LIBNAME_SHORT="docs"
export BASE_PATH=
export HOME_REDIRECT=
export MDX_BASEURL=http://localhost:$_PORT
export SOURCECODE_BASEURL=
export EDIT_BASEURL=
export NEXT_PUBLIC_URL=
export ICON=
export LOGO=gutenberg.jpg
export GITHUB=https://github.com/pmndrs/docs
export DISCORD=https://discord.com/channels/740090768164651008/1264328004172255393
export CONTRIBUTORS_PAT=

# The static export is the CLI's, built from this checkout: the same one the package publishes
pnpm run build:cli || exit 1
node bin/pmndrs-docs.mjs build $MDX out --format website || exit 1

npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &

npx serve out -p $PORT &

wait
