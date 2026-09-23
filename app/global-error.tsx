'use client';

// global-error replaces the root layout when a render error escapes it, so it
// must ship its own <html>/<body>. Kept dependency-free and inline-styled to
// avoid relying on anything that might be the source of the failure.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#08090a',
          color: '#f5f5f6',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a2a4ac', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            A critical error occurred. Please reload the application.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '1.25rem',
              padding: '0.6rem 1.1rem',
              borderRadius: 12,
              border: '1px solid #282b32',
              background: '#e6b24a',
              color: '#1a1405',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
