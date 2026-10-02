'use client'

import { useIsHydrated } from '@/hooks/useIsHydrated'
import { HEX_COLOR, PRIMARY_COLOR_KEY, usePrimaryColor } from '@/hooks/usePrimaryColor'
import { builder } from 'material-theme-builder'
import { useMtb } from 'material-theme-builder/react'
import { useEffect, useState } from 'react'

/**
 * The palette of the stored pick, as `Mtb` writes it, for the next page load to show it before
 * React runs: `{ color, signature, css }`
 */
const CACHE_KEY = `${PRIMARY_COLOR_KEY}:css`

/** Set on `<html>` to the stored pick before the first paint: the swatch shows it until hydrated */
export const PRIMARY_COLOR_PREPAINT_VAR = '--prepaint-primary-color'

const STYLE_ID = 'primary-color-prepaint'

type Cache = {
  color: string
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
function literal(value: string) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * Run while the HTML is parsed, right after the `<style>` it fills: before the first paint. It
 * doesn't wait for React, nor for the palette to be computed again: it reads the one cached with
 * the stored pick, if made for this very config.
 */
function prepaintScript(signature: string) {
  return `try {
  var color = localStorage.getItem(${literal(PRIMARY_COLOR_KEY)})
  if (${HEX_COLOR}.test(color)) {
    document.documentElement.style.setProperty(${literal(PRIMARY_COLOR_PREPAINT_VAR)}, color)
    var cache = JSON.parse(localStorage.getItem(${literal(CACHE_KEY)}))
    if (cache && cache.color === color && cache.signature === ${literal(signature)}) {
      document.getElementById(${literal(STYLE_ID)}).textContent = cache.css
    }
  }
} catch (e) {}`
}

/**
 * The stored pick's palette from the first paint, instead of the default one the server rendered
 * until hydration and `Mtb` apply the pick.
 *
 * To render right after `Mtb`'s `<style>`: the same selectors, later, so this one wins. Once `Mtb`
 * has the pick, it is removed, in the same commit: `Mtb` alone keeps the palette up to date from
 * then on.
 *
 * `signature`: the rest of `Mtb`'s config, which shapes the palette as much as the color does. A
 * palette cached for another config (the site's theme changed since) is not used.
 */
export function PrimaryColorPrepaint({ signature }: { signature: string }) {
  const { mtbConfig } = useMtb()
  const [primaryColor, , isDefault] = usePrimaryColor()
  const isHydrated = useIsHydrated()

  // Before hydration, `primaryColor` is the default, as on the server, whatever is stored
  const isApplied = isHydrated && mtbConfig.source === primaryColor

  const [isRemoved, setIsRemoved] = useState(false)
  if (isApplied && !isRemoved) setIsRemoved(true)

  // Cache the palette `Mtb` applied, for the next load. Not the server's default at hydration: it
  // would forget a pick not read yet
  useEffect(() => {
    if (!isHydrated) return
    if (isDefault) {
      writeCache(null)
    } else if (isApplied) {
      const css = builder(mtbConfig.source, mtbConfig).toCss()
      writeCache({ color: mtbConfig.source, signature, css })
    }
  }, [isHydrated, isDefault, isApplied, mtbConfig, signature])

  // The swatch reads `primaryColor` itself once hydrated
  useEffect(() => {
    if (isHydrated) document.documentElement.style.removeProperty(PRIMARY_COLOR_PREPAINT_VAR)
  }, [isHydrated])

  if (isRemoved) return null

  return (
    <>
      {/* Filled by the script, never by React: its HTML differs from the server's on purpose */}
      <style id={STYLE_ID} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: '' }} />
      <script dangerouslySetInnerHTML={{ __html: prepaintScript(signature) }} />
    </>
  )
}
