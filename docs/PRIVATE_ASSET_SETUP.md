# 授权素材准备

## 用途与边界

这份说明用于在项目**已获授权**的原始 SWF 上进行内部研究。原 SWF、导出的 PNG、音频及其他素材只能留在本私有仓库和获授权的本地环境中，绝不能转为公开可访问内容。

当前 `main.mjs` 会从本地服务的 `/source-assets/` 路径读取两张已分离的手臂资源；`server.mjs` 将此路径映射到 `public/assets/unit-parts/`。原始 SWF 和参考导出存放在 `assets/reverse/`。

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

假设已经安装 JRE 与 JPEXS FFDec，并在私有工作区中使用原始 SWF。下列命令用于重新生成运行时手臂资源。

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
