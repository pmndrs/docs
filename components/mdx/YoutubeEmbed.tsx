export const YouTubeEmbed = ({ src }: { src: string }) => {
  return (
    <div className="aspect-w-16 aspect-h-9 pt-10 h-0 2-full rounded-lg overflow-hidden my-6 border border-gray-200">
      <iframe width="853" height="480" src={src} frameBorder="0" allowFullScreen />
    </div>
  )
}
