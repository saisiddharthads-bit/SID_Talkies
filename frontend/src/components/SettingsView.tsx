import React, { useState, useEffect } from 'react'
import {
  Settings,
  Shield,
  UserX,
  Server,
  Check,
  Heart,
  Briefcase,
  GraduationCap,
  Calendar,
  MessageSquare,
  Globe,
  Sliders,
  Play,
} from 'lucide-react'
import type { CompanionMode } from '../types'
import { api } from '../services/api'
import { voice, SUPPORTED_LANGUAGES } from '../services/voice'

interface SettingsViewProps {
  currentMode: CompanionMode
  onModeChange: (mode: CompanionMode) => void
  onLanguageChange?: (langCode: string) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentMode,
  onModeChange,
  onLanguageChange,
}) => {
  const [apiUrl, setApiUrl] = useState<string>(api.getBaseUrl())
  const [statusMsg, setStatusMsg] = useState<string>('')

  // Voice studio state
  const [selectedLang, setSelectedLang] = useState<string>(() => voice.getCurrentLanguage())
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(
    () => voice.getCurrentVoice()?.voiceURI || ''
  )
  const [pitch, setPitch] = useState<number>(() => voice.getPitch())
  const [rate, setRate] = useState<number>(() => voice.getRate())

  useEffect(() => {
    const updateVoices = () => {
      const voices = voice.getVoicesForLanguage(selectedLang)
      const list = voices.length > 0 ? voices : voice.getAllVoices()
      setAvailableVoices(list)
      setSelectedVoiceURI(voice.getCurrentVoice()?.voiceURI || '')
    }

    updateVoices()
    voice.onVoicesLoaded = updateVoices
  }, [selectedLang])

  const modes: { id: CompanionMode; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'friend',
      name: 'Friend',
      desc: 'Warm, casual, funny, and supportive companion.',
      icon: <MessageSquare className="w-4 h-4 text-orange-400" />,
    },
    {
      id: 'romantic',
      name: 'Fictional Romantic',
      desc: 'Affectionate dialogue, cute dates, strictly fictional boundary.',
      icon: <Heart className="w-4 h-4 text-pink-400" />,
    },
    {
      id: 'business',
      name: 'Business Assistant',
      desc: 'Objective, analytical, reports, emails, concise summaries.',
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'student',
      name: 'Student Coach',
      desc: 'Socratic teaching, step-by-step guides, practice quizzes.',
      icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'everyday',
      name: 'Everyday Assistant',
      desc: 'Routines, reminders, task planning, calm structure.',
      icon: <Calendar className="w-4 h-4 text-purple-400" />,
    },
  ]

  const handleModeSelect = async (mode: CompanionMode) => {
    onModeChange(mode)
    await api.updateSettings(mode)
    setStatusMsg(`Mode updated to ${mode.toUpperCase()}`)
    setTimeout(() => setStatusMsg(''), 2500)
  }

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode)
    voice.setLanguage(langCode)
    onLanguageChange?.(langCode)
    const matching = voice.getVoicesForLanguage(langCode)
    setAvailableVoices(matching.length > 0 ? matching : voice.getAllVoices())
    setSelectedVoiceURI(voice.getCurrentVoice()?.voiceURI || '')
    setStatusMsg('Language updated!')
    setTimeout(() => setStatusMsg(''), 2000)
  }

  const handleVoiceChange = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI)
    voice.setVoice(voiceURI)
    setStatusMsg('Voice persona updated!')
    setTimeout(() => setStatusMsg(''), 2000)
  }

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch)
    voice.setPitch(newPitch)
  }

  const handleRateChange = (newRate: number) => {
    setRate(newRate)
    voice.setRate(newRate)
  }

  const handleTestVoice = () => {
    voice.testVoice()
  }

  const handleSaveUrl = () => {
    api.setBaseUrl(apiUrl.trim())
    setStatusMsg('Backend API URL saved.')
    setTimeout(() => setStatusMsg(''), 2500)
  }

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'WARNING: This will permanently delete your account, memories, and conversations. Proceed?'
      )
    ) {
      api.clearSession()
      window.location.reload()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden p-4 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-100">Companion Settings</h2>
        </div>
        {statusMsg && (
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
            {statusMsg}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
        {/* Multi-Language & Voice Studio */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-slate-200 font-bold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-orange-400" />
              <span>Voice & Language Studio</span>
            </label>
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-semibold text-[11px] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Test Voice</span>
            </button>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Target Language (Speaking & Listening):
            </label>
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} — {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Personality Selector */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Voice Personality / Accent:</label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            >
              {availableVoices.length > 0 ? (
                availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value="">Default System Voice</option>
              )}
            </select>
          </div>

          {/* Pitch & Speed Sliders */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Voice Tone & Dynamics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Voice Pitch</span>
                  <span className="text-orange-400 font-bold">{pitch.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Deep</span>
                  <span>Playful</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Speaking Rate</span>
                  <span className="text-orange-400 font-bold">{rate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={rate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 h-1.5 bg-slate-850 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Calm</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-slate-300 font-semibold mb-2">Companion Persona Mode</label>
          <div className="space-y-2">
            {modes.map((m) => {
              const active = currentMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeSelect(m.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    active
                      ? 'bg-slate-900 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800/80 mt-0.5 shrink-0">{m.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-100 text-xs">{m.name}</h4>
                      {active && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Server Connection */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Backend Server URL</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000/api/v1"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleSaveUrl}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs active:scale-95 transition-all cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Privacy & Account Erasure */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Privacy & Data Protection</span>
          </label>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-xs active:scale-95 transition-all cursor-pointer"
          >
            <UserX className="w-4 h-4" />
            <span>Permanent Account & Data Erasure</span>
          </button>
        </div>
      </div>
    </div>
  )
}
