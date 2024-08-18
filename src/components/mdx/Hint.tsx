export const Hint = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="hint my-6 overflow-clip rounded-lg bg-yellow-100 px-6 py-4 dark:text-gray-500">
      {children}
    </div>
  )
}
