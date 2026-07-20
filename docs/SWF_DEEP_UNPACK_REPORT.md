# SWF 深度解包报告：`4399-90433-25.swf`

> 分析日期：2026-07-20。本文只描述本地样本 `assets/reverse/4399-90433-25.swf`，不把推断写成原版事实。

## 结论先行

这不是一个只含贴图的 Flash 文件，而是一套完整的 AS3 游戏运行时：主时间轴负责启动与菜单切换；`Game` 组织对局；`Arena` 生成像素级墙体和地图节点；`Unit` / `Movement` / `Guns` 实现角色、物理和武器；`AI` 处理寻路、选敌、视线和概率开火。SWF 内部包含 500 个 AS3 脚本、325 条 SymbolClass 映射、174 段声音，以及角色、地图、HUD、武器等时间轴资源。

因此要高保真迁移，不能只裁图或把 `UnitMC` 整帧 PNG 轮播。最低可行的正确路径是：**保留原始帧标签和骨骼 pivot、把 `wallMC` 转为像素碰撞掩码、以同一掩码驱动角色/子弹/AI，并按每秒 30 帧复刻逻辑节拍。**

## 1. 样本身份与可复现性

| 项目 | 结果 |
| --- | --- |
| 样本 | `assets/reverse/4399-90433-25.swf` |
| 下载体积 | 16,688,824 bytes |
| 解压后的 SWF 长度 | 18,868,390 bytes |
| SHA-256 | `BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29` |
| 文件签名 | `CWS`，ZLIB 压缩，未加密 |
| SWF 版本 | 10 |
| 舞台 | 800 × 600 px（文件坐标为 16,000 × 12,000 twips） |
| 主时间轴 | 25 帧，30 FPS |
| 工具 | JPEXS FFDec 26.1.0；Temurin OpenJDK 21.0.11 |

本次重新生成的证据位于 `assets/reverse/ffdec-deep-20260720/`：

- `header.txt`：FFDec 文件头；
- `tags.txt`：完整标签转储；
- `as3-index.txt`：500 个 AS3 定义的索引；
- `scripts/`：FFDec 还原的 AS3；
- `pcode/`：同一批 500 个定义的 AVM2 P-code，对源码反编译作交叉核验；
- `symbolClass/symbols.csv`：角色 ID 与 AS3 类名映射；
- `sounds/`、`texts/`：解出的声音与文本资源。

导出命令（Windows PowerShell）如下。`<java>` 是本地 Java 路径，`<ffdec>` 是 `ffdec-cli.jar`：

```powershell
& <java> -Xmx4g -jar <ffdec> -timeout 90 -exportTimeout 1800 `
  -onerror ignore -export script,symbolClass,text,sound `
  .\assets\reverse\ffdec-deep-20260720 `
  .\assets\reverse\4399-90433-25.swf

& <java> -Xmx4g -jar <ffdec> -format script:pcode -timeout 90 `
  -export script .\assets\reverse\ffdec-deep-20260720\pcode `
  .\assets\reverse\4399-90433-25.swf
```

## 2. 容器层：二进制实际包含什么

下表来自直接解压 SWF 后的标签解析；括号中是 SWF tag code。它不是对网页迁移资产目录的猜测。

| 类型 | 数量 | 说明 |
| --- | ---: | --- |
| `DoABC2` (82) | 2 | 合计 716,356 bytes 的 AVM2/AS3 字节码 |
| AS3 定义 | 500 | FFDec 从两段 DoABC 解出；源码与 P-code 均已导出 |
| `SymbolClass` (76) | 2 个标签 / 325 条映射 | 主类、地图、角色、UI、音频等和符号 ID 绑定 |
| `DefineSprite` (39) | 324 | 嵌套 MovieClip 时间轴；并非静态图片拼图 |
| 矢量 Shape (2/22/32) | 906 | UI、图形与部件轮廓 |
| 位图定义 (6/20/21/35/36) | 39 | JPEG、带 alpha JPEG、无损位图等 |
| `DefineSound` (14) | 173 | FFDec 另导出 1 个流式音频，合计 174 段音频文件 |
| 文本定义 (11/33/37) | 419 | 输入框、静态文本及文字资源；配套 CSM 文本设置另有 287 个 tag |
| 主时间轴 `ShowFrame` (1) | 25 | 与文件头的 25 帧一致 |

可直接在 `tags.txt` 中复核以上计数。SWF 的可执行逻辑占比很高，且角色、枪械、地图和菜单都使用时间轴嵌套；只导出 PNG 无法得到原玩法。

## 3. 已核验的关键符号

下列映射直接来自 `symbolClass/symbols.csv`，不是按图片外观命名。

| ID | SymbolClass | 用途 |
| ---: | --- | --- |
| 0 | `Main` | 主入口 |
| 501 | `MBFZ_fla.arm_gun_316` | 持枪手臂时间轴 |
| 668 | `MBFZ_fla.arm_front_328` | 前手臂时间轴 |
| 669 | `UnitMC` | 完整角色 MovieClip |
| 1261 | `MBFZ_fla.foundry_wall_209` | Foundry 地图墙体遮罩 |
| 1413 | `Arena` | 地图容器与节点收集器 |
| 1431 | `Aimer` | 准星 |
| 1540 | `Hud` | HUD |

此外，SWF 还映射了 `Player`、`AI`、`Game`、`Menu`、`MatchSettings`、`NodeSpawn`、`NodeWaypoint`、`NodeAiAction`、`NodePickup`、`NodeCtfFlag`、`NodePhysBox`、`PhysWorld`、各类子弹与 93 个 Box2D 类。

## 4. 启动与运行时拓扑

以下是从 `Main.as`、`Game.as`、`Arena.as` 的调用关系还原出的流程：

```text
Main (主时间轴 / 输入入口)
  ├─ 初始化 SD、SH、Stats_*、MatchSettings、GameVars
  ├─ LoaderScreen → BH（位图预处理）→ Logo / Menu
  └─ 每个 ENTER_FRAME：当前页面/对局 EnterFrame() + SH.EnterFrame()

Menu / MatchSettings
  └─ 选择地图、模式、玩家档案、Bot 档案

Game
  ├─ Arena（地图、wallMC、节点）
  ├─ Player + N × AI
  ├─ PhysWorld / Water / Radar / Hud / Aimer
  └─ bullets、effects、killstreaks、计分与结束界面
```

`Main` 显式给舞台绑定 `ENTER_FRAME`、鼠标按下/抬起、键盘按下/抬起、激活/失焦与滚轮事件。文件头给出的 30 FPS 与这些逐帧逻辑一致；下面列出的物理量是**每个 Flash 帧**的数值，迁移到浏览器时不能直接当作每秒数值。

SWF 内含 Mochi 与 Playtomic 类，并在启动阶段调用广告、日志和 `GameVars.Load`。这些属于原版外部服务耦合；迁移时应替换为本地存档/受控后端，不能依赖这些已过时的远端接口。

## 5. 角色 `UnitMC`：449 帧时间轴，不是精灵表

`DefineSprite` ID 669 的声明帧数和实际 `ShowFrame` 数均为 **449**。直接扫描该 Sprite 内的 `FrameLabel` 得到下表：

| 帧区间 | 标签 | 备注 |
| --- | --- | --- |
| 1–20 | `idle` | 待机 |
| 21–38 | `run1` | 跑动类型 1 |
| 39–57 | `landrun1` | 落地接跑动类型 1 |
| 58–75 | `runback1` | 反向跑动类型 1 |
| 76–94 | `landrunback1` | 反向落地接跑动类型 1 |
| 95–118 | `run2` | 跑动类型 2 |
| 119–142 | `landrun2` | 落地接跑动类型 2 |
| 143–166 | `runback2` | 反向跑动类型 2 |
| 167–190 | `landrunback2` | 反向落地接跑动类型 2 |
| 191–208 | `jump` | 起跳 |
| 209–229 | `fall` | 坠落过渡 |
| 230–264 | `fallloop` | 坠落循环 |
| 265–279 | `land` | 落地 |
| 280–290 | `tuck` | 收身 |
| 291–301 | `slide` | 滑铲 |
| 302–305 | `duck` | 下蹲进入 |
| 306–321 | `duckloop` | 下蹲循环 |
| 322–354 | `duckrun` | 蹲跑 |
| 355–387 | `duckrunback` | 反向蹲跑 |
| 388–391 | `getup` | 起身 |
| 392–396 | `climbsmall` | 小攀爬 |
| 397–408 | `climbbig` | 大攀爬 |
| 409–449 | `landhard` | 重落地 |

`UnitMC.as` 暴露 `body`、`head` / `headhold`、`arm1` / `arm1hold`、`arm2`、双腿、双脚与 `gun` 等部件。其逐帧函数会把头、两条手臂的定位对齐到时间轴中的 holder。`Unit.as` 再对手臂施加瞄准角、翻转、后坐与整体旋转。

因此网页端应把每帧的 holder 位置、变换矩阵、可见性和枪械子帧采样为数据表；直接播放 449 张合成图会丢失独立瞄准、换枪、翻转和后坐的层级关系。

## 6. 移动和碰撞：真实公式与最关键的实现差异

`Movement.as` 的直接常量如下（单位：每个原始 30 FPS Flash 帧）：

| 常量 | 值 | 含义 |
| --- | ---: | --- |
| `xAcc` | 1.8 | 地面水平加速度 |
| `xBrake` | 1.7 | 地面松键制动 |
| `xAirAcc` | 1.4 | 空中水平加速度 |
| `xAirBrake` | 0.4 | 空中制动 |
| `xMax` | 9.5 | 常规水平最高速度 |
| `xCrouchMax` | 4 | 蹲伏最高速度 |
| `yGrav` | 0.8 | 重力增量 |
| `yMax` | 20 | 下落速度上限 |
| `yJump` | 13 | 普通跳跃初速度 |
| `yJumpBoost` | 6 | 跳起时的坐标修正 |
| `yDjump` | 10 | 双跳相关参数 |

行为顺序也已从源码核对：输入改变 `xVel` 并夹到最大速度；松键按地面/空中/蹲伏状态制动；再把水平、滑行与垂直速度写入坐标；之后利用 `hitTest` 做脚底、顶棚和侧面解析。落地/攀爬时有 0.5 像素步进修正，不能用单次矩形 AABB 取代。

更重要的是，`Arena` 构造时执行：创建与 `wallMC` 同尺寸的透明 `BitmapData`，调用 `draw(wallMC)`，随后隐藏 `wallMC`。`Movement`、`Bullet`、`Radar` 等都基于该墙体数据查询。换言之：

```text
可见地图层 ≠ 碰撞层
碰撞层 = wallMC 渲染到的 BitmapData / 像素掩码
```

这是迁移工程中优先级最高的事实。应将 ID 1261 的 alpha/颜色掩码转换为浏览器 `ImageData` 或 bitset，集中提供 `isSolid(x, y)`；角色、子弹和 AI 视线共用它。

## 7. 地图节点、模式和出生点

`Arena.as` 不把地图辅助物作为装饰忽略。它遍历自身子节点，将 `NodeSpawn`、`NodeWaypoint`、`NodeAiAction`、`NodePhysBox`、`NodePickup`、`NodeHoldpoint`、`NodeCtfFlag` 分别收集到数组；非当前模式的旗帜和占点会被隐藏。随后建立 waypoint ID → 对象的映射、连接 waypoint，并把动作框挂到相应路径点。

从这个特定 Arena 的声明可见大量时间轴节点（84 个命名 `NodeWaypoint` 槽、38 个命名 `NodeSpawn` 槽、25 个命名 `NodeAiAction` 槽、7 个命名 `NodePickup` 槽、10 个命名 `NodeCtfFlag` 槽）。这些是**时间轴声明总量**，可能跨多个帧或模式；实际某一对局帧的节点总数应在 Flash 运行时或逐帧显示列表采样后再定稿，不能把它们误报为单张地图的同时活跃节点数。

`Unit` 的出生逻辑会根据 CTF 与队伍选择 `spawnsT1` / `spawnsT2` 或通用 `spawns`，首轮出生避免重用已经标记的节点。模式并不是前端皮肤切换，而是改变节点可见性、队伍出生和目标逻辑。

## 8. 武器、音频与 AI

### 武器与音频

`Stats_Guns.as` 是数据驱动的枪械表，至少写入弹匣、备用弹、射程、后坐、自动/半自动、空闲/开火/换弹帧标签、子弹类与额外属性。`Guns.as` 管理射击延迟、换弹、后坐、武器帧以及弹药 HUD；`UnitMC` 在对应时间轴帧调用不同枪种的换弹声。

音频不是后加的网页资源：SWF 有 173 个 `DefineSound`，解包得到 173 个 MP3 与 1 个流式 WAV。音乐类包括 `M_Menu`、`M_Theme`、`M_Boss`、`M_Train`、`M_Rocket`、`M_Plane`、`M_Slow`；枪械、命中、角色语音和 UI 点击声均有独立符号。

### AI

`AI.as` 的可验证行为包括：

- 每个 Bot 在 `UT.irand(1, 12)` 选择不同的目标扫描帧，减少同帧全量扫描；
- 候选目标必须存活、敌对、非隐身、非出生保护，并满足 `distance < min(gun.range * 10, 450)`；
- 对每个候选按 20 像素步长沿瞄准线调用墙体 `hitTest`，有墙即剔除；
- 无目标时瞄准点缓动系数为 X 0.4 / Y 0.3；有目标时使用 `aimSpeed = 0.3 * (difficulty * 0.1 + 0.1)`；
- 用 waypoint 和动作框控制左右移动、跳跃、蹲伏、等待；卡住 4 秒会重找最近路径点；
- 开火概率由枪械射击延迟、难度和 `shotChance` 共同计算，而不是每帧无条件开火。

这解释了为什么 AI 必须等墙体掩码、路线节点和武器射程都迁移后再做；只把 AI 设为“朝最近敌人移动并固定频率射击”会与原行为相差很大。

## 9. 迁移优先级

1. **P0：像素墙体**：导出/转换 `wallMC`，统一 `isSolid`；先让移动、攀爬、子弹命中和 AI 视线使用同一份数据。
2. **P1：角色关键帧表**：对 `UnitMC` 449 帧采样 holder 与部件矩阵，按第 5 节标签播放，保留 `goto()` 的转场限制。
3. **P2：枪械数据**：从 `Stats_Guns` 结构化提取数值，接上子弹类、弹药、换弹帧和声效。
4. **P3：地图节点与模式**：导入出生点、waypoint、动作框、拾取物、CTF/DOM 节点。
5. **P4：AI**：先实现目标筛选与像素视线，再实现寻路、行为随机性和模式目标。
6. **P5：联机适配**：这是新增系统，应该由服务器权威推进输入、物理、随机数、伤害和命中；不要把原 Flash 单机对象直接同步给客户端。

## 10. 证据强度与仍待完成项

**可当作事实：** 文件头、标签数量、SymbolClass ID、`UnitMC` 的 449 帧标签、`Movement` 常量、`Arena` 的 BitmapData 墙体流程、`AI` 选敌和射击公式，均来自二进制解析或源码/P-code 双导出。

**仍需运行时/逐帧采样：** 每个部件每帧的 transform/pivot、某个具体地图帧同时活跃的节点数、所有武器最终数值表、地图 `wallMC` 的精确像素导出参数、原版屏幕滤镜和音频混音。这些不能仅凭一个 decompiler 的高层 AS3 还原安全地断言。

FFDec 的变量名在部分时间轴绑定中已有混淆痕迹；本报告只以明确的类名、符号名、常量、分支和 P-code 可对应的调用为依据。所有导出的原始素材应继续保持私有、在获得授权的范围内使用。

## 11. 本次逐帧矩阵采样（2026-07-20）

为避免把 UnitMC 当作“若干图片随意拼接”，本次直接解析了 SWF 的 `DefineSprite 669` 内全部 `PlaceObject2/3` 标签。解析结果为 449 个显示列表快照，私有中间文件为 `private-assets/unitmc-timeline.json`（不纳入公开运行时）。每个快照保存 depth、character ID、实例名、x/y、scaleX/Y、rotateSkew0/1。

第 1 帧的命名子对象与绑定关系如下：

| depth | instance name | character ID | 角色层级用途 |
| ---: | --- | ---: | --- |
| 1 | `arm1` | 501 | 后侧持枪手臂 |
| 20 | `gun` | 505 | 枪械显示对象 |
| 25/32 | `foot2` / `foot1` | 538 | 两只脚 |
| 27/34 | `leglow2` / `leglow1` | 568 | 两段小腿 |
| 29/36 | `legup2` / `legup1` | 598 | 两段大腿 |
| 39 | `body` | 631 | 躯干 |
| 42 | `headhold` | 666 | 头部时间轴 holder |
| 44 | `arm1hold` | 667 | 手臂时间轴 holder |
| 57 | `head` | 666 | 实际头部实例 |
| 59 | `arm2` | 668 | 前侧手臂 |

`UnitMC.EnterFrame()` 会把 `head` 对齐到 `headhold`，并把 `arm1` / `arm2` 对齐到 `arm1hold`；`Unit.as` 才继续施加瞄准、后坐、翻转和整体坡度。因而正确的浏览器实现必须先回放上述每帧矩阵，再在 holder 之上施加瞄准变换。把裁出的手脚按猜测的关节长度相连会产生脱节，不能作为迁移结果。

标签的二进制扫描结果也已重新校验：`idle` 1、`run1` 21、`runback1` 58、`jump` 191、`fall` 209、`fallloop` 230、`duck` 302、`duckrun` 322、`getup` 388、`climbsmall` 392、`climbbig` 397、`landhard` 409。这些数字是标签的起始帧；结束帧是下一标签前一帧。此前使用的 20/57/190/387 等起点属于 off-by-one 错误，应废弃。
