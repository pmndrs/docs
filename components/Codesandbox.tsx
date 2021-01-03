export default function Codesandbox({ url }) {
  ;<iframe
    src={url}
    style={{
      width: '100%',
      height: 600,
      overflow: 'hidden',
      borderRadius: 4,
      border: '0px',
      marginTop: 16,
    }}
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  />
}
