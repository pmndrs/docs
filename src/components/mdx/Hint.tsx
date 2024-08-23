import { Gha } from './Gha'

/**
 *
 * @deprecated
 */
export const Hint = ({ children }: { children: React.ReactNode }) => {
  console.warn('Hint is deprecated, use Gha instead.')

  return <Gha keyword="NOTE">{children}</Gha>
}
