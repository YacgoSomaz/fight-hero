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
| `private-assets/`（根目录） | 提取/解析脚本、UnitMC 与 Foundry JSON、对齐截图和被拒绝方案 | 小型研究交接包，供复核结论与重跑工具 |

`private-assets/extracted/` 的完整 FFDec Sprite 导出约 3.2 GiB、19,801 个文件，因此刻意不上传。它的核心用途是逐帧检查：Flash 会把一个静止图像重复放在多个帧号上以保持时间轴、标签和显示列表顺序；即使 PNG 的像素相同，删除该帧也会破坏“第几帧显示什么”的证据。网页运行时不需要整帧轮播，使用的是 449 帧显示列表矩阵和少量裁切部件；需要新的原始资源时，从已版本化的 SWF 重导出即可。

仓库只保留 `private-assets/` 根目录约 27 MiB 的脚本、JSON 和人工复核图片。它们记录了 UnitMC 的 `PlaceObject2/3` / `RemoveObject2` 解析、Foundry 节点/碰撞提取、枪口与手臂对齐过程，以及被排除的错误拼接方案；这比上传大量可再生 PNG 更适合交接。

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
