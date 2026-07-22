# 当前交接与验证日志（2026-07-21）

本文件是下一位开发者或 AI 的当前入口。旧报告保留解包证据与历史过程；若它们和本文件冲突，以本文件、当前代码与测试为准。

## 快速开始

```powershell
npm test
npm run test:coverage
npm start
```

本地入口：<http://127.0.0.1:4173>。当前基线：`npm test` **130/130 通过**，覆盖率为 **99.08% 行、87.93% 分支、93.72% 函数**，高于 80% 门槛。历史段落中保留的 123/124/127/128 计数是各自提交时的快照，不能拿来表示当前基线。

最低人工验收路径：主页 → **快速对战** → **Previous map**（摘要为 `Facility · Deathmatch`）→ **开始游戏**。2026-07-21 已实际跑通，原始设施场景已显示，不再出现 `#111827` 空白画布。

这只证明教程图场景层已实际显示，**不**代表所有地图、所有角色动作、所有武器和所有模式均完成 1:1 验收。

## 运行时结构

```text
原始 SWF 导出
  ├─ public/assets/menu-source/       原菜单帧
  ├─ public/assets/maps/tut/          教程图三层运行时副本
  ├─ public/assets/maps/source/       其余原始 BgSky / Bg / Arena 三层运行时副本
  └─ assets/reverse/                  SWF、AS3/P-code、wall 和逐帧证据

浏览器
  ├─ menu-*.mjs                       原菜单命中区、模式/关卡选择
  ├─ map-loader.mjs                   sky/background/terrain 原子加载
  ├─ map-visuals.mjs                  地图 ID、图层、裁剪关系
  ├─ dom-map-layer.mjs                原图裁剪与相机 CSS 布局
  ├─ main.mjs                         输入、HUD、角色 Canvas、地图图层装配
  ├─ engine.mjs                       物理、攀爬、武器、AI、模式、得分
  └─ wall-mask.mjs                    Foundry 原始 wallMC 的不透明像素判定
```

### 地图空白问题与修复

症状：教程图进入后 HUD 可以显示，但三层 PNG 没有在 Canvas 中可靠地提交，画面露出 CSS 默认底色。

当前方案：

- 原始 `sky / background / terrain` 作为 `#mapBackdrop` 下的 DOM 图像层；
- Canvas 透明，仅绘制角色、弹道、特效与 HUD；
- `getDomMapLayerLayout()` 使用 `sourceCrop + camera source rect + world config` 推导 CSS 尺寸/偏移，禁止用固定缩放近似；
- `loadMapLayers()` 保证三层均成功后才替换地图；
- `commitStartedGameFrame()` 在进图完成时立即提交一帧，不依赖可能被限速的 `requestAnimationFrame`。

回归测试：`tests/map-loader.test.mjs`、`tests/map-visuals.test.mjs`、`tests/dom-map-layer.test.mjs`、`tests/game-start-render.test.mjs`。

### 2026-07-22：全关卡运行时资源审计

- 所有 14 个可启动地图 ID（教程、11 张快速对战图、Dropship、Missile 及夜间变体）均改为只引用 `public/assets/maps/**`；运行时不再读取被 `.gitignore` 忽略的 `private-assets/*export`。
- 新增的地图资源测试会逐张读取 sky/background/terrain 的 PNG 头，验证三层均存在、均有可用裁切，且裁切矩形不越出图像实际尺寸。
- 该测试还暴露并修正了三类会造成空白或错位的问题：Foundry 两层缺失裁切（原先为隐式 `0×0`）、BgSky 导出实际比记录少 3 像素高、Train 背景和宽天空导出实际少 2–3 像素宽。
- 浏览器人工启动已复核：Facility、Foundry、Speeding Train、Caverns、战役第 13 关 Boarding Action、战役第 14 关 One Final Effort；前四张能显示相应的原始地图图层，两个战役专用图也能完成三层加载。Dropship/Missile 的精确场景注册点、碰撞与任务流程仍需逐图对照原版，不能据此宣称像素级完成。

## 解包关系：可直接复用的证据

| 范围 | 已确认结论 | 入口 |
| --- | --- | --- |
| UnitMC 669 | 449 帧离散显示列表；头和双臂必须使用 holder 对齐。 | `unitmc-timeline.json`、深度报告 |
| M4 | 501 后臂、668 前臂；`rifle=77`、`rifle_fire=78–80`、`rifle_reload=81–115`。 | 深度报告 §13–14 |
| Arena 节点 | 出生、waypoint、AI action、pickup、CTF、DOM、`NodePhysBox` 是逻辑节点，不是装饰。 | `arena-source-layouts.mjs` |
| Foundry 墙体 | Flash 先将 wallMC 画入 BitmapData 后隐藏；可用时角色/子弹/AI 应共用同一掩码。 | `wall-mask.mjs`、`Arena.as` |
| AI | 选敌、墙体视线、路径/动作框、难度开火来自不同逻辑层。 | `AI.as`、`engine.mjs` |
| 武器表 | `Stats_Guns.addGun` 已具备结构化解析及关系索引。 | `parse-stats-guns.mjs` |

不要用整帧 UnitMC PNG 轮播替代部件状态机；会丢失持枪瞄准、后坐、翻转和独立肢体关系。

## 已完成与未完成

### 已有自动化覆盖

- 原始菜单帧、可点击菜单区域、快速对战循环、战役/挑战目录；
- 14 个可启动地图的原始三层运行时资源、裁切边界自动审计；教程、Foundry、Train、Caverns 与 Boarding Action 的人工可见性验收；
- Foundry/Train 等已登记地图的节点、出生、路径和规则数据；
- 移动、跳跃、蹲伏释放、坡面、攀爬、弹道、换弹、伤害、复活、相机；
- UnitMC 部件矩阵回放、鼠标瞄准、M4 枪口/弹道共同坐标；
- CTF、DOM、Juggernaut、本地基础 AI；
- Foundry wallMC alpha 掩码解析。

### 仍不得写成“已完成”

- 所有地图的逐图镜头、场景注册点、碰撞和战役结束条件人工验收；
- 81 把武器的完整属性及开火/换弹子时间轴；
- M4 `rifle_fire` 三帧和 `rifle_reload` 35 帧的完整矢量渲染；
- 原版全部角色、随机档案、关卡推进、滤镜、粒子、音频混音、存档格式；
- 公网联机（当前 HTTP 房间只用于本地原型）；
- 像素级一比一结论。

## 不可破坏的约束

1. 物理、渲染坐标、加载与菜单改动必须先写 RED 测试，再跑全量测试和覆盖率。
2. 不要为修视觉移动 `NodePhysBox`、wall mask、玩家脚底或枪口 pivot。
3. 缺素材优先回到解包目录和关系报告找原始导出/时间轴，不手画替代素材。
4. 地图三层必须成组替换；不能只换 terrain。
5. Foundry wall mask 不能误用在其他地图；各地图必须导出自己的 wallMC。
6. 当前仓库含原始/派生资料；任何再次公开或分发前需重新核对授权和可见性。

## 下一步建议

先独立复现并修正“某些实际页面角色 Canvas 仅显示 HUD、地图已显示”的问题。测试矩阵：教程图/Foundry 各一次，静止、左右走、跳、蹲起、贴墙跳、攀爬、鼠标瞄准、左键射击。

之后只选一个纵向切片：M4 开火/换弹时间轴、下一张地图 wallMC 掩码，或一个完整战役关的节点/结束条件。不要同时改地图、物理和 AI。

## 2026-07-22：Hud 1540 文本与 Aimer Canvas 崩溃修复

### Hud 1540 文本（仅当前 Medic + M4 纵切）

- 原始证据：Hud 1540 frame 1 的 TextField placements 1442/1441/1438/1439/1440，以及 `Status.as` 的 `Math.ceil(hp) + " Hp"`。字体 979（`QTypeSquare-Bold_12pt_st`）和 981（`QTypeSquare-Bold_10pt_st`）为原 SWF 直接导出物。
- 网页承载：`src/hud-text-source.mjs` 按原 twips→800×600 坐标、文本矩形、对齐和 alpha 生成五个字段；`src/main.mjs` 加载两种原字体并消费该表；`engine.mjs` 的当前 Medic/M4 状态提供实际值。禁止回退成硬编码 system-ui 标签。
- TDD：`faea139` 为有效 RED（`hud-text-source.mjs` 缺失），`cfe7343` 为 GREEN。`tests/hud-text-source.test.mjs` 锁定原字段数据和运行时消费关系。
- 验证边界：浏览器进入快速对战后能显示文本，但尚未完成与原 SWF 相同状态截图的逐像素叠图；动态经验填充、换枪、其它兵种/枪械不能标为完成。

### Aimer 1431 四参数矩阵崩溃

- 现场复现：重新加载网页进入快速对战时，浏览器状态报错 `Failed to execute 'transform' on 'CanvasRenderingContext2D': 6 arguments required, but only 4 present.`，导致 `render()` 在准心处中断。
- 原因与原始关系：symbol 1431 的子项 matrix 仅保存 Flash 的线性 `a,b,c,d`，其 `x,y` 是父级 Display List placement；Canvas 的 `transform()` 必须接收 `a,b,c,d,e,f`。
- 修复：保留先前的 `ctx.translate(part.x, part.y)`，再调用 `ctx.transform(...part.matrix, 0, 0)`。这不是补画准心，也没有改变原矩阵/注册点。
- TDD：`e0e6587` 是实际 RED（运行时代码仍为无效四参数调用），`d229469` 是 GREEN。全量 `npm test` 132/132 通过，`npm run test:coverage` 为 99.09% 行、87.34% 分支、93.81% 函数。
- 浏览器验收：重新加载 → 快速对战 → 原始菜单内“开始游戏”；菜单隐藏，`canvas=[800,600]`，无启动失败状态，Foundry 地图、原部件角色、原素材 Aimer 与 HUD 均可见。

**仍不得写成“1:1 已完成”**：上述为两个有证据的局部纵切和一个运行时阻塞修复；完整角色状态、全部地图 wallMC/任务、81 把枪、五种模式完整生命周期、15 战役/15 挑战、音频/特效、存档和逐帧像素差分仍处于未完成状态。总计划的最终完成门槛不变。

## 2026-07-22：战役/挑战源目录机械迁移，取消伪可玩入口

- 原始证据：`assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as:setMatch(stage, type)`。它不只给出菜单的地图/模式/分数，还逐关调用 `setCutscene`、`setLvl`、`setPlr`、`addBot`；例如 Campaign 1 的 Scientist、四个 bot、精确出生点、`noAim`、M4/USP、教程特殊文本和前/后过场帧都在同一源码块。
- 可重现产物：`private-assets/parse-stats-campaign.mjs` 仅解析 literal ActionScript call，不执行 AS3；`npm run extract:campaign` 生成版本控制的 `src/campaign-source.mjs`。`campaign-source-catalog.test.mjs` 要求生成物与当前解包 AS3 完全深相等，防止手写简表漂移。
- 菜单承载：`menu-state.mjs` 已删除手写 30 项数组，直接由上述 catalog 派生菜单任务，且每个项保留 `definition` 引用。`tests/stats-campaign-parser.test.mjs` 锁 15+15 数量、Campaign 1 全部角色/过场以及 Challenge 特殊规则；`menu-state.test.mjs` 锁菜单不会丢失原定义。
- 诚实启动门槛：携带 `definition` 的任务在完整 actor/script/cutscene/end 流程迁移前必定被 `isPlayableSelection` 拒绝；`main.mjs` 在原菜单画面下方非美术边缘显示具体原因。浏览器复验为：主页 → 战役 → 第 1 关，`gameStage.hidden=true`、`sourceMenu.hidden=false`，并显示“角色、脚本、过场或胜负流程尚未完整迁移，不能伪装为快速对战。”
- TDD 链：`cc6fee2`→`f311d4c`（AS3 解析器）；`98c9da4`→`a4f6612`（可交付生成目录）；`5fd14e0`→`3514479`（菜单消费原定义）；`d798069`→`7873944`（阻止伪快速对战）；`056bf34`→`de42592`（显示状态）。完整回归为 138/138，覆盖率 99.35% 行、87.70% 分支、94.12% 函数。

**下一位的唯一正确续作**：不要解除任何任务的启动限制来“恢复可玩”。先选择 Campaign 1，将 `setPlr/addBot` 的 actor 创建、`runScripts` 的 `sn/fc` 状态、前后 Cutscene frame、胜利判定和解锁保存逐项建成可序列化运行时与原版输入/截图对照；只有该关从开始到结束无已知差异，才能单独解除第 1 关的限制。

## 2026-07-22：Campaign 1 脚本跨类证据生成（尚未接入运行时）

- 原始证据不是单个 `setMatch()`：`Stats_Campaign.as:runScripts()` 提供 `sn/fc` 计时及比分分支；`Unit.as` 读取角色脚底 `(0,1)` 像素，`ff00ff` 仅在人类走到 Campaign 1 时触发教程状态；`Bullet.as` 的环境命中色 `9900ff` 在 `sn==9` 时启动电梯分支；`Player.as` 的 `swapGuns()` 在 `sn==12` 时推进并开门。此前只加载地图/目录无法还原这条分散状态机。
- 可重现生成链：`private-assets/parse-campaign-one-script.mjs` 只读取四份已解包 AS3；`npm run extract:campaign` 生成公开运行时可读的 `src/campaign-one-script-source.mjs`。输出锁定 9 个计时动作、4 个比分推进以及三种外部触发条件，所有文本、帧数、语音标识、坐标和状态号均来自原代码。
- TDD：`d39478f` 是缺解析器的 RED，`ad70a43` 为跨类提取 GREEN；`e0f0366` 是缺浏览器生成物的 RED，`412f3c4` 为生成物 GREEN。`tests/campaign-one-script.test.mjs` 锁定提取结果，`tests/campaign-one-script-source.test.mjs` 锁定生成物与当前解包源完全深相等。全量回归为 141/141，覆盖率为 99.32% 行、87.56% 分支、94.44% 函数。
- 严格边界：这不是 Campaign 1 “已完成”或“可玩”。`engine.mjs` 尚未消费该数据，`tut` 的独立 wallMC、彩色触发像素、原 actor 创建、教程 HUD frame、Cutscene timeline、胜负流程、解锁/存档和原版输入/截图对照均未完成。因此第 1 关入口必须继续拒绝启动。

**下一位唯一可接受的第一步**：先为一个原始 Campaign 1 动作写 RED——例如初始 `sn=1,fc=0` 的禁枪、20 帧语音或 `ff00ff` 脚底触发；再将 `SOURCE_CAMPAIGN_ONE_SCRIPT` 作为数据依赖接入新的可序列化 Campaign 1 运行时。禁止把该表手抄进 `engine.mjs`，禁止解除菜单入口，禁止以普通 Foundry 快速对战替代教程关。

## 2026-07-22：Campaign 1 状态机与 Tutorial 会话模型（仍不可启动）

- 已完成的来源驱动状态面：生成物现锁定 9 个 `runScripts` 帧动作、4 个 `team1score` 分支、`ff00ff` 人类脚底接触的 14 个 `sn=1..14` 状态、`9900ff` 子弹环境命中和 `sn=12` 换枪开门。伤腿的满血→当前血量 80% 环境伤害、`noJump`、补给后 M4/USP/换枪/恢复跳跃、Unit 1–3 生成、门/电梯/HUD/声音调用均由同一 AS3 抽取器保留。
- `src/campaign-one-runtime.mjs` 实现原 `Stats_Campaign.fc` 的“判定后递增”语义，以及比分、脚底、换枪、电梯的状态变换；它只返回原效果事件，尚不假装已经渲染或执行。`src/campaign-one-session.mjs` 从 `SOURCE_CAMPAIGN_CATALOG.campaign[0]` 和 `ARENA_SOURCE_LAYOUTS.tut` 合成会话：Tutorial `wallCharacter=1378`、Scientist 与三名敌人的精确出生点、`noAim`，以及无出生点的 Unit 4 友军都可审计。
- TDD 链：`a24bba0`→`54dce87`（帧/比分）；`b2350f4`→`eb179d8`（脚底/换枪）；`5fcf7f0`→`0c6e2e1`（电梯）；`a98c4d2`→`580e1d8`（来源会话）；`d4ddee1`→`d5f7b64`（伤腿/补给解析）。最终补充了运行时回归 `2165c59`。全量为 148/148，覆盖率 99.34% 行、87.68% 分支、95.00% 函数。
- **不可越过的边界**：`tut` 只有可见三层与 Arena 节点；原 `Wall_tut` 的逐帧像素墙体 / 彩色触发图尚未在网页端导出和消费。现有 `engine.mjs` 仍是通用快速对战 actor，不能承担 Scientist、Tank、Soldier、Medic 的原属性、`noAim/noJump`、脚底色或 Unit 4 延迟生成。没有这些、Cutscene、原 HUD 与结束/解锁前，战役入口必须继续拒绝启动。

**下一位唯一正确步骤**：从 `Wall_tut_240`/symbol 1378 导出每一个被 `changeWallFrame` 使用的原始 wall bitmap 与颜色，再写 RED：`ff00ff` 只有原触发像素能推进且 `9900ff` 只有原子弹环境命中能开电梯；之后才可把 `campaign-one-session` 接入专用 Tutorial World。不得用 NodePhysBox、可见前景或 Foundry mask 代替 `Wall_tut`。

## 2026-07-22：Wall_tut 16 帧资源与会话效果落地（仍不可启动）

- FFDec 26.1.0 以 `-format sprite:png -selectid 1378 -export sprite` 从原 SWF 导出 `Wall_tut_240` 的 **16** 帧；每帧为 2757×1541。原 PNG 已直接置于 `public/assets/original-swf/wall-tut-1378/`，不以 Foundry mask 或 NodePhysBox 代替。
- `private-assets/analyze-wall-tut.py` 使用 PNG 原像素生成颜色审计，`tools/generate-tutorial-wall-source.mjs` 生成 `src/tutorial-wall-source.mjs`。已确认 `ff00ff` 在 frame 1–3、5–8、10–11、13 存在；`9900ff` **只**存在于 frame 9，bbox=`[2547,575,2572,698]`、像素数=3224。这与 `Bullet.as` 的 `sn==9` 分支和 `Arena.changeWallFrame()` 16 帧语义直接一致。
- `campaign-one-session` 现在消费效果事件：`changeWallFrame` 改写会话 wallFrame，`spawn` 改写原 Unit 1–3 的位置和 spawned 标记，`setDiffStats`、枪械/禁瞄准/禁跳、门与电梯状态保留于会话。`c1c6a2a`→`f658c3e` 锁定状态 13 的精确三人重生和 wall frame 14；`3c75f82`→`867f7e9` 锁定 16 帧资产与关键颜色。全量为 150/150，覆盖率 99.36% 行、87.01% 分支、95.09% 函数。
- **严格边界**：以上是资产、颜色与会话状态，不是网页碰撞已切换。`decodeFlashWallImage`/`engine.mjs` 只在当前通用 Foundry 路径消费像素 mask；还没有为 Tutorial 预加载 16 帧、按 `session.map.wallFrame` 替换 mask，也没有让玩家脚底或子弹在这些真实像素上触发。菜单入口继续关闭。

**下一位唯一正确步骤**：写一个 browser/runtime RED，要求 Campaign 1 会话加载的 `wallFrame=1` 读取 `wall-tut-1378/1.png`，状态 9 的 `9900ff` 命中切到 `10.png` 并刷新同一 wall mask；然后才把 `ff00ff` 人类脚底测试挂到该 mask。必须复用 `decodeFlashWallImage` 的 alpha-255 语义，不能缩放、裁切或改色。

## 2026-07-22：Tutorial 原 Wall_tut 帧加载/选择基础设施（仍不可启动）

- RED/GREEN：`499dfc4`→`8f47efd` 新增并通过“16 帧必须全部加载”的回归；`f28402c`→`cd2fcfc` 新增并通过“只按原帧号选择对应解码碰撞蒙版、缺第 16 帧即拒绝”的回归。测试没有伪造任何墙面、碰撞盒或地图图像。
- 承载边界：`src/map-loader.mjs:loadSourceWallFrames` 仅把 `tutorial-wall-source.mjs` 的原 PNG 与其 frame 元数据配对；`src/tutorial-wall-runtime.mjs:createTutorialWallSet` 仅在全部 16 帧存在后调用既有的 `decodeFlashWallImage` 并以 frame 号取回 mask。它尚未导入 `main.mjs`，更没有解除 Campaign 1 的启动限制。
- 验证：完整 `npm test` 为 153/153 通过；`npm run test:coverage` 为行 99.36%、分支 87.16%、函数 95.19%。

**下一位唯一正确步骤**：在不改用通用 Foundry actor/NodePhysBox 的前提下，先建立 Tutorial 专用 world 的 RED：初始会话只能选择 `Wall_tut` frame 1；Campaign 1 的状态 9 环境子弹命中后，必须在同一个可碰撞 world 中原子替换成 frame 10 的 mask；失败或任一帧未加载时，关卡必须留在不可启动状态。随后再验证 `ff00ff` 的人类脚底触发。角色、Cutscene、胜负/解锁流程均未完成，入口继续关闭。

## 2026-07-22：Tutorial ARGB 表面与 Campaign 1 原触发切换（仍不可启动）

- 原始关系：`Movement.hitTest()`、`Unit.getPixel(0,1)` 和 `Bullet.hitTestAll()` 都调用 `arena.wall.getPixel32()`。只有 ARGB 的 alpha 前缀为 `ff` 时是物理墙；`Unit` 使用 RGB 后缀 `ff00ff` 识别教程脚底；`Bullet` 使用 RGB 后缀 `9900ff` 进入状态 9 电梯分支。
- 网页承载：`createFlashWallSurface` 不再把原图压扁成 boolean，仅在 alpha=255 时提供 `isSolid(x,y)` 与六位小写 `colorAt(x,y)`。`tutorial-world.mjs` 只消费 `CampaignOneSession + Wall_tut`，不依赖通用 Foundry quick-match engine。其脚底/子弹入口读取**当前**帧的 `colorAt`，先运行原状态机，再在 `changeWallFrame` 效果存在时同步替换整个 ARGB 碰撞表面。
- TDD：`0e8c2c6`→`882d241` 锁 alpha 与 `ff00ff/9900ff` RGB；`41cebae`→`e86ebc8` 锁状态 9 的命中、状态、会话帧和主动碰撞表面共同切到 frame 10；`29607cc`→`af4f4e3` 锁第 1 帧的人类脚底 `ff00ff` 切至 frame 2。全量为 157/157，覆盖率为行 99.36%、分支 87.42%、函数 95.35%。
- 严格边界：该 world 是经单元回归验证的数据/碰撞承载，尚未被 `main.mjs` 解码/渲染，未接入原 Scientist/敌人 Unit、Movement 完整 30fps、Bullet 飞行、Hud/Cutscene、分数、死亡、结算或解锁。Campaign 1 菜单入口必须继续拒绝启动。

**下一位唯一正确步骤**：先为浏览器加载写 RED：从 `public/assets/original-swf/wall-tut-1378/1..16.png` 全部加载，调用同一 `decodeFlashWallImage` 形成带 `colorAt` 的 `TutorialWallSet`，然后构造 `TutorialWorld`；任一帧失败或解码结果没有 ARGB surface 时拒绝。之后才将该世界与原始 Tutorial actor/输入适配器逐项接入，禁止把它替换成当前通用 `createWorld({mapId:'tut'})`。

## 2026-07-22：浏览器 Tutorial 原墙体加载器（仍不可启动）

- TDD：`8eeb588` 是缺浏览器加载器的 RED；`6989476` 为 GREEN。`tests/tutorial-world-loader.test.mjs` 验证浏览器构造边界逐一请求 `tutorial-wall-source.mjs` 的 16 个公开原 PNG、全部加载后才传入 ARGB 解码器，并生成 `map='tut' / wallFrame=1` 的 `TutorialWorld`。
- 承载：`src/tutorial-world-loader.mjs` 仅组合 `loadSourceWallFrames`、`createTutorialWallSet`、`decodeFlashWallImage` 和 `createTutorialWorld`；默认路径无手写地图、颜色、NodePhysBox 或 Foundry 图像。某帧加载失败时 Promise 拒绝，不能产生可进入的空白 Tutorial。
- 严格边界：此模块尚未由 `main.mjs` 调用；原因不是遗漏入口，而是 Campaign 1 仍缺原角色、完整 Movement/Bullet、HUD、Cutscene、死亡/分数/结算。不能为了演示加载器而放开任务入口。

**下一位唯一正确步骤**：先建立从 Campaign 1 原 actor 定义到 Tutorial 专用输入/物理 actor 的一对一适配层，并针对 Scientist 初始禁瞄准/无枪、Unit 1–4 的出生/未出生、`noJump` 等写 RED。不得把 `engine.mjs` 当前 Medic/M4 quick-match actor 重新命名成 Scientist 后接入。

## 2026-07-22：Campaign 1 原角色身份与皮肤帧来源（仍不可启动）

- 原始证据：`Stats_Classes.getClass()` 定义 Medic/Assassin/Commando/Tank 的 id、`startFrame`、`runType` 与 1–50 级线性数据；`Unit.setClass()` 的皮肤选择是 `unitInfo.frame = startFrame + skin`，随后 `UnitMC.setSkin()` 将该数值写入 head/body/arm/leg/foot 等**子 MovieClip**。Campaign 1 `Stats_Campaign.setPlr/addBot` 提供 Scientist / tank / soldier / medic 的 soldier 和 skin，且 Unit 4 `noSpawn=true`。
- 承载：`private-assets/parse-stats-classes.mjs` 机械提取原类数据；`npm run extract:campaign` 新生成 `src/class-source.mjs`，并由 `tutorial-actor-bindings.mjs` 建立独立 Tutorial binding。其当前精确子部件 skin index 为 Scientist Medic skin 7→57、Tank skin 5→105、Commando skin 5→155、Medic skin 5→55、未出生 Unit 4 Commando skin 1→151；这些不是 UnitMC 根时间轴编号。
- 诚实边界：Campaign 原 Player 等级由 `MatchSettings.updatePlayer()` 读取保存档 `SD.classSaves[...]`，不是 Campaign 1 的静态值；绑定层明确将 level 保留为 `null`，不会偷用 prototype 的 level-1 Medic 数值。绑定层也尚未调用通用 engine、UnitMC DOM renderer 或浏览器输入。
- TDD：`661ae7f`→`957ed58`（Stats_Classes 原记录/公式）；`1c39d19`→`2443653`（浏览器生成物一致性）；`6264b40`→`1f125c7`（Campaign 1 的五位 actor 身份、帧、出生/禁瞄准和枪械）。完整回归 162/162，覆盖率行 99.37%、分支 87.45%、函数 95.48%。

**下一位唯一正确步骤**：不要把 `57/105/155` 当根时间轴帧或渲染成站立整图。先按 `UnitMC.setSkin()` 的 head/body/arms/legs/feet 子层定位与导出这些 skin index，再把根时间轴的 run/jump/crouch/climb/fire/reload Display List 组合到各皮肤；脚底 ARGB 碰撞、`noAim/noJump`、原枪械和相机都须在同一专用 world 中按输入回放验证。

## 2026-07-22：纠正错误的 Tutorial skin→root-frame 映射

- 发现：`public/assets/unit-frames/1..449.png` 是 UnitMC symbol 669 的**根动画时间轴**导出；`UnitMC.setSkin(57/105/155...)` 却是对嵌套 head/body/limb MovieClip 的 `gotoAndStop`。两者编号空间不同，不能相互替换。
- 处理：`401540c` 是将语义改成 `skinFrame` 的有效 RED；`445799f` 为 GREEN，改名 binding 字段且删除 `tutorial-actor-render-plan.mjs` 与其错误的根 PNG 映射。此前 `8741264`→`e293af5` 已被该修复明确废止，不能作为渲染完成证据。
- 严格边界：当前只保留正确的角色身份/skin index，尚无 Tutorial 可视 actor。下一步必须从原 SWF 的嵌套 skin Display List 导出子部件，而不是搜索同号根帧 PNG。

## 2026-07-22：UnitMC 嵌套 skin 图谱已可重跑（仍不可启动）

- 机械提取：`private-assets/parse-unitmc-skin-graph.mjs` 同时读取原始 SWF 的 Display List 与 `UnitMC.as:setSkin()`，得到根动画 `669`（449 帧）和 14 个实际 skin target：头 `666`（200 帧）、躯干 `631`、上下腿 `598/568`、脚 `538`、以及双臂内的上臂 `298`、下臂 `266`、手 `385`（其余均 201 帧）。这证明 `57/105/151/155` 应当送入这些子 Sprite，绝不是根动画帧。
- TDD：`52c915c` 在缺少提取器时确认 RED；`e64034f` 完成原 SWF/AS3 联合解析并 GREEN。`tests/unitmc-skin-graph.test.mjs` 同时锁定完整 target 顺序、角色根时间轴与最小可用皮肤帧范围；完整回归为 163/163，覆盖率行 99.38%、分支 87.20%、函数 95.73%。
- 严格边界：本工作只建立可审计导出图谱；尚未导出/组合目标皮肤位图，也未将 Campaign 1 actor 接入网页、输入、枪械动作或碰撞。不得据此开放 Tutorial 关卡或宣称角色迁移完成。

**下一位唯一正确步骤**：用图谱导出 Campaign 1 的 `55/57/105/151/155` 每个原始子 Sprite，并从 `arm1`/`arm2` 的枪型时间轴提取对应的局部矩阵；先以一个固定原始根动画帧 + 一个皮肤 index 做像素/矩阵组合 RED→GREEN，再接入连续状态机。

## 2026-07-22：Campaign 1 原 skin PNG 与浏览器来源表（仍不可启动）

- 原资源已交付：`public/assets/original-swf/unit-skins/DefineSprite_{266,298,385,538,568,598,631,666}/{55,57,105,151,155}.png` 共 40 张，直接用 FFDec 26.1.0 从 `4399-90433-25.swf` 的相应 nested Sprite/frame 导出。它们覆盖本 Tutorial 的五个 source skin index，包含头、躯干、上下腿、脚和双臂的上/下臂及手。
- 浏览器来源表：运行 `node tools/generate-tutorial-skin-source.mjs` 会用原始图谱生成 `src/tutorial-skin-source.mjs`；`tutorialSkinAssetPath()` 只接受 `266/298/385/538/568/598/631/666`，明确拒绝 `669`，因此调用方无法再把 root 动画帧当作皮肤图。
- TDD：`a00dba6`→`111376d` 固化 40 张直接导出 PNG 的存在性、格式和非零尺寸；`fef904b`→`bd4430e` 固化浏览器来源表与原 SWF 图谱逐项一致。完整回归 165/165，覆盖率行 99.38%、分支 87.20%、函数 95.76%。
- 严格边界：PNG 尚未接入 `main.mjs`。现有 `m4-vector-runtime.local.json` 是 501/668 的枪械**动作** Display List，但其 `childFrames` 未灌入 Campaign skin index，不能作为 Tutorial 角色外观；不得将其与这些 PNG 的任意固定组合声称为已完成角色。

**下一位唯一正确步骤**：解析 501/668 在 `rifle`、`rifle_fire`、`rifle_reload` 每帧对 `266/298/385` 的矩阵和枪械子层，并以 `skinFrame` 注入。先完成一个 `root-frame + arm-action-frame + skin-frame` 的可复现静态组合截图对照，再接入玩家状态机。

## 2026-07-22：原 Aimer 静态资源接入记录

本次完成的是一个边界明确的小纵切，不是“HUD 已完成”。

- 原始证据：`Aimer.as`、symbol 1431（2 帧）；其第 1 帧的 Display List 为 `line1–line4`（character 1424）和 `circle`（character 1428）。
- 原图：从 FFDec 的 symbol 1431 导出结果裁出透明有效区，接入 `public/assets/original-swf/aimer-1431-frame1.png`；元数据在 `src/aimer-source.mjs`。
- 运行时：`main.mjs` 直接绘制该原图，定位为鼠标坐标减去原注册中心 `(13,13)`；之前的 Canvas `arc()` 与手绘十字以及空图片占位已删除。
- TDD 证据：`6770d66` 是 RED（测试证明运行时仍未导入原图并保留手绘回退）；`afa544c` 是 GREEN（同一测试通过）。完整测试 117/117 通过。
- 浏览器验收：主页 → 快速对战 → 开始游戏。确认菜单隐藏、游戏舞台可见、3 个地图图层存在、Canvas 光标隐藏，截图内为原导出 Aimer，而不是旧圆圈/加号。

**本段后续已完成的动态纵切（保留原文字以便阅读静态起点）**：1424/1428 已逐一导出到 `public/assets/original-swf/`，`aimer-rig.mjs` 按 Player.as 余弦公式、1431 的 five-placement matrix 和 FFDec SVG 注册点重建；`engine.mjs` 接入当前 M4/Medic 的原 `dynRecoil`、姿态倍率及 Player→Unit 一帧时序快照；`main.mjs` 以 `MC.arm1` 枢轴和原图绘制。浏览器已进局并触发左键；两张资源由本地服务器以 PNG/200 返回。

**仍未完成且不能误报**：1431 的狙击 frame 2、反射状态、非 M4 枪械、其他兵种/等级/技能倍率、以及和原 800×600 录屏的逐帧叠图都没有完成。完整 Hud 1540 仍是独立阻断项；舞台基线现已就绪，下一步可在此基础上进行像素级 HUD 对照。

## 2026-07-22：800×600 舞台基线修正

- 原始证据：SWF header 明确 `widthPx=800`、`heightPx=600`、`frameRate=30`。
- 变更：`index.html` Canvas 从 1280×720 改为 800×600；`main` 的最大宽度、地图 DOM 层、Canvas 和 actor overlay 的比例从 16:9 改为 4:3。镜头、鼠标输入、地图裁切和 DOM 角色层原本均读取 canvas 宽高，因此没有另行写一套缩放或碰撞补丁。
- 自动验收：`stage-format.test.mjs` 锁定原 header、canvas 属性和三层 4:3 CSS；全量 123/123 通过。
- 浏览器验收：进入快速对战后确认 `canvas=[800,600]`、显示比 `1.3333`、菜单隐藏、地图层=3、两个 actor 都含 10 个原 UnitMC 部件。

**边界**：此项只恢复了舞台和相机的坐标基线，不代表 HUD 1540 已迁移或像素级截图已通过；当前顶部/底部仍有待替换的临时 HUD 绘制。

## 2026-07-22：Hud 1540 首批原图接入（ScoreBar / Experience Holder）

- 原始依据：Hud symbol 1540 的 idle Display List 将 `scorebar`（character 1462）放在原舞台 `(180,23)`，将 `expholder`（character 1477）放在 `(201,588)`；直接导出物分别为 184×45 和 397×16。
- 运行时变更：这两个 PNG 已从 `private-assets/hud-core-export/` 机械复制到 `public/assets/original-swf/`，`src/main.mjs` 在原始 800×600 坐标直接 `drawImage`。原先自行画出的经验横线和 `Exp 1 / 43` 已删除，避免与 1477 的原图叠加。
- TDD 提交链：`ea1db89 test: require source HUD score and experience art` 为实际 RED；`85054e1 fix: render source HUD score and experience holders` 为同一测试的 GREEN。全量 `npm test` 为 124/124 通过，`npm run test:coverage` 为 99.08% 行、88.18% 分支、93.61% 函数。
- 本次浏览器核验：页面仍能得到原 800×600 Canvas，且两张原 HUD PNG 均由本地页面创建并可加载。该浏览器会把页底“开始战斗”的语义鼠标点击投递到可视区外（目标点 `y=723`），因此无法在本轮完成对局截图验收；**不得把这条资源存在性核验描述为完整 HUD 实机对照**。

**仍缺且下一位必须继续解包/迁移**：`Status` 头顶条的真实显示关系、`txt_classname`/`txt_hp`/`txt_ammo`、`curgun` 724、`Hud.as` 的动态经验宽度、`setAmmoImage()` 的其余枪型弹匣格、各模式比分逻辑和原 HUD 的逐像素对照。HUD 当前仅达到“两个静态原部件与 M4 弹匣公式已接入并自动回归”。

**此段的后续进展（2026-07-22，保留上文以说明起点）**：954 `bulletCont` 现已完成当前 M4 的原始纵切。`Hud.as` 的 `arifle` 分支使用 `drawBox(i,2,2,10,clip>i)`；网页将 M4 标为原类型 `arifle`，在 Hud 1540 placement `(664.3,571.3)` 施加 `scale(-1,-1)` 后绘制，不再使用旧的放大 `index*7` 矩形。RED/GREEN 提交是 `d8244c6`→`ad268ec`（公式）以及 `4f8d8c3`→`1145f0f`（运行时 placement）。全量回归为 127/127，覆盖率为 99.08% 行、87.96% 分支、93.69% 函数。仍未完成的清单不变，尤其是原字体文本、724 枪图、其他枪型和逐像素实机对照。

**此段的再后续进展（2026-07-22）**：原 `curgun` 的 M4 图标已接入。证据链为 `Stats_Guns` 的 `M4.sprite="M4"` → GunsMenu 724 label `M4`（第 20 帧）→ Hud 1540 的 `(674.2,568)` 变换矩阵。FFDec 26.1.0 重新导出的 87×36 第 20 帧已置于 `public/assets/original-swf/hud-gunsmenu-724-m4-frame20.png`；`main.mjs` 直接画原 PNG，删除旧滤镜/占位枪图。`73c8954`→`d999f96` 是 RED/GREEN 提交。全量回归为 128/128，覆盖率为 99.08% 行、87.72% 分支、93.69% 函数。仍只覆盖 M4 的当前枪图，不能误报为全枪 HUD 或完整切枪系统。

**经验条深解包记录（2026-07-22，尚未网页接入）**：1477 不应再被当成不可拆的静态图。其 depth 1=1474 灰斜纹、depth 2=1475 绿斜纹、depth 3=`bar_exp` 918、depth 6=`txt_exp` 1476；918 内部为白矩形 699，并在 1477 depth 3 接收 `mult=[0,0,0,77]`、`add=[255,255,0,0]` ColorTransform 和 `a=3.1491546630859375,c=.6520538330078125,d=-.5157470703125,tx=-1.4,ty=8.4` 矩阵。`Hud.addExp` 的宽度规则是 `exp/(level²*3+40)*420`，50 级例外为 420/`Level Maxed`。这证明动态进度不能通过裁整张 1477 PNG 实现；完整数据和下一步门槛见证据台账 §6.1.4。

**经验规则与可公开运行时资源（2026-07-22，规则已锁定，视觉仍阻断）**：`3f1c387` 是真实 RED：新增 `tests/hud-experience.test.mjs` 后，因 `src/hud-experience.mjs` 不存在而失败；`6e102f7` 是 GREEN：`getHudExperience({level, exp})` 逐字面转录 `Stats_Classes.getNextExp(level)=level²*3+40`、`Hud.addExp` 的 420 宽度公式和 50 级 `Level Maxed` 分支。当前全量为 130/130，覆盖率 99.08% 行、87.93% 分支、93.72% 函数。直接从 FFDec 导出的 `hud-exp-base-1474.svg`、`hud-exp-green-1475.svg`、`hud-exp-fill-699-source.svg` 和 `hud-exp-font-981.ttf` 已加入 `public/assets/original-swf/`，但**尚未由 `main.mjs` 消费**。原因是原版把 918 置于斜切矩阵后再设置 ActionScript `MovieClip.width`；在未对原 SWF 实机采样其零值、半值和满值实际 bounding/matrix 前，不允许用 Canvas clip 或任意 `scaleX` 猜测替代。下一位应先取得这三个原版状态的截图/矩阵，再新增“运行时分层经验条”RED 用例并接入。

## 2026-07-22：Tutorial 皮肤原始 Shape 证据与 M4 注入边界（仍不可启动）

- 纠正：`DefineSprite_598` 的直接导出包含一个名为 `gun` 的子层（character 505），但原 `UnitMC.setSkin()` 明确执行 `legup2.gun.visible = false`。因此把腿导成整张容器 PNG 后直接复用会导致左/右腿的枪械层错误，不能作为最终人物渲染。
- 机械提取：`parse-unitmc-skin-graph.mjs` 现可按 `UnitMC.as:setSkin()` 的目标表读取 55/57/105/151/155 的嵌套 Display List、每个 child 的注册 bounds 和直接 Shape character。`tools/generate-tutorial-skin-shape-source.mjs` 从该图谱生成 `src/tutorial-skin-shape-source.mjs`，不接受手写角色图或根动画 669。
- 原始资源：39 个所需 `DefineShape` 均由 FFDec 26.1.0 直接从 `4399-90433-25.swf` 导出到 `public/assets/original-swf/unit-skin-shapes/{character}.png`。每个 head/body/arms/legs/feet 映射都指向其原 Shape；不会把 character 505 混入 `legup2`。
- M4 边界：`src/m4-skin-child-frames.mjs` 已把原 M4 501/668 arm action 的 `gun=20` 与 Tutorial 的六个 arm child skin frame 合成来源表。这只是可测试的 Display List 输入，尚未接入浏览器，也不是可玩的 Tutorial actor。
- TDD：`745df7c`→`ff69f22` 锁 M4 子肢体注入；`173bcf5`→`eb3b2ed` 锁子部件注册 bounds；`6e7042e`→`86f380f` 锁浏览器来源；`8ec935e`→`4c051b8` 锁 `legup2.gun` 的独立层；`70e8400`→`b8507c3` 锁 39 张原 Shape 文件和无枪腿映射。最新全量验证：`npm test` / `npm run test:coverage` 均为 170/170 通过，99.27% 行、86.72% 分支、95.82% 函数。
- 严格边界：这些资源和关系**还没有**组成浏览器内的一名 Tutorial 角色，更没有进入菜单、输入、物理、AI、过场或结算。不得把“皮肤部件可证实导出”说成“游戏 1:1 已完成”。

**下一位唯一正确步骤**：为一个固定原 root 动画帧与一个 M4 action frame 写 RED，要求在每个原 child matrix 和 crop-origin bounds 下拼装 Shape，而非拼装 container PNG；之后用同一套计划驱动 run/jump/climb/aim/fire/reload。完成原版截图叠图前，不接入/开放 Campaign 1。

## 2026-07-22：固定 Tutorial 姿势的原矩阵拼装计划（仍不可启动）

- 裁切原点：`extractUnitMCSkinBaseShapeBounds()` 读取直接 Shape 的 SWF RECT，而不是 child Sprite 的视觉并集；浏览器生成物 `tutorial-skin-shape-bounds-source.mjs` 已覆盖五个 Tutorial skin frame。以 Scientist frame 57 为例，`legup2` 的正确 crop 是 `[-5.5,11.1]×[-2.95,13.55]`，而不是含枪层的 598 container 边界。
- 姿势计划：`tutorial-unit-pose-plan.mjs` 不生成动画、不绘制替代图；它只将一个已解码 UnitMC root frame、一个原 M4 rear/front action frame 和一个 `skinFrame` 组合成三类原数据层：静态 head/body/leg/foot Shape、后/前臂 Shape 以及原 M4 gun sprite。根矩阵与 action local matrix 被保留为两个精确层级，禁止提前拍平或四舍五入。
- 资源交付：此前被忽略的 13.88 MB `public/assets/m4-vector-runtime.local.json` 已进入版本控制；`tutorial-unit-pose-runtime.mjs` 只有在该源 JSON 成功加载且包含 501/668 的 rifle front/rear Display List 时才返回，不会换成手画枪臂。
- TDD：`a687ded`→`69cd100`（直接 Shape bounds）；`a361541`→`d1f34cb`（浏览器 crop 来源）；`fbc1a23`→`b8e2183`（固定姿势：frame 1 + M4 rifle + skin 57）；`9cd12f0`→`6d4f8cc`（公开 M4 runtime loader）。全量为 175/175，覆盖率 99.27% 行、86.59% 分支、95.98% 函数。
- 严格边界：这是**一帧的可审计拼装计划**，不是 Canvas/DOM actor，更不是完整跑、跳、攀爬、瞄准、开火状态机。没有原版截图叠图、浏览器渲染、玩家输入或 Campaign 1 启动路径，故不得标记为 1:1 完成。

**后续已完成的承载边界**：`tutorial-unit-pose-renderer.mjs` 现在会按原 root matrix、action local matrix 与 Shape crop RECT 绘制，不含旧 Medic/整臂 PNG 回退；`tutorial-unit-gun-renderer.mjs` 递归画 M4 character 375 的原 frame 20；`tutorial-unit-pose-assets.mjs` 只加载 39 个直接 Shape 和版本控制的 M4 Display List。`tutorial-pose-preview.html` 可作为独立证据页打开。浏览器审计确认页面观测到 39 个 Shape、UnitMC JSON 和 M4 JSON，画布 `data-ready=true`、无错误；内嵌浏览器截图接口仅给出异常窄裁切，不能将其当作像素对照截图。

**严格边界不变**：固定姿势浏览器承载不等于 Tutorial actor、原版截图叠图或任何可玩关卡。下一位应获取原 SWF 相同 skin+weapon+root/action frame 的可靠截图后进行像素叠图；再按原 30fps root/M4 action 帧推进 run/jump/climb/aim/fire/reload。不要把此渲染器接回当前 generic Medic quick-match renderer。

## 2026-07-22：Tutorial M4 原动作离散帧解析（仍不可启动）

- 原始证据：`Guns.as:setFrame()` 对 idle 调用 `arm1/arm2.gotoAndStop(curGun.frameIdle)`，而 fire/reload 追加 `"_fire"`/`"_reload"` 后调用 `gotoAndPlay()`。版本控制的 501/668 Display List 对应 M4 label 的实际帧为 `rifle=[77]`、`rifle_fire=[78,79,80]`、`rifle_reload=[81..115]`。这些不是可任意缩放的动画时长，也不能固定取每段第一帧。
- 承载：`src/tutorial-m4-action-frame.mjs` 的 `tutorialM4ActionFrame()` 只接受原 runtime 中存在的 label 与零起始离散 index，返回前/后臂同一实际帧及其原 `items` 列表；不存在的 label、负数、越界 index、缺失 items 或前后帧不一致会拒绝。`createTutorialUnitPoseAtAction()` 将该列表交给既有 root/action/skin 姿势计划，不插值、不循环、不生成替代臂或枪。
- TDD：`1016983` 是模块不存在时的 RED；`140f5a1` 是 GREEN。测试锁定 idle=77、fire 的首/末=78/80、reload 的首/末=81/115，且锁定 fire 第 2 个 Display List 的枪局部矩阵正确进入姿势计划。完整 `npm test`/`npm run test:coverage` 为 **185/185 通过**，99.24% 行、86.74% 分支、95.88% 函数。
- 严格边界：这里的 `actionIndex` 是证据输入，尚未从原 `shootDelay`、`reloading`、帧率/播放停止条件推导，也未接入浏览器 actor。因此它不是“能开火/能换弹”的实现，更不是完整角色状态机或 1:1 游戏。

**下一位唯一正确步骤**：继续从 `Guns.as`、枪械 stats 和 arm Sprite timeline 建立原 `shootDelay`/reload 完结到 action index 的逐帧时钟，并和 UnitMC 根 30fps 状态帧一起在 Tutorial 专用 actor 中回放。每个时钟转移均须先有原 SWF 实机帧或 AS3 证据与 RED；没有可靠原版截图叠图前，不能开放 Tutorial 菜单入口、更不能声明 1:1 完成。

## 2026-07-22：Tutorial M4 arm 回调机械提取（仍不可启动）

- 原始证据：`Guns.as` 将 `shootDelay` 声明为 `uint`，并在射击后赋值 `curGun.shootDelay * 30`；M4 的 source stat 是 `0.15`，因此原 AS3 的 uint 写入为 4 个 tick。原 `arm_gun_316.as` 的 `addFrameScript` 以零起始索引注册时间线回调：可见 frame 80 调 `doneShoot`，81 调 `reloadSound`，115 调 `doneReload`。`UnitMC` 的同名方法才会切回 idle/补充弹药。
- 承载：`private-assets/parse-arm-gun-callbacks.mjs` 机械读取原 `addFrameScript` 对并追踪对应 ActionScript handler 中对 parent 的调用；`tutorial-m4-action-playback.mjs` 必须接收该回调表，然后以 M4 runtime 的原实际帧返回 callback。它没有写入猜测的动画长度或完成时机。
- TDD：`93ea60e` 为缺提取器/播放边界的 RED；`91ca95f` 与 `d0e70b6` 为 GREEN 并确保解析器被版本控制。全量 `npm test`/`npm run test:coverage` 为 **188/188 通过**，99.25% 行、86.46% 分支、95.97% 函数。
- 严格边界：播放模块目前仅是纯数据边界，未被浏览器 actor 消费。`doneShoot`/`doneReload` 的真实动作尚未和原 UnitMC 根身体状态、输入、弹药、物理、镜头或可见画面共同回放，故不得称为可玩 Tutorial 或 1:1。

## 2026-07-22：UnitMC 根时间轴 FrameLabel 原始来源（仍不可启动）

- 原始证据：直接遍历 `4399-90433-25.swf` 的 `DefineSprite 669` 内部 tag，得到 frameCount=449 和 23 个 `FrameLabel`。它不仅包含先前简化表里的 idle/run/jump/fall/duck/climb，还包含必须保留的 `landrun1`、`landrunback1`、`landrun2`、`landrunback2`、`land`、`tuck`、`slide`。例如 `run1=21`、`landrun1=39`、`runback1=58`、`run2=95`、`jump=191`、`slide=291`、`landhard=409`。
- 承载：`extractUnitMCRootTimeline()` 从 SWF 的真实 `FrameLabel` tag 返回 label 边界；浏览器 `tutorial-unitmc-root-timeline-source.mjs` 与该提取结果逐项相等。它不借用 `engine.mjs` 的合并后 `UNITMC_FRAMES`，不能再把落地过渡、滑铲或两种 runType 抹成同一段。
- TDD：`3f5d9d5` 是浏览器来源表不存在时的 RED；`a766fe8` 是 SWF 机械提取与浏览器来源表 GREEN。完整 `npm test`/`npm run test:coverage` 为 **190/190 通过**，99.25% 行、86.30% 分支、95.99% 函数。
- 严格边界：当前只是精确帧边界，尚未实现 `UnitMC.goto()` 对当前动画的拒绝/重定向规则，也未把根帧与 M4 action、皮肤、碰撞/输入合成为 Tutorial actor。不能以“根帧表存在”声称人物动作已迁移。

## 2026-07-22：UnitMC 原转场保护与改写（仍不可启动）

- 原始证据：`UnitMC.as:goto(param1,param2)` 在非 force 路径拒绝中断 `climbsmall/climbbig`、`landhard`、jump/tuck→fall、land→idle 以及若干落地过渡；它还会将 duck→idle 改为 `getup`、run→duckrun 改为 `slide`、duckrun→run 改为 `getup`，并保留按 runType 的 run1/run2 分支。
- 承载：`tutorial-unitmc-transition.mjs` 是该函数的直接语义端口，仅返回原标签的“保持/改写/切换”结果。它不生成关键帧、不插值、不将滑铲伪装成跑步，也不通过通用 `engine.mjs` 的 animation 名称绕过原规则。
- TDD：`3d3b157` 是转场模块缺失时的 RED；`3f41d91` 是 GREEN。回归覆盖了攀爬/硬着陆/跳跃防打断、duck/getup/slide 改写及强制跳转；完整 `npm test`/`npm run test:coverage` 为 **193/193 通过**，99.25% 行、85.75% 分支、96.00% 函数。
- 严格边界：尚未把这些结果驱动到具体的 30fps `FrameLabel` 计数器，也未与 Tutorial wall、原皮肤/arm Display List、鼠标/键盘输入、弹药和相机一起运行。它仍不是可视或可玩角色。

## 2026-07-22：UnitMC 根帧端点播放命令（仍不可启动）

- 原始证据：`UnitMC.as:addFrameScript` 的零起始注册与各 `frameNN` 方法共同定义端点行为。已机械提取的关键命令包括 frame 20 `goto("idle",true)`、208 `goto("fall")`、264 `gotoAndPlay("fallloop")`、290 `stop()`、301 `goto("duckloop",true)`。根 FrameLabel 只说明区间，不能代替这些执行命令。
- 承载：`extractUnitMCRootFrameActions()` 追踪每个注册 handler 到其 `goto`、直接 `gotoAndPlay` 或 `stop` 命令；`tutorial-unitmc-root-playback.mjs` 每次只推进一个原 30fps root tick。直接播放只改物理 frame，保留原 `curAnim` 边界；普通 goto 走同一套 `UnitMC.goto()` guard。修复了 source 的重要语义：`goto(label,true)` 即使 label 相同也会重新进入其首帧。
- TDD：`43b6ac5` 为模块缺失的 RED；`4e6c1bb` 为 GREEN。完整 `npm test`/`npm run test:coverage` 为 **195/195 通过**，99.24% 行、85.32% 分支、96.10% 函数。
- 严格边界：该播放器仍未持有角色的皮肤、原 M4 后/前臂 action index、输入/物理/枪械状态或 Canvas 显示。它不能独立形成可玩角色，更不构成 1:1 验收。

## 2026-07-22：Tutorial 原角色渲染计划（仍不可启动）

- 原始输入：Campaign 1 的 `setMatch()` 角色绑定已经确认 `unit0` 是在 `{x:285,y:705}` 出生、使用 Medic profile 与 `skinFrame=57` 的来源角色。UnitMC 的 root state 必须指向真实根时间轴帧，M4 action state 必须指向 501/668 runtime 中存在的真实动作索引。
- 承载：`src/tutorial-actor-render-plan.mjs` 只组合这四类输入：已出生的来源 Campaign actor、来源 UnitMC root frame、来源 M4 action frame 与既有 Shape/Display List pose plan。输出保留 `actorId`、`skinFrame`、root frame/animation、原 arm frame 和枪的原 Display List；未出生角色、缺失 root frame 或无效 arm action 均会拒绝，不会回退到 generic Medic、整身 PNG 或手画枪。
- TDD：`913f316` 是缺模块的 RED；`5379c9c` 是 GREEN。完整 `npm test`/`npm run test:coverage` 均为 **197/197 通过**，99.24% 行、85.23% 分支、96.11% 函数。
- 严格边界：这是一个纯渲染数据计划，尚未被 Tutorial 浏览器页面消费；它没有 30fps 联动时钟、输入、碰撞、相机、弹药、伤害、AI 或地图启动路径。因此不能称为可玩 Tutorial，绝不可称为游戏 1:1 完成。

## 2026-07-22：Tutorial 原角色 30fps 播放边界（仍不可启动）

- 原始证据：`Guns.as:setFrame()` 用 `rifle`、`rifle_fire`、`rifle_reload` 驱动 M4 arm MovieClip；501/668 的火力帧是 78→79→80，`arm_gun_316.as` 在 80 的 callback 为 `doneShoot`。`UnitMC.doneShoot()` 仅调用 `unit.gun.setFrame("idle")`。根身体每 tick 仍使用 `UnitMC` 的真实 30fps root frame command。
- 承载：`src/tutorial-actor-playback.mjs` 是完全独立于旧 QuickMatch 的 source runtime：`createTutorialActorPlayback()` 只接受已出生的 Campaign actor；`sampleTutorialActorPlayback()` 输出原角色 render plan；`beginTutorialActorGunAction()` 只接受 `Guns.setFrame` 的 idle/fire/reload 命令；`advanceTutorialActorPlayback()` 同时推进根帧和 arm 的一个离散 tick，且只在提取到 `doneShoot`/`doneReload` callback 时复位 M4 idle。不存在的下一 arm 帧会拒绝而非循环/插值。
- TDD：`4e95816` 为模块缺失的 RED；`1c72a3f` 为 GREEN。回归锁定 Campaign `unit0` 的 skin 57 + root 1 + arm 77 初样本，以及 fire 的 78→79→80 与第三 tick 的 `doneShoot` 回 idle。完整 `npm test`/`npm run test:coverage` 均为 **200/200 通过**，99.22% 行、85.07% 分支、96.16% 函数。
- 严格边界：该播放器目前没有挂载 Canvas、输入/瞄准角、真实碰撞位置、弹药扣除、弹道、镜头、HUD、地图或 AI。它不是可玩的 Tutorial，更不构成全游戏 1:1。

## 2026-07-22：Tutorial 原角色浏览器承载与 holder 修正（仍不可启动）

- 浏览器承载：`tutorial-actor-preview.html`/`src/tutorial-actor-preview.mjs` 以 800×600 Canvas 每 `1000/30` ms 调一次 `advanceTutorialActorPlayback()`，再以同一个 source render plan 绘制。它只加载 39 个直接 Shape、UnitMC 669 root timeline、M4 Display List 和原 arm callback 的 M4 投影；不导入 `main.mjs`、`engine.mjs` 或旧 DOM Medic rig。`src/tutorial-unitmc-root-frame-actions-source.mjs` 与原 `UnitMC.as` 的完整 root frame command 机械结果一致；M4 callback 表仅保留 M4 timeline 实际使用的 80/81/115，避免把 `arm_gun_316` 中其他武器 callback 混入。
- 发现与修复：初次浏览器实测虽显示 `data-ready=true` 且无 console error，但截图揭示头、躯干、枪臂断开。这证明之前 pose plan 错把 root Display List 的 `head/arm1/arm2` placement 当最终位置。原 `UnitMC.EnterFrame()` 每 tick 执行 `head.x/y=headhold.x/y`、`arm1.x/y=arm1hold.x/y`、`arm2.x/y=arm1hold.x/y`，但不改 scale/skew。`tutorial-unit-pose-plan.mjs` 现精确保留该覆盖；重载后的浏览器截图已不再出现该断开关系。
- TDD：`3d61f5d` 是浏览器预览来源缺失的 RED；`e10a7be` 是页面/来源表 GREEN。可视修复的 RED 是 `da61333`，GREEN 是 `ab5ea65`；回归锁定 headhold 和 arm1hold 的精确 root x/y，并同步锁定 Canvas transform。完整 `npm test`/`npm run test:coverage` 为 **203/203 通过**，99.22% 行、85.11% 分支、96.17% 函数。
- 严格边界：浏览器预览只能证明来源资源成功渲染与 holder 关系不再断裂；没有原 SWF 同帧截图、输入回放或像素差分，也没有游戏世界。因此它不能作为任何地图、人物完整动作或 1:1 完成的证据。

## 2026-07-22：Campaign 1 Tutorial 原场景承载（仍不可启动）

- 原始证据：`Arena.as:EnterFrame()` 对 focus 做 `x += (targetX-x)*.7`、`y += (targetY-y)*.7` 后以 `wallMC.width/height` 边界钳制；背景位置则使用 `(Main.WIDTH - usebox.width) * (arena.x / (Main.WIDTH - wall.width))`（y 同理）。Campaign 1 player 的来源出生点为 `{285,705}`，`Wall_tut` 是 2757×1541。
- 承载：`tutorial-arena-camera.mjs` 直接保留上式的 Arena display-object x/y，非通用 camera centre。`tutorial-scene-preview.html` 用 `tut` 原 Sky/Background/Arena 导出、原 crop origin 及上式绘制三层；`unit0` 以 session 原出生点与 Arena 同坐标系绘制。没有用 Foundry、`engine.mjs`、`createWorld()` 或旧 quick-match actor。
- TDD：`e55d862` 为模块/页面缺失的 RED；`b202bc9` 为 GREEN。回归锁定首个 30fps camera tick `{x:0,y:-269.5}`、wall dimensions 下的背景视差/裁切以及 player screen 坐标。浏览器实测页面加载原三层、角色且 console 无错误。完整 `npm test`/`npm run test:coverage` 为 **207/207 通过**，99.21% 行、84.97% 分支、96.20% 函数。
- 严格边界：画布尚未把 16 帧 Wall_tut 碰撞 surface 接进人物 Movement、鼠标/左键、Guns、弹药/弹道、AI、HUD、过场或战役触发。所以它是源场景承载，不是第一关、不是可玩战役、更不是 1:1 完成。

## 2026-07-22：Tutorial 原 Movement 核心输入纵切（仍非完整关卡）

- 原始证据：`Movement.as` 的 `hitTest()` 只接受 `wall.getPixel32(...).toString(16).substring(0,2)=="ff"`；`EnterFrame()` 用 `(-17,-45)`、`(17,-45)` 决定贴墙蹲伏是否可自动起身，用 `(0,1)` 落地，终端下落时用 `(17,-20/-40/-55)` 与左侧镜像探针决定 `climbsmall/climbbig`。`doJump()` 从站立状态执行 `y-=6`、`yVel-=13*modJump`；`UnitMC.goto()` 决定这些 nextAnim 能否改写根时间轴。
- 承载：`src/tutorial-movement.mjs` 是 Tutorial 专用的 pure source port，拒绝缺少已解码 `Wall_tut` alpha surface 的调用；其 A/D/S/W 核心输出由 `tutorial-scene-preview.mjs` 每个 30fps tick 送进 `requestTutorialActorMotion()`，再经过 `tutorial-unitmc-transition.mjs` 的原始防打断规则。页面加载的是 `loadTutorialWorld()` 的完整 16 帧集合，运行时只读取当前 `tutorialWorld.wall`，没有把可见前景或 Foundry 方盒当碰撞。
- TDD：RED `2e3de00`（Movement 模块缺失）、`7c3b139`（运动状态尚未经过 UnitMC label 规则）、`501fa46`（场景尚未接线）、`8219965`（手动跳跃缺失）、`04e83e2`（斜坡角缺失）；GREEN `3ec7f00`（Movement 核心接线）、`7a0a06b`（原左右脚底扫描和 0.3 角度插值）。`tests/tutorial-movement.test.mjs` 锁定自动起身、低顶保持蹲伏、alpha 脚底落地、原 terminal-fall 小攀爬、跳跃 boost 与左右十像素斜坡角；`tests/tutorial-actor-playback.test.mjs` 锁定 run 标签首帧与不可中断攀爬；`tests/tutorial-scene-preview.test.mjs` 锁定真实 wall/输入接线。全量 `npm test`/`npm run test:coverage` 为 **215/215 通过**，99.01% 行、83.28% 分支、96.35% 函数；浏览器已实际加载 Tutorial 场景、原图层与角色，无错误页。
- 严格边界：这是 `Movement.as` 的已测核心分支，不是该类完整等价端口；尚未覆写全部 modifier、降落伞、硬着陆、完整大小攀爬/顶棚恢复组合或原版输入回放。更没有鼠标瞄准、左键射击、Guns、伤害、AI、HUD、脚底/子弹战役触发、过场、胜负与原 SWF 帧差分。禁止把它称作“第一关已完成”或“游戏 1:1 完成”。

## 2026-07-22：Tutorial `runScripts` 与脚底状态实际消费（仍非完整关卡）

- 原始证据：`Stats_Campaign.runScripts()` 以当前 `sn/fc` 执行后才增长帧数，Campaign 1 frame 0 为 `player.gun.setGuns("none","none")`。`Unit.as` 中当前人类脚底 `getPixel(0,1)` 触发教程分支：状态 8 的 `ff00ff` 接触给 USP2、`noAim=false`、`tutshoot` 与 Wall frame 9；状态 9 的 `9900ff` 子弹命中才是电梯分支。初始 `unit0` 的 `noAim:true` 是原 `Stats_Campaign.setMatch()` 数据，不可在初始教程页用鼠标瞄准覆盖。
- 承载：`applyCampaignOneSessionFrame()` 新增为 session 的唯一 runScripts 消费入口，返回并原子写入当前 actor/effect 数据。教程页每 30fps tick 先消费它，再在 Movement 后将 `(x,y+1)` 交给 `applyTutorialFootContact()`；随后只从 session `unit0` 同步 `noAim/noJump/guns`。当源状态为 none/USP2 时页面**不再错误绘制 M4**；USP2 原 arm/gun Display List 未迁移，故目前只显示无枪手部，不能把它写成 USP2 已显示。
- TDD：RED `5899afa`（runScripts 效果没有被 session 消费）、`c6ba5fc`（场景没有调用 timeline/foot trigger）；GREEN 尚待本次工作树提交。`campaign-one-session.test.mjs` 锁定 frame 0 必须使实际 player guns 成为 none 且 runtime frame 变为 1；`tutorial-scene-preview.test.mjs` 锁定场景走 source session frame 与 original wall foot contact。全量 `npm test`/`npm run test:coverage` 为 **216/216 通过**，99.01% 行、83.44% 分支、96.36% 函数；浏览器加载检查显示原 Tutorial 三层/角色、起始 M4 已消失、无错误页。
- 严格边界：这些效果没有完整 HUD/消息/箭头/音频/过场呈现；USP2、瞄准与左键射击、M4 换枪、状态 9 子弹环境命中、伤害/生命、敌方 Unit/AI/子弹、胜负和原 SWF 输入截图均未完成。此条绝非“Tutorial 已玩通”。

## 2026-07-22：Campaign 1 USP2 原 arm Display List 与场景切枪（仍非完整关卡）

- 原始证据：`Stats_Guns.as` 明确记录 `USP2` 的 `sprite="USP"`、`frameIdle/frameFire/frameReload="pistol"`、`shotSound=S_pistolFire`、`noAmmo=true`。原 `arm_gun_316`（symbol 501）与 `arm_front_328`（668）保留同名标签；其实际范围为 `pistol=2`、`pistol_fire=3..8`、`pistol_reload=9..37`。501 的 `gun` 是 symbol 375；375 的 `USP` 标签是 frame 2，显示 Shape 299。`arm_gun_316.as` 的原 `addFrameScript` 在 8 调 `doneShoot`、9 调 `reloadSound`、37 调 `doneReload`。
- 承载：`tutorial-gun-action-frame.mjs` 从版本控制的原 501/668 Display List 按下一原标签计算 action span，不插值、不循环，也不会把 USP2 改画为 M4。`tutorial-unit-pose-plan.mjs` 接收原枪 Sprite frame，使 pistol pose 的 `gunParts` 为 `{character:375,frame:2}`。`tutorial-actor-playback.mjs` 由 Campaign actor 的 `guns.active` 同步武器，且仅在提取的回调帧回到原 idle label。`tutorial-scene-preview.mjs` 在 Campaign state 8 的原 `setGuns('USP2','none')` 生效后切换到该 pose；`none` 和尚未解出的枪型一律隐藏，不能借用已有图形。
- TDD：`33f0839`→`c959a9b` 锁 USP2 source arm span；`917e92b`→`97f75ab` 锁 USP Sprite 第 2 帧进入 UnitMC pose；`c4bd5c1`→`b371184` 锁 Campaign 切枪后 pistol 3–8 与 frame-8 `doneShoot`；`18aa0ae`→`c60b016` 锁场景调用该同步；`3e2f8b2` 将共享 arm_gun 的完整已消费回调同原 AS3 机械结果对照。最终全量 `npm test`、`npm run test:coverage` 均为 **220/220 通过**，覆盖率 **99.01% 行、83.31% 分支、96.44% 函数**。本地浏览器访问 `tutorial-scene-preview.html` 已确认 `canvas.dataset.ready=true`、错误区为空、无 error/warning console 日志；这只证明加载，不是原版动作截图对照。
- 严格边界：没有导入 pistol 的 `MuzzleFlash_317`（symbol 394）显示列表，未接入 `Player.mDown → Guns.shoot` 的鼠标/左键、USP 弹药/命中/音频、`Hud.setAmmoImage('pistol')`、HUD 枪图、AI、敌方 actor、状态 9 子弹环境命中、任务过场或截图差分。状态 8 的“拿到手枪”只是一个来源可审计、自动回归的局部纵切，绝不能称为 Tutorial、Campaign 1 或整个游戏 1:1 完成。

**下一位唯一正确步骤**：在不伪造 muzzle 或弹道的前提下，继续从原 SWF 提取 pistol `MuzzleFlash_317` 及相关 Bullet/HUD 消费显示列表，然后以 `Player.as` 的 `noAim/mDown`、`Guns.as:shoot/setFrame`、真实 pistol `shootDelay=.25` 和原 30fps arm callback 建立输入→开火→回 idle 的 RED→GREEN 回放。浏览器必须以原 Player 坐标换算鼠标；状态 8 前 `noAim=true` 时不得开放瞄准/射击。

## 2026-07-22：Campaign 1 USP2 原枪口与左键首发纵切（仍非完整开火系统）

- 原始证据：`MuzzleFlash_317.as:frame1()` 为 `gotoAndStop(UT.irand(1,totalFrames))`；`UT.irand(1,8)` 的实际定义为 `uint(Math.random()*(8))+1`。SWF 顶层 `DefineSprite 394` 有 8 个 ShowFrame，依次放置原 Shape `386..393`。`arm_gun_316` 的 `pistol_fire` 第一个源帧（实际 frame 3）在 depth 16 放置 394，矩阵为 `{x:41.8,y:-12.3,scaleX:1,scaleY:1,skew:0}`，下一帧移除。`Player.as` 的 `MouseDown()` 在 game 已开始且非 `noShoot` 时置 `mDown=true`，EnterFrame 才调用 `gun.shoot()`；本纵切没有伪称已实现后半段。
- 承载：`tools/extract-usp2-muzzle-runtime.mjs` 直接从压缩原 SWF 解析 CWS、8 个 DefineShape 和 394 Sprite Display List，生成 `public/assets/usp2-muzzle-flash-runtime.local.json`（74,390 bytes）。`tutorial-actor-playback.mjs` 只在 USP2 `fire` action 创建时保留一次 1..8 frame；`tutorial-unit-pose-plan/renderer` 保留其原 root/action 矩阵并由 `tutorial-unit-pose-assets.mjs` 直接画原 Shape；`tutorial-scene-preview.mjs` 仅在 source 已给 USP2 后接受 canvas 左键并进入该首帧。
- TDD：RED/GREEN 依次为 `00436eb`→`4b3c844`（原 394 extraction）、`c11990c`→`6c1161f`（播放状态）、`dc3053c`→`4f32fbb`（pose rendering）、`5b4117f`→`74032e4`（asset loading）、`2876891`→`4e58e00`（页面左键入口）。全量 `npm test` 与 `npm run test:coverage` 为 **223/223 通过**，覆盖率 **98.83% 行、83.17% 分支、95.82% 函数**；本地页面 `tutorial-scene-preview.html` 验证 `canvas.dataset.ready=true`、错误区为空、800×600。
- 严格边界：没有完成 `Player.mDown` 持按、`Guns.shoot` 的 `shootDelay=.25*30`、`shotPressed`、clip/spare、`noShoot`、真实鼠标瞄准、Bullet 命中/墙体状态 9、枪声、Hud pistol、敌方/AI 或原 SWF 帧差分。尤其 canvas 左键目前只是 source 已授予 USP2 后触发原 `pistol_fire` 显示列表的窄入口，绝不是完整枪械系统、Tutorial 关卡或游戏 1:1。

## 2026-07-22：Campaign 1 USP2 的原 `Player → Guns` 输入/射速纵切（仍非完整关卡）

- 原始证据：`Player.as` 的 `MouseDown()` 只在 `game.gameStarted && !unitInfo.extra.noShoot` 时写 `mDown=true`，`MouseUp()` 写回 false 并调用 `gun.releaseMouse()`；每次 `Player` EnterFrame 才在 `mDown` 下调用 `gun.shoot()`。`Guns.as:shoot()` 先拒绝非零 `shootDelay`、`shotPressed`、reloading、空 clip 与 `extra.noShoot`，再在非自动人类枪写 `shotPressed=true`、调用 `setFrame("fire")`、`makeBullet()`，最后将 `shootDelay=curGun.shootDelay*30` 写入 `uint`。同一 `UnitEnterFrame` 随后调用 `gun.EnterFrame()`，故新写入的 delay 已在同一 source tick 减 1。`Stats_Guns.as` 的 USP2 是 `clipSize=1`、`clipSpare=0`、`damage=15`、`shootDelay=.25`、`noAmmo=true`、`autoFire=false`；其 `uint(.25*30)` 为 7，首发 tick 结束为 6。
- 承载：`tools/generate-gun-source.mjs` 仅机械解析每条 `Stats_Guns.addGun` literal call，输出 `src/gun-source.mjs`，拒绝把手写少量枪表作为来源。`src/tutorial-gun-runtime.mjs` 只实现上述已证实的 Player/Guns 窄状态；`tutorial-scene-preview.mjs` 的左键只调用 `tutorialPlayerMouseDown()`，每个 30fps tick 再调用 `advanceTutorialGunRuntime()`。枪实际获准开火时才请求原 `pistol_fire`；为匹配 source first tick，root 仍推进、但 arm fire index 保持在首帧至下一 arm tick，因此 394 的原随机枪口火焰不会被同 tick 提前移除。
- TDD：`01e2bc8`→`7c7264b`（完整原枪表生成与等值校验）；`49c40a3`→`1b832a3`（USP2 的 `mDown`/`shotPressed`/`uint shootDelay`/`noAmmo`）；`9ac0690`→`7f30851`（场景只经 Player→Guns 链路开火）；`6d7a9eb`→`fef800a`（首发 arm 帧不被同 tick 推掉）。当前 `npm test` 与 `npm run test:coverage` 为 **227/227 通过**，覆盖率 **99.05% 行、83.08% 分支、95.90% 函数**。
- 严格边界：这不是完整 `Guns` 端口：尚未调用原 `makeBullet()`，没有鼠标→Arena 瞄准/arm transform、命中与 `Wall_tut` 状态 9、枪声、pistol HUD、敌人/AI、重装流程、M4 或其余枪械的真实存档/弹药配置，也没有原 SWF 同输入帧截图或像素差分。因此此纵切**不能**被描述为“Tutorial 已可玩”、“第一关完成”或“游戏 1:1 已完成”。

**下一位唯一正确步骤**：先从 `Player.as` 的 mouse/Aimer 关系、`Guns.as:makeBullet()`、`Bullet_Line_Basic` 与 Campaign 1 状态 9 的原执行顺序提取可复现证据；先写 RED，之后只迁移一个“真实鼠标瞄准→枪口/子弹起点→原墙体/目标命中”的纵切。不要用 `engine.mjs` 的泛用 tracer、手画子弹或固定鼠标角度作为替代。

## 2026-07-22：Tutorial 原鼠标→持枪瞄准关系（仍无子弹）

- 原始证据：`Player.as:EnterFrame()` 在 `noAim=false` 时按 `aimX += (game.arena.mouseX-aimX)*.5`、`aimY += (game.arena.mouseY-aimY)*.5` 平滑。`Unit.as` 先用**上一 tick** `aimRoation` 和 `MC.rotation` 决定非跳跃 flip，再从 `x+MC.arm1.x+MC.rotation*1.2,y+MC.arm1.y` 到 `aimX,aimY` 计算 `UT.getRotation()-90`，写入 `aimRoation`，最后依次写 `MC.arm1/arm2.rotation=rotReload+rotArm`、`head.rotation=rotReload+rotArm*.6`、`MC.scaleX=flip?-1:1`。`UnitMC.EnterFrame()` 先将 arm1/arm2 的 x/y 改为 `arm1hold`，故不能用原 root placement 的旧 arm x/y。Arena 是被平移的 DisplayObject，因此 `arena.mouseX/Y = stageMouse - arena.x/y`。
- 承载：`tutorial-aim-runtime.mjs` 是上述公式的纯端口；网页鼠标事件先由 CSS canvas rect 归一化为固定 SWF 800×600，再转为 Arena local。`tutorial-unit-pose-plan.mjs` 按 Flash `DisplayObject.rotation` 的矩阵语义在 holder 之后重建 arm/head transform；`tutorial-unit-pose-renderer.mjs` 在 pose 标明 flip 时翻转完整 UnitMC。它们只消费当前 decoded root/action/Shape 数据，不借用 `engine.mjs` 的 generic rig。
- TDD：`fe79b11` 为 aim 模块缺失的有效 RED，`ccef16d` 为公式 GREEN；`aec5679` 为 source aim 可视消费缺失的有效 RED，`667c0e6` 为 Green。全量 `npm test`/`npm run test:coverage` 为 **230/230 通过**，覆盖率 **99.01% 行、82.79% 分支、95.96% 函数**。本地浏览器访问 `tutorial-scene-preview.html` 返回 `data-ready=true`、空错误文本、Canvas 800×600。
- 严格边界：本段没有接入原 Aimer 1431 的可见 Display List，没有 `Guns.makeBullet`、`Bullet_Line_Basic`、射线墙/单位命中、状态 9、电梯、声音、HUD 或截图差分。它证明的是人物指向的 source transform，不是“已射向鼠标”或“Tutorial 已可玩”。

## 2026-07-22：Tutorial USP2 `Bullet_Line_Basic` 墙体路径（尚未接页面）

- 原始证据：`Guns.as:makeBullet()` 传入 `aimRoation + UT.rand(-dynRecoil,dynRecoilMod)`、`unit.x + MC.rotation*1.2`、`unit.y + MC.arm1.y`、`xOff` 与 gun id；`Bullet.as` 先按 `rotation + 90*MC.scaleX` 加 `yOff`，再以 `xVel/yVel` 进行包含端点的 `0..xOff` 个半步 hit test；`Bullet_Line_Basic` 再以完整 10 单位步长走到 `maxDist=(range+UT.irand(-3,3))*10` 或命中，并以原枪 `parameters` 生成线段路径。`Bullet.hitTestAll()` 的 wall 分支只接受 alpha `ff`，并返回 ARGB 的 RGB hex 供 Campaign 状态 9 检查。
- 承载：`tutorial-bullet-line-runtime.mjs` 只实现已证实的 USP2 wall-only 轨迹；必须显式接收已解析的 `dynRecoil` 和 `dynRecoilMod`，缺失时拒绝执行。它不读取或调用旧 `engine.mjs` tracer；已命中时返回原色值，例如 `9900ff`，以便后续通过现有 `applyTutorialBulletEnvironmentHit()` 消费。
- TDD：`06ec8c9` 为缺模块的 RED，`115c107` 为 GREEN。测试锁定 USP2 的 `yOff=-8`、`xOff=8` inclusive half-step、10-unit trace、origin/impact、line path 与 `9900ff` wall colour；全量为 **232/232 通过**，覆盖率 **99.00% 行、82.81% 分支、96.03% 函数**。
- 严格边界：Campaign 定义没有本地存档等级/aim 属性，故无法从该任务记录推导人类 player 的 `dynRecoilMod`。此模块尚未接入页面、原 Aimer、单位/尸体碰撞、`Status.damage`、状态 9、电梯、声音或 HUD；不得将“轨迹函数存在”写作可实际射击或可通关。

## 2026-07-22：Campaign 1 首次存档档案与 USP2 散布状态（仍非完整关卡）

- 纠正旧缺口：原 `SD.as:Init()` 已直接给出首次启动的 4 条 `classSaves`，且 `MatchSettings.updatePlayer()` 明确将 Campaign 的 `caPlayer` 覆盖项与 `SD.classSaves[usePlayer.soldier]` 的 level 合并；随后 `Unit.setClass()` 通过 `Stats_Classes.getClass()` 写入 hp/crit/aim/amm。此前把 Campaign 1 玩家 level 标成 `null` 是保守但不完整的处理，现已更正。
- 承载：`private-assets/parse-sd-default-profiles.mjs` 机械提取 `SD.Init()` 的字面存档，生成 `src/sd-default-profile-source.mjs`；`src/tutorial-player-profile.mjs` 直接端口 Campaign merge + Unit 的数值属性写入；`tutorial-actor-bindings.mjs` 将默认新档的 Medic Lv.1（HP 85、crit .06、aim `.7000000000000001`、ammo .9）交给 Tutorial player。外部提供已解出的真实原存档时，可替换同一职业的 level，但**不得**伪称默认值等于某个用户的历史进度。
- 枪械链：`Guns.setGuns()` 的 `dynRecoil=curGun.recoil`、`Guns.EnterFrame()` 的 crouch/jump/move/reflecting 散布修正及 `Guns.shoot()` 前的 `makeBullet` recoil snapshot 已进入 `tutorial-gun-runtime.mjs`。Tutorial 页面将已证实的 player aim/ammo 和 Movement 状态传入该 runtime；这修复了页面先前无法满足 source recoil 输入的故障。`USP2` 的 Bullet_Line_Basic wall-only trace 现已在页面中调用，并由 `tutorial-bullet-line-renderer.mjs` 逐 triplet 转录 `params` 的 lineStyle、交替 path 和 `Arena.midCont` 层级/坐标；wall hit 会进入 `applyTutorialBulletEnvironmentHit()`。
- TDD：`5fa345e`→`1919371`（首次档案 RED→GREEN），`32ee699`→`f321fa9`（绑定接入），`fad5d95`→`f6003f4`（recoil/bullet snapshot），`7d1b394`→`025e29e`（网页输入），`7d16cba`→`a7f3279`（Bullet_Line_Basic 页面绘制）。本次完整 `npm test` 为 **237/237**；`npm run test:coverage` 为 **98.96% 行、82.18% 分支、96.11% 函数**。浏览器健康检查确认 `tutorial-scene-preview.html` 的 800×600 canvas `data-ready=true` 且错误文本为空，不能作为原版像素一致性证据。
- 严格边界：这只补全了“默认新档 player → USP2 对原墙体的可见 line trace / 环境入口”的一条 source 链；没有原 SWF 与网页的同输入逐帧截图/状态差分，也未覆盖单位/尸体命中、`Status.damage`、命中特效/声音、HUD、AI、过场、胜负、其余 14 战役、15 挑战、五模式或全地图。因此它绝不是“游戏 1:1 已完成”。

## 索引

- [SWF 深度解包报告](SWF_DEEP_UNPACK_REPORT.md)
- [SWF 运行时关系索引](SWF_RUNTIME_RELATION_INDEX.md)
- [历史 AI 交接报告](AI_HANDOFF.md)
- [迁移状态](MIGRATION_STATUS.md)
- [私有素材准备](PRIVATE_ASSET_SETUP.md)
