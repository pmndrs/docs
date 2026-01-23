trap 'kill -9 0' SIGINT

rm -rf out

export _PORT=60141

export MDX=docs
export NEXT_PUBLIC_LIBNAME="Poimandres"
export NEXT_PUBLIC_LIBNAME_SHORT="pmndrs"
export NEXT_PUBLIC_LIBNAME_DOTSUFFIX_LABEL="docs"
export NEXT_PUBLIC_LIBNAME_DOTSUFFIX_HREF="https://docs.pmnd.rs"
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
export CONTRIBUTORS_PAT=

pnpm run build

kill $(lsof -ti:"$_PORT")
npx serve $MDX -p $_PORT --no-port-switching --no-clipboard &

npx serve out &

wait