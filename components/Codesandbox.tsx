import LazyLoad from 'react-lazyload'

export default function Codesandbox({ url }) {
  return (
    <div className="mb-8">
      <LazyLoad height={600} once>
        <iframe
          src={url}
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
