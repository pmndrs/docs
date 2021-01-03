import setValue from 'set-value'

function makeNav(files: string[]) {
  const tree = {}

  files.forEach((value) => {
    const [lib, ...rest] = value.split('/')
    setValue(tree, `${lib}${rest.length === 1 ? '..' : '.'}${rest.join('.')}`, value)
  })

  return tree
}

export default makeNav
