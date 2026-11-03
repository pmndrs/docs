import { parseEnvFlag } from './env-flag'

/**
 * Which pmndrs-only parts of the layout a site shows, read from the environment at build time.
 * Both are on unless `false`, for a site that is not a pmndrs library:
 *
 * - `SPONSOR_CARD`: the "Sponsor Poimandres" card, under the table of contents
 * - `LIBS_MENU`: the menu of the pmndrs libraries behind the site name in the header; off, the
 *   name is a plain link home
 */
export function readLayoutParts(env: Record<string, string | undefined> = process.env) {
  return {
    sponsorCard: parseEnvFlag('SPONSOR_CARD', env.SPONSOR_CARD) ?? true,
    libsMenu: parseEnvFlag('LIBS_MENU', env.LIBS_MENU) ?? true,
  }
}
