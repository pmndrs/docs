/**
 * Loads local data asynchronously on the server and renders it as a table.
 */
export async function ExampleTable() {
  const { default: example } = await import('./Example.json')

  return (
    <table data-testid="custom-component-table">
      <thead>
        <tr>
          <th>Spacing</th>
          <th>Pixels</th>
        </tr>
      </thead>
      <tbody>
        {example.spacing.map(({ name, value }) => (
          <tr key={name} data-token={name} data-value={value}>
            <th scope="row">{name}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
