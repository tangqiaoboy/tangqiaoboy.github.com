---
title: "从 Octopress 迁移到 Hexo"
date: 2016-02-16 19:05:46
categories: shell
tags: blog
---

## 序言

我的博客之前一直使用的是 [Octopress](http://octopress.org/)，不过 Octopress 已经很久没有更新了。而且 Octopress 是基于 Ruby 的，生成博客文章的速度真的是非常非常慢，每次我使用 `rake preview` 命令时，我的 MacBook 的 CPU 就会狂转。最新的一次我试图在新 MBP 上搭建 Octopress 博客环境失败了，这让我打定主意更换掉它。

之后我调研了一下，最终决定迁移到 Hexo，主要的原因是：

 * Hexo 的原理和 Octopress 一样，都是生成静态文件，这样可以方便地托管到 GitHub 和 GitCafe 上。
 * Hexo 是基于 Node 的，而 Node 的速度非常快。
 * Hexo 对 Octopress 的迁移很友好，图片引用方式完全一样，所以我的博客文章不需要做什么改动。

迁移本来应该在春节前就做完的，不过我在选择 Hexo 的主题上犯难了，Hexo 自带的主题丑极了，而我试了将近 10 个主题，都不满意。最终，我发现了 [SwiftGG](http://swift.gg/) 使用的主题 [Jacman](https://github.com/wuchong/jacman)，于是决定就它了！

整个迁移过程大概如下：

## 安装 Hexo

首先使用如下命令安装 Hexo：

```
npm install -g hexo-cli
```

## 创建一个新的博客

接着我们创建一个新的博客目录：

```
$ hexo init <folder>
$ cd <folder>
$ npm install
```

以上命令完成后，会在目标目录生成以下的目录结构：

```
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```

相比 Octopress，Hexo 的目录结构更加简单：

 * _config.yml 是博客的配置文件。
 * scaffolds 是博客文章模板。
 * source 是博客文章目录。
 * themes 存放主题风格文件。

## 迁移和配置

迁移起来还是很方便，把以前 Octopress 的 `source/_post` 目录下的文章，拷贝到 Hexo 的同名目录下即可。

以前的图片目录，也可以直接拷贝到 `source/images` 目录下。

Google 统计相关的设置可以在 jacman 的 _config.yml 文件中配置。我以前用的评论系统太旧了，这次正好换成了[多说](http://tangqiaoboy.duoshuo.com/)，同样也是在 jacman 的配置文件中设置。

## 修改界面

选择 Hexo 的另一个原因就是它的结构很简单，比较方便我定制。我在迁移完博客文章后，对 jacman 主题进行了一些定制。删掉了底部的作者介绍，然后在右侧边栏加上了我的微信公众号介绍。如果你想看看我是如何定制的，可以直接查看我 Fork 出来的 jacman 项目上的 Commits 即可，项目地址在 [这里](https://github.com/tangqiaoboy/jacman)。

## 发布文章

Hexo 支持直接发布到 GitHub，不过我在配置好 `_config.yml` 文件后，执行 `Hexo deploy` 一直失败！Hexo 一直卡在生成页面过程中，没有任何报错，这使得我也不知道如何修复它。

最终，我自己写了一个小脚本来做发布工作：

```
#! /bin/zsh

hexo clean
hexo generate
cd public

git init
git add .
git commit -m "update at `date` "

git remote add origin git@github.com:tangqiaoboy/tangqiaoboy.github.com.git >> /dev/null 2>&1
echo "### Pushing to Github..."
git push origin master -f
echo "### Done"

git remote add gitcafe git@gitcafe.com:tangqiaoboy/tangqiaoboy.git >> /dev/null 2>&1
echo "### Pushing to GitCafe..."
git push gitcafe master:gitcafe-pages -f
echo "### Done"
```

如果你遇到了和我一样问题的话，把以上脚本稍做修改应该也能很好地工作。

## 总结

Octopress 已经过时，建议有时间的朋友都可以尝试替换掉它。Hexo 算不上完美，但还算是一个不错的替代方案。

