# 私有素材准备（不要提交）

## 用途与边界

这份说明仅用于在你**已合法持有**的原始 SWF 上进行本机研究。不要把原 SWF、导出的 PNG、音频或任何第三方游戏资源放进公共 Git 仓库。

当前 `main.mjs` 会从本地服务的 `/source-assets/` 路径读取两张已分离的手臂资源；`server.mjs` 默认将此路径映射到仓库上两层目录的 `work/ffdec_unit_parts/`。这是现有工作区的本地约定，不是公开仓库的运行前提。

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

假设已经安装 JRE 与 JPEXS FFDec，并把原 SWF 放在本机私有路径。下列命令只导出到本机，不应把输出提交。

```powershell
java -jar ffdec-cli.jar `
  -selectid 501,668 `
  -select '501:1,668:1' `
  -ignorebackground `
  -export sprite .\work\ffdec_unit_parts .\game.swf
```

全帧导出可用于离线对照，但体积很大：

```powershell
java -jar ffdec-cli.jar `
  -selectid 669 `
  -select '669:1-' `
  -ignorebackground `
  -export sprite .\work\unitmc_frames .\game.swf
```

## 重要提醒

不要直接把 `UnitMC` 的整帧 PNG 轮播当成人物动画。Flash 原运行时会对 `head`、`arm1`、`arm2` 等子 MovieClip 做显隐、重定位、旋转和枪械换帧；错误导出/直接轮播会产生重影、错枪和多个人体。应提取每个部件的局部边界与 pivot，再交给 `src/unit-rig.mjs`。
