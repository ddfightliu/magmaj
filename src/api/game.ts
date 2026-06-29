import type { GameState } from '../types/game'

const API_BASE = '/api'

export async function fetchGameState(): Promise<GameState> {
  const response = await fetch(`${API_BASE}/game-state`)
  if (!response.ok) {
    throw new Error('无法获取游戏状态')
  }
  return response.json()
}

export async function saveGameState(state: GameState): Promise<void> {
  const response = await fetch(`${API_BASE}/game-state`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  })
  if (!response.ok) {
    throw new Error('保存游戏状态失败')
  }
}
