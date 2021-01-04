const withPrismHighlighting = () =>
  function withPrismHighlighting(tree) {
    // @ts-ignore
    for (let i = 0; i < tree.children.length; i++) {
      const node = tree.children[i]
      if (node.type === 'code') {
        node.type = 'jsx'

        const val = node.value

        console.log(val)

        node.value =
          '<div className="border">' +
          '<PrismCode component="pre" className="language-${node.lang}"> ' +
          val +
          '</PrismCode>' +
          '</div>'
      }
    }
  }

export default withPrismHighlighting
