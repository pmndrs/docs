#!/bin/sh

trap 'kill -9 0' SIGINT

# `next dev` leaves types pointing at `src/app/api`, which the export build moves aside
rm -rf out .next/dev/types

export PORT=${PORT:-3000}
export _PORT=$(node -e 'const s = require("net").createServer().listen(0, () => { console.log(String(s.address().port)); s.close() })')

export MDX=docs
export NEXT_PUBLIC_LIBNAME="Poimandres"
export NEXT_PUBLIC_LIBNAME_SHORT="pmndrs"
export BASE_PATH=
export DIST_DIR=
export OUTPUT=export
export HOME_REDIRECT=
export MDX_BASEURL=http://localhost:$_PORT
export SOURCECODE_BASEURL=
export EDIT_BASEURL=
export NEXT_PUBLIC_URL=
export ICON=
export LOGO=gutenberg.jpg
export GITHUB=https://github.com/pmndrs/docs
export DISCORD=https://discord.com/channels/740090768164651008/1264328004172255393
export THEME_PRIMARY="#323e48"
export THEME_SCHEME="tonalSpot"
export THEME_CONTRAST="0"
export THEME_NOTE="#1f6feb"
export THEME_TIP="#238636"
export THEME_IMPORTANT="#8957e5"
export THEME_WARNING="#d29922"
export THEME_CAUTION="#da3633"
export THEME_STORYBOOK="#ff4785"
export THEME_NPM="#cb3837"
export THEME_CHROMATIC="#fc521f"
export CONTRIBUTORS_PAT=

pnpm run build

npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &

npx serve out -p $PORT &

wait
