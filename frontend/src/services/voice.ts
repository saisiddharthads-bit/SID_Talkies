// Voice Engine: Native Speech Synthesis (TTS) and Speech Recognition (STT)

export interface VoiceState {
  isSpeaking: boolean
  isListening: boolean
  isMuted: boolean
  supported: {
    tts: boolean
    stt: boolean
  }
}

class VoiceEngine {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null
  private recognition: any = null
  private preferredVoice: SpeechSynthesisVoice | null = null
  private isMuted: boolean = false
  private isListeningActive: boolean = false

  constructor() {
    this.isMuted = localStorage.getItem('sid_voice_muted') === 'true'
    this.initVoices()
    this.initRecognition()
  }

  private initVoices() {
    if (!this.synth) return

    const loadVoices = () => {
      const voices = this.synth?.getVoices() || []
      // Prefer high-quality, friendly, or female/youthful English voices for Sparky
      this.preferredVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('David'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null
    }

    loadVoices()
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
    }
  }

  public isTTSSupported(): boolean {
    return !!this.synth
  }

  public isSTTSupported(): boolean {
    return !!this.recognition
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    localStorage.setItem('sid_voice_muted', String(muted))
    if (muted && this.synth) {
      this.synth.cancel()
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Speaks the given text using speech synthesis with emotional tone tuning.
   */
  public speak(
    text: string,
    options?: {
      expression?: string
      onStart?: () => void
      onEnd?: () => void
      onError?: (err: any) => void
    }
  ) {
    if (!this.synth || this.isMuted) {
      options?.onEnd?.()
      return
    }

    // Cancel any ongoing speech
    this.synth.cancel()

    // Clean text of emojis and asterisks for smooth pronunciation
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*/g, '')
      .trim()

    if (!cleanText) {
      options?.onEnd?.()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice
    }

    // Tune pitch and rate based on emotional expression
    switch (options?.expression) {
      case 'happy':
        utterance.pitch = 1.3
        utterance.rate = 1.1
        break
      case 'surprised':
        utterance.pitch = 1.4
        utterance.rate = 1.15
        break
      case 'sleepy':
        utterance.pitch = 0.9
        utterance.rate = 0.85
        break
      case 'thinking':
        utterance.pitch = 1.05
        utterance.rate = 0.95
        break
      case 'curious':
        utterance.pitch = 1.2
        utterance.rate = 1.0
        break
      default:
        utterance.pitch = 1.2
        utterance.rate = 1.05
    }

    utterance.onstart = () => {
      options?.onStart?.()
    }

    utterance.onend = () => {
      options?.onEnd?.()
    }

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e)
      options?.onError?.(e)
      options?.onEnd?.()
    }

    try {
      this.synth.speak(utterance)
    } catch (e) {
      console.warn('Failed to invoke speech synthesis:', e)
      options?.onEnd?.()
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  /**
   * Starts listening to user's voice via microphone.
   */
  public startListening(callbacks: {
    onResult: (finalText: string) => void
    onInterim?: (interimText: string) => void
    onError?: (errorMsg: string) => void
    onStart?: () => void
    onEnd?: () => void
  }): boolean {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android browser.')
      return false
    }

    if (this.isListeningActive) {
      this.stopListening()
      return false
    }

    // Stop speaking while listening to prevent hearing itself
    this.stopSpeaking()

    let finalTranscript = ''

    this.recognition.onstart = () => {
      this.isListeningActive = true
      callbacks.onStart?.()
    }

    this.recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }

      if (interim) {
        callbacks.onInterim?.(interim)
      }
      if (finalTranscript) {
        callbacks.onResult(finalTranscript.trim())
      }
    }

    this.recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error)
      this.isListeningActive = false
      let msg = 'Could not hear audio. Please check microphone permissions.'
      if (event.error === 'not-allowed') {
        msg = 'Microphone access was denied. Please allow microphone permissions in your browser.'
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please speak closer to the microphone.'
      }
      callbacks.onError?.(msg)
    }

    this.recognition.onend = () => {
      this.isListeningActive = false
      callbacks.onEnd?.()
    }

    try {
      this.recognition.start()
      return true
    } catch (err) {
      console.warn('Failed to start speech recognition:', err)
      this.isListeningActive = false
      callbacks.onError?.('Could not activate microphone. Please try again.')
      return false
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop()
      } catch {}
      this.isListeningActive = false
    }
  }

  public isListening(): boolean {
    return this.isListeningActive
  }
}

export const voice = new VoiceEngine()
