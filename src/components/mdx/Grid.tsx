export const Grid = ({ children, cols = 4 }: { children: React.ReactNode; cols?: number }) => (
  <ul
    className={`grid sm:grid-cols-2 ${
      cols === 4
        ? 'md:grid-cols-4'
        : cols === 3
          ? 'md:grid-cols-3'
          : cols === 2
            ? 'md:grid-cols-2'
            : 'md:grid-cols-1'
    } grid-list gap-4 text-sm text-gray-700`}
    style={{ marginBottom: '1rem' }}
  >
    {children}
  </ul>
)
