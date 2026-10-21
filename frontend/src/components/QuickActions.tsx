import React from 'react'
import { Apple, Music, Heart } from 'lucide-react'

interface QuickActionsProps {
  onFeed: () => void
  onDance: () => void
  onPet: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onFeed, onDance, onPet }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-2 px-4 z-10">
      <button
        onClick={onFeed}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 font-medium text-xs shadow-md active:scale-95 hover:bg-red-500/30 transition-all cursor-pointer"
      >
        <Apple className="w-4 h-4 text-red-400" />
        <span>Feed Snack</span>
      </button>

      <button
        onClick={onDance}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 font-medium text-xs shadow-md active:scale-95 hover:bg-purple-500/30 transition-all cursor-pointer"
      >
        <Music className="w-4 h-4 text-purple-400 animate-pulse" />
        <span>Dance</span>
      </button>

      <button
        onClick={onPet}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-300 font-medium text-xs shadow-md active:scale-95 hover:bg-pink-500/30 transition-all cursor-pointer"
      >
        <Heart className="w-4 h-4 text-pink-400" />
        <span>Pet Fur</span>
      </button>
    </div>
  )
}
