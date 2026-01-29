/**
 * Sandpack placeholder component
 * 
 * This component is used when Sandpack is disabled or not available.
 * It provides a helpful message to users.
 */

interface SandpackPlaceholderProps {
  folder?: string
  [key: string]: any
}

export function SandpackPlaceholder({ folder, ...props }: SandpackPlaceholderProps) {
  return (
    <div
      style={{
        padding: '1.5rem',
        margin: '1rem 0',
        border: '2px dashed #ccc',
        borderRadius: '0.5rem',
        backgroundColor: '#f9f9f9',
        color: '#666',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontWeight: 'bold' }}>Sandpack Component Not Available</p>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em' }}>
        To use Sandpack, install <code>@codesandbox/sandpack-react</code> and ensure{' '}
        <code>EXTERNAL_SANDPACK</code> is not set to <code>false</code>.
      </p>
      {folder && (
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85em', color: '#999' }}>
          Folder: <code>{folder}</code>
        </p>
      )}
    </div>
  )
}
