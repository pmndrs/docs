export const YouTubeEmbed = ({ src }: { src: string }) => {
  return (
    <div className="youtube-embed">
      <iframe width="853" height="480" src={src} frameBorder="0" allowFullScreen />
    </div>
  )
}
