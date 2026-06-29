/**
 * 麻将游戏匹配服务器
 * 使用 Bun 原生 WebSocket 实现玩家连接管理、房间状态同步、匹配通知等功能
 * 负责: 1) 维护在线玩家列表 2) 处理匹配开始/停止消息 3) 广播房间状态更新
 */

// 客户端连接映射: WebSocket -> { 玩家名称, 是否已加入匹配 }
const clients = new Map<WebSocket, { username: string | null; joined: boolean }>()
// 玩家ID计数器，用于自动生成玩家名称
let nextId = 1

/**
 * 自动生成玩家名称（玩家1, 玩家2, ...）
 */
function createPlayerName() {
  return `玩家${nextId++}`
}

/**
 * 获取当前房间状态
 * 返回房间ID、已加入匹配的玩家列表和玩家数量
 */
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

/**
 * 广播消息给所有连接的客户端
 * 将消息序列化为 JSON 字符串后发送
 */
function broadcast(payload: unknown) {
  const data = JSON.stringify(payload)
  for (const ws of clients.keys()) {
    ws.send(data)
  }
}

/**
 * 启动 Bun HTTP/WebSocket 服务器
 * 端口: 3000
 * HTTP 接口返回服务器运行状态提示
 * WebSocket 接口处理玩家连接、消息、断开等事件
 */
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    // HTTP 请求仅用于服务器健康检查，前端页面由 Vite 提供
    return new Response('magmaj match server running', {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    })
  },
  websocket: {

    /**
     * 新客户端连接事件
     * 初始化客户端状态并发送连接成功通知
     */
    open(ws) {
      clients.set(ws, { username: null, joined: false })
      ws.send(JSON.stringify({ type: 'server.connected', message: '已连接到匹配服务' }))
    },

    /**
     * 接收客户端消息事件
     * 处理:
     * 1) match.start - 玩家加入匹配，设置玩家名称并广播房间状态
     * 2) match.stop - 玩家退出匹配，广播房间状态更新
     */
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

      // 玩家加入匹配
      if (payload.type === 'match.start') {
        client.joined = true
        client.username = payload.username || client.username || createPlayerName()
        broadcast({ type: 'room.update', roomId: 'mj_room_1', players: getRoomState().players })
      }

      // 玩家退出匹配
      if (payload.type === 'match.stop') {
        client.joined = false
        broadcast({ type: 'room.update', roomId: getRoomState().roomId, players: getRoomState().players })
      }
    },

    /**
     * 客户端断开连接事件
     * 移除客户端并广播房间状态更新
     */
    close(ws) {
      clients.delete(ws)
      broadcast({ type: 'room.update', roomId: getRoomState().roomId, players: getRoomState().players })
    }
  }
})

console.log(`WebSocket match server running at ws://localhost:${server.port}`)