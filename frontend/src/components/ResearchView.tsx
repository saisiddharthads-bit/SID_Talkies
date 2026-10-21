import React, { useState } from 'react'
import { Search, ExternalLink, BookOpen, CheckCircle2 } from 'lucide-react'
import type { ResearchReport } from '../types'
import { api } from '../services/api'

export const ResearchView: React.FC = () => {
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [report, setReport] = useState<ResearchReport | null>(null)

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    try {
      const data = await api.conductResearch(query.trim())
      setReport(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden p-4 shadow-2xl">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h2 className="text-sm font-bold text-slate-100">Research Agent</h2>
      </div>

      <form onSubmit={handleResearch} className="my-3 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask research question (e.g. AI trends in 2026)..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? 'Searching...' : 'Explore'}</span>
        </button>
      </form>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 animate-pulse">
            <Search className="w-6 h-6 text-emerald-400 animate-spin" />
            <p>Gathering evidence and citing sources...</p>
          </div>
        ) : !report ? (
          <div className="text-center py-12 text-slate-500">
            Type any question or topic above. Sparky will search the web, analyze sources, and format verified findings with direct links!
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
              </h3>
              <p className="text-slate-200 leading-relaxed">{report.summary}</p>
            </div>

            {/* Key Findings */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Key Takeaways</h3>
              <ul className="space-y-1.5">
                {report.key_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sources & Citations */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verified Sources</h3>
              <div className="space-y-1.5">
                {report.sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 text-emerald-400 font-semibold group-hover:underline">
                      <span className="truncate">{s.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{s.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
