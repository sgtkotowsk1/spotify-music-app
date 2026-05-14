import { ReactNode } from 'react'
import { Sidebar } from '@/widgets/Sidebar'
import { Header } from '@/widgets/Header'

interface Props {
  title: string
  children: ReactNode
}

export function Layout({ title, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
