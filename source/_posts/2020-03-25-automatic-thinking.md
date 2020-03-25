---
title: 利用 Automator 自动化你的工作
date: 2020-03-25 11:52:39
categories: shell
tags:
---

{% img /images/automator.png %}

## 开端

最近需要压缩一些 MP3 和 MP4 的大小。首先我在网上搜了一下相关的 App，试了好几个都没有理想的，于是我就想用 ffmpeg 或许更方便一些。

安装好 [ffmpeg](https://www.ffmpeg.org/download.html) 之后，我搜了一下，找到了相关的压缩指令：

[压缩 MP3](https://superuser.com/questions/552817/fastest-way-to-convert-any-audio-file-to-low-bitrate)：
``` bash
ffmpeg -i source.mp3 -map 0:a:0 -b:a 96k dest.mp3
```
[压缩 MP4](https://unix.stackexchange.com/questions/28803/how-can-i-reduce-a-videos-size-with-ffmpeg):

``` bash
ffmpeg -i source.mp4 -vcodec libx265 -crf 26 dest.mp4
```

于是，我很快就完成了相关的压缩。

## 存档和同步

不过，我发现这些指令参数都很长，我很可能下次用的时候还是记不住要查询。于是，我想到了 [Dash](hDashttps://kapeli.com/dash)。

{% img /images/dash-0.jpg %}

Dash 是为程序员提供的一个文档查找工具，同时它还有一个代码片段（Snippets）功能，可以帮助你保存和查询常用的代码片段。

我首先把这些命令放到了我的 Dash 的 Snippets 里，这样我以后只需要输入 `mp3` 或者 `compress` 或者 `ffmpeg` 即可调出这条命令（如下图）。

{% img /images/dash-1.jpg %}

我的 Dash 的存储目录是在 Dropbox 下，于是这条命令**自动同步**到了我所有的电脑中。

## Automator

但是这样的使用还是不够方便，因为我还是需要切换到命令行来输入这些指令，我想以后能不能我在 mp3 或 mp4 文件上点击右键，就自动出现相关的压缩指令呢？于是我想到了 Mac 自带的 [Automator](https://support.apple.com/zh-cn/HT2488)。

Automator 可以帮你将一些自动化的流程转换成右键菜单甚至是 App。

首先在 Application 目录下找到 Automator 并启动它。然后选择新建一个 Quick Action:

{% img /images/quick-action-1.jpg %}

接着，设置 workflow 只在音频文件的右键菜单中出现，也只在 Finder 中生效。

{% img /images/quick-action-2.jpg %}

接下来进行 3 步：
 
 * 拖入一个 「Run Shell Script」模块
 * 将「Pass input」设置成 `as arguments`
 * 在 Shell 中填入以下内容

``` bash
# 输入文件
fileName=$1
# 输出文件名
targetName=${fileName:0:-4}"-compressed.mp3"

/usr/local/bin/ffmpeg -i $fileName -map 0:a:0 -b:a 96k $targetName

```
{% img /images/quick-action-3.jpg %}

编辑完成之后保存。找一个 MP3 文件测试，在 finder 中右键已经可以出现我们想到的菜单了：

{% img /images/quick-action-4.jpg %}

## 备份

Service 是保存在本地的，我们还是要备份一下，直接复制到 Dropbox 同步盘即可： `cp -r ~/Library/Services/* ~/Dropbox/Service-backup/`

## 小结

[Dash](hDashttps://kapeli.com/dash) 和 [Automator](https://support.apple.com/zh-cn/HT2488) 是你自动化命令的好帮手，再借助 Dropbox、iCloud 等云盘将它们同步到你所有的电脑，你就可以随时随地使用这些命令。

祝大家玩得开心~