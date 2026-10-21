import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import type { Expression, AnimationType } from '../types'

interface CharacterCanvasProps {
  expression: Expression
  animation: AnimationType
  isSpeaking: boolean
  onCharacterTouch: (type: 'tap' | 'pet' | 'tickle' | 'feed') => void
}

export const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  expression,
  animation,
  isSpeaking,
  onCharacterTouch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [touchState, setTouchState] = useState<{
    isDown: boolean
    startX: number
    startY: number
    lastX: number
    lastY: number
    dragDist: number
    lastTapTime: number
    tapCount: number
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dragDist: 0,
    lastTapTime: 0,
    tapCount: 0,
  })

  // Pointer position for eye tracking
  const targetLook = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentLook = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Animation values
  const animTime = useRef<number>(0)
  const blinkTimer = useRef<number>(0)
  const isBlinking = useRef<boolean>(false)
  const mouthOpenness = useRef<number>(0)
  const bounceY = useRef<number>(0)
  const rotationAngle = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      animTime.current += 0.03
      const t = animTime.current

      // Handle eye tracking lerp
      currentLook.current.x += (targetLook.current.x - currentLook.current.x) * 0.1
      currentLook.current.y += (targetLook.current.y - currentLook.current.y) * 0.1

      // Blinking timer
      blinkTimer.current += 0.016
      if (blinkTimer.current > 3.8) {
        isBlinking.current = true
        if (blinkTimer.current > 4.05) {
          isBlinking.current = false
          blinkTimer.current = 0
        }
      }

      // Mouth talking animation
      if (isSpeaking) {
        mouthOpenness.current = (Math.sin(t * 14) + 1) * 0.45
      } else {
        mouthOpenness.current += (0 - mouthOpenness.current) * 0.2
      }

      // Dynamic animation motions
      if (animation === 'dance') {
        bounceY.current = -Math.abs(Math.sin(t * 6)) * 25
        rotationAngle.current = Math.sin(t * 5) * 0.16
      } else if (animation === 'tap_react') {
        bounceY.current = -Math.abs(Math.sin(t * 12)) * 15
        rotationAngle.current = Math.sin(t * 14) * 0.08
      } else if (animation === 'pet_react') {
        bounceY.current = -Math.abs(Math.sin(t * 4)) * 18
        rotationAngle.current = Math.sin(t * 3) * 0.04
      } else if (animation === 'thinking_loop') {
        bounceY.current = Math.sin(t * 2) * 5
        rotationAngle.current = 0.08
      } else {
        // Idle breathing
        bounceY.current = Math.sin(t * 2.5) * 4
        rotationAngle.current += (0 - rotationAngle.current) * 0.1
      }

      // Canvas dimensions
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      ctx.save()
      const centerX = width / 2
      const centerY = height / 2 + 30 + bounceY.current

      ctx.translate(centerX, centerY)
      ctx.rotate(rotationAngle.current)

      // --- 1. Ears ---
      const earLeftX = -75
      const earRightX = 75
      const earTopY = -165

      // Left Ear
      ctx.fillStyle = '#f97316' // Orange-500
      ctx.beginPath()
      ctx.moveTo(-50, -70)
      ctx.lineTo(earLeftX - 35, earTopY)
      ctx.lineTo(-15, -95)
      ctx.closePath()
      ctx.fill()

      // Inner Left Ear
      ctx.fillStyle = '#ffedd5' // Cream
      ctx.beginPath()
      ctx.moveTo(-45, -75)
      ctx.lineTo(earLeftX - 25, earTopY + 20)
      ctx.lineTo(-20, -95)
      ctx.closePath()
      ctx.fill()

      // Right Ear
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(50, -70)
      ctx.lineTo(earRightX + 35, earTopY)
      ctx.lineTo(15, -95)
      ctx.closePath()
      ctx.fill()

      // Inner Right Ear
      ctx.fillStyle = '#ffedd5'
      ctx.beginPath()
      ctx.moveTo(45, -75)
      ctx.lineTo(earRightX + 25, earTopY + 20)
      ctx.lineTo(20, -95)
      ctx.closePath()
      ctx.fill()

      // --- 2. Head & Body ---
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.arc(0, 0, 105, 0, Math.PI * 2)
      ctx.fill()

      // Cheeks Cream Patch
      ctx.fillStyle = '#fff7ed'
      ctx.beginPath()
      ctx.ellipse(0, 25, 75, 55, 0, 0, Math.PI * 2)
      ctx.fill()

      // --- 3. Rosy Cheeks ---
      ctx.fillStyle = 'rgba(251, 113, 133, 0.7)' // Rose blush
      ctx.beginPath()
      ctx.arc(-58, 20, 15, 0, Math.PI * 2)
      ctx.arc(58, 20, 15, 0, Math.PI * 2)
      ctx.fill()

      // --- 4. Eyes ---
      const lookOffsetX = currentLook.current.x * 6
      const lookOffsetY = currentLook.current.y * 5
      const eyeLeftX = -38
      const eyeRightX = 38
      const eyeY = -12

      ctx.fillStyle = '#1e293b'

      if (expression === 'sleepy') {
        // Sleepy closed arcs
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(eyeLeftX, eyeY + 4, 14, Math.PI, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(eyeRightX, eyeY + 4, 14, Math.PI, Math.PI * 2)
        ctx.stroke()
      } else if (expression === 'happy' || animation === 'pet_react') {
        // Happy upside down smiling crescents
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 4.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.arc(eyeLeftX, eyeY + 2, 14, 0, Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(eyeRightX, eyeY + 2, 14, 0, Math.PI)
        ctx.stroke()
      } else if (isBlinking.current) {
        // Blinking line
        ctx.strokeStyle = '#1e293b'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(eyeLeftX - 12, eyeY)
        ctx.lineTo(eyeLeftX + 12, eyeY)
        ctx.moveTo(eyeRightX - 12, eyeY)
        ctx.lineTo(eyeRightX + 12, eyeY)
        ctx.stroke()
      } else {
        // Open expressive eyes
        const eyeRadius = expression === 'surprised' ? 18 : 14

        // Sclera/Pupil
        ctx.beginPath()
        ctx.arc(eyeLeftX + lookOffsetX, eyeY + lookOffsetY, eyeRadius, 0, Math.PI * 2)
        ctx.arc(eyeRightX + lookOffsetX, eyeY + lookOffsetY, eyeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Eye highlights (sparkle)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(eyeLeftX + lookOffsetX + 4, eyeY + lookOffsetY - 4, 4.5, 0, Math.PI * 2)
        ctx.arc(eyeRightX + lookOffsetX + 4, eyeY + lookOffsetY - 4, 4.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // --- 5. Button Nose ---
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.ellipse(0, 12, 8, 6, 0, 0, Math.PI * 2)
      ctx.fill()

      // --- 6. Mouth ---
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'

      if (mouthOpenness.current > 0.15) {
        // Talking/Chewing mouth
        ctx.fillStyle = '#e11d48'
        ctx.beginPath()
        ctx.ellipse(0, 26, 12, 10 * mouthOpenness.current * 2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else {
        // Cute cat/fox curved smile
        ctx.beginPath()
        ctx.arc(-8, 24, 7, 0, Math.PI)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(8, 24, 7, 0, Math.PI)
        ctx.stroke()
      }

      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [expression, animation, isSpeaking])

  // Track cursor / finger movements for dynamic pupil gaze
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    targetLook.current = { x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) }

    if (touchState.isDown) {
      const dx = e.clientX - touchState.lastX
      const dy = e.clientY - touchState.lastY
      const newDist = touchState.dragDist + Math.sqrt(dx * dx + dy * dy)

      if (newDist > 70) {
        // Petting motion detected!
        setTouchState((prev) => ({ ...prev, dragDist: 0 }))
        confetti({
          particleCount: 15,
          spread: 45,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          shapes: ['circle'],
          colors: ['#f43f5e', '#fb7185', '#fda4af'],
        })
        onCharacterTouch('pet')
      } else {
        setTouchState((prev) => ({
          ...prev,
          lastX: e.clientX,
          lastY: e.clientY,
          dragDist: newDist,
        }))
      }
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setTouchState({
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      dragDist: 0,
      lastTapTime: touchState.lastTapTime,
      tapCount: touchState.tapCount,
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchState.isDown) return
    const now = Date.now()
    const dx = e.clientX - touchState.startX
    const dy = e.clientY - touchState.startY
    const totalDist = Math.sqrt(dx * dx + dy * dy)

    if (totalDist < 25) {
      // It's a tap or rapid tickle
      const isQuickSuccession = now - touchState.lastTapTime < 600
      const count = isQuickSuccession ? touchState.tapCount + 1 : 1

      if (count >= 3) {
        // Rapid tickle
        onCharacterTouch('tickle')
        confetti({
          particleCount: 20,
          spread: 60,
          origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
          colors: ['#eab308', '#f97316'],
        })
        setTouchState((prev) => ({ ...prev, isDown: false, tapCount: 0, lastTapTime: now }))
        return
      }

      onCharacterTouch('tap')
      setTouchState((prev) => ({ ...prev, isDown: false, tapCount: count, lastTapTime: now }))
    } else {
      setTouchState((prev) => ({ ...prev, isDown: false }))
    }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto flex items-center justify-center select-none touch-none">
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          targetLook.current = { x: 0, y: 0 }
          setTouchState((prev) => ({ ...prev, isDown: false }))
        }}
        className="cursor-pointer active:scale-95 transition-transform duration-75"
        title="Tap, pet (drag), or tickle Sparky!"
      />
    </div>
  )
}
