// Voice Engine: Multi-Language Speech Synthesis (TTS) & Multi-Language Recognition (STT)
import type { LanguageOption } from '../types'

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸', greeting: "Hello! I'm Sparky, your cheerful AI companion!" },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧', greeting: "Cheerio! Lovely to see you today!" },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', greeting: "नमस्ते! मैं स्पार्की हूँ, आपका प्यारा साथी!" },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', greeting: "నమస్కారం! నేను స్పార్కీ, మీ సహాయకుడిని!" },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', greeting: "வணக்கம்! நான் ஸ்பார்க்கி, உங்கள் துணைவன்!" },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', greeting: "¡Hola! Soy Sparky, tu compañero virtual!" },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽', greeting: "¡Hola amigo! ¿Qué tal tu día?" },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', greeting: "Bonjour! Je suis Sparky, votre compagnon fidèle!" },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', greeting: "Hallo! Ich bin Sparky, dein Begleiter!" },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', greeting: "Ciao! Sono Sparky, il tuo amico virtuale!" },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', greeting: "Olá! Eu sou o Sparky, seu melhor amigo!" },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: '🇵🇹', greeting: "Olá! Sou o Sparky, o teu companheiro!" },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', greeting: "こんにちは！スパーキーです！今日もよろしくね！" },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', greeting: "안녕하세요! 저는 스파키예요! 만나서 반가워요!" },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)', flag: '🇨🇳', greeting: "你好！我是火花 Sparky，很高兴见到你！" },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)', flag: '🇹🇼', greeting: "你好！我是 Sparky，今天想聊什麼呢？" },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', greeting: "Привет! Я Спарки, твой верный друг!" },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', greeting: "مرحباً! أنا سباركي، رفيقك الوفي!" },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', greeting: "Hallo! Ik ben Sparky, jouw gezellige maatje!" },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', greeting: "Merhaba! Ben Sparky, senin can dostunum!" },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', greeting: "Cześć! Jestem Sparky, twój wierny kompan!" },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', greeting: "Hej! Jag är Sparky, din virtuella vän!" },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', greeting: "Halo! Saya Sparky, teman setia Anda!" },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', greeting: "Xin chào! Tôi là Sparky, bạn đồng hành của bạn!" },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', greeting: "สวัสดีครับ! ผมคือ Sparky เพื่อนของคุณ!" },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', greeting: "নমস্কার! আমি স্পার্কি, আপনার সঙ্গী!" },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', greeting: "नमस्कार! मी स्पार्की, तुमचा मित्र!" },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', greeting: "سلام! میں سپارکی ہوں، آپ کا ساتھی!" },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', greeting: "Γεια σας! Είμαι ο Sparky, ο σύντροφός σας!" },
]

class VoiceEngine {
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null
  private recognition: any = null
  private allVoices: SpeechSynthesisVoice[] = []
  private selectedVoice: SpeechSynthesisVoice | null = null
  private selectedLangCode: string = 'en-US'
  private pitchModifier: number = 1.2
  private rateModifier: number = 1.05
  private isMuted: boolean = false
  private isListeningActive: boolean = false

  public onVoicesLoaded?: () => void

  constructor() {
    this.isMuted = localStorage.getItem('sid_voice_muted') === 'true'
    this.selectedLangCode = localStorage.getItem('sid_voice_lang') || 'en-US'
    this.pitchModifier = parseFloat(localStorage.getItem('sid_voice_pitch') || '1.2')
    this.rateModifier = parseFloat(localStorage.getItem('sid_voice_rate') || '1.05')

    this.initVoices()
    this.initRecognition()
  }

  private initVoices() {
    if (!this.synth) return

    const loadVoices = () => {
      this.allVoices = this.synth?.getVoices() || []
      const savedVoiceURI = localStorage.getItem('sid_voice_uri')

      if (savedVoiceURI) {
        this.selectedVoice = this.allVoices.find((v) => v.voiceURI === savedVoiceURI) || null
      }

      if (!this.selectedVoice) {
        this.selectDefaultVoiceForLang(this.selectedLangCode)
      }

      this.onVoicesLoaded?.()
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
      this.recognition.lang = this.selectedLangCode
    }
  }

  public getAllVoices(): SpeechSynthesisVoice[] {
    return this.allVoices
  }

  public getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
    const prefix = langCode.split('-')[0].toLowerCase()
    return this.allVoices.filter(
      (v) => v.lang.toLowerCase().startsWith(prefix) || v.lang.replace('_', '-').toLowerCase() === langCode.toLowerCase()
    )
  }

  public getCurrentLanguage(): string {
    return this.selectedLangCode
  }

  public setLanguage(langCode: string) {
    this.selectedLangCode = langCode
    localStorage.setItem('sid_voice_lang', langCode)

    if (this.recognition) {
      this.recognition.lang = langCode
    }

    this.selectDefaultVoiceForLang(langCode)
  }

  private selectDefaultVoiceForLang(langCode: string) {
    const matching = this.getVoicesForLanguage(langCode)
    if (matching.length > 0) {
      // Prefer high quality, Google, or Natural voices
      const preferred = matching.find(
        (v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Jenny')
      )
      this.selectedVoice = preferred || matching[0]
      localStorage.setItem('sid_voice_uri', this.selectedVoice.voiceURI)
    } else {
      this.selectedVoice = this.allVoices[0] || null
    }
  }

  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice
  }

  public setVoice(voiceURI: string) {
    const v = this.allVoices.find((x) => x.voiceURI === voiceURI)
    if (v) {
      this.selectedVoice = v
      localStorage.setItem('sid_voice_uri', voiceURI)
      // If voice lang is different, also update langCode
      if (v.lang) {
        this.selectedLangCode = v.lang.replace('_', '-')
        localStorage.setItem('sid_voice_lang', this.selectedLangCode)
        if (this.recognition) {
          this.recognition.lang = this.selectedLangCode
        }
      }
    }
  }

  public getPitch(): number {
    return this.pitchModifier
  }

  public setPitch(pitch: number) {
    this.pitchModifier = pitch
    localStorage.setItem('sid_voice_pitch', String(pitch))
  }

  public getRate(): number {
    return this.rateModifier
  }

  public setRate(rate: number) {
    this.rateModifier = rate
    localStorage.setItem('sid_voice_rate', String(rate))
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

  public testVoice() {
    const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === this.selectedLangCode)
    const testText = currentLang?.greeting || "Hello! I am Sparky, your cheerful AI companion!"
    this.speak(testText, { expression: 'happy' })
  }

  /**
   * Speaks the given text using speech synthesis with chosen language, voice, and emotional tone tuning.
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

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice
      utterance.lang = this.selectedVoice.lang || this.selectedLangCode
    } else {
      utterance.lang = this.selectedLangCode
    }

    // Apply base user sliders + emotional tone offsets
    let pitch = this.pitchModifier
    let rate = this.rateModifier

    switch (options?.expression) {
      case 'happy':
        pitch *= 1.1
        rate *= 1.05
        break
      case 'surprised':
        pitch *= 1.2
        rate *= 1.1
        break
      case 'sleepy':
        pitch *= 0.85
        rate *= 0.85
        break
      case 'thinking':
        pitch *= 0.95
        rate *= 0.95
        break
    }

    utterance.pitch = Math.max(0.5, Math.min(2.0, pitch))
    utterance.rate = Math.max(0.5, Math.min(2.0, rate))

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
   * Starts listening to user's voice via microphone in the selected language.
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

    this.stopSpeaking()

    // Ensure listening in the user's selected language
    this.recognition.lang = this.selectedLangCode

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
