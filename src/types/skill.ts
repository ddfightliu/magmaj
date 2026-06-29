export type SkillCategory = 'defense' | 'support' | 'tempo' | 'reveal' | 'utility'
export type SkillId =
  | 'starShift'
  | 'cloudLock'
  | 'lightTrace'
  | 'moonGlow'
  | 'petalChange'
  | 'starShield'
  | 'speedBurst'
  | 'windExchange'

export interface SkillConfig {
  id: SkillId
  name: string
  description: string
  cost: number
  maxUses: number
  category: SkillCategory
  unlockLevel: number
  perRoundLimit: number
  passive?: boolean
}

export interface SkillEffect {
  success: boolean
  message: string
  detail?: string
}

export interface SkillState {
  usedTimes: number
  available: boolean
}
