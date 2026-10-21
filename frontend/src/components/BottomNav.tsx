import React from 'react'
import { Home, MessageCircle, Brain, Search, Gamepad2, Settings } from 'lucide-react'

export type TabType = 'room' | 'chat' | 'memory' | 'research' | 'game' | 'settings'

interface BottomNavProps {
  currentTab: TabType
  onSelectTab: (tab: TabType) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'room', label: 'Room', icon: <Home className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" /> },
    { id: 'research', label: 'Research', icon: <Search className="w-4 h-4" /> },
    { id: 'game', label: 'Game', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <nav className="w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl z-30">
      {tabs.map((t) => {
        const isActive = currentTab === t.id
        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-orange-400 scale-105 font-bold'
                : 'text-slate-400 hover:text-slate-300 active:scale-95'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-colors ${
                isActive ? 'bg-orange-500/15 text-orange-400' : 'text-slate-400'
              }`}
            >
              {t.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
