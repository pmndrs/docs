export const DemoGrid = ({ children }) => (
  <div
    className="relative w-full grid p-0 gap-10 select-none"
    css={`
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

      & > div:last-of-type:nth-child(odd) {
        grid-column: 1/-1;
      }
    `}
  >
    {children}
  </div>
)
