---
layout: post
title: "Mac重装记录"
date: 2014-04-12 17:00:20 +0800
comments: true
categories: mac
---

##前言

上次将我的[iMac硬盘换成SSD](http://blog.devtang.com/blog/2014/01/26/add-ssd-to-old-imac/)后，我是通过迁移助理将我的Mac Book Air的环境同步过去的，不知道为什么，半个月前出现了重启后电脑一直处于加转中的状态。尝试过了网上提供的以下方法都没有效果：

 1. 启动时按住Shift键进入安全模式（没能进入）
 1. 同时按下 Command、Option、P 与 R 键不放（成功执行，但还是无法进入系统）
 1. 按住 Command 键及 S 键，进入单用户模式（成功进入，但是把“/资源库/StartupItems”与“/系统/资源库/StartupItems”都清除，以及清除了`com.apple.loginwindow.plist` 和`com.apple.windowserver.plist`后，但还是无法通过正常启动进入系统）
 1. 在单用户模式中修复磁盘，没有发现磁盘问题


于是我做了一次覆盖安装，之后可以使用了，但昨天电脑又无法进入系统了。于是我打算格盘后做一次完全的重装，在此记录下自己的重装过程。


## 备份数据

由于我能够通过启动时按Command 键及 S 键，进入单用户模式，所以我首先把自己未提交的工程代码通过U盘备份出来了，具体步骤如下：


 1. 按住 Command 键及 S 键不放，以“单一使用者模式”开机。
 1. 加载磁盘：`mount -uw /`
 1. 新建一个U盘的加载目的文件夹： `mkdir /usb`
 1. 插入U盘，然后用如下命令加载U盘 `mount_msdos /dev/disk1s1 /usb` （如果你的U盘不是msdos格式，可以尝试在输入mount_后，按两次tab查看可用的其它格式）
 1. 备份资料：`cp -r  ~/work/iphone /usb`
 1. 弹出U盘：`umount /dev/disk1s1`
 1. 将U盘资料放到别的电脑上，然后准备用来下一步制作安装盘

## 制作安装盘
 苹果的操作系统其实可以直接通过网络恢复，考虑到恢复时间实在太长，所以最好制作成安装盘，这样安装起来非常快。

 1. 准备好一个8G以上的空白U盘，准备好另外一台Mac电脑用来制作安装盘。
 1. 新的操作系统`Mavericks.app`可以在AppStore上直接下载。在另一台电脑上把文件下载好，下载后文件`Mavericks.app`应该在你的`/Applications`目录下。
 1. 插入U盘，执行：`sudo /Applications/Install\ OS\ X\ Mavericks.app/Contents/Resources/createinstallmedia --volume /Volumes/Untitled --applicationpath /Applications/Install\ OS\ X\ Mavericks.app --nointeraction`
 1. 以上命令会将U盘先格式化，然后制作成安装盘，整个过程大概需要40分钟左右。


## 安装系统 
 
 1. 插入上一步制作好的U盘
 1. 启动时按住 option 键，然后选择通过U盘启动，之后先进入磁盘工具里面把硬盘格式化了（你也可以选择不格式化，这样就是覆盖安装）
 1. 安装系统。整个安装过程大概要30分钟的样子。


## 安装软件


 安装好系统后，首先进入AppStore升级系统，把需要的更新补丁都装了。然后通过AppStore的”Purchases”页面，重新安装以前购买过的应用，我主要装的是 qq、evernote、Alfred、MplayerX、Xcode、Dash、Keynote、有道词典。另外通过网页另外下载了QQ的五笔输入法。

接下来的基本上是命令行的安装，Mac下管理命令行工具首先得装homebrew了：

``` bash
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```


安装完之后执行一下`brew doctor`进行一下自检，看有没有什么异常。没问题就开始安装axel, imagemagick, autojump等命令行工具：

``` bash
brew install wget
brew install axel
brew install imagemagick
brew install autojump
``` 


有些程序(例如老版本的ruby需要使用gcc来编译)，通过以下命令安装老版的gcc：


``` bash

brew tap homebrew/dupes 
brew install apple-gcc42

```


## 使用brew cask来安装应用


之前专门[写文章介绍](http://blog.devtang.com/blog/2014/02/26/the-introduction-of-homebrew-and-brewcask/)过`brew cask`, 这次打算试试常用软件都用它来装，首先安装brew cask:


``` bash

brew tap phinze/cask
brew install brew-cask

```

然后设置alfred，把 `/opt/homebrew-cask`增加到 alfred 的search目录中，然后就可以用alfred来启动安装后的应用了。

接下来用brew cask安装：


``` bash

brew cask install iterm2
brew cask install dropbox
brew cask install google-chrome
brew cask install sublime-text
brew cask install mou
brew cask install xtrafinder
brew cask install charles
brew cask install reveal
brew cask install xscope
brew cask install sparrow

```

## 使用zsh


然后是使用zsh，下载安装ohmyzsh:

``` bash
curl -L http://install.ohmyz.sh | sh
```



安装完成之后，`vim ~/.zshrc` ，除了git插件外，另外增加 osx 和 autojump 插件。然后把以下这行注释启用：`export LANG=en_US.UTF-8` ，否则命令行中的中文可能会乱码。

## 同步数据

挂上VPN之后，打开chrome，然后同步自己的所有信息，chrome的同步挺赞的，包括书签，插件，浏览历史记录以及保存的密码都同步过来了。

打开evernote和dropbox，同步数据。由于我的个人文档都存在它们里面，所以同步过来还是挺方便的。

打开QQ，将漫游的聊天记录同步过来。打开dash，恢复购买，然后把snippet从dropbox同步过来。

将自己的ssh key从原来的机器上复制过来。


## 设置Ruby

由于我的博客使用Octopress搭建，所以需要安装Ruby：


```
brew update
brew install rbenv
brew install ruby-build

rbenv install 1.9.3-p0
rbenv local 1.9.3-p0
rbenv rehash

gem install bundler
rbenv rehash
bundle install

```

## 结束语

一切完成之后，我写下了本文，希望能帮助大家快速地重装系统。简单来说：

 1. 通过evernote、dropbox和chrome将个人数据保存在云端后，重装后能快速恢复环境。
 1. 通过homebrew和基于homebrew的brew cask，可以方便地帮助你快速安装不在AppStore上销售的软件。

其实正常情况下，Mac使用迁移助理或Time Machine恢复非常方便，如果不是万不得已，大家也不用像我这样重装系统。

