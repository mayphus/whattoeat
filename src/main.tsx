import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Check if we have a valid Clerk key
const hasValidClerkKey = PUBLISHABLE_KEY && PUBLISHABLE_KEY.startsWith('pk_test_') && PUBLISHABLE_KEY.length > 50

if (!hasValidClerkKey) {
  console.warn('Invalid or missing Clerk key. Please update VITE_CLERK_PUBLISHABLE_KEY in .env file')
  console.warn('Visit https://clerk.com/ to get your keys')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hasValidClerkKey ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#ea6100' }}>🔧 Clerk Setup Required</h1>
        <p>To use authentication, please:</p>
        <ol>
          <li>Go to <a href="https://clerk.com/" target="_blank">https://clerk.com/</a></li>
          <li>Create a free account and new application</li>
          <li>Copy your publishable key from the dashboard</li>
          <li>Update the <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your <code>.env</code> file</li>
        </ol>
        <p><strong>Current key:</strong> <code>{PUBLISHABLE_KEY || 'Not set'}</code></p>
        <p><em>The app will work normally once you add a valid key.</em></p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            background: '#ea6100', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Reload Page
        </button>
      </div>
    )}
  </StrictMode>,
)
