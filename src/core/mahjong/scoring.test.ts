import { describe, expect, it } from 'vitest'
import { calculatePayments } from './scoring'

describe('scoring', () => {
  it('calculates ron payment for non-dealer', () => {
    const result = calculatePayments(2, 30, { isTsumo: false, isDealer: false, playerCount: 4 })
    expect(result.payments.ron).toBeGreaterThan(0)
    expect(result.winnerGain).toBe(result.payments.ron)
  })

  it('calculates tsumo payment for dealer', () => {
    const result = calculatePayments(1, 30, { isTsumo: true, isDealer: true, playerCount: 4 })
    expect(result.payments.p1).toBe(result.payments.p2)
    expect(result.winnerGain).toBe(result.payments.p1 * 3)
  })

  it('caps yakuman correctly', () => {
    const result = calculatePayments(13, 30, { isTsumo: false, isDealer: false, playerCount: 4 })
    expect(result.basePoints).toBe(8000)
    expect(result.limit).toBe('yakuman')
  })
})
