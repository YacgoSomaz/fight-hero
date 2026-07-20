# 迁移状态（2026-07-20）

本文件是当前实现的交接基线；`AI_HANDOFF.md` 中标为“未接入/后续”的段落属于迁移前的逆向笔记，不覆盖本文件。

| 范围 | 当前实现 | 原始依据 |
|---|---|---|
| UnitMC | 449 张导出帧已在 `assets/reverse/unitmc-frames/`；引擎按原始帧标签区间选帧，渲染层取可玩单位裁剪。 | `UnitMC.as`，符号 669 |
| 动作 | `run`、`jump`、`fall`、`duck`、`duckrun`、`getup`、`climbsmall`、`climbbig`、`landhard`、`reload` 状态。 | `UnitMC.as`、`Movement.as`、`Guns.as` |
| 武器/受击 | 30 发弹匣、90 发备弹、自动/手动换弹、子弹命中、受击闪烁、击倒、计分和复活。 | `Guns.as`、`Unit.as` |
| 墙体 | 浏览器从符号 1261 的 PNG alpha 解码墙体；角色、子弹和 AI 统一查询它。 | `Arena.as`、`Movement.hitTest()` |
| AI | 12 帧错峰选敌、450 距离限制、墙体视线、平滑追瞄、射击及近距离蹲伏。 | `AI.as` |
| 菜单/音频/存档 | 难度、菜单音乐/静音、开始与重置；174 条原 SWF 音频；`localStorage` 保存设置和计分。 | `Menu.as`、DefineSound 导出 |
| 多人 | 两席私有房间。`POST /api/rooms/:room/join` 分配令牌；`input` 接口在服务器引擎中验证并推进状态，客户端只绘制快照。 | 新增的服务器权威适配层 |

## 已验证

- `npm test`：24/24 通过。
- `node --check server.mjs`、`src/main.mjs`、`src/audio.mjs`、`src/online.mjs` 通过。
- 本机端到端验证：两个客户端加入同一房间分别得到 `p1`/`p2`；提交输入返回两个玩家快照；墙体 PNG 与 MP3 均返回 HTTP 200。

## 有意保留的差异

- 这是 Canvas/Node 迁移，不是 Flash 运行时；复杂职业、战役目标、完整导航网与原版所有枪械并未逐项复刻。
- 单机测试保留矩形平台回退；浏览器 Foundry 场景加载墙体 alpha 后使用像素碰撞。
- 私有房间目前是 HTTP 快照同步，适合本机或受控网络验证，不是公网匹配服务。
