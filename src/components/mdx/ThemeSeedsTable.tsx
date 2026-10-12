import { code as Code, table as Table } from '@/components/mdx'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Color } from '@/registry/color/color'
import type { MtbConfig } from 'material-theme-builder'

/** Seed table shared by the live website and the CLI's standalone HTML fragments. */
export function ThemeSeedsTable({ config }: { config: MtbConfig }) {
  const options = [
    'source',
    'colorMatch',
    'scheme',
    'primary',
    'secondary',
    'tertiary',
    'neutral',
    'neutralVariant',
    'error',
  ] as const satisfies readonly (keyof MtbConfig)[]

  return (
    <div className="[&>div]:mt-3">
      <Table aria-label="Current theme seeds">
        <TableHeader>
          <TableRow>
            <TableHead>Option</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => {
            const value = config[option]
            if (value === undefined || (option === 'scheme' && config.colorMatch)) return null
            return (
              <TableRow key={option}>
                <TableCell>
                  <Code>{option}</Code>
                </TableCell>
                <TableCell>
                  {typeof value === 'string' && value.startsWith('#') && <Color color={value} />}{' '}
                  <Code>{String(value)}</Code>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
