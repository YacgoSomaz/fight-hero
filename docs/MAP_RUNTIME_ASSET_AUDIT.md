# 地图运行时资源审计（2026-07-22）

本表是“浏览器启动会读取什么”的清单，不是重新绘制的替代资源。所有路径均位于 `public/assets/maps/`，因此新克隆仓库不会依赖被忽略的解包工作目录。

| 地图 ID | 原始天空 | 原始背景 | 原始前景 | 物理/节点来源 |
| --- | --- | --- | --- | --- |
| `tut` | `tut/sky.png` | `tut/background.png` | `tut/foreground.png` | `Arena` 教程节点 |
| `foundry` | `source/sky/1.png` | `foundry.png` | `foundry-foreground.png` | `wallMC` + Foundry 节点 |
| `foundry2` | `source/sky/1.png` | `source/background/2.png` | `foundry-foreground.png` | Foundry 节点 |
| `train` | `source/sky/2.png` | `source/background/6.png` | `source/arena/3.png` | Arena 节点 |
| `train2` | `source/sky/3.png` | `source/background/8.png` | `source/arena/4.png` | Arena 节点 |
| `plane` | `source/sky/4.png` | `source/background/10.png` | `source/arena/5.png` | Arena 节点 |
| `plane2` | `source/sky/7.png` | `source/background/6.png` | `source/arena/5.png` | Plane 节点 |
| `swamp` | `source/sky/4.png` | `source/background/15.png` | `source/arena/6.png` | Arena 节点 |
| `swamp2` | `source/sky/5.png` | `source/background/14.png` | `source/arena/6.png` | Swamp 节点 |
| `cave` | `source/sky/4.png` | `source/background/18.png` | `source/arena/7.png` | Arena 节点 |
| `cave2` | `source/sky/6.png` | `source/background/19.png` | `source/arena/7.png` | Cave 节点 |
| `dropship` | `source/sky/4.png` | `source/background/12.png` | `source/arena/9.png` | Arena 节点 |
| `missile` | `source/sky/4.png` | `source/background/12.png` | `source/arena/10.png` | Arena 节点 |
| `missile2` | `source/sky/6.png` | `source/background/12.png` | `source/arena/10.png` | Missile 节点 |

## 自动守卫

`tests/map-visuals.test.mjs` 对上表涉及的每个可启动地图执行：

1. 三层路径都必须在 `public/assets/maps/`；
2. 每层必须是存在的 PNG；
3. 每层必须有明确的可见裁切；
4. 裁切 `x/y/width/height` 必须完全落在 PNG 像素范围内。

这能阻止“地图明明注册但运行时从私有目录读图”“隐式 0×0 裁切”“浏览器 `drawImage`/CSS 采样越界造成空白”三类回归。

## 已人工启动的代表图

已在本机浏览器启动并看到原始图层：`tut`、`foundry`、`train`、`cave`、`dropship`、`missile`。其余图层已有同样的磁盘与裁切自动检查，但还没有逐图对照原 Flash 镜头、碰撞、任务推进的人工签字。
