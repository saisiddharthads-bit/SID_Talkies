import React from 'react'
import { Apple, Music, Heart, Mic } from 'lucide-react'

interface QuickActionsProps {
  onFeed: () => void
  onDance: () => void
  onPet: () => void
  onToggleVoice: () => void
  isListening: boolean
  isSupportedSTT: boolean
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onFeed,
  onDance,
  onPet,
  onToggleVoice,
  isListening,
  isSupportedSTT,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 py-2 px-4 z-10 w-full">
      {/* Primary Voice Mic Button */}
      {isSupportedSTT && (
        <button
          onClick={onToggleVoice}
          className={`relative group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs shadow-lg transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 active:scale-95 shadow-orange-500/20'
          }`}
        >
          {isListening ? (
            <>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-3.5 bg-white rounded-full animate-bounce" />
                <span className="w-1.5 h-4.5 bg-white rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
              <span>Listening... (Tap when done)</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Tap to Speak to Sparky</span>
            </>
          )}
        </button>
      )}

      {/* Secondary Tactile Pet Buttons */}
      <div className="flex items-center justify-center gap-2.5 w-full">
        <button
          onClick={onFeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-red-500/30 text-red-300 font-medium text-xs shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Apple className="w-3.5 h-3.5 text-red-400" />
          <span>Feed</span>
        </button>

        <button
          onClick={onDance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-medium text-xs shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Music className="w-3.5 h-3.5 text-purple-400" />
          <span>Dance</span>
        </button>

        <button
          onClick={onPet}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-pink-500/30 text-pink-300 font-medium text-xs shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          <span>Pet</span>
        </button>
      </div>
    </div>
  )
}
