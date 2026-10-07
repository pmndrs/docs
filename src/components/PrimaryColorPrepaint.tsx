'use client'

import { PREPAINT_OVERRIDDEN_ATTRIBUTES } from '@/components/ThemeControlButton'
import { useContrastLevel, CONTRAST_LEVEL_KEY, CONTRAST_LEVELS } from '@/hooks/useContrastLevel'
import { useIsHydrated } from '@/hooks/useIsHydrated'
import { HEX_COLOR, PRIMARY_COLOR_KEY, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { SCHEME_KEY, SCHEMES, useScheme, type SchemeValue } from '@/hooks/useScheme'
import { useMtb } from 'material-theme-builder/react'
import { useEffect, useState } from 'react'

/**
 * The palette of the stored picks, as `Mtb` writes it, for the next page load to show it before
 * React runs: `{ color, contrast, scheme, signature, css }`
 */
const CACHE_KEY = `${PRIMARY_COLOR_KEY}:css`

/**
 * Set on `<html>` to the stored pick before the first paint: the swatch shows it until hydrated. When
 * it overrides the site's default, `PREPAINT_OVERRIDDEN_ATTRIBUTES.primaryColor` too
 */
export const PRIMARY_COLOR_PREPAINT_VAR = '--prepaint-primary-color'

const STYLE_ID = 'primary-color-prepaint'

// Where `Mtb` writes its palette: read back rather than computed again
const MTB_STYLE_ID = 'mcu-styles'

// Dragging in the native picker applies a palette on every move: only the last one is cached
const CACHE_DELAY = 500

type Cache = {
  /** The color, contrast and scheme the palette was made with: the reader's picks, or the defaults */
  color: string
  contrast: number
  scheme: SchemeValue
  /** The rest of the `Mtb` config the palette was made with */
  signature: string
  css: string
}

function writeCache(cache: Cache | null) {
  try {
    if (cache === null) localStorage.removeItem(CACHE_KEY)
    else localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage unavailable, or full: the next load shows the default palette until hydrated
  }
}

// A JS literal of `value`, safe inside a `<script>`
function literal(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

type PrepaintProps = {
  signature: string
  defaultPrimaryColor: string
  defaultContrastLevel: number
  defaultScheme: SchemeValue
}

/**
 * Run while the HTML is parsed, right after the `<style>` it fills: before the first paint. It
 * doesn't wait for React, nor for the palette to be computed again: it reads the one cached with
 * the stored picks, if made for this very config.
 *
 * What isn't picked is the default, as for `Mtb`: the cache was made with it too, and a change of
 * the site's default no longer matches it.
 *
 * Exported for its unit test only.
 */
export function prepaintScript({
  signature,
  defaultPrimaryColor,
  defaultContrastLevel,
  defaultScheme,
}: PrepaintProps) {
  return `try {
  var color = localStorage.getItem(${literal(PRIMARY_COLOR_KEY)})
  if (${HEX_COLOR}.test(color)) {
    document.documentElement.style.setProperty(${literal(PRIMARY_COLOR_PREPAINT_VAR)}, color)
    if (color.toLowerCase() !== ${literal(defaultPrimaryColor.toLowerCase())}) document.documentElement.setAttribute(${literal(PREPAINT_OVERRIDDEN_ATTRIBUTES.primaryColor)}, '')
  } else {
    color = ${literal(defaultPrimaryColor)}
  }
  var contrast = localStorage.getItem(${literal(CONTRAST_LEVEL_KEY)})
  contrast = ${literal(CONTRAST_LEVELS.map(({ value }) => String(value)))}.indexOf(contrast) === -1 ? ${literal(defaultContrastLevel)} : Number(contrast)
  var scheme = localStorage.getItem(${literal(SCHEME_KEY)})
  scheme = ${literal(SCHEMES.map(({ value }) => value))}.indexOf(scheme) === -1 ? ${literal(defaultScheme)} : scheme
  var cache = JSON.parse(localStorage.getItem(${literal(CACHE_KEY)}))
  if (cache && cache.color === color && cache.contrast === contrast && cache.scheme === scheme && cache.signature === ${literal(signature)}) {
    document.getElementById(${literal(STYLE_ID)}).textContent = cache.css
  }
} catch (e) {}`
}

/**
 * The stored picks' palette from the first paint, instead of the default one the server rendered
 * until hydration and `Mtb` apply the picks.
 *
 * To render right after `Mtb`'s `<style>`: the same selectors, later, so this one wins. Once `Mtb`
 * has the picks, it is removed, in the same commit: `Mtb` alone keeps the palette up to date from
 * then on.
 *
 * `signature`: the rest of `Mtb`'s config, which shapes the palette as much as the picks do. A
 * palette cached for another config (the site's theme changed since) is not used.
 */
export function PrimaryColorPrepaint(props: PrepaintProps) {
  const { signature } = props
  const { mtbConfig } = useMtb()
  const [primaryColor, , isDefaultPrimaryColor] = usePrimaryColor()
  const [contrastLevel, , isDefaultContrastLevel] = useContrastLevel()
  const [scheme, , isDefaultScheme] = useScheme()
  const isHydrated = useIsHydrated()

  // Before hydration, the picks are the defaults, as on the server, whatever is stored
  const isApplied =
    isHydrated &&
    mtbConfig.source === primaryColor &&
    mtbConfig.contrast === contrastLevel &&
    mtbConfig.scheme === scheme

  const [isRemoved, setIsRemoved] = useState(false)
  if (isApplied && !isRemoved) setIsRemoved(true)

  // Cache the palette `Mtb` applied, for the next load. Not the server's default at hydration: it
  // would forget a pick not read yet
  useEffect(() => {
    if (!isHydrated) return
    // Nothing picked: the server's palette is the reader's
    if (isDefaultPrimaryColor && isDefaultContrastLevel && isDefaultScheme) {
      writeCache(null)
      return
    }
    if (!isApplied) return
    const timeout = setTimeout(() => {
      const css = document.getElementById(MTB_STYLE_ID)?.textContent
      if (css) writeCache({ color: primaryColor, contrast: contrastLevel, scheme, signature, css })
    }, CACHE_DELAY)
    return () => clearTimeout(timeout)
  }, [
    isHydrated,
    isDefaultPrimaryColor,
    isDefaultContrastLevel,
    isDefaultScheme,
    isApplied,
    primaryColor,
    contrastLevel,
    scheme,
    signature,
  ])

  // The swatch reads `primaryColor` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.style.removeProperty(PRIMARY_COLOR_PREPAINT_VAR)
  }, [isHydrated])

  if (isRemoved) return null

  return (
    <>
      {/* Filled by the script, never by React: its HTML differs from the server's on purpose */}
      <style id={STYLE_ID} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '' }} />
      <script dangerouslySetInnerHTML={{ __html: prepaintScript(props) }} />
    </>
  )
}
