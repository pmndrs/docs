import { ImageResponse } from 'next/og'
import { getData } from '@/utils/docs'

export const runtime = 'nodejs'
export const alt = 'Open Graph Image'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  
  try {
    const { doc } = await getData(...slug)
    
    const NEXT_PUBLIC_LIBNAME = process.env.NEXT_PUBLIC_LIBNAME || 'Documentation'
    const THEME_PRIMARY = process.env.THEME_PRIMARY || '#323e48'
    const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || ''
    
    const title = doc.title
    const description = doc.description || ''
    
    return new ImageResponse(
      (
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
          {/* Site name with accent bar */}
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
                backgroundColor: THEME_PRIMARY,
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
          
          {/* Main content */}
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
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  fontSize: 32,
                  color: '#a0a0a0',
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 24,
              color: '#606060',
            }}
          >
            {NEXT_PUBLIC_URL.replace(/^https?:\/\//, '') || 'docs'}
          </div>
        </div>
      ),
      {
        ...size,
      },
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    // Return a fallback error image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontSize: 48,
          }}
        >
          Image generation failed
        </div>
      ),
      {
        ...size,
      },
    )
  }
}
