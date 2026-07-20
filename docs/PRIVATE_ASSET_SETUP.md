# 授权素材准备

当前 `main.mjs` 直接从 `public/assets/` 读取浏览器运行时的地图、角色部件、时间轴和音频资源。原始 SWF、逐帧参考图和深度解包证据在私有仓库的 `assets/reverse/` 中；运行时不读取它们。

## 私有仓库资源清单（2026-07-21）

| 路径 | 内容 | 用途 |
| --- | --- | --- |
| `assets/reverse/4399-90433-25.swf` | 原始 SWF（15.92 MiB） | 唯一原始样本，可重新解包全部嵌入资源 |
| `assets/reverse/ffdec-deep-20260720/` | FFDec 深度导出的 AS3、AVM2 P-code、SymbolClass、标签清单、174 段音频及文本 | 代码/符号/音频的可复现证据包 |
| `assets/reverse/unitmc-frames/` | `UnitMC` 669 的 449 帧参考导出 | 动画逐帧对照，非运行时播放素材 |
| `assets/reverse/foundry-wall/` | Foundry 墙体参考导出 | 墙体与碰撞对照 |
| `public/assets/` | 642 个浏览器就绪的地图、角色部件、时间轴和音频资源 | 网页运行时唯一读取的资源根 |

`private-assets/` 不入库：其约 3.2 GiB 内容混有重复导出、截图、预览和提取实验，既不能作为稳定输入，也不应让下一位接手者误把它当作权威资产包。需要新增原始资源时，应从上表的 SWF 重导出，并把经过核验的结果放入 `assets/reverse/`（参考）或 `public/assets/`（运行时）。

## 已确认的 SWF 符号

| 符号 ID | 名称 | 当前用途 |
| --- | --- | --- |
| 669 | `UnitMC` | 人物总时间轴，共 449 帧 |
| 668 | `MBFZ_fla.arm_front_328` | 前臂/前手臂层 |
| 501 | `MBFZ_fla.arm_gun_316` | 持枪臂层 |
| 375 | `MBFZ_fla.Guns_290` | 枪械时间轴 |
| 1431 | `Aimer` | 准星 |
| 1428 | 准星圆环 | 扩散圆 |
| 1540 | `Hud` | HUD |
| 1261 | `MBFZ_fla.foundry_wall_209` | Foundry 的真实像素墙体遮罩 |
| 1413 | `Arena` | 地图容器 |

## 本机 FFDec 导出示例

假设已经安装 JRE 与 JPEXS FFDec，下列命令用于重新生成运行时手臂资源。

```powershell
java -jar ffdec-cli.jar `
  -selectid 501,668 `
  -select '501:1,668:1' `
  -ignorebackground `
  -export sprite .\public\assets\unit-parts .\assets\reverse\4399-90433-25.swf
```

全帧导出可用于离线对照，但体积很大：

```powershell
java -jar ffdec-cli.jar `
  -selectid 669 `
  -select '669:1-' `
  -ignorebackground `
  -export sprite .\assets\reverse\unitmc-frames .\assets\reverse\4399-90433-25.swf
```

## 重要提醒

不要直接把 `UnitMC` 的整帧 PNG 轮播当成人物动画。Flash 原运行时会对 `head`、`arm1`、`arm2` 等子 MovieClip 做显隐、重定位、旋转和枪械换帧；错误导出/直接轮播会产生重影、错枪和多个人体。应提取每个部件的局部边界与 pivot，再交给 `src/unit-rig.mjs`。
