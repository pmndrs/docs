import { getData } from '@/utils/docs'
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slugParam = searchParams.get('slug')

    if (!slugParam) {
      return new Response('Missing slug parameter', { status: 400 })
    }

    const slug = slugParam.split('/')
    const { doc } = await getData(...slug)

    const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME || 'Documentation'
    const primary = process.env.THEME_PRIMARY || '#323e48'

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#1a1a1a',
          padding: 80,
        }}
      >
        {/* Site name / logo area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 8,
              height: 48,
              backgroundColor: primary,
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#ffffff',
              opacity: 0.9,
            }}
          >
            {NEXT_PUBLIC_LIBNAME}
          </div>
        </div>

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {doc.title}
          </div>
          {doc.description && (
            <div
              style={{
                fontSize: 32,
                color: '#a0a0a0',
                lineHeight: 1.4,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {doc.description}
            </div>
          )}
        </div>

        {/* Footer area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            color: '#606060',
          }}
        >
          {process.env.NEXT_PUBLIC_URL?.replace(/^https?:\/\//, '') || 'docs'}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.error('Error generating OG image:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
