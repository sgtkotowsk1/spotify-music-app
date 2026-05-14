import { Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '@/shared/hooks/useTheme'

interface Props {
  title: string
}

export function Header({ title }: Props) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="btn-ghost p-2 rounded-full" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="btn-ghost p-2 rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
