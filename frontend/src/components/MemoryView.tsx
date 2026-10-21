import React, { useState, useEffect } from 'react'
import { Brain, Trash2, Plus, ShieldCheck, Tag } from 'lucide-react'
import type { MemoryItem } from '../types'
import { api } from '../services/api'

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [inputText, setInputText] = useState<string>('')
  const [category, setCategory] = useState<string>('preference')
  const [isAdding, setIsAdding] = useState<boolean>(false)

  const loadMemories = async () => {
    setLoading(true)
    try {
      const data = await api.fetchMemories()
      setMemories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const ok = await api.addMemory(inputText.trim(), category)
    if (ok) {
      setInputText('')
      setIsAdding(false)
      loadMemories()
    }
  }

  const handleDelete = async (id: string) => {
    await api.deleteMemory(id)
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to wipe all saved memories? This cannot be undone.')) {
      await api.clearAllMemories()
      setMemories([])
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden p-4 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100">Memory Vault</h2>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Wipe All</span>
        </button>
      </div>

      <div className="my-2.5 flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Sparky only remembers facts you approve. You retain 100% control.</span>
      </div>

      {/* Add Memory trigger */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-1.5 w-full py-2 mb-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-xs font-semibold text-slate-200 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-orange-400" />
          <span>Add Approved Memory</span>
        </button>
      ) : (
        <form onSubmit={handleAdd} className="p-3 mb-3 bg-slate-900 rounded-xl border border-slate-700/80 space-y-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., I love drinking green tea every morning..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="preference">Preference</option>
              <option value="goal">Goal</option>
              <option value="fact">Fact</option>
              <option value="schedule">Schedule</option>
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-orange-500 text-slate-950 text-xs font-semibold hover:bg-orange-600 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Memories List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 animate-pulse">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No saved memories yet. Click above to add your first approved fact!
          </div>
        ) : (
          memories.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              <div className="space-y-1 pr-2">
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  <Tag className="w-2.5 h-2.5" />
                  {m.category}
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">{m.memory_text}</p>
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0 cursor-pointer"
                title="Delete memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
