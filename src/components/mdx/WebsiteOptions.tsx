import { table as Table, td as Td, th as Th, thead as Thead, tr as Tr } from '@/components/mdx'
import { WEBSITE_OPTIONS } from '@/website.options'

/** The website options, as the CLI declares them — `--help` prints the very same rows. */
export default function WebsiteOptions() {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>flag</Th>
          <Th>var</Th>
          <Th>description</Th>
        </Tr>
      </Thead>
      <tbody>
        {WEBSITE_OPTIONS.map(([variable, flag, description]) => (
          <Tr key={variable}>
            <Td>
              <code>{flag.replace(/ <.*/, '')}</code>
            </Td>
            <Td>
              <code>{variable}</code>
            </Td>
            <Td>{description}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}
