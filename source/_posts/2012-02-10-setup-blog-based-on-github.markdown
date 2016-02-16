---
layout: post
title: "象写程序一样写博客：搭建基于github的博客"
date: 2012-02-10 19:55
comments: true
categories: shell
tags: [Git, blog]
---

## 2016.02.16 更新说明

本博客已经由 octopress 迁移到了 hexo，本文章的内容稍显陈旧。

## 前言


github 真是无所不能。其 [Pages 功能](http://pages.github.com/) 支持上传 html，并且在页面中显示。于是有好事者做了一个基于 github 的博客管理工具：[octopress](http://octopress.org/)，基本原理是用 git 来管理你的文章，然后最终发布到 github 上成为一个独立博客站点。由于 github 支持 CNAME 域名指向，所以如果有独立域名的话，可以基于这些做出一个专业的博客站点出来。

本博客就是完全基于此搭建起来的，在使用了 2 个月之后，我将原系统根据中国人的需求做了一些配置，去掉了 GFW 会挡住的 google font api，以及替换掉了速度超慢的国外的评论系统，也加上了分享到国内的微博的功能。现在把这些都总结出来，希望大家都可以方便地搭建基于 github 的博客来。

<!--more-->

## 安装
首先说说怎么安装相应的工具。其实这些内容在 <http://octopress.org/docs/setup/> 上都有，我只是把它大概翻译了一下。

### 安装 rbenv

```
brew update
brew install rbenv
brew install ruby-build

rbenv install 1.9.3-p0
rbenv local 1.9.3-p0
rbenv rehash
```

你有可能需要安装老版本的 GCC 编译器才能顺利安装 Ruby 1.9.3:

``` bash

brew tap homebrew/dupes 
brew install apple-gcc42

```


### 安装 Octopress

首先从 github 上将源码 clone 下来：
```
git clone git://github.com/imathis/octopress.git octopress
cd octopress    # If you use RVM, You'll be asked if you trust the .rvmrc file (say yes).
ruby --version  # Should report Ruby 1.9.2
```

然后，ruby 的软件源 <https://rubygems.org> 因为使用的是亚马逊的云服务，所以被墙了，需要更新一下 ruby 的源，使用如下代码将官方的 ruby 源替换成国内淘宝的源：

```
gem sources --remove https://rubygems.org/
gem sources -a https://ruby.taobao.org/
gem sources -l
```


然后安装依赖:
```
gem install bundler
rbenv rehash    # If you use rbenv, rehash to be able to run the bundle command
bundle install
```
最后安装 Octopress
```
rake install
```

### 配置

安装好之后可以简单配置一下：

* 主要是修改文件：_config.yml ，这个配置文件都有相应的注释。主要就是改一些博客头，作者名之类的东西。
注意最好把里面的 twitter 相关的信息全部删掉，否则由于 GFW 的原因，将会造成页面 load 很慢。
* 修改定制文件 /source/_includes/custom/head.html 把 google 的自定义字体去掉，原因同上。


## 设置 github 账号

基于 github 的博客当然需要先注册 github 账号，Github 的账号注册地址是：<https://github.com/signup/free> 。申请好 github 账号后，建一个名为 username.github.io 的代码仓库。这里注意 username 必须是和你的账号名一致。

## 写博客方法

然后就可以写博客啦～ 写博客主要是用以下几个命令，[这里](http://octopress.org/docs/blogging/) 有详细介绍：

 * rake new_post['article name'] 生成博文框架，然后修改生成的文件即可
 * rake generate 生成静态文件 
 * rake watch 检测文件变化，实时生成新内容
 * rake preview 在本机 4000 端口生成访问内容
 * rake deploy 发布文件

博文是采用 markdown 语法，另外增加了一些扩充的插件，markdown 的介绍文章网上可以搜到很多，比如 [这个](http://daringfireball.net/projects/markdown/)。


## 高级配置

我主要介绍一下如何配置评论和分享到微博功能。步骤如下：

 * 在 _config.yml 中增加一项： weibo_share: true
 * 修改 source/_includes/post/sharing.html ，增加：
```
      // 下面的大括号是全角的，如果复制，请自行改成半角
     ｛% if site.weibo_share %｝
         ｛% include post/weibo.html %｝
     ｛% endif %｝
```
 * 增加文件：source/_includes/post/weibo.html
 * 访问 <http://www.jiathis.com/> ，获取分享的代码
 * 访问 <http://uyan.cc/> ，获得评论的代码
 * 将上面 2 步的代码都加入到 weibo.html 中即可
 * 修改`sass/base/_typography.scss`，将其中的`article blockquote`的`font-style`由`italic`改为`normal`, 因为中文的引用文字用斜体显示其实并不好看。再将其中的`ul, ol`
的`margin-left: 1.3em;`修改为`margin-bottom: 0em;`。

## 其它

对于国内的用户来说，Github 因为服务器在国外，访问速度上不可避免有些慢。我在 2014 年 5 月尝试将博客同时放到 Github 和 GitCafe 上（GitCafe 提供博客服务，而 Github 作为备份服务器），使得国内访问速度非常理想，感兴趣的朋友可以参考这篇文章：[《将博客从 GitHub 迁移到 GitCafe》](/2014/06/02/use-gitcafe-to-host-blog/)

## Tips

####从 wordpress 迁移到 github
这儿有一篇文章介绍了如何做迁移：
<http://blog.xupeng.me/2011/12/14/migrate-to-octopress/>

#### 图片
如果要在文章中上传图片，直接 copy 到 /source/images 目录下即可。在文章中可以直接引用。也可以选一些大的图床站点，例如 flickr 之类的放在那边。

#### 域名
如果你象我一样有自己的域名，可以将域名指向这个博客，具体步骤是：

* 在域名管理中，建立一个 CNAME 指向，将你的域名指向 yourname.github.io
* 建一个名为 CNAME 的文件在 source 目录下，然后将自己的域名输入进去。
* 将内容 push 到 github 后，第一次生效大概等 1 小时，之后你就可以用自己的域名访问了。

#### 原理
 * Octopress 其实为你建立了 2 个分支，一个是 master 分支，用于存放生成的最终网页。另一个是 source 分支，用于存放最初的原始 markdown 文件。
 * 平时写作和提交都在 source 分支下，当需要发布时，rake deploy 命令会将内容生成到 public 这个目录，然后将这个目录的内容当作 master 分支的内容同步到 github 上面。

#### 参考

这儿还有一些参考的文章：

* <http://www.yangzhiping.com/tech/octopress.html>
* <http://blog.xupeng.me/2011/12/14/migrate-to-octopress/>

