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
| UnitMC 时间轴 | `UnitMC.as`；symbol 669、449 帧、frame labels、Display List matrix | `public/assets/unitmc-timeline.json`、`unit-rig.mjs`、`main.mjs` | `unit-render-plan.test.mjs`、`vector-runtime-renderer.test.mjs` | `已定位+部分接入`；时间轴资料不等于浏览器已可见地逐帧重建。 |
| 原始 Medic 完整皮肤 | 解包的 Unit 皮肤导出物 | `public/assets/unit-parts/unit-idle.png`、`#actorOverlay` | `unit-render-plan.test.mjs`、`scene-layering.test.mjs` | `已接入可见回退`；当前 DOM 覆盖层保证角色不消失，但仅能显示完整 idle 皮肤/翻转，不能关闭跑、攀爬、瞄准状态机条目。 |
| 头/躯干/手臂/腿/枪 holder | `UnitMC.EnterFrame()` 和 `Unit.as` 覆盖矩阵 | `unit-rig.mjs`、`main.mjs` Canvas 路径 | 相关渲染测试 | `阻断`；Canvas 与 DOM 图层合成契约曾导致角色不可见，必须将真实部件状态以稳定可见层输出，并逐帧对照。 |
| 瞄准与左键发射 | `Main.MouseDown → Game.MouseDown → Player.mDown → Guns.shoot`；鼠标转 Arena 坐标 | `main.mjs`、`engine.mjs`、`m4-action-selector.mjs` | `engine.test.mjs`、`m4-action-selector.test.mjs` | `已接入部分`；须验证鼠标反向、枪口 pivot、持枪姿势、射击帧和换弹帧。 |
| 头顶血条 / 底部 HUD / 准星 | 原 HUD symbol、Status/Unit 显示关系 | `main.mjs`、`unit-status.mjs` | `unit-status.test.mjs` | `阻断`；现有文字/几何 HUD 不能称为原 HUD，需要导出并接入原 symbol，确认裁切、层级和随状态变化。 |
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

1. **稳定角色渲染契约**：保留当前原始完整皮肤 DOM 覆盖层以防角色消失；将 UnitMC 每帧部件矩阵、z-order、翻转和枪械 holder 转换为同一稳定层，先完成 Medic + M4 的 idle/run/jump/duck/climb/aim/fire/reload 对照。不得轮播整帧截图冒充独立肢体。
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
