import { Gha } from './Gha'

/**
 *
 * @deprecated
 */
export const Hint = ({ children }: { children: React.ReactNode }) => {
  return <Gha keyword="NOTE">{children}</Gha>
}
