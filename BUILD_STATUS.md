# 星韵麻友 项目状态

## 已完成
- 初始 Bun + Vite + Vue3 + Pinia 架构搭建
- `vue-router` 已接入，并完成 `Home`、`Login`、`Recharge`、`MatchRoom`
- `PixiMahjongTable.vue` 已实现 PixiJS 画布预览
- `src/store/` 扩展为 `game`、`auth`、`match`、`colyseus`
- 对局逻辑与听牌分析已接入 UI
- `bun run build` 和 `bun test src` 均可通过
- 新增 Bun 原生 WebSocket 匹配服务 `server.ts`
- **日麻吃碰杠完整实现**（chi/pon/kan）
- **符数计算系统**（fu calculation）
- **役种检测**（七对子、国士无双、清一色等）
- **分数结算**（自摸/荣牌支付计算）
- **役满牌型支持**（13役满牌型）
- **立直功能**（riichi）

## 进行中
- [√] 前端路由与业务页面搭建
- [√] Pinia 状态管理与业务 store 构建
- [√] Mahjong 业务逻辑与 UI 集成
- [√] PixiJS 牌桌预览组件实现
- [√] WebSocket/匹配服务基础骨架搭建
- [√] 完整日麻吃碰杠与符数结算
- [ ] Colyseus 房间业务完善与多端联调
- [ ] 语音/社交/商城/段位等业务拓展
- [ ] UniApp 四端适配与页面优化

## 运行命令
- `bun install`
- `bun run dev`
- `bun run build`
- `bun run serve`

## 核心功能清单

### 麻将规则
- [√] 四人/三人/二人对局模式
- [√] 吃(chi)
- [√] 碰(pon)
- [√] 杠(kan) - 明杠/加杠
- [√] 立直(riichi)
- [√] 自摸(tsumo)
- [√] 荣牌(ron)
- [√] 流局(draw)

### 役种检测
- [√] 七对子(chiitoitsu) - 2番
- [√] 断幺九(tanyao) - 1番
- [√] 对对和(toitoi) - 2番
- [√] 清一色(chinitsu) - 6番
- [√] 混一色(honitsu) - 3番
- [√] 役牌(yakuhai) - 1番
- [√] 门清自摸(menzen tsumo) - 1番
- [√] 国士无双(thirteen orphans) - 役满
- [√] 三杠子(sankan) - 2番
- [√] 混老头(honroutou) - 2番

### 符数计算
- [√] 底符(20符)
- [√] 门清加符(10符)
- [√] 自摸加符(2符)
- [√] 顺子加符(2符/4符)
- [√] 刻子加符(4符/8符)
- [√] 杠加符(8符/16符)
- [√] 将牌加符(2符)

### 分数计算
- [√] 基本分计算 (fu * 2^(han+2))
- [√] 满贯/跳满/倍满/三倍满/役满
- [√] 自摸支付分配
- [√] 荣牌支付计算
- [√] 场风/自风计算
- [√] 供托(honba)计算