import React, { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { Wifi, WifiOff } from 'lucide-react'
import type { Expression, AnimationType, CompanionMode } from './types'
import { api } from './services/api'
import { CharacterCanvas } from './components/CharacterCanvas'
import { SpeechBubble } from './components/SpeechBubble'
import { QuickActions } from './components/QuickActions'
import { ChatView } from './components/ChatView'
import { MemoryView } from './components/MemoryView'
import { ResearchView } from './components/ResearchView'
import { SettingsView } from './components/SettingsView'
import { MiniGameView } from './components/MiniGameView'
import { BottomNav, type TabType } from './components/BottomNav'

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('room')
  const [currentMode, setCurrentMode] = useState<CompanionMode>('friend')
  const [expression, setExpression] = useState<Expression>('idle')
  const [animation, setAnimation] = useState<AnimationType>('idle')
  const [speechText, setSpeechText] = useState<string>('Hello! Tap, pet, or tickle me!')
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(true)

  const idleTimeout = useRef<number | null>(null)

  useEffect(() => {
    // Initial backend handshake
    api.ensureAuthenticated().then((authenticated) => {
      setIsOnline(authenticated)
    })
  }, [])

  const triggerReaction = (text: string, expr: Expression, anim: AnimationType, duration = 3500) => {
    setSpeechText(text)
    setExpression(expr)
    setAnimation(anim)
    setIsSpeaking(true)

    if (idleTimeout.current) clearTimeout(idleTimeout.current)

    // Speaking mouth animation timing
    setTimeout(() => {
      setIsSpeaking(false)
    }, Math.min(2200, text.length * 55))

    idleTimeout.current = window.setTimeout(() => {
      setExpression('idle')
      setAnimation('idle')
    }, duration)
  }

  const handleCharacterTouch = async (type: 'tap' | 'pet' | 'tickle' | 'feed') => {
    let promptMsg = 'Hello Sparky!'
    if (type === 'tap') promptMsg = 'Tap on nose'
    if (type === 'pet') promptMsg = 'Petting fur'
    if (type === 'tickle') promptMsg = 'Tickling tummy'
    if (type === 'feed') promptMsg = 'Snack time'

    const reply = await api.sendChatMessage(promptMsg, type)
    triggerReaction(reply.text, reply.expression, reply.animation)
  }

  const handleFeed = () => {
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#ef4444', '#f97316', '#22c55e'],
    })
    handleCharacterTouch('feed')
  }

  const handleDance = () => {
    confetti({
      particleCount: 40,
      spread: 70,
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#f59e0b'],
    })
    triggerReaction("Let's dance! Grooving to the beat!", 'happy', 'dance', 5000)
  }

  const handlePet = () => {
    confetti({
      particleCount: 20,
      spread: 45,
      colors: ['#fb7185', '#f43f5e'],
    })
    handleCharacterTouch('pet')
  }

  const handleCompanionReply = (reply: { text: string; expression: Expression; animation: AnimationType }) => {
    triggerReaction(reply.text, reply.expression, reply.animation)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 text-slate-100 font-sans">
      {/* Mobile Frame Container */}
      <div className="relative w-full max-w-md h-[100dvh] sm:h-[844px] bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 sm:rounded-[36px] sm:border-[6px] sm:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top App Header */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-bold text-sm">
              🦊
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-slate-100">SID_Talkies</h1>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 capitalize">
                  {currentMode}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Sparky • Your Living Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {currentTab === 'room' && (
            <div className="relative flex-1 flex flex-col justify-between p-4 overflow-hidden">
              {/* Cozy Room Background Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-slate-900/20 to-slate-950/80 pointer-events-none" />
              
              {/* Speech Bubble */}
              <div className="pt-2">
                <SpeechBubble text={speechText} expression={expression} visible={true} />
              </div>

              {/* 60FPS Interactive Living Character */}
              <div className="flex-1 flex items-center justify-center my-auto">
                <CharacterCanvas
                  expression={expression}
                  animation={animation}
                  isSpeaking={isSpeaking}
                  onCharacterTouch={handleCharacterTouch}
                />
              </div>

              {/* Tactile Quick Actions */}
              <QuickActions onFeed={handleFeed} onDance={handleDance} onPet={handlePet} />
            </div>
          )}

          {currentTab === 'chat' && (
            <div className="flex-1 p-3 overflow-hidden">
              <ChatView onCompanionReply={handleCompanionReply} />
            </div>
          )}

          {currentTab === 'memory' && (
            <div className="flex-1 p-3 overflow-hidden">
              <MemoryView />
            </div>
          )}

          {currentTab === 'research' && (
            <div className="flex-1 p-3 overflow-hidden">
              <ResearchView />
            </div>
          )}

          {currentTab === 'game' && (
            <div className="flex-1 p-3 overflow-hidden">
              <MiniGameView onGameWin={handleDance} />
            </div>
          )}

          {currentTab === 'settings' && (
            <div className="flex-1 p-3 overflow-hidden">
              <SettingsView currentMode={currentMode} onModeChange={setCurrentMode} />
            </div>
          )}
        </main>

        {/* Bottom Navigation Dock */}
        <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>
    </div>
  )
}
