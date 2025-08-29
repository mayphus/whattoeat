import { Link } from 'react-router-dom'
import { UtensilsCrossed, BookOpen, ChartNoAxesGantt } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-2xl mx-auto h-16 px-4 flex items-center">
          <div className="text-xl font-semibold">吃啥?</div>
          <div className="ml-auto">
            <Button asChild variant="secondary" size="sm">
              <Link to="/sign-in">登入</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">管理食譜與用餐，輕鬆又聰明</h1>
          <p className="text-muted-foreground">
            儲存你的拿手菜、快速記錄每日用餐，並查看飲食統計。開始建立屬於你的美味資料庫。
          </p>

          {/* Single CTA lives in header: 登入 */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
            <Feature
              icon={<BookOpen className="h-5 w-5" />}
              title="收藏食譜"
              text="建立食譜清單、分類管理、快速搜尋。"
            />
            <Feature
              icon={<UtensilsCrossed className="h-5 w-5" />}
              title="記錄用餐"
              text="追蹤每日餐點與份量，養成好習慣。"
            />
            <Feature
              icon={<ChartNoAxesGantt className="h-5 w-5" />}
              title="分析洞察"
              text="查看常做菜色與營養趨勢。"
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
