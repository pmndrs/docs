/**
 * A link that opens a chatbot on a documentation page, e.g. `https://claude.ai/new?q=...`.
 *
 * Same base URLs and prompt as the "Open in ChatGPT/Claude" items of ui.shadcn.com
 * (`apps/v4/components/docs-copy-page.tsx`).
 *
 * @param base - the chatbot's "new conversation" URL, e.g. `https://chatgpt.com`
 * @param url - the absolute URL of the documentation page
 * @param libname - the library the docs are about (`NEXT_PUBLIC_LIBNAME`), when known
 */
export function getPromptUrl(base: string, url: string, libname?: string) {
  const subject = libname ? `this ${libname} documentation` : 'this documentation'
  const prompt = `I’m looking at ${subject}: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`

  return `${base}?q=${encodeURIComponent(prompt)}`
}
