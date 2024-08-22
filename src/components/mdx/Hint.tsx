import { Gha } from './Gha'

export const Hint = ({ children }: { children: React.ReactNode }) => {
  return <Gha keyword="NOTE">{children}</Gha>
}
