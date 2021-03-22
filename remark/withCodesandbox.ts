const withCodesandbox = () =>
  function withCodesandbox(tree) {
    // @ts-ignore
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i]
      if (node.type === 'jsx' && node.value.match(/iframe/) && node.value.match(/codesandbox/)) {
        const url = node.value.match(/(?<=src=").*?(?=[\"])/)[0]
        node.value = `<Codesandbox url={"${url}"} />`
      }
    }
  }

export default withCodesandbox
