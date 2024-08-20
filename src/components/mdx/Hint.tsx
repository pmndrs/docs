import cn from '@/lib/cn'
import { IoDocumentTextOutline } from 'react-icons/io5'

export const Hint = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={cn('hint my-6 overflow-clip rounded-lg px-6 py-4', 'bg-hint-container')}>
      <p className="mb-2 flex items-center gap-1 text-lg">
        <IoDocumentTextOutline className="text-[125%]" />
        Note
      </p>
      {children}
    </div>
  )
}
