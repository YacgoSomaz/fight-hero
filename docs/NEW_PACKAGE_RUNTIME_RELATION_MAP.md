# 新完整包运行时关系图（证据优先，2026-07-23）

## 0. 范围与可信度

本图只描述用户提供的新完整包，不从当前网页实现反推原版。

- 根目录：`D:\CodexSourcePackages\war-heroes_4399_90433_local`
- 原件：`4399-90433-war-heroes-original.swf`
- SHA-256：`BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29`
- 证据层级：`extracted/scripts/*.as` → 现有 FFDec P-code → `rabcdasm/war-heroes-4399-0/*.class.asasm`；显示列表/帧/矩阵只以 `swf-structure.xml` 为准。

该 SWF 与仓库中的旧原件哈希相同；新包的新增价值不是“另一份游戏”，而是完整的 500 个 AS3、1,064 个 ASASM、完整结构 XML 与可复核素材集合。任何 FFDec 控制流、逻辑运算或时间轴绑定出现歧义时，必须回到 ASASM/XML，不可按常识改写。

## 1. 顶层生命周期

```text
Main
  ├─ LoaderScreen / logo sequence
  └─ Menu
       ├─ Quick Match: MatchSettings.startQuickmatch() → Game
       └─ Campaign / Challenge:
            Stats_Campaign.setMatch(stage)
            → MatchSettings.startCampaign()
            → Cutscene(pre，可选) → Game

Game constructor
  → BgSky + Bg2 + Bg1 + MatchSettings + Stats_MapParticles
  → PhysWorld + Water + Arena
Arena.Init()
  → 从 Arena 时间轴读取 wallMC、节点、物理盒、目标物
  → Game.InitGame(arena)
  → Aimer / BitScreen / Radar / Hud / Player / AI units
  → MatchSettings.Init() / map particles

Game.endGame()
  → Hud end timeline
  → Game.destroy()
  → Cutscene(post，可选) 或 Menu
```

直接证据：`Main.as:startClass`、`Menu.as` 的 Quick Match/Campaign 点击分支、`MatchSettings.as:startQuickmatch/startCampaign`、`Game.as:Game/InitGame/destroy`、`Arena.as:Init`。

结论：原版不是“菜单 → 一张地图”的简单跳转。关卡启动依赖 `MatchSettings` 的完整快照，Arena 时间轴再建立运行时节点；战役还可能经过前/后 Cutscene。网页不可用 quick-match 默认值替代战役记录。

## 2. 一个原始 30 FPS tick 的严格顺序

`Game.EnterFrame()` 的主要顺序为：

1. 若暂停，只推进 `Hud.EnterFrame()`。
2. `game.fc++`；处理 randomTeam；若为战役，先执行 `Stats_Campaign.runScripts(game)`。
3. 地图特效：列车/飞机震动、`Stats_MapParticles`、`Arena.EnterFrame`、`PhysWorld.EnterFrame`、BitScreen。
4. Killstreaks、`Hud.EnterFrame`。
5. 顺序遍历每个 `Unit.EnterFrame()`（实际 Player/AI 外层逻辑后都会进入 `UnitEnterFrame()`）。
6. Pickups、Bullets、清除 removed bullets、Effects、清除 removed effects。
7. `MatchSettings.EnterFrame()`（DOM 三秒积分）→ Radar → Water。

关键因果：Campaign 脚本在 Unit 之前；HUD timer 在 Unit 之前；比分/胜负的 MatchSettings 更新在本 tick 末尾。任何网页 tick 若把 score/脚本/Unit 的顺序调换，都可能把对话、出生、门、电梯或通关时机提前/延后一帧。

## 3. Arena 是地图逻辑核心，不只是背景

`Arena.Init()`：

- 将 `wallMC` 绘制为透明 `BitmapData`，随后隐藏 `wallMC`；它是 Movement、Bullet、AI LOS 和 Unit surface colour 的共同权威。
- 从该 Arena 的 Display List 收集 `NodeSpawn`、`NodeWaypoint`、`NodeAiAction`、`NodePhysBox`、`NodePickup`、`NodeHoldpoint`、`NodeCtfFlag`、DownArrow、light。
- `NodeWaypoint.setConnectors()` 建图；`NodeAiAction` 按其 `con` 字符串附着到相应 waypoint；spawn node 绑定 waypoint。
- `NodePhysBox` 交给 `PhysWorld.generateWorld()`，只服务 Box2D 尸体物理，不替代 wallMC 的角色碰撞。
- CTF 会随机交换原旗帜的实际队伍映射；DOM 才保留 Holdpoint，其余模式把它们隐藏。

`Arena.EnterFrame()` 使用 `(0.7)` 相机追随、鼠标偏移、背景按 wall 尺寸做视差、并夹紧到 800×600 边界；屏幕震动最后叠加。相机、背景和碰撞必须共享 Arena 坐标系。

## 4. Unit、Player、AI 的职责边界

```text
Player.EnterFrame
  dead/respawn → aim half-step → mDown 时 Guns.shoot
  → Aimer visual → Unit.UnitEnterFrame

AI.EnterFrame
  dead/respawn → waypoint/等待/蹲伏/目标扫描/LOS/瞄准/概率开火
  → ActionBox 改 key/jump/route → Unit.UnitEnterFrame

Unit.UnitEnterFrame
  Status → Guns → UnitMC → Movement
  → pickups / DOM / CTF / flag / mode drains
  → wall pixel surface effects
  → UnitMC nextAnim、flip、arm/head transform
```

因此“跑步、攀爬、持枪瞄准”不是一张完整人物帧图：Movement 决定 `nextAnim`/位置，UnitMC 处理时间轴和 holder，Unit 最后才以 arm holder/上一帧角度写 arm/head/flip。AI 只产生 keys、jump、target/aim，不能另写一套平移/寻路物理。

## 5. 第一关的真实分工（已校正）

第一关并非全部由 `Stats_Campaign.runScripts()` 驱动：

| 来源 | 负责内容 |
| --- | --- |
| `Stats_Campaign.runScripts` | `sn==1` 的开场武器/按帧提示；`sn==14` 的队友生成、音乐、定时对话；比分 6/9/12/14 的对话和 `sn` 推进。 |
| `Unit.UnitEnterFrame` | 人类脚底读取 wall bitmap 色值；当为 `ff00ff`、Campaign stage 1 时，按当前 `Stats_Campaign.sn` 设置 `tutjump/tutduck/tutshoot/tutclimb/tutswitch`、台词、武器、noAim/noJump、门、AI spawn/difficulty 和 arrows；随后 `sn++`、`fc=0`、`Arena.changeWallFrame(sn)`。 |
| `Bullet` / `Player` | state 9 的特定墙色 `9900ff` 命中让阶段进至 10 并播放电梯；state 12 的换枪输入让阶段进至 13 并打开门。 |
| `Status` | 教学伤害并非显示效果；state 10 是 `heal(hpMax)` 后用 `env`、bypass-protection 的 `damage(hpCur*.8)`，再禁止跳跃。 |

这解释了粉色区域：它们是 wallMC 的**数据颜色触发面**，并非普通装饰、泛用跳跃区或 AI 导航颜色。网页迁移须读取原像素颜色，且只能由来源条件触发。

## 6. 武器、子弹、伤害与尸体链

```text
Stats_Guns.addGun records
  → Guns.setGuns / changeGun / setFrame
  → Guns.shoot
  → Guns.makeBullet
  → Bullet subclass (line / sniper / melee / projectile / bounce / follow / mine / splash)
  → Bullet.hitTestAll: opaque wall → living enemy unit → corpse
  → Status.damage → Unit.die
  → PhysWorld.createCorpse → PhysActor Box2D parts/joints
```

- `Status.damage` 的 fifth argument 是 bypass protection；环境/教学/越界分支会使用它，不能和普通枪伤害合并。
- `Score` 在 `Unit.die` 链内更新；`MatchSettings.updateScores()` 以模式分组、截断分数、调用 `Game.endGame()` 并更新 `Hud.setScoreBar()`。
- PhysWorld/PhysActor 使用完整 Box2D；目前网页只有来源初始记录，尚无等价 joint/fixture solver，不能声称尸体物理已还原。

## 7. 模式与任务边界

- Quick Match 复制 `qm*` 配置到 `use*`；Campaign/Challenge 复制 `ca*` 配置，合并 `SD.classSaves` 与 `caPlayer` 覆盖项。
- `dm/zom/jug` 用个人 `pscore`；`tdm/dom/ctf` 按 team1/team2 聚合。DOM 每 90 帧将一个 holdpoint 的当前占领单位加一分。
- CTF 的旗帜不是静态贴图：Arena 初始化会随机翻转原旗帜队伍映射；`NodeCtfFlag.capture/reset` 负责携旗/归还/得分。
- 15 战役和 15 挑战的 `Stats_Campaign.setMatch` 是完整定义表，但每一关的动态逻辑还散落在 `Stats_Campaign.runScripts`、Unit surface switch、地图时间轴和具体 Node/对象脚本中。只导出目录不等于关卡已迁移。

## 8. 显示列表与素材路线

- 菜单：`Menu.as` + `MBFZ_fla.Timeline_275`（symbol/time frame 必须从 XML 锁定）。
- HUD：`Hud.as`（symbol 1540）包含 ScoreBar、GunsMenu、经验、`mc_speak`、教学帧；`Speak_187` 为 symbol 1488，`HudInfo_191` 为 symbol 1504，`DownArrow` 为 symbol 1395。
- 人物：`UnitMC` root + arm/weapon 子时间轴 + 皮肤 child MovieClip；不能再切整帧人物截图。
- 地图：Arena 视觉层、wallMC、nodes、foreground 子时间轴分别迁移；XML 才是 depth/matrix/clipDepth/frame 的最终依据。

## 9. 已发现的当前网页差异（禁止掩盖）

1. Campaign session 现在会记录 `hud.messages`，但原 `Hud.setMsg` 是**单一当前消息**：`msgForce` 可阻止非强制覆盖，`msgTimer=seconds*30` 到 1 时播放 close。队列不能当作最终还原。
2. session 的 `audio` 目前是来源 sound/voice intent，不是已按 `SH.playSound/playMusic/playVoice` 输出的原音频时序。
3. Tutorial HUD 帧、Speak 1488、HudInfo 1504、DownArrow 1395 的 XML 已定位，但尚未按原 Display List 导出/绘制。
4. Campaign 1 之外不应因为拥有 `Stats_Campaign` 条目就被标记为可玩；缺少逐关的时间轴、surface、node、胜负、cutscene 验证。

## 10. 后续实施顺序

1. 用 XML 机械导出 `HudInfo_191`、`Speak_187`、`DownArrow` 的所有必需 child/帧与字体；先建立来源 render plan 和 RED。
2. 将 `Hud.setMsg` 的 force/timer/open/close 语义替换当前消息数组，再接入原 Speak Display List。
3. 为第一关建立 source tick 回放：wall colour、输入、`sn/fc`、HUD state、actor spawn、team scores 的逐 tick trace；之后才做截图差分。
4. 逐关枚举 `Stats_Campaign.runScripts`、Unit surface cases、Arena wall frame/object timeline；每关完成开始→结束证据后才在菜单开放。

本文件是迁移路由，不是完成声明。任何条目只有同时具备原始证据、运行时消费、自动回归和原版回放对照，才能从“已定位”改为“完成”。
