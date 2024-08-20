import cn from '@/lib/cn'

export const Hint = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        'hint my-6 overflow-clip rounded-lg px-6 py-4',
        // 'bg-yellow-100 dark:text-gray-500',
        'bg-hint-container',
      )}
    >
      {children}
    </div>
  )
}
