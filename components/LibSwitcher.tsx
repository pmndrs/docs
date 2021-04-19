import { useRouter } from 'next/router'

function LibSwitcherModal() {
  return null
}

export default function LibSwitcher() {
  const { query } = useRouter()
  return (
    <>
      <div className="pl-6 px-6 py-2 bg-blue-50 rounded-md text-gray-900 uppercase tracking-wide font-semibold text-sm lg:text-xs text-capitalize">
        {query.slug[0].split('-').join(' ')}
      </div>
    </>
  )
}
