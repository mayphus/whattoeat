import { Link } from 'react-router-dom'
import { SignUp } from '@clerk/clerk-react'

export default function AuthSignUpPage() {
  return (
    <div className="min-h-screen grid place-items-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-2xl font-semibold">What to Eat?</Link>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full rounded-xl border shadow-sm',
            },
          }}
        />
      </div>
    </div>
  )
}
