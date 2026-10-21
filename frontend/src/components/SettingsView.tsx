import React, { useState } from 'react'
import { Settings, Shield, UserX, Server, Check, Heart, Briefcase, GraduationCap, Calendar, MessageSquare } from 'lucide-react'
import type { CompanionMode } from '../types'
import { api } from '../services/api'

interface SettingsViewProps {
  currentMode: CompanionMode
  onModeChange: (mode: CompanionMode) => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentMode, onModeChange }) => {
  const [apiUrl, setApiUrl] = useState<string>(api.getBaseUrl())
  const [statusMsg, setStatusMsg] = useState<string>('')

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

  const handleSaveUrl = () => {
    api.setBaseUrl(apiUrl.trim())
    setStatusMsg('Backend API URL saved.')
    setTimeout(() => setStatusMsg(''), 2500)
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: This will permanently delete your account, memories, and conversations. Proceed?')) {
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
