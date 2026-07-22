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

## 索引

- [SWF 深度解包报告](SWF_DEEP_UNPACK_REPORT.md)
- [SWF 运行时关系索引](SWF_RUNTIME_RELATION_INDEX.md)
- [历史 AI 交接报告](AI_HANDOFF.md)
- [迁移状态](MIGRATION_STATUS.md)
- [私有素材准备](PRIVATE_ASSET_SETUP.md)
