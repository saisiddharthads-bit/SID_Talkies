import React from 'react'
import { Sparkles, Volume2 } from 'lucide-react'
import type { Expression } from '../types'

interface SpeechBubbleProps {
  text: string
  expression: Expression
  visible: boolean
  isSpeaking: boolean
  onReplay?: () => void
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  expression,
  visible,
  isSpeaking,
  onReplay,
}) => {
  if (!visible || !text) return null

  return (
    <div className="relative mx-auto w-11/12 max-w-sm mb-2 z-20">
      <div className="relative bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sparky</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">
              {expression}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isSpeaking && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] animate-pulse">
                <span className="w-1 h-2 bg-orange-400 rounded-full animate-bounce" />
                <span className="w-1 h-3 bg-orange-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="ml-1 font-semibold">Speaking</span>
              </div>
            )}
            {onReplay && (
              <button
                onClick={onReplay}
                className="p-1 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Speak again"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs font-medium leading-relaxed text-slate-200">{text}</p>

        {/* Pointer tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-slate-900 border-r border-b border-slate-700/80 rotate-45" />
      </div>
    </div>
  )
}
