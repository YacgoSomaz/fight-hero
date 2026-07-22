# 战火英雄：原 SWF 证据驱动的网页 1:1 复刻工程

> 私有、已授权的 Canvas/Node 迁移研究项目。原始游戏素材仅可在本私有仓库和授权范围内使用，不得公开发布、出售或再分发。

## 当前状态（2026-07-22）

最终完成标准、实施顺序和不可用“能运行”替代的边界见 [1:1 复刻总计划](docs/ONE_TO_ONE_MASTER_PLAN.md)。每项原始证据、网页模块、测试、人工对照和明确缺口见 [1:1 证据台账](docs/ONE_TO_ONE_EVIDENCE_LEDGER.md)。按对象、工作包、依赖、验收和交接字段拆开的执行清单见 [1:1 详细执行登记册](docs/ONE_TO_ONE_EXECUTION_REGISTER.md)。

最新实际验收、地图空白修复、远端解包关系合并和下一位 AI 的接手顺序见 [当前交接与验证日志](docs/CURRENT_HANDOFF_2026-07-21.md)。

所有运行时地图资源及其逐层裁切关系见[地图运行时资源审计](docs/MAP_RUNTIME_ASSET_AUDIT.md)。

当前工程可用于验证 Foundry 等原始资料的网页承载，已具备以下**局部能力**：

- A/D 移动、W 跳跃、S 蹲伏、R 换弹、鼠标瞄准、左键/F 射击；
- Foundry 背景/前景，以及从 `Arena` 解出的蓝色 `NodePhysBox` 碰撞盒、出生点、路径点、AI 动作点和补给点；
- 原始 `wallMC` 掩码及 `NodePhysBox` 驱动的局部碰撞验证（正常游戏画面不显示调试碰撞盒）；
- 原 `UnitMC` 449 帧显示列表矩阵的离散回放，包含跑、跳、坠落、蹲伏、起身、攀爬和硬着陆标签；
- 从 SWF 标签组合的 Medic + M4 待机手臂组件，枪口、枪火与弹道共用同一坐标计算；
- 弹药、换弹、命中、复活、计分、AI、菜单音乐/本地存档和私有房间原型；
- 14 个可启动地图的原始三层资源已随仓库交付；每张地图的文件存在性与裁切边界均有自动回归校验；
- HUD 1540 的原 `ScoreBar`（1462）和原经验容器（1477）已在其原 800×600 锚点接入；当前 M4 的 `bulletCont`（954）和 `curgun`（GunsMenu 724/M4 第 20 帧）也已按原公式/矩阵接入；这仍只是 HUD 的局部，动态文本、切枪、全枪型和经验状态尚未完成；
- `Hud 1540` 的五个文本字段（职业、生命、等级、当前枪、备用弹药）已使用原字体导出物、原锚点、透明度和对齐方式接入；经验条动态填充、其它枪型和逐像素截图对照仍未完成；
- 30 个战役/挑战 `Stats_Campaign.setMatch()` 配置已由原 AS3 机械提取为浏览器目录数据；Campaign 1 的 9 个计时动作、4 个比分推进、14 个脚底状态、子弹环境命中与换枪推进也已从四个原始 AS3 类生成可审计数据，并组成保留原 Tutorial Arena/5 个演员记录的独立会话模型。Tutorial 原 `Wall_tut` symbol 1378 的 16 帧亦已随运行时资源交付并完成触发色审计；会话/墙体尚未接入网页物理或渲染，未迁移完整角色、过场和结算的任务会明确拒绝启动，绝不回退为快速对战；
- Tutorial `Wall_tut` 运行时加载器现要求原始 16 帧全部成功加载，并只允许按原 SWF 帧号选择已解码的碰撞蒙版；该机制尚未接入浏览器中的 Tutorial actor/物理/脚底/子弹触发，不可据此开放战役入口；
- `npm run test:coverage` 当前为 **197/197 通过**（99.24% 行、85.23% 分支、96.11% 函数；覆盖率门槛在脚本中强制）。其中包含战役目录与 Campaign 1 脚本源码一致性、Hud 文本字段和 Aimer Flash 矩阵→Canvas 映射回归，以及 UnitMC `setSkin()` 嵌套子部件、完整根时间轴标签/转场/端点播放、直接 Shape 裁切原点、M4 手臂的真实离散动作帧/回调、已出生的 Campaign 1 原角色与根帧/M4 动作帧的来源约束拼装计划、静态拼装计划与专用预览资源加载；这些都不等于战役、动态经验条或完整 HUD 已完成。

它仍是迁移验证，**不是**像素级完整复刻。上述清单中凡未在证据台账标作“完成”的内容，一律不得对外称为已 1:1。下一位接手者必须先阅读 [1:1 复刻总计划](docs/ONE_TO_ONE_MASTER_PLAN.md)、[1:1 证据台账](docs/ONE_TO_ONE_EVIDENCE_LEDGER.md)、[当前交接与验证日志](docs/CURRENT_HANDOFF_2026-07-21.md)、[AI 交接报告](docs/AI_HANDOFF.md)、[运行时关系总表](docs/SWF_RUNTIME_RELATION_INDEX.md) 和 [迁移状态](docs/MIGRATION_STATUS.md)。

## 运行

需要 Node.js 20+：

```powershell
npm test
npm start
```

打开 <http://127.0.0.1:4173>。Windows 下也可运行 `启动原型.cmd`。

## 目录

```text
src/
  engine.mjs         输入、物理、蓝色碰撞盒、攀爬、射击、AI、伤害
  foundry-layout.mjs Arena 解析出的节点和 NodePhysBox 原始坐标
  main.mjs           Canvas 渲染、UnitMC 部件矩阵、输入、HUD、调试绘制
  camera.mjs         世界/屏幕坐标与局部跟随镜头
  unit-rig.mjs       旧的纯函数姿态辅助与单元测试接口
  online.mjs         私有房间客户端
public/assets/
  unitmc-timeline.json 449 帧 UnitMC 显示列表数据
  unit-parts/          运行时部件与 M4 手臂合成图
  maps/                Foundry 背景与前景
tests/engine.test.mjs 行为回归测试；另有 SWF 显示列表、枪械表和 AS3 关系索引测试
docs/
  ONE_TO_ONE_MASTER_PLAN.md    最终目标、阶段、验收门槛与依赖顺序
  ONE_TO_ONE_EVIDENCE_LEDGER.md 每个功能的原始证据→网页→测试→人工验收台账
  ONE_TO_ONE_EXECUTION_REGISTER.md 逐对象的工作包、依赖、验收和交接字段
  AI_HANDOFF.md        当前交接报告、解包结论、坐标计算和下一步
  MIGRATION_STATUS.md  已迁移/未迁移范围
  SWF_DEEP_UNPACK_REPORT.md 证据与二进制解包报告
  SWF_RUNTIME_RELATION_INDEX.md 对局运行时的完整关系总表
assets/reverse/
  4399-90433-25.swf           已授权的原始 SWF 样本
  ffdec-deep-20260720/        FFDec 导出的 AS3、P-code、符号、音频和文本证据
```

## 接手规则

1. 先运行 `npm test`；任何物理、动画或素材定位改动都要新增/更新相应测试。
2. Foundry 的可玩碰撞以 `FOUNDRY_COLLISION_BOXES` 为准；不要为修视觉而移动蓝色盒子。
3. 角色根脚点、`arm1hold`、枪口和裁切图注册点是不同坐标系；不要用任意全局平移掩盖它们。
4. 运行时不读取 `private-assets/`。私有仓库只版本化其中的小型研究包（提取脚本、JSON 和对齐截图）；`private-assets/extracted/` 的完整 3.2 GiB 逐帧导出继续保持本地忽略。可复现的深度解包证据在 `assets/reverse/ffdec-deep-20260720/`。

详见 [AI 交接报告](docs/AI_HANDOFF.md) 和 [运行时关系总表](docs/SWF_RUNTIME_RELATION_INDEX.md)。
