import LazyLoad from 'react-lazyload'

export default function Codesandbox({ id, tests }) {
  return (
    <div className="mb-8">
      <LazyLoad height={600} once>
        <iframe
          src={`https://codesandbox.io/embed/${id}?codemirror=1&fontsize=14&hidenavigation=1&theme=light&hidedevtools=1${
            tests ? '&previewwindow=tests' : ''
          }`}
          style={{
            width: '100%',
            height: 600,
          }}
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </LazyLoad>
    </div>
  )
}
