# 《战火英雄》1:1 复刻证据台账

更新时间：2026-07-22。此文件是实施总计划的可审计版本，配合 [1:1 总计划](ONE_TO_ONE_MASTER_PLAN.md)、[SWF 运行时关系索引](SWF_RUNTIME_RELATION_INDEX.md) 和 [当前交接日志](CURRENT_HANDOFF_2026-07-21.md) 使用。

## 1. 用法与状态定义

每一个对用户可见的功能必须同时拥有四种记录：

1. **原始证据**：原 SWF 的 AS3、时间轴、Display List、节点、导出资源或原版实机采样；
2. **网页承载**：当前实际调用该资料的模块，不把文档、未接入的导出物或仅存在于私有目录的文件算作实现；
3. **自动证据**：能阻止相应回归的测试；
4. **人工证据**：原版并排截图、输入回放或实机逐帧比对。

| 状态 | 严格含义 | 能否说“已 1:1” |
| --- | --- | --- |
| `已定位` | 已找到原始入口或资源，尚未在网页执行。 | 否 |
| `已接入` | 网页实际读取原始资源/数据，但未完整对照规则。 | 否 |
| `已回归` | 有自动测试；测试只证明指定断言，不代表原版一致。 | 否 |
| `已实机对照` | 已与原版同一场景/输入/帧或可见结果比对。 | 仅该条可称“已验证” |
| `完成` | 四种记录齐全，且没有已知差异。 | 是 |
| `阻断` | 缺原始资料、原版采样或运行时契约，禁止用猜测替代。 | 否 |

本台账中“原始资源”均指本仓库已保留的原 SWF 导出物或由它直接导出的运行时副本；临时 CSS 图形、手画图标和近似数值不可以用来关闭条目。

## 2. 总体结论（当前，不是目标）

当前工程拥有一条可启动的网页验证路径，也已把原 SWF 的主要运行时类、14 个地图的视觉资源关系、UnitMC 时间轴、M4 关系和枪表入口定位出来。但它仍是**迁移中的验证工程**：没有任何一个完整模式、战役或全角色/全武器组合达到本台账的“完成”条件。

尤其不得把下列事实混为一谈：

- 14 个地图都能从 `public/assets/maps/` 找到三层图像，**不等于**14 个地图的墙体、镜头、触发器和任务都已复刻；
- `UnitMC` 的 449 帧及其部件矩阵已导出，**不等于**当前浏览器已经逐帧显示所有肢体/枪械状态；
- `Stats_Guns` 已定位 81 把枪的原始资料入口，**不等于**81 把枪已经可用；
- 菜单图、命中区和目录可点，**不等于**所有页面行为、解锁、存档和任务脚本已经还原；
- AS3 静态关系已读到，**不等于**每个表现帧、粒子、音频触发点已经经实机验证。

## 3. 原始运行时主链（作为所有实现的约束）

```text
Main.as（输入/屏幕切换）
  → Menu.as 或 Game.as
  → MatchSettings.as + Stats_Maps/Stats_Campaign/Stats_Guns
  → Arena.as（wallMC → alpha wall mask；Node 列表；尸体 PhysBox）
  → Unit.as（Player/AI）
      → Movement.as（活人探针碰撞、跳跃、蹲伏、攀爬）
      → Guns.as（枪表 → 子弹动态工厂）
      → Status.as / Score
      → UnitMC.as（头、躯干、双臂、腿、枪 holder 和时间轴）
  → MatchSettings.as（模式得分/胜负）
  → Stats_Campaign.runScripts(Game)（战役/挑战帧脚本）
```

关键不可改变关系：`wallMC` 的 alpha mask 同时服务活人移动、子弹和 AI 视线；`NodePhysBox` 只服务死亡尸体的 Box2D 世界，不能拿可见背景或尸体盒取代活人碰撞。输入也必须沿 `Main → Game → Player → Guns/Movement` 传递，而不是另造独立的“点击发射”规则。

## 4. 菜单与入口台账

| 功能 | 原始证据 | 当前网页承载 | 自动证据 | 人工证据 | 当前状态 / 必须补项 |
| --- | --- | --- | --- | --- | --- |
| 首页图与底部导航 | `Menu.as`；原菜单帧导出 | `public/assets/menu-source/`、`src/menu-assets.mjs`、`src/menu-ui.mjs` | `tests/menu-assets.test.mjs`、`tests/menu-ui.test.mjs` | 首页图与可点区需逐项重做原版并排 | `已接入+已回归`；按钮视觉和命中区存在，但还不能称完整菜单行为。 |
| Play → 快速对战 | `Menu.as` 的屏幕动作；快速对战帧 | `menu-state.mjs`、`menu-ui.mjs`、`main.mjs` | `menu-state.test.mjs`、`menu-ui.test.mjs` | 已有本地开始游戏路径；仍需原版逐项参数对照 | `已接入+已回归`；模式、地图、分数、兵种、技能、连杀、modifier、难度每个循环需逐项核对。 |
| Campaign 15 项 | `Stats_Campaign.setMatch(index,false)`，`Menu.as` 目录帧 | 菜单任务索引与启动路径 | `menu-ui.test.mjs`（15 个可见任务项） | 无完整 15 关启动/结算对照 | `已定位+部分接入`；目录可选不表示每关脚本/胜负已迁移。 |
| Challenges 15 项 | `Stats_Campaign.setMatch(index,true)`、`runScripts(Game)` | 菜单任务索引与启动路径 | `menu-ui.test.mjs`（15 个可见任务项） | 无完整挑战回放 | `已定位+部分接入`；必须把每项帧脚本转成可测试事件表。 |
| Soldiers | `Menu.as`、兵种/解锁相关 `Stats_*` | 当前为菜单页/命中区 | `menu-ui.test.mjs` | 未对照选择、预览、解锁 | `阻断`；不可把静态页称为士兵系统。 |
| Options | `Menu.as`、声音/存档写入关系 | 当前为菜单页/命中区 | `menu-ui.test.mjs` | 未对照每项开关和持久化 | `阻断`；必须先找出原字段及副作用。 |
| Medals / Tips / Version | `Menu.as` 与相应导出帧 | 当前为菜单页/命中区 | `menu-ui.test.mjs` | 未逐页对照 | `已接入外观入口`；内容、滚动、条件及返回流尚未验收。 |
| 解锁与存档 | `Main`、`Menu`、相关 `Stats_*`；原 Flash SharedObject 行为待逐项采样 | 现有 `localStorage` 为网页验证状态 | 无原格式兼容测试 | 无 | `阻断`；现有本地状态不可冒充原版存档格式或解锁规则。 |

## 5. 地图、镜头、节点与碰撞台账

### 5.1 所有可选地图的视觉层

| 地图 ID | 原始视觉证据 | 当前网页承载 | 自动证据 | 当前事实与缺口 |
| --- | --- | --- | --- | --- |
| `tut` | 原 sky/background/foreground 导出 | `public/assets/maps/tut/`、`map-visuals.mjs` | `map-visuals.test.mjs` | 三层可加载；镜头、wallMC、教程任务逐项对照未完成。 |
| `foundry` / `foundry2` | BgSky 1、Foundry Bg/Arena；同一原始 terrain 变体关系 | `foundry.png`、`foundry-foreground.png`、`source/sky/1.png` | `map-visuals.test.mjs`、`map-porting.test.mjs`、`wall-mask` 相关测试 | 是当前最深的地图切片：Foundry 节点、33 个盒校验资料和 wall mask 已有；仍须完整镜头/每条边缘/原版模式回放。 |
| `train` / `train2` | BgSky 2/3、Bg 6/8、Arena 3/4 | `public/assets/maps/source/` | `map-visuals.test.mjs`、`map-porting.test.mjs` | Train 的节点计数/出生已回归；原 wallMC mask、火车越界、震屏和逐边碰撞未完成。 |
| `plane` / `plane2` | BgSky 4/7、Bg 10/6、Arena 5 | 同上 | `map-visuals.test.mjs` | 三层与变体关联已接入；原 wallMC、风、震屏、节点/镜头未完成。 |
| `swamp` / `swamp2` | BgSky 4/5、Bg 15/14、Arena 6 | 同上 | `map-visuals.test.mjs` | 三层已接入；水区、wallMC、节点、镜头未完成。 |
| `cave` / `cave2` | BgSky 4/6、Bg 18/19、Arena 7 | 同上 | `map-visuals.test.mjs` | 三层已接入；水区、wallMC、节点、镜头未完成。 |
| `dropship` | BgSky 4、Bg 12、Arena 9 | 同上 | `map-visuals.test.mjs` | 三层已加载过；注册点、wallMC、风、任务和镜头仍是待验收项。 |
| `missile` / `missile2` | BgSky 4/6、Bg 12、Arena 10 | 同上 | `map-visuals.test.mjs` | 三层已加载过；注册点、wallMC、风、任务和镜头仍是待验收项。 |

`tests/map-visuals.test.mjs` 的证明边界：每个当前注册地图三层文件存在、裁切为正且在 PNG 边界内。这是防空白图守卫，**不是**视觉/物理 1:1 测试。

### 5.2 物理与节点

| 子项 | 原始证据 | 当前网页承载 | 自动证据 | 状态 / 禁止的错误做法 |
| --- | --- | --- | --- | --- |
| 活人墙体 | `Arena.as` 先绘制 `wallMC`，`Movement.hitTest()` 读取 alpha 255 | `wall-mask.mjs`（Foundry）；`engine.mjs` | `engine.test.mjs`、Foundry wall 测试 | `已接入（仅 Foundry 原始 mask）`；其余地图不能拿可见图或 Foundry mask 代替。 |
| 碰撞盒/节点资料 | `Arena` 的 NodeSpawn/Waypoint/AiAction/Pickup/CTF/Holdpoint/PhysBox | `arena-source-layouts.mjs`、`foundry-layout.mjs`、`engine.mjs` | `map-porting.test.mjs` | `已接入部分`；节点数据存在不等于逐个功能在模式中已消费。 |
| 出生/CTF/DOM | `NodeSpawn`、`NodeCtfFlag`、`NodeHoldpoint` | `engine.mjs` | `map-porting.test.mjs`、`objective-visuals.test.mjs` | Foundry 坐标和基础目标已回归；其余地图和完整得分/返回规则需逐项对照。 |
| 镜头 | `Game`/Arena 本地坐标与原 SWF 画面 | `camera.mjs`、`dom-map-layer.mjs` | `dom-map-layer.test.mjs`、`scene-presentation.test.mjs` | `已接入`；每图注册点、边界、震屏尚未实机验收。 |
| 斜坡、探针、攀爬 | `Movement.as:doJump`、`Movement.as:hitTest` 和 Unit 状态 | `engine.mjs` | `engine.test.mjs` | `已回归若干场景`；必须先保留原探针语义，再补每图 wall mask，禁止为了视觉移动地图/脚底/pivot。 |

## 6. 角色、动画、瞄准与 HUD 台账

| 子项 | 原始证据 | 当前网页承载 | 自动证据 | 当前状态 / 必须补项 |
| --- | --- | --- | --- | --- |
| UnitMC 时间轴 | `UnitMC.as`；symbol 669、449 帧、frame labels、Display List matrix | `public/assets/unitmc-timeline.json`、`unit-dom-rig.mjs`、`main.mjs` 的 `#actorOverlay` | `unit-dom-rig.test.mjs`、`scene-layering.test.mjs`、`unit-render-plan.test.mjs` | `已接入+已回归（第一纵切）`；浏览器已确认两个角色各生成 10 个原始部件，静态完整皮肤在时间轴就绪后隐藏，瞄准会改写前臂矩阵。尚未逐帧对照全部动作。 |
| 原始 Medic 完整皮肤 | 解包的 Unit 皮肤导出物 | `public/assets/unit-parts/unit-idle.png`、`#actorOverlay` | `unit-render-plan.test.mjs`、`scene-layering.test.mjs` | `已接入可见回退`；只有 timeline 尚未加载或某帧不可用时才显示，不能关闭跑、攀爬、瞄准状态机条目。 |
| 头/躯干/手臂/腿/枪 holder | `UnitMC.EnterFrame()` 和 `Unit.as` 覆盖矩阵 | `unit-dom-rig.mjs`、`main.mjs` 的 DOM part layer | `unit-dom-rig.test.mjs`、`scene-layering.test.mjs` | `已接入+已回归（10 部件）`；解除了 Canvas/DOM 合成导致角色不可见的阻断。仍需对跑、跳、蹲、攀爬、开火和换弹逐帧与原版采样核验。 |
| 瞄准与左键发射 | `Main.MouseDown → Game.MouseDown → Player.mDown → Guns.shoot`；鼠标转 Arena 坐标 | `main.mjs`、`engine.mjs`、`m4-action-selector.mjs` | `engine.test.mjs`、`m4-action-selector.test.mjs` | `已接入部分`；须验证鼠标反向、枪口 pivot、持枪姿势、射击帧和换弹帧。 |
| 准星（普通 M4 动态帧） | `Aimer.as`；1431 frame 1：`line1–4`（1424）与 `circle`（1428）；`Player.as:83–94` 的距离/余弦展开公式；`Guns.as:269–305,522–525` 的动态后坐力；`Stats_Guns` M4 recoil=4；`Stats_Classes` Medic L1 aim=70→`Unit.as` 归一化=.70 | 原 1431 合成图仅作加载中回退；`aimer-rig.mjs`、`main.mjs`、`engine.mjs` 使用原 1424/1428 PNG、原矩阵、`MC.arm1` pivot、后坐力一帧快照 | `aimer-rig.test.mjs`、`aimer-source.test.mjs`、`engine.test.mjs` | `已接入+自动回归+浏览器对局确认（普通 M4）`；已删除几何准星，左键经原 `dynRecoil → dynRecoilMod → Player` 帧时序驱动 5 个原部件。浏览器确认菜单隐藏、3 图层入场、原 PNG 返回 200、鼠标/左键输入进入对局。**未完成**：1431 frame 2 狙击准星、反射状态、所有武器/兵种/技能倍率、原版逐帧叠图。 |
| 头顶血条 / 底部 HUD | `Hud` symbol 1540、`Status`、`Unit.bar_hp/bar_hurt` 关系 | `main.mjs` 直接载入 `hud-scorebar-1462.png` 与 `hud-expholder-1477.png`，并以 `hud-ammo.mjs` 重建 954 的 `drawBox` 逻辑；`unit-status.mjs`；单位条已有原 670 源图 | `unit-status.test.mjs`、`aimer-source.test.mjs`、`hud-ammo.test.mjs` | `部分接入+自动回归`；1462/1477 已在原锚点接入，954 已按原公式和双轴翻转接入 M4 `arifle`。顶部生命区、头顶动态条、职业/生命/等级、备用弹文字、枪图和动态经验宽度仍未迁移，不能称 HUD 完成。 |
| 原始舞台坐标 | SWF header：800×600、30fps；HUD/Aimer 以此舞台坐标布局 | `index.html` 的 800×600 canvas；`style.css` 4:3 地图/角色覆盖层 | `stage-format.test.mjs`；浏览器实测 | `已接入+浏览器确认（基线）`；浏览器确认内部像素 800×600、显示比 1.3333、3 地图层和两套 10 部件角色可见。**未完成**：Hud 1540 的原坐标/安全区/响应式缩放逐像素对照。 |

### 6.1 HUD 1540 的已确认拆解与首批接入边界

- `Hud` symbol **1540** 的 idle frame 在原 800×600 舞台放置：`txt_classname` 1442=`(3,531)`、`txt_hp` 1441=`(71,560)`、`txt_ammo` 1440=`(668,559)`、`bulletCont` 954=`(664,571)`、`curgun` 724=`(674,568)`、`scorebar` 1462=`(180,23)`、`expholder` 1477=`(201,588)`；这些是网页替换当前临时 `drawHud/drawBottomHud` 的坐标证据。
- `HudInfo` symbol **1504** 位于 `(101,245)`，有 9 帧；其第 1 帧已由 FFDec 直接导出，尺寸 291×291，是原教程信息窗，不可误当底栏。
- 原 `ScoreBar` 1462 已导出为 184×45；原经验容器 1477 为 397×16。两者已机械复制为 `public/assets/original-swf/hud-scorebar-1462.png` 和 `public/assets/original-swf/hud-expholder-1477.png`，并由 `main.mjs` 直接在原 800×600 锚点 `(180,23)` 与 `(201,588)` 绘制。
- TDD：`ea1db89` 是 RED，`aimer-source.test.mjs` 证明旧运行时代码并未读取这两个原图；`85054e1` 是 GREEN，要求运行时代码读取精确原路径并以两个精确 Hud 1540 坐标绘制。全量回归为 124/124，覆盖率为 99.08% 行、88.18% 分支、93.61% 函数。
- **严格边界**：FFDec 导出的 1462/1477 是当前静态时间轴图像，不是 `Hud.as` 所有动态文本、计分、`bar_exp.width` 或 `setAmmoImage()` 的完整替身。本次已删除与 1477 重复的手画经验线，但仍保留的临时生命/弹药/职业绘制必须在找到相应原 symbol 与状态关系后逐项替换。

#### 6.1.1 已从 `Hud.as` 逐项确认的动态契约（下一次 HUD 改动的唯一依据）

| 原 Hud 1540 子项 | character / 原舞台 placement | 原 AS3 写入关系 | 网页当前状态 | 下一次正确迁移方式 |
| --- | --- | --- | --- | --- |
| 职业文字 `txt_classname` | 1442, `(2.95,530.60)` | 由当前 Player 的 `unitInfo`/职业资料写入 | 仍是临时 Canvas `Medic` | 先导出 1442 的字形/文本样式或确认运行时字体；从真实 Player 职业而非固定文案写值 |
| 生命文字 `txt_hp` | 1441, `(70.60,560.25)` | 随 `Status` 当前 HP 更新 | 仍是固定 `85 Hp` | 连接 Player `hp/maxHp` 和原文本格式；同时接入 `Status` 头顶条，不可只改底栏 |
| 等级 `txt_level` | 1438, `(63.15,580.75)` | `addExp` 升级后写 `"lvl: " + level` | 仍是固定 `lvl: 1` | 使用原格式、真实职业存档等级；等级上限 50 的分支也必须保留 |
| 当前枪名 `txt_curgun` | 1439, `(633.95,530.60)` | `setGuns(first, second)` 写 `first.name` | 未接入 | 用 Stats_Guns 原 `name`；不要写武器别名或 CSS 图标 |
| 当前枪图 `curgun` | 724, `(674.20,568.00)`, `scale=1.7536468505859375`, matrix `b=-0.5263671875,c=0.5263671875` | `setGuns` 执行 `curgun.gotoAndStop(first.sprite)` | 当前为另一路手绘/变色图逻辑，未与 Hud 724 对齐 | 先导出 724 的帧及枪 ID→`sprite` 映射；按该 matrix 绘制，不能以通用 M4 轮廓替代 |
| 下一枪 `nextgun` | 724, `(649.40,580.70)`, `scale=.6141357421875` | `setGuns` 执行 `nextgun.gotoAndStop(second.sprite)` | 未接入 | 与 `curgun` 共用原 724 时间轴，但保留不同位置/缩放 |
| 备用弹药 `txt_ammo` | 1440, `(667.60,559.25)` | `setAmmoImage(..., param4)` 写 `"" + param4` | 临时手画数字 | 由真实 `weapon.spare` 写入，采用原文本部件/样式 |
| 弹匣容器 `bulletCont` | 954, `(664.30,571.30)`, `scaleX=-1,scaleY=-1` | `setAmmoImage(clip, clipMax, type, spare)` 清空 graphics 后以 `drawBox` 生成 | 当前矩形方向、尺寸和位置均为近似 | 保留原容器的双轴翻转；逐类型重建原 `drawBox` 参数，参数见下表 |
| 经验容器 `expholder` | 1477, `(200.55,588.45)` | `bar_exp.width = exp / Stats_Classes.getNextExp(level) * 420`; level 50 强制 `420` 与 `Level Maxed` | 静态 1477 原图已接入；动态宽度/文本未接入 | 需要拆出 1477 内 `bar_exp` 与 `txt_exp`，保留宽度 420、等级上限和升级递归逻辑 |
| 比分条 `scorebar` | 1462, `(180.45,23.00)` | 构造时写模式名；每帧由 MatchSettings 计分关系更新 | 静态 1462 原图已接入；模式/比分动态未接入 | 找到 1462 的嵌套文字/条元件及模式帧，再对接真实 MatchSettings，不得复用截图内的 17 分 |

`Hud.setAmmoImage(clip, clipMax, type, spare)` 的原始弹匣盒参数如下；`drawBox(index, gap, width, height, filled, rowY=0)` 的横坐标为 `index * (gap + width)`，线框 alpha 为满弹 `1`/空弹 `.4`，填充 alpha 为满弹 `1`/空弹 `.2`：

| `type` | 循环上限 | `drawBox` 参数 | 特殊规则 |
| --- | --- | --- | --- |
| `pistol` | `clipMax` | `(i,2,2,6,clip>i)` | 无 |
| `magnum` | `clipMax` | `(i,3,3,7,clip>i)` | 无 |
| `arifle` | `clipMax` | `(i,2,2,10,clip>i)` | 当前 M4 应走此分支 |
| `sniper` | `clipMax` | `(i,3,20,5,clip>i)` | 无 |
| `shotgun` | `clipMax` | `(i,2,5,8,clip>i)` | 无 |
| `rocket` | `clipMax` | `(i,3,7,12,clip>i)` | 无 |
| `machine` | 两行各 `clipMax/2` | `(i,2,2,5,clip>i)`；第二行 rowY=`7` | 先计算 `overflow=max(clip-clipMax/2,0)`，第一行 `clip -= overflow`，第二行用 `overflow>i` |

这些数据直接来自 `assets/reverse/ffdec-deep-20260720/scripts/Hud.as` 的 `addExp`、`setAmmoImage`、`drawBox` 和 `setGuns`。下一项实现应优先选择 **954 的原容器翻转 + arifle 弹匣** 或 **1477 的动态 `bar_exp`** 中的一个，分别完成 RED→GREEN→原版对照；不可在同一提交顺手替换所有 HUD。

#### 6.1.2 954 `bulletCont` 的已完成 M4 纵切

- 原始依据：`Hud.as:setAmmoImage(clip, clipMax, "arifle", spare)` 对每格调用 `drawBox(i,2,2,10,clip>i)`；Hud 1540 将 character 954 放在 `(664.30,571.30)`，并设置 `scaleX=-1, scaleY=-1`。
- 网页承载：`src/hud-ammo.mjs` 逐字面转录所有可见弹种布局；`src/engine.mjs` 的当前 M4 武器状态显式标为 `ammoType:"arifle"`；`src/main.mjs` 在 954 原锚点做双轴翻转后直接画该公式产生的 2×10 格，不再保留旧的 5×25、`index*7` 放大近似。
- TDD：`d8244c6`（缺模块的 RED）→ `ad268ec`（原公式 GREEN）；`4f8d8c3`（运行时 placement RED）→ `1145f0f`（954 transform GREEN）。`tests/hud-ammo.test.mjs` 覆盖 `arifle` 满/空格、machine 双行溢出和运行时锚点/翻转/旧近似移除。
- 验证边界：本项证明当前 M4 弹匣按原公式/容器关系绘制；它不证明其它 80 把枪的 `ammoType` 已接入、`txt_ammo` 原字体/原位置已完成，或 HUD 已做原版逐像素截图对照。
| 兵种、皮肤、随机角色 | `Stats_Skills`、`Unit.setClass()`、Quickmatch bot profile | 部分 Medic 验证资产 | 无全覆盖 | `阻断`；不得用单一 Medic 演示取代完整角色系统。 |

## 7. 武器、子弹、伤害、音效与特效台账

| 子项 | 原始证据 | 当前网页承载 | 自动证据 | 当前状态 / 必须补项 |
| --- | --- | --- | --- | --- |
| 81 把枪的数据入口 | `Stats_Guns.as:addGun(...)`（81 条）；解析关系 | 枪表解析工具与 M4 验证路径 | `stats-guns-parser.test.mjs` | `已定位+已回归解析`；解析成功不代表所有记录已转为游戏数据。 |
| M4 肢体/枪械时间轴 | M4/前后臂/UnitMC label；深度报告中的 rifle/fire/reload 区间 | `m4-action-selector.mjs`、`vector-runtime-renderer.mjs`、`main.mjs` | `m4-action-selector.test.mjs`、渲染测试 | `已接入部分`；枪械图层可见性和完整 3 帧开火/35 帧换弹仍需逐帧输出/对照。 |
| 枪械行为 | `Guns.as:shoot()`、`makeBullet()`、Stats_Guns 字段 | `engine.mjs` | `engine.test.mjs` | `已回归基础 M4 风格路径`；不能当作完整 81 把枪实现。 |
| 子弹种类 | 8 个 Bullet 子类；wall→敌人→尸体顺序 | `engine.mjs` 的基础实现 | `engine.test.mjs` | `已定位`；hitscan/反弹/跟踪/地雷/溅射等需逐类迁移与回归。 |
| 伤害、盾、爆头、职业修正 | `Status.damage()` | `engine.mjs`、`unit-status.mjs` | `engine.test.mjs`、`unit-status.test.mjs` | `已接入部分`；必须按原判定顺序和职业/模式条件验证。 |
| 声音、枪火、弹壳、粒子、爆炸 | `Stats_Guns` 名称字段、Effect/Particle、时间轴 | 基础音频模块 | 无逐枪逐帧测试 | `阻断`；没有原资源/触发点对照前不得自制替代效果。 |

## 8. AI、规则、战役与挑战台账

| 子项 | 原始证据 | 当前网页承载 | 自动证据 | 当前状态 / 必须补项 |
| --- | --- | --- | --- | --- |
| AI 目标/视线 | `AI.as`；每 1–12 帧错峰扫描，20px wall line-of-sight，450/枪射程限制 | `engine.mjs` | `engine.test.mjs` | `已接入近似`；需要按源码分支建立状态/输入回放，不能仅凭“会开枪”判定完成。 |
| AI 路点/ActionBox | `NodeWaypoint`、`NodeAiAction`、AI 路径关系 | `arena-source-layouts.mjs`、`engine.mjs` | `map-porting.test.mjs`、`engine.test.mjs` | `已定位+部分接入`；每图图搜索、跳跃、蹲伏、坑脱困必须与原版实机对照。 |
| 五种常规模式 | `MatchSettings.as`，dm/jug/tdm/ctf/dom 计分关系 | `engine.mjs`、目标视觉模块 | `engine.test.mjs`、`objective-visuals.test.mjs` | `已接入基础`；出生、胜负、队伍、旗帜和占领完整生命周期尚未逐模式回放。 |
| Jug / Zom 等特殊规则 | `MatchSettings`/`Stats_Campaign` | 部分基础模式数据 | 无完整回放 | `阻断`；需要原始参数、角色转换和结束条件。 |
| Campaign 15 关 | `Stats_Campaign.setMatch`、`runScripts(Game)` | 目录/索引 | 菜单任务项测试 | `已定位`；关卡的对话、波次、强制武器、胜负条件和结算尚未完整迁移。 |
| Challenge 15 关 | 同上，`caType=1` | 目录/索引 | 菜单任务项测试 | `已定位`；重洗、永久技能、特殊出生等脚本尚未转录。 |
| 随机武器/角色 | Quickmatch 创建时的 Stats 表抽取；复活不重掷，party 为例外 | 当前有限原型 | 无参数矩阵测试 | `阻断`；必须转成可种子化、可测试的原始随机规则。 |

## 9. 证据缺口清单与实施顺序

以下顺序是依赖顺序，不是“哪项看起来最容易”。每完成一小段，就应在本台账把原始证据、模块、测试、人工回放链接补齐。

1. **完成角色渲染的剩余状态**：已将 10 个原始部件、绘制顺序、frame matrix、左右翻转和瞄准 holder 放进稳定 DOM 层；接下来逐帧对照 Medic + M4 的 run/jump/duck/climb/aim/fire/reload，补齐真实 M4 action 帧，而不是轮播整帧截图。
2. **原 HUD symbol**：从解包物定位职业/血量/经验/弹药/准星/头顶条的 exact symbol、裁切和时间轴，接入稳定层，并以原图截图逐项对照。
3. **逐图 wallMC**：先导出并审计每个 Arena 的 wall mask 与地图坐标关系，再让 Movement、Bullet、AI 统一读取；每图建立出生、边缘、坡、平台、坑、攀爬和镜头回归。
4. **M4 完整纵切**：完成枪的数据、手臂标签、子弹、后坐、HUD、声音/枪火的原始时间关系，再扩展到 Stats_Guns 的其余 80 把枪，禁止把固定 M4 演示扩张为“完整枪表”。
5. **AI 路径纵切**：选择一个有坑和 ActionBox 的原始地图，按 waypoint parent-chain、jump/crouch action、脱困、敌人切换、视线和难度逐项对照，再复制到每张地图。
6. **模式和战役**：把 `Stats_Campaign.runScripts(Game)` 的每个脚本分支转换为显式、可序列化事件数据和测试；只在一关完整开始→结束对照通过后，才在菜单中将该关标为“可玩”。
7. **最后才做联机/部署**：联机不会修复单机不一致。只有本台账中单机模式和地图达到完成门槛，才讨论服务器同步、反作弊、房间、延迟与部署。

## 10. 每次提交的最低更新模板

每次涉及游戏行为的提交必须在 PR/提交说明和本台账中补齐以下格式：

```text
功能：例如“Foundry 左侧平台小攀爬”
原始证据：Arena symbol/帧、Movement.as 行号或函数、原版截图/输入
网页实现：src/…
RED 测试：tests/…（提交 hash）
GREEN 测试：npm test + npm run test:coverage
人工回放：地图/出生点/输入序列/截图路径
已知差异：若有，列出；有差异则状态不能是“完成”
```

完成定义不允许例外：只有当相应条目四种记录齐全、并无已知行为差异时，才把状态改为 `完成`，并在 [1:1 总计划](ONE_TO_ONE_MASTER_PLAN.md) 中同步标记。
