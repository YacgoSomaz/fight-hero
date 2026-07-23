# 新完整包深度审计：网页实现、原版证据与验证边界（2026-07-23）

## 结论先行

本次没有发现可以支持“游戏已 1:1 复刻”或“Campaign 1 已完整完成”的证据。完整新包让原版关系已经可追溯到 AS3 / ASASM / XML，但当前网页是若干来源驱动纵切的组合，不是原 `Game` 的单一运行时。

最重要的审计结论如下：

1. **原包证据链可靠。** 用户提供的 `4399-90433-war-heroes-original.swf` 与仓库基线相同，SHA-256 是 `BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29`；新包增加了可交叉验证的 500 个 AS3、1,064 个 ASASM 和完整 XML。
2. **第一关的静态定义、Tutorial 墙、人物部件、基础移动/枪械/伤害的若干原始规则确实被消费。** 这不是自绘占位素材链。
3. **第一关已有一条受限的 `Game.EnterFrame` source tick。** 它已按 Player/AI 的 actor 顺序串行走枪械与 Unit tail，并保留 line bullet 的即时命中位置；剩余 `Arena/PhysWorld/MatchSettings/Hud` 子对象仍未纳入同一完整原版 trace，不能外推为完整帧调度。
4. **“测试全绿”不等于“原版一致”。** 当前 363 个测试主要是解析、纯状态和源码资产存在性断言；没有原 SWF 的同输入逐 tick trace，也没有可重复的截图/音频差分。

本文件是审计和迁移台账，不是完成声明。

## 1. 审计范围、证据优先级与方法

### 1.1 原始基线

| 项目 | 已核验事实 | 证据 |
| --- | --- | --- |
| 原件 | 完整 4399 原 SWF，16.7 MB | 用户提供的新完整包 |
| 哈希 | `BDC9216…A40BD29`，与仓库 `assets/reverse/4399-90433-25.swf` 一致 | SHA-256 基线测试 |
| 源码 | 500 AS3；遇到 FFDec 控制流歧义可下钻 1,064 ASASM | `war_heroes_4399_ffdec_extracted.zip`、`war_heroes_4399_rabcdasm.zip` |
| 显示 | timeline、depth、matrix、clipDepth、帧边界以 XML 为准 | `swf-structure.xml` |
| 网络 | 未发现 `Socket` / `NetConnection` / `NetStream` 原版联机协议 | 完整 AS3 搜索 |

判定顺序固定为：**AS3 逻辑 → 旧 P-code → 新 ASASM**；显示问题固定为：**XML → 原导出素材**。网页现有行为、以前的截图、或“看起来像”都不能反过来当作原版事实。

### 1.2 本轮实际验证

- 阅读并交叉比对：`Main.as`、`Game.as`、`Arena.as`、`Player.as`、`AI.as`、`Unit.as`、`Movement.as`、`Guns.as`、`Bullet.as`、`Status.as`、`Hud.as`、`MatchSettings.as`、`Stats_Campaign.as` 与其 ASASM/XML 绑定。
- 沿当前浏览器入口检查：`tutorial-scene-preview.mjs` → `campaign-one-session.mjs` → campaign / AI / movement / gun / status / timeline / render 模块。
- 完整执行 `npm test`：**364/364 通过**；覆盖率门槛的最近完整运行是 **98.77% 行、83.17% 分支、96.53% 函数**。
- 没有把测试通过当作视觉验收；本轮也没有进行浏览器自动操作或人工截图对比。

## 2. 原版运行时与当前网页调度的直接对照

### 2.1 原版单个 30 FPS tick（`Game.EnterFrame`）

```text
Campaign.runScripts
→ Arena / PhysWorld / map effects / BitScreen
→ Killstreaks / Hud
→ 对每个 Unit：Player 或 AI 外层逻辑
                 → UnitEnterFrame(Status → Guns → UnitMC → Movement → mode/surface)
→ Pickups
→ Bullets / remove
→ Effects / remove
→ MatchSettings → Radar → Water
```

`Player.EnterFrame` 在自己的 `UnitEnterFrame` 前处理 respawn、瞄准和 `mDown → gun.shoot`。`AI.EnterFrame` 在自己的 `UnitEnterFrame` 前处理 waypoint、等待、LOS、瞄准、开枪概率与 action box。两者不是浏览器循环外的独立“控制器”。

### 2.2 当前 `tutorial-scene-preview.mjs` 的 source tick 顺序

```text
浏览器输入/aim 采样
→ Campaign 1 script/session effects
→ Arena 环境时间轴（door/elevator）
→ Hud.EnterFrame
→ Player gun tick / 立即 line-bullet hit → Player Unit tail
→ 每个 AI：decision → gun tick / 立即 line-bullet hit → AI Unit tail
→ bullets 标记 → match 标记
→ render
```

该顺序已关闭原先的 Actor 批处理差异，但以下边界仍未闭合：

| ID | 差异 | 可见/逻辑影响 | 判定 |
| --- | --- | --- | --- |
| RT-01 | line bullet 的即时命中顺序已在 actor walk 内；但没有完整 `Game.bullets` collection、移动 projectile、reflect/splash 的末尾生命周期 | 未来 projectile/reflect/splash 仍无法安全接入 | **阻断完整子弹系统** |
| RT-02 | AI 的 decision、gun 与当前 Unit tail 已按每个 actor 串行；但 tail 仍只覆盖 Status/Guns/Movement/surface 的已移植子集 | 未移植的 UnitMC/mode/objective 分支仍可改变时机 | **部分关闭，仍阻断 1:1** |
| RT-03 | Player tail 已排在 Player gun 后、AI 前；页面保留的 aim/pose 采样仍在 tick 外 | 视觉 root timeline 与原帧调度还未同一 trace | **部分关闭，仍阻断 1:1** |
| RT-04 | `advanceCampaignOneSessionActorUnitTail` 已替代旧的 session units 批处理 | Unit tail 不是 `Unit.EnterFrame` 的完整逐分支移植 | **阻断完整 Unit 系统** |

页面现已把战役脚本、Arena 时间轴、HUD 与 actor 顺序交由 source tick；仍必须继续把完整 Unit、bullets、pickup、effects、MatchSettings/Radar/Water 纳入同一可序列化 trace。

## 3. 已验证的模块状态

标记说明：

- **E（原证据+消费+自动断言）**：已经从原包取值并被当前模块实际消费；仍不等价于视觉完成。
- **P（部分）**：关键规则/素材存在，但生命周期、呈现或完整分支缺失。
- **D（差异/阻断）**：已发现当前行为不能与原版同等。
- **U（未验证）**：尚未形成足够原证据/消费/回放闭环。

| 范畴 | 原版证据入口 | 当前承载 | 状态 | 审计说明 |
| --- | --- | --- | --- | --- |
| 启动生命周期 | `Main.startClass`、`Menu`、`MatchSettings.start*`、`Game` | `main.mjs`、`source-mission-launch.mjs` | P | 仅 Campaign 1 走专用入口；其他 14 战役、15 挑战正确地保持不可启动。cutscene、完整 endGame/destroy 未迁移。 |
| Arena wall / 节点 | `Arena.Init`、Arena XML | `arena-source-layouts.mjs`、`tutorial-world*` | E/P | `wallMC` 像素和 Tutorial nodes 已消费；每张地图的动态 child 时间轴、object script、物理盒仍未逐张验证。 |
| Movement | `Movement.as` | `tutorial-movement.mjs` | P | 探针、下蹲头顶检查、坡度、终端坠落攀爬已有来源形状；分支覆盖 **57.47%**，且未在原 tick 里运行，不能称碰撞完成。 |
| UnitMC / 部件 | `UnitMC`、arm gun timelines、XML | `tutorial-actor-*`、`tutorial-unit-pose-*` | P | 原 Shape、皮肤 child、姿势矩阵、部分 timeline guard 被使用；所有 UnitMC labels、嵌套 movieclip、所有枪/skin/角色状态未做逐帧回放。 |
| Player aim / input | `Player.as`、`Aimer.as` | `tutorial-aim-runtime.mjs`、page handlers | P | 鼠标按下状态和原 Aimer assets 已接入；aim 分支覆盖仅 **41.67%**，浏览器事件与原 AS3 MouseEvent 的帧边界尚未 trace。 |
| AI | `AI.as`、`NodeWaypoint`、`NodeAiAction` | `tutorial-ai-runtime.mjs` | P | 搜索、LOS、概率、action `j/c/fc/fp/fd`、尸体瞄准有证据消费；但 RT-02 调度差异存在，且 CTF/DOM/Jug 专有分支及完整随机序列无回放。 |
| Guns | `Stats_Guns`、`Guns.as` | `gun-source.mjs`、`tutorial-gun-runtime.mjs` | P | M4/USP 等部分基本 delay、reload、recoil/arm action 已接入；武器表不等于所有 Bullet subclass、拾取、切枪、特殊效果均迁移。 |
| Bullets / hit | `Bullet` subclasses、`Status.damage` | `tutorial-bullet-*`、status module | P/D | Line bullet、墙/Unit hit 与部分伤害有来源规则；RT-01 使时机错误，投射物、爆炸、反弹、跟踪、mine/splash 等不是完整迁移。 |
| Damage / death / corpse | `Status.as`、`Unit.die`、`PhysWorld` | `tutorial-status-damage-runtime.mjs`、`tutorial-corpse-runtime.mjs` | P | shield、spawn protection、部分 modifier、respawn timer 有测试；Box2D fixture/joint corpse 仍缺，原尸体视觉/物理未完成。 |
| Campaign 1 script | `Stats_Campaign.runScripts`、`Unit` surface switch | `campaign-one-*` | P | `sn/fc` 事件、pink wall contact、换枪和 bullet trigger 已解析/写入 session；门/电梯的 stop-frame 状态已运行，但对应 Arena child 视觉与完整终局仍未闭环。 |
| HUD / dialogue / audio | `Hud.as`、1540/1488/1504/1395 XML | HUD source/renderer modules、session fields、Tutorial preview | P/D | `setMsg` 的单一 `msgForce/msgTimer/speak` 状态及 DownArrow 1395 原 Shape/16 帧已接入；教程 Hud/Speak Display List 和音频仍未完成。 |
| Camera / background | `Arena.EnterFrame` | camera/map DOM modules | P | 原 crop 与墙坐标的若干关系已测；相机分支覆盖 **40%**，screen shake/parallax/timeline 完整性尚未证明。 |
| Modes | `MatchSettings`、Score、flag/holdpoint nodes | engine/session | P | DM/TDM/DOM/CTF/Jug 有基础规则测试；Campaign/Challenge 逐任务规则、Zom、objective 表现、结算和菜单路径未验收。 |
| 全地图 | `Stats_Maps`、Arena symbols/XML | map source/catalog/loader | P/U | 图层和 wall 资产可加载不等于地图逻辑完成；当前不能声称全部地图已修好。 |

## 4. Campaign 1：此前工作逐项复验

### 4.1 已能从原源码证明的点

- `Stats_Campaign.setMatch` 的第一项是 `Under Siege`、`map="tut"`、`mode="tdm"`，当前 session 使用这一来源定义和来源 actor 记录，不是 quick match 默认值。
- `runScripts` 的 `sn==1` frame 0/20/90、`sn==14` 的 frame 150/360、以及 score 6/9/12/14 的分支均已由 `campaign-one-script-source.mjs` 解析并有测试锁定。
- 教学粉色不是“AI 跳跃区域”。`Unit.UnitEnterFrame` 读取脚底 wall bitmap；仅人类、Campaign stage 1、色值 `ff00ff` 才切 Tutorial 状态。当前 `applyCampaignOneSessionSurfaceContact` 同样要求 `human` + 原颜色。
- state 10 的真实伤害链已核对：`heal(hpMax)` 后由 `env`、bypass protection 的 `damage(hpCur*.8)`，当前会话将 85 HP 变为 17 HP 并锁 `noJump`。这是状态消费，不是仅显示文本。

### 4.2 仍未通过的闭环

| ID | 缺口 | 为什么不能宣称第一关完成 |
| --- | --- | --- |
| CA-01 | 已由 `campaign-one-tick-runtime` 的 source Game tick 关闭；仍需把剩余 Unit/HUD/MatchSettings 子对象纳入同一 trace | scripts、actor 顺序、line bullet 与人类脚底 trigger 已同 tick；不等于完整第一关。 |
| CA-02 | `Hud.setMsg` 已迁移为单一 `msgForce + msgTimer + speak open/close`；仍未绘制 Speak_187 的原 Display List/文本合成 | 状态契约已测，不等于原字体、头像、开关动画或语音已完成。 |
| CA-03 | DownArrow 1395 已按原 XML/Shape4/16 帧在试玩页绘制；试玩页也已消费 Hud 1540 的 ScoreBar、经验条、M4 child、原字体和 `drawBox` 弹药布局 | 教程标签、Speak、HudInfo 尚未完整画出；没有原版截图叠图，不能外推为完整 HUD。 |
| CA-04 | 声音只写 `session.audio` intent | `S_Mine1`、`S_Pan`、voice/music 没有按原 timing/output 播放。 |
| CA-05 | 门/电梯已由原 SWF Display List 驱动：门 1361 的 Shape 1359 `clipDepth=3` 遮罩与 Shape 1360 面板，电梯 1388 的 Shape 1387；23/19 帧 matrix 与空第 19 帧均已运行时承载 | 已有时间轴/遮罩/资源回归；仍缺原版同输入截图叠图，不能宣称逐像素一致。 |
| CA-06 | spawned AI、score、任务结束与 cutscene 没有 end-to-end source trace；15 分 TDM 已写入 `Game.endGame` 等价的 `game.ended + hud.won + hud.timeline='end'` | 结局 HUD 时间轴/后 Cutscene/销毁仍未迁移，不能称通关完成。 |

因此 Campaign 1 当前状态应称为：**“原任务定义和若干状态转换已接入的验证场景”**，而不是“战役第一关已做好”。

## 5. 测试审计：什么被验证，什么没有

本轮实际命令：

```powershell
npm run test:coverage
```

结果：374 pass、0 fail；总体覆盖率为 line 98.75%、branch 82.82%、function 96.53%，达到项目的 80% 覆盖门槛。它可靠地防止以下回退：原文件哈希、AS3 解析表、Campaign 1 transition、Arena/Hud/actor phase 顺序、部分 Movement probes、AI path/LOS/action、来源素材路径/矩阵、M4/HUD 子项目录、wall-mask、DownArrow 1395、门/电梯原始时间轴、Campaign 1 的 15 分 `endGame` 结果，以及试玩页 Hud 1540 来源资产绑定。

但当前测试体系存在以下不可替代的盲区：

1. 多数测试是纯函数或文本/资源关系断言，不能检验浏览器帧循环中模块交错顺序。
2. 没有读取原 SWF 的录制/trace，并以同一输入 seed、同一 30 FPS 输入逐帧比较 actor、bullet、HUD、wall frame、score。
3. 没有可重复截图差分，因此“素材来自原版”不等于“原矩阵、裁剪、滤镜、时间轴合成一致”。
4. 覆盖率是代码执行率，不是原版状态空间覆盖率。特别是 Movement、aim、camera 的低分支覆盖已明确暴露此问题。
5. 2026-07-23 的实际浏览器检查已确认页面到达 `canvas[data-ready=true]` 且没有 JS 错误；但内置浏览器截图仍为黑画布。该现象尚未得到原版对照或定位，必须继续检查地图图层/相机/画布可见性，**不得**将资源 HTTP 200 或 ready 标记写成第一关视觉可用。

## 6. 接下来必须先做的事情（按阻断性排序）

1. **RT-01~04：建立唯一的 `source-tick-runtime`。** 它必须按 `Game.EnterFrame` 产生可序列化 trace：`fc`、Campaign `sn/fc`、每个 unit 的 pre/post state、bullets、wall frame、score、HUD timer。页面不得再自行重排 gameplay phase。
2. 为该 orchestrator 写 RED：固定 Tutorial 初始状态、固定 random 函数、固定 30 FPS 输入，断言事件的**顺序**而不只断言某事件最终出现；GREEN 后再移除页面中重复的枪/移动/AI phase。
3. 用 XML 导出并实装 `Hud 1540` 的教程帧、`Speak_187`、`HudInfo_191`、`DownArrow 1395`；将消息数组改为原 `Hud.setMsg` 单一状态机，再接真实音频资产和 timer。
4. 以 Campaign 1 作为第一条端到端 trace：开始 → 教学触发 → 换枪/电梯/门 → AI/score → 原结局条件。只有该 trace、视觉/声音验收完成后，才开放“第一关完成”的说法。
5. 逐地图、逐 campaign/challenge 重复同一证据闭环；不使用 `engine.mjs` 的近似逻辑替代未迁移的原对象脚本。

## 7. 移交给下一位 AI 的不可违反规则

- 不要将“所有源素材文件存在”“某个模块有单测”“能进入一张地图”写成 1:1 或关卡完成。
- 任何逻辑歧义先读新包 ASASM；任何 Display List 争议先查 XML。
- 不要增加手绘 HUD、替代 NPC、简化碰撞或假按钮来填空。缺少证据的功能应保持不可启动并列入台账。
- 新改动必须先补来源 trace 的 RED，再最小改动到 GREEN；每次重新跑全量测试和覆盖率。
- 截图/录屏将用于后期视觉节奏和合成验收；当前没有它也可以继续源码驱动迁移，但不能凭记忆判定“像原版”。

## 8. 第二层核验：为什么当前代码连 Campaign 1 的完整通关都做不到

本节不是推测，而是沿着原 `Stats_Campaign → Unit → Player → Bullet → Arena` 和当前 `tutorial-scene-preview.mjs` 的实际调用做的可达性检查。结果：当前试玩页没有完整的第一关可达路径。

### 8.1 原版第一关的最小可达序列

```text
start: sn=1, fc=0, player=Scientist(Medic skin 7), M4/USP 被 script 清空
  └─ 多次 human-foot 像素 ff00ff：sn 1 → … → 9，墙帧同步 1 → … → 9
       └─ sn=9 时用 USP2 命中墙色 9900ff
            → sn=10、wallMC frame 10、电梯播放、USP2 弹药清零
              └─ human-foot ff00ff：sn=10 → 11（受伤/禁跳）→ 12（获得并切至 M4）
                   └─ Player.KeyDown(Q/Shift)：**先** gun.swapGuns，再于 sn==12
                        → sn=13、wallMC frame 13、door.gotoAndPlay("open")
                     └─ human-foot ff00ff：sn=13 → 14、wallMC frame 14、三名敌人 spawn、door.close
                       └─ frame 150/360/450/600 对话与 unit4 spawn
                         └─ Team 1 score 6 → 9 → 12 → 14 的剧情推进
                           └─ TDM scoreLimit 15 → MatchSettings.updateScores → Game.endGame
```

原始来源分别是：

- `Stats_Campaign.as:37–70`：关卡身份、5 名 Unit、score limit 15、前/后 Cutscene 记录。
- `Stats_Campaign.as:486–543`：`sn==1 / sn==14` 帧事件与 score 对话。
- `Unit.as:826–1094`：wall 像素分派及 sn 1–14 的 human-only 教学状态。
- `Bullet.as:290–343`：`9900ff && sn==9` 的电梯分支。
- `Player.as:352–395`：Q/Shift 的**先换枪、后 sn==12 开门**分支。
- `MatchSettings.as:updateScores` + `Game.as:endGame`：15 分 TDM 的结束路径。

### 8.2 已关闭的三项旧硬不可达问题（不构成第一关完成）

| ID | 当前代码事实 | 原版要求 | 后果 |
| --- | --- | --- | --- |
| C1-RUN-01 | `tutorial-scene-preview.mjs` 已将 Q/Shift 排入 `enqueueCampaignOneSourceInput(... swapGuns)`；source tick 在 state 12 同一会话切枪、换 wall 13 并写 door `playing='open'`；画布按 1361 的原 mask/panel 23 帧播放 | `Player.KeyDown` 的 Q/Shift 会在 sn 12 使 sn→13、换 wall frame 13 并 `door.gotoAndPlay("open")` | 输入、时间轴和原矢量资产已有自动回归；仍缺相同输入的原版截图叠图。 |
| C1-RUN-02 | active gun 已由 session 的 `gunRuntime` 唯一持有；页面对 M4/USP2 读取原 arm timeline，鼠标仅排入 source input | state 11 后 `M4` 是活跃枪；M4 的原 `Bullet_Line_Basic`、30 发弹匣、15 分 TDM 都需要它 | 不再因浏览器私有 `gunState` 失效；M4→完整 TDM/endGame 仍没有端到端 trace。 |
| C1-RUN-03 | state 9 的 `setAmmo` 写入当前 `gunRuntime.ammo.clipCur/spareCur/total`，且 line bullet 发生于 actor Unit tail 前 | `Bullet.as` 在 state 9 命中后清的是 `player.gun.curAmmo.clipCur/spareCur`，后续 `Guns` 必须读取同一份 ammo；Bullet 应在所有 unit 后处理 | 该弹药所有权回归已关闭；完整 bullets phase、移动投射物与 endgame 仍未迁移。 |

这三项已由 source tick/会话统一状态关闭；它们仍只说明第一关入口与局部状态可达，而非完整可通关任务。后续不得重新引入页面私有 gun/movement 状态，必须继续扩展同一 source tick。

### 8.3 还必须解到的原始 Display List / 时间轴数据

以下对象已在新包和旧导出中有明确 symbol 或 class，但当前仅存名称/状态，尚无可播放的原 timeline：

| 对象 | 原标识 | 原行为 | 当前状态 |
| --- | --- | --- | --- |
| Tutorial 墙 | `wallMC` / character 1378，16 帧 | `Arena.changeWallFrame` 先 `gotoAndStop` 再 `BitmapData.draw`，同一刻替换碰撞颜色 | wall PNG 已有；对象/视觉时间轴尚非一个统一 runtime。 |
| 门 | `MBFZ_fla.door_up_239` / symbol 1361 | `gotoAndPlay("open")` 与 `gotoAndPlay("close")`；类帧 1、12、23 均 stop | 已直接接入 1359 遮罩、1360 面板、23 帧 display list 与 Arena matrix；等待原版截图对照。 |
| 电梯 | `MBFZ_fla.elevator_242` / symbol 1388 | `play()`，到 frame 19 stop；其触发与 wall 10 同一 bullet 分支 | 已直接接入 1387、19 帧 matrix 和原第 19 帧的空 display list；等待原版截图对照。 |
| 指示箭头 | `DownArrow` / symbol 1395，Arena children 名为 `downarrow3/7/8/10/12` | `Arena.Init` 全隐藏；Unit/Player 按 `name.substring(9) == sn` 单独显示 | Arena child 深度/twip 矩阵、逐 child 可见性、1395→1394 Shape4（fill+line）和 16 帧位移已提取并由 Tutorial preview 直接绘制；缺原 SWF 截图叠图验收。 |
| 教学 HUD | Hud symbol 1540；标签 `tutmove/tutjump/tutduck/tutshoot/tutclimb/tutswitch` | `gotoAndStop(label)` 与 `Hud.EnterFrame` 同 tick timer | 当前只保存 `hud.frame` 字符串。 |
| 对话 | Speak_187 / symbol 1488；Hud 的 `setMsg` | 单一 `msgForce/msgTimer`、open/close、speaker skin/name/text/voice | 当前为消息数组和 audio intent。 |

### 8.4 从“解清楚”到“能做出第一关”的最低验收件

在改页面前必须先产生以下来源工件；缺一项就无法宣称第一关可完成：

1. `source-tick-runtime`：唯一拥有 player/AI/gun/ammo/bullets/wall/HUD/score 的状态；page 不再拥有第二份 `gunState`、movement 或即时 hit。
2. 逐 tick JSON trace schema：输入前状态、`Game.fc`、Campaign `sn/fc`、所有 Unit 的顺序、bullet 创建/命中、wall frame、door/elevator timeline、HUD message/timer、score/endGame。
3. Campaign 1 的可达性 RED：从固定 seed/输入驱动到 `sn=14`、M4 第一次开火、team score 15 和 endGame；测试必须验证事件顺序，而非只验证最终对象字段。
4. Wall 1–16 与 door/elevator/down arrows/Hud 教学帧的原 Display List runtime；每次 `changeWallFrame` 都让视觉与碰撞共同替换。
5. 固定原始随机序列和对照采样。录屏不是当前源码迁移的前置条件，但在这些 trace 通过后，它是镜头/合成/声音节奏验收的必要输入。
