const clients = new Map<WebSocket, { username: string | null; joined: boolean }>()
let nextId = 1

function createPlayerName() {
  return `玩家${nextId++}`
}

function getRoomState() {
  const players = Array.from(clients.values())
    .filter((client) => client.joined && client.username)
    .map((client) => client.username as string)

  return {
    roomId: players.length ? 'mj_room_1' : null,
    players,
    count: players.length
  }
}

function broadcast(payload: unknown) {
  const data = JSON.stringify(payload)
  for (const ws of clients.keys()) {
    ws.send(data)
  }
}

const server = Bun.serve({
  port: 3000,
  websocket: {
    open(ws) {
      clients.set(ws, { username: null, joined: false })
      ws.send(JSON.stringify({ type: 'server.connected', message: '已连接到匹配服务' }))
    },
    message(ws, message) {
      if (typeof message !== 'string') return
      let payload
      try {
        payload = JSON.parse(message)
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: '非法消息格式' }))
        return
      }

      const client = clients.get(ws)
      if (!client) return

      if (payload.type === 'match.start') {
        client.joined = true
        client.username = payload.username || client.username || createPlayerName()
        broadcast({ type: 'room.update', roomId: 'mj_room_1', players: getRoomState().players })
      }

      if (payload.type === 'match.stop') {
        client.joined = false
        broadcast({ type: 'room.update', roomId: getRoomState().roomId, players: getRoomState().players })
      }
    },
    close(ws) {
      clients.delete(ws)
      broadcast({ type: 'room.update', roomId: getRoomState().roomId, players: getRoomState().players })
    }
  }
})

console.log(`WebSocket match server running at ws://localhost:${server.port}`)
