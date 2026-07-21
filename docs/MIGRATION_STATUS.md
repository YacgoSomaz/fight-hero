# 迁移状态（2026-07-21）

此文件描述仓库的当前运行时基线；更详细的解包依据、数值和接手步骤见 [AI_HANDOFF.md](AI_HANDOFF.md)。

| 范围 | 已实现 | 依据/备注 |
| --- | --- | --- |
| Foundry 地图 | 背景、前景、原 `wallMC`、33 个 `NodePhysBox`、出生点、路径/动作/补给节点。 | `Arena`（1413）显示列表；物理盒原始坐标在 `foundry-layout.mjs`。 |
| 地图碰撞 | 浏览器优先使用解出的 `wallMC` 像素遮罩；仅 Alpha = 255 的像素阻挡。蓝色 `NodePhysBox` 保留为解包校验层和图片加载失败时的回退。 | 与 `Arena.Init()` 把 `wallMC` 绘入 BitmapData、`Movement.hitTest()` 只接受 `ff` Alpha 的原逻辑一致。盒子公共偏移为 X `+18`、Y `+24`。 |
| 步阶/攀爬 | 小于等于 28px 的盒顶抬脚；跳起下落接触 20–56px 的盒沿会进入 `climbsmall`/`climbbig`。 | `Movement.as` 探针语义与原墙体遮罩/蓝色盒校验适配；51 项测试覆盖墙体和盒子攀爬。 |
| UnitMC | 449 帧离散显示列表矩阵，按原标签区间播放。腿、脚、躯干和头使用解出的局部边界。 | 符号 669；运行时数据 `public/assets/unitmc-timeline.json`。 |
| 上半身/M4 | 501/668 的 `rifle` 待机标签第 77 帧，375 的 `M4` 标签第 20 帧，Medic 皮肤子层第 51 帧；枪口、枪火和弹道共线。 | 合成/注册点详见交接报告；额外 `rife_clip` 子层已排除。 |
| 动作 | idle、run/runback、jump、fall/fallloop、duck、duckrun、getup、climbsmall、climbbig、landhard、reload。 | `UNITMC_FRAMES` 采用原始 30 FPS 标签边界。 |
| 武器/对局 | 弹药、换弹、射击、后坐、命中、计分和复活。 | 目前固定为 M4 风格验证武器，不是全枪械表迁移。 |
| AI | 本地 AI 的目标扫描、墙体/盒碰撞视线、巡逻和开火近似。 | 不等同于所有原版模式 AI。 |
| 音频/菜单/存档 | 已接入基本菜单、音频、难度和 `localStorage`。 | 私有本地验证用途。 |
| 私有房间 | HTTP 快照式两席房间原型。 | 新增兼容层，非原版联机实现，也不是公网服务。 |

## 已验证

```text
npm test  # 51/51 pass（2026-07-21）
```

并已对 `src/main.mjs`、`src/engine.mjs` 运行语法检查，且本地服务返回 HTTP 200。

## 尚未完整迁移

- 所有职业、皮肤、武器、换枪、开火/换弹子时间轴和声音帧；
- 原版像素 wall mask 已作为 Foundry 的运行时主碰撞源；仍需逐地图导出和验证其余 Arena 的对应遮罩；
- 所有地图、战役、CTF/DOM 目标、完整导航图和原版 Bot 随机档案；
- 精确逐帧的上半身武器状态、屏幕滤镜、粒子、音频混音和存档格式；
- 生产级联机、鉴权、匹配与公网部署。

下一项工作应从上述清单中选一个可测行为，而不是同时大改地图、角色与武器。
