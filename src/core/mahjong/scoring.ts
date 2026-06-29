export interface ScoreResult {
  han: number
  fu: number
  basePoints: number
  totalPoints: number
  limit: LimitName
}

export function roundFu(fu: number): number {
  return Math.ceil(fu / 10) * 10
}

export function calculateBasePoints(han: number, fu: number): number {
  return Math.round(fu * Math.pow(2, han + 2))
}

export type LimitName = 'none' | 'mangan' | 'haneman' | 'baiman' | 'sanbaiman' | 'yakuman'

export function computeLimitBase(han: number, fu: number): { limit: LimitName; basePoints: number } {
  const roundedFu = roundFu(fu)
  const rawBase = calculateBasePoints(han, roundedFu)

  if (han >= 13) return { limit: 'yakuman', basePoints: 8000 }
  if (han >= 11) return { limit: 'sanbaiman', basePoints: 6000 }
  if (han >= 8) return { limit: 'baiman', basePoints: 4000 }
  if (han >= 6) return { limit: 'haneman', basePoints: 3000 }

  if (han >= 5 || rawBase >= 2000) return { limit: 'mangan', basePoints: 2000 }

  return { limit: 'none', basePoints: rawBase }
}

function roundToHundred(n: number) {
  return Math.ceil(n / 100) * 100
}

export interface PaymentResult {
  winnerGain: number
  payments: Record<string, number>
  basePoints: number
  limit: LimitName
  han: number
  fu: number
}

export function calculatePayments(han: number, fu: number, opts: { isTsumo: boolean; isDealer: boolean; playerCount?: number }): PaymentResult {
  const playerCount = opts.playerCount ?? 4
  const { limit, basePoints } = computeLimitBase(han, fu)

  const payments: Record<string, number> = {}

  if (!opts.isTsumo) {
    const mult = opts.isDealer ? 6 : 4
    const payment = roundToHundred(basePoints * mult)
    payments['ron'] = payment
    return { winnerGain: payment, payments, basePoints, limit, han, fu }
  }

  if (opts.isDealer) {
    const share = roundToHundred(basePoints * 2)
    for (let i = 0; i < playerCount - 1; i++) payments[`p${i + 1}`] = share
    const winnerGain = share * (playerCount - 1)
    return { winnerGain, payments, basePoints, limit, han, fu }
  }

  const dealerShare = roundToHundred(basePoints * 2)
  const otherShare = roundToHundred(basePoints * 1)
  if (playerCount === 4) {
    payments['dealer'] = dealerShare
    payments['nonDealer1'] = otherShare
    payments['nonDealer2'] = otherShare
    const winnerGain = dealerShare + otherShare * 2
    return { winnerGain, payments, basePoints, limit, han, fu }
  }

  if (playerCount === 3) {
    payments['dealer'] = dealerShare
    payments['other'] = otherShare
    const winnerGain = dealerShare + otherShare
    return { winnerGain, payments, basePoints, limit, han, fu }
  }

  if (playerCount === 2) {
    const single = roundToHundred(basePoints * 4)
    payments['opponent'] = single
    return { winnerGain: single, payments, basePoints, limit, han, fu }
  }

  payments['others'] = roundToHundred(basePoints)
  return { winnerGain: payments['others'], payments, basePoints, limit, han, fu }
}

export function calculateScore(han: number, fu: number): ScoreResult {
  const roundedFu = roundFu(fu)
  const { limit, basePoints } = computeLimitBase(han, roundedFu)
  const totalPoints = basePoints
  return { han, fu: roundedFu, basePoints, totalPoints, limit }
}

export const YAKUMAN_LIST = [
  '国士无双', '小四喜', '大四喜', '字一色', '绿一色', 
  '清老头', '四杠子', '四暗刻', '四暗刻单骑', '天和', '地和', '人和'
]

export function isYakuman(yaku: string[]): boolean {
  return yaku.some(y => YAKUMAN_LIST.includes(y))
}

export function formatLimit(limit: LimitName): string {
  const names: Record<LimitName, string> = {
    none: '',
    mangan: '满贯',
    haneman: '跳满',
    baiman: '倍满',
    sanbaiman: '三倍满',
    yakuman: '役满'
  }
  return names[limit]
}