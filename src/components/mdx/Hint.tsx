export const Hint = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="hint overflow-clip bg-yellow-100 border-b border-gray-200 rounded-lg px-6 py-4 mb-6 dark:text-gray-500">
      {children}
    </div>
  )
}
