import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Color, inkOf } from './Color'

describe('inkOf', () => {
  it.each([
    ['primary', 'on-primary'],
    ['on-primary', 'primary'],
    ['primary-container', 'on-primary-container'],
    ['primary-fixed', 'on-primary-fixed'],
    ['primary-fixed-dim', 'on-primary-fixed'],
    ['on-primary-fixed', 'primary-fixed'],
    ['on-primary-fixed-variant', 'primary-fixed'],
    ['surface', 'on-surface'],
    ['surface-container-high', 'on-surface'],
    ['on-surface-variant', 'surface'],
    ['outline', 'surface'],
    ['inverse-surface', 'inverse-on-surface'],
    ['inverse-primary', 'on-surface'],
    ['scrim', 'white'],
    ['shadow', 'white'],
    ['tip', 'on-tip'],
    ['on-tip-container', 'tip-container'],
  ])('pairs %s with %s', (role, ink) => {
    expect(inkOf(role)).toBe(ink)
  })
})

describe('Color', () => {
  it('renders a pill as an image of the role, no text, Title Case as its name and tooltip', () => {
    const html = renderToStaticMarkup(<Color role="primary" />)
    expect(html).toMatch(/^<span [^>]*><\/span>$/)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Primary"')
    expect(html).toContain('title="Primary"')
    expect(html).toContain('background-color:var(--md-sys-color-primary)')
  })

  it('names a pill after its children', () => {
    const html = renderToStaticMarkup(<Color role="primary">Brand</Color>)
    expect(html).toContain('aria-label="Brand"')
    expect(html).toContain('title="Brand"')
    expect(html).toMatch(/^<span [^>]*><\/span>$/)
  })

  it('hides a pill of a bare color, decorative', () => {
    const html = renderToStaticMarkup(<Color color="#cb3837" />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="img"')
    expect(html).not.toContain('aria-label=')
  })

  it('labels a cell with the role in Title Case, in the paired ink', () => {
    const html = renderToStaticMarkup(<Color role="on-primary-fixed-variant" variant="cell" />)
    expect(html).not.toContain('role="img"')
    expect(html).toContain('>On Primary Fixed Variant</span>')
    expect(html).toContain(
      'background-color:var(--md-sys-color-on-primary-fixed-variant);color:var(--md-sys-color-primary-fixed)',
    )
  })

  it('lets children override the label of a cell', () => {
    const html = renderToStaticMarkup(
      <Color role="primary" variant="cell">
        Main
      </Color>,
    )
    expect(html).toContain('>Main</span>')
    expect(html).not.toContain('Primary</span>')
  })

  it('lets ink win over the pairing', () => {
    const html = renderToStaticMarkup(<Color role="primary" ink="tertiary" variant="cell" />)
    expect(html).toContain('color:var(--md-sys-color-tertiary)')
  })

  it('defaults the ink to white on a bare color', () => {
    const html = renderToStaticMarkup(
      <Color color="#cb3837" variant="cell">
        npm
      </Color>,
    )
    expect(html).toContain('style="background-color:#cb3837;color:white"')
  })

  it('merges style over the colors', () => {
    const html = renderToStaticMarkup(<Color role="primary" style={{ color: 'red' }} />)
    expect(html).toContain('style="background-color:var(--md-sys-color-primary);color:red"')
  })
})
