import type { SkillConfig, SkillEffect } from '../../types/skill'

export const skillConfigs: Record<string, SkillConfig> = {
  starShift: {
    id: 'starShift',
    name: '星移换序',
    description: '刚摸手牌与牌堆下一张静默互换',
    cost: 2,
    maxUses: 1,
    category: 'tempo',
    unlockLevel: 1,
    perRoundLimit: 1
  },
  cloudLock: {
    id: 'cloudLock',
    name: '云锁危张',
    description: '本轮出牌绝对不点炮，防守兜底',
    cost: 1,
    maxUses: 2,
    category: 'defense',
    unlockLevel: 1,
    perRoundLimit: 2
  },
  lightTrace: {
    id: 'lightTrace',
    name: '溯光窥型',
    description: '查看对手手牌倾向与听牌状态',
    cost: 1,
    maxUses: 2,
    category: 'reveal',
    unlockLevel: 1,
    perRoundLimit: 2
  },
  moonGlow: {
    id: 'moonGlow',
    name: '月盈增韵',
    description: '被动技能：连续3轮无有效进张自动触发',
    cost: 0,
    maxUses: 1,
    category: 'support',
    unlockLevel: 1,
    perRoundLimit: 1,
    passive: true
  },
  petalChange: {
    id: 'petalChange',
    name: '花语转牌',
    description: '指定1张手牌替换为牌堆随机牌',
    cost: 2,
    maxUses: 1,
    category: 'support',
    unlockLevel: 3,
    perRoundLimit: 1
  },
  starShield: {
    id: 'starShield',
    name: '星盾护体',
    description: '下一次被点炮伤害减半',
    cost: 1,
    maxUses: 1,
    category: 'defense',
    unlockLevel: 5,
    perRoundLimit: 1
  },
  speedBurst: {
    id: 'speedBurst',
    name: '流光加速',
    description: '本回合操作时间+15秒',
    cost: 1,
    maxUses: 2,
    category: 'utility',
    unlockLevel: 2,
    perRoundLimit: 2
  },
  windExchange: {
    id: 'windExchange',
    name: '梦蝶换风',
    description: '与下家交换1张手牌',
    cost: 2,
    maxUses: 1,
    category: 'support',
    unlockLevel: 7,
    perRoundLimit: 1
  }
}

export function activateSkill(id: string): SkillEffect {
  const config = skillConfigs[id]
  if (!config) {
    return { success: false, message: '技能未找到' }
  }
  return {
    success: true,
    message: `技能【${config.name}】已发动`,
    detail: config.description
  }
}
