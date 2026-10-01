'use client'

import { ClaudeIcon, OpenAIIcon } from '@/components/brand-icons'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDownIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  FileTextIcon,
  SquareTerminalIcon,
} from 'lucide-react'
import { useCopied } from '@/hooks/useCopied'
import { getPromptUrl } from '@/utils/promptUrl'
import { useSyncExternalStore } from 'react'

/**
 * The page origin, `null` while rendering on the server (and hydrating).
 */
function useOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => null,
  )
}

/**
 * Copies the markdown behind `markdownUrl`.
 *
 * The clipboard is handed a promise rather than the text: Safari only grants the clipboard
 * within the click, and the fetch would outlive it.
 */
async function copyMarkdown(markdownUrl: string) {
  const text = fetch(markdownUrl).then((res) => {
    if (!res.ok) throw new Error(`Cannot fetch ${markdownUrl}: ${res.status}`)
    return res.text()
  })

  try {
    const blob = text.then((text) => new Blob([text], { type: 'text/plain' }))
    await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })])
  } catch {
    // No `ClipboardItem` (older Firefox): the plain text API
    await navigator.clipboard.writeText(await text)
  }
}

/**
 * The page actions of a doc header: "Copy Page", and a menu to read the same markdown elsewhere.
 *
 * @param markdownUrl - the page as markdown, as a path on this site (`<basePath>/<path>.md`)
 * @param pageUrl - the page itself, as a path on this site (`<basePath>/<path>`)
 * @param absolutePageUrl - the same, absolute, when the build knows the site's public URL
 * @param libname - the library the docs are about, for the chatbot prompts
 * @param command - the CLI command opening this page, e.g. `npx @pmndrs/docs drei/loaders/gltf`
 */
export function CopyPage({
  markdownUrl,
  pageUrl,
  absolutePageUrl,
  libname,
  command,
}: {
  markdownUrl: string
  pageUrl: string
  absolutePageUrl?: string
  libname?: string
  command: string
}) {
  const [pageCopied, setPageCopied] = useCopied()
  const [commandCopied, setCommandCopied] = useCopied()

  // Chatbots need an absolute URL, which only the browser knows when the build was not told it
  const origin = useOrigin()
  let url: string | null = null
  if (absolutePageUrl) {
    url = absolutePageUrl
  } else if (origin) {
    url = `${origin}${pageUrl}`
  }

  const handleCopyPage = async () => {
    try {
      await copyMarkdown(markdownUrl)
      setPageCopied(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCommandCopied(true)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ButtonGroup>
      {/* Narrower than both buttons in full (9.2rem), the container (the caller's) gets the
          icon alone. The label stays for screen readers. */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyPage}
        title="Copy Page"
        className="@max-[9.25rem]:w-8 @max-[9.25rem]:px-0!"
      >
        {pageCopied ? (
          <ClipboardCheckIcon data-icon="inline-start" />
        ) : (
          <ClipboardIcon data-icon="inline-start" />
        )}
        <span className="@max-[9.25rem]:sr-only">Copy Page</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="outline" size="icon-sm" aria-label="More page actions" />}
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<a href={markdownUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <FileTextIcon />
              View as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem closeOnClick={false} onClick={handleCopyCommand} title={command}>
              {commandCopied ? <ClipboardCheckIcon /> : <SquareTerminalIcon />}
              {commandCopied ? 'Copied' : 'View in CLI'}
            </DropdownMenuItem>
            {url && (
              <>
                <DropdownMenuItem
                  render={
                    <a
                      href={getPromptUrl('https://chatgpt.com', url, libname)}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <OpenAIIcon />
                  Open in ChatGPT
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <a
                      href={getPromptUrl('https://claude.ai/new', url, libname)}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ClaudeIcon />
                  Open in Claude
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
