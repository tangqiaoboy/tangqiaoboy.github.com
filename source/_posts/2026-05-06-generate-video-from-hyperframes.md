---
title: HyperFrames 实战：用 HTML 写一支 41 秒的产品介绍视频
date: 2026-05-06 23:03:37
tags:
---

## 介绍

[HyperFrames](https://github.com/heygen-com/hyperframes) 把视频当成 HTML 来写。 一个 `index.html` 就是一支视频：
 - `data-*` 属性控制时间
 - GSAP(一个老牌的 JavaScript 动画库)控制动画
 - CSS 控制外观
 - 借助 FFmpeg 生成 MP4

它由 HeyGen 开源，配套 CLI、Skills、Studio 预览器和 13 个相关 skill 包，安装命令：

```bash
npx skills add heygen-com/hyperframes
```

## 为什么值得试

做产品介绍视频，常见的三类工具各有痛点：

| 路径 | 优势 | 痛点 |
|---|---|---|
| Premiere / After Effects | 视觉上限高 | 工程文件不可版本控制、模板化扩展难 |
| Remotion | 程序化 + React | 需要搭工程、依赖链长 |
| 文生视频模型 | 上手快 | 数据准确性不保证、定制化弱 |

HyperFrames 的吸引点是：**保留"代码即源"的可维护性，但把心智模型压缩到只有 HTML / CSS / GSAP 三件事** —— 适合不需要太复杂动效，偏内容呈现类的视频生成。

## 实战尝试

我用它做了一支介绍**斑马思维机**发展历程的视频。

claude code 的提示词如下：

>帮我使用 npx skills add heygen-com/hyperframes 来安装 hyperframes 这个 skill，然后读取网上关于的斑马思维机的介绍，帮我做一个 30s-45s 的介绍斑马思维机发展历程的视频，里面要涵盖机器和题卡上升的时间线。
>
>视频要有配音，可以找一些开放版权的背景音乐。


它做出来是横版的，我又让它生成了一个竖版的，提示词如下：


>帮我另外再生成一个适合在手机上呈现的竖版的版本


## 效果视频

这是横版生成的效果:

<video src="/images/zebra-hyperframes.mp4" controls width="600"></video>

## 参考链接

- [hyperframes](https://github.com/heygen-com/hyperframes)
- 官网：[hyperframes.heygen.com](https://hyperframes.heygen.com)

