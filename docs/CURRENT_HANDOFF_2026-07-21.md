# 当前交接与验证日志（2026-07-21）

本文件是下一位开发者或 AI 的当前入口。旧报告保留解包证据与历史过程；若它们和本文件冲突，以本文件、当前代码与测试为准。

## 快速开始

```powershell
npm test
npm run test:coverage
npm start
```

本地入口：<http://127.0.0.1:4173>。当前基线：`npm test` **123/123 通过**，覆盖率为 **99.08% 行、88.19% 分支、93.61% 函数**，高于 80% 门槛。

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

## 索引

- [SWF 深度解包报告](SWF_DEEP_UNPACK_REPORT.md)
- [SWF 运行时关系索引](SWF_RUNTIME_RELATION_INDEX.md)
- [历史 AI 交接报告](AI_HANDOFF.md)
- [迁移状态](MIGRATION_STATUS.md)
- [私有素材准备](PRIVATE_ASSET_SETUP.md)
