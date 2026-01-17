#!/bin/sh

main() {
  trap 'kill -9 0' SIGINT

  export _PORT="${_PORT:-60141}"

  export MDX="${MDX:-docs}"
  export NEXT_PUBLIC_LIBNAME="${NEXT_PUBLIC_LIBNAME:-Poimandres}"
  export DOCKER_IMAGE="${DOCKER_IMAGE:-ghcr.io/pmndrs/docs}"
  export DOCKER_TAG="${DOCKER_TAG:-2.20.1}"
  
  rm -rf "$MDX/out"

  docker run --rm --init -t \
    -v "./$MDX":/app/docs \
    -e MDX \
    -e NEXT_PUBLIC_LIBNAME \
    -e NEXT_PUBLIC_LIBNAME_SHORT \
    -e NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL \
    -e NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF \
    -e BASE_PATH \
    -e DIST_DIR="$MDX/out$BASE_PATH" \
    -e OUTPUT=export \
    -e HOME_REDIRECT \
    -e MDX_BASEURL=http://localhost:$_PORT \
    -e SOURCECODE_BASEURL \
    -e EDIT_BASEURL \
    -e NEXT_PUBLIC_URL \
    -e ICON \
    -e LOGO \
    -e GITHUB \
    -e DISCORD \
    -e THEME_PRIMARY \
    -e THEME_SCHEME \
    -e THEME_CONTRAST \
    -e THEME_NOTE \
    -e THEME_TIP \
    -e THEME_IMPORTANT \
    -e THEME_WARNING \
    -e THEME_CAUTION \
    -e CONTRIBUTORS_PAT \
    $DOCKER_IMAGE:$DOCKER_TAG npm run build

  kill $(lsof -ti:"$_PORT")
  npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &
  npx -y serve "$MDX/out" &

  wait
}

main