export const YouTubeEmbed = ({ src }: { src: string }) => {
  return (
    <div className="relative pb-[56.25%] pt-[30px] h-0 2-full rounded-lg overflow-hidden my-[2em] border border-gray-200">
      <iframe
        width="853"
        height="480"
        src={src}
        frameBorder="0"
        allowFullScreen
        className=" absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}
