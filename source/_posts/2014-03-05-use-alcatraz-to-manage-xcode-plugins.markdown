---
layout: post
title: "使用Alcatraz来管理Xcode插件"
date: 2014-03-05 22:36
comments: true
categories: iOS
---

{% img /images/Alcatraz-logo.jpg %}

## 简介

Alcatraz 是一个帮你管理 Xcode 插件、模版以及颜色配置的工具。它可以直接集成到 Xcode 的图形界面中，让你感觉就像在使用 Xcode 自带的功能一样。

## 安装和删除

使用如下的命令行来安装 Alcatraz：

``` bash
mkdir -p ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins;
curl -L http://git.io/lOQWeA | tar xvz -C ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins

```

如果你不想使用 Alcatraz 了，可以使用如下命令来删除：

``` bash
rm -rf ~/Library/Application\ Support/Developer/Shared/Xcode/Plug-ins/Alcatraz.xcplugin
rm -rf ~/Library/Application\ Support/Alcatraz
```

<!-- more -->

## 使用

安装成功后重启 Xcode，就可以在 Xcode 的顶部菜单中找到 Alcatraz，如下所示：

{% img /images/alcatraz-menu.jpg %}

点击 “Package Manager”，即可启动插件列表页面，如下所示：

{% img /images/alcatraz-home.jpg %}


之后你可以在右上角搜索插件，对于想安装的插件，点击其左边的图标，即可下载安装，如下所示，我正在安装`KImageNamed`插件：

{% img /images/alcatraz-install.jpg %}


安装完成后，再次点击插件左边的图标，可以将该插件删除。

## 插件路径

Xcode 所有的插件都安装在目录`~/Library/Application Support/Developer/Shared/Xcode/Plug-ins/`下，你也可以手工切换到这个目录来删除插件。


## 关于 Xcode 的插件机制

Alcatraz 当前只支持 OSX 10.9 and Xcode 5。不要抱怨了，这其实主要是因为苹果并没有开放插件机制，每次升级 Alcatraz 都都要重新适配。如果你看 Alcatraz 的 Commit Log，你就会发现，Alcatraz 花了几个月时间，才适配到 Xcode 5，这对于插件开发者来说，是比较难受的。

所以作为一款开源并且免费的插件，只支持最新版的 Xcode 可以让开源作者节省大量精力。我也希望苹果能早日开放 Xcode 的插件机制标准，方便广大的插件开发者构建强大的第三方增强工具。


## 推荐的插件

我个人比较喜欢 XCode 的 vim 插件 XVim，微博里大家推荐过的还有 KImageNamed 插件，Alcatraz 里面应该好用的插件很多，我还没有时间试用。

这儿有一些朋友整理的插件列表：[《那些不能错过的 Xcode 插件》](http://www.cocoachina.com/applenews/devnews/2013/0918/7022.html)

如要你发现好用的插件，欢迎在留言处回复告诉我，我可以推荐给大家。谢谢～

## 插件开发

如果你觉得自己很牛逼，想尝试开发插件，这儿有一些教程：

 * [《Xcode5 Plugins 开发简介》](http://studentdeng.github.io/blog/2014/02/21/xcode-plugin-fun/)
 * [《Xcode 4 插件制作入门》](http://onevcat.com/2013/02/xcode-plugin/)
 * [《写个自己的 Xcode4 插件》](http://joeyio.com/ios/2013/07/25/write_xcode4_plugin_of_your_own/)

