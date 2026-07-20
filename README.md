# 战火英雄：本地网页技术验证

> 这是一个用于研究 Canvas 2D、平台物理、镜头与 SWF 时间轴迁移方法的本地技术验证。

## 当前完成度

已实现并可运行的 Foundry 私有验证场景：

- A / D 移动、W 跳跃、S 蹲伏、R 换弹；鼠标瞄准，鼠标左键或 F 射击；
- 平滑局部跟随镜头，不会因鼠标跨越人物而突然反向切屏；
- `UnitMC` 的 449 帧时间轴已按二进制标签校正播放；完整原始姿态用于保证腿、躯干、手臂和枪械不发生错误拼接，部件矩阵采样见深度解包报告；
- 提取的 Foundry `wall` alpha 遮罩以原版的完全不透明像素统一驱动角色碰撞、子弹阻挡和 AI 视线；无 mask 时保留平台回退，便于单元测试；
- Arena 的调试实例已按符号解析：33 个物理框、21 个 AI 行动点、17 个路径点、31 个出生点与 4 个补给点；正常游戏遵循原版脚本将这些辅助标记隐藏。
- 弹匣/备弹、换弹、命中反馈、死亡计分、复活和动态准星；
- 一个按原版 12 帧错峰扫描目标、同墙体遮挡检测的本地 AI；
- 菜单、难度、菜单音乐/静音、本地 `localStorage` 进度；从 SWF 导出的 174 条音频；
- 私有双人房间：客户端只发送输入，`server.mjs` 在服务端执行物理、命中、换弹与计分后返回快照；
- Node 内置测试覆盖移动、碰撞、攀爬、镜头、瞄准、射击、换弹、蹲伏、像素墙体、AI 目标遮挡、受击与复活。

## 快速开始

需要 Node.js 20+。

```powershell
cd fight-hero
npm test
npm run test:coverage
npm start
```

打开 <http://127.0.0.1:4173>，或在 Windows 双击 `启动原型.cmd`。

## 项目结构

```text
src/
  engine.mjs       输入、物理、碰撞、AI、射击、换弹、伤害与复活
  camera.mjs       大地图局部窗口、平滑跟随、坐标转换
  unit-rig.mjs     UnitMC 部件状态机（纯函数，可单测）
  audio.mjs        原 SWF 导出音频的浏览器播放层
  online.mjs       私有房间的服务器权威客户端
  main.mjs         Canvas 渲染、菜单、存档与浏览器输入
tests/
  engine.test.mjs  33 个 Node 单元/集成测试
docs/
  AI_HANDOFF.md            给下一位 AI 的详细项目交接报告
  PRIVATE_ASSET_SETUP.md   本机私有素材准备与 SWF 符号索引
assets/reverse/            授权原始 SWF 与逆向参考导出
public/assets/             浏览器运行时使用的已分离资源和音频
server.mjs          静态服务与私有房间权威模拟
```

## 开发与验证

```powershell
npm test
npm run test:coverage
```

当前基线：33/33 通过。每次改变 `engine.mjs`、`camera.mjs` 或 `unit-rig.mjs` 时，先新增会失败的测试，再写实现。

## 交接入口

请先阅读 [迁移状态](docs/MIGRATION_STATUS.md)，再按需查看 [AI_HANDOFF.md](docs/AI_HANDOFF.md) 中保留的 SWF 符号、时间轴、ActionScript 公式与历史逆向笔记。

## 版权与用途

原作及其名称、角色、美术、音频和资源均归原权利人。仓库中的素材仅依据本项目持有的授权在私有环境中使用；不得公开发布、出售或重新分发。
