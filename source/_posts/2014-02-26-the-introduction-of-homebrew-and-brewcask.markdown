---
layout: post
title: "使用brew cask来安装Mac应用"
date: 2014-02-26 21:38
comments: true
categories: mac
---

## 简介

[`brew cask`](https://github.com/phinze/homebrew-cask) 是一个用命令行管理 Mac 下应用的工具，它是基于 [`homebrew`](http://brew.sh/) 的一个增强工具。

`homebrew`可以管理 Mac 下的命令行工具，例如`imagemagick`, `nodejs`，如下所示：

```
brew install imagemagick
brew install node

```

而使用上`brew cask`之后，你还可以用它来管理 Mac 下的 Gui 程序，例如`qq`, `chrome`, `evernote`等，如下所示：

```
brew cask install qq
brew cask install google-chrome
brew cask install evernote

```

<!-- more -->

##安装

###安装 homebrew

用以下一行命令即可安装 homebrew
```
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

之后执行 `brew doctor` 命令可以看看`homebrew`的环境是否正常。通常第一次安装完 brew 之后，还需要安装苹果的`Command Line Tools`。


###安装 cask

用如下命令来安装 cask:

```
brew tap phinze/cask
brew install brew-cask
```

##LaunchRocket

另外再附带推荐一个工具。

[LaunchRocket](https://github.com/jimbojsb/launchrocket) 是一个管理 brew 安装的 service 的工具，安装之后可以看所有的 service 的运行状态，如下图所示：

{% img /images/LaunchRocketUI.png %}

安装`LaunchRocket`就要用到我刚刚提的`brew cask`，用如下命令即可：

```
brew tap jimbojsb/launchrocket
brew cask install launchrocket
```

之后 LauchRocket 设置页面找到（如下图所示），它的启动项同时也保存在`/opt/homebrew-cask/Caskroom/launchrocket`目录中。

{% img /images/launchRocket.jpg %}

启动 LauchRocket 有点麻烦，需要切换设置页面去手工启动。我自己想到一个办法，方法是把 `/opt/homebrew-cask`增加到 alfred 的 search 目录中，然后就可以用 alfred 来启动了，如下所示：

 1. 设置 alfred

{% img /images/launch-cask-1.jpg %}

 2. 用 alfred 启动 LauchRocket

{% img /images/launch-cask-2.jpg %}

大家玩得开心～