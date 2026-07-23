# 新完整包深度审计：网页实现、原版证据与验证边界（2026-07-23）

## 结论先行

本次没有发现可以支持“游戏已 1:1 复刻”或“Campaign 1 已完整完成”的证据。完整新包让原版关系已经可追溯到 AS3 / ASASM / XML，但当前网页是若干来源驱动纵切的组合，不是原 `Game` 的单一运行时。

最重要的审计结论如下：

1. **原包证据链可靠。** 用户提供的 `4399-90433-war-heroes-original.swf` 与仓库基线相同，SHA-256 是 `BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29`；新包增加了可交叉验证的 500 个 AS3、1,064 个 ASASM 和完整 XML。
2. **第一关的静态定义、Tutorial 墙、人物部件、基础移动/枪械/伤害的若干原始规则确实被消费。** 这不是自绘占位素材链。
3. **当前试玩页面的帧调度不等价于 `Game.EnterFrame()`。** 它把玩家枪械、AI 决策/枪械、Status、AI Movement、玩家 Movement 和 bullet hit 拆开排列；原版则由每个 `Player/AI.EnterFrame → UnitEnterFrame` 先完成，然后才统一处理 Bullets。这是后续 1:1 的首要阻断项。
4. **“测试全绿”不等于“原版一致”。** 当前 349 个测试主要是解析、纯状态和源码资产存在性断言；没有原 SWF 的同输入逐 tick trace，也没有可重复的截图/音频差分。

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
- 完整执行 `npm run test:coverage`：**349/349 通过**；总体 **98.95% 行、83.64% 分支、96.63% 函数**。
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

### 2.2 当前 `tutorial-scene-preview.mjs` 的真实顺序

```text
clear line traces
→ Campaign 1 script/session effects
→ 玩家 aim → 玩家 gun tick / 立即 line-bullet hit
→ 所有 AI decision → 所有 AI gun tick / 立即 line-bullet hit
→ 所有 Unit 的 Status（不含 Movement）
→ 所有 AI 的 Movement
→ 玩家 Movement
→ render
```

这不是原版排列，且有四项明确差异：

| ID | 差异 | 可见/逻辑影响 | 判定 |
| --- | --- | --- | --- |
| RT-01 | Bullet 在网页中于 unit phase 前即时命中；原版在全体 Unit 之后统一运行 | 本帧命中对象的移动、无敌、死亡与 score 时机可不同 | **阻断 1:1** |
| RT-02 | AI 的决策、枪械、Movement 分成三轮批处理；原版每个 AI 在同一次 `AI.EnterFrame` 内串联完成 | NPC 互相读取位置、枪械 delay、动画/碰撞时机可不同 | **阻断 1:1** |
| RT-03 | 玩家 Movement 在所有 AI movement 后独立运行；原版按 `Game.units` 顺序运行 | 同 tick 追踪、碰撞、表面触发和镜头会不同 | **阻断 1:1** |
| RT-04 | 当前 `advanceCampaignOneSessionUnits` 只推进 Status/corpse；它没有承担原 `UnitEnterFrame` 的完整 Guns/UnitMC/Movement/surface 分支 | `Unit` 仍被拆散到页面层与 session 层 | **阻断 1:1** |

现有注释准确描述了“来源意图”，但注释不能改变运行顺序。必须建立一个 source tick orchestrator，再让页面只做输入采样和渲染。

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
| Campaign 1 script | `Stats_Campaign.runScripts`、`Unit` surface switch | `campaign-one-*` | P | `sn/fc` 事件、pink wall contact、换枪和 bullet trigger 已解析/写入 session；状态终局、场景门/电梯实际时间轴、全对白/HUD/声音未闭环。 |
| HUD / dialogue / audio | `Hud.as`、1540/1488/1504/1395 XML | HUD source/renderer modules、session fields | P/D | 下方 ammo/XP/scorebar 和头顶局部素材已有来源计划；Campaign 的 `hud.messages[]` 与原 **单一** `setMsg(msgForce,msgTimer)` 不等价，audio 只记录 intent 没有按 SH 播放。 |
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
| CA-01 | `sn/fc` 没有被纳入同一原 tick orchestrator | 脚本与输入/表面/击中可能前后错帧。 |
| CA-02 | `Hud.setMsg` 未迁移为 `msgForce + msgTimer + speak open/close` | 当前消息数组会并存，原版只保留当前消息并有强制覆盖规则。 |
| CA-03 | Hud timeline、DownArrow、Speak、HudInfo 没有按 XML Display List 在试玩页完整画出 | session 有 `hudFrame` 不等于可见教程 UI。 |
| CA-04 | 声音只写 `session.audio` intent | `S_Mine1`、`S_Pan`、voice/music 没有按原 timing/output 播放。 |
| CA-05 | 门、电梯写入 `environment.*Frame`，但还不是 Arena child movieclip 的真实逐帧驱动 | 碰撞变化/视觉变化尚不可验证。 |
| CA-06 | spawned AI、score、任务结束与 cutscene 没有 end-to-end source trace | 可以进 Tutorial，不代表能按原版从开始到结束。 |

因此 Campaign 1 当前状态应称为：**“原任务定义和若干状态转换已接入的验证场景”**，而不是“战役第一关已做好”。

## 5. 测试审计：什么被验证，什么没有

本轮实际命令：

```powershell
npm run test:coverage
```

结果：349 pass、0 fail；总体达到了项目的 80% 覆盖门槛。它可靠地防止以下回退：原文件哈希、AS3 解析表、Campaign 1 transition、部分 Movement probes、AI path/LOS/action、来源素材路径/矩阵、M4/HUD 子项目录、wall-mask 和菜单可点击性。

但当前测试体系存在以下不可替代的盲区：

1. 多数测试是纯函数或文本/资源关系断言，不能检验浏览器帧循环中模块交错顺序。
2. 没有读取原 SWF 的录制/trace，并以同一输入 seed、同一 30 FPS 输入逐帧比较 actor、bullet、HUD、wall frame、score。
3. 没有可重复截图差分，因此“素材来自原版”不等于“原矩阵、裁剪、滤镜、时间轴合成一致”。
4. 覆盖率是代码执行率，不是原版状态空间覆盖率。特别是 Movement、aim、camera 的低分支覆盖已明确暴露此问题。

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

### 8.2 当前试玩页的三个“硬不可达”问题

| ID | 当前代码事实 | 原版要求 | 后果 |
| --- | --- | --- | --- |
| C1-RUN-01 | `tutorial-scene-preview.mjs` 的 `KEY_BITS` 只含 W/A/S/D/方向键；全仓库没有页面调用 `applyCampaignOneGunSwap()` 或 session 对应输入 API | `Player.KeyDown` 的 Q/Shift 会在 sn 12 使 sn→13、换 wall frame 13 并 `door.gotoAndPlay("open")` | 玩家到 sn 12 后**必定无法开门**，关卡不能到敌人出现阶段。 |
| C1-RUN-02 | `syncPlayerRestrictionsFromSourceSession()` 遇到 active gun 为 M4 时将 `gunState = null`；鼠标事件也要求 `gunState` 存在才射击 | state 11 后 `M4` 是活跃枪；M4 的原 `Bullet_Line_Basic`、30 发弹匣、15 分 TDM 都需要它 | 即使人为绕过 C1-RUN-01，玩家也**无法用 M4 射击**，不能完成敌人/计分主线。 |
| C1-RUN-03 | `setAmmo` 只写 `session.actors[].ammo`，没有写正在使用的 `gunState.ammo`；page 的即时 bullet 又先于原 Unit/Bullet phase | `Bullet.as` 在 state 9 命中后清的是 `player.gun.curAmmo.clipCur/spareCur`，后续 `Guns` 必须读取同一份 ammo；Bullet 应在所有 unit 后处理 | 电梯触发后的弹药、换枪和本帧命中时机不是同一份原状态，无法用当前页面证明准确。 |

这三项说明先前“第一关入口/状态已经接入”的表述必须严格理解为**可审计的片段**，而非可完成任务。它们也提供了一个更具体的实现边界：在 source tick runtime 完成前，不应给试玩页添加零散 Q 键或 M4 特例；否则会继续把原来的单一 `Guns` 状态拆成页面私有状态。

### 8.3 还必须解到的原始 Display List / 时间轴数据

以下对象已在新包和旧导出中有明确 symbol 或 class，但当前仅存名称/状态，尚无可播放的原 timeline：

| 对象 | 原标识 | 原行为 | 当前状态 |
| --- | --- | --- | --- |
| Tutorial 墙 | `wallMC` / character 1378，16 帧 | `Arena.changeWallFrame` 先 `gotoAndStop` 再 `BitmapData.draw`，同一刻替换碰撞颜色 | wall PNG 已有；对象/视觉时间轴尚非一个统一 runtime。 |
| 门 | `MBFZ_fla.door_up_239` / symbol 1361 | `gotoAndPlay("open")` 与 `gotoAndPlay("close")`；类帧 1、12、23 均 stop | 当前只有 `environment.doorFrame` 文本。 |
| 电梯 | `MBFZ_fla.elevator_242` / symbol 1388 | `play()`，到 frame 19 stop；其触发与 wall 10 同一 bullet 分支 | 当前只有 `environment.elevatorFrame='play'`。 |
| 指示箭头 | `DownArrow` / symbol 1395，Arena children 名为 `downarrow3/7/8/10/12` | `Arena.Init` 全隐藏；Unit/Player 按 `name.substring(9) == sn` 单独显示 | 当前只保存一个数字，未保存每个 child 的矩阵、可见性和 16-frame playback。 |
| 教学 HUD | Hud symbol 1540；标签 `tutmove/tutjump/tutduck/tutshoot/tutclimb/tutswitch` | `gotoAndStop(label)` 与 `Hud.EnterFrame` 同 tick timer | 当前只保存 `hud.frame` 字符串。 |
| 对话 | Speak_187 / symbol 1488；Hud 的 `setMsg` | 单一 `msgForce/msgTimer`、open/close、speaker skin/name/text/voice | 当前为消息数组和 audio intent。 |

### 8.4 从“解清楚”到“能做出第一关”的最低验收件

在改页面前必须先产生以下来源工件；缺一项就无法宣称第一关可完成：

1. `source-tick-runtime`：唯一拥有 player/AI/gun/ammo/bullets/wall/HUD/score 的状态；page 不再拥有第二份 `gunState`、movement 或即时 hit。
2. 逐 tick JSON trace schema：输入前状态、`Game.fc`、Campaign `sn/fc`、所有 Unit 的顺序、bullet 创建/命中、wall frame、door/elevator timeline、HUD message/timer、score/endGame。
3. Campaign 1 的可达性 RED：从固定 seed/输入驱动到 `sn=14`、M4 第一次开火、team score 15 和 endGame；测试必须验证事件顺序，而非只验证最终对象字段。
4. Wall 1–16 与 door/elevator/down arrows/Hud 教学帧的原 Display List runtime；每次 `changeWallFrame` 都让视觉与碰撞共同替换。
5. 固定原始随机序列和对照采样。录屏不是当前源码迁移的前置条件，但在这些 trace 通过后，它是镜头/合成/声音节奏验收的必要输入。
