#!/bin/sh

main() {
  trap 'kill -9 0' SIGINT

  export PORT="${PORT:-3000}"
  export _PORT="${_PORT:-$(node -e 'const s = require("net").createServer().listen(0, () => { console.log(String(s.address().port)); s.close() })')}"
  export VERSION="${VERSION:-latest}"

  export MDX="${MDX:-docs}"
  export NEXT_PUBLIC_LIBNAME="${NEXT_PUBLIC_LIBNAME:-Poimandres}"
  # Relative assets resolve against the MDX folder, served below on the same port
  export MDX_BASEURL="${MDX_BASEURL:-http://localhost:$_PORT}"

  rm -rf "$MDX/out"

  # Every other option is read straight from the environment — same process, nothing to forward
  npx -y "@pmndrs/docs@$VERSION" build "$MDX" "$MDX/out" --format website || exit 1

  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &

  npx -y serve "$MDX/out" -p $PORT &

  wait
}

main
