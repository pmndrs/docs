#!/usr/bin/env bash
#
# Dev server: MDX folder served on $_PORT (images resolve against it) + `next dev` on $PORT.
#
#   PORT   site port (default: 3000)
#   _PORT  MDX server port (default: a free port picked at runtime)

# Stop every process started below, with their own children (npx -> serve,
# pnpm -> next -> workers). Signals go to these pids only, never to a process
# group, so whoever launched this script is left alone.
kill_tree() {
  local pid=$1
  local child
  for child in $(pgrep -P "$pid"); do
    kill_tree "$child"
  done
  kill -TERM "$pid" 2>/dev/null
}
pids=""
cleanup() {
  trap - INT TERM
  for pid in $pids; do
    kill_tree "$pid"
  done
  wait
}
# 130/143: the usual exit codes for "stopped by SIGINT/SIGTERM"
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

free_port() {
  node -e 'const s = require("net").createServer(); s.listen(0, () => { console.log(s.address().port); s.close() })'
}

export PORT="${PORT:-3000}"
export _PORT="${_PORT:-$(free_port)}"

export MDX=docs
export NEXT_PUBLIC_LIBNAME="Poimandres"
export NEXT_PUBLIC_LIBNAME_SHORT="pmndrs"
export BASE_PATH=
export DIST_DIR=
export OUTPUT=
export HOME_REDIRECT=
export MDX_BASEURL=http://localhost:$_PORT
export SOURCECODE_BASEURL="vscode://file$(pwd)"
export EDIT_BASEURL="vscode://file$(pwd)/docs"
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
export CONTRIBUTORS_PAT=

npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
pids="$pids $!"

# `next dev` reads $PORT
pnpm run dev &
site=$!
pids="$pids $site"

# If the site server stops on its own, take the MDX server down with it
wait $site
status=$?
cleanup
exit $status
