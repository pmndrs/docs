#!/bin/sh

main() {
  trap 'kill -9 0' SIGINT

  export _PORT="${_PORT:-60141}"

  export MDX="${MDX:-docs}"
  export NEXT_PUBLIC_LIBNAME="${NEXT_PUBLIC_LIBNAME:-Poimandres}"
  export DOCKER_IMAGE="${DOCKER_IMAGE:-ghcr.io/pmndrs/docs:latest}"
  export MDX_BASEURL="http://localhost:$_PORT"
  
  # Run build using shared build script
  ./build.sh "$MDX" "$DOCKER_IMAGE"

  kill $(lsof -ti:"$_PORT")
  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
  npx -y serve "$MDX/out" &

  wait
}

main
