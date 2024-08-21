import { Gha } from '@/utils/gha'

export const Hint = ({ children }: { children: React.ReactNode }) => {
  return <Gha keyword="NOTE">{children}</Gha>
}
