# AI 项目交接报告：Foundry 私有网页迁移验证

更新日期：2026-07-21。本文是下一位 AI 的**当前事实基线**；旧提交、截图和早期报告只作历史证据，不能覆盖本文。

## 0. 先做什么

```powershell
cd F:\新工作区\fight-hero-fresh
npm test
npm start
```

- 当前测试基线：**44/44**。
- 本地地址：`http://127.0.0.1:4173`。
- 运行时必须只依赖受版本控制的 `public/assets/`；`private-assets/` 与 `assets/reverse/ffdec-deep-20260720/` 是本机解包工作区，保持忽略，不能提交、删除或当成生产依赖。
- 仓库和原始资产按授权要求保持私有。不要把素材、完整 SWF 或解包目录复制到公共位置。

## 1. 今天完成了什么

### Foundry 碰撞与攀爬

1. 确认可玩碰撞来自 Arena 中的蓝色 `NodePhysBox`，而非背景图轮廓。
2. 解出 33 个盒子，统一在 `src/engine.mjs` 中应用 `X +18`、`Y +24` 的视觉校准；`main.mjs` 绘制的青色框就是同一份物理数据。
3. 保留原控制器的躯干探针语义：非蹲伏为 `-20/-25/-35/-45px`，脚底不拿来当侧面阻挡。
4. 允许小台阶（不超过 28px）脚底平滑抬升，避免熔炉坡面卡脚；**没有改蓝色盒几何**。
5. 修复一个遗漏：`NodePhysBox` 之前会阻挡水平移动却被 `beginLedgeClimb()` 排除。现在跳起后下落碰到 20–56px 可达盒沿，会播放 `climbsmall` 或 `climbbig` 并落在盒顶。

原版 `Movement.as` 的攀爬是在跳跃/下落分支中用 `±17` 的 `-20/-40/-55` 像素探针触发；不要把站立硬顶障碍误改为无条件攀爬。

### UnitMC、手臂与 M4

1. `UnitMC`（符号 669）449 帧显示列表已解析为 `public/assets/unitmc-timeline.json`，渲染层按 Flash 30 FPS **离散帧**回放，不对独立肢体矩阵插值。
2. `UnitMC.as` 每帧把 `head` 对齐 `headhold`，把 `arm1`/`arm2` 对齐 `arm1hold`；瞄准旋转由 `Unit.as` 在 holder 之上施加。不能把手臂固定在躯干坐标。
3. 腿/脚/躯干/头使用子 Shape 的真实局部边界；这消除了先前脚、腿、躯干错位和跨职业切帧。
4. 曾错误把手臂 Sprite 的**第 51 个动作时间轴帧**当作皮肤帧，实际那是武器动作序列中的帧。现已改为：

   | 层 | 正确来源 |
   | --- | --- |
   | 持枪臂 | 501 `arm_gun_316` 的 `rifle` 标签，第 77 帧 |
   | 前臂 | 668 `arm_front_328` 的 `rifle` 标签，第 77 帧 |
   | M4 | 375 `Guns_290` 的 `M4` 标签，第 20 帧 |
   | Medic 皮肤肢体 | 266/298/385 子 Sprite 的第 51 帧 |

5. 将以上层按原 Matrix 合成为 `public/assets/unit-parts/full/rifle_arm_rifle_idle.png` 与 `front_arm_rifle_idle.png`。合成时删除了额外的 425 `rife_clip_319`，避免双弹匣。
6. 当前 M4 是在组合画布内按视觉验收调过的：右 5px、下 8px；运行时 `arm1` 画布注册点是 `(-8, -15)`，`arm2` 是 `(-2, -5)`。不要移动角色/腿/蓝色碰撞框来“补偿”枪。
7. 枪口相对 `arm1hold` 的最终局部向量是 `(71, -8)`。`engine.mjs` 用其长度计算弹道，`main.mjs` 以 `-atan2(-8, 71)` 校正完整枪图的微小原始倾角，因此枪管、枪火和弹道共线。

### 文档和测试

- README、迁移状态和本文均已更新为 2026-07-21 的当前实现；旧文档中“20/24/33 测试”“正弦骨架”“全部使用 alpha wall”等说法已失效。
- `tests/engine.test.mjs` 现在覆盖 Foundry 盒顶/侧面、坡面、墙体探针、墙体与蓝盒攀爬、UnitMC 标签、完整枪臂资源、枪口、后坐、碰撞、AI、相机和存档行为。

## 2. 关键代码地图

| 文件 | 责任 | 改动时的注意事项 |
| --- | --- | --- |
| `src/engine.mjs` | 输入、物理、蓝盒、攀爬、射击、AI、伤害 | `x/y` 是脚底中心；改物理前先写测试。 |
| `src/foundry-layout.mjs` | Arena 解出的原始节点/盒子 | 不要手工改数值以对齐图片；公共视觉校准只在 `engine.mjs`。 |
| `src/main.mjs` | Canvas、部件绘制、输入、HUD、调试盒 | Flash Matrix 到 Canvas 顺序不可交换。 |
| `public/assets/unitmc-timeline.json` | 449 帧的命名实例矩阵 | 重新解包时用 Place/Remove tag 解析，不是逐图猜测。 |
| `public/assets/unit-parts/full/` | M4 合成臂图 | 改图后必须重算注册点、枪口向量和测试。 |
| `tests/engine.test.mjs` | 行为回归 | 当前基线为 44 个通过。 |

## 3. 坐标与计算规则

### 3.1 Flash Matrix → Canvas

从 `unitmc-timeline.json` 读取的是：

```text
[name, x, y, scaleX, scaleY, skewX, skewY]
```

Canvas 对应为：

```js
ctx.translate(x, y);
ctx.transform(scaleX, skewX, skewY, scaleY, 0, 0);
```

`skewX/skewY` 不能交换。交换会让腿和 holder 绕错注册点。非瞄准部件使用原 Matrix；头和双臂使用 holder 平移、保留缩放，再施加原 `Unit.as` 的瞄准角。

### 3.2 瞄准、枪口和镜像

`getAimPivot()` 取 `arm1` holder，而不是玩家脚底上方的固定点。`getMuzzleOrigin()` 使用：

```text
ARM1_PIVOT = (0.3, -42)
RIFLE_BARREL_TIP = (71, -8)
distance = hypot(71, -8)
muzzle = pivot + aimDirection * distance
```

渲染端对枪图施加 `-RIFLE_ARM_BASE_ANGLE`，其中 `RIFLE_ARM_BASE_ANGLE = atan2(-8, 71)`；这让视觉枪管恰好落在同一 aim ray 上。若改枪图、裁切或其内部平移，必须同时更新这三个数据和 `rifle shots start at the decoded arm-canvas barrel tip` 测试。

### 3.3 碰撞

- 玩家 AABB：半宽 17、高 55；黄色调试框反映同一 AABB。
- Foundry 蓝盒：`FOUNDRY_LAYOUT.collisionBoxes` 是原始中心/宽高，运行时在 `FOUNDRY_COLLISION_BOXES` 统一加 `(18,24)`。
- 小坡/台阶：只允许中心脚落点上移，不把侧脚作为地面；侧面阻挡由躯干探针决定。

## 4. 解包经验与证据

1. SWF 是 AS3 运行时，不是一个静态贴图包。SymbolClass、FrameLabel、PlaceObject2/3、RemoveObject2 都必须解析。
2. 解析显示列表时：PlaceObject2=26、PlaceObject3=70、RemoveObject2=28、RemoveObject=5。曾把 tag 28 误当放置标签，直接造成残影、错肢体和“换角色”。
3. 任何“第 N 帧”必须说明是哪个 Sprite 的哪条时间轴；皮肤帧与武器动作帧不是同一个概念。
4. 正常地图图层、蓝色物理盒、出生/AI/补给节点和 wall mask 是不同层。视觉上重合不代表可互换。
5. 先做可复现数值/单测，再做视觉微调。对于裁切图，记录「图内像素 → 局部注册点 → 世界枪口」三段关系，避免只靠肉眼平移。

更多二进制证据、符号 ID、FrameLabel 和 AS3 片段在 [SWF_DEEP_UNPACK_REPORT.md](SWF_DEEP_UNPACK_REPORT.md)。

## 5. 下一步建议（按优先级）

1. **攀爬人工验收**：在 Foundry 的吊箱、炉边斜坡和小箱沿分别以左右方向跳起下落测试；若某个真实盒沿仍不能触发，新增仅针对该盒的回归测试，不要改整张地图。
2. **武器状态机**：将 `rifle_fire`、`rifle_reload` 和其他枪种的 FrameLabel 组合为数据驱动资源，而不是继续冻结 M4 待机图。
3. **完整上半身逐帧对照**：以相同位置、武器和鼠标角截图对原 SWF，验证 run/jump/climb 时 holder/枪口是否保持一致。
4. **地图与模式**：导入更多 Arena 帧，逐项验证 NodeWaypoint/NodeAiAction/CTF/DOM 节点；不要仅凭时间轴声明数认定为活跃节点。
5. **AI 和联机**：先完善本地 AI 路点/模式逻辑，再考虑服务器权威状态与客户端预测。当前 HTTP 房间仅是私有原型。

## 6. 不要做的事

- 不要 `git reset --hard`、删除 `private-assets/` 或删除忽略的深度解包目录。
- 不要回到整帧 `UnitMC` PNG 轮播；它会失去独立瞄准并重新引入拼接错误。
- 不要为修枪或身体移动 Foundry 的蓝色碰撞盒。
- 不要把未验证的近似写成“原版完全一致”。在文档里标明证据来源和仍待人工验收的范围。
- 不要将原始资源或本仓库改为公开。
