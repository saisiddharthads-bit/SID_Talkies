import React, { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface Snack {
  x: number
  y: number
  speed: number
  type: 'apple' | 'berry' | 'gold_acorn'
  size: number
}

interface MiniGameViewProps {
  onGameWin?: () => void
}

export const MiniGameView: React.FC<MiniGameViewProps> = ({ onGameWin }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(
    () => Number(localStorage.getItem('sid_high_score')) || 0
  )
  const [gameOver, setGameOver] = useState<boolean>(false)

  const basketX = useRef<number>(170)
  const snacks = useRef<Snack[]>([])
  const animationFrameId = useRef<number>(0)
  const lastSpawn = useRef<number>(0)

  const startGame = () => {
    setIsPlaying(true)
    setGameOver(false)
    setScore(0)
    snacks.current = []
    lastSpawn.current = Date.now()
    basketX.current = 170
  }

  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let currentScore = score

    const loop = () => {
      const now = Date.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn snacks every 800ms - 1200ms
      if (now - lastSpawn.current > 900) {
        lastSpawn.current = now
        const isGold = Math.random() < 0.15
        const isBerry = Math.random() < 0.4
        snacks.current.push({
          x: Math.random() * (canvas.width - 50) + 25,
          y: -20,
          speed: Math.random() * 2.5 + 2.5,
          type: isGold ? 'gold_acorn' : isBerry ? 'berry' : 'apple',
          size: isGold ? 16 : 14,
        })
      }

      // Draw Basket
      const bX = basketX.current
      const bY = canvas.height - 40
      const bWidth = 65
      const bHeight = 18

      ctx.fillStyle = '#b45309' // Warm wood
      ctx.beginPath()
      ctx.roundRect(bX - bWidth / 2, bY, bWidth, bHeight, [4, 4, 10, 10])
      ctx.fill()
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.stroke()

      // Handle snacks
      for (let i = snacks.current.length - 1; i >= 0; i--) {
        const s = snacks.current[i]
        s.y += s.speed

        // Draw Snack
        ctx.beginPath()
        if (s.type === 'apple') {
          ctx.fillStyle = '#ef4444' // Red apple
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx.fill()
          // Leaf
          ctx.fillStyle = '#22c55e'
          ctx.beginPath()
          ctx.arc(s.x + 3, s.y - s.size + 2, 4, 0, Math.PI * 2)
          ctx.fill()
        } else if (s.type === 'berry') {
          ctx.fillStyle = '#ec4899' // Pink berry
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Gold Acorn
          ctx.fillStyle = '#eab308'
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Catch Collision detection
        if (s.y >= bY - 10 && s.y <= bY + bHeight) {
          if (Math.abs(s.x - bX) < bWidth / 2 + 5) {
            const points = s.type === 'gold_acorn' ? 30 : s.type === 'berry' ? 15 : 10
            currentScore += points
            setScore(currentScore)

            // Sparkle on catch
            if (s.type === 'gold_acorn') {
              confetti({
                particleCount: 15,
                spread: 35,
                origin: { x: s.x / window.innerWidth, y: s.y / window.innerHeight },
                colors: ['#facc15', '#fbbf24'],
              })
            }

            snacks.current.splice(i, 1)
            continue
          }
        }

        // Missed snack floor check
        if (s.y > canvas.height + 20) {
          snacks.current.splice(i, 1)
          if (s.type === 'gold_acorn') {
            // Missed rare item doesn't kill, but regular misses can end streak
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(loop)
    }

    animationFrameId.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animationFrameId.current)
    }
  }, [isPlaying])

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    basketX.current = Math.max(35, Math.min(canvas.width - 35, x))
  }

  const stopGame = () => {
    setIsPlaying(false)
    setGameOver(true)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('sid_high_score', String(score))
      confetti({ particleCount: 50, spread: 70 })
      onGameWin?.()
    }
  }

  return (
    <div className="flex flex-col items-center justify-between h-full p-4 select-none">
      <div className="w-full flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-orange-400 font-semibold bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Score: {score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <Trophy className="w-3.5 h-3.5" />
          <span>Best: {highScore}</span>
        </div>
      </div>

      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={340}
          height={380}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="touch-none cursor-ew-resize"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-100">Snack Catch!</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4 leading-relaxed">
              Slide the basket to catch sweet apples, juicy berries, and golden acorns for Sparky!
            </p>
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{gameOver ? 'Play Again' : 'Start Catching!'}</span>
            </button>
          </div>
        )}
      </div>

      {isPlaying && (
        <div className="w-full flex justify-center pt-3">
          <button
            onClick={stopGame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Finish Run</span>
          </button>
        </div>
      )}
    </div>
  )
}
