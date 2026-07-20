# 项目交接报告：战火英雄本地网页技术验证

## 1. 目标、边界与现状

目标是研究如何把一个已获得本机运行权的 Flash 横版射击样本，逐步重建为浏览器 Canvas 验证程序。当前仓库是**单人、离线、代码优先**的技术原型，不应被描述为或用于分发原游戏。

最重要的限制：公开仓库中不能出现原 SWF、其导出贴图、地图、HUD、音频或截图。保留代码、测试、符号 ID、逆向笔记和本机提取说明即可。

目前浏览器场景具备移动、跳跃、平台碰撞、短台攀爬、鼠标瞄准、左键射击、局部平滑镜头和一个骨骼化人物原型。它**不是**像素级原版复刻。

## 2. 快速接手顺序

1. 运行 `npm test`，确认 20 个测试全部通过；再运行 `npm run test:coverage`，阈值必须维持在 80% 以上。
2. 通读 `src/unit-rig.mjs`、`src/engine.mjs`、`src/main.mjs`，再读本报告第 3、4 节。
3. 若要使用私有原始素材，按 `PRIVATE_ASSET_SETUP.md` 在本机导出，确认没有 `git add` 到这些文件。
4. 下一项推荐工作是“逐帧采样真实 UnitMC 部件矩阵”，不要先做联机或 AI。
5. 每一项功能遵守 TDD：先在 `tests/engine.test.mjs` 添加针对行为的失败测试，运行 RED，再实现、运行 GREEN、检查覆盖率。

## 3. 原 SWF 的已确认结构

### 3.1 `UnitMC`

`UnitMC` 是符号 **669**，总计 449 帧。ActionScript 类暴露的子部件为：

```text
body
head / headhold
arm1 / arm1hold       # 前方持枪臂
arm2                  # 后方手臂
legup1 / leglow1 / foot1
legup2 / leglow2 / foot2
gun
```

`UnitMC.EnterFrame()` 每帧执行：

```as3
head.x = headhold.x; head.y = headhold.y;
arm1.x = arm1hold.x; arm1.y = arm1hold.y;
arm2.x = arm1hold.x; arm2.y = arm1hold.y;
```

因此 `headhold`、`arm1hold` 才是不同跑跳攀爬帧的关键 pivot；不能用一个固定躯干坐标代替。

已识别的主时间轴区间：

| 状态标签 | 帧区间/行为 |
| --- | --- |
| `idle` | 1–20 循环 |
| `run1` | 21–38 循环 |
| `runback1` | 58–75 循环 |
| `run2` | 95–118 循环 |
| `runback2` | 143–166 循环 |
| `fall` / `fallloop` | 208–264 |
| `climbsmall` | 392–396 |
| `climbbig` | 397–408 |

`UnitMC.goto()` 还包含防止不自然中断的过渡规则：攀爬、硬着陆、跳跃→坠落、滑铲、蹲伏起身都不能被任意状态直接覆盖。网页版当前仅保留了必要状态；后续应把这些转换规则建成表驱动状态机。

### 3.2 瞄准、翻转与枪械

原 `Unit.as` 每帧关键逻辑：

```as3
flip = mov.jumping ? aimX < x : UT.fixRotation(aimRoation - MC.rotation) < 0;
MC.scaleX = flip ? -1 : 1;
rotArm = UT.getRotation(x + MC.arm1.x + MC.rotation * 1.2,
                        y + MC.arm1.y, aimX, aimY) - 90;
aimRoation = UT.fixRotation(rotArm + 90) + spinMC.rotation;
if (flip) rotArm = -rotArm + 180;
rotArm = UT.fixRotation(rotArm - rotation) + (flip ? MC.rotation : -MC.rotation);
MC.arm1.rotation = rotReload + rotArm;
MC.arm2.rotation = rotReload + rotArm;
MC.head.rotation = rotReload + rotArm * 0.6;
```

结论：两条手臂共享瞄准旋转；头只使用 60%；整体通过 `scaleX` 翻转；后坐/换弹偏移叠加在上半身。`Guns.as` 将主枪帧给 `MC.gun`、副枪帧给 `MC.legup1.gun`，并将当前枪帧同步到 `MC.arm1.gun`。

### 3.3 当前网页实现

`src/unit-rig.mjs` 是纯函数 `getUnitRigPose(input)`。输入：`animation`、`animationTime`、`aimAngle`、`facing`、`recoil`。输出：躯干、头、两条手臂、枪、双腿的局部 `{x,y,rotation}`。

- `run`：反相正弦腿摆与轻微躯干起伏；
- `climbsmall` / `climbbig`：手前伸、腿抬起、躯干上移；
- `jump` / `fall`：固定空中腿姿态；
- 手臂与枪角度相同，头为手臂的 60%；
- `recoil` 让枪在局部 X 方向回退，腿部不变。

这是按原层级和公式语义构建的第一阶段，不是已从 SWF 逐帧测得的变换矩阵。不要把它误称为 1:1。真正的下一步是导出 `UnitMC` 全帧并对每帧读取 `headhold` / `arm1hold` 与腿部实例矩阵，生成一个可版本控制的**数值关键帧表**（不提交图片）。

## 4. 物理、镜头与渲染

### 4.1 引擎

`src/engine.mjs` 使用人物脚底锚点：`x` 是脚底中心，`y` 是脚底高度；命中盒是 `{ halfWidth: 13, height: 62 }`。逻辑顺序：输入→横向阻挡→短台攀爬判定→重力/顶底碰撞→射击/后坐→动画状态。

攀爬是当前近似实现：人物下落时碰到侧边，脚底低于平台顶面 20–56 像素即开始；38 像素以上选 `climbbig`，否则 `climbsmall`。原 `Movement.as` 采用的是像素 `hitTest`（右侧点约 `(17,-40)`、`(17,-55)` 与左侧镜像），后续替换为真实 wall mask 后应重写这一段。

### 4.2 真实碰撞的缺口

当前 `CONFIG.platforms` 是根据实验室背景手工放置的矩形。原版并非矩形碰撞：`Arena.as` 用 `wallMC` 绘制到透明 `BitmapData`，`Movement` 对该位图做像素命中。

已确认 Foundry 对应真实遮罩符号：**1261 `MBFZ_fla.foundry_wall_209`**。正确路线：选用 Foundry 的可视图层和同一墙体遮罩；把 alpha/指定颜色转换为浏览器 `ImageData`/bitset；让移动、子弹视线、AI 统一查询同一份 mask。不要继续扩大手工平台列表。

### 4.3 镜头

`camera.mjs` 使用世界尺寸 2591×1457 与显示窗口 1280×720；`getFollowCamera` 只跟随玩家位置，`smoothCamera` 使用时间常数平滑，绝不可加入基于鼠标方向的突然偏移。`screenToWorld` 是鼠标瞄准唯一允许的屏幕→世界转换入口。

## 5. 已逆向的 AI 与 Bot 随机规则（尚未接入）

`AI.as` 的要点：

- `getTargetEvent = UT.irand(1,12)`：各 Bot 分散在不同帧扫描目标；
- 通过 `NodeWaypoint` 连线寻路，卡住后重新找最近路径点；
- 目标必须是敌方、存活、非隐身/出生状态、距离在 `min(gun.range*10,450)` 内，并经墙体采样视线测试；
- 难度 0–15 改变瞄准速度、开火概率、停顿/蹲伏概率；
- 夺旗与占点模式有拿旗、归旗、守点行为；
- 开火概率受枪械射速与难度共同影响，非固定每帧连射。

`MatchSettings.as` 的快速对战 Bot 在创建局时随机：名字、皮肤、职业（通常 1–4）、等级、主副武器、技能与连杀。`Stats_Classes.getAiLevel(diff)` 约为 `max(1, diff*3 + random(-3..4))`。`Stats_Guns.getRandPrimary(bot)` 依职业、等级和随机浮动选枪；技能池还会排除冲突组合。推断：随机配置在创建 Bot 时生成，复活通常沿用本 Bot 配置；战役 Bot 可由关卡数据明确指定。

AI 只能在第 4.2 节的真实碰撞/路点完成后接入；否则寻路和视线都不可信。

## 6. 推荐任务队列

### P0：让 UnitMC 变成可测的原始关键帧状态机

1. 写导出/采样工具，读取私有 SWF 并生成**不含图片**的 `unitmc-keyframes.local.json`；
2. 记录每个状态每帧：`headhold`、`arm1hold`、每节腿、body 的矩阵/可见性；
3. 用测试断言 run 循环首尾连续、small/big 攀爬帧数正确、头部旋转比例正确；
4. `unit-rig.mjs` 改为关键帧插值/逐帧采样，不再用正弦近似；
5. 浏览器截图对照必须使用相同地图、相同坐标、相同武器、相同缩放。

### P1：统一真实地图碰撞

1. 用 Foundry 可视背景+1261 wall mask 替换实验室背景；
2. 完成 `isSolid(x,y)`，替换所有矩形平台检测；
3. 用同一 mask 驱动角色、子弹、AI 视线；
4. 添加边缘、斜面、顶棚、攀爬缺口回归测试。

### P2：AI

先复刻最小 `AI`：路点巡逻→可见敌人锁定→平滑瞄准→概率开火；再接模式目标、Bot 随机档案。不要先做网络同步。

### P3：联机（最后）

原游戏没有直接可复用的双人本地模式实现。若未来做联机，应由服务器权威处理输入、物理、命中与随机种子，客户端仅预测/插值；这属于新功能，不是本次 SWF 迁移的自然副产物。

## 7. 已知风险与不可做事项

- `assets/reverse/` 与 `public/assets/` 含授权素材；仓库必须保持 Private，且只能向获授权成员授予访问权限；
- 当前 `server.mjs` 的 `/source-assets/` 映射到受版本控制的 `public/assets/unit-parts/`；
- 不要用“整帧 PNG 播放”修复动画，它会回到重影/错误持枪的老问题；
- 不要在没有 wall mask 的情况下声称碰撞或 AI 行为与原版一致；
- 不要在未完成 P0/P1 前花时间做双人、远端服务器或手机端。

## 8. 验收基线

最后一次本地验证：

```text
npm test                 # 20/20 pass
npm run test:coverage    # lines 96.94%, branches 89.91%, functions 90.63%
```

浏览器人工检查：启动后移动、跳跃、右/左瞄准、左键单击、连续按键移动与短台攀爬均无 JavaScript 运行时错误；本地服务器为 `http://127.0.0.1:4173`。
