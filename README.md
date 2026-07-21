# 战火英雄：Foundry 私有网页迁移验证

> 私有、已授权的 Canvas/Node 迁移研究项目。原始游戏素材仅可在本私有仓库和授权范围内使用，不得公开发布、出售或再分发。

## 当前状态（2026-07-21）

Foundry 场景已可运行，并包含：

- A/D 移动、W 跳跃、S 蹲伏、R 换弹、鼠标瞄准、左键/F 射击；
- Foundry 背景/前景，以及从 `Arena` 解出的蓝色 `NodePhysBox` 碰撞盒、出生点、路径点、AI 动作点和补给点；
- 可视化的青色真实碰撞盒与黄色玩家碰撞盒；
- 原 `UnitMC` 449 帧显示列表矩阵的离散回放，包含跑、跳、坠落、蹲伏、起身、攀爬和硬着陆标签；
- 从 SWF 标签组合的 Medic + M4 待机手臂组件，枪口、枪火与弹道共用同一坐标计算；
- 弹药、换弹、命中、复活、计分、AI、菜单音乐/本地存档和私有房间原型；
- `npm test` 当前为 **53/53 通过**。

它仍是迁移验证，不是像素级完整复刻。下一位接手者必须先阅读 [AI 交接报告](docs/AI_HANDOFF.md)、[运行时关系总表](docs/SWF_RUNTIME_RELATION_INDEX.md) 和 [迁移状态](docs/MIGRATION_STATUS.md)。

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
