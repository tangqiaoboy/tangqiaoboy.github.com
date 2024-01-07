---
title: 将 Hexo 升级到 V7.0
date: 2024-01-07 21:56:08
categories:
tags:
---

这次重装 M2 的电脑，Hexo 在设置的时候报很多警报，一些依赖库因为太旧有安全风险，查了一下 Hexo 有最新发布的 [7.0 版本](https://hexo.io/news/2023/11/03/hexo-7-0-0-released/)，于是打算整体迁移一下。

## 安装 Hexo 7.0

首先 Hexo 的安装可以用 brew 了。使用 `brew install hexo`安装，安装好之后 Hexo 在 `/opt/homebrew/Cellar/hexo/7.0.0` 下。

使用 Hexo 的如下指令完成建站

```
hexo init blog
cd blog
npm install
```

## 安装插件

建完站之后，把之前的文章都复制进去，在 themes 目录下同样把 [archer](https://github.com/fi3ework/hexo-theme-archer) clone 下来：

```bash
git clone https://github.com/fi3ework/hexo-theme-archer archer
```

然后需要在 blog 根目录下安装以下插件：

```bash
npm install hexo-deployer-git --save
npm install hexo-generator-json-content
npm install hexo-generator-feed --save
```

除此之外还需要一些配置，修改 `_config.yml`，增加如下内容：

``` json
jsonContent:
  meta: true
  pages: false
  posts:
    title: true
    date: true
    path: true
    text: false
    raw: false
    content: false
    slug: false
    updated: false
    comments: false
    link: false
    permalink: true
    excerpt: false
    categories: true
    tags: true
```

并且将 `_config.yml` 的主题为 Archer：

```
theme: archer
```

最后，复制 Archer 主题目录下的 `_config.yml` 到 Hexo 根目录，并命名为 `_config.archer.yml`。删除 Archer 主题目录下的 `_config.yml` 文件，或将它重命名为 `_config.yml.template`，避免配置合并或冲突。

详见：<https://github.com/fi3ework/hexo-theme-archer>

