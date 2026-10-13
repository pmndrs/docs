import { setImmediate } from 'node:timers/promises'

/**
 * Proves that a consumer server component can await data and render structured rows.
 */
export async function FoundationTable({ rows }: { rows: { name: string; value: number }[] }) {
  await setImmediate()

  return (
    <table data-testid="consumer-foundations">
      <tbody>
        {rows.map(({ name, value }) => (
          <tr key={name} data-token={name} data-value={value}>
            <th>{name}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
