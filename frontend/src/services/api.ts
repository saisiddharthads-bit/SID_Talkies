import type { MemoryItem, ResearchReport, StructuredReply, CompanionMode } from '../types'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000/api/v1'

class ApiService {
  private baseUrl: string = localStorage.getItem('sid_api_url') || DEFAULT_BASE_URL
  private token: string | null = localStorage.getItem('sid_auth_token')
  public isOfflineMode: boolean = false

  setBaseUrl(url: string) {
    this.baseUrl = url
    localStorage.setItem('sid_api_url', url)
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('sid_auth_token', token)
  }

  getToken(): string | null {
    return this.token
  }

  clearSession() {
    this.token = null
    localStorage.removeItem('sid_auth_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (this.token) {
      try {
        const res = await fetch(`${this.baseUrl}/auth/me`, {
          headers: this.getHeaders(),
        })
        if (res.ok) {
          this.isOfflineMode = false
          return true
        }
      } catch (err) {
        console.warn('Backend server unreachable, switching to offline companion mode.', err)
        this.isOfflineMode = true
        return false
      }
    }

    // Auto-login or register guest user
    const guestEmail = `guest_${Math.floor(Math.random() * 899999 + 100000)}@companion.local`
    const guestPass = 'companion_guest_pass_123'

    try {
      const regRes = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail, password: guestPass }),
      })

      if (regRes.ok) {
        const data = await regRes.json()
        this.setToken(data.access_token)
        this.isOfflineMode = false
        return true
      }
    } catch {
      this.isOfflineMode = true
      return false
    }

    return false
  }

  async sendChatMessage(message: string, touchContext?: string): Promise<StructuredReply> {
    // If backend is offline or fails, return intelligent offline simulation
    if (this.isOfflineMode || !this.token) {
      return this.generateOfflineReply(message, touchContext)
    }

    try {
      const res = await fetch(`${this.baseUrl}/chat/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message,
          touch_context: touchContext,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        return data.reply
      }
    } catch (err) {
      console.warn('Chat request failed, using local offline companion brain:', err)
      this.isOfflineMode = true
    }

    return this.generateOfflineReply(message, touchContext)
  }

  private generateOfflineReply(message: string, touchContext?: string): StructuredReply {
    const lower = (message + ' ' + (touchContext || '')).toLowerCase()

    if (touchContext === 'pet' || lower.includes('pet')) {
      return {
        text: 'Purrr... that feels so soothing and warm! Thank you for the gentle pats!',
        expression: 'happy',
        animation: 'pet_react',
        speech_style: 'friendly',
      }
    }
    if (touchContext === 'tickle' || lower.includes('tickle')) {
      return {
        text: 'Hahahaha! That tickles so much! You are making me giggle nonstop!',
        expression: 'surprised',
        animation: 'tap_react',
        speech_style: 'playful',
      }
    }
    if (touchContext === 'feed' || lower.includes('feed') || lower.includes('snack')) {
      return {
        text: 'Nom nom nom! That was super crunchy and delicious! You are the best friend ever!',
        expression: 'happy',
        animation: 'dance',
        speech_style: 'playful',
      }
    }
    if (touchContext === 'tap') {
      return {
        text: 'Boop! You poked my nose! I am wide awake and ready for fun!',
        expression: 'surprised',
        animation: 'tap_react',
        speech_style: 'friendly',
      }
    }
    if (lower.includes('sleep') || lower.includes('tired')) {
      return {
        text: 'Yaaawn... curl up and have sweet dreams. I will watch over the room while you rest!',
        expression: 'sleepy',
        animation: 'idle',
        speech_style: 'soft',
      }
    }
    if (lower.includes('dance')) {
      return {
        text: "Let's party! Check out my sweet moves! Woohoo!",
        expression: 'happy',
        animation: 'dance',
        speech_style: 'playful',
      }
    }
    if (lower.includes('research') || lower.includes('explain') || lower.includes('what is')) {
      return {
        text: `I'd love to explore '${message}' with you! Switch over to the Research tab to see in-depth facts and citations!`,
        expression: 'thinking',
        animation: 'thinking_loop',
        speech_style: 'serious',
        suggested_action: { type: 'show_research_report', payload: { query: message } },
      }
    }

    return {
      text: `I'm listening! You said: "${message}". What shall we explore together next?`,
      expression: 'curious',
      animation: 'idle',
      speech_style: 'friendly',
    }
  }

  async fetchMemories(): Promise<MemoryItem[]> {
    if (this.isOfflineMode || !this.token) {
      const saved = localStorage.getItem('sid_offline_memories')
      return saved ? JSON.parse(saved) : [
        { id: '1', user_id: 'guest', memory_text: 'Prefers gentle conversation and playful humor', category: 'preference', created_at: new Date().toISOString() },
        { id: '2', user_id: 'guest', memory_text: 'Building the SID_Talkies companion app', category: 'goal', created_at: new Date().toISOString() }
      ]
    }

    try {
      const res = await fetch(`${this.baseUrl}/memory/`, { headers: this.getHeaders() })
      if (res.ok) return await res.json()
    } catch {
      this.isOfflineMode = true
    }
    return []
  }

  async addMemory(memory_text: string, category: string): Promise<boolean> {
    if (this.isOfflineMode || !this.token) {
      const current = await this.fetchMemories()
      current.unshift({
        id: String(Date.now()),
        user_id: 'guest',
        memory_text,
        category,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem('sid_offline_memories', JSON.stringify(current))
      return true
    }

    try {
      const res = await fetch(`${this.baseUrl}/memory/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ memory_text, category }),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    if (this.isOfflineMode || !this.token) {
      const current = await this.fetchMemories()
      const filtered = current.filter(m => m.id !== memoryId)
      localStorage.setItem('sid_offline_memories', JSON.stringify(filtered))
      return true
    }

    try {
      const res = await fetch(`${this.baseUrl}/memory/${memoryId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async clearAllMemories(): Promise<boolean> {
    if (this.isOfflineMode || !this.token) {
      localStorage.removeItem('sid_offline_memories')
      return true
    }
    try {
      const res = await fetch(`${this.baseUrl}/memory/all/clear`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })
      return res.ok
    } catch {
      return false
    }
  }

  async conductResearch(query: string): Promise<ResearchReport> {
    if (this.isOfflineMode || !this.token) {
      return {
        query,
        summary: `Local research analysis for topic: "${query}". Multiple references emphasize verification, accuracy, and user privacy.`,
        key_findings: [
          `Key principle: Real-time interactive companions benefit from low-latency state machines and modular architecture.`,
          `Reference sources emphasize strict human-in-the-loop action validation before triggering external system tasks.`,
          `Verified URLs and multi-source cross checking ensure high confidence and reduce hallucinations.`,
        ],
        sources: [
          {
            title: `Documentation & Analysis: ${query}`,
            url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
            snippet: `Foundational overview covering background, architectural paradigms, and latest engineering advancements for ${query}.`,
            published_date: '2026',
          },
          {
            title: `Empirical Research Papers: ${query}`,
            url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
            snippet: `Peer-reviewed studies and benchmarks examining performance, user retention, and multi-modal responsiveness.`,
            published_date: '2026',
          },
        ],
      }
    }

    try {
      const res = await fetch(`${this.baseUrl}/research/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, max_sources: 3 }),
      })
      if (res.ok) return await res.json()
    } catch {
      this.isOfflineMode = true
    }

    return this.conductResearch(query)
  }

  async updateSettings(mode: CompanionMode): Promise<boolean> {
    if (this.isOfflineMode || !this.token) return true
    try {
      const res = await fetch(`${this.baseUrl}/settings/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ mode }),
      })
      return res.ok
    } catch {
      return false
    }
  }
}

export const api = new ApiService()
