'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            alignItems: 'center',
            background: '#faf8f4',
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
          }}
        >
          <section
            style={{
              background: '#fff',
              borderTop: '5px solid #7b1022',
              boxShadow: '0 20px 60px rgba(54,38,28,.13)',
              maxWidth: '480px',
              padding: '36px',
              width: '100%',
            }}
          >
            <p
              style={{
                color: '#7b1022',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '.12em',
              }}
            >
              SCHOLARLOCAL
            </p>
            <h1 style={{ color: '#4a0711', fontFamily: 'Georgia, serif' }}>
              We could not load the repository.
            </h1>
            <p style={{ color: '#524b47', lineHeight: 1.6 }}>
              Your account and request data remain protected. Try loading the page again.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#7b1022',
                border: 0,
                borderRadius: '5px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                marginTop: '8px',
                padding: '12px 18px',
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
