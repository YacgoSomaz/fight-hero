# 战火英雄：本地网页技术验证

> 这是一个用于研究 Canvas 2D、平台物理、镜头与 SWF 时间轴迁移方法的本地技术验证，不是原游戏的替代品，也不包含或分发原游戏文件、贴图、音频或其他受版权保护的资源。

## 当前完成度

已实现并可运行的单人验证场景：

- A / D 移动，W 跳跃；鼠标瞄准，鼠标左键或 F 射击；
- 平滑局部跟随镜头，不会因鼠标跨越人物而突然反向切屏；
- 顶面、侧面、底面实体碰撞，短台下落接触会进入小/大攀爬状态；
- `UnitMC` 的第一阶段部件状态机：腿部反相跑动、攀爬姿态、头/双臂/枪械向鼠标转向，以及仅作用于上半身的开火后坐；
- 动态准星扩散、子弹轨迹与枪口火焰事件；
- Node 内置测试覆盖移动、碰撞、攀爬、镜头、瞄准、射击与部件姿态。

还**没有**迁移：完整逐帧 Flash 矩阵、换弹/受击/蹲伏、精确像素墙体、AI、多人联机、菜单、音频和存档。

## 快速开始

需要 Node.js 20+。

```powershell
cd fight-hero
npm test
npm run test:coverage
npm start
```

打开 <http://127.0.0.1:4173>，或在 Windows 双击 `启动原型.cmd`。

## 公开仓库与私有素材

本仓库刻意不提交 `game.swf`、SWF 导出 PNG、地图、人物、枪械、HUD、音频或 FFDec/JRE 工具。它们不应上传到公共仓库。

当前演示可在没有私有素材时启动，但会退化为简化色块/空背景。只有在你合法持有原始文件、并仅在本机研究时，才按照 [私有素材提取说明](docs/PRIVATE_ASSET_SETUP.md) 准备素材。`.gitignore` 会阻止这些文件被意外提交。

## 项目结构

```text
src/
  engine.mjs       输入、物理、碰撞、攀爬、射击、后坐
  camera.mjs       大地图局部窗口、平滑跟随、坐标转换
  unit-rig.mjs     UnitMC 部件状态机（纯函数，可单测）
  main.mjs         Canvas 渲染与浏览器输入
tests/
  engine.test.mjs  20 个 Node 单元/集成测试
docs/
  AI_HANDOFF.md            给下一位 AI 的详细项目交接报告
  PRIVATE_ASSET_SETUP.md   本机私有素材准备与 SWF 符号索引
server.mjs          只监听 localhost 的静态服务
```

## 开发与验证

```powershell
npm test
npm run test:coverage
```

当前基线：20/20 通过；总行覆盖率 96.94%、分支 89.91%、函数 90.63%。每次改变 `engine.mjs`、`camera.mjs` 或 `unit-rig.mjs` 时，先新增会失败的测试，再写实现。

## 交接入口

请先阅读 [AI_HANDOFF.md](docs/AI_HANDOFF.md)。其中记录了：SWF 的已确认符号与时间轴、原 ActionScript 中的旋转/翻转公式、当前实现与原版的差异、碰撞与 AI 的逆向结论、不可回退的技术决策，以及建议的后续工作顺序。

## 版权与用途

原作及其名称、角色、美术、音频和资源均归原权利人。本仓库仅保留为实现研究所写的代码与文档；请勿将自己的原始游戏文件或导出资源提交、上传、出售或分发。
