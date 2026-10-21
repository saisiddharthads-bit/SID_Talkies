import React from 'react'
import { Sparkles, Volume2 } from 'lucide-react'
import type { Expression } from '../types'

interface SpeechBubbleProps {
  text: string
  expression: Expression
  visible: boolean
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, expression, visible }) => {
  if (!visible || !text) return null

  return (
    <div className="relative mx-auto w-11/12 max-w-sm mb-3 animate-bounce-subtle z-20">
      <div className="relative bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Sparky</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">
              {expression}
            </span>
          </div>
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <p className="text-sm font-medium leading-relaxed text-slate-200">{text}</p>
        
        {/* Little triangle pointer for speech bubble */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-slate-700/80 rotate-45" />
      </div>
    </div>
  )
}
