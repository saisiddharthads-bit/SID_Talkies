export type Expression = 'idle' | 'happy' | 'curious' | 'surprised' | 'sleepy' | 'listening' | 'thinking'

export type AnimationType = 'idle' | 'tap_react' | 'pet_react' | 'wave' | 'dance' | 'thinking_loop'

export type CompanionMode = 'friend' | 'romantic' | 'business' | 'student' | 'everyday'

export interface StructuredReply {
  text: string
  expression: Expression
  animation: AnimationType
  speech_style: string
  suggested_action?: {
    type: string
    requires_confirmation?: boolean
    payload?: Record<string, any>
  }
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  expression?: Expression
  animation?: AnimationType
  timestamp: string
}

export interface MemoryItem {
  id: string
  user_id: string
  memory_text: string
  category: string
  created_at: string
}

export interface SourceReference {
  title: string
  url: string
  snippet: string
  published_date?: string
}

export interface ResearchReport {
  query: string
  summary: string
  key_findings: string[]
  sources: SourceReference[]
  conflicts_or_uncertainties?: string
}

export interface UserSettings {
  mode: CompanionMode
  character_id: string
  voice_id: string
  memory_enabled: boolean
  quiet_hours_enabled: boolean
}
