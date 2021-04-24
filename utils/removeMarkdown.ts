export default function removeMarkdown(md: string) {
  return (
    md
      .replace(/<[^>]*>/g, '')
      .replace(/^[=\-]{2,}\s*$/g, '')
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, '$1')

      .replace(/^\s{0,3}>\s?/g, '')
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(/^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm, '$1$2$3')
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/\*{2}/g, '')
      .replace(/\`{3}(js|ts)x?/g, ' ')
      .replace(/\`/g, '')
      .replace(/(^.*\[|\].*$)/g, '')
      .replace(/(?:\r\n|\r|\n)/g, ' ')

      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, '\n\n')
  )
}
