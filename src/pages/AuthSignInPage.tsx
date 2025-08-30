import { Link } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'

export default function AuthSignInPage() {
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-2xl font-semibold">What to Eat?</Link>
        </div>
        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full rounded-xl border shadow-sm',
            },
          }}
        />
        <div className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/" className="underline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
