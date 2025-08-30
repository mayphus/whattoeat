import { Link } from 'react-router-dom'
import { UtensilsCrossed, BookOpen, ChartNoAxesGantt } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-2xl mx-auto h-16 px-4 flex items-center">
          <div className="text-xl font-semibold">What to Eat?</div>
          <div className="ml-auto">
            <Button asChild variant="secondary" size="sm">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Manage Recipes and Meals, Simple and Smart</h1>
          <p className="text-muted-foreground">
            Save your favorite dishes, quickly record daily meals, and view dietary statistics. Start building your personal recipe database.
          </p>

          {/* Single CTA lives in header: Sign In */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
            <Feature
              icon={<BookOpen className="h-5 w-5" />}
              title="Save Recipes"
              text="Create recipe lists, organize by category, and search quickly."
            />
            <Feature
              icon={<UtensilsCrossed className="h-5 w-5" />}
              title="Record Meals"
              text="Track daily meals and portions, develop good habits."
            />
            <Feature
              icon={<ChartNoAxesGantt className="h-5 w-5" />}
              title="Analytics Insights"
              text="View frequently made dishes and cooking trends."
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border p-4 h-full">
      <div className="flex items-center gap-2 font-medium mb-2">{icon} {title}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
