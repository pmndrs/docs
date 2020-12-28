
import setValue from 'set-value'

// TODO Add link to original code
export function importAll(r) {
  return r.keys().map((fileName) => ({
    fileName,
    module: r(fileName),
  }));
}

export function createPageList(files) {
  return importAll(files).reduce((acc, cur) => {
    let slug = cur.fileName.substr(2).replace(/\.mdx$/, "");

    return {
      ...acc,
      [slug]: { 
        ...cur.module.default, 
        href: `${slug === "index" ? "/" : `/${slug}`}` 
      },
    };
  }, {});
}

export function getAllFiles() {
  // @ts-ignore This is ignored because of `context`
  return createPageList( require.context(`../pages/docs/`, true, /\.mdx$/) )
}

type Files = Record<string, {
  isMDXComponent: boolean,
  href: string
}>

function makeNav(files: Files) {

  const tree = {}
  
  Object.entries(files).forEach(([key, value]) => {
    const [lib, ...rest] = key.split('/')
    setValue(tree, `${lib}${rest.length === 1 ? '..' : "."}${rest.join('.')}`, value)
  })

  return tree
}

export default makeNav
