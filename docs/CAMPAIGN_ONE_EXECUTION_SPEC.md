# Campaign 1《Under Siege》原版执行规格

> 状态：**原始证据已做第二层梳理；网页尚未按本规格实现。**
>
> 目的：让下一位开发者能从同一份完整原包重建第一关，而不是继续在试玩页追加特例。本文是实施契约，不是完成声明。

## 1. 原件、范围与证据规则

本规格只针对 Campaign type `0`、stage `1`：`Under Siege`。原件为用户提供的完整 4399 SWF：

- `4399-90433-war-heroes-original.swf`
- SHA-256：`BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29`
- 逻辑证据：`war_heroes_4399_ffdec_extracted.zip!extracted/scripts/*.as`
- 控制流出现疑义时：`war_heroes_4399_rabcdasm.zip!rabcdasm/war-heroes-4399-0/*.class.asasm`
- Display List / 帧标签 / matrix：`swf-structure.xml`

后文的 `X.as:行号` 均指该完整包内的 AS3 行号。XML/symbol 数据必须从同一个包再次机械读取；不要以网页当前坐标或导出 PNG 透明边缘代替。

## 2. 关卡身份与启动快照

`Stats_Campaign.as:37–70` 在 `setMatch(1)` 生成的记录如下；它必须在创建 `Game` 前完整固化，不能降级为快速对战默认值。

| 字段 | 原始值 |
| --- | --- |
| type / stage | `0 / 1` |
| 标题 | `Under Siege` |
| 模式 / 目标分 | `tdm / 15` |
| 地图 | `tut` |
| 任务级别 | `1` |
| 前过场 | song `M_Slow`，frames `[1,2,3]` |
| 后过场 | frames `[4,5,35]` |
| 地图音乐 | `null`（后续 stage 14 的脚本才播 `M_Theme`） |

### 2.1 原始 actor 顺序不可更改

`Game.InitGame` 先创建 Player，再按 `MatchSettings.useBots` 的顺序创建 AI（`Game.as:118–129`）。`Game.EnterFrame` 也按这个 array 顺序逐个调用 `EnterFrame`（`Game.as:283–292`）。本关 actor 不是可交换的字典：`Stats_Campaign`、HUD 对话、score 和 `Unit.die` 都通过数组下标引用。

| `game.units` | 身份 | team / class / skin | 初始武器 | 初始位置/状态 | 后续原脚本作用 |
| --- | --- | --- | --- | --- | --- |
| 0 | Scientist（玩家） | 1 / medic / 7 | M4 / USP，但 `sn=1,fc=0` 立即变 `none/none` | `(285,705,node a)`，`noAim=true` | 玩家、全部教学触发、最后 score 胜负。 |
| 1 | Unknown | 2 / tank / 5 | Beretta / USP | `(1530,695,node a)` | stage 13 改 diff=1，spawn `(300,1200,node i)`；多段台词。 |
| 2 | Unknown | 2 / soldier / 5 | Socom / USP | `(1760,695,node a)`，`aimReverse=true` | stage 13 改 diff=1，spawn `(750,1130,node h)`。 |
| 3 | Unknown | 2 / medic / 5 | USP / USP | `(1790,695,node a)`，`aimReverse=true` | stage 13 改 diff=1，spawn `(270,1470,node a)`。 |
| 4 | Soldier | 1 / soldier / 1 | Saw / USP | `extra.noSpawn=true`，先停在 `(-4000,-4000)` | `sn=14,fc=360` 才 spawn `(770,870,node z)`。 |

`extra.noSpawn` 不是“隐藏图片”：`Unit` 直到原 `spawn()` 才执行 `unitSpawn → setClass → Status.reset`。因此 actor 4 在此之前不得拥有普通可攻击/可寻路/可显示的状态。

## 3. 原版的唯一 30 FPS tick

这是必须实现的调度器，不是建议顺序。`Game.EnterFrame`（`Game.as:176–352`）的实际顺序如下：

```text
if paused: Hud.EnterFrame only; return
game.fc++
random team shuffle (if configured)
Stats_Campaign.runScripts(game)                 // Campaign 时间事件
map-special shake
mapParticles → Arena → PhysWorld → lineCont.clear → BitScreen
killstreaks
Hud.EnterFrame                                  // 先关闭/递减本帧消息 timer
for unit in game.units in order: unit.EnterFrame
pickups
for bullet in game.bullets: bullet.EnterFrame
remove marked bullets
effects → remove marked effects
MatchSettings.EnterFrame → Radar → Water
```

### 3.1 单位内部顺序

- `Player.EnterFrame`（`Player.as:48–106`）：死者 respawn 分支；非 `noAim` 时 aim 向 arena mouse 以 `0.5` 平滑；`mDown` 才调用 `gun.shoot()`；更新 Aimer；最后调用 `UnitEnterFrame()`。
- `AI.EnterFrame`：waypoint / 等待 / LOS / aim / 概率射击 / action box；最后调用 `UnitEnterFrame()`。
- `Unit.UnitEnterFrame`（`Unit.as:741–1232`）：`fc++` → 越界伤害 → `Status.EnterFrame()` → `Guns.EnterFrame()` → `UnitMC.EnterFrame()` → `Movement.EnterFrame()` → pickup/objective/skill → `mov.resetMods()` → 读取脚底 wall 像素 → surface case → `MC.goto(nextAnim)` 与 arm/head/flip transform。

**实现约束：** 新 runtime 必须只有一份 `GunState`、一份 movement state、一份 wall frame、一份 actor array。浏览器页面只能把 input 排入 tick queue 并渲染 tick 的结果；不得再拥有 `gunState`、即时 bullet hit 或另行排序的 AI/玩家 movement。

## 4. 地图、墙和 Arena 对象

### 4.1 墙是唯一碰撞与教学触发来源

Tutorial `wallMC` 的 character id 为 **1378**，共有 **16 个原始帧**。`Arena.changeWallFrame(frame)` 的完整语义是（`Arena.as:433–447`）：

1. `wallMC.gotoAndStop(frame)`；
2. 清空当前 `BitmapData`；
3. `BitmapData.draw(wallMC)`；
4. 所有 Movement、AI LOS、Bullet、Unit surface read 在下一次读取时使用同一张新 bitmap。

墙体不是普通矩形碰撞层。`Unit.UnitEnterFrame` 读取 `getPixel(0,1).toString(16).substring(2)`；`ff00ff` 只在“human + campaign stage 1”时推进教学，`9900ff` 则由 Bullet 的命中分支处理。

### 4.2 必须保留的 Arena 运行时对象

| 对象 | 原标识 | 原行为与实施要求 |
| --- | --- | --- |
| wallMC | character 1378 / 16 frames | 如上：视觉与 ARGB 碰撞必须原子替换。 |
| door | `MBFZ_fla.door_up_239`, symbol 1361 | Player state 12 使用 `gotoAndPlay("open")`；Unit state 13 使用 `gotoAndPlay("close")`。类在 frame 1/12/23 stop；要导出完整 Display List/帧标签，不能用布尔值代替。 |
| elevator | `MBFZ_fla.elevator_242`, symbol 1388 | Bullet 命中 `9900ff` 后 `play()`；类在 frame 1/19 stop。其 visual timeline 和 wall frame 10 由同一个 transition 提交。 |
| DownArrow | symbol 1395 | `Arena.Init` 收集所有 child 并先全部 `visible=false`；Unit/Player 遍历 child，严格按 `Number(name.substring(9)) == Stats_Campaign.sn` 显示。Tutorial child 至少包含 `downarrow3/7/8/10/12`，不可只存一个 stage 数字。 |
| nodes | `NodeSpawn/Waypoint/AiAction/...` | `Arena.Init` 将 waypoint connector、action box、spawn waypoint 绑定；AI 只能使用这些 authoring nodes。 |

Arena 初始化时还把 `NodePhysBox` 交给 Box2D corpse world；它**不是**玩家碰撞替代物。角色碰撞只能来自 `wallMC` 位图。

## 5. Campaign 状态机（`Stats_Campaign.sn/fc`）

`sn` 是全局教学/剧情状态，`fc` 是该状态的帧计数。`runScripts` 在本 tick 的 Unit 前执行；human 的粉色触发在该 Unit 的 `UnitEnterFrame` 末尾执行。粉色触发后总是 `sn++`、`Stats_Campaign.fc=0`、`Arena.changeWallFrame(sn)`（`Unit.as:1047–1093`）。

| 进入状态 | 入口条件 | 本状态关键效果 | 下一步 |
| --- | --- | --- | --- |
| 1 | initial | `fc=0`: guns `none/none`; fc=20 强制台词；fc=90 `hud=tutmove` | human `ff00ff` → 2 / wall 2 |
| 2 | pink contact | 无额外 effect | human `ff00ff` → 3 / wall 3 |
| 3 | pink contact | `hud=tutduck`，强制台词 | human `ff00ff` → 4 / wall 4 |
| 4 | pink contact | 无额外 effect | human `ff00ff` → 5 / wall 5 |
| 5 | pink contact | unit1 台词 | human `ff00ff` → 6 / wall 6 |
| 6 | pink contact | unit2 台词 | human `ff00ff` → 7 / wall 7 |
| 7 | pink contact | unit1 台词 | human `ff00ff` → 8 / wall 8 |
| 8 | pink contact | `hud=tutshoot`；USP2/none；`noAim=false` | human `ff00ff` → 9 / wall 9 |
| 9 | pink contact | 显示 arrow 9 | **USP2 子弹命中 `9900ff`** → 10 / wall 10 |
| 10 | Bullet 分支 | `hud=idle`；台词；清当前 USP2 clip/spare；`elevator.play`；隐藏所有 arrows | human `ff00ff` → 11 / wall 11 |
| 11 | pink contact | `hud=tutclimb`；heal max 后 bypass env 伤害 `hpCur*.8`；`noJump=true`；`S_Mine1/S_Pan` | human `ff00ff` → 12 / wall 12 |
| 12 | pink contact | `S_Equip`；M4/USP，内部 `swapGuns()` 后 M4 active；`hud=tutswitch`；`noJump=false` | **Q 或 Shift**：先普通 swap，再 `sn→13` / wall 13 / door open |
| 13 | Player Q/Shift | `hud=idle`；严格按当前 arrow state 12 重新可见；door open | human `ff00ff` → 14 / wall 14 |
| 14 | pink contact | unit1–3 diff=1，按作者坐标 spawn；door close | 时间/score 剧情；最终 TDM 15 分 |
| 15–18 | score 6/9/12/14 | 仅剧情台词与 `sn++` | 不重置 `fc`，不换 wall |

### 5.1 不能遗漏的微妙顺序

- state 10 的 Bullet 分支顺序是：HUD idle/message → `sn++` → **当前枪的 clip/spare 置 0** → changeWallFrame → elevator.play → hide arrows（`Bullet.as:325–343`）。
- state 12 的 `Player.KeyDown` 顺序是：先 `gun.swapGuns()`，然后仅在 `sn==12` 处理 arrows → `sn++` → changeWallFrame → door open（`Player.as:352–395`）。输入实现若先检查 stage，会改掉枪和 HUD 的真实时机。
- state 11 的伤害第五参数为 `true`，所以绕过 spawn protection/reflect 和 shield 吸收；它不是普通 `80% HP` 的 UI 数字变化（`Status.as:109–265`）。
- state 13 的三名敌人初始没有 `noSpawn`；这一次 spawn 会 reset movement/class/status，并将指定 waypoint 写给 AI，不能仅改坐标/visible。

## 6. 枪械、子弹、伤害与 TDM 结算的连锁

### 6.1 `Guns` 不是单个 active-gun 字段

`Guns.setGuns`（`Guns.as:64–126`）创建 `primaryAmmo`、`secondaryAmmo`，然后 `reset()`；`reset()` 会调一次 `swapGuns()`，使 primary active。`swapGuns`（`176–231`）才同步：

- `curGun`、`curAmmo` 的引用；
- 手部/腿部枪 Display List 可见性与 `gotoAndStop`；
- HUD guns/ammo；
- recoil、reload、Aimer/arena focus。

`shoot` 将 `new param1.cls(...)` 放入 `game.bullets`（`Guns.as:438–541`）。但必须区分 bullet class：`Bullet_Line_Basic` 的**构造函数**立即进行射线 hit、`doHitEffect`、画 line 并 `removeMe()`；其稍后的 `EnterFrame` 是空函数。因此 line hit 发生在当前 Player/AI 的 `Guns.shoot()` 内，而不是等到末尾 bullets phase。末尾 phase 仍负责调用/移除所有 bullet，包括移动投射物。网页不应把“即时 line hit”误删，但必须让它与同一 source bullet record、当前 actor 的后续 Unit 尾部和末尾清理处于同一 tick。

### 6.2 必须保留的伤害/结算边界

- `Status.damage` 先检查 dead、spawn/reflect bypass、team/self、difficulty、skill、shield，再可能 `Unit.die`（`Status.as:109–265`）。
- `Unit.die` 先生成 feed/score/XP/flag/Jug 等，再 `PhysWorld.createCorpse`、hide、`respawnTimer=150`（`Unit.as:519–709`）。
- 每次 kill 改变 `pscore` 后应按 source 时机调用 `MatchSettings.updateScores`；TDM aggregate team scores，达到 15 时 `Game.endGame(true/false)`，HUD 进入 `end`（`MatchSettings.as:355–455`、`Game.as:151–174`）。
- `Hud.InitEnd` 才负责胜利文字、scoreboard、Campaign unlock/save（`Hud.as:535–563`）；网页没有这条链就不能把“15 分”叫通关。

## 7. HUD、对话和声音的真实状态机

HUD 不是 `messages[]`。`Hud.setMsg`（`Hud.as:975–996`）的单一状态为：

```text
if msgForce && !newForce: reject
mc_speak.gotoAndPlay("open")
head.gotoAndStop(actor.unitInfo.frame)
name/text set
msgForce = newForce
msgTimer = seconds * 30
optional SH.playVoice(voice)
```

而 `Hud.EnterFrame` 发生在 Units **之前**：`msgTimer==1` 时先播放 `close` 并清 `msgForce`，再将 timer 减一（`Hud.as:565–619`）。Campaign 1 的所有剧情消息均带 `force=true`，所以它们可以覆盖既有台词，但非强制 feed 不可以。

教程 HUD labels `tutmove/tutjump/tutduck/tutshoot/tutclimb/tutswitch` 需要按 Hud symbol 1540 的 XML 帧与 child matrices 导出。Speak 为 symbol 1488，HudInfo 为 symbol 1504；它们既不能改用系统字体，也不能以普通 HTML 面板替代。

## 8. 当前网页与本规格的已验证差异

以下是源代码可直接证明、而非视觉猜测的阻断项：

1. **C1-RUN-01**：`tutorial-scene-preview.mjs` 没有 Q/Shift input，也没有调用 `applyCampaignOneGunSwap`，故 12→13/door open 不可达。
2. **C1-RUN-02**：同文件将 M4 active 时的 `gunState` 设为 `null`；mousedown 只有 gunState 存在时才射击，故 M4 主战阶段不可达。
3. **C1-RUN-03**：page 的即时 line-bullet hit 对 `Bullet_Line_Basic` 的构造时机本身是对的；错误在于它随后先集中处理其他 AI，再统一处理 Unit/Movement，而非让射手立刻完成自己的 `UnitEnterFrame`，且没有统一 source bullet lifecycle。
4. **C1-RUN-04**：session 的 `setAmmo`、HUD message、door/elevator 只是记录 fields，分别没有连到同一 `Guns.curAmmo`、Hud timeline、Arena child timeline。
5. **C1-RUN-05**：现在没有 `Game.endGame → Hud.InitEnd → Cutscene/Menu` 的 Campaign completion chain。

因此不得以“当前试玩页可启动”来判断本关已完成。

## 9. 实施切片与验收（严格顺序）

### Slice A：无渲染 source tick

建立 `source-tick-runtime`，单一持有 Game/MatchSettings/Arena/Hud/Units/Guns/Bullets 数据。先做 RED：固定 initial snapshot、固定 random、固定输入，按 tick 断言：

- `fc=0/20/90` 的 state 1 事件顺序；
- 每次 pink contact 的 `sn/fc/wall` 原子更新；
- stage 9 子弹命中与 stage 12 Q 的精确顺序；
- M4 30/90 ammo、射击 delay、hit/score、15 分 endGame。

### Slice B：原 Display List runtime

接入 wall 1–16、door、elevator、five DownArrow children、Hud tutorial labels/Speak。每一个 source tick 输出 `wallFrame / visible children / nested movieclip frame / hud state`；渲染器只能消费该输出。

### Slice C：端到端 Campaign trace

固定输入脚本必须覆盖：开始 → `sn=9` → 9900ff → `sn=12` → Q/door → `sn=14` → enemy spawn → score 6/9/12/14 → score 15 → endGame → victory unlock route。trace 要包含 actor pre/post、ammo、bullets、HUD timer、wall/door/elevator、score。

### Slice D：视觉与声音验收

在 trace 已绿之后才做原版录屏/截图、原音频时序对照。录屏对这一阶段很重要，但它不能替代 A–C 的源码和状态验收。

## 10. 禁止的实现方式

- 不在 page event handler 直接改 Campaign state、命中、门或墙。
- 不通过“Q 直接 door=true”或“M4 单独允许鼠标射击”绕开 `Guns` state。
- 不以蓝色矩形、手绘箭头、HTML 对话框、替代音效填充 source timeline。
- 不开放第一关按钮或声称通关，直到 Slice C 全部完成并有完整 trace。
